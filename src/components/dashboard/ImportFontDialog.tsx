import React, { useState, useRef } from 'react';
import { Dialog } from '@/src/components/ui/Dialog';
import { Button } from '@/src/components/ui/Button';
import { Upload, FileType, AlertCircle, Layers, Trash2, CheckCircle2, CheckSquare, Square } from 'lucide-react';
import { parseFontFile, inspectFontFiles } from '@/src/lib/fonts/fontConverter';
import { FontProject, DetectedFontFile, FontTypeStyle } from '@/src/types/font';
import { DEFAULT_METRICS, generateInitialGlyphSet } from '@/src/lib/fonts/defaultFont';

interface ImportFontDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (projects: FontProject[]) => void;
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

  // Staged files for review & type editing
  const [stagedFiles, setStagedFiles] = useState<DetectedFontFile[]>([]);
  const [familyGroupName, setFamilyGroupName] = useState<string>('');
  const [importAsFamily, setImportAsFamily] = useState<boolean>(true);

  const handleProcessFiles = async (files: FileList | File[]) => {
    setError(null);
    setIsLoading(true);

    try {
      const fileArr = Array.from(files).filter((f) =>
        f.name.match(/\.(ttf|otf|woff|woff2|json)$/i)
      );

      if (fileArr.length === 0) {
        throw new Error('Please select valid font files (.ttf, .otf, .woff, .woff2, or .json)');
      }

      const inspected = await inspectFontFiles(fileArr);
      setStagedFiles(inspected);

      // Check "import as family" by default if more than 1 file
      setImportAsFamily(inspected.length > 1);

      // Determine default family group name
      const primaryFamily = inspected[0]?.familyName || 'Custom Family';
      setFamilyGroupName(primaryFamily);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to inspect font files.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStagedItem = (id: string, updates: Partial<DetectedFontFile>) => {
    setStagedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveStagedItem = (id: string) => {
    setStagedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirmImport = async () => {
    if (stagedFiles.length === 0) return;
    setIsLoading(true);
    setError(null);

    try {
      const confirmedFamily = familyGroupName.trim() || 'Untitled Font';
      const now = new Date().toISOString();

      // CASE A: Import as a single Family project containing [number] types
      if (importAsFamily && stagedFiles.length > 1) {
        const types: FontTypeStyle[] = [];

        for (const item of stagedFiles) {
          let parsed = item.parsedProject;
          if (!parsed) {
            parsed = await parseFontFile(item.file);
          }

          const style = item.styleName.trim() || 'Regular';
          const typeStyle: FontTypeStyle = {
            id: 'type_' + Math.random().toString(36).substring(2, 9),
            name: style,
            weight: item.weight || 400,
            width: item.width || 'Normal',
            isItalic: item.isItalic,
            metrics: parsed?.metrics || { ...DEFAULT_METRICS },
            glyphs:
              parsed?.glyphs && Object.keys(parsed.glyphs).length > 0
                ? { ...generateInitialGlyphSet(), ...parsed.glyphs }
                : generateInitialGlyphSet(),
          };
          types.push(typeStyle);
        }

        // Sort types by weight ascending (100 -> 900)
        types.sort((a, b) => a.weight - b.weight);

        // Pick primary type: preferred Regular (400), or first
        const primaryType = types.find((t) => t.weight === 400 && !t.isItalic) || types[0];

        const singleFamilyProject: FontProject = {
          id: 'fnt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          name: confirmedFamily,
          family: confirmedFamily,
          style: primaryType.name,
          weight: primaryType.weight,
          width: primaryType.width,
          version: '1.000',
          description: `Font Family with ${types.length} styles`,
          designer: 'Type Designer',
          license: 'OFL-1.1',
          createdAt: now,
          updatedAt: now,
          isFamily: true,
          types: types,
          activeTypeId: primaryType.id,
          metrics: primaryType.metrics,
          glyphs: primaryType.glyphs,
        };

        onImportSuccess([singleFamilyProject]);
      } else {
        // CASE B: Single font work (or separate individual fonts)
        const importedProjects: FontProject[] = [];

        for (const item of stagedFiles) {
          let parsed = item.parsedProject;
          if (!parsed) {
            parsed = await parseFontFile(item.file);
          }

          const style = item.styleName.trim() || 'Regular';
          const familyName = stagedFiles.length === 1 ? confirmedFamily : (item.familyName || confirmedFamily);
          const initialType: FontTypeStyle = {
            id: 'type_' + Math.random().toString(36).substring(2, 9),
            name: style,
            weight: item.weight || 400,
            width: item.width || 'Normal',
            isItalic: item.isItalic,
            metrics: parsed?.metrics || { ...DEFAULT_METRICS },
            glyphs:
              parsed?.glyphs && Object.keys(parsed.glyphs).length > 0
                ? { ...generateInitialGlyphSet(), ...parsed.glyphs }
                : generateInitialGlyphSet(),
          };

          const project: FontProject = {
            id: 'fnt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            name: `${familyName} ${style}`.trim(),
            family: familyName,
            style,
            weight: item.weight || 400,
            width: item.width || 'Normal',
            version: '1.000',
            description: `Imported from ${item.fileName}`,
            createdAt: now,
            updatedAt: now,
            isFamily: false,
            types: [initialType],
            activeTypeId: initialType.id,
            metrics: initialType.metrics,
            glyphs: initialType.glyphs,
          };

          importedProjects.push(project);
        }

        onImportSuccess(importedProjects);
      }

      handleReset();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error creating font projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStagedFiles([]);
    setFamilyGroupName('');
    setImportAsFamily(true);
    setError(null);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title={stagedFiles.length > 0 ? 'Review & Configure Font Import' : 'Import Font or Family'}
      maxWidth={stagedFiles.length > 0 ? 'lg' : 'sm'}
    >
      <div className="space-y-4">
        {stagedFiles.length === 0 ? (
          // Initial Upload Stage
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border border-dashed p-10 text-center transition-colors flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-sky-400 bg-neutral-800/60'
                : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-200">
                Drop font files or whole font family here
              </p>
              <p className="text-xs text-neutral-500">
                Supports single or multiple .ttf, .otf, .woff, .json files. Filenames are automatically analyzed to detect weights and types.
              </p>
            </div>

            <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono my-1">
              or
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".ttf,.otf,.woff,.woff2,.json"
              multiple
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
              Select Font Files
            </Button>
          </div>
        ) : (
          // Review & Type Editing Stage (Family Awareness)
          <div className="space-y-4">
            <div className="bg-neutral-900/60 border border-neutral-850 p-4 rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>Font Family Name</span>
                </label>
                <span className="text-[11px] font-mono text-neutral-400">
                  {stagedFiles.length} {stagedFiles.length === 1 ? 'file' : 'files detected'}
                </span>
              </div>
              <input
                type="text"
                value={familyGroupName}
                onChange={(e) => setFamilyGroupName(e.target.value)}
                placeholder="e.g. Inter, Roboto, Cabinet Grotesk"
                className="w-full bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 px-3 py-1.5 font-sans outline-none focus:border-neutral-600 rounded-xs"
                required
              />

              {/* Family Checkbox as requested */}
              {stagedFiles.length > 1 && (
                <div
                  onClick={() => setImportAsFamily(!importAsFamily)}
                  className="flex items-start gap-2 pt-2 border-t border-neutral-800/80 cursor-pointer select-none group"
                >
                  <div className="mt-0.5 text-sky-400">
                    {importAsFamily ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-200">
                      Import as a single Family project with [{stagedFiles.length} types]
                    </p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Creates only one unified font project in your workspace with all styles bundled together. You can switch between types seamlessly in the editor.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* List of Detected Fonts with Type Editors */}
            <div className="border border-neutral-850 divide-y divide-neutral-900 max-h-72 overflow-y-auto bg-neutral-950 rounded-xs">
              <div className="px-3 py-2 bg-neutral-900/40 text-[10px] font-mono uppercase tracking-wider text-neutral-500 grid grid-cols-12 gap-2">
                <span className="col-span-4">File Name</span>
                <span className="col-span-3">Style / Subfamily</span>
                <span className="col-span-3">Weight Class</span>
                <span className="col-span-2 text-right">Action</span>
              </div>

              {stagedFiles.map((item) => (
                <div key={item.id} className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-4 min-w-0 pr-2">
                    <p className="text-neutral-200 font-mono text-[11px] truncate" title={item.fileName}>
                      {item.fileName}
                    </p>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {item.glyphCount ? `${item.glyphCount} glyphs` : 'vector font'}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="text"
                      value={item.styleName}
                      onChange={(e) => handleUpdateStagedItem(item.id, { styleName: e.target.value })}
                      placeholder="e.g. Regular, Bold"
                      className="w-full bg-neutral-900 border border-neutral-800 px-2 py-1 text-xs text-neutral-100 font-mono outline-none focus:border-neutral-600 rounded-xs"
                    />
                  </div>

                  <div className="col-span-3">
                    <select
                      value={item.weight}
                      onChange={(e) =>
                        handleUpdateStagedItem(item.id, { weight: parseInt(e.target.value, 10) })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 px-2 py-1 text-xs text-neutral-200 font-mono outline-none focus:border-neutral-600 cursor-pointer rounded-xs"
                    >
                      <option value={100}>100 - Thin</option>
                      <option value={200}>200 - ExtraLight</option>
                      <option value={300}>300 - Light</option>
                      <option value={400}>400 - Regular</option>
                      <option value={500}>500 - Medium</option>
                      <option value={600}>600 - SemiBold</option>
                      <option value={700}>700 - Bold</option>
                      <option value={800}>800 - ExtraBold</option>
                      <option value={900}>900 - Black</option>
                      <option value={950}>950 - ExtraBlack</option>
                    </select>
                  </div>

                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => handleRemoveStagedItem(item.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="Remove from import"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReset}
                disabled={isLoading}
              >
                Choose Different Files
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleConfirmImport}
                  isLoading={isLoading}
                  disabled={stagedFiles.length === 0}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  {importAsFamily && stagedFiles.length > 1
                    ? `Import as Single Family Project (${stagedFiles.length} types)`
                    : stagedFiles.length === 1
                    ? 'Import Single Font'
                    : `Import ${stagedFiles.length} Separate Fonts`}
                </Button>
              </div>
            </div>
          </div>
        )}

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
