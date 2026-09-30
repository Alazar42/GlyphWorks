import React, { useState, useMemo, useEffect } from 'react';
import { GlyphData } from '@/src/types/font';
import { Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { detectCharacterScript } from '@/src/lib/fonts/languagePresets';

interface GlyphBrowserProps {
  glyphs: Record<string, GlyphData>;
  selectedChar: string;
  onSelectChar: (char: string) => void;
  onOpenAddLanguage?: () => void;
}

const PAGE_SIZE = 100;

export const GlyphBrowser: React.FC<GlyphBrowserProps> = ({
  glyphs,
  selectedChar,
  onSelectChar,
  onOpenAddLanguage,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'upper' | 'lower' | 'num' | 'punct'>('all');
  const [filterScript, setFilterScript] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const allGlyphs = useMemo(() => Object.values(glyphs), [glyphs]);

  // Discover all scripts currently present in the font (optimized sampling for mega-fonts)
  const availableScripts = useMemo(() => {
    const scripts = new Set<string>();
    const total = allGlyphs.length;
    const step = total > 2000 ? Math.floor(total / 1500) : 1;
    for (let i = 0; i < total; i += step) {
      scripts.add(detectCharacterScript(allGlyphs[i].char));
    }
    // Always include selected character script
    scripts.add(detectCharacterScript(selectedChar));
    return Array.from(scripts).sort();
  }, [allGlyphs, selectedChar]);

  const filteredGlyphs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allGlyphs.filter((g) => {
      if (query) {
        const matchChar = g.char.toLowerCase().includes(query);
        const matchName = g.name.toLowerCase().includes(query);
        const matchHex = g.unicode.toString(16).toLowerCase().includes(query);
        if (!matchChar && !matchName && !matchHex) return false;
      }

      if (filterScript !== 'all') {
        const script = detectCharacterScript(g.char);
        if (script !== filterScript) return false;
      }

      if (filterCategory === 'upper') {
        return g.char.toUpperCase() === g.char && g.char.toLowerCase() !== g.char;
      }
      if (filterCategory === 'lower') {
        return g.char.toLowerCase() === g.char && g.char.toUpperCase() !== g.char;
      }
      if (filterCategory === 'num') {
        return /\d/.test(g.char) || (g.unicode >= 0x0030 && g.unicode <= 0x0039);
      }
      if (filterCategory === 'punct') {
        return !(/\p{L}|\p{N}/u.test(g.char));
      }

      return true;
    });
  }, [allGlyphs, searchQuery, filterScript, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredGlyphs.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(0, currentPage), totalPages - 1);

  // Automatically sync page index when selectedChar changes so the active glyph is in the current page
  useEffect(() => {
    const idx = filteredGlyphs.findIndex((g) => g.char === selectedChar);
    if (idx !== -1) {
      const targetPage = Math.floor(idx / PAGE_SIZE);
      if (targetPage !== safePage) {
        setCurrentPage(targetPage);
      }
    }
  }, [selectedChar, filteredGlyphs]);

  // Reset page to 0 when search query or category/script filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, filterScript, filterCategory]);

  // Windowed slice of glyphs: DOM will only ever render PAGE_SIZE items (zero freezing)
  const visibleGlyphs = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filteredGlyphs.slice(start, start + PAGE_SIZE);
  }, [filteredGlyphs, safePage]);

  return (
    <footer className="h-12 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center px-3 gap-2 shrink-0 select-none z-20 shadow-xs">
      {/* Add Language / Glyphs CTA */}
      {onOpenAddLanguage && (
        <button
          onClick={onOpenAddLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/70 dark:hover:bg-sky-900/60 border border-sky-300 dark:border-sky-600/70 text-sky-700 dark:text-sky-200 text-[11px] font-mono rounded-xs transition-all cursor-pointer shrink-0 shadow-xs"
          title="Add language scripts, accented characters, or custom glyphs"
        >
          <Globe className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
          <span>+ Add Language</span>
        </button>
      )}

      {/* Script Filter Dropdown (when multiple scripts exist) */}
      {availableScripts.length > 1 && (
        <div className="flex items-center shrink-0">
          <select
            value={filterScript}
            onChange={(e) => setFilterScript(e.target.value)}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 focus:border-sky-500 text-[11px] text-neutral-800 dark:text-neutral-200 font-mono py-1 px-2 rounded-xs outline-none cursor-pointer transition-colors shadow-xs"
            title="Filter by script / alphabet"
          >
            <option value="all">All Scripts ({allGlyphs.length})</option>
            {availableScripts.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category Tabs - lighter visible border with clear active highlight */}
      <div className="hidden sm:flex items-center gap-0.5 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900/80 p-0.5 rounded-xs shadow-xs shrink-0">
        {[
          { id: 'all', label: 'All' },
          { id: 'upper', label: 'Upper' },
          { id: 'lower', label: 'Lower' },
          { id: 'num', label: '0-9' },
          { id: 'punct', label: '&!?' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id as any)}
            className={`px-2 py-0.5 text-[11px] font-mono transition-all rounded-xs cursor-pointer ${
              filterCategory === cat.id
                ? 'bg-white text-neutral-900 dark:bg-neutral-700 dark:text-white font-semibold shadow-xs border border-neutral-200 dark:border-transparent'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quick Search - lighter visible border */}
      <div className="relative w-28 hidden md:block shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter glyphs..."
          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 focus:border-sky-500 text-[11px] px-2.5 py-1 text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-xs transition-colors shadow-xs"
        />
      </div>

      {/* Pagination Controls (when more than 1 page exists) */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900/90 rounded-xs shadow-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="p-0.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white disabled:text-neutral-300 dark:disabled:text-neutral-600 disabled:cursor-not-allowed hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xs transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-neutral-700 dark:text-neutral-300 min-w-[55px] text-center font-medium">
            {safePage + 1}/{totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="p-0.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white disabled:text-neutral-300 dark:disabled:text-neutral-600 disabled:cursor-not-allowed hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xs transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Windowed Glyph Horizontal Strip - only renders PAGE_SIZE items */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto h-full py-1 scrollbar-none">
        {visibleGlyphs.map((g) => {
          const isSelected = g.char === selectedChar;
          const hasContours = g.contours && g.contours.length > 0;
          const glyphColor = g.color || g.contours?.find((c) => c.color)?.color;

          return (
            <button
              key={g.char}
              onClick={() => onSelectChar(g.char)}
              title={`${g.name} (${g.char}) · U+${g.unicode.toString(16).toUpperCase().padStart(4, '0')}${glyphColor ? ` · Color: ${glyphColor}` : ''}`}
              className={`min-w-8 h-8 px-1.5 flex flex-col items-center justify-center font-sans text-xs transition-colors shrink-0 cursor-pointer relative rounded-xs ${
                isSelected
                  ? 'bg-sky-100 dark:bg-neutral-100 text-sky-900 dark:text-neutral-950 font-bold border border-sky-400 dark:border-transparent shadow-xs'
                  : 'text-neutral-700 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <span
                className="leading-none font-medium"
                style={glyphColor ? { color: glyphColor } : undefined}
              >
                {g.char === ' ' ? '␣' : g.char}
              </span>
              {hasContours && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? (glyphColor ? '' : 'bg-sky-700 dark:bg-neutral-900') : glyphColor ? '' : 'bg-neutral-400 dark:bg-neutral-500'
                  }`}
                  style={glyphColor ? { backgroundColor: glyphColor } : undefined}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Counter */}
      <div className="hidden sm:block text-[10px] font-mono text-neutral-500 dark:text-neutral-400 pl-2 border-l border-neutral-200 dark:border-neutral-800 shrink-0">
        {filteredGlyphs.length.toLocaleString()} glyphs
      </div>
    </footer>
  );
};
