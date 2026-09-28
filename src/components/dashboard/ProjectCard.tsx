import React from 'react';
import { FontProject } from '@/src/types/font';
import { MoreHorizontal, Trash2, Copy, Edit3, Download } from 'lucide-react';
import { Dropdown } from '@/src/components/ui/Dropdown';

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

  return (
    <div
      onClick={() => onOpen(project.id)}
      className="group relative border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-700 transition-colors p-5 flex flex-col justify-between h-48 cursor-pointer select-none"
    >
      {/* Top Preview Glyphs */}
      <div className="flex items-start justify-between">
        <div className="font-sans text-3xl font-light tracking-tight text-neutral-300 group-hover:text-neutral-100 transition-colors">
          Aa
        </div>

        {/* Dropdown Menu */}
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button
                className="text-neutral-500 hover:text-neutral-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* Font Info */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-neutral-100 truncate">
          {project.name || project.family}
        </h3>
        <p className="text-xs text-neutral-400">
          {project.style} · {glyphCount} glyphs
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
        <span>Edited {formatRelativeTime(project.updatedAt)}</span>
        <span className="font-mono text-[10px] text-neutral-600">{project.metrics.unitsPerEm} UPM</span>
      </div>
    </div>
  );
};
