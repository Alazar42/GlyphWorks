import React, { useState, useRef } from 'react';
import { Dialog } from '@/src/components/ui/Dialog';
import { Button } from '@/src/components/ui/Button';
import { Upload, FileType, AlertCircle } from 'lucide-react';
import { parseFontFile } from '@/src/lib/fonts/fontConverter';
import { FontProject } from '@/src/types/font';
import { DEFAULT_METRICS, generateInitialGlyphSet } from '@/src/lib/fonts/defaultFont';

interface ImportFontDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (project: FontProject) => void;
}

export const ImportFontDialog: React.FC<ImportFontDialogProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      const parsed = await parseFontFile(file);
      const now = new Date().toISOString();

      const newProject: FontProject = {
        id: 'fnt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: parsed.name || file.name.replace(/\.[^/.]+$/, ''),
        family: parsed.family || 'Imported Font',
        style: parsed.style || 'Regular',
        weight: 400,
        width: 'Normal',
        version: '1.000',
        description: `Imported from ${file.name}`,
        createdAt: now,
        updatedAt: now,
        metrics: parsed.metrics || { ...DEFAULT_METRICS },
        glyphs: parsed.glyphs && Object.keys(parsed.glyphs).length > 0
          ? { ...generateInitialGlyphSet(), ...parsed.glyphs }
          : generateInitialGlyphSet(),
      };

      onImportSuccess(newProject);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to parse font file. Ensure it is a valid TTF, OTF, or GlyphWorks JSON file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Import Font"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border border-dashed p-8 text-center transition-colors flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-neutral-400 bg-neutral-800/40'
              : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
          }`}
        >
          <Upload className="w-5 h-5 text-neutral-400" />
          <div className="space-y-1">
            <p className="text-xs text-neutral-300">Drop a font here</p>
            <p className="text-[11px] text-neutral-500">Supports .ttf, .otf, .woff, .json</p>
          </div>

          <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
            or
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".ttf,.otf,.woff,.json"
            className="hidden"
          />

          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            isLoading={isLoading}
          >
            <FileType className="w-3.5 h-3.5 mr-1" />
            Choose File
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-2.5 bg-rose-950/20 border border-rose-900/50 text-[11px] text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Dialog>
  );
};
