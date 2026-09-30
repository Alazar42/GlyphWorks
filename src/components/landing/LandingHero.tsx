import React, { useState, useRef } from 'react';
import { Button } from '@/src/components/ui/Button';
import { ProductPreview } from './ProductPreview';
import { 
  ArrowRight, 
  Upload, 
  Layers, 
  MousePointer2, 
  Paintbrush, 
  Spline, 
  ZoomIn, 
  HardDrive, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { inspectFontFiles, parseFontFile } from '@/src/lib/fonts/fontConverter';
import { fontStorage } from '@/src/lib/fonts/fontStorage';
import { FontProject } from '@/src/types/font';
import { DEFAULT_METRICS, generateInitialGlyphSet } from '@/src/lib/fonts/defaultFont';

interface LandingHeroProps {
  onStartCreating: () => void;
  onOpenFont: (id: string) => void;
  onLearnMore: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartCreating,
  onOpenFont,
  onLearnMore,
}) => {
  const [isDraggingHero, setIsDraggingHero] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Live Typography Playground
  const [previewText, setPreviewText] = useState('Typographic Precision');
  const [previewWeight, setPreviewWeight] = useState(400);
  const [previewTracking, setPreviewTracking] = useState(0);
  const [showWireframe, setShowWireframe] = useState(true);

  const handleHeroDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingHero(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    setIsProcessingDrop(true);
    try {
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.match(/\.(ttf|otf|woff|woff2|json)$/i)
      );
      if (files.length === 0) return;

      const inspected = await inspectFontFiles(files);
      const primaryFamily = inspected[0]?.familyName || 'Imported Family';
      const now = new Date().toISOString();

      if (inspected.length > 1) {
        // Bundle as single font project with [number] types
        const types: any[] = [];
        for (const item of inspected) {
          let parsed = item.parsedProject;
          if (!parsed) {
            parsed = await parseFontFile(item.file);
          }
          const style = item.styleName.trim() || 'Regular';
          types.push({
            id: 'type_' + Math.random().toString(36).substring(2, 9),
            name: style,
            weight: item.weight || 400,
            width: item.width || 'Normal',
            isItalic: item.isItalic,
            metrics: parsed?.metrics || { ...DEFAULT_METRICS },
            glyphs:
              parsed?.glyphs && Object.keys(parsed.glyphs).length > 0
                ? { ...generateInitialGlyphSet(), ...parsed.glyphs }
                : generateInitialGlyphSet(),
          });
        }

        types.sort((a, b) => a.weight - b.weight);
        const primaryType = types.find((t) => t.weight === 400 && !t.isItalic) || types[0];

        const singleFamilyProject: FontProject = {
          id: 'fnt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          name: primaryFamily,
          family: primaryFamily,
          style: primaryType.name,
          weight: primaryType.weight,
          width: primaryType.width,
          version: '1.000',
          description: `Font Family with ${types.length} styles`,
          designer: 'Type Designer',
          license: 'OFL-1.1',
          createdAt: now,
          updatedAt: now,
          isFamily: true,
          types: types,
          activeTypeId: primaryType.id,
          metrics: primaryType.metrics,
          glyphs: primaryType.glyphs,
        };

        fontStorage.saveProjects([singleFamilyProject]);
        onOpenFont(singleFamilyProject.id);
      } else {
        const item = inspected[0];
        let parsed = item.parsedProject;
        if (!parsed) {
          parsed = await parseFontFile(item.file);
        }
        const style = item.styleName.trim() || 'Regular';
        const singleProject: FontProject = {
          id: 'fnt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          name: `${primaryFamily} ${style}`.trim(),
          family: primaryFamily,
          style,
          weight: item.weight || 400,
          width: item.width || 'Normal',
          version: '1.000',
          description: `Imported from ${item.fileName}`,
          createdAt: now,
          updatedAt: now,
          isFamily: false,
          types: [
            {
              id: 'type_def',
              name: style,
              weight: item.weight || 400,
              width: item.width || 'Normal',
              metrics: parsed?.metrics || { ...DEFAULT_METRICS },
              glyphs: parsed?.glyphs || generateInitialGlyphSet(),
            },
          ],
          activeTypeId: 'type_def',
          metrics: parsed?.metrics || { ...DEFAULT_METRICS },
          glyphs:
            parsed?.glyphs && Object.keys(parsed.glyphs).length > 0
              ? { ...generateInitialGlyphSet(), ...parsed.glyphs }
              : generateInitialGlyphSet(),
        };

        fontStorage.saveProjects([singleProject]);
        onOpenFont(singleProject.id);
      }
    } catch (err) {
      console.error('Failed to import dropped font in hero:', err);
    } finally {
      setIsProcessingDrop(false);
    }
  };

  return (
    <section className="pt-14 pb-20 px-6 max-w-6xl mx-auto space-y-12">
      {/* Top Value Headline */}
      <div className="max-w-3xl space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
          <span>Zero Sign-In · No 5MB Quotas · 100% Offline-First</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-neutral-100 text-balance leading-[1.1]">
          The Open Studio for Vector Typography.
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 font-normal leading-relaxed text-balance max-w-2xl">
          Craft, refine, and compile typefaces with Adobe Illustrator-grade node selection, Godot 2D viewport focal zoom, free pen drawing, performant arcing, and intelligent multi-file font family import.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button
            size="lg"
            variant="primary"
            onClick={onStartCreating}
          >
            Launch Studio
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2 text-neutral-400" />
            Import Font or Family
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const fakeEvent = {
                  preventDefault: () => {},
                  dataTransfer: { files: e.target.files },
                } as any;
                handleHeroDrop(fakeEvent);
              }
            }}
            accept=".ttf,.otf,.woff,.woff2,.json"
            multiple
            className="hidden"
          />

          <Button
            size="lg"
            variant="ghost"
            onClick={onLearnMore}
          >
            Capabilities
          </Button>
        </div>
      </div>

      {/* Hero Feature Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Free Pen Brush', sub: 'Adjustable size', icon: <Paintbrush className="w-3.5 h-3.5 text-sky-400" /> },
          { label: 'Godot 2D Zoom', sub: 'Focal mouse zoom', icon: <ZoomIn className="w-3.5 h-3.5 text-sky-400" /> },
          { label: 'Illustrator Nodes', sub: 'Multi-node & edge drag', icon: <MousePointer2 className="w-3.5 h-3.5 text-sky-400" /> },
          { label: 'Performant Arcing', sub: 'Fast 60fps curvature', icon: <Spline className="w-3.5 h-3.5 text-sky-400" /> },
          { label: 'Family Import', sub: 'Auto style detection', icon: <Layers className="w-3.5 h-3.5 text-sky-400" /> },
          { label: 'Unlimited DB', sub: 'No 5MB storage caps', icon: <HardDrive className="w-3.5 h-3.5 text-sky-400" /> },
        ].map((feat, idx) => (
          <div
            key={idx}
            className="p-3 bg-neutral-900/40 border border-neutral-850 hover:border-neutral-700 transition-colors rounded-xs space-y-1"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
              {feat.icon}
              <span>{feat.label}</span>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono">{feat.sub}</p>
          </div>
        ))}
      </div>

      {/* Interactive Drag & Drop Zone + Live Type Playground */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingHero(true);
        }}
        onDragLeave={() => setIsDraggingHero(false)}
        onDrop={handleHeroDrop}
        className={`relative border transition-all rounded-xs overflow-hidden ${
          isDraggingHero
            ? 'border-sky-400 bg-sky-950/20 ring-4 ring-sky-500/20'
            : 'border-neutral-800 bg-neutral-950/80 shadow-2xl'
        }`}
      >
        {/* Dropzone Overlay Banner */}
        <div className="px-5 py-2.5 bg-neutral-900/80 border-b border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <Upload className="w-4 h-4 text-sky-400" />
            <span className="font-medium">Instant Dropzone:</span>
            <span className="text-neutral-400 text-[11px]">
              Drag & drop any font file or entire font family (.ttf, .otf, .woff) right here to open
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
            <span>Tracking: {previewTracking}px</span>
            <span>Weight: {previewWeight}</span>
            <button
              onClick={() => setShowWireframe(!showWireframe)}
              className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                showWireframe ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              Wireframe: {showWireframe ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Live Interactive Text & Contour Stage */}
        <div className="p-8 sm:p-12 relative overflow-hidden bg-neutral-950 min-h-[220px] flex flex-col justify-center">
          {/* Subtle guide background */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 space-y-4">
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full bg-transparent text-3xl sm:text-4xl md:text-5xl font-sans tracking-tight text-neutral-100 outline-none border-b border-transparent hover:border-neutral-800 focus:border-neutral-700 transition-colors"
              style={{
                fontWeight: previewWeight,
                letterSpacing: `${previewTracking}px`,
              }}
              title="Click to edit preview string"
            />

            {/* Wireframe vector point simulation overlay */}
            {showWireframe && (
              <div className="flex items-center gap-2 pt-2 text-[10px] font-mono text-neutral-500">
                <span className="w-2 h-2 rounded-xs bg-sky-400 inline-block"></span>
                <span>On-curve anchor nodes</span>
                <span className="w-px h-3 bg-neutral-800 mx-1"></span>
                <span className="w-2 h-2 rounded-full border border-neutral-400 inline-block"></span>
                <span>Bezier control handles</span>
                <span className="w-px h-3 bg-neutral-800 mx-1"></span>
                <span className="text-neutral-400">Baseline (0) · Cap-Height (700) · Ascender (800)</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="p-3 bg-neutral-900/50 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-neutral-500">Weight</span>
              <input
                type="range"
                min="100"
                max="900"
                step="100"
                value={previewWeight}
                onChange={(e) => setPreviewWeight(parseInt(e.target.value, 10))}
                className="w-24 accent-sky-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-neutral-500">Tracking</span>
              <input
                type="range"
                min="-2"
                max="16"
                value={previewTracking}
                onChange={(e) => setPreviewTracking(parseInt(e.target.value, 10))}
                className="w-20 accent-sky-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onStartCreating}>
              Open in Studio <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Vector Studio Interface Preview */}
      <div className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
              Live Workspace Architecture
            </span>
            <h3 className="text-xl font-semibold text-neutral-100">
              Complete Illustrator-style vector studio
            </h3>
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
};
