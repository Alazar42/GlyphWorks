import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/src/components/dashboard/DashboardLayout';
import { Button } from '@/src/components/ui/Button';
import { ProjectCard } from '@/src/components/dashboard/ProjectCard';
import { ProjectListRow } from '@/src/components/dashboard/ProjectListRow';
import { NewFontDialog } from '@/src/components/dashboard/NewFontDialog';
import { ImportFontDialog } from '@/src/components/dashboard/ImportFontDialog';
import { ExportDialog } from '@/src/components/editor/ExportDialog';
import { FontProject } from '@/src/types/font';
import { fontStorage, createNewFontProject } from '@/src/lib/fonts/fontStorage';
import { useToast } from '@/src/components/ui/Toast';
import { Plus, Upload, LayoutGrid, List } from 'lucide-react';

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

  const loadProjects = () => {
    const list = fontStorage.getAllProjects();
    setProjects(list);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = (data: { family: string; style: string; weight: number; width: string }) => {
    const newProj = createNewFontProject(data);
    fontStorage.saveProject(newProj);
    loadProjects();
    toast({
      type: 'success',
      title: 'Created Font',
      description: `${newProj.family} is ready for editing.`,
    });
    onOpenFont(newProj.id);
  };

  const handleImportSuccess = (importedProject: FontProject) => {
    fontStorage.saveProject(importedProject);
    loadProjects();
    toast({
      type: 'success',
      title: 'Import Successful',
      description: `${importedProject.family} imported with ${Object.keys(importedProject.glyphs).length} glyphs.`,
    });
    onOpenFont(importedProject.id);
  };

  const handleDeleteProject = (id: string) => {
    fontStorage.deleteProject(id);
    loadProjects();
    toast({ type: 'info', title: 'Project removed' });
  };

  const handleDuplicateProject = (id: string) => {
    const dup = fontStorage.duplicateProject(id);
    if (dup) {
      loadProjects();
      toast({ type: 'success', title: 'Project duplicated' });
    }
  };

  return (
    <DashboardLayout
      currentTab="projects"
      onNavigateTab={(tab) => {
        if (tab === 'settings' || tab === 'account') {
          onNavigate('/settings');
        }
      }}
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-900">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-neutral-100">
              Projects
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {projects.length} {projects.length === 1 ? 'font project' : 'font projects'} in workspace
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex items-center border border-neutral-800 bg-neutral-900 p-0.5 mr-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 transition-colors ${
                  viewMode === 'grid' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 transition-colors ${
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
              Import
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
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-4">
            Recent
          </div>

          {projects.length === 0 ? (
            <div className="border border-neutral-900 p-12 text-center space-y-3">
              <p className="text-xs text-neutral-400">No font projects found.</p>
              <Button size="sm" variant="primary" onClick={() => setIsNewDialogOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create First Font
              </Button>
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
            <div className="border border-neutral-900 bg-neutral-950 divide-y divide-neutral-900">
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
