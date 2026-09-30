import React from 'react';
import { 
  MousePointer2, 
  ZoomIn, 
  Paintbrush, 
  Spline, 
  Layers, 
  HardDrive 
} from 'lucide-react';

export const LandingCapabilities: React.FC = () => {
  const capabilities = [
    {
      num: '01',
      title: 'VECTOR PRECISION',
      desc: 'Illustrator-grade direct node & edge multi-selection. Drag edges and node clusters together with sub-pixel snap.',
      icon: <MousePointer2 className="w-4 h-4 text-sky-400" />,
    },
    {
      num: '02',
      title: 'GODOT 2D ZOOM',
      desc: 'Focal mouse-anchored scroll zoom and Spacebar canvas pan. The point under your cursor stays 100% stationary.',
      icon: <ZoomIn className="w-4 h-4 text-sky-400" />,
    },
    {
      num: '03',
      title: 'FREE PEN BRUSH',
      desc: 'Draw fluid outlines directly with the adjustable brush tool. Automatically compiles stroke paths into font contours.',
      icon: <Paintbrush className="w-4 h-4 text-sky-400" />,
    },
    {
      num: '04',
      title: 'PERFORMANT ARCING',
      desc: 'High-speed curvature tension sliders on the inspector and interactive canvas edge bowing with instant 60fps response.',
      icon: <Spline className="w-4 h-4 text-sky-400" />,
    },
    {
      num: '05',
      title: 'FAMILY INTELLIGENCE',
      desc: 'Import dozens of font files together. Automatically detects family names, weights, and styles from filenames.',
      icon: <Layers className="w-4 h-4 text-sky-400" />,
    },
    {
      num: '06',
      title: 'UNBOUNDED STORAGE',
      desc: 'Powered by local IndexedDB. No 5MB browser storage limits, zero cloud latency, and 100% private offline storage.',
      icon: <HardDrive className="w-4 h-4 text-sky-400" />,
    },
  ];

  return (
    <section id="features" className="py-20 border-t border-neutral-900 px-6 max-w-6xl mx-auto">
      <div className="mb-12">
        <span className="text-[11px] font-mono tracking-widest uppercase text-sky-400 font-semibold">
          Architecture & Capabilities
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 mt-2">
          Engineered for serious type designers.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {capabilities.map((item) => (
          <div key={item.num} className="p-5 bg-neutral-900/30 border border-neutral-850 hover:border-neutral-700 transition-colors rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider font-semibold text-neutral-200">
                {item.icon}
                <span>{item.title}</span>
              </div>
              <span className="font-mono text-xs text-neutral-600 font-semibold">{item.num}</span>
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
