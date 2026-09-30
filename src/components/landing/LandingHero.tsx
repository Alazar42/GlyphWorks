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

        const widthRank: Record<string, number> = {
          UltraCondensed: 1,
          ExtraCondensed: 2,
          Condensed: 3,
          SemiCondensed: 4,
          Normal: 5,
          SemiExpanded: 6,
          Expanded: 7,
          ExtraExpanded: 8,
          UltraExpanded: 9,
        };
        types.sort((a, b) => {
          const wa = widthRank[a.width] || 5;
          const wb = widthRank[b.width] || 5;
          if (wa !== wb) return wa - wb;
          if (a.weight !== b.weight) return a.weight - b.weight;
          return (a.isItalic ? 1 : 0) - (b.isItalic ? 1 : 0);
        });
        const primaryType =
          types.find((t) => t.weight === 400 && !t.isItalic && t.width === 'Normal') ||
          types.find((t) => t.weight === 400 && !t.isItalic) ||
          types[0];

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
      {/* Top Headline */}
      <div className="max-w-3xl space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          <span>Modern Vector Font Studio</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-neutral-100 text-balance leading-[1.1]">
          Vector Type Design, Simplified.
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 font-normal leading-relaxed text-balance max-w-2xl">
          Design, balance, and compile custom typefaces directly in your browser. From individual glyph contours to full multi-style font families, create and export production-ready fonts with ease.
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
            Import Fonts
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
            Features
          </Button>
        </div>
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
        <div className="px-5 py-2.5 bg-neutral-900/60 border-b border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <Upload className="w-4 h-4 text-sky-400" />
            <span className="font-medium text-neutral-200">Drag & drop fonts:</span>
            <span className="text-neutral-500 text-[11px]">
              Drop any font file (.ttf, .otf, .woff) or entire font family to open immediately
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
            <span>Tracking: {previewTracking}px</span>
            <span>Weight: {previewWeight}</span>
          </div>
        </div>

        {/* Live Interactive Text Stage */}
        <div className="p-8 sm:p-12 relative overflow-hidden bg-neutral-950 min-h-[180px] flex flex-col justify-center">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10">
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full bg-transparent text-3xl sm:text-4xl md:text-5xl font-sans tracking-tight text-neutral-100 outline-none border-b border-transparent hover:border-neutral-850 focus:border-neutral-700 transition-colors"
              style={{
                fontWeight: previewWeight,
                letterSpacing: `${previewTracking}px`,
              }}
              title="Click to edit preview string"
            />
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="p-3 bg-neutral-900/40 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-5">
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
              <span className="text-[11px] font-mono text-neutral-400 w-8">{previewWeight}</span>
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
              <span className="text-[11px] font-mono text-neutral-400 w-6">{previewTracking}</span>
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
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-medium">
              Interactive Workspace
            </span>
            <h3 className="text-xl font-semibold text-neutral-100">
              Modern vector typography editor
            </h3>
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
};
