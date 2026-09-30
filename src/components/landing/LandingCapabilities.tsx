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
      desc: 'Direct node and edge multi-selection. Move points, edge segments, and bezier handles together with precision snapping.',
      icon: <MousePointer2 className="w-4 h-4 text-sky-400" />,
    },
    {
      num: '02',
      title: 'FLUID CANVAS',
      desc: 'Focal cursor-anchored zoom and smooth canvas pan navigation. Inspect intricate curves and details effortlessly.',
      icon: <ZoomIn className="w-4 h-4 text-sky-400" />,
    },
    {
      num: '03',
      title: 'FREEHAND DRAWING',
      desc: 'Draw fluid outlines directly with the adjustable brush tool. Automatically creates clean, lightweight vector contours.',
      icon: <Paintbrush className="w-4 h-4 text-sky-400" />,
    },
    {
      num: '04',
      title: 'CURVATURE & BEZIER',
      desc: 'Interactive curvature tension controls and cubic bezier handles for sculpting balanced typographic contours.',
      icon: <Spline className="w-4 h-4 text-sky-400" />,
    },
    {
      num: '05',
      title: 'FAMILY MANAGEMENT',
      desc: 'Import and organize font families with automatic weight, width, and style detection across dozens of styles.',
      icon: <Layers className="w-4 h-4 text-sky-400" />,
    },
    {
      num: '06',
      title: 'OFFLINE & PORTABLE',
      desc: '100% private in-browser storage. Download and transfer your workspace across browsers anytime with .gworks files.',
      icon: <HardDrive className="w-4 h-4 text-sky-400" />,
    },
  ];

  return (
    <section id="features" className="py-20 border-t border-neutral-900 px-6 max-w-6xl mx-auto">
      <div className="mb-12">
        <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-500 font-medium">
          Capabilities
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 mt-2">
          Everything you need to design typefaces.
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
