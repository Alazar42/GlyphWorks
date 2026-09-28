import React, { useState } from 'react';
import { Dialog } from '@/src/components/ui/Dialog';
import { Button } from '@/src/components/ui/Button';
import { FontProject } from '@/src/types/font';
import { exportFontFile } from '@/src/lib/fonts/fontConverter';
import { useToast } from '@/src/components/ui/Toast';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: FontProject | null;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [format, setFormat] = useState<'ttf' | 'otf' | 'woff' | 'svg' | 'json'>('ttf');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  if (!project) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      exportFontFile(project, { format });
      toast({
        type: 'success',
        title: 'Font Exported',
        description: `Downloaded ${project.family || project.name}.${format}`,
      });
      onClose();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Export Failed',
        description: err?.message || 'Unable to build font file.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formats: { id: 'ttf' | 'otf' | 'woff' | 'svg' | 'json'; label: string; desc: string }[] = [
    { id: 'ttf', label: 'TTF', desc: 'TrueType font for desktop & print' },
    { id: 'otf', label: 'OTF', desc: 'OpenType font with PostScript outlines' },
    { id: 'woff', label: 'WOFF', desc: 'Standard compressed web font format' },
    { id: 'svg', label: 'SVG Font', desc: 'Vector XML glyph definitions' },
    { id: 'json', label: 'GlyphWorks Project', desc: 'Full editable project backup' },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Export Font"
      maxWidth="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            isLoading={isExporting}
          >
            Export
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block text-xs font-medium text-neutral-400">
          Format
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {formats.map((f) => (
            <label
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`flex items-center justify-between p-2.5 border cursor-pointer transition-colors ${
                format === f.id
                  ? 'border-neutral-400 bg-neutral-800 text-neutral-100'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="font-format"
                  checked={format === f.id}
                  onChange={() => setFormat(f.id)}
                  className="accent-neutral-100 w-3.5 h-3.5"
                />
                <span className="font-mono text-xs font-semibold">{f.label}</span>
              </div>
              <span className="text-[11px] text-neutral-500 font-sans">{f.desc}</span>
            </label>
          ))}
        </div>
      </div>
    </Dialog>
  );
};
