import React, { useState } from 'react';
import { Dialog } from '@/src/components/ui/Dialog';
import { Button } from '@/src/components/ui/Button';
import { LANGUAGE_PRESETS, LanguageScriptPreset, detectCharacterScript } from '@/src/lib/fonts/languagePresets';
import { Globe, Plus, Check, Search, Sparkles } from 'lucide-react';
import { GlyphData } from '@/src/types/font';

interface AddLanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingGlyphs: Record<string, GlyphData>;
  onAddCharacters: (chars: string[]) => void;
}

export const AddLanguageDialog: React.FC<AddLanguageDialogProps> = ({
  isOpen,
  onClose,
  existingGlyphs,
  onAddCharacters,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('latin_extended');
  const [customInput, setCustomInput] = useState<string>('');
  const [selectedPresetChars, setSelectedPresetChars] = useState<Set<string>>(new Set());

  // Current preset
  const currentPreset = LANGUAGE_PRESETS.find((p) => p.id === selectedPresetId) || LANGUAGE_PRESETS[0];

  // Initialize selected preset chars when switching presets
  React.useEffect(() => {
    if (currentPreset) {
      // Exclude characters that already exist in the font
      const available = currentPreset.characters.filter((c) => !existingGlyphs[c]);
      setSelectedPresetChars(new Set(available));
    }
  }, [selectedPresetId, existingGlyphs]);

  const toggleCharSelection = (c: string) => {
    setSelectedPresetChars((prev) => {
      const next = new Set(prev);
      if (next.has(c)) {
        next.delete(c);
      } else {
        next.add(c);
      }
      return next;
    });
  };

  const handleSelectAllInPreset = () => {
    const available = currentPreset.characters.filter((c) => !existingGlyphs[c]);
    setSelectedPresetChars(new Set(available));
  };

  const handleDeselectAllInPreset = () => {
    setSelectedPresetChars(new Set());
  };

  // Custom characters parsed from text or range
  const parseCustomCharacters = (input: string): string[] => {
    const set = new Set<string>();
    const trimmed = input.trim();

    // Check for Unicode range syntax like U+0400-U+044F
    const rangeMatch = trimmed.match(/^U\+([0-9a-fA-F]{4,6})\s*-\s*U\+([0-9a-fA-F]{4,6})$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 16);
      const end = parseInt(rangeMatch[2], 16);
      if (!isNaN(start) && !isNaN(end) && start <= end && end - start <= 1000) {
        for (let code = start; code <= end; code++) {
          try {
            set.add(String.fromCodePoint(code));
          } catch {}
        }
        return Array.from(set);
      }
    }

    // Otherwise split by characters and discard whitespace unless explicitly space
    for (const char of Array.from(input)) {
      if (char !== '\n' && char !== '\r' && char !== '\t') {
        set.add(char);
      }
    }
    return Array.from(set);
  };

  const customChars = parseCustomCharacters(customInput).filter((c) => !existingGlyphs[c]);

  const handleConfirmAdd = () => {
    if (activeTab === 'presets') {
      const chars = Array.from(selectedPresetChars);
      if (chars.length > 0) {
        onAddCharacters(chars);
        onClose();
      }
    } else {
      if (customChars.length > 0) {
        onAddCharacters(customChars);
        setCustomInput('');
        onClose();
      }
    }
  };

  const charsToAddCount = activeTab === 'presets' ? selectedPresetChars.size : customChars.length;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Language Support & Glyphs" maxWidth="xl">
      <div className="space-y-4">
        {/* Tab switch */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-sky-500 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Language & Script Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-sky-500 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Custom Characters / Range
          </button>
        </div>

        {activeTab === 'presets' ? (
          <div className="space-y-3">
            {/* Presets Grid with smart height limit */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {LANGUAGE_PRESETS.map((preset) => {
                const existingCount = preset.characters.filter((c) => existingGlyphs[c]).length;
                const isSelected = preset.id === selectedPresetId;

                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`p-2.5 text-left rounded-xs border transition-colors cursor-pointer space-y-1 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">{preset.name}</span>
                      {existingCount === preset.characters.length && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">Full</span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 line-clamp-1">{preset.description}</p>
                    <div className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400 flex items-center justify-between pt-0.5">
                      <span>{preset.characters.length} total</span>
                      <span className="text-neutral-500">
                        {existingCount}/{preset.characters.length} added
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Current Preset Details & Character Selection */}
            <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/20 p-3 rounded-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">{currentPreset.name}</h4>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400">{currentPreset.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllInPreset}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-neutral-300 dark:text-neutral-700">·</span>
                  <button
                    onClick={handleDeselectAllInPreset}
                    className="text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer font-medium"
                  >
                    Deselect
                  </button>
                </div>
              </div>

              {/* Characters Grid */}
              <div className="max-h-48 overflow-y-auto p-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-xs flex flex-wrap gap-1.5 shadow-2xs">
                {currentPreset.characters.map((c) => {
                  const alreadyExists = !!existingGlyphs[c];
                  const isChecked = selectedPresetChars.has(c);

                  return (
                    <button
                      key={c}
                      disabled={alreadyExists}
                      onClick={() => toggleCharSelection(c)}
                      title={alreadyExists ? `${c} (already in font)` : `${c} (U+00${c.codePointAt(0)?.toString(16).toUpperCase()})`}
                      className={`w-7 h-7 flex items-center justify-center font-sans text-xs transition-colors rounded-xs select-none ${
                        alreadyExists
                          ? 'bg-neutral-100 dark:bg-neutral-900/60 text-neutral-400 dark:text-neutral-600 border border-neutral-200 dark:border-neutral-850 cursor-not-allowed opacity-50'
                          : isChecked
                          ? 'bg-sky-100 dark:bg-sky-500/20 border border-sky-400 text-sky-900 dark:text-sky-200 font-semibold shadow-2xs'
                          : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Paste Characters or Enter Unicode Range
              </label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type or paste any characters (e.g. ሰላም, Привет, Bonjour) or enter a hex range like U+0400-U+042F..."
                rows={4}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 rounded-xs placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              />
              <p className="text-[11px] text-neutral-500">
                Any characters you paste will be automatically decoded and prepared as font glyphs.
              </p>
            </div>

            {customChars.length > 0 && (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-850 rounded-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-800 dark:text-neutral-300">
                    Detected Characters ({customChars.length})
                  </span>
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 font-mono">Ready to add</span>
                </div>
                <div className="max-h-24 overflow-y-auto flex flex-wrap gap-1 p-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-xs">
                  {customChars.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 text-xs font-sans text-neutral-800 dark:text-neutral-200 rounded-xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-850 flex items-center justify-between">
          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
            {charsToAddCount > 0 ? `${charsToAddCount} glyph(s) to add` : 'Select characters to add'}
          </span>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleConfirmAdd}
              disabled={charsToAddCount === 0}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add to Font
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
