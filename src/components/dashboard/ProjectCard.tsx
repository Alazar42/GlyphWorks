import React from 'react';
import { FontProject } from '@/src/types/font';
import { MoreHorizontal, Trash2, Copy, Edit3, Download, Layers } from 'lucide-react';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { generateGlyphSvgPath } from '@/src/lib/fonts/fontConverter';
import { detectFontPrimaryLanguage } from '@/src/lib/fonts/languagePresets';

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

  // Language & showcase character detection
  const langInfo = React.useMemo(() => {
    return detectFontPrimaryLanguage(project.glyphs, project.primaryScript);
  }, [project.glyphs, project.primaryScript]);

  const isColor = Boolean(project.isColorFont || langInfo.isColorFont);
  const primaryScript = project.primaryScript || langInfo.primaryScript || langInfo.script;

  // Real font vector paths for detected showcase glyphs (e.g. 永, 和 for Chinese, ሀ, ለ for Ethiopic, Aa for Latin)
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
  const spacingBetween = Math.round((project.metrics?.unitsPerEm || 1000) * 0.05);
  const totalWidth = hasPath2 ? adv1 + spacingBetween + adv2 : adv1;

  return (
    <div
      onClick={() => onOpen(project.id)}
      className="group relative border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-700 transition-all p-5 flex flex-col justify-between h-52 cursor-pointer select-none rounded-xs shadow-xs"
    >
      {/* Top Preview Glyphs using the real font's curves */}
      <div className="flex items-start justify-between">
        <div className="h-14 flex items-center text-neutral-300 group-hover:text-white transition-colors">
          {hasRealGlyph ? (
            <svg
              viewBox={`0 0 ${totalWidth} ${totalH}`}
              className="h-11 w-auto max-w-[140px] overflow-visible"
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
            <span className="font-sans text-3xl font-light tracking-tight">
              {langInfo.sampleChars || (isNonLatin ? '' : 'Aa')}
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
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.2 rounded-xs">
              {project.style}
            </span>
          )}

          {primaryScript && primaryScript !== 'Latin' && (
            <span className="text-[10px] font-mono bg-amber-950/60 border border-amber-800/60 text-amber-300 px-1.5 py-0.2 rounded-xs">
              {primaryScript}
            </span>
          )}

          {isColor && (
            <span className="text-[10px] font-mono bg-purple-950/60 border border-purple-800/60 text-purple-300 px-1.5 py-0.2 rounded-xs">
              Color
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
