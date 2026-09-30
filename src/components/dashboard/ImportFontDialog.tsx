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
  const [importStatus, setImportStatus] = useState<string>('');
  const [importProgress, setImportProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Staged files for review & type editing
  const [stagedFiles, setStagedFiles] = useState<DetectedFontFile[]>([]);
  const [familyGroupName, setFamilyGroupName] = useState<string>('');
  const [importAsFamily, setImportAsFamily] = useState<boolean>(true);

  const handleProcessFiles = async (files: FileList | File[]) => {
    setError(null);
    setIsLoading(true);
    setImportStatus('Inspecting font metadata...');

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
      setImportStatus('');
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

        for (let i = 0; i < stagedFiles.length; i++) {
          const item = stagedFiles[i];
          setImportStatus(`Parsing ${item.familyName} ${item.styleName} (${i + 1}/${stagedFiles.length})...`);
          setImportProgress(Math.round((i / stagedFiles.length) * 100));
          await new Promise((r) => setTimeout(r, 10));

          let parsed = item.parsedProject;
          if (!parsed) {
            parsed = await parseFontFile(item.file, (pct) => {
              const fileWeight = 100 / stagedFiles.length;
              setImportProgress(Math.round((i * fileWeight) + (pct * (fileWeight / 100))));
            });
          }

          const style = item.styleName.trim() || 'Regular';
          const parsedGlyphs = parsed?.glyphs || {};
          const isMega = Object.keys(parsedGlyphs).length > 2000;

          // For mega-fonts, share the base glyph dictionary across styles to avoid multi-hundred megabyte RAM explosion
          const typeGlyphs = (isMega && i > 0 && types.length > 0)
            ? types[0].glyphs
            : (Object.keys(parsedGlyphs).length > 0 ? { ...generateInitialGlyphSet(), ...parsedGlyphs } : generateInitialGlyphSet());

          const typeStyle: FontTypeStyle = {
            id: 'type_' + Math.random().toString(36).substring(2, 9),
            name: style,
            weight: item.weight || 400,
            width: item.width || 'Normal',
            isItalic: item.isItalic,
            metrics: parsed?.metrics || { ...DEFAULT_METRICS },
            glyphs: typeGlyphs,
          };
          types.push(typeStyle);
        }

        setImportProgress(100);
        setImportStatus('Finalizing font family...');
        await new Promise((r) => setTimeout(r, 20));

        // Sort types by width rank, weight ascending, and slant
        const widthRank: Record<string, number> = {
          UltraCondensed: 1,
          ExtraCondensed: 2,
          Condensed: 3,
          SemiCondensed: 4,
          Normal: 5,
          SemiExpanded: 6,
          Expanded: 7,
          ExtraExpanded: 8,
          UltraExpanded: 9,
        };
        types.sort((a, b) => {
          const wa = widthRank[a.width] || 5;
          const wb = widthRank[b.width] || 5;
          if (wa !== wb) return wa - wb;
          if (a.weight !== b.weight) return a.weight - b.weight;
          return (a.isItalic ? 1 : 0) - (b.isItalic ? 1 : 0);
        });

        // Pick primary type: preferred Regular (400) Normal, or first
        const primaryType =
          types.find((t) => t.weight === 400 && !t.isItalic && t.width === 'Normal') ||
          types.find((t) => t.weight === 400 && !t.isItalic) ||
          types[0];

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
          isColorFont: stagedFiles.some((f) => f.isColorFont) || types.some((t) => t.isColorFont),
          primaryScript: stagedFiles[0]?.primaryScript || types[0]?.primaryScript || 'Latin',
        };

        onImportSuccess([singleFamilyProject]);
      } else {
        // CASE B: Single font work (or separate individual fonts)
        const importedProjects: FontProject[] = [];

        for (let i = 0; i < stagedFiles.length; i++) {
          const item = stagedFiles[i];
          setImportStatus(`Parsing ${item.familyName} ${item.styleName} (${i + 1}/${stagedFiles.length})...`);
          setImportProgress(Math.round((i / stagedFiles.length) * 100));
          await new Promise((r) => setTimeout(r, 10));

          let parsed = item.parsedProject;
          if (!parsed) {
            parsed = await parseFontFile(item.file, (pct) => {
              const fileWeight = 100 / stagedFiles.length;
              setImportProgress(Math.round((i * fileWeight) + (pct * (fileWeight / 100))));
            });
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
            isColorFont: item.isColorFont || parsed?.isColorFont,
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
            isColorFont: item.isColorFont || parsed?.isColorFont,
            primaryScript: item.primaryScript || parsed?.primaryScript || 'Latin',
          };

          importedProjects.push(project);
        }

        setImportProgress(100);
        setImportStatus('Finalizing font import...');
        await new Promise((r) => setTimeout(r, 20));

        onImportSuccess(importedProjects);
      }

      handleReset();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error creating font projects');
    } finally {
      setIsLoading(false);
      setImportStatus('');
      setImportProgress(0);
    }
  };

  const handleReset = () => {
    setStagedFiles([]);
    setFamilyGroupName('');
    setImportAsFamily(true);
    setImportStatus('');
    setImportProgress(0);
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
            className={`border border-dashed p-10 text-center transition-colors flex flex-col items-center justify-center gap-3 rounded-xs ${
              isDragging
                ? 'border-sky-500 bg-sky-50/50 dark:bg-neutral-800/60'
                : 'border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-neutral-400 dark:hover:border-neutral-700'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Drop font files or whole font family here
              </p>
              <p className="text-xs text-neutral-500">
                Supports single or multiple .ttf, .otf, .woff, .json files. Filenames are automatically analyzed to detect weights and types.
              </p>
            </div>

            <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono my-1">
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
            <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-850 p-4 rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                  <span>Font Family Name</span>
                </label>
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  {stagedFiles.length} {stagedFiles.length === 1 ? 'file' : 'files detected'}
                </span>
              </div>
              <input
                type="text"
                value={familyGroupName}
                onChange={(e) => setFamilyGroupName(e.target.value)}
                placeholder="e.g. Inter, Roboto, Cabinet Grotesk"
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 px-3 py-1.5 font-sans outline-none focus:border-sky-500 dark:focus:border-neutral-600 rounded-xs"
                required
              />

              {/* Family Checkbox as requested */}
              {stagedFiles.length > 1 && (
                <div
                  onClick={() => setImportAsFamily(!importAsFamily)}
                  className="flex items-start gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800/80 cursor-pointer select-none group"
                >
                  <div className="mt-0.5 text-sky-600 dark:text-sky-400">
                    {importAsFamily ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      Bundle as Family ({stagedFiles.length} styles)
                    </p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Groups all imported styles into a single font project with quick style switching.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* List of Detected Fonts with Type Editors */}
            <div className="border border-neutral-200 dark:border-neutral-850 divide-y divide-neutral-200 dark:divide-neutral-900 max-h-72 overflow-y-auto bg-white dark:bg-neutral-950 rounded-xs">
              <div className="px-3 py-2 bg-neutral-100/70 dark:bg-neutral-900/40 text-[10px] font-mono uppercase tracking-wider text-neutral-500 grid grid-cols-12 gap-2">
                <span className="col-span-4">File Name</span>
                <span className="col-span-3">Style / Subfamily</span>
                <span className="col-span-3">Weight Class</span>
                <span className="col-span-2 text-right">Action</span>
              </div>

              {stagedFiles.map((item) => (
                <div key={item.id} className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-4 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      {item.sampleChars && (
                        <span className="w-5 h-5 flex items-center justify-center bg-neutral-100 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-sky-600 dark:text-sky-400 font-bold text-xs shrink-0 rounded-xs">
                          {item.sampleChars.slice(0, 1)}
                        </span>
                      )}
                      <p className="text-neutral-800 dark:text-neutral-200 font-mono text-[11px] truncate" title={item.fileName}>
                        {item.fileName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {item.glyphCount ? `${item.glyphCount} glyphs` : 'vector font'}
                      </span>
                      {item.primaryScript && item.primaryScript !== 'Latin' && (
                        <span className="text-[9px] px-1 py-0.2 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xs font-mono">
                          {item.primaryScript}
                        </span>
                      )}
                      {item.isColorFont && (
                        <span className="text-[9px] px-1 py-0.2 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-xs font-mono">
                          Color
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="text"
                      value={item.styleName}
                      onChange={(e) => handleUpdateStagedItem(item.id, { styleName: e.target.value })}
                      placeholder="e.g. Regular, Bold"
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 px-2 py-1 text-xs text-neutral-900 dark:text-neutral-100 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 rounded-xs"
                    />
                  </div>

                  <div className="col-span-3">
                    <select
                      value={item.weight}
                      onChange={(e) =>
                        handleUpdateStagedItem(item.id, { weight: parseInt(e.target.value, 10) })
                      }
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 px-2 py-1 text-xs text-neutral-900 dark:text-neutral-200 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 cursor-pointer rounded-xs"
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
                      className="text-neutral-400 hover:text-rose-500 dark:text-neutral-500 dark:hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="Remove from import"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Progress Bar when importing */}
            {isLoading && importStatus && (
              <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-sky-200">
                  <span className="truncate pr-2">{importStatus}</span>
                  {importProgress > 0 && <span className="shrink-0">{importProgress}%</span>}
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full transition-all duration-150"
                    style={{ width: `${Math.max(4, importProgress)}%` }}
                  />
                </div>
              </div>
            )}

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
                    ? 'Import Family'
                    : stagedFiles.length === 1
                    ? 'Import Font'
                    : 'Import Fonts'}
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
