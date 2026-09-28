import React, { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { Tooltip } from '@/src/components/ui/Tooltip';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Eye, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Grid, 
  Magnet 
} from 'lucide-react';
import { FontProject } from '@/src/types/font';

interface EditorTopBarProps {
  project: FontProject;
  onUpdateProjectName: (name: string) => void;
  onSave: () => void;
  onExport: () => void;
  onTogglePreview: () => void;
  isPreviewOpen: boolean;
  onBackToDashboard: () => void;
  isDirty: boolean;
  // Canvas controls
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  project,
  onUpdateProjectName,
  onSave,
  onExport,
  onTogglePreview,
  isPreviewOpen,
  onBackToDashboard,
  isDirty,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(project.name || project.family);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (nameValue.trim()) {
      onUpdateProjectName(nameValue.trim());
    } else {
      setNameValue(project.name || project.family);
    }
  };

  return (
    <header className="h-11 border-b border-neutral-900 bg-neutral-950 px-3 flex items-center justify-between text-xs select-none shrink-0 z-30">
      {/* Left: Brand & Project Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToDashboard}
          title="Back to Projects"
          className="text-neutral-500 hover:text-neutral-200 transition-colors p-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        <span className="font-mono text-xs font-semibold tracking-wider uppercase text-neutral-400">
          GlyphWorks
        </span>

        <span className="text-neutral-700">/</span>

        {isEditingName ? (
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameBlur();
              if (e.key === 'Escape') {
                setNameValue(project.name || project.family);
                setIsEditingName(false);
              }
            }}
            autoFocus
            className="bg-neutral-900 border border-neutral-700 px-1.5 py-0.5 text-xs text-neutral-100 font-medium outline-none"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-neutral-200 hover:text-white font-medium transition-colors hover:underline cursor-pointer"
            title="Click to rename"
          >
            {project.name || project.family}
          </button>
        )}

        <span className="text-[10px] text-neutral-500 font-mono">
          {project.style} · {project.weight}
        </span>

        {isDirty && (
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" title="Unsaved changes" />
        )}
      </div>

      {/* Center: Canvas Controls & History */}
      <div className="hidden sm:flex items-center gap-1 border-x border-neutral-900 px-3">
        <Tooltip content="Undo" shortcut="⌘Z">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Redo" shortcut="⌘⇧Z">
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <div className="w-px h-3.5 bg-neutral-800 mx-1" />

        <Tooltip content="Zoom In" shortcut="+">
          <button
            onClick={onZoomIn}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <span className="text-[10px] font-mono text-neutral-500 w-11 text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </span>

        <Tooltip content="Zoom Out" shortcut="-">
          <button
            onClick={onZoomOut}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Reset Zoom & Pan" shortcut="0">
          <button
            onClick={onResetZoom}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <div className="w-px h-3.5 bg-neutral-800 mx-1" />

        <Tooltip content="Toggle Grid" shortcut="G">
          <button
            onClick={onToggleGrid}
            className={`p-1.5 transition-colors ${
              showGrid ? 'text-neutral-100 bg-neutral-900' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Snap to Grid" shortcut="S">
          <button
            onClick={onToggleSnap}
            className={`p-1.5 transition-colors ${
              snapToGrid ? 'text-neutral-100 bg-neutral-900' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Right: Preview, Save & Export */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={isPreviewOpen ? 'secondary' : 'ghost'}
          onClick={onTogglePreview}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          Preview
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onSave}
          title="Save project (⌘S)"
        >
          <Save className="w-3.5 h-3.5 mr-1" />
          Save
        </Button>

        <Button
          size="sm"
          variant="primary"
          onClick={onExport}
        >
          <Download className="w-3.5 h-3.5 mr-1" />
          Export
        </Button>
      </div>
    </header>
  );
};
