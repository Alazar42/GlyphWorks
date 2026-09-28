import React from 'react';
import { FontProject } from '@/src/types/font';
import { MoreHorizontal, Trash2, Copy, Edit3, Download } from 'lucide-react';
import { Dropdown } from '@/src/components/ui/Dropdown';

interface ProjectListRowProps {
  project: FontProject;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (project: FontProject) => void;
}

export const ProjectListRow: React.FC<ProjectListRowProps> = ({
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
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'recently';
    }
  };

  return (
    <div
      onClick={() => onOpen(project.id)}
      className="group flex items-center justify-between py-3 px-4 border-b border-neutral-900 hover:bg-neutral-900/50 transition-colors cursor-pointer text-xs select-none"
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className="font-mono text-base text-neutral-400 w-8 text-center shrink-0">
          Aa
        </span>
        <div className="min-w-0">
          <p className="font-medium text-neutral-100 truncate text-xs">
            {project.name || project.family}
          </p>
          <p className="text-[11px] text-neutral-500">
            {project.style} · {project.weight}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0 text-neutral-500 text-[11px]">
        <span className="hidden sm:inline font-mono">{glyphCount} glyphs</span>
        <span className="font-mono">Edited {formatRelativeTime(project.updatedAt)}</span>

        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button
                className="text-neutral-500 hover:text-neutral-200 p-1"
                aria-label="Actions"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
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
    </div>
  );
};
