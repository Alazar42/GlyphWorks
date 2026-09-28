import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  GlyphData, 
  FontMetrics, 
  EditorTool, 
  VectorPoint, 
  PathContour 
} from '@/src/types/font';

interface GlyphCanvasProps {
  glyph: GlyphData;
  metrics: FontMetrics;
  activeTool: EditorTool;
  zoom: number;
  panX: number;
  panY: number;
  onUpdatePan: (panX: number, panY: number) => void;
  showGrid: boolean;
  snapToGrid: boolean;
  selectedPointId: string | null;
  onSelectPoint: (pointId: string | null) => void;
  onUpdateGlyphContours: (contours: PathContour[]) => void;
  onUpdateMetricsBearing: (bearing: { lsb?: number; advanceWidth?: number }) => void;
}

export const GlyphCanvas: React.FC<GlyphCanvasProps> = ({
  glyph,
  metrics,
  activeTool,
  zoom,
  panX,
  panY,
  onUpdatePan,
  showGrid,
  snapToGrid,
  selectedPointId,
  onSelectPoint,
  onUpdateGlyphContours,
  onUpdateMetricsBearing,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Point dragging state
  const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
  const [draggingGuide, setDraggingGuide] = useState<'lsb' | 'rsb' | null>(null);

  // Active pen drawing state
  const [activePenContourId, setActivePenContourId] = useState<string | null>(null);

  // Current mouse coordinates in font units
  const [cursorFontCoord, setCursorFontCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate font coordinate from viewport mouse event
  const screenToFont = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const originX = rect.width / 2 + panX;
      // Position baseline in lower half of screen
      const originY = rect.height / 2 + panY + (metrics.unitsPerEm * 0.25 * zoom);

      let x = (screenX - rect.left - originX) / zoom;
      let y = (originY - (screenY - rect.top)) / zoom;

      if (snapToGrid) {
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

  // Canvas Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or Pan tool => start panning
    if (e.button === 1 || activeTool === 'pan') {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
      return;
    }

    if (e.button !== 0) return;

    const fontCoord = screenToFont(e.clientX, e.clientY);

    // Pen tool logic: add point to contour
    if (activeTool === 'pen') {
      const contours = [...(glyph.contours || [])];
      let contourIndex = -1;

      if (activePenContourId) {
        contourIndex = contours.findIndex((c) => c.id === activePenContourId);
      }

      if (contourIndex >= 0 && !contours[contourIndex].closed) {
        const contour = contours[contourIndex];
        // Check if user clicked near the first point to close contour
        if (contour.points.length > 2) {
          const firstPt = contour.points[0];
          const dist = Math.hypot(firstPt.x - fontCoord.x, firstPt.y - fontCoord.y);
          if (dist < 20 / zoom) {
            contour.closed = true;
            onUpdateGlyphContours(contours);
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
        onUpdateGlyphContours(contours);
        onSelectPoint(newPoint.id);
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
        onUpdateGlyphContours(contours);
        setActivePenContourId(newContourId);
        onSelectPoint(newPoint.id);
      }
      return;
    }

    // Rectangle Primitive Tool
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
      onUpdateGlyphContours([...(glyph.contours || []), newContour]);
      onSelectPoint(newContour.points[0].id);
      return;
    }

    // Ellipse Primitive Tool
    if (activeTool === 'ellipse') {
      const rx = 120;
      const ry = 140;
      const cx = fontCoord.x;
      const cy = fontCoord.y;
      const k = 0.5522847498; // Bezier approximation constant for circle
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
      onUpdateGlyphContours([...(glyph.contours || []), newContour]);
      onSelectPoint(newContour.points[0].id);
      return;
    }

    // Clicking on background deselects
    onSelectPoint(null);
  };

  // Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const fontCoord = screenToFont(e.clientX, e.clientY);
    setCursorFontCoord(fontCoord);

    if (isDraggingCanvas) {
      onUpdatePan(e.clientX - dragStart.x, e.clientY - dragStart.y);
      return;
    }

    // Dragging an existing point
    if (draggingPointId) {
      const contours = glyph.contours.map((contour) => ({
        ...contour,
        points: contour.points.map((pt) => {
          if (pt.id === draggingPointId) {
            return {
              ...pt,
              x: fontCoord.x,
              y: fontCoord.y,
            };
          }
          return pt;
        }),
      }));
      onUpdateGlyphContours(contours);
      return;
    }

    // Dragging side bearing guides
    if (draggingGuide === 'lsb') {
      onUpdateMetricsBearing({ lsb: Math.max(0, fontCoord.x) });
      return;
    }
    if (draggingGuide === 'rsb') {
      onUpdateMetricsBearing({ advanceWidth: Math.max(100, fontCoord.x) });
      return;
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingPointId(null);
    setDraggingGuide(null);
  };

  // Wheel zoom / pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      // handled by parent or shortcut
    } else {
      // Pan
      onUpdatePan(panX - e.deltaX * 0.8, panY - e.deltaY * 0.8);
    }
  };

  // Point Selection / Drag start
  const handlePointMouseDown = (e: React.MouseEvent, pointId: string) => {
    e.stopPropagation();
    if (activeTool === 'select' || activeTool === 'node') {
      onSelectPoint(pointId);
      setDraggingPointId(pointId);
    }
  };

  // Build SVG Path command string from contours
  const generateSvgPath = () => {
    if (!glyph.contours || glyph.contours.length === 0) return '';
    let d = '';

    glyph.contours.forEach((contour) => {
      if (!contour.points || contour.points.length === 0) return;
      const pts = contour.points;
      d += `M ${pts[0].x} ${pts[0].y} `;

      let i = 1;
      while (i < pts.length) {
        const pt = pts[i];
        if (pt.type === 'onCurve') {
          d += `L ${pt.x} ${pt.y} `;
          i++;
        } else if (pt.type === 'control1') {
          const next = pts[i + 1];
          if (next && next.type === 'control2') {
            const end = pts[i + 2] || pts[0];
            d += `C ${pt.x} ${pt.y}, ${next.x} ${next.y}, ${end.x} ${end.y} `;
            i += 3;
          } else {
            const end = next || pts[0];
            d += `Q ${pt.x} ${pt.y}, ${end.x} ${end.y} `;
            i += 2;
          }
        } else {
          d += `L ${pt.x} ${pt.y} `;
          i++;
        }
      }

      if (contour.closed) {
        d += 'Z ';
      }
    });

    return d;
  };

  // Guide screen positions
  const baseScreen = fontToScreen(0, metrics.baseline);
  const xHeightScreen = fontToScreen(0, metrics.xHeight);
  const capHeightScreen = fontToScreen(0, metrics.capHeight);
  const ascenderScreen = fontToScreen(0, metrics.ascender);
  const descenderScreen = fontToScreen(0, metrics.descender);
  const lsbScreen = fontToScreen(glyph.leftSideBearing || 0, 0);
  const rsbScreen = fontToScreen(glyph.advanceWidth || 600, 0);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative flex-1 h-full bg-neutral-950 overflow-hidden select-none ${
        activeTool === 'pan' || isDraggingCanvas
          ? 'cursor-grab active:cursor-grabbing'
          : activeTool === 'pen'
          ? 'cursor-crosshair'
          : 'cursor-default'
      }`}
    >
      {/* Background Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
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
          className="absolute inset-x-0 border-b border-dashed border-neutral-700/60"
          style={{ top: `${ascenderScreen.y}px` }}
        >
          <span className="absolute right-3 -top-3.5 text-[9px] font-mono text-neutral-500">
            Ascender ({metrics.ascender})
          </span>
        </div>

        {/* Cap Height line */}
        <div
          className="absolute inset-x-0 border-b border-dashed border-neutral-600/70"
          style={{ top: `${capHeightScreen.y}px` }}
        >
          <span className="absolute right-3 -top-3.5 text-[9px] font-mono text-neutral-400">
            Cap Height ({metrics.capHeight})
          </span>
        </div>

        {/* x-Height line */}
        <div
          className="absolute inset-x-0 border-b border-dashed border-neutral-700/60"
          style={{ top: `${xHeightScreen.y}px` }}
        >
          <span className="absolute right-3 -top-3.5 text-[9px] font-mono text-neutral-500">
            x-Height ({metrics.xHeight})
          </span>
        </div>

        {/* Baseline (Solid) */}
        <div
          className="absolute inset-x-0 border-b border-neutral-400/80"
          style={{ top: `${baseScreen.y}px` }}
        >
          <span className="absolute right-3 -top-3.5 text-[9px] font-mono text-neutral-300 font-semibold">
            Baseline (0)
          </span>
        </div>

        {/* Descender line */}
        <div
          className="absolute inset-x-0 border-b border-dashed border-neutral-700/60"
          style={{ top: `${descenderScreen.y}px` }}
        >
          <span className="absolute right-3 -top-3.5 text-[9px] font-mono text-neutral-500">
            Descender ({metrics.descender})
          </span>
        </div>

        {/* Origin Axis (x=0) */}
        <div
          className="absolute inset-y-0 border-l border-neutral-800/80"
          style={{ left: `${fontToScreen(0, 0).x}px` }}
        />

        {/* Left Side Bearing Guide (Draggable) */}
        <div
          className="absolute inset-y-0 border-l border-neutral-600/60 pointer-events-auto cursor-ew-resize hover:border-neutral-300 transition-colors"
          style={{ left: `${lsbScreen.x}px` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setDraggingGuide('lsb');
          }}
          title="Drag Left Side Bearing"
        >
          <span className="absolute left-1 bottom-8 text-[9px] font-mono text-neutral-400 bg-neutral-900/90 px-1 border border-neutral-800">
            LSB: {glyph.leftSideBearing || 0}
          </span>
        </div>

        {/* Right Side Bearing / Advance Width Guide (Draggable) */}
        <div
          className="absolute inset-y-0 border-l border-neutral-600/60 pointer-events-auto cursor-ew-resize hover:border-neutral-300 transition-colors"
          style={{ left: `${rsbScreen.x}px` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setDraggingGuide('rsb');
          }}
          title="Drag Advance Width"
        >
          <span className="absolute left-1 bottom-8 text-[9px] font-mono text-neutral-400 bg-neutral-900/90 px-1 border border-neutral-800">
            Width: {glyph.advanceWidth || 600}
          </span>
        </div>
      </div>

      {/* Primary SVG Vector Layer */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        style={{
          transformOrigin: '0 0',
        }}
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
          {/* Filled glyph silhouette */}
          <path
            d={generateSvgPath()}
            fill="rgba(255, 255, 255, 0.08)"
            stroke="#ffffff"
            strokeWidth={1.5 / zoom}
            fillRule="evenodd"
          />

          {/* Node handles and connecting lines for bezier control points */}
          {glyph.contours.map((contour) => {
            return contour.points.map((pt, index) => {
              if (pt.type === 'control1' || pt.type === 'control2') {
                const prev = contour.points[index - 1] || contour.points[contour.points.length - 1];
                return (
                  <line
                    key={`handle-line-${pt.id}`}
                    x1={prev.x}
                    y1={prev.y}
                    x2={pt.x}
                    y2={pt.y}
                    stroke="rgba(255, 255, 255, 0.25)"
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

      {/* Interactive Anchor / Node Point Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {glyph.contours.map((contour) =>
          contour.points.map((pt) => {
            const screen = fontToScreen(pt.x, pt.y);
            const isSelected = pt.id === selectedPointId;
            const isControl = pt.type === 'control1' || pt.type === 'control2';

            return (
              <div
                key={pt.id}
                onMouseDown={(e) => handlePointMouseDown(e, pt.id)}
                className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-shadow cursor-pointer ${
                  isControl
                    ? 'w-2 h-2 rounded-full border border-neutral-300 bg-neutral-900'
                    : 'w-2.5 h-2.5 bg-neutral-100 border border-neutral-950 shadow-sm'
                } ${
                  isSelected
                    ? 'ring-2 ring-neutral-100 ring-offset-1 ring-offset-neutral-950 z-20 !bg-neutral-100'
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

      {/* Coordinate & Status Info in bottom left */}
      <div className="absolute bottom-2 left-2 z-10 pointer-events-none flex items-center gap-3 text-[10px] font-mono text-neutral-400 bg-neutral-950/80 px-2 py-1 border border-neutral-900">
        <span>X: {cursorFontCoord.x}</span>
        <span>Y: {cursorFontCoord.y}</span>
        <span className="text-neutral-600">|</span>
        <span>{activeTool.toUpperCase()}</span>
      </div>
    </div>
  );
};
