import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontProject, GlyphData, EditorTool, PathContour, FontMetrics, VectorPoint, FontTypeStyle } from '@/src/types/font';
import { fontStorage } from '@/src/lib/fonts/fontStorage';
import { createDefaultGlyphContours } from '@/src/lib/fonts/defaultFont';
import { extractSingleGlyphContours } from '@/src/lib/fonts/fontConverter';
import { EditorTopBar } from '@/src/components/editor/EditorTopBar';
import { EditorToolbar } from '@/src/components/editor/EditorToolbar';
import { GlyphCanvas } from '@/src/components/editor/GlyphCanvas';
import { GlyphBrowser } from '@/src/components/editor/GlyphBrowser';
import { GlyphInspector } from '@/src/components/editor/GlyphInspector';
import { FontPreviewDrawer } from '@/src/components/editor/FontPreviewDrawer';
import { ExportDialog } from '@/src/components/editor/ExportDialog';
import { AddLanguageDialog } from '@/src/components/editor/AddLanguageDialog';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Monitor } from 'lucide-react';

import { detectFontPrimaryLanguage } from '@/src/lib/fonts/languagePresets';

interface EditorPageProps {
  fontId: string;
  onNavigate: (path: string) => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({ fontId, onNavigate }) => {
  const [project, setProject] = useState<FontProject | null>(null);
  const [storageReady, setStorageReady] = useState<boolean>(() => fontStorage.isReady());
  const [selectedChar, setSelectedChar] = useState<string>('A');
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [brushSize, setBrushSize] = useState<number>(24);
  const [selectedPointIds, setSelectedPointIds] = useState<string[]>([]);

  // Viewport transforms (focal canvas zoom and pan)
  const [zoom, setZoom] = useState<number>(0.42);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // Modals & Panels
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAddLanguageOpen, setIsAddLanguageOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // History stack for Undo/Redo (capped to prevent memory explosion)
  const [history, setHistory] = useState<FontProject[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const { toast } = useToast();

  // Wait for IndexedDB to initialize before loading project (avoids false 404 on hard reload)
  useEffect(() => {
    if (fontStorage.isReady()) {
      setStorageReady(true);
      return;
    }
    let cancelled = false;
    fontStorage.awaitReady().then(() => {
      if (!cancelled) setStorageReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Load project on mount or ID change — but only once storage is ready
  useEffect(() => {
    if (!storageReady) return;
    const loaded = fontStorage.getProjectById(fontId);
    if (loaded) {
      // Ensure types array is initialized
      let prepared = { ...loaded };
      if (!prepared.types || prepared.types.length === 0) {
        const initialType: FontTypeStyle = {
          id: 'type_' + Math.random().toString(36).substring(2, 9),
          name: prepared.style || 'Regular',
          weight: prepared.weight || 400,
          width: prepared.width || 'Normal',
          metrics: { ...prepared.metrics },
          glyphs: { ...prepared.glyphs },
        };
        prepared.types = [initialType];
        prepared.activeTypeId = initialType.id;
      } else if (!prepared.activeTypeId) {
        prepared.activeTypeId = prepared.types[0].id;
      }

      setProject(prepared);
      setHistory([prepared]);
      setHistoryIndex(0);
      setSelectedPointIds([]);

      // Select meaningful initial character: prioritize native script showcase character for non-Latin fonts
      const lang = detectFontPrimaryLanguage(prepared.glyphs, prepared.primaryScript);
      if (lang.script !== 'Latin' && lang.showcaseGlyphs.length > 0 && lang.showcaseGlyphs[0]?.char) {
        setSelectedChar(lang.showcaseGlyphs[0].char);
      } else {
        const currentSelected = prepared.glyphs['A'];
        if (!currentSelected || (!currentSelected.hasCustomPath && (!currentSelected.contours || currentSelected.contours.length === 0))) {
          if (lang.showcaseGlyphs.length > 0 && lang.showcaseGlyphs[0]?.char) {
            setSelectedChar(lang.showcaseGlyphs[0].char);
          } else {
            const firstWithContour = Object.values(prepared.glyphs).find((g) => g.hasCustomPath || (g.contours && g.contours.length > 0));
            if (firstWithContour) {
              setSelectedChar(firstWithContour.char);
            }
          }
        }
      }
    } else {
      toast({ type: 'error', title: 'Font not found', description: 'Returning to workspace' });
      onNavigate('/dashboard');
    }
  }, [fontId, storageReady]);

  // Push new state to history (capped at 5 for mega-fonts, 25 for normal fonts to conserve memory)
  const pushStateToHistory = useCallback((newProject: FontProject) => {
    const isMega = Object.keys(newProject.glyphs).length > 2000;
    const maxEntries = isMega ? 5 : 25;
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const next = [...trimmed, newProject];
      if (next.length > maxEntries) {
        return next.slice(next.length - maxEntries);
      }
      return next;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, maxEntries - 1));
    setIsDirty(true);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      const targetState = history[newIdx];
      setProject(targetState);
      setHistoryIndex(newIdx);
      setIsDirty(true);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      const targetState = history[newIdx];
      setProject(targetState);
      setHistoryIndex(newIdx);
      setIsDirty(true);
    }
  }, [history, historyIndex]);

  const handleSave = useCallback(() => {
    if (!project) return;
    // Sync active glyphs to active type before saving
    let toSave = { ...project };
    if (toSave.types && toSave.activeTypeId) {
      toSave.types = toSave.types.map((t) =>
        t.id === toSave.activeTypeId
          ? { ...t, glyphs: toSave.glyphs, metrics: toSave.metrics, name: toSave.style, weight: toSave.weight, width: toSave.width }
          : t
      );
    }
    fontStorage.saveProject(toSave);
    setProject(toSave);
    setIsDirty(false);
    toast({
      type: 'success',
      title: 'Saved to Foundry',
      description: `${project.family} saved successfully.`,
    });
  }, [project, toast]);

  // Family Type Switcher (0ms instant switch in-memory)
  const handleSwitchType = (typeId: string) => {
    if (!project || !project.types) return;

    // 1. Sync current glyphs into currently active type
    const updatedTypes = project.types.map((t) =>
      t.id === project.activeTypeId
        ? {
            ...t,
            glyphs: project.glyphs,
            metrics: project.metrics,
            name: project.style,
            weight: project.weight,
            width: project.width,
          }
        : t
    );

    // 2. Locate target type
    const target = updatedTypes.find((t) => t.id === typeId);
    if (!target) return;

    const nextProject: FontProject = {
      ...project,
      types: updatedTypes,
      activeTypeId: target.id,
      style: target.name,
      weight: target.weight,
      width: target.width,
      metrics: { ...target.metrics },
      glyphs: { ...target.glyphs },
    };

    setProject(nextProject);
    fontStorage.saveProject(nextProject);
    setHistory([nextProject]);
    setHistoryIndex(0);
    setSelectedPointIds([]);
    toast({
      type: 'info',
      title: `Switched to ${target.name}`,
      description: `Weight ${target.weight} (${Object.keys(target.glyphs || {}).length} glyphs)`,
    });
  };

  const handleAddTypeToFamily = (data: { name: string; weight: number; width: string }) => {
    if (!project) return;

    const newType: FontTypeStyle = {
      id: 'type_' + Math.random().toString(36).substring(2, 9),
      name: data.name,
      weight: data.weight,
      width: data.width,
      metrics: { ...project.metrics },
      // Copy current glyph contours as starting base for the new weight
      glyphs: { ...project.glyphs },
    };

    const currentTypes = project.types || [];
    const updatedTypes = [...currentTypes, newType].sort((a, b) => a.weight - b.weight);

    const nextProject: FontProject = {
      ...project,
      isFamily: true,
      types: updatedTypes,
      activeTypeId: newType.id,
      style: newType.name,
      weight: newType.weight,
      width: newType.width,
      metrics: newType.metrics,
      glyphs: newType.glyphs,
    };

    setProject(nextProject);
    fontStorage.saveProject(nextProject);
    setHistory([nextProject]);
    setHistoryIndex(0);
    toast({
      type: 'success',
      title: `Added ${data.name}`,
      description: `Created new style in ${project.family} family.`,
    });
  };

  const handleDeleteTypeFromFamily = (typeId: string) => {
    if (!project || !project.types || project.types.length <= 1) return;

    const updatedTypes = project.types.filter((t) => t.id !== typeId);
    let target = updatedTypes.find((t) => t.id === project.activeTypeId);
    if (!target) {
      target = updatedTypes[0];
    }

    const nextProject: FontProject = {
      ...project,
      isFamily: updatedTypes.length > 1,
      types: updatedTypes,
      activeTypeId: target.id,
      style: target.name,
      weight: target.weight,
      width: target.width,
      metrics: target.metrics,
      glyphs: target.glyphs,
    };

    setProject(nextProject);
    fontStorage.saveProject(nextProject);
    setHistory([nextProject]);
    setHistoryIndex(0);
    toast({ type: 'info', title: 'Removed style from family' });
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      if (cmdKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if (cmdKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'a':
          setActiveTool('node');
          break;
        case 'p':
          setActiveTool('pen');
          break;
        case 'b':
          setActiveTool('brush');
          break;
        case 'c':
          setActiveTool('arc');
          break;
        case 'l':
          setActiveTool('line');
          break;
        case 'r':
          setActiveTool('rectangle');
          break;
        case 'o':
          setActiveTool('ellipse');
          break;
        case 'h':
          setActiveTool('pan');
          break;
        case 'm':
          setActiveTool('measure');
          break;
        case 'g':
          setShowGrid((prev) => !prev);
          break;
        case 's':
          setSnapToGrid((prev) => !prev);
          break;
        case 'delete':
        case 'backspace':
          handleDeleteSelectedPoints();
          break;
        case 'escape':
          setSelectedPointIds([]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleUndo, handleRedo, selectedPointIds]);

  // Active glyph: with lazy on-demand contour extraction if not yet extracted for mega-fonts
  const activeGlyph: GlyphData = useMemo(() => {
    if (!project) {
      return {
        unicode: selectedChar.codePointAt(0) || 65,
        name: `uni${(selectedChar.codePointAt(0) || 65).toString(16).toUpperCase()}`,
        char: selectedChar,
        advanceWidth: 600,
        leftSideBearing: 40,
        contours: [],
        hasCustomPath: false,
      };
    }
    const existing = project.glyphs[selectedChar];
    if (existing) {
      if ((!existing.contours || existing.contours.length === 0) && !existing.hasCustomPath) {
        const onDemand = extractSingleGlyphContours(project.family, existing.unicode ?? selectedChar);
        if (onDemand && onDemand.length > 0) {
          existing.contours = onDemand;
          existing.hasCustomPath = true;
        }
      }
      // Self-heal: ensure all point IDs in active glyph are strictly unique
      if (existing.contours && existing.contours.length > 0) {
        const seenIds = new Set<string>();
        let hasDuplicate = false;
        for (const c of existing.contours) {
          if (!c.points) continue;
          for (const p of c.points) {
            if (seenIds.has(p.id)) {
              hasDuplicate = true;
              break;
            }
            seenIds.add(p.id);
          }
          if (hasDuplicate) break;
        }
        if (hasDuplicate) {
          let seq = 0;
          existing.contours.forEach((c, cIdx) => {
            if (!c.points) return;
            c.points.forEach((p) => {
              seq++;
              p.id = `pt_${existing.unicode || selectedChar}_${cIdx}_${seq}`;
            });
          });
        }
      }
      return existing;
    }
    return {
      unicode: selectedChar.codePointAt(0) || 65,
      name: `uni${(selectedChar.codePointAt(0) || 65).toString(16).toUpperCase()}`,
      char: selectedChar,
      advanceWidth: 600,
      leftSideBearing: 40,
      contours: [],
      hasCustomPath: false,
    };
  }, [project, selectedChar]);

  if (!project) {
    return (
      <div className="h-screen bg-neutral-950 flex flex-col items-center justify-center gap-3 text-xs font-mono text-neutral-400">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
        <span>{storageReady ? 'Loading font workspace...' : 'Opening storage…'}</span>
      </div>
    );
  }

  // Primary selected point for inspector
  let currentSelectedPoint: VectorPoint | null = null;
  if (selectedPointIds.length > 0 && activeGlyph.contours) {
    const primaryId = selectedPointIds[0];
    for (const contour of activeGlyph.contours) {
      const pt = contour.points?.find((p) => p.id === primaryId);
      if (pt) {
        currentSelectedPoint = pt;
        break;
      }
    }
  }

  const handleUpdateGlyphContours = (contours: PathContour[], commitHistory: boolean = true) => {
    const finalizedContours = contours.map((c) => ({
      ...c,
      color: c.color || activeGlyph.color,
    }));

    const updatedGlyph: GlyphData = {
      ...activeGlyph,
      contours: finalizedContours,
      hasCustomPath: true,
    };

    const updatedProject: FontProject = {
      ...project,
      glyphs: {
        ...project.glyphs,
        [selectedChar]: updatedGlyph,
      },
    };

    if (updatedProject.types && updatedProject.activeTypeId) {
      updatedProject.types = updatedProject.types.map((t) =>
        t.id === updatedProject.activeTypeId
          ? { ...t, glyphs: updatedProject.glyphs }
          : t
      );
    }

    setProject(updatedProject);
    if (commitHistory) {
      fontStorage.saveProject(updatedProject);
      pushStateToHistory(updatedProject);
    }
  };

  const handleUpdateMetricsBearing = (bearing: { lsb?: number; advanceWidth?: number }) => {
    const updatedProject: FontProject = {
      ...project,
      glyphs: {
        ...project.glyphs,
        [selectedChar]: {
          ...activeGlyph,
          ...(bearing.lsb !== undefined && { leftSideBearing: bearing.lsb }),
          ...(bearing.advanceWidth !== undefined && { advanceWidth: bearing.advanceWidth }),
        },
      },
    };
    setProject(updatedProject);
    pushStateToHistory(updatedProject);
  };

  const handleDeleteSelectedPoints = () => {
    if (selectedPointIds.length === 0) return;
    const selectedSet = new Set(selectedPointIds);

    const newContours = activeGlyph.contours
      .map((c) => ({
        ...c,
        points: c.points.filter((p) => !selectedSet.has(p.id)),
      }))
      .filter((c) => c.points.length > 0);

    handleUpdateGlyphContours(newContours, true);
    setSelectedPointIds([]);
  };

  const handleResetGlyphTemplate = () => {
    const { contours, advanceWidth, lsb } = createDefaultGlyphContours(selectedChar);
    const updatedProject: FontProject = {
      ...project,
      glyphs: {
        ...project.glyphs,
        [selectedChar]: {
          ...activeGlyph,
          contours,
          advanceWidth,
          leftSideBearing: lsb,
          hasCustomPath: false,
        },
      },
    };
    setProject(updatedProject);
    pushStateToHistory(updatedProject);
    setSelectedPointIds([]);
    toast({ type: 'info', title: `Reset ${selectedChar} to standard geometry` });
  };

  const handleClearGlyph = () => {
    handleUpdateGlyphContours([], true);
    setSelectedPointIds([]);
    toast({ type: 'info', title: `Cleared outlines for ${selectedChar}` });
  };

  const handleUpdateGlyphColor = (color?: string) => {
    const updatedContours = activeGlyph.contours.map((c) => ({
      ...c,
      color: color || undefined,
    }));

    const updatedGlyph: GlyphData = {
      ...activeGlyph,
      color,
      isColor: Boolean(color),
      contours: updatedContours,
    };

    let hasAnyColor = Boolean(color) || Boolean(project.isColorFont);
    if (!color && project.isColorFont) {
      let foundOtherColor = false;
      for (const k in project.glyphs) {
        if (k !== selectedChar) {
          const g = project.glyphs[k];
          if (g.color || g.isColor || (g.contours && g.contours.some((c) => !!c.color))) {
            foundOtherColor = true;
            break;
          }
        }
      }
      hasAnyColor = foundOtherColor;
    }

    const updatedProject: FontProject = {
      ...project,
      isColorFont: hasAnyColor,
      glyphs: {
        ...project.glyphs,
        [selectedChar]: updatedGlyph,
      },
    };

    if (updatedProject.types && updatedProject.activeTypeId) {
      updatedProject.types = updatedProject.types.map((t) =>
        t.id === updatedProject.activeTypeId
          ? { ...t, glyphs: updatedProject.glyphs, isColorFont: hasAnyColor }
          : t
      );
    }

    setProject(updatedProject);
    fontStorage.saveProject(updatedProject);
    pushStateToHistory(updatedProject);
    toast({
      type: 'success',
      title: color ? 'Color Saved' : 'Color Reset',
      description: color ? `Glyph ${selectedChar} saved with color ${color}` : `Reset to standard monochrome`,
    });
  };

  const handleUpdateContourColor = (contourId: string, color?: string) => {
    const newContours = activeGlyph.contours.map((c) => {
      if (c.id === contourId) {
        return { ...c, color };
      }
      return c;
    });
    const hasAnyColor = Boolean(color) || newContours.some((c) => !!c.color);
    const updatedGlyph: GlyphData = {
      ...activeGlyph,
      contours: newContours,
      color: hasAnyColor ? activeGlyph.color || color : undefined,
      isColor: hasAnyColor,
    };
    const updatedProject: FontProject = {
      ...project,
      isColorFont: true,
      glyphs: {
        ...project.glyphs,
        [selectedChar]: updatedGlyph,
      },
    };
    if (updatedProject.types && updatedProject.activeTypeId) {
      updatedProject.types = updatedProject.types.map((t) =>
        t.id === updatedProject.activeTypeId
          ? { ...t, glyphs: updatedProject.glyphs, isColorFont: true }
          : t
      );
    }
    setProject(updatedProject);
    fontStorage.saveProject(updatedProject);
    pushStateToHistory(updatedProject);
  };

  const handleUpdatePointCoords = (pointId: string, x: number, y: number, type?: any) => {
    const newContours = activeGlyph.contours.map((c) => ({
      ...c,
      points: c.points.map((p) => {
        if (p.id === pointId) {
          return {
            ...p,
            x,
            y,
            ...(type && { type }),
          };
        }
        return p;
      }),
    }));
    handleUpdateGlyphContours(newContours, true);
  };

  const handleUpdateFontMetrics = (metrics: Partial<FontMetrics>) => {
    const updatedProject: FontProject = {
      ...project,
      metrics: {
        ...project.metrics,
        ...metrics,
      },
    };
    setProject(updatedProject);
    pushStateToHistory(updatedProject);
  };

  const handleUpdateProjectMeta = (meta: { family?: string; style?: string; weight?: number; width?: string }) => {
    const updatedProject: FontProject = {
      ...project,
      name: `${meta.family || project.family} ${meta.style || project.style}`.trim(),
      family: meta.family || project.family,
      style: meta.style || project.style,
      weight: meta.weight !== undefined ? meta.weight : project.weight,
      width: meta.width || project.width,
    };
    setProject(updatedProject);
    fontStorage.saveProject(updatedProject);
    pushStateToHistory(updatedProject);
    toast({ type: 'success', title: 'Updated Font Properties' });
  };

  // Performant Arcing on Inspector
  const handleApplyArcToSelectedPoint = (tension: number) => {
    if (!currentSelectedPoint) return;
    const factor = tension / 100;

    const newContours = activeGlyph.contours.map((contour) => {
      const idx = contour.points.findIndex((p) => p.id === currentSelectedPoint?.id);
      if (idx < 0) return contour;

      const pts = [...contour.points];
      const p1 = pts[idx];
      const nextIdx = (idx + 1) % pts.length;
      const p2 = pts[nextIdx];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;

      const bulge = (dist * 0.35) * factor;

      const c1X = Math.round(p1.x + dx * 0.33 + nx * bulge);
      const c1Y = Math.round(p1.y + dy * 0.33 + ny * bulge);
      const c2X = Math.round(p1.x + dx * 0.67 + nx * bulge);
      const c2Y = Math.round(p1.y + dy * 0.67 + ny * bulge);

      const nextIsControl = pts[idx + 1] && pts[idx + 1].type === 'control1';
      if (nextIsControl) {
        pts[idx + 1] = { ...pts[idx + 1], x: c1X, y: c1Y };
        if (pts[idx + 2] && pts[idx + 2].type === 'control2') {
          pts[idx + 2] = { ...pts[idx + 2], x: c2X, y: c2Y };
        }
      } else {
        const ctrl1: VectorPoint = { id: `pt_arc_${Date.now()}_1`, x: c1X, y: c1Y, type: 'control1' };
        const ctrl2: VectorPoint = { id: `pt_arc_${Date.now()}_2`, x: c2X, y: c2Y, type: 'control2' };
        pts.splice(idx + 1, 0, ctrl1, ctrl2);
      }

      return { ...contour, points: pts };
    });

    handleUpdateGlyphContours(newContours, true);
  };

  const handleStraightenSelectedSegment = () => {
    if (!currentSelectedPoint) return;
    const newContours = activeGlyph.contours.map((contour) => {
      const idx = contour.points.findIndex((p) => p.id === currentSelectedPoint?.id);
      if (idx < 0) return contour;

      const pts = contour.points.filter((p, i) => {
        if (i === idx + 1 && p.type === 'control1') return false;
        if (i === idx + 2 && p.type === 'control2') return false;
        return true;
      });

      return { ...contour, points: pts };
    });

    handleUpdateGlyphContours(newContours, true);
    toast({ type: 'info', title: 'Straightened segment' });
  };

  const handleUpdateZoomAndPan = (newZoom: number, newPanX: number, newPanY: number) => {
    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);
  };

  const handleAddCharacters = (chars: string[]) => {
    if (!project || chars.length === 0) return;

    const newGlyphs = { ...project.glyphs };
    let firstAdded = '';

    chars.forEach((c) => {
      if (!newGlyphs[c]) {
        const unicode = c.codePointAt(0) || 0;
        const hex = unicode.toString(16).toUpperCase().padStart(4, '0');
        newGlyphs[c] = {
          unicode,
          name: c === ' ' ? 'space' : `uni${hex}`,
          char: c,
          advanceWidth: Math.round(project.metrics.unitsPerEm * 0.6),
          leftSideBearing: 50,
          contours: [],
          hasCustomPath: false,
        };
        if (!firstAdded) firstAdded = c;
      }
    });

    const updatedProject = {
      ...project,
      glyphs: newGlyphs,
    };

    if (updatedProject.types && updatedProject.activeTypeId) {
      updatedProject.types = updatedProject.types.map((t) =>
        t.id === updatedProject.activeTypeId ? { ...t, glyphs: newGlyphs } : t
      );
    }

    setProject(updatedProject);
    pushStateToHistory(updatedProject);
    fontStorage.saveProject(updatedProject);

    if (firstAdded) {
      setSelectedChar(firstAdded);
    }

    toast({
      type: 'success',
      title: 'Glyphs Added',
      description: `Added ${chars.length} glyph(s) to ${project.family}.`,
    });
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden font-sans">
      {/* Small Screen Fallback */}
      <div className="md:hidden fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Monitor className="w-8 h-8 text-neutral-400 stroke-1" />
        <div className="space-y-1">
          <h2 className="font-mono text-sm tracking-wider uppercase font-semibold text-neutral-100">
            GlyphWorks Editor
          </h2>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
            The vector typography workspace is optimized for larger displays.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onNavigate('/dashboard')}
        >
          Return to Projects
        </Button>
      </div>

      {/* Editor Top Bar with Family Types Switcher */}
      <EditorTopBar
        project={project}
        onUpdateProjectMeta={handleUpdateProjectMeta}
        onSwitchType={handleSwitchType}
        onAddTypeToFamily={handleAddTypeToFamily}
        onDeleteTypeFromFamily={handleDeleteTypeFromFamily}
        onSave={handleSave}
        onExport={() => setIsExportOpen(true)}
        onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
        isPreviewOpen={isPreviewOpen}
        onBackToDashboard={() => onNavigate('/dashboard')}
        isDirty={isDirty}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(6.0, z * 1.25))}
        onZoomOut={() => setZoom((z) => Math.max(0.1, z * 0.8))}
        onResetZoom={() => {
          setZoom(0.42);
          setPanX(0);
          setPanY(0);
        }}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Main Workspace (Toolbar | Canvas | Inspector) */}
      <div className="flex-1 flex overflow-hidden relative">
        <EditorToolbar
          activeTool={activeTool}
          onSelectTool={(t) => setActiveTool(t)}
          brushSize={brushSize}
          onChangeBrushSize={(sz) => setBrushSize(sz)}
          onDeleteSelectedPoints={handleDeleteSelectedPoints}
          hasSelectedPoints={selectedPointIds.length > 0}
          onClearGlyph={handleClearGlyph}
          onResetGlyphTemplate={handleResetGlyphTemplate}
        />

        <GlyphCanvas
          glyph={activeGlyph}
          metrics={project.metrics}
          activeTool={activeTool}
          brushSize={brushSize}
          zoom={zoom}
          panX={panX}
          panY={panY}
          onUpdatePan={(px, py) => {
            setPanX(px);
            setPanY(py);
          }}
          onUpdateZoomAndPan={handleUpdateZoomAndPan}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          selectedPointIds={selectedPointIds}
          onSelectPoints={(ids) => setSelectedPointIds(ids)}
          onUpdateGlyphContours={handleUpdateGlyphContours}
          onUpdateMetricsBearing={handleUpdateMetricsBearing}
        />

        <GlyphInspector
          glyph={activeGlyph}
          metrics={project.metrics}
          selectedPoint={currentSelectedPoint}
          selectedPointCount={selectedPointIds.length}
          onUpdateGlyphMetrics={handleUpdateMetricsBearing}
          onUpdatePointCoords={handleUpdatePointCoords}
          onUpdateFontMetrics={handleUpdateFontMetrics}
          onReverseContour={(contourId) => {
            const newContours = activeGlyph.contours.map((c) => {
              if (c.id === contourId) {
                return { ...c, points: [...c.points].reverse() };
              }
              return c;
            });
            handleUpdateGlyphContours(newContours, true);
          }}
          onDeleteContour={(contourId) => {
            const newContours = activeGlyph.contours.filter((c) => c.id !== contourId);
            handleUpdateGlyphContours(newContours, true);
          }}
          onApplyArcToSelectedPoint={handleApplyArcToSelectedPoint}
          onStraightenSelectedSegment={handleStraightenSelectedSegment}
          onUpdateGlyphColor={handleUpdateGlyphColor}
          onUpdateContourColor={handleUpdateContourColor}
        />
      </div>

      {/* Glyph Browser Strip at Bottom */}
      <GlyphBrowser
        glyphs={project.glyphs}
        selectedChar={selectedChar}
        onSelectChar={(char) => {
          setSelectedChar(char);
          setSelectedPointIds([]);
        }}
        onOpenAddLanguage={() => setIsAddLanguageOpen(true)}
      />

      {/* Modals */}
      <FontPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        project={project}
      />

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
      />

      <AddLanguageDialog
        isOpen={isAddLanguageOpen}
        onClose={() => setIsAddLanguageOpen(false)}
        existingGlyphs={project.glyphs}
        onAddCharacters={handleAddCharacters}
      />
    </div>
  );
};
