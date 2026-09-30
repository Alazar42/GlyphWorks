import React, { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { Tooltip } from '@/src/components/ui/Tooltip';
import { Dialog } from '@/src/components/ui/Dialog';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Eye, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Grid, 
  Magnet,
  Layers,
  Plus,
  Trash2,
  Settings2
} from 'lucide-react';
import { FontProject, FontTypeStyle } from '@/src/types/font';

interface EditorTopBarProps {
  project: FontProject;
  onUpdateProjectMeta: (meta: { family?: string; style?: string; weight?: number; width?: string }) => void;
  onSwitchType: (typeId: string) => void;
  onAddTypeToFamily: (typeData: { name: string; weight: number; width: string }) => void;
  onDeleteTypeFromFamily: (typeId: string) => void;
  onSave: () => void;
  onExport: () => void;
  onTogglePreview: () => void;
  isPreviewOpen: boolean;
  onBackToDashboard: () => void;
  isDirty: boolean;
  // Canvas controls
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  project,
  onUpdateProjectMeta,
  onSwitchType,
  onAddTypeToFamily,
  onDeleteTypeFromFamily,
  onSave,
  onExport,
  onTogglePreview,
  isPreviewOpen,
  onBackToDashboard,
  isDirty,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  // Types in this family
  const typesList = project.types && project.types.length > 0 ? project.types : [];
  const hasMultipleTypes = typesList.length > 1;

  // Manage Types modal state
  const [isManageTypesOpen, setIsManageTypesOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeWeight, setNewTypeWeight] = useState(700);

  // Edit metadata modal state
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [editFamily, setEditFamily] = useState(project.family);
  const [editStyle, setEditStyle] = useState(project.style);
  const [editWeight, setEditWeight] = useState(project.weight);
  const [editWidth, setEditWidth] = useState(project.width || 'Normal');

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProjectMeta({
      family: editFamily.trim() || project.family,
      style: editStyle.trim() || project.style,
      weight: editWeight,
      width: editWidth,
    });
    setIsMetaModalOpen(false);
  };

  const handleCreateNewType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    onAddTypeToFamily({
      name: newTypeName.trim(),
      weight: newTypeWeight,
      width: 'Normal',
    });
    setNewTypeName('');
  };

  return (
    <>
      <header className="h-11 border-b border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 px-3 flex items-center justify-between text-xs select-none shrink-0 z-30 shadow-xs">
        {/* Left: Brand & Family Name & Type Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            title="Back to Foundry Projects"
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors p-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-neutral-700 dark:text-neutral-400">
            GlyphWorks
          </span>

          <span className="text-neutral-300 dark:text-neutral-700">/</span>

          {/* Family Name */}
          <button
            onClick={() => {
              setEditFamily(project.family);
              setEditStyle(project.style);
              setEditWeight(project.weight);
              setEditWidth(project.width || 'Normal');
              setIsMetaModalOpen(true);
            }}
            className="text-neutral-900 dark:text-neutral-200 hover:text-sky-600 dark:hover:text-white font-medium transition-colors hover:underline cursor-pointer flex items-center gap-1.5"
            title="Edit Font & Family Properties"
          >
            <span className="font-semibold">{project.family}</span>
            <Settings2 className="w-3 h-3 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300" />
          </button>

          {/* Type / Style Switcher for Family Project */}
          {hasMultipleTypes ? (
            <div className="flex items-center gap-1.5">
              <select
                value={project.activeTypeId || (typesList[0]?.id || '')}
                onChange={(e) => onSwitchType(e.target.value)}
                className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 text-[11px] text-neutral-800 dark:text-neutral-200 py-0.5 px-2 font-mono outline-none cursor-pointer rounded-xs shadow-xs"
                title="Switch active font type in this family"
              >
                {typesList.map((t) => {
                  const displayName = t.width && t.width !== 'Normal' && !t.name.toLowerCase().includes(t.width.toLowerCase())
                    ? `${t.width} ${t.name}`
                    : t.name;
                  return (
                    <option key={t.id} value={t.id}>
                      {displayName} ({t.weight})
                    </option>
                  );
                })}
              </select>

              <button
                onClick={() => setIsManageTypesOpen(true)}
                className="text-[10px] font-mono bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800/80 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full hover:bg-sky-200 dark:hover:bg-sky-900/60 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                title="Manage family types"
              >
                <Layers className="w-2.5 h-2.5 text-sky-500 dark:text-sky-400" />
                [{typesList.length} types]
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditFamily(project.family);
                setEditStyle(project.style);
                setEditWeight(project.weight);
                setEditWidth(project.width || 'Normal');
                setIsMetaModalOpen(true);
              }}
              className="text-[11px] text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-300 dark:border-neutral-800 px-2.5 py-0.5 font-mono cursor-pointer rounded-xs transition-colors shadow-xs"
              title="Click to edit style and weight"
            >
              {project.style} · {project.weight}
            </button>
          )}

          {isDirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Unsaved changes" />
          )}
        </div>

        {/* Center: Canvas Controls & History */}
        <div className="hidden sm:flex items-center gap-1 border-x border-neutral-200 dark:border-neutral-900 px-3">
          <Tooltip content="Undo" shortcut="⌘Z">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer rounded-xs"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Redo" shortcut="⌘⇧Z">
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer rounded-xs"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <div className="w-px h-3.5 bg-neutral-200 dark:bg-neutral-800 mx-1" />

          <Tooltip content="Zoom In" shortcut="+">
            <button
              onClick={onZoomIn}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer rounded-xs"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <span className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400 w-11 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>

          <Tooltip content="Zoom Out" shortcut="-">
            <button
              onClick={onZoomOut}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer rounded-xs"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Reset Zoom & Pan (100%)" shortcut="0">
            <button
              onClick={onResetZoom}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer rounded-xs"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <div className="w-px h-3.5 bg-neutral-200 dark:bg-neutral-800 mx-1" />

          <Tooltip content="Toggle Grid" shortcut="G">
            <button
              onClick={onToggleGrid}
              className={`p-1.5 transition-colors cursor-pointer rounded-xs ${
                showGrid
                  ? 'text-sky-700 bg-sky-100 border border-sky-300 dark:text-neutral-100 dark:bg-neutral-800 dark:border-neutral-700'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Snap to Grid" shortcut="S">
            <button
              onClick={onToggleSnap}
              className={`p-1.5 transition-colors cursor-pointer rounded-xs ${
                snapToGrid
                  ? 'text-sky-700 bg-sky-100 border border-sky-300 dark:text-neutral-100 dark:bg-neutral-800 dark:border-neutral-700'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Magnet className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>

        {/* Right: Preview, Save & Export */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isPreviewOpen ? 'secondary' : 'ghost'}
            onClick={onTogglePreview}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Proof
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            title="Save font project (⌘S)"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onExport}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Export
          </Button>

          <div className="w-px h-3.5 bg-neutral-800 mx-0.5" />

          <ThemeToggle variant="icon" />
        </div>
      </header>

      {/* Manage Family Types Modal */}
      <Dialog
        isOpen={isManageTypesOpen}
        onClose={() => setIsManageTypesOpen(false)}
        title={`Manage Family Types — ${project.family}`}
        maxWidth="md"
      >
        <div className="space-y-5">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            This family project currently contains <strong className="text-sky-700 dark:text-sky-300 font-mono">[{typesList.length} types]</strong>. You can switch between types at any time in the editor, or add new styles.
          </p>

          <div className="border border-neutral-200 dark:border-neutral-850 divide-y divide-neutral-200 dark:divide-neutral-900 bg-white dark:bg-neutral-950 rounded-xs shadow-2xs">
            {typesList.map((t) => {
              const isActive = t.id === project.activeTypeId;
              return (
                <div key={t.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-sky-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <span>{t.name}</span>
                        {isActive && (
                          <span className="text-[10px] text-sky-700 dark:text-sky-400 font-mono bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 px-1.5 py-0.2 rounded-xs">
                            Active in Editor
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono">
                        Weight {t.weight} · {t.width} · {Object.keys(t.glyphs || {}).length} glyphs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onSwitchType(t.id);
                          setIsManageTypesOpen(false);
                        }}
                      >
                        Switch to this Type
                      </Button>
                    )}
                    {typesList.length > 1 && (
                      <button
                        onClick={() => onDeleteTypeFromFamily(t.id)}
                        disabled={typesList.length <= 1}
                        className="text-neutral-400 hover:text-rose-500 dark:text-neutral-500 dark:hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title="Delete type from family"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Type to Family Form */}
          <form onSubmit={handleCreateNewType} className="p-3.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-850 rounded-xs space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-semibold flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>Add New Type / Style to Family</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Style Name</label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="e.g. ExtraBold, Light Italic"
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 px-2.5 py-1.5 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 rounded-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Weight</label>
                <select
                  value={newTypeWeight}
                  onChange={(e) => setNewTypeWeight(parseInt(e.target.value, 10))}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-200 px-2.5 py-1.5 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 cursor-pointer rounded-xs"
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

              <div className="flex items-end">
                <Button type="submit" size="sm" variant="primary" className="w-full">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Type
                </Button>
              </div>
            </div>
          </form>

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="outline" onClick={() => setIsManageTypesOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Font & Family Properties Dialog */}
      <Dialog
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        title="Edit Font & Family Properties"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveMeta} className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
              Family Name
            </label>
            <input
              type="text"
              value={editFamily}
              onChange={(e) => setEditFamily(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 px-3 py-1.5 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 rounded-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
                Active Style Name
              </label>
              <input
                type="text"
                value={editStyle}
                onChange={(e) => setEditStyle(e.target.value)}
                placeholder="e.g. Regular, Bold"
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 px-3 py-1.5 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 rounded-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
                Weight Class
              </label>
              <select
                value={editWeight}
                onChange={(e) => setEditWeight(parseInt(e.target.value, 10))}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-200 px-3 py-1.5 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 cursor-pointer rounded-xs"
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
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
              Width
            </label>
            <select
              value={editWidth}
              onChange={(e) => setEditWidth(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-200 px-3 py-1.5 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 cursor-pointer rounded-xs"
            >
              <option value="UltraCondensed">UltraCondensed</option>
              <option value="ExtraCondensed">ExtraCondensed</option>
              <option value="Condensed">Condensed</option>
              <option value="SemiCondensed">SemiCondensed</option>
              <option value="Normal">Normal</option>
              <option value="SemiExpanded">SemiExpanded</option>
              <option value="Expanded">Expanded</option>
              <option value="ExtraExpanded">ExtraExpanded</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-900">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMetaModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Properties
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
};
