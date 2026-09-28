import React from 'react';
import { PenTool, SlidersHorizontal, Download } from 'lucide-react';

export const LandingCapabilities: React.FC = () => {
  const capabilities = [
    {
      num: '01',
      title: 'DESIGN',
      desc: 'Draw and refine glyphs with precise vector tools.',
      icon: <PenTool className="w-4 h-4 text-neutral-400" />,
    },
    {
      num: '02',
      title: 'REFINE',
      desc: 'Control spacing, metrics, and kerning.',
      icon: <SlidersHorizontal className="w-4 h-4 text-neutral-400" />,
    },
    {
      num: '03',
      title: 'EXPORT',
      desc: 'Generate TTF, OTF, WOFF, and WOFF2.',
      icon: <Download className="w-4 h-4 text-neutral-400" />,
    },
  ];

  return (
    <section id="capabilities" className="py-20 border-t border-neutral-900 px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        {capabilities.map((item) => (
          <div key={item.num} className="space-y-3">
            <div className="flex items-center gap-3 text-neutral-400">
              <span className="font-mono text-xs text-neutral-500 font-semibold">{item.num}</span>
              <div className="flex items-center gap-1.5 text-xs font-mono tracking-wider font-semibold text-neutral-200">
                {item.icon}
                <span>{item.title}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
