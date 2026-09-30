import React, { useState } from 'react';
import { LandingHeader } from '@/src/components/landing/LandingHeader';
import { LandingHero } from '@/src/components/landing/LandingHero';
import { LandingCapabilities } from '@/src/components/landing/LandingCapabilities';
import { LandingWorkflow } from '@/src/components/landing/LandingWorkflow';
import { LandingFooter } from '@/src/components/landing/LandingFooter';
import { ImportFontDialog } from '@/src/components/dashboard/ImportFontDialog';
import { FontProject } from '@/src/types/font';
import { fontStorage } from '@/src/lib/fonts/fontStorage';

interface LandingProps {
  onNavigate: (path: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleStartCreating = () => {
    onNavigate('/dashboard');
  };

  const handleOpenFont = (id: string) => {
    onNavigate(`/editor/${id}`);
  };

  const handleImportSuccess = (importedProjects: FontProject[]) => {
    if (importedProjects.length > 0) {
      fontStorage.saveProjects(importedProjects);
      onNavigate(`/editor/${importedProjects[0].id}`);
    }
  };

  const handleLearnMore = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      <LandingHeader
        onStartCreating={handleStartCreating}
        onImportClick={() => setIsImportOpen(true)}
      />
      <main className="flex-1">
        <LandingHero
          onStartCreating={handleStartCreating}
          onOpenFont={handleOpenFont}
          onLearnMore={handleLearnMore}
        />
        <LandingCapabilities />
        <LandingWorkflow />
        <LandingFooter onStartCreating={handleStartCreating} />
      </main>

      <ImportFontDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};
