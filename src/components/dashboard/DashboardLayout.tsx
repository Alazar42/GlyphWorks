import React from 'react';
import { Folder, HardDrive } from 'lucide-react';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';

interface DashboardLayoutProps {
  currentTab: 'projects' | 'settings';
  onNavigateTab: (tab: 'projects' | 'settings') => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onNavigateTab,
  children,
}) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
      {/* Narrow Minimal Sidebar */}
      <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-neutral-900 bg-neutral-950 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="h-14 px-5 flex items-center border-b border-neutral-900">
            <span className="font-mono text-sm tracking-wider font-semibold uppercase text-neutral-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              GlyphWorks
            </span>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => onNavigateTab('projects')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer rounded-xs ${
                currentTab === 'projects'
                  ? 'bg-neutral-900 text-neutral-100 border border-neutral-800'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <Folder className="w-3.5 h-3.5 shrink-0" />
              <span>Foundry Projects</span>
            </button>

            <button
              onClick={() => onNavigateTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer rounded-xs ${
                currentTab === 'settings'
                  ? 'bg-neutral-900 text-neutral-100 border border-neutral-800'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 shrink-0" />
              <span>Storage & .gworks</span>
            </button>
          </nav>
        </div>

        {/* Theme Switcher & Storage Status */}
        <div className="p-4 border-t border-neutral-900 space-y-3">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Theme</span>
            <ThemeToggle className="w-full justify-between" />
          </div>

          <div className="pt-2 border-t border-neutral-900/80 space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Local IndexedDB</span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Offline-first workspace. Backup or load anytime via .gworks.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
