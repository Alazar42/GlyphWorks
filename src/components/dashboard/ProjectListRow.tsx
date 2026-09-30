import React from 'react';
import { FontProject } from '@/src/types/font';
import { MoreHorizontal, Trash2, Copy, Edit3, Download, Layers } from 'lucide-react';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { generateGlyphSvgPath } from '@/src/lib/fonts/fontConverter';
import { detectFontPrimaryLanguage } from '@/src/lib/fonts/languagePresets';

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
  const typeCount = project.types && project.types.length > 0 ? project.types.length : 1;
  const isFamily = project.isFamily || typeCount > 1;

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

  // Language & showcase character detection
  const langInfo = React.useMemo(() => {
    return detectFontPrimaryLanguage(project.glyphs, project.primaryScript);
  }, [project.glyphs, project.primaryScript]);

  const isColor = Boolean(project.isColorFont || langInfo.isColorFont);
  const primaryScript = project.primaryScript || langInfo.primaryScript || langInfo.script;

  const isNonLatin = primaryScript && primaryScript !== 'Latin';
  const showcase = langInfo.showcaseGlyphs.length > 0
    ? langInfo.showcaseGlyphs
    : (isNonLatin ? [] : [project.glyphs['A'], project.glyphs['a']].filter(Boolean));

  const glyph1 = showcase[0];
  const glyph2 = showcase[1];
  const path1 = glyph1 ? generateGlyphSvgPath(glyph1) : '';
  const path2 = glyph2 ? generateGlyphSvgPath(glyph2) : '';
  const hasRealGlyph = path1.length > 0 || path2.length > 0;
  const hasPath2 = Boolean(path2 && path2.length > 0);

  const ascender = project.metrics?.ascender || 800;
  const descender = project.metrics?.descender || -200;
  const totalH = Math.max(ascender - descender, 600);
  const adv1 = glyph1?.advanceWidth || 600;
  const adv2 = glyph2?.advanceWidth || 500;
  const spacingBetween = Math.round((project.metrics?.unitsPerEm || 1000) * 0.04);
  const totalWidth = hasPath2 ? adv1 + spacingBetween + adv2 : adv1;

  return (
    <div
      onClick={() => onOpen(project.id)}
      className="group flex items-center justify-between py-3 px-4 border-b border-neutral-900 hover:bg-neutral-900/50 transition-colors cursor-pointer text-xs select-none"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-7 flex items-center justify-center text-neutral-300 group-hover:text-white shrink-0">
          {hasRealGlyph ? (
            <svg
              viewBox={`0 0 ${totalWidth} ${totalH}`}
              className="h-6 w-auto overflow-visible"
            >
              <g transform={`translate(0, ${ascender}) scale(1, -1)`}>
                {path1 && (
                  <path
                    d={path1}
                    fill={glyph1?.color || (isColor ? '#38bdf8' : 'currentColor')}
                    fillRule="nonzero"
                  />
                )}
                {hasPath2 && (
                  <g transform={`translate(${adv1 + spacingBetween}, 0)`}>
                    <path
                      d={path2}
                      fill={glyph2?.color || (isColor ? '#ec4899' : 'currentColor')}
                      fillRule="nonzero"
                    />
                  </g>
                )}
              </g>
            </svg>
          ) : (
            <span className="font-mono text-sm text-neutral-400">
              {langInfo.sampleChars || (isNonLatin ? '' : 'Aa')}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-neutral-100 truncate text-xs">
              {project.family}
            </p>
            {isFamily && typeCount > 1 ? (
              <span className="text-[10px] font-mono bg-sky-950/80 border border-sky-800/80 text-sky-300 px-1.5 py-0.2 rounded-full font-semibold flex items-center gap-1">
                <Layers className="w-2.5 h-2.5" />
                [{typeCount} types]
              </span>
            ) : (
              <span className="text-neutral-400 font-mono text-[10px]">({project.style})</span>
            )}
            {primaryScript && primaryScript !== 'Latin' && (
              <span className="text-[9px] font-mono bg-amber-950/60 border border-amber-800/60 text-amber-300 px-1 py-0.1 rounded-xs">
                {primaryScript}
              </span>
            )}
            {isColor && (
              <span className="text-[9px] font-mono bg-purple-950/60 border border-purple-800/60 text-purple-300 px-1 py-0.1 rounded-xs">
                Color
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 font-mono truncate">
            {isFamily && project.types && project.types.length > 1
              ? project.types.map((t) => t.name).join(' · ')
              : `Weight ${project.weight} · ${project.width}`}
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
                className="text-neutral-500 hover:text-neutral-200 p-1 cursor-pointer"
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
