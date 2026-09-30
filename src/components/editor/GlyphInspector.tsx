import React, { useState } from 'react';
import { GlyphData, FontMetrics, VectorPoint, PathContour } from '@/src/types/font';
import { ChevronDown, ChevronRight, Spline, Sliders, Palette } from 'lucide-react';

interface GlyphInspectorProps {
  glyph: GlyphData;
  metrics: FontMetrics;
  selectedPoint: VectorPoint | null;
  selectedPointCount: number;
  onUpdateGlyphMetrics: (updates: { advanceWidth?: number; leftSideBearing?: number }) => void;
  onUpdatePointCoords: (pointId: string, x: number, y: number, type?: VectorPoint['type']) => void;
  onUpdateFontMetrics: (metrics: Partial<FontMetrics>) => void;
  onReverseContour: (contourId: string) => void;
  onDeleteContour: (contourId: string) => void;
  onApplyArcToSelectedPoint: (tension: number) => void;
  onStraightenSelectedSegment: () => void;
  onUpdateGlyphColor?: (color: string | undefined) => void;
  onUpdateContourColor?: (contourId: string, color: string | undefined) => void;
}

export const GlyphInspector: React.FC<GlyphInspectorProps> = ({
  glyph,
  metrics,
  selectedPoint,
  selectedPointCount,
  onUpdateGlyphMetrics,
  onUpdatePointCoords,
  onUpdateFontMetrics,
  onReverseContour,
  onDeleteContour,
  onApplyArcToSelectedPoint,
  onStraightenSelectedSegment,
  onUpdateGlyphColor,
  onUpdateContourColor,
}) => {
  const [sectionsOpen, setSectionsOpen] = useState({
    glyph: true,
    color: true,
    point: true,
    arcing: true,
    contours: true,
    fontMetrics: false,
  });

  const [arcTension, setArcTension] = useState(40);

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const unicodeHex = `U+${glyph.unicode.toString(16).toUpperCase().padStart(4, '0')}`;
  const rightBearing = Math.max(0, (glyph.advanceWidth || 600) - (glyph.leftSideBearing || 40) - 400);
  const totalPoints = glyph.contours.reduce((sum, c) => sum + (c.points?.length || 0), 0);

  return (
    <aside className="w-60 border-l border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 flex flex-col text-xs text-neutral-700 dark:text-neutral-300 select-none overflow-y-auto shrink-0 z-20">
      {/* Glyph Header Info */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-900 space-y-2">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            Glyph Info
          </span>
          <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">{unicodeHex}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-xl font-light text-neutral-900 dark:text-neutral-100 rounded-xs">
            {glyph.char === ' ' ? '␣' : glyph.char}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {glyph.name}
            </p>
            <p className="text-[11px] text-neutral-500 font-mono">
              Dec {glyph.unicode} · {glyph.contours.length} contours
            </p>
          </div>
        </div>
      </div>

      {/* Glyph & Contour Coloring Section */}
      <div className="border-b border-neutral-200 dark:border-neutral-900">
        <button
          onClick={() => toggleSection('color')}
          className="w-full flex items-center justify-between p-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-sky-500 dark:text-sky-400" />
            <span>Color & Palette</span>
            {glyph.color && (
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/20 ml-1 inline-block"
                style={{ backgroundColor: glyph.color }}
              />
            )}
          </span>
          {sectionsOpen.color ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {sectionsOpen.color && (
          <div className="px-3 pb-3 space-y-2.5">
            {/* Quick Palette Swatches */}
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { hex: '#ffffff', label: 'White' },
                { hex: '#38bdf8', label: 'Sky' },
                { hex: '#3b82f6', label: 'Blue' },
                { hex: '#8b5cf6', label: 'Purple' },
                { hex: '#ec4899', label: 'Pink' },
                { hex: '#ef4444', label: 'Red' },
                { hex: '#f97316', label: 'Orange' },
                { hex: '#eab308', label: 'Yellow' },
                { hex: '#22c55e', label: 'Green' },
                { hex: '#14b8a6', label: 'Teal' },
              ].map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => onUpdateGlyphColor?.(swatch.hex)}
                  title={swatch.label}
                  className={`h-6 rounded-xs border transition-transform hover:scale-105 cursor-pointer ${
                    glyph.color === swatch.hex
                      ? 'border-neutral-900 dark:border-white ring-2 ring-sky-500 shadow-xs'
                      : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              ))}
            </div>

            {/* Custom Color Input & Reset */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-1.5 flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 px-2 py-1 rounded-xs cursor-pointer shadow-2xs">
                <input
                  type="color"
                  value={glyph.color || '#38bdf8'}
                  onChange={(e) => onUpdateGlyphColor?.(e.target.value)}
                  className="w-4 h-4 rounded-xs border-0 bg-transparent cursor-pointer p-0"
                />
                <span className="font-mono text-[10px] text-neutral-800 dark:text-neutral-300 uppercase">
                  {glyph.color || 'Monochrome'}
                </span>
              </label>
              {glyph.color && (
                <button
                  type="button"
                  onClick={() => onUpdateGlyphColor?.(undefined)}
                  className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 text-[10px] text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 rounded-xs cursor-pointer font-mono transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Node Properties */}
      <div className="border-b border-neutral-200 dark:border-neutral-900">
        <button
          onClick={() => toggleSection('point')}
          className="w-full flex items-center justify-between p-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold flex items-center gap-1.5">
            <span>Selection</span>
            {selectedPointCount > 0 && (
              <span className="text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 px-1.5 py-0.2 rounded-full font-mono">
                {selectedPointCount}
              </span>
            )}
          </span>
          {sectionsOpen.point ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {sectionsOpen.point && (
          <div className="px-3 pb-3 space-y-2.5">
            {selectedPoint ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 block mb-0.5">X Coord</span>
                    <input
                      type="number"
                      value={selectedPoint.x}
                      onChange={(e) =>
                        onUpdatePointCoords(
                          selectedPoint.id,
                          parseInt(e.target.value, 10) || 0,
                          selectedPoint.y,
                          selectedPoint.type
                        )
                      }
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 px-2 py-1 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 rounded-xs"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 block mb-0.5">Y Coord</span>
                    <input
                      type="number"
                      value={selectedPoint.y}
                      onChange={(e) =>
                        onUpdatePointCoords(
                          selectedPoint.id,
                          selectedPoint.x,
                          parseInt(e.target.value, 10) || 0,
                          selectedPoint.type
                        )
                      }
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 px-2 py-1 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-500 block mb-1">Point Type</span>
                  <select
                    value={selectedPoint.type}
                    onChange={(e) =>
                      onUpdatePointCoords(
                        selectedPoint.id,
                        selectedPoint.x,
                        selectedPoint.y,
                        e.target.value as any
                      )
                    }
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-200 px-2 py-1 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 rounded-xs cursor-pointer"
                  >
                    <option value="onCurve">On-Curve Anchor</option>
                    <option value="control1">Bezier Control 1</option>
                    <option value="control2">Bezier Control 2</option>
                  </select>
                </div>
              </>
            ) : selectedPointCount > 1 ? (
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-mono py-1">
                {selectedPointCount} nodes selected. Drag any node or edge to move together.
              </p>
            ) : (
              <p className="text-[11px] text-neutral-500 italic py-1">
                Select nodes or edges on canvas to inspect properties.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Performant Arcing & Curvature Tool Panel */}
      <div className="border-b border-neutral-200 dark:border-neutral-900">
        <button
          onClick={() => toggleSection('arcing')}
          className="w-full flex items-center justify-between p-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold flex items-center gap-1.5">
            <Spline className="w-3 h-3 text-sky-500 dark:text-sky-400" />
            <span>Arcing & Curvature</span>
          </span>
          {sectionsOpen.arcing ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {sectionsOpen.arcing && (
          <div className="px-3 pb-3 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-neutral-600 dark:text-neutral-400">Arc Tension / Bulge</span>
                <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-semibold">{arcTension}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={arcTension}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setArcTension(val);
                  onApplyArcToSelectedPoint(val);
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onApplyArcToSelectedPoint(arcTension)}
                className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-[11px] py-1.5 px-2 transition-colors cursor-pointer text-center font-mono rounded-xs shadow-2xs"
                title="Convert segment into a smooth arc"
              >
                Arc Curve
              </button>
              <button
                onClick={onStraightenSelectedSegment}
                className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-[11px] py-1.5 px-2 transition-colors cursor-pointer text-center font-mono rounded-xs shadow-2xs"
                title="Remove bezier curve handles to make straight line"
              >
                Straighten
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 leading-tight">
              Tip: Press <kbd className="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono rounded-xs">C</kbd> or drag any edge on the canvas to curve interactively.
            </p>
          </div>
        )}
      </div>

      {/* Metrics Section: Spacing & Width */}
      <div className="border-b border-neutral-200 dark:border-neutral-900">
        <button
          onClick={() => toggleSection('glyph')}
          className="w-full flex items-center justify-between p-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold">
            Spacing & Bearing
          </span>
          {sectionsOpen.glyph ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {sectionsOpen.glyph && (
          <div className="px-3 pb-3 space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-neutral-600 dark:text-neutral-400">Advance Width</span>
                <span className="text-[11px] font-mono text-neutral-800 dark:text-neutral-200">{glyph.advanceWidth}</span>
              </div>
              <input
                type="number"
                value={glyph.advanceWidth || 600}
                onChange={(e) => onUpdateGlyphMetrics({ advanceWidth: parseInt(e.target.value, 10) || 100 })}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 px-2 py-1 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 rounded-xs shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Left (LSB)</span>
                <input
                  type="number"
                  value={glyph.leftSideBearing || 0}
                  onChange={(e) => onUpdateGlyphMetrics({ leftSideBearing: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 px-2 py-1 font-mono outline-none focus:border-sky-500 dark:focus:border-neutral-600 rounded-xs shadow-2xs"
                />
              </div>

              <div>
                <span className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Right (RSB)</span>
                <input
                  type="number"
                  value={rightBearing}
                  readOnly
                  disabled
                  className="w-full bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-850 text-xs text-neutral-500 dark:text-neutral-400 px-2 py-1 font-mono cursor-not-allowed rounded-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contours Summary */}
      <div className="border-b border-neutral-200 dark:border-neutral-900">
        <button
          onClick={() => toggleSection('contours')}
          className="w-full flex items-center justify-between p-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold">
            Contours ({glyph.contours.length})
          </span>
          {sectionsOpen.contours ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {sectionsOpen.contours && (
          <div className="px-3 pb-3 space-y-1.5">
            <div className="flex justify-between text-[11px] text-neutral-500 font-mono mb-1">
              <span>Total Points</span>
              <span>{totalPoints}</span>
            </div>

            {glyph.contours.map((c, idx) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 text-[11px] rounded-xs shadow-2xs"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-neutral-500">#{idx + 1}</span>
                  <span className="text-neutral-700 dark:text-neutral-300 truncate font-mono">
                    {c.points.length} pts {c.closed ? '(closed)' : '(open)'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={c.color || glyph.color || '#38bdf8'}
                    onChange={(e) => onUpdateContourColor?.(c.id, e.target.value)}
                    title={`Color contour #${idx + 1}`}
                    className="w-3.5 h-3.5 rounded-xs border-0 bg-transparent cursor-pointer p-0 shrink-0"
                  />
                  <button
                    onClick={() => onReverseContour(c.id)}
                    title="Reverse winding direction"
                    className="text-neutral-400 hover:text-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-200 p-0.5 text-[10px] font-mono cursor-pointer transition-colors"
                  >
                    ⇄
                  </button>
                  <button
                    onClick={() => onDeleteContour(c.id)}
                    title="Delete contour"
                    className="text-neutral-400 hover:text-rose-500 dark:text-neutral-500 dark:hover:text-rose-400 p-0.5 cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Font-Wide Metrics */}
      <div className="border-b border-neutral-200 dark:border-neutral-900">
        <button
          onClick={() => toggleSection('fontMetrics')}
          className="w-full flex items-center justify-between p-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold">
            Global Metrics
          </span>
          {sectionsOpen.fontMetrics ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {sectionsOpen.fontMetrics && (
          <div className="px-3 pb-3 space-y-2 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 dark:text-neutral-400">Units Per Em</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">{metrics.unitsPerEm}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 dark:text-neutral-400">Ascender</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">{metrics.ascender}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 dark:text-neutral-400">Cap Height</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">{metrics.capHeight}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 dark:text-neutral-400">x-Height</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">{metrics.xHeight}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 dark:text-neutral-400">Baseline</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">{metrics.baseline}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 dark:text-neutral-400">Descender</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">{metrics.descender}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
