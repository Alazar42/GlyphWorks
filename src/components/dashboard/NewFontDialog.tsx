import React, { useState } from 'react';
import { Dialog } from '@/src/components/ui/Dialog';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';
import { Layers, Type, CheckSquare, Square } from 'lucide-react';

export interface CreateFontData {
  family: string;
  style?: string;
  weight?: number;
  width?: string;
  isFamily?: boolean;
  initialStyles?: { name: string; weight: number; width?: string; isItalic?: boolean }[];
}

interface NewFontDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateFontData) => void;
}

const COMMON_FAMILY_STYLES = [
  { id: 'regular', name: 'Regular', weight: 400, isItalic: false },
  { id: 'italic', name: 'Italic', weight: 400, isItalic: true },
  { id: 'bold', name: 'Bold', weight: 700, isItalic: false },
  { id: 'bold_italic', name: 'Bold Italic', weight: 700, isItalic: true },
  { id: 'light', name: 'Light', weight: 300, isItalic: false },
  { id: 'black', name: 'Black', weight: 900, isItalic: false },
];

export const NewFontDialog: React.FC<NewFontDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [createMode, setCreateMode] = useState<'single' | 'family'>('single');
  const [family, setFamily] = useState('Untitled');
  const [style, setStyle] = useState('Regular');
  const [weight, setWeight] = useState('400');
  const [width, setWidth] = useState('Normal');

  const [selectedStyles, setSelectedStyles] = useState<string[]>(['regular', 'bold']);

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((s) => s !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const familyName = family.trim() || 'Untitled Font';

    if (createMode === 'family') {
      const stylesToCreate = COMMON_FAMILY_STYLES.filter((s) =>
        selectedStyles.includes(s.id)
      ).map((s) => ({
        name: s.name,
        weight: s.weight,
        width: 'Normal',
        isItalic: s.isItalic,
      }));

      onCreate({
        family: familyName,
        isFamily: true,
        initialStyles: stylesToCreate.length > 0 ? stylesToCreate : undefined,
      });
    } else {
      onCreate({
        family: familyName,
        style,
        weight: parseInt(weight, 10) || 400,
        width,
        isFamily: false,
      });
    }
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={createMode === 'family' ? 'New Font Family' : 'New Font'}
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} type="submit">
            {createMode === 'family' ? 'Create Family' : 'Create Font'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mode Selector: Single Font vs Font Family */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xs">
          <button
            type="button"
            onClick={() => setCreateMode('single')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-xs transition-all cursor-pointer ${
              createMode === 'single'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-xs border border-neutral-200/80 dark:border-transparent'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Single Font</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateMode('family')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-xs transition-all cursor-pointer ${
              createMode === 'family'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-xs border border-neutral-200/80 dark:border-transparent'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Font Family</span>
          </button>
        </div>

        {/* Font Family Name */}
        <Input
          label="Font Family Name"
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          placeholder="e.g. Outfit, Inter, Syne"
          autoFocus
        />

        {createMode === 'single' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Style Name"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              options={[
                { value: 'Regular', label: 'Regular' },
                { value: 'Italic', label: 'Italic' },
                { value: 'Bold', label: 'Bold' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Light', label: 'Light' },
                { value: 'Black', label: 'Black' },
              ]}
            />

            <Select
              label="Weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              options={[
                { value: '100', label: '100 (Thin)' },
                { value: '200', label: '200 (ExtraLight)' },
                { value: '300', label: '300 (Light)' },
                { value: '400', label: '400 (Regular)' },
                { value: '500', label: '500 (Medium)' },
                { value: '600', label: '600 (SemiBold)' },
                { value: '700', label: '700 (Bold)' },
                { value: '800', label: '800 (ExtraBold)' },
                { value: '900', label: '900 (Black)' },
              ]}
            />

            <Select
              label="Width"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              options={[
                { value: 'Ultra Condensed', label: 'Ultra Condensed' },
                { value: 'Condensed', label: 'Condensed' },
                { value: 'Normal', label: 'Normal' },
                { value: 'Expanded', label: 'Expanded' },
              ]}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              Select Starting Styles ({selectedStyles.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_FAMILY_STYLES.map((st) => {
                const isChecked = selectedStyles.includes(st.id);
                return (
                  <div
                    key={st.id}
                    onClick={() => toggleStyle(st.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xs border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-950 dark:text-white shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-sky-600 dark:text-sky-400">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-tight">{st.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">Weight {st.weight}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-neutral-500">
              You can easily switch between styles and add more styles at any time inside the editor.
            </p>
          </div>
        )}
      </form>
    </Dialog>
  );
};
