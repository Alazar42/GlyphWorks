import React, { useState, useEffect, useMemo } from 'react';
import { FontProject } from '@/src/types/font';
import { generateGlyphSvgPath } from '@/src/lib/fonts/fontConverter';
import {
  detectFontPrimaryLanguage,
  getLanguageProofSampleText,
  LANGUAGE_PROOF_PRESETS,
} from '@/src/lib/fonts/languagePresets';
import { X, RotateCcw, Languages } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface FontPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: FontProject;
}

export const FontPreviewDrawer: React.FC<FontPreviewDrawerProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [fontSize, setFontSize] = useState(48);
  const [spacing, setSpacing] = useState(0);

  const langInfo = useMemo(() => {
    return detectFontPrimaryLanguage(project.glyphs, project.primaryScript);
  }, [project.glyphs, project.primaryScript]);

  const activeScript = project.primaryScript || langInfo.primaryScript || langInfo.script;

  const [sampleText, setSampleText] = useState(() => getLanguageProofSampleText(activeScript));

  // Sync sample text whenever drawer opens or active font changes
  useEffect(() => {
    if (isOpen) {
      setSampleText(getLanguageProofSampleText(activeScript));
    }
  }, [isOpen, project.id, activeScript]);

  if (!isOpen) return null;

  const upm = project.metrics?.unitsPerEm || 1000;
  const ascender = project.metrics?.ascender || 800;
  const descender = project.metrics?.descender || -200;
  const totalH = ascender - descender;
  const fontScale = fontSize / upm;
  const charHeightPx = totalH * fontScale;

  // Render a single character using the project's real vector contours if available
  const renderGlyph = (char: string) => {
    if (char === '\n') return <br />;
    if (char === ' ') {
      return (
        <span
          style={{
            display: 'inline-block',
            width: `${fontSize * 0.3}px`,
            height: `${charHeightPx}px`,
          }}
        >
          &nbsp;
        </span>
      );
    }

    const glyphData = project.glyphs[char];
    const glyphColor = glyphData?.color || glyphData?.contours?.find((c) => c.color)?.color || 'currentColor';
    if (!glyphData || !glyphData.contours || glyphData.contours.length === 0) {
      return (
        <span
          style={{
            letterSpacing: `${spacing}px`,
            fontFamily: 'system-ui, sans-serif',
            height: `${charHeightPx}px`,
            display: 'inline-flex',
            alignItems: 'center',
            color: glyphColor !== 'currentColor' ? glyphColor : undefined,
          }}
        >
          {char}
        </span>
      );
    }

    const adv = glyphData.advanceWidth || 600;
    const charWidthPx = adv * fontScale;
    const d = generateGlyphSvgPath(glyphData);

    return (
      <span
        style={{
          display: 'inline-block',
          width: `${charWidthPx + spacing}px`,
          height: `${charHeightPx}px`,
          verticalAlign: 'baseline',
          marginRight: `${spacing}px`,
          flexShrink: 0,
        }}
        title={`${char} (${adv} units)`}
      >
        <svg
          viewBox={`0 0 ${adv} ${totalH}`}
          style={{
            width: `${charWidthPx}px`,
            height: `${charHeightPx}px`,
            display: 'block',
          }}
        >
          <g transform={`translate(0, ${ascender}) scale(1, -1)`}>
            <path d={d} fill={glyphColor} fillRule="nonzero" />
          </g>
        </svg>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-4xl h-[85vh] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col text-neutral-900 dark:text-neutral-100 shadow-2xl rounded-lg overflow-hidden">
        {/* Top Header */}
        <div className="h-12 border-b border-neutral-200 dark:border-neutral-900 px-4 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-950">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold">
              Font Proof
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
              {project.family} {project.style}
            </span>
            {activeScript && (
              <span className="text-[10px] font-mono bg-amber-500/10 dark:bg-amber-950/60 border border-amber-500/30 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-xs font-medium">
                {activeScript}
              </span>
            )}
          </div>

          {/* Controls: Size, Spacing */}
          <div className="flex items-center gap-6 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono">Size</span>
              <input
                type="range"
                min="18"
                max="144"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-24 accent-sky-500 dark:accent-neutral-100 cursor-pointer"
              />
              <span className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200 w-8">{fontSize}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono">Spacing</span>
              <input
                type="range"
                min="-4"
                max="24"
                value={spacing}
                onChange={(e) => setSpacing(parseInt(e.target.value, 10))}
                className="w-20 accent-sky-500 dark:accent-neutral-100 cursor-pointer"
              />
              <span className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200 w-6">{spacing}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Scrollable Stage */}
        <div className="flex-1 p-8 overflow-y-auto select-text bg-neutral-50/40 dark:bg-neutral-950/60">
          <div
            className="leading-relaxed text-neutral-900 dark:text-neutral-100"
            style={{ fontSize: `${fontSize}px` }}
          >
            {sampleText.split('\n').map((line, lineIdx) => (
              <div
                key={lineIdx}
                className="flex items-baseline flex-wrap my-2"
                style={{ minHeight: `${charHeightPx}px` }}
              >
                {line.length === 0 ? (
                  <div style={{ height: `${fontSize * 0.5}px` }} />
                ) : (
                  line.split('').map((c, charIdx) => (
                    <React.Fragment key={charIdx}>
                      {renderGlyph(c)}
                    </React.Fragment>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom editable sample input and language presets */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-900 bg-neutral-100/60 dark:bg-neutral-900/40 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-500 shrink-0">Presets:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setSampleText(getLanguageProofSampleText(activeScript))}
                className="px-2 py-0.5 text-[10px] font-mono rounded-xs border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300 hover:bg-sky-500/20 transition-colors cursor-pointer"
              >
                {activeScript} Sample
              </button>
              {Object.entries(LANGUAGE_PROOF_PRESETS).map(([key, preset]) => {
                if (preset.name === activeScript || key === activeScript) return null;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSampleText(preset.sample)}
                    className="px-2 py-0.5 text-[10px] font-mono rounded-xs border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer shrink-0"
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-neutral-500 shrink-0">Test String:</span>
            <input
              type="text"
              value={sampleText.replace(/\n+/g, ' ')}
              onChange={(e) => setSampleText(e.target.value)}
              className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-200 px-3 py-1.5 outline-none font-mono rounded-xs focus:border-sky-500"
              placeholder="Type custom text to preview glyphs..."
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSampleText(getLanguageProofSampleText(activeScript))}
              title={`Reset to ${activeScript} default proof sample`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
