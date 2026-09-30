import React from 'react';
import { useTheme, ThemeMode } from '@/src/lib/theme/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'segmented' | 'icon';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'segmented',
}) => {
  const { theme, actualTheme, setTheme } = useTheme();

  if (variant === 'icon') {
    const nextTheme: ThemeMode = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    return (
      <button
        onClick={() => setTheme(nextTheme)}
        className={`p-1.5 rounded-xs border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white transition-colors cursor-pointer ${className}`}
        title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
      >
        {theme === 'system' ? (
          <Laptop className="w-3.5 h-3.5 text-sky-400" />
        ) : theme === 'light' ? (
          <Sun className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
        )}
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 bg-neutral-900 border border-neutral-800 rounded-xs select-none ${className}`}
      title={`Active Theme: ${theme.toUpperCase()}`}
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`px-2 py-1 flex items-center gap-1 text-[11px] font-mono rounded-xs transition-colors cursor-pointer ${
          theme === 'light'
            ? 'bg-neutral-800 text-amber-300 font-semibold shadow-xs'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
        title="Light theme"
      >
        <Sun className="w-3 h-3" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`px-2 py-1 flex items-center gap-1 text-[11px] font-mono rounded-xs transition-colors cursor-pointer ${
          theme === 'dark'
            ? 'bg-neutral-800 text-sky-300 font-semibold shadow-xs'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
        title="Dark theme"
      >
        <Moon className="w-3 h-3" />
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`px-2 py-1 flex items-center gap-1 text-[11px] font-mono rounded-xs transition-colors cursor-pointer ${
          theme === 'system'
            ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-xs'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
        title="Follow system preference"
      >
        <Laptop className="w-3 h-3" />
        <span className="hidden sm:inline">System</span>
      </button>
    </div>
  );
};
