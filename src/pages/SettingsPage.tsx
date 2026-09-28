import React, { useState } from 'react';
import { DashboardLayout } from '@/src/components/dashboard/DashboardLayout';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/lib/auth/authContext';
import { useToast } from '@/src/components/ui/Toast';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [foundryName, setFoundryName] = useState('Studio Foundry');
  const [designerName, setDesignerName] = useState(user?.name || 'Type Designer');
  const [defaultUpm, setDefaultUpm] = useState('1000');
  const [googleClientId, setGoogleClientId] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      type: 'success',
      title: 'Preferences Saved',
      description: 'Your default font configuration has been updated.',
    });
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
            Settings & Account
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Workspace defaults and typography preferences
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Foundry Profile
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
              Metrics Defaults
            </h2>
            <Input
              label="Units Per Em (UPM)"
              type="number"
              value={defaultUpm}
              onChange={(e) => setDefaultUpm(e.target.value)}
              hint="1000 is standard for OpenType / PostScript fonts (2048 for TrueType)."
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-neutral-900">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Integrations
            </h2>
            <Input
              label="Google OAuth Client ID (optional)"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="e.g. 1234567890-abcdef.apps.googleusercontent.com"
              hint="Enter your Google Client ID to enable 1-click Google Sign In."
            />
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
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
