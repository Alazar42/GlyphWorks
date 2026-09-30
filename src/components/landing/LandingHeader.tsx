import React from 'react';
import { Button } from '@/src/components/ui/Button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';

interface LandingHeaderProps {
  onStartCreating: () => void;
  onImportClick: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onStartCreating,
  onImportClick,
}) => {
  return (
    <header className="w-full border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tracking-wider font-semibold text-neutral-100 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            GlyphWorks
          </span>
          <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-widest text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full">
            Vector Typography Studio
          </span>
        </div>

        {/* Navigation & CTAs (Zero Auth Barriers) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer hidden md:inline"
          >
            Features
          </button>

          <ThemeToggle variant="icon" />

          <Button
            size="sm"
            variant="outline"
            onClick={onImportClick}
          >
            Import Fonts
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onStartCreating}
          >
            Launch Studio
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </header>
  );
};
