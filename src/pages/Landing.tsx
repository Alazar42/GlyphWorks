import React from 'react';
import { LandingHeader } from '@/src/components/landing/LandingHeader';
import { LandingHero } from '@/src/components/landing/LandingHero';
import { LandingCapabilities } from '@/src/components/landing/LandingCapabilities';
import { LandingWorkflow } from '@/src/components/landing/LandingWorkflow';
import { LandingFooter } from '@/src/components/landing/LandingFooter';

interface LandingProps {
  onNavigate: (path: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const handleStartCreating = () => {
    onNavigate('/dashboard');
  };

  const handleSignIn = () => {
    onNavigate('/signin');
  };

  const handleLearnMore = () => {
    const el = document.getElementById('capabilities');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-neutral-800">
      <LandingHeader
        onStartCreating={handleStartCreating}
        onSignIn={handleSignIn}
      />
      <main className="flex-1">
        <LandingHero
          onStartCreating={handleStartCreating}
          onLearnMore={handleLearnMore}
        />
        <LandingCapabilities />
        <LandingWorkflow />
        <LandingFooter onStartCreating={handleStartCreating} />
      </main>
    </div>
  );
};
