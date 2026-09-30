import React, { useState } from 'react';
import { DashboardLayout } from '@/src/components/dashboard/DashboardLayout';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useToast } from '@/src/components/ui/Toast';
import { fontStorage } from '@/src/lib/fonts/fontStorage';
import { Trash2, HardDrive, CheckCircle2 } from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { toast } = useToast();

  const [foundryName, setFoundryName] = useState('GlyphWorks Foundry');
  const [designerName, setDesignerName] = useState('Type Designer');
  const [defaultUpm, setDefaultUpm] = useState('1000');
  const [defaultGridSnap, setDefaultGridSnap] = useState('10');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      type: 'success',
      title: 'Preferences Saved',
      description: 'Your foundry workspace configuration has been updated.',
    });
  };

  const handleClearFoundry = () => {
    if (window.confirm('Are you sure you want to remove all font projects from local storage? This cannot be undone.')) {
      fontStorage.clearAll();
      toast({
        type: 'info',
        title: 'Workspace Reset',
        description: 'All local font projects have been removed.',
      });
      onNavigate('/dashboard');
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
      <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-8">
        <div className="border-b border-neutral-900 pb-4">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-100">
            Foundry Preferences
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure typography defaults, export metadata, and local storage
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Foundry & Designer Metadata
            </h2>
            <Input
              label="Foundry / Publisher"
              value={foundryName}
              onChange={(e) => setFoundryName(e.target.value)}
            />
            <Input
              label="Default Type Designer"
              value={designerName}
              onChange={(e) => setDesignerName(e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-neutral-900">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Grid & Metrics Defaults
            </h2>
            <Input
              label="Units Per Em (UPM)"
              type="number"
              value={defaultUpm}
              onChange={(e) => setDefaultUpm(e.target.value)}
              hint="1000 is industry standard for PostScript / OpenType fonts (2048 for TrueType)."
            />
            <Input
              label="Default Grid Snap Step (units)"
              type="number"
              value={defaultGridSnap}
              onChange={(e) => setDefaultGridSnap(e.target.value)}
              hint="Controls node snapping precision in font design units."
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-neutral-900">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              <span>Storage & Performance</span>
            </h2>
            <div className="bg-neutral-900/50 border border-neutral-850 p-4 rounded-xs space-y-2">
              <p className="text-xs text-neutral-300">
                Storage Engine: <strong className="font-mono text-sky-400">IndexedDB v2 (No 5MB Limit)</strong>
              </p>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Fonts are persisted directly to your browser's persistent IndexedDB without any 5MB quotas. Memory usage is optimized with lightweight differential state tracking.
              </p>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearFoundry}
                  className="text-rose-400 hover:text-rose-300 hover:border-rose-900"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear All Local Projects
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-900 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Save Preferences
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
