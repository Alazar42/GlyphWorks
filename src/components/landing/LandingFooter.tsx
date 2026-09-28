import React from 'react';
import { Button } from '@/src/components/ui/Button';

interface LandingFooterProps {
  onStartCreating: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onStartCreating }) => {
  return (
    <>
      {/* Final CTA Section */}
      <section className="py-20 border-t border-neutral-900 px-6 max-w-6xl mx-auto text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-100">
              Ready to draw your next typeface?
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              No installation required. Jump straight into the editor.
            </p>
          </div>
          <Button size="lg" variant="primary" onClick={onStartCreating}>
            Start Creating
          </Button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-900 py-8 px-6 bg-neutral-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="font-mono text-neutral-400 font-semibold tracking-wider uppercase">GlyphWorks</span>
            <span className="text-neutral-700">·</span>
            <span>Minimal Web Font Foundry</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>TTF · OTF · WOFF · SVG</span>
            <span className="text-neutral-700">·</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>
    </>
  );
};
