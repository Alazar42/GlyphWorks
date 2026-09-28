import React from 'react';
import { EditorTool } from '@/src/types/font';
import { Tooltip } from '@/src/components/ui/Tooltip';
import {
  MousePointer2,
  Waypoints,
  PenTool,
  Minus,
  Square,
  Circle,
  Hand,
  Ruler,
  Trash2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface EditorToolbarProps {
  activeTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
  onDeleteSelectedPoint: () => void;
  hasSelectedPoint: boolean;
  onClearGlyph: () => void;
  onResetGlyphTemplate: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeTool,
  onSelectTool,
  onDeleteSelectedPoint,
  hasSelectedPoint,
  onClearGlyph,
  onResetGlyphTemplate,
}) => {
  const tools: { id: EditorTool; label: string; shortcut: string; icon: React.ReactNode }[] = [
    { id: 'select', label: 'Select Object', shortcut: 'V', icon: <MousePointer2 className="w-4 h-4" /> },
    { id: 'node', label: 'Edit Nodes / Anchors', shortcut: 'A', icon: <Waypoints className="w-4 h-4" /> },
    { id: 'pen', label: 'Pen Tool', shortcut: 'P', icon: <PenTool className="w-4 h-4" /> },
    { id: 'line', label: 'Line Segment', shortcut: 'L', icon: <Minus className="w-4 h-4" /> },
    { id: 'rectangle', label: 'Rectangle Primitive', shortcut: 'R', icon: <Square className="w-4 h-4" /> },
    { id: 'ellipse', label: 'Ellipse Primitive', shortcut: 'O', icon: <Circle className="w-4 h-4" /> },
    { id: 'pan', label: 'Pan Canvas', shortcut: 'H', icon: <Hand className="w-4 h-4" /> },
    { id: 'measure', label: 'Metrics & Spacing Ruler', shortcut: 'M', icon: <Ruler className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-10 border-r border-neutral-900 bg-neutral-950 flex flex-col items-center py-2 justify-between shrink-0 select-none z-20">
      {/* Primary Drawing Tools */}
      <div className="flex flex-col items-center gap-1 w-full">
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <Tooltip key={t.id} content={t.label} shortcut={t.shortcut} side="right">
              <button
                onClick={() => onSelectTool(t.id)}
                className={`w-7 h-7 flex items-center justify-center transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-neutral-800 text-neutral-100'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900'
                }`}
                aria-label={t.label}
              >
                {t.icon}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Quick Contour / Action Tools */}
      <div className="flex flex-col items-center gap-1 w-full pt-2 border-t border-neutral-900">
        <Tooltip content="Delete Selected Node" shortcut="Del" side="right">
          <button
            onClick={onDeleteSelectedPoint}
            disabled={!hasSelectedPoint}
            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-rose-400 disabled:opacity-20 disabled:pointer-events-none transition-colors"
            aria-label="Delete point"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Reset to Geometric Template" side="right">
          <button
            onClick={onResetGlyphTemplate}
            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-200 transition-colors"
            aria-label="Reset glyph outline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Clear Glyph Outline" side="right">
          <button
            onClick={onClearGlyph}
            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-rose-400 transition-colors"
            aria-label="Clear glyph"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};
