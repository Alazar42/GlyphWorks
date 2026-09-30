import React from 'react';
import { FontProject } from '@/src/types/font';
import { MoreHorizontal, Trash2, Copy, Edit3, Download, Layers } from 'lucide-react';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { generateGlyphSvgPath } from '@/src/lib/fonts/fontConverter';

interface ProjectCardProps {
  project: FontProject;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (project: FontProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpen,
  onDuplicate,
  onDelete,
  onExport,
}) => {
  const glyphCount = Object.keys(project.glyphs || {}).length;
  const typeCount = project.types && project.types.length > 0 ? project.types.length : 1;
  const isFamily = project.isFamily || typeCount > 1;

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'today';
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'recently';
    }
  };

  // Real font vector paths for 'A' and 'a'
  const glyphA = project.glyphs['A'];
  const glyphSmallA = project.glyphs['a'];
  const pathA = generateGlyphSvgPath(glyphA);
  const pathSmallA = generateGlyphSvgPath(glyphSmallA);

  const hasRealGlyphAa = pathA.length > 0 || pathSmallA.length > 0;
  const ascender = project.metrics?.ascender || 800;
  const descender = project.metrics?.descender || -200;
  const totalH = ascender - descender;
  const advA = glyphA?.advanceWidth || 600;
  const advSmallA = glyphSmallA?.advanceWidth || 500;
  const spacingBetween = Math.round((project.metrics?.unitsPerEm || 1000) * 0.05);
  const totalWidth = advA + spacingBetween + advSmallA;

  return (
    <div
      onClick={() => onOpen(project.id)}
      className="group relative border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-700 transition-all p-5 flex flex-col justify-between h-52 cursor-pointer select-none rounded-xs shadow-xs"
    >
      {/* Top Preview Glyphs using the real font's curves */}
      <div className="flex items-start justify-between">
        <div className="h-14 flex items-center text-neutral-300 group-hover:text-white transition-colors">
          {hasRealGlyphAa ? (
            <svg
              viewBox={`0 0 ${totalWidth} ${totalH}`}
              className="h-11 w-auto max-w-[140px] overflow-visible"
            >
              <g transform={`translate(0, ${ascender}) scale(1, -1)`}>
                {pathA && <path d={pathA} fill="currentColor" fillRule="nonzero" />}
                {pathSmallA && (
                  <g transform={`translate(${advA + spacingBetween}, 0)`}>
                    <path d={pathSmallA} fill="currentColor" fillRule="nonzero" />
                  </g>
                )}
              </g>
            </svg>
          ) : (
            <span className="font-sans text-3xl font-light tracking-tight">
              Aa
            </span>
          )}
        </div>

        {/* Dropdown Menu */}
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button
                className="text-neutral-500 hover:text-neutral-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Project actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
            items={[
              {
                id: 'edit',
                label: 'Open Editor',
                icon: <Edit3 className="w-3.5 h-3.5" />,
                onClick: () => onOpen(project.id),
              },
              {
                id: 'duplicate',
                label: 'Duplicate',
                icon: <Copy className="w-3.5 h-3.5" />,
                onClick: () => onDuplicate(project.id),
              },
              {
                id: 'export',
                label: 'Export Font',
                icon: <Download className="w-3.5 h-3.5" />,
                onClick: () => onExport(project),
              },
              { type: 'separator' },
              {
                id: 'delete',
                label: 'Delete Project',
                icon: <Trash2 className="w-3.5 h-3.5" />,
                destructive: true,
                onClick: () => onDelete(project.id),
              },
            ]}
          />
        </div>
      </div>

      {/* Font Info & Tag [number] types */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-neutral-100 truncate">
            {project.family}
          </h3>

          {/* Requested Tag: [number] types */}
          {isFamily && typeCount > 1 ? (
            <span className="text-[10px] font-mono bg-sky-950/80 border border-sky-800/80 text-sky-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shadow-xs">
              <Layers className="w-3 h-3 text-sky-400" />
              [{typeCount} types]
            </span>
          ) : (
            <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-1.5 py-0.2 rounded-xs">
              {project.style}
            </span>
          )}
        </div>

        {isFamily && project.types && project.types.length > 1 ? (
          <p className="text-[11px] text-neutral-400 font-mono truncate" title={project.types.map(t => t.name).join(', ')}>
            {project.types.map(t => t.name).slice(0, 4).join(', ')}{project.types.length > 4 ? ` +${project.types.length - 4} more` : ''} · {glyphCount} glyphs
          </p>
        ) : (
          <p className="text-xs text-neutral-400 font-mono">
            {project.style} · Weight {project.weight} · {glyphCount} glyphs
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
        <span>Edited {formatRelativeTime(project.updatedAt)}</span>
        <span className="font-mono text-[10px] text-neutral-500">{project.metrics?.unitsPerEm || 1000} UPM</span>
      </div>
    </div>
  );
};
