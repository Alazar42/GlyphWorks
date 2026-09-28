import React from 'react';
import { Folder, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '@/src/lib/auth/authContext';
import { Avatar } from '@/src/components/ui/Avatar';

interface DashboardLayoutProps {
  currentTab: 'projects' | 'settings' | 'account';
  onNavigateTab: (tab: 'projects' | 'settings' | 'account') => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onNavigateTab,
  children,
}) => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Narrow Minimal Sidebar */}
      <aside className="w-full md:w-52 border-b md:border-b-0 md:border-r border-neutral-900 bg-neutral-950 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="h-14 px-5 flex items-center border-b border-neutral-900">
            <span className="font-mono text-sm tracking-wider font-semibold uppercase text-neutral-100">
              GlyphWorks
            </span>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => onNavigateTab('projects')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'projects'
                  ? 'bg-neutral-900 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <Folder className="w-3.5 h-3.5 shrink-0" />
              <span>Projects</span>
            </button>

            <div className="my-2 h-px bg-neutral-900" />

            <button
              onClick={() => onNavigateTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'settings'
                  ? 'bg-neutral-900 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => onNavigateTab('account')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'account'
                  ? 'bg-neutral-900 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Account</span>
            </button>
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="p-3 border-t border-neutral-900">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={user?.name || user?.email || 'User'} size="sm" src={user?.avatarUrl} />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate text-neutral-200">
                  {user?.name || 'Designer'}
                </p>
                <p className="text-[10px] text-neutral-500 truncate">
                  {user?.email || 'local'}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              title="Sign Out"
              className="text-neutral-500 hover:text-neutral-300 p-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
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
