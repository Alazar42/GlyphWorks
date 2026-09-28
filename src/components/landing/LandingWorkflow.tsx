import React from 'react';

export const LandingWorkflow: React.FC = () => {
  const steps = [
    {
      step: 'Outline',
      detail: 'Draft glyph contours using geometric primitives or cubic bezier pens with snap-to-grid.',
    },
    {
      step: 'Metrics',
      detail: 'Tune cap height, x-height, ascenders, descenders, and side bearings on the typography grid.',
    },
    {
      step: 'Proof',
      detail: 'Preview test strings across varying optical sizes, weights, and letter-spacings in real time.',
    },
    {
      step: 'Compile',
      detail: 'Export valid OpenType binary tables directly in your browser without command-line toolchains.',
    },
  ];

  return (
    <section className="py-20 border-t border-neutral-900 px-6 max-w-6xl mx-auto">
      <div className="mb-10">
        <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-500">
          Workflow
        </span>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-100 mt-2">
          From first node to production font.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((s, idx) => (
          <div key={s.step} className="space-y-2 border-l border-neutral-800 pl-4">
            <span className="font-mono text-[11px] text-neutral-500">Step {idx + 1}</span>
            <h3 className="text-sm font-medium text-neutral-200">{s.step}</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">{s.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
