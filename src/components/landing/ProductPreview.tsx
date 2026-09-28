import React, { useState } from 'react';
import { 
  MousePointer2, 
  PenTool, 
  Waypoints, 
  Square, 
  Circle, 
  Minus,
  Maximize2,
  ZoomIn,
  Sliders
} from 'lucide-react';

export const ProductPreview: React.FC = () => {
  const [activeGlyph, setActiveGlyph] = useState('A');
  const [activeTool, setActiveTool] = useState('select');
  const [showGrid, setShowGrid] = useState(true);

  const sampleGlyphs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'O', 'T', 'X'];

  return (
    <div className="w-full border border-neutral-800 bg-neutral-900/60 shadow-2xl overflow-hidden text-neutral-100 flex flex-col">
      {/* Mini App Chrome */}
      <div className="h-9 border-b border-neutral-800 bg-neutral-900 px-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-700/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-700/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-700/60" />
          </div>
          <span className="font-mono text-neutral-400">Untitled Font</span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-500 font-mono text-[11px]">Glyph: {activeGlyph} (U+00{activeGlyph.charCodeAt(0).toString(16).toUpperCase()})</span>
        </div>
        <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
          <span className="font-mono text-neutral-400">1000 UPM</span>
          <span className="text-neutral-700">|</span>
          <span className="text-neutral-300 font-medium">Export TTF</span>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex h-96">
        {/* Mini Left Toolbar */}
        <div className="w-10 border-r border-neutral-800 bg-neutral-950 flex flex-col items-center py-2 gap-1 shrink-0">
          {[
            { id: 'select', icon: <MousePointer2 className="w-3.5 h-3.5" /> },
            { id: 'node', icon: <Waypoints className="w-3.5 h-3.5" /> },
            { id: 'pen', icon: <PenTool className="w-3.5 h-3.5" /> },
            { id: 'line', icon: <Minus className="w-3.5 h-3.5" /> },
            { id: 'rect', icon: <Square className="w-3.5 h-3.5" /> },
            { id: 'ellipse', icon: <Circle className="w-3.5 h-3.5" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`w-7 h-7 flex items-center justify-center transition-colors ${
                activeTool === t.id
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {t.icon}
            </button>
          ))}
          <div className="w-5 h-px bg-neutral-800 my-1.5" />
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
            className={`w-7 h-7 flex items-center justify-center text-xs font-mono ${
              showGrid ? 'text-neutral-200' : 'text-neutral-600'
            }`}
          >
            #
          </button>
        </div>

        {/* Mini Canvas */}
        <div className="flex-1 bg-neutral-950 relative overflow-hidden flex items-center justify-center">
          {/* Subtle grid */}
          {showGrid && (
            <div
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          )}

          {/* SVG Vector Canvas Display */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Typographic Guide lines */}
            <div className="absolute inset-x-0 top-[18%] border-b border-dashed border-neutral-700/60 pointer-events-none">
              <span className="absolute right-1 -top-3 text-[9px] font-mono text-neutral-500">Ascender (800)</span>
            </div>
            <div className="absolute inset-x-0 top-[26%] border-b border-dashed border-neutral-600/70 pointer-events-none">
              <span className="absolute right-1 -top-3 text-[9px] font-mono text-neutral-400">Cap Height (700)</span>
            </div>
            <div className="absolute inset-x-0 top-[44%] border-b border-dashed border-neutral-700/60 pointer-events-none">
              <span className="absolute right-1 -top-3 text-[9px] font-mono text-neutral-500">x-Height (500)</span>
            </div>
            <div className="absolute inset-x-0 top-[76%] border-b border-neutral-500/80 pointer-events-none">
              <span className="absolute right-1 -top-3 text-[9px] font-mono text-neutral-300">Baseline (0)</span>
            </div>
            <div className="absolute inset-x-0 top-[90%] border-b border-dashed border-neutral-700/60 pointer-events-none">
              <span className="absolute right-1 -top-3 text-[9px] font-mono text-neutral-500">Descender (-200)</span>
            </div>

            {/* Left & Right Bearings */}
            <div className="absolute inset-y-0 left-6 border-l border-neutral-800 pointer-events-none">
              <span className="absolute left-1 bottom-1 text-[8px] font-mono text-neutral-600">LSB 40</span>
            </div>
            <div className="absolute inset-y-0 right-6 border-r border-neutral-800 pointer-events-none">
              <span className="absolute right-1 bottom-1 text-[8px] font-mono text-neutral-600">RSB 40</span>
            </div>

            {/* Rendered Glyph Vector Nodes Simulation */}
            <svg
              viewBox="0 0 700 900"
              className="w-full h-full text-neutral-100 overflow-visible"
              style={{ transform: 'scale(1, -1)' }} // Font coordinates standard (baseline y=0 up)
            >
              {activeGlyph === 'A' ? (
                <>
                  <polygon
                    points="60,180 320,780 380,780 640,180 540,180 460,370 240,370 160,180"
                    fill="rgba(255,255,255,0.06)"
                    stroke="#ffffff"
                    strokeWidth="4"
                  />
                  <polygon
                    points="270,440 430,440 350,630"
                    fill="#0a0a0a"
                    stroke="#ffffff"
                    strokeWidth="4"
                  />
                  {/* Anchor point markers */}
                  {[[60,180],[320,780],[380,780],[640,180],[540,180],[460,370],[240,370],[160,180],[270,440],[430,440],[350,630]].map(([x, y], idx) => (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="7"
                      fill={idx === 1 ? '#38bdf8' : '#ffffff'}
                      stroke="#000000"
                      strokeWidth="2"
                    />
                  ))}
                </>
              ) : (
                <text
                  x="350"
                  y="-180"
                  textAnchor="middle"
                  transform="scale(1, -1)"
                  className="fill-neutral-200 text-[380px] font-sans font-light"
                >
                  {activeGlyph}
                </text>
              )}
            </svg>
          </div>
        </div>

        {/* Mini Right Inspector */}
        <div className="w-48 border-l border-neutral-800 bg-neutral-950 p-3 flex flex-col justify-between text-xs">
          <div className="space-y-3">
            <div className="pb-2 border-b border-neutral-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Glyph Info</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-sm font-semibold">{activeGlyph}</span>
                <span className="font-mono text-[10px] text-neutral-400">U+00{activeGlyph.charCodeAt(0).toString(16).toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Advance Width</span>
                <span className="font-mono text-neutral-200">650</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Left Bearing</span>
                <span className="font-mono text-neutral-200">50</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Right Bearing</span>
                <span className="font-mono text-neutral-200">50</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Contours</span>
                <span className="font-mono text-neutral-200">2</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Points</span>
                <span className="font-mono text-neutral-200">11</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
            <span>X: 320</span>
            <span>Y: 780</span>
          </div>
        </div>
      </div>

      {/* Mini Bottom Glyph Strip */}
      <div className="h-10 border-t border-neutral-800 bg-neutral-900 px-2 flex items-center gap-1 overflow-x-auto">
        {sampleGlyphs.map((glyph) => (
          <button
            key={glyph}
            onClick={() => setActiveGlyph(glyph)}
            className={`w-7 h-7 flex items-center justify-center font-mono text-xs transition-colors shrink-0 ${
              activeGlyph === glyph
                ? 'bg-neutral-100 text-neutral-950 font-semibold'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
            }`}
          >
            {glyph}
          </button>
        ))}
      </div>
    </div>
  );
};
