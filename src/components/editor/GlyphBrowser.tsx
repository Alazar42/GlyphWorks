import React, { useState } from 'react';
import { GlyphData } from '@/src/types/font';
import { Search } from 'lucide-react';

interface GlyphBrowserProps {
  glyphs: Record<string, GlyphData>;
  selectedChar: string;
  onSelectChar: (char: string) => void;
}

export const GlyphBrowser: React.FC<GlyphBrowserProps> = ({
  glyphs,
  selectedChar,
  onSelectChar,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'upper' | 'lower' | 'num' | 'punct'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allGlyphs = Object.values(glyphs);

  const filteredGlyphs = allGlyphs.filter((g) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchChar = g.char.toLowerCase().includes(q);
      const matchName = g.name.toLowerCase().includes(q);
      const matchHex = g.unicode.toString(16).toLowerCase().includes(q);
      if (!matchChar && !matchName && !matchHex) return false;
    }

    if (filterCategory === 'upper') return g.char >= 'A' && g.char <= 'Z';
    if (filterCategory === 'lower') return g.char >= 'a' && g.char <= 'z';
    if (filterCategory === 'num') return g.char >= '0' && g.char <= '9';
    if (filterCategory === 'punct') return !(/[a-zA-Z0-9]/.test(g.char));
    return true;
  });

  return (
    <footer className="h-12 border-t border-neutral-900 bg-neutral-950 flex items-center px-2 gap-2 shrink-0 select-none z-20">
      {/* Category Tabs */}
      <div className="hidden md:flex items-center gap-1 border-r border-neutral-900 pr-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'upper', label: 'A-Z' },
          { id: 'lower', label: 'a-z' },
          { id: 'num', label: '0-9' },
          { id: 'punct', label: '&!?' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id as any)}
            className={`px-2 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
              filterCategory === cat.id
                ? 'bg-neutral-800 text-neutral-100 font-medium'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quick Search */}
      <div className="relative w-24 hidden lg:block">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter..."
          className="w-full bg-neutral-900 border border-neutral-800 text-[11px] px-2 py-0.5 text-neutral-200 outline-none placeholder:text-neutral-600"
        />
      </div>

      {/* Glyph Horizontal Strip */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto h-full py-1 scrollbar-none">
        {filteredGlyphs.map((g) => {
          const isSelected = g.char === selectedChar;
          const hasContours = g.contours && g.contours.length > 0;

          return (
            <button
              key={g.char}
              onClick={() => onSelectChar(g.char)}
              title={`${g.name} (U+00${g.unicode.toString(16).toUpperCase()})`}
              className={`min-w-8 h-8 px-1.5 flex flex-col items-center justify-center font-sans text-xs transition-colors shrink-0 cursor-pointer relative ${
                isSelected
                  ? 'bg-neutral-100 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900'
              }`}
            >
              <span className="leading-none">{g.char === ' ' ? '␣' : g.char}</span>
              {hasContours && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    isSelected ? 'bg-neutral-900' : 'bg-neutral-600'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Counter */}
      <div className="hidden sm:block text-[10px] font-mono text-neutral-500 pl-2 border-l border-neutral-900 shrink-0">
        {filteredGlyphs.length} glyphs
      </div>
    </footer>
  );
};
