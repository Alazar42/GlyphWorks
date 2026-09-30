import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  GlyphData, 
  FontMetrics, 
  EditorTool, 
  VectorPoint, 
  PathContour 
} from '@/src/types/font';
import { generateGlyphSvgPath, generateContourSvgPath } from '@/src/lib/fonts/fontConverter';
import { useTheme } from '@/src/lib/theme/ThemeContext';

interface GlyphCanvasProps {
  glyph: GlyphData;
  metrics: FontMetrics;
  activeTool: EditorTool;
  brushSize: number;
  zoom: number;
  panX: number;
  panY: number;
  onUpdatePan: (panX: number, panY: number) => void;
  onUpdateZoomAndPan: (zoom: number, panX: number, panY: number) => void;
  showGrid: boolean;
  snapToGrid: boolean;
  selectedPointIds: string[];
  onSelectPoints: (pointIds: string[]) => void;
  onUpdateGlyphContours: (contours: PathContour[], commitHistory?: boolean) => void;
  onUpdateMetricsBearing: (bearing: { lsb?: number; advanceWidth?: number }) => void;
}

export const GlyphCanvas: React.FC<GlyphCanvasProps> = ({
  glyph,
  metrics,
  activeTool,
  brushSize,
  zoom,
  panX,
  panY,
  onUpdatePan,
  onUpdateZoomAndPan,
  showGrid,
  snapToGrid,
  selectedPointIds,
  onSelectPoints,
  onUpdateGlyphContours,
  onUpdateMetricsBearing,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas panning state
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Multi-point dragging state
  const [isDraggingPoints, setIsDraggingPoints] = useState(false);
  const [pointsDragStartCoord, setPointsDragStartCoord] = useState<{ x: number; y: number } | null>(null);
  const [initialPointsState, setInitialPointsState] = useState<PathContour[] | null>(null);

  // Guide dragging state
  const [draggingGuide, setDraggingGuide] = useState<'lsb' | 'rsb' | null>(null);

  // Marquee selection box state
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<{ screenX: number; screenY: number }>({ screenX: 0, screenY: 0 });
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ screenX: number; screenY: number }>({ screenX: 0, screenY: 0 });

  // Free Pen / Brush Tool state
  const [isDrawingBrush, setIsDrawingBrush] = useState(false);
  const [brushStrokePoints, setBrushStrokePoints] = useState<Array<{ x: number; y: number }>>([]);

  // Pen tool active contour
  const [activePenContourId, setActivePenContourId] = useState<string | null>(null);

  // Edge hover / Arc tool state
  const [hoveredEdge, setHoveredEdge] = useState<{ contourId: string; startIndex: number } | null>(null);

  const { actualTheme } = useTheme();
  const isLight = actualTheme === 'light';
  const [isDraggingArc, setIsDraggingArc] = useState(false);
  const [arcDragEdge, setArcDragEdge] = useState<{ contourId: string; startIndex: number } | null>(null);

  // Current mouse coordinates in font units
  const [cursorFontCoord, setCursorFontCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Spacebar pan listener (Illustrator standard behavior)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Space' && !e.repeat && !isSpacePressed) {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsDraggingCanvas(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  // Screen to Font Coordinate mapping
  const screenToFont = useCallback(
    (screenX: number, screenY: number, bypassSnap: boolean = false): { x: number; y: number } => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const originX = rect.width / 2 + panX;
      const originY = rect.height / 2 + panY + (metrics.unitsPerEm * 0.25 * zoom);

      let x = (screenX - rect.left - originX) / zoom;
      let y = (originY - (screenY - rect.top)) / zoom;

      if (snapToGrid && !bypassSnap) {
        const snapStep = 10;
        x = Math.round(x / snapStep) * snapStep;
        y = Math.round(y / snapStep) * snapStep;
      } else {
        x = Math.round(x);
        y = Math.round(y);
      }

      return { x, y };
    },
    [panX, panY, zoom, metrics.unitsPerEm, snapToGrid]
  );

  // Font to Screen Coordinate mapping
  const fontToScreen = useCallback(
    (fontX: number, fontY: number): { x: number; y: number } => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const originX = rect.width / 2 + panX;
      const originY = rect.height / 2 + panY + (metrics.unitsPerEm * 0.25 * zoom);

      const screenX = originX + fontX * zoom;
      const screenY = originY - fontY * zoom;

      return { x: screenX, y: screenY };
    },
    [panX, panY, zoom, metrics.unitsPerEm]
  );

  // Ramer-Douglas-Peucker line simplification for lightweight vector outlines
  const simplifyStroke = (points: Array<{ x: number; y: number }>, epsilon: number): Array<{ x: number; y: number }> => {
    if (points.length <= 2) return points;

    let maxDist = 0;
    let index = 0;
    const p1 = points[0];
    const p2 = points[points.length - 1];
    const lineDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i];
      let d = 0;
      if (lineDist === 0) {
        d = Math.hypot(p.x - p1.x, p.y - p1.y);
      } else {
        d = Math.abs((p2.y - p1.y) * p.x - (p2.x - p1.x) * p.y + p2.x * p1.y - p2.y * p1.x) / lineDist;
      }
      if (d > maxDist) {
        maxDist = d;
        index = i;
      }
    }

    if (maxDist > epsilon) {
      const left = simplifyStroke(points.slice(0, index + 1), epsilon);
      const right = simplifyStroke(points.slice(index), epsilon);
      return [...left.slice(0, -1), ...right];
    } else {
      return [p1, p2];
    }
  };

  // Convert freehand stroke points into a closed vector contour with minimal node count
  const convertBrushStrokeToContour = (points: Array<{ x: number; y: number }>, width: number): PathContour | null => {
    if (points.length < 2) return null;

    // Step 1: Filter out redundant micro-movements
    const coarse: Array<{ x: number; y: number }> = [points[0]];
    const minDist = 14;
    for (let i = 1; i < points.length; i++) {
      const last = coarse[coarse.length - 1];
      if (Math.hypot(points[i].x - last.x, points[i].y - last.y) >= minDist || i === points.length - 1) {
        coarse.push(points[i]);
      }
    }

    // Step 2: RDP simplification with adaptive tolerance
    const epsilon = Math.max(10, Math.min(24, width * 0.25));
    const simplified = simplifyStroke(coarse, epsilon);
    if (simplified.length < 2) return null;

    const halfW = Math.max(4, width / 2);
    const leftPoints: VectorPoint[] = [];
    const rightPoints: VectorPoint[] = [];

    for (let i = 0; i < simplified.length; i++) {
      const p = simplified[i];
      let dx = 0;
      let dy = 0;

      if (i === 0) {
        dx = simplified[1].x - p.x;
        dy = simplified[1].y - p.y;
      } else if (i === simplified.length - 1) {
        dx = p.x - simplified[i - 1].x;
        dy = p.y - simplified[i - 1].y;
      } else {
        dx = simplified[i + 1].x - simplified[i - 1].x;
        dy = simplified[i + 1].y - simplified[i - 1].y;
      }

      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      leftPoints.push({
        id: `pt_br_l_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`,
        x: Math.round(p.x + nx * halfW),
        y: Math.round(p.y + ny * halfW),
        type: 'onCurve',
      });

      rightPoints.push({
        id: `pt_br_r_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`,
        x: Math.round(p.x - nx * halfW),
        y: Math.round(p.y - ny * halfW),
        type: 'onCurve',
      });
    }

    // Combine left and reversed right points into a tight, lightweight closed contour
    const contourPoints: VectorPoint[] = [...leftPoints, ...rightPoints.reverse()];

    return {
      id: `cnt_brush_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      closed: true,
      points: contourPoints,
    };
  };

  // Keep latest pan, zoom and metrics references for the non-passive wheel listener (avoids stale closures)
  const zoomPanStateRef = useRef({ panX, panY, zoom, metrics, onUpdatePan, onUpdateZoomAndPan });

  useEffect(() => {
    zoomPanStateRef.current = { panX, panY, zoom, metrics, onUpdatePan, onUpdateZoomAndPan };
  });

  // Canvas Zoom & Pan — native non-passive listener so e.preventDefault() succeeds
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number | null = null;

    const handleCanvasWheel = (e: WheelEvent) => {
      e.preventDefault();

      const { panX: curPanX, panY: curPanY, zoom: curZoom, metrics: curMetrics, onUpdatePan: curOnUpdatePan, onUpdateZoomAndPan: curOnUpdateZoomAndPan } = zoomPanStateRef.current;

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Trackpad 2-finger pan (no modifier key, deltaX dominant or small deltaY)
      if (!e.ctrlKey && !e.metaKey && (Math.abs(e.deltaX) > Math.abs(e.deltaY) || Math.abs(e.deltaY) < 30)) {
        curOnUpdatePan(curPanX - e.deltaX * 0.8, curPanY - e.deltaY * 0.8);
        return;
      }

      // Focal zoom anchored to cursor — compute font pos inline from current ref values
      const originX = rect.width / 2 + curPanX;
      const originY = rect.height / 2 + curPanY + curMetrics.unitsPerEm * 0.25 * curZoom;
      const fontX = (e.clientX - rect.left - originX) / curZoom;
      const fontY = (originY - (e.clientY - rect.top)) / curZoom;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newZoom = Math.min(8.0, Math.max(0.08, curZoom * zoomFactor));

      const newPanX = mouseX - rect.width / 2 - fontX * newZoom;
      const newPanY = mouseY - rect.height / 2 - (curMetrics.unitsPerEm * 0.25 - fontY) * newZoom;

      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        curOnUpdateZoomAndPan(newZoom, Math.round(newPanX), Math.round(newPanY));
        rafId = null;
      });
    };

    el.addEventListener('wheel', handleCanvasWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleCanvasWheel);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Canvas Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click, Spacebar held, or Pan tool => start canvas pan
    if (e.button === 1 || isSpacePressed || activeTool === 'pan') {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
      return;
    }

    if (e.button !== 0) return;

    const fontCoord = screenToFont(e.clientX, e.clientY);

    // Free Pen / Brush Tool
    if (activeTool === 'brush') {
      setIsDrawingBrush(true);
      setBrushStrokePoints([{ x: fontCoord.x, y: fontCoord.y }]);
      return;
    }

    // Arc / Curvature Tool
    if (activeTool === 'arc' && hoveredEdge) {
      setIsDraggingArc(true);
      setArcDragEdge(hoveredEdge);
      return;
    }

    // Pen Tool: add point to contour
    if (activeTool === 'pen') {
      const contours = [...(glyph.contours || [])];
      let contourIndex = -1;

      if (activePenContourId) {
        contourIndex = contours.findIndex((c) => c.id === activePenContourId);
      }

      if (contourIndex >= 0 && !contours[contourIndex].closed) {
        const contour = contours[contourIndex];
        // Check if user clicked near first point to close contour
        if (contour.points.length > 2) {
          const firstPt = contour.points[0];
          const dist = Math.hypot(firstPt.x - fontCoord.x, firstPt.y - fontCoord.y);
          if (dist < 20 / zoom) {
            contour.closed = true;
            onUpdateGlyphContours(contours, true);
            setActivePenContourId(null);
            return;
          }
        }

        const newPoint: VectorPoint = {
          id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          x: fontCoord.x,
          y: fontCoord.y,
          type: 'onCurve',
        };
        contour.points.push(newPoint);
        onUpdateGlyphContours(contours, true);
        onSelectPoints([newPoint.id]);
      } else {
        // Start a brand new contour
        const newContourId = `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newPoint: VectorPoint = {
          id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          x: fontCoord.x,
          y: fontCoord.y,
          type: 'onCurve',
        };
        contours.push({
          id: newContourId,
          closed: false,
          points: [newPoint],
        });
        onUpdateGlyphContours(contours, true);
        setActivePenContourId(newContourId);
        onSelectPoints([newPoint.id]);
      }
      return;
    }

    // Rectangle Primitive
    if (activeTool === 'rectangle') {
      const w = 180;
      const h = 240;
      const x = fontCoord.x;
      const y = fontCoord.y;
      const newContour: PathContour = {
        id: `cnt_rect_${Date.now()}`,
        closed: true,
        points: [
          { id: `pt_${Date.now()}_1`, x, y, type: 'onCurve' },
          { id: `pt_${Date.now()}_2`, x, y: y + h, type: 'onCurve' },
          { id: `pt_${Date.now()}_3`, x: x + w, y: y + h, type: 'onCurve' },
          { id: `pt_${Date.now()}_4`, x: x + w, y, type: 'onCurve' },
        ],
      };
      onUpdateGlyphContours([...(glyph.contours || []), newContour], true);
      onSelectPoints([newContour.points[0].id]);
      return;
    }

    // Ellipse Primitive
    if (activeTool === 'ellipse') {
      const rx = 120;
      const ry = 140;
      const cx = fontCoord.x;
      const cy = fontCoord.y;
      const k = 0.5522847498;
      const ox = rx * k;
      const oy = ry * k;

      const newContour: PathContour = {
        id: `cnt_ell_${Date.now()}`,
        closed: true,
        points: [
          { id: `pt_${Date.now()}_0`, x: cx, y: cy + ry, type: 'onCurve' },
          { id: `pt_${Date.now()}_1`, x: cx + ox, y: cy + ry, type: 'control1' },
          { id: `pt_${Date.now()}_2`, x: cx + rx, y: cy + oy, type: 'control2' },
          { id: `pt_${Date.now()}_3`, x: cx + rx, y: cy, type: 'onCurve' },
          { id: `pt_${Date.now()}_4`, x: cx + rx, y: cy - oy, type: 'control1' },
          { id: `pt_${Date.now()}_5`, x: cx + ox, y: cy - ry, type: 'control2' },
          { id: `pt_${Date.now()}_6`, x: cx, y: cy - ry, type: 'onCurve' },
          { id: `pt_${Date.now()}_7`, x: cx - ox, y: cy - ry, type: 'control1' },
          { id: `pt_${Date.now()}_8`, x: cx - rx, y: cy - oy, type: 'control2' },
          { id: `pt_${Date.now()}_9`, x: cx - rx, y: cy, type: 'onCurve' },
          { id: `pt_${Date.now()}_10`, x: cx - rx, y: cy + oy, type: 'control1' },
          { id: `pt_${Date.now()}_11`, x: cx - ox, y: cy + ry, type: 'control2' },
        ],
      };
      onUpdateGlyphContours([...(glyph.contours || []), newContour], true);
      onSelectPoints([newContour.points[0].id]);
      return;
    }

    // Line Primitive
    if (activeTool === 'line') {
      const len = 200;
      const newContour: PathContour = {
        id: `cnt_line_${Date.now()}`,
        closed: false,
        points: [
          { id: `pt_${Date.now()}_1`, x: fontCoord.x, y: fontCoord.y, type: 'onCurve' },
          { id: `pt_${Date.now()}_2`, x: fontCoord.x + len, y: fontCoord.y, type: 'onCurve' },
        ],
      };
      onUpdateGlyphContours([...(glyph.contours || []), newContour], true);
      onSelectPoints([newContour.points[1].id]);
      return;
    }

    // Select or Node tool on empty canvas => start Marquee Box selection
    if (activeTool === 'select' || activeTool === 'node') {
      if (!e.shiftKey) {
        onSelectPoints([]);
      }
      setIsMarqueeSelecting(true);
      setMarqueeStart({ screenX: e.clientX, screenY: e.clientY });
      setMarqueeCurrent({ screenX: e.clientX, screenY: e.clientY });
    }
  };

  // Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const fontCoord = screenToFont(e.clientX, e.clientY);
    setCursorFontCoord(fontCoord);

    // Canvas panning
    if (isDraggingCanvas) {
      onUpdatePan(e.clientX - dragStart.x, e.clientY - dragStart.y);
      return;
    }

    // Free Pen / Brush drawing
    if (isDrawingBrush) {
      setBrushStrokePoints((prev) => {
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          if (Math.hypot(fontCoord.x - last.x, fontCoord.y - last.y) < 10) {
            return prev;
          }
        }
        return [...prev, { x: fontCoord.x, y: fontCoord.y }];
      });
      return;
    }

    // Arcing an edge dynamically
    if (isDraggingArc && arcDragEdge) {
      const contour = glyph.contours.find((c) => c.id === arcDragEdge.contourId);
      if (contour && contour.points.length > arcDragEdge.startIndex) {
        const p1 = contour.points[arcDragEdge.startIndex];
        const nextIdx = (arcDragEdge.startIndex + 1) % contour.points.length;
        const p2 = contour.points[nextIdx];

        // Midpoint and perpendicular displacement
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const c1X = Math.round((p1.x + fontCoord.x) / 2);
        const c1Y = Math.round((p1.y + fontCoord.y) / 2);
        const c2X = Math.round((p2.x + fontCoord.x) / 2);
        const c2Y = Math.round((p2.y + fontCoord.y) / 2);

        // Check if next point is already a control point or insert control handles
        const newContours = glyph.contours.map((c) => {
          if (c.id !== arcDragEdge.contourId) return c;
          const pts = [...c.points];
          // Replace or insert cubic control points between p1 and p2
          const insertIdx = arcDragEdge.startIndex + 1;
          const existingIsControl = pts[insertIdx] && pts[insertIdx].type === 'control1';

          if (existingIsControl) {
            pts[insertIdx] = { ...pts[insertIdx], x: c1X, y: c1Y };
            if (pts[insertIdx + 1] && pts[insertIdx + 1].type === 'control2') {
              pts[insertIdx + 1] = { ...pts[insertIdx + 1], x: c2X, y: c2Y };
            }
          } else {
            const ctrl1: VectorPoint = {
              id: `pt_arc1_${Date.now()}`,
              x: c1X,
              y: c1Y,
              type: 'control1',
            };
            const ctrl2: VectorPoint = {
              id: `pt_arc2_${Date.now()}`,
              x: c2X,
              y: c2Y,
              type: 'control2',
            };
            pts.splice(insertIdx, 0, ctrl1, ctrl2);
          }
          return { ...c, points: pts };
        });

        // Fast interactive update without polluting history on every frame
        onUpdateGlyphContours(newContours, false);
      }
      return;
    }

    // Moving selected nodes & edges together (Illustrator-grade)
    if (isDraggingPoints && pointsDragStartCoord && initialPointsState) {
      const deltaX = fontCoord.x - pointsDragStartCoord.x;
      const deltaY = fontCoord.y - pointsDragStartCoord.y;

      const selectedSet = new Set(selectedPointIds);

      const movedContours = initialPointsState.map((contour) => ({
        ...contour,
        points: contour.points.map((pt) => {
          if (selectedSet.has(pt.id)) {
            return {
              ...pt,
              x: pt.x + deltaX,
              y: pt.y + deltaY,
            };
          }
          return pt;
        }),
      }));

      // High-performance live drag without history spam
      onUpdateGlyphContours(movedContours, false);
      return;
    }

    // Marquee Selection Box
    if (isMarqueeSelecting) {
      setMarqueeCurrent({ screenX: e.clientX, screenY: e.clientY });

      // Calculate bounding box in screen coords
      const minX = Math.min(marqueeStart.screenX, e.clientX);
      const maxX = Math.max(marqueeStart.screenX, e.clientX);
      const minY = Math.min(marqueeStart.screenY, e.clientY);
      const maxY = Math.max(marqueeStart.screenY, e.clientY);

      const enclosedIds: string[] = [];
      glyph.contours.forEach((c) => {
        c.points.forEach((pt) => {
          const ptScreen = fontToScreen(pt.x, pt.y);
          if (
            ptScreen.x >= minX &&
            ptScreen.x <= maxX &&
            ptScreen.y >= minY &&
            ptScreen.y <= maxY
          ) {
            enclosedIds.push(pt.id);
          }
        });
      });

      onSelectPoints(enclosedIds);
      return;
    }

    // Side Bearing guides dragging
    if (draggingGuide === 'lsb') {
      onUpdateMetricsBearing({ lsb: Math.max(0, fontCoord.x) });
      return;
    }
    if (draggingGuide === 'rsb') {
      onUpdateMetricsBearing({ advanceWidth: Math.max(100, fontCoord.x) });
      return;
    }
  };

  // Canvas Mouse Up
  const handleMouseUp = () => {
    setIsDraggingCanvas(false);

    // Commit Brush drawing
    if (isDrawingBrush) {
      setIsDrawingBrush(false);
      if (brushStrokePoints.length > 1) {
        const newContour = convertBrushStrokeToContour(brushStrokePoints, brushSize);
        if (newContour) {
          onUpdateGlyphContours([...(glyph.contours || []), newContour], true);
          onSelectPoints(newContour.points.map((p) => p.id));
        }
      }
      setBrushStrokePoints([]);
      return;
    }

    // Commit Arc drag to history
    if (isDraggingArc) {
      setIsDraggingArc(false);
      setArcDragEdge(null);
      onUpdateGlyphContours(glyph.contours, true);
      return;
    }

    // Commit multi-node move to history
    if (isDraggingPoints) {
      setIsDraggingPoints(false);
      setPointsDragStartCoord(null);
      setInitialPointsState(null);
      onUpdateGlyphContours(glyph.contours, true);
    }

    setIsMarqueeSelecting(false);
    setDraggingGuide(null);
  };

  // Node Point Mouse Down (supports Shift+click multi-selection & dragging together)
  const handlePointMouseDown = (e: React.MouseEvent, pointId: string) => {
    e.stopPropagation();

    if (activeTool === 'select' || activeTool === 'node') {
      let updatedSelectedIds: string[];

      if (e.shiftKey) {
        // Toggle selection
        if (selectedPointIds.includes(pointId)) {
          updatedSelectedIds = selectedPointIds.filter((id) => id !== pointId);
        } else {
          updatedSelectedIds = [...selectedPointIds, pointId];
        }
      } else {
        // If clicking an unselected point, select only it
        if (!selectedPointIds.includes(pointId)) {
          updatedSelectedIds = [pointId];
        } else {
          // If already selected, preserve selection to drag together
          updatedSelectedIds = selectedPointIds;
        }
      }

      onSelectPoints(updatedSelectedIds);

      // Begin moving all selected points together
      const fontCoord = screenToFont(e.clientX, e.clientY);
      setIsDraggingPoints(true);
      setPointsDragStartCoord(fontCoord);
      setInitialPointsState(JSON.parse(JSON.stringify(glyph.contours)));
    }
  };

  // Edge Mouse Down (Adobe Illustrator feature: select edge and move its nodes together)
  const handleEdgeMouseDown = (e: React.MouseEvent, contourId: string, startIndex: number) => {
    e.stopPropagation();

    const contour = glyph.contours.find((c) => c.id === contourId);
    if (!contour) return;

    const p1 = contour.points[startIndex];
    const nextIdx = (startIndex + 1) % contour.points.length;
    const p2 = contour.points[nextIdx];

    if (activeTool === 'arc') {
      setIsDraggingArc(true);
      setArcDragEdge({ contourId, startIndex });
      return;
    }

    if (activeTool === 'select' || activeTool === 'node') {
      const edgePointIds = [p1.id, p2.id];
      const updatedSelectedIds = e.shiftKey
        ? Array.from(new Set([...selectedPointIds, ...edgePointIds]))
        : edgePointIds;

      onSelectPoints(updatedSelectedIds);

      const fontCoord = screenToFont(e.clientX, e.clientY);
      setIsDraggingPoints(true);
      setPointsDragStartCoord(fontCoord);
      setInitialPointsState(JSON.parse(JSON.stringify(glyph.contours)));
    }
  };

  // Generate SVG Path for visual rendering
  const generateSvgPath = () => generateGlyphSvgPath(glyph);

  // Guide screen positions
  const baseScreen = fontToScreen(0, metrics.baseline);
  const xHeightScreen = fontToScreen(0, metrics.xHeight);
  const capHeightScreen = fontToScreen(0, metrics.capHeight);
  const ascenderScreen = fontToScreen(0, metrics.ascender);
  const descenderScreen = fontToScreen(0, metrics.descender);
  const lsbScreen = fontToScreen(glyph.leftSideBearing || 0, 0);
  const rsbScreen = fontToScreen(glyph.advanceWidth || 600, 0);

  // Marquee box dimensions
  const marqueeLeft = Math.min(marqueeStart.screenX, marqueeCurrent.screenX) - (containerRef.current?.getBoundingClientRect().left || 0);
  const marqueeTop = Math.min(marqueeStart.screenY, marqueeCurrent.screenY) - (containerRef.current?.getBoundingClientRect().top || 0);
  const marqueeWidth = Math.abs(marqueeCurrent.screenX - marqueeStart.screenX);
  const marqueeHeight = Math.abs(marqueeCurrent.screenY - marqueeStart.screenY);

  const selectedSet = new Set(selectedPointIds);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative flex-1 h-full bg-neutral-950 overflow-hidden select-none ${
        isSpacePressed || activeTool === 'pan' || isDraggingCanvas
          ? 'cursor-grab active:cursor-grabbing'
          : activeTool === 'brush'
          ? 'cursor-crosshair'
          : activeTool === 'pen'
          ? 'cursor-crosshair'
          : activeTool === 'arc'
          ? 'cursor-pointer'
          : 'cursor-default'
      }`}
    >
      {/* Background Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage: `linear-gradient(to right, ${isLight ? '#000000' : '#ffffff'} 1px, transparent 1px), linear-gradient(to bottom, ${isLight ? '#000000' : '#ffffff'} 1px, transparent 1px)`,
            backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
            backgroundPosition: `${panX + (containerRef.current?.clientWidth || 0) / 2}px ${
              panY + (containerRef.current?.clientHeight || 0) / 2
            }px`,
          }}
        />
      )}

      {/* Guide Lines Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ascender line */}
        <div
          className="absolute inset-x-0 border-b border-dashed border-neutral-400/60 dark:border-neutral-700/60"
          style={{ top: `${ascenderScreen.y}px` }}
        >
          <span className="absolute right-3 -top-3.5 text-[9px] font-mono text-neutral-600 dark:text-neutral-500">
            Ascender ({metrics.ascender})
          </span>
        </div>

        {/* Cap Height line */}
        <div
          className="absolute inset-x-0 border-b border-dashed border-neutral-500/70 dark:border-neutral-600/70"
          style={{ top: `${capHeightScreen.y}px` }}
        >
          <span className="absolute right-3 -top-3.5 text-[9px] font-mono text-neutral-700 dark:text-neutral-400">
            Cap Height ({metrics.capHeight})
          </span>
        </div>

        {/* x-Height line */}
        <div
          className="absolute inset-x-0 border-b border-dashed border-neutral-400/60 dark:border-neutral-700/60"
          style={{ top: `${xHeightScreen.y}px` }}
        >
          <span className="absolute right-3 -top-3.5 text-[9px] font-mono text-neutral-600 dark:text-neutral-500">
            x-Height ({metrics.xHeight})
          </span>
        </div>

        {/* Baseline (Solid) */}
        <div
          className="absolute inset-x-0 border-b border-neutral-500 dark:border-neutral-400/80"
          style={{ top: `${baseScreen.y}px` }}
        >
          <span className="absolute right-3 -top-3.5 text-[9px] font-mono text-neutral-800 dark:text-neutral-300 font-semibold">
            Baseline (0)
          </span>
        </div>

        {/* Descender line */}
        <div
          className="absolute inset-x-0 border-b border-dashed border-neutral-400/60 dark:border-neutral-700/60"
          style={{ top: `${descenderScreen.y}px` }}
        >
          <span className="absolute right-3 -top-3.5 text-[9px] font-mono text-neutral-600 dark:text-neutral-500">
            Descender ({metrics.descender})
          </span>
        </div>

        {/* Origin Axis (x=0) */}
        <div
          className="absolute inset-y-0 border-l border-neutral-300 dark:border-neutral-800/80"
          style={{ left: `${fontToScreen(0, 0).x}px` }}
        />

        {/* Left Side Bearing Guide (Draggable) */}
        <div
          className="absolute inset-y-0 border-l border-neutral-400/70 dark:border-neutral-600/60 pointer-events-auto cursor-ew-resize hover:border-sky-500 dark:hover:border-neutral-300 transition-colors"
          style={{ left: `${lsbScreen.x}px` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setDraggingGuide('lsb');
          }}
          title="Drag Left Side Bearing"
        >
          <span className="absolute left-1 bottom-8 text-[9px] font-mono text-neutral-700 dark:text-neutral-400 bg-white/95 dark:bg-neutral-900/90 px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-800 shadow-xs rounded-xs">
            LSB: {glyph.leftSideBearing || 0}
          </span>
        </div>

        {/* Right Side Bearing / Advance Width Guide (Draggable) */}
        <div
          className="absolute inset-y-0 border-l border-neutral-400/70 dark:border-neutral-600/60 pointer-events-auto cursor-ew-resize hover:border-sky-500 dark:hover:border-neutral-300 transition-colors"
          style={{ left: `${rsbScreen.x}px` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setDraggingGuide('rsb');
          }}
          title="Drag Advance Width"
        >
          <span className="absolute left-1 bottom-8 text-[9px] font-mono text-neutral-700 dark:text-neutral-400 bg-white/95 dark:bg-neutral-900/90 px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-800 shadow-xs rounded-xs">
            Width: {glyph.advanceWidth || 600}
          </span>
        </div>
      </div>

      {/* Primary SVG Vector Silhouette Layer */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        style={{ transformOrigin: '0 0' }}
      >
        <g
          transform={`translate(${
            (containerRef.current?.clientWidth || 0) / 2 + panX
          }, ${
            (containerRef.current?.clientHeight || 0) / 2 +
            panY +
            metrics.unitsPerEm * 0.25 * zoom
          }) scale(${zoom}, ${-zoom})`}
        >
          {/* Filled glyph silhouette or individual colored contours */}
          {glyph.contours.some((c) => !!c.color) ? (
            glyph.contours.map((c) => {
              const cPath = generateContourSvgPath(c);
              const col = c.color || glyph.color || '#38bdf8';
              return (
                <path
                  key={c.id}
                  d={cPath}
                  fill={col}
                  fillOpacity={0.85}
                  stroke={col}
                  strokeWidth={1.5 / zoom}
                  fillRule="nonzero"
                />
              );
            })
          ) : (
            <path
              d={generateSvgPath()}
              fill={glyph.color ? glyph.color : isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)'}
              fillOpacity={glyph.color ? 0.85 : undefined}
              stroke={glyph.color || (isLight ? '#0f172a' : '#ffffff')}
              strokeWidth={1.5 / zoom}
              fillRule="nonzero"
            />
          )}

          {/* Active Free Pen / Brush drawing live stroke preview */}
          {isDrawingBrush && brushStrokePoints.length > 1 && (
            <path
              d={
                'M ' +
                brushStrokePoints.map((p) => `${p.x} ${p.y}`).join(' L ')
              }
              fill="none"
              stroke={glyph.color || (isLight ? '#0f172a' : '#ffffff')}
              strokeWidth={brushSize}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />
          )}

          {/* Node handles and connecting lines for bezier control points */}
          {glyph.contours.map((contour, cIdx) => {
            return contour.points.map((pt, index) => {
              if (pt.type === 'control1' || pt.type === 'control2') {
                const prev = contour.points[index - 1] || contour.points[contour.points.length - 1];
                return (
                  <line
                    key={`handle-line-${contour.id || cIdx}-${pt.id}-${index}`}
                    x1={prev.x}
                    y1={prev.y}
                    x2={pt.x}
                    y2={pt.y}
                    stroke={isLight ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.35)'}
                    strokeWidth={1 / zoom}
                    strokeDasharray={`${3 / zoom}, ${3 / zoom}`}
                  />
                );
              }
              return null;
            });
          })}
        </g>
      </svg>

      {/* Interactive Edges / Path Segments (Illustrator edge selection & arcing) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        {glyph.contours.map((contour) => {
          if (!contour.points || contour.points.length < 2) return null;
          return contour.points.map((pt, idx) => {
            if (pt.type !== 'onCurve') return null;
            const nextIdx = (idx + 1) % contour.points.length;
            if (!contour.closed && nextIdx === 0) return null;
            const nextPt = contour.points[nextIdx];

            const p1Screen = fontToScreen(pt.x, pt.y);
            const p2Screen = fontToScreen(nextPt.x, nextPt.y);

            const isHovered =
              hoveredEdge?.contourId === contour.id && hoveredEdge?.startIndex === idx;
            const bothSelected =
              selectedSet.has(pt.id) && selectedSet.has(nextPt.id);

            return (
              <g key={`edge-${contour.id}-${idx}`}>
                {/* Invisible wide hit area for edge click/drag */}
                <line
                  x1={p1Screen.x}
                  y1={p1Screen.y}
                  x2={p2Screen.x}
                  y2={p2Screen.y}
                  stroke="transparent"
                  strokeWidth="12"
                  className="pointer-events-auto cursor-pointer"
                  onMouseEnter={() => setHoveredEdge({ contourId: contour.id, startIndex: idx })}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onMouseDown={(e) => handleEdgeMouseDown(e, contour.id, idx)}
                />
                {/* Visible highlight line */}
                {(isHovered || bothSelected) && (
                  <line
                    x1={p1Screen.x}
                    y1={p1Screen.y}
                    x2={p2Screen.x}
                    y2={p2Screen.y}
                    stroke={bothSelected ? '#38bdf8' : '#ffffff'}
                    strokeWidth={bothSelected ? '2.5' : '1.5'}
                    strokeDasharray={isHovered ? '4, 4' : undefined}
                    className="pointer-events-none"
                  />
                )}
              </g>
            );
          });
        })}
      </svg>

      {/* Interactive Anchor / Node Point Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {glyph.contours.map((contour, cIdx) =>
          contour.points.map((pt, pIdx) => {
            const screen = fontToScreen(pt.x, pt.y);
            const isSelected = selectedSet.has(pt.id);
            const isControl = pt.type === 'control1' || pt.type === 'control2';

            return (
              <div
                key={`pt-overlay-${contour.id || cIdx}-${pt.id}-${pIdx}`}
                onMouseDown={(e) => handlePointMouseDown(e, pt.id)}
                className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-transform cursor-pointer ${
                  isControl
                    ? 'w-2 h-2 rounded-full border border-neutral-300 bg-neutral-900'
                    : 'w-2.5 h-2.5 bg-neutral-100 border border-neutral-950 shadow-sm'
                } ${
                  isSelected
                    ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-neutral-950 z-20 !bg-sky-400'
                    : 'hover:scale-125 z-10'
                }`}
                style={{
                  left: `${screen.x}px`,
                  top: `${screen.y}px`,
                }}
                title={`${pt.type} (${pt.x}, ${pt.y})`}
              />
            );
          })
        )}
      </div>

      {/* Marquee Selection Rectangle Box */}
      {isMarqueeSelecting && marqueeWidth > 2 && marqueeHeight > 2 && (
        <div
          className="absolute border border-dashed border-sky-400 bg-sky-400/10 pointer-events-none z-30"
          style={{
            left: `${marqueeLeft}px`,
            top: `${marqueeTop}px`,
            width: `${marqueeWidth}px`,
            height: `${marqueeHeight}px`,
          }}
        />
      )}

      {/* Live Brush Cursor Indicator */}
      {activeTool === 'brush' && (
        <div
          className="fixed pointer-events-none rounded-full border border-neutral-300/80 bg-white/10 z-40 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `${Math.max(6, brushSize * zoom)}px`,
            height: `${Math.max(6, brushSize * zoom)}px`,
            left: `${cursorFontCoord ? fontToScreen(cursorFontCoord.x, cursorFontCoord.y).x : -100}px`,
            top: `${cursorFontCoord ? fontToScreen(cursorFontCoord.x, cursorFontCoord.y).y : -100}px`,
          }}
        />
      )}

      {/* Coordinate & Status Info in bottom left */}
      <div className="absolute bottom-2 left-2 z-10 pointer-events-none flex items-center gap-3 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 bg-white/95 dark:bg-neutral-950/80 px-2.5 py-1 border border-neutral-300 dark:border-neutral-900 rounded-xs shadow-xs backdrop-blur-xs">
        <span>X: {cursorFontCoord.x}</span>
        <span>Y: {cursorFontCoord.y}</span>
        <span className="text-neutral-300 dark:text-neutral-700">|</span>
        <span className="font-semibold text-neutral-900 dark:text-neutral-200">{activeTool.toUpperCase()}</span>
        {activeTool === 'brush' && (
          <>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <span className="text-neutral-800 dark:text-neutral-300">Brush: {brushSize}px</span>
          </>
        )}
        {selectedPointIds.length > 0 && (
          <>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <span className="text-sky-600 dark:text-sky-400 font-semibold">{selectedPointIds.length} nodes selected</span>
          </>
        )}
      </div>
    </div>
  );
};
