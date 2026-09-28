import React, { useState, useEffect, useCallback } from 'react';
import { FontProject, GlyphData, EditorTool, PathContour, FontMetrics } from '@/src/types/font';
import { fontStorage } from '@/src/lib/fonts/fontStorage';
import { createDefaultGlyphContours } from '@/src/lib/fonts/defaultFont';
import { EditorTopBar } from '@/src/components/editor/EditorTopBar';
import { EditorToolbar } from '@/src/components/editor/EditorToolbar';
import { GlyphCanvas } from '@/src/components/editor/GlyphCanvas';
import { GlyphBrowser } from '@/src/components/editor/GlyphBrowser';
import { GlyphInspector } from '@/src/components/editor/GlyphInspector';
import { FontPreviewDrawer } from '@/src/components/editor/FontPreviewDrawer';
import { ExportDialog } from '@/src/components/editor/ExportDialog';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Monitor } from 'lucide-react';

interface EditorPageProps {
  fontId: string;
  onNavigate: (path: string) => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({ fontId, onNavigate }) => {
  const [project, setProject] = useState<FontProject | null>(null);
  const [selectedChar, setSelectedChar] = useState<string>('A');
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Viewport transforms
  const [zoom, setZoom] = useState<number>(0.42);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // Modals & Panels
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // History stack for Undo/Redo
  const [history, setHistory] = useState<FontProject[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const { toast } = useToast();

  // Load project on mount or ID change
  useEffect(() => {
    const loaded = fontStorage.getProjectById(fontId);
    if (loaded) {
      setProject(loaded);
      setHistory([JSON.parse(JSON.stringify(loaded))]);
      setHistoryIndex(0);
    } else {
      toast({ type: 'error', title: 'Font not found', description: 'Returning to dashboard' });
      onNavigate('/dashboard');
    }
  }, [fontId]);

  // Push new state to history
  const pushStateToHistory = (newProject: FontProject) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, JSON.parse(JSON.stringify(newProject))];
    });
    setHistoryIndex((prev) => prev + 1);
    setIsDirty(true);
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      const targetState = history[newIdx];
      setProject(JSON.parse(JSON.stringify(targetState)));
      setHistoryIndex(newIdx);
      setIsDirty(true);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      const targetState = history[newIdx];
      setProject(JSON.parse(JSON.stringify(targetState)));
      setHistoryIndex(newIdx);
      setIsDirty(true);
    }
  }, [history, historyIndex]);

  const handleSave = useCallback(() => {
    if (!project) return;
    fontStorage.saveProject(project);
    setIsDirty(false);
    toast({
      type: 'success',
      title: 'Font Saved',
      description: `${project.family} saved to local foundry.`,
    });
  }, [project, toast]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user typing in input
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
          handleDeleteSelectedPoint();
          break;
        case 'escape':
          setSelectedPointId(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleUndo, handleRedo]);

  if (!project) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center text-xs text-neutral-400">
        Loading font workspace...
      </div>
    );
  }

  // Active glyph
  const activeGlyph: GlyphData = project.glyphs[selectedChar] || {
    unicode: selectedChar.charCodeAt(0),
    name: `uni${selectedChar.charCodeAt(0).toString(16)}`,
    char: selectedChar,
    advanceWidth: 600,
    leftSideBearing: 40,
    contours: [],
    hasCustomPath: false,
  };

  // Find currently selected point across contours
  let currentSelectedPoint = null;
  if (selectedPointId && activeGlyph.contours) {
    for (const contour of activeGlyph.contours) {
      const pt = contour.points?.find((p) => p.id === selectedPointId);
      if (pt) {
        currentSelectedPoint = pt;
        break;
      }
    }
  }

  const handleUpdateGlyphContours = (contours: PathContour[]) => {
    const updatedProject: FontProject = {
      ...project,
      glyphs: {
        ...project.glyphs,
        [selectedChar]: {
          ...activeGlyph,
          contours,
          hasCustomPath: true,
        },
      },
    };
    setProject(updatedProject);
    pushStateToHistory(updatedProject);
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

  const handleDeleteSelectedPoint = () => {
    if (!selectedPointId) return;
    const newContours = activeGlyph.contours
      .map((c) => ({
        ...c,
        points: c.points.filter((p) => p.id !== selectedPointId),
      }))
      .filter((c) => c.points.length > 0);

    handleUpdateGlyphContours(newContours);
    setSelectedPointId(null);
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
    setSelectedPointId(null);
    toast({ type: 'info', title: `Reset ${selectedChar} to standard geometry` });
  };

  const handleClearGlyph = () => {
    handleUpdateGlyphContours([]);
    setSelectedPointId(null);
    toast({ type: 'info', title: `Cleared outlines for ${selectedChar}` });
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
    handleUpdateGlyphContours(newContours);
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

  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden font-sans">
      {/* Small Screen Fallback (Desktop-First Tool as required) */}
      <div className="md:hidden fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Monitor className="w-8 h-8 text-neutral-400 stroke-1" />
        <div className="space-y-1">
          <h2 className="font-mono text-sm tracking-wider uppercase font-semibold text-neutral-100">
            GlyphWorks Editor
          </h2>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
            The font editor is designed for larger screens.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onNavigate('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>

      {/* Editor Top Bar */}
      <EditorTopBar
        project={project}
        onUpdateProjectName={(name) => {
          const updated = { ...project, name, family: name };
          setProject(updated);
          pushStateToHistory(updated);
        }}
        onSave={handleSave}
        onExport={() => setIsExportOpen(true)}
        onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
        isPreviewOpen={isPreviewOpen}
        onBackToDashboard={() => onNavigate('/dashboard')}
        isDirty={isDirty}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(2.5, z * 1.25))}
        onZoomOut={() => setZoom((z) => Math.max(0.15, z * 0.8))}
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
          onDeleteSelectedPoint={handleDeleteSelectedPoint}
          hasSelectedPoint={!!selectedPointId}
          onClearGlyph={handleClearGlyph}
          onResetGlyphTemplate={handleResetGlyphTemplate}
        />

        <GlyphCanvas
          glyph={activeGlyph}
          metrics={project.metrics}
          activeTool={activeTool}
          zoom={zoom}
          panX={panX}
          panY={panY}
          onUpdatePan={(px, py) => {
            setPanX(px);
            setPanY(py);
          }}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          selectedPointId={selectedPointId}
          onSelectPoint={(id) => setSelectedPointId(id)}
          onUpdateGlyphContours={handleUpdateGlyphContours}
          onUpdateMetricsBearing={handleUpdateMetricsBearing}
        />

        <GlyphInspector
          glyph={activeGlyph}
          metrics={project.metrics}
          selectedPoint={currentSelectedPoint}
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
            handleUpdateGlyphContours(newContours);
          }}
          onDeleteContour={(contourId) => {
            const newContours = activeGlyph.contours.filter((c) => c.id !== contourId);
            handleUpdateGlyphContours(newContours);
          }}
        />
      </div>

      {/* Glyph Browser Strip at Bottom */}
      <GlyphBrowser
        glyphs={project.glyphs}
        selectedChar={selectedChar}
        onSelectChar={(char) => {
          setSelectedChar(char);
          setSelectedPointId(null);
        }}
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
    </div>
  );
};
