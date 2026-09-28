import React from 'react';
import { Button } from '@/src/components/ui/Button';
import { ProductPreview } from './ProductPreview';
import { ArrowRight } from 'lucide-react';

interface LandingHeroProps {
  onStartCreating: () => void;
  onLearnMore: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartCreating,
  onLearnMore,
}) => {
  return (
    <section className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
      <div className="max-w-2xl mb-12">
        <p className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 mb-3">
          Font Creation for the Web
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-neutral-100 mb-4 text-balance">
          Design your type.
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed mb-8 max-w-xl text-balance">
          Create, refine, preview, and export fonts from a simple browser workspace.
        </p>

        <div className="flex items-center gap-4">
          <Button
            size="lg"
            variant="primary"
            onClick={onStartCreating}
          >
            Start Creating
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onLearnMore}
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Product Preview as the real visual anchor */}
      <div className="mt-8">
        <ProductPreview />
      </div>
    </section>
  );
};
