import React from 'react';
import { Button } from '@/src/components/ui/Button';

interface LandingHeaderProps {
  onStartCreating: () => void;
  onSignIn: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onStartCreating,
  onSignIn,
}) => {
  return (
    <header className="w-full border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm tracking-wider font-semibold text-neutral-100 uppercase">
            GlyphWorks
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onSignIn}
            className="text-xs text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <Button
            size="sm"
            variant="primary"
            onClick={onStartCreating}
          >
            Start Creating
          </Button>
        </div>
      </div>
    </header>
  );
};
