import React, { useState, useRef } from 'react';
import { DashboardLayout } from '@/src/components/dashboard/DashboardLayout';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { fontStorage } from '@/src/lib/fonts/fontStorage';
import { Download, Upload, HardDrive, Trash2, ArrowLeft, FileCheck, Layers } from 'lucide-react';
import { FontProject } from '@/src/types/font';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [projects, setProjects] = useState<FontProject[]>(fontStorage.getAllProjects());

  // Listen to fontStorage changes
  React.useEffect(() => {
    return fontStorage.subscribe((updated) => setProjects(updated));
  }, []);

  const totalStyles = projects.reduce((acc, p) => acc + (p.types?.length || 1), 0);

  const handleExportWorkspace = () => {
    if (projects.length === 0) {
      toast({
        type: 'warning',
        title: 'No Projects to Export',
        description: 'Create or import a font before exporting your workspace.',
      });
      return;
    }

    try {
      fontStorage.exportWorkspaceGworks();
      toast({
        type: 'success',
        title: 'Workspace Exported',
        description: `Downloaded ${projects.length} font project(s) as .gworks file.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Export Failed',
        description: err?.message || 'Could not export .gworks file.',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const imported = await fontStorage.importGworksFile(file);
      toast({
        type: 'success',
        title: 'Workspace Restored',
        description: `Imported ${imported.length} project(s) from ${file.name}.`,
      });
      setProjects(fontStorage.getAllProjects());
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Import Failed',
        description: err?.message || 'Failed to import .gworks file.',
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearFoundry = () => {
    if (window.confirm('Are you sure you want to remove all projects from this browser? Ensure you have exported a .gworks backup first.')) {
      fontStorage.clearAll();
      toast({
        type: 'info',
        title: 'Workspace Cleared',
        description: 'All local font projects have been removed.',
      });
      setProjects([]);
    }
  };

  return (
    <DashboardLayout
      currentTab="settings"
      onNavigateTab={(tab) => {
        if (tab === 'projects') {
          onNavigate('/dashboard');
        }
      }}
    >
      <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-neutral-100">
              Workspace Portability & Storage
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Export and import your entire workspace or individual projects across browsers with .gworks files.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Projects
          </Button>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-xs space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Font Projects</span>
            <p className="text-xl font-semibold text-neutral-100">{projects.length}</p>
          </div>
          <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-xs space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Total Styles / Types</span>
            <p className="text-xl font-semibold text-neutral-100">{totalStyles}</p>
          </div>
          <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-xs space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Storage Engine</span>
            <p className="text-sm font-semibold text-sky-400 font-mono flex items-center gap-1.5 pt-1">
              <HardDrive className="w-3.5 h-3.5" />
              IndexedDB (Local)
            </p>
          </div>
        </div>

        {/* Studio Theme & Appearance */}
        <div className="p-5 bg-neutral-900/30 border border-neutral-850 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-neutral-200">
              Studio Theme & Appearance
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Choose between System (follows your OS preference), Light, or Dark theme.
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Transfer & Portability Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Export Box */}
          <div className="p-5 bg-neutral-900/30 border border-neutral-850 rounded-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xs bg-sky-950/80 border border-sky-800/80 text-sky-400 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-medium text-neutral-200">
                Export Workspace (.gworks)
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Download all your browser projects in a single lightweight .gworks archive. You can load this file into any browser or device anytime.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleExportWorkspace}
              disabled={projects.length === 0}
              className="w-full justify-center"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download .gworks Workspace
            </Button>
          </div>

          {/* Import Box */}
          <div className="p-5 bg-neutral-900/30 border border-neutral-850 rounded-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xs bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-medium text-neutral-200">
                Import Workspace or Project (.gworks)
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Upload a .gworks file exported from another browser to immediately load and restore all projects into this browser.
              </p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".gworks,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isImporting}
                className="w-full justify-center"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5 text-neutral-400" />
                Select .gworks File
              </Button>
            </div>
          </div>
        </div>

        {/* Local Storage & Reset */}
        <div className="pt-6 border-t border-neutral-900 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Storage Maintenance
          </h2>

          <div className="p-4 bg-neutral-900/20 border border-neutral-850 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-medium text-neutral-200">
                Reset Local Workspace
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                Deletes all fonts and glyphs stored in this browser's local IndexedDB. Download a .gworks backup before clearing.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFoundry}
              disabled={projects.length === 0}
              className="text-rose-400 hover:text-rose-300 hover:border-rose-900 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear Local Data
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
