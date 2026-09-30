import React from 'react';
import { EditorTool } from '@/src/types/font';
import { Tooltip } from '@/src/components/ui/Tooltip';
import {
  MousePointer2,
  Waypoints,
  PenTool,
  Paintbrush,
  Spline,
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
  brushSize: number;
  onChangeBrushSize: (size: number) => void;
  onDeleteSelectedPoints: () => void;
  hasSelectedPoints: boolean;
  onClearGlyph: () => void;
  onResetGlyphTemplate: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeTool,
  onSelectTool,
  brushSize,
  onChangeBrushSize,
  onDeleteSelectedPoints,
  hasSelectedPoints,
  onClearGlyph,
  onResetGlyphTemplate,
}) => {
  const tools: { id: EditorTool; label: string; shortcut: string; icon: React.ReactNode }[] = [
    { id: 'select', label: 'Select / Move Objects (V)', shortcut: 'V', icon: <MousePointer2 className="w-4 h-4" /> },
    { id: 'node', label: 'Direct Node Selection (A)', shortcut: 'A', icon: <Waypoints className="w-4 h-4" /> },
    { id: 'pen', label: 'Bezier Pen Tool (P)', shortcut: 'P', icon: <PenTool className="w-4 h-4" /> },
    { id: 'brush', label: 'Free Pen / Brush Tool (B)', shortcut: 'B', icon: <Paintbrush className="w-4 h-4" /> },
    { id: 'arc', label: 'Arc / Curvature Tool (C)', shortcut: 'C', icon: <Spline className="w-4 h-4" /> },
    { id: 'line', label: 'Line Segment (L)', shortcut: 'L', icon: <Minus className="w-4 h-4" /> },
    { id: 'rectangle', label: 'Rectangle Primitive (R)', shortcut: 'R', icon: <Square className="w-4 h-4" /> },
    { id: 'ellipse', label: 'Ellipse Primitive (O)', shortcut: 'O', icon: <Circle className="w-4 h-4" /> },
    { id: 'pan', label: 'Pan Canvas (Spacebar / H)', shortcut: 'H', icon: <Hand className="w-4 h-4" /> },
    { id: 'measure', label: 'Metrics Ruler (M)', shortcut: 'M', icon: <Ruler className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-12 border-r border-neutral-900 bg-neutral-950 flex flex-col items-center py-2.5 justify-between shrink-0 select-none z-20">
      {/* Primary Drawing Tools */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <Tooltip key={t.id} content={t.label} shortcut={t.shortcut} side="right">
              <button
                onClick={() => onSelectTool(t.id)}
                className={`w-8 h-8 flex items-center justify-center transition-colors cursor-pointer rounded-xs ${
                  isActive
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900'
                }`}
                aria-label={t.label}
              >
                {t.icon}
              </button>
            </Tooltip>
          );
        })}

        {/* Brush Size Quick Adjust when Brush is active */}
        {activeTool === 'brush' && (
          <div className="mt-2 pt-2 border-t border-neutral-900 flex flex-col items-center gap-1 w-full px-1">
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-tighter">Size</span>
            <input
              type="range"
              min="4"
              max="96"
              step="2"
              value={brushSize}
              onChange={(e) => onChangeBrushSize(parseInt(e.target.value, 10))}
              className="w-10 accent-neutral-100 cursor-pointer"
              title={`Brush Size: ${brushSize}px`}
            />
            <span className="text-[9px] font-mono text-neutral-300 font-semibold">{brushSize}px</span>
          </div>
        )}
      </div>

      {/* Action Buttons at bottom */}
      <div className="flex flex-col items-center gap-1.5 w-full pt-2.5 border-t border-neutral-900">
        <Tooltip content="Delete Selected Nodes" shortcut="Del" side="right">
          <button
            onClick={onDeleteSelectedPoints}
            disabled={!hasSelectedPoints}
            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-rose-400 disabled:opacity-20 disabled:pointer-events-none transition-colors rounded-xs"
            aria-label="Delete selected points"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Reset to Geometric Template" side="right">
          <button
            onClick={onResetGlyphTemplate}
            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-200 transition-colors rounded-xs"
            aria-label="Reset glyph outline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Clear Glyph Outline" side="right">
          <button
            onClick={onClearGlyph}
            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-rose-400 transition-colors rounded-xs"
            aria-label="Clear glyph"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};
