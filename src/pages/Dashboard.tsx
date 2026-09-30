import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/src/components/dashboard/DashboardLayout';
import { Button } from '@/src/components/ui/Button';
import { ProjectCard } from '@/src/components/dashboard/ProjectCard';
import { ProjectListRow } from '@/src/components/dashboard/ProjectListRow';
import { NewFontDialog } from '@/src/components/dashboard/NewFontDialog';
import { ImportFontDialog } from '@/src/components/dashboard/ImportFontDialog';
import { ExportDialog } from '@/src/components/editor/ExportDialog';
import { FontProject } from '@/src/types/font';
import { fontStorage, createNewFontProject, initFontStorage } from '@/src/lib/fonts/fontStorage';
import { useToast } from '@/src/components/ui/Toast';
import { Plus, Upload, LayoutGrid, List, Sparkles } from 'lucide-react';

interface DashboardProps {
  onNavigate: (path: string) => void;
  onOpenFont: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenFont,
}) => {
  const [projects, setProjects] = useState<FontProject[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [exportProject, setExportProject] = useState<FontProject | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Initialize storage and subscribe to updates
    initFontStorage().then((initial) => {
      setProjects(initial);
    });

    const unsubscribe = fontStorage.subscribe((updated) => {
      setProjects(updated);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateProject = (data: { family: string; style: string; weight: number; width: string }) => {
    const newProj = createNewFontProject(data);
    fontStorage.saveProject(newProj);
    toast({
      type: 'success',
      title: 'Created Font',
      description: `${newProj.family} (${newProj.style}) is ready for editing.`,
    });
    onOpenFont(newProj.id);
  };

  const handleImportSuccess = (importedProjects: FontProject[]) => {
    if (importedProjects.length === 0) return;
    fontStorage.saveProjects(importedProjects);

    const first = importedProjects[0];
    toast({
      type: 'success',
      title: importedProjects.length > 1 ? 'Font Family Imported' : 'Font Imported',
      description:
        importedProjects.length > 1
          ? `${first.family} imported with ${importedProjects.length} styles.`
          : `${first.family} (${first.style}) imported.`,
    });
    onOpenFont(first.id);
  };

  const handleDeleteProject = (id: string) => {
    fontStorage.deleteProject(id);
    toast({ type: 'info', title: 'Project removed' });
  };

  const handleDuplicateProject = (id: string) => {
    const dup = fontStorage.duplicateProject(id);
    if (dup) {
      toast({ type: 'success', title: 'Project duplicated' });
    }
  };

  return (
    <DashboardLayout
      currentTab="projects"
      onNavigateTab={(tab) => {
        if (tab === 'settings') {
          onNavigate('/settings');
        }
      }}
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-900">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-neutral-100">
              Foundry Projects
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {projects.length} {projects.length === 1 ? 'font' : 'fonts'} in local workspace
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex items-center border border-neutral-800 bg-neutral-900 p-0.5 mr-2 rounded-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 transition-colors cursor-pointer rounded-xs ${
                  viewMode === 'grid' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 transition-colors cursor-pointer rounded-xs ${
                  viewMode === 'list' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Import Fonts
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewDialogOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Font
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div>
          {projects.length === 0 ? (
            // Clean slate empty state (No sample/demo projects forced on the user)
            <div className="border border-dashed border-neutral-850 p-16 text-center space-y-4 rounded-xs bg-neutral-900/10">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <Sparkles className="w-5 h-5 text-neutral-300" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-semibold text-neutral-200">Your foundry is empty</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Start fresh by creating a new typeface or import existing font families (.ttf, .otf, .woff, .json) to inspect and edit.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button size="sm" variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  Import Font / Family
                </Button>
                <Button size="sm" variant="primary" onClick={() => setIsNewDialogOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Create New Font
                </Button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={onOpenFont}
                  onDuplicate={handleDuplicateProject}
                  onDelete={handleDeleteProject}
                  onExport={(p) => setExportProject(p)}
                />
              ))}
            </div>
          ) : (
            <div className="border border-neutral-900 bg-neutral-950 divide-y divide-neutral-900 rounded-xs overflow-hidden">
              {projects.map((project) => (
                <ProjectListRow
                  key={project.id}
                  project={project}
                  onOpen={onOpenFont}
                  onDuplicate={handleDuplicateProject}
                  onDelete={handleDeleteProject}
                  onExport={(p) => setExportProject(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <NewFontDialog
        isOpen={isNewDialogOpen}
        onClose={() => setIsNewDialogOpen(false)}
        onCreate={handleCreateProject}
      />

      <ImportFontDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <ExportDialog
        isOpen={!!exportProject}
        onClose={() => setExportProject(null)}
        project={exportProject}
      />
    </DashboardLayout>
  );
};
