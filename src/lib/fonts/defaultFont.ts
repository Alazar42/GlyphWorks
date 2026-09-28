import { FontMetrics, GlyphData, PathContour, VectorPoint } from '@/src/types/font';

export const DEFAULT_METRICS: FontMetrics = {
  unitsPerEm: 1000,
  ascender: 800,
  capHeight: 700,
  xHeight: 500,
  baseline: 0,
  descender: -200,
};

// Helper to create simple vector contours from point arrays
function createContour(points: [number, number, ('onCurve' | 'control1' | 'control2')?][], closed = true): PathContour {
  const p: VectorPoint[] = points.map((pt, index) => ({
    id: `pt_${index}_${Math.random().toString(36).substring(2, 6)}`,
    x: pt[0],
    y: pt[1],
    type: pt[2] || 'onCurve',
  }));
  return {
    id: `cnt_${Math.random().toString(36).substring(2, 8)}`,
    closed,
    points: p,
  };
}

// Generate base geometrical template contours for standard Latin characters
export function createDefaultGlyphContours(char: string): { contours: PathContour[]; advanceWidth: number; lsb: number } {
  const c = char.toUpperCase();
  const isLower = char >= 'a' && char <= 'z';
  const yTop = isLower ? 500 : 700;
  const yBase = 0;

  switch (char) {
    case 'A': {
      // Outer triangle
      const outer = createContour([
        [50, 0],
        [300, 700],
        [350, 700],
        [600, 0],
        [510, 0],
        [430, 220],
        [220, 220],
        [140, 0],
      ]);
      // Inner counter hole
      const inner = createContour([
        [250, 310],
        [400, 310],
        [325, 540],
      ]);
      return { contours: [outer, inner], advanceWidth: 650, lsb: 50 };
    }
    case 'B': {
      const outer = createContour([
        [80, 0],
        [80, 700],
        [350, 700],
        [490, 600],
        [490, 440],
        [380, 370],
        [520, 310],
        [520, 110],
        [380, 0],
      ]);
      const topHole = createContour([
        [180, 430],
        [180, 610],
        [340, 610],
        [390, 560],
        [390, 480],
        [340, 430],
      ]);
      const bottomHole = createContour([
        [180, 90],
        [180, 320],
        [350, 320],
        [410, 270],
        [410, 140],
        [350, 90],
      ]);
      return { contours: [outer, topHole, bottomHole], advanceWidth: 600, lsb: 80 };
    }
    case 'C': {
      const contour = createContour([
        [560, 560],
        [460, 680],
        [310, 700],
        [170, 600],
        [90, 440],
        [90, 260],
        [170, 100],
        [320, 0],
        [480, 20],
        [560, 140],
        [500, 210],
        [430, 100],
        [320, 90],
        [210, 180],
        [190, 300],
        [190, 400],
        [220, 520],
        [310, 610],
        [420, 600],
        [490, 500],
      ]);
      return { contours: [contour], advanceWidth: 630, lsb: 90 };
    }
    case 'D': {
      const outer = createContour([
        [80, 0],
        [80, 700],
        [320, 700],
        [480, 620],
        [560, 480],
        [560, 220],
        [480, 80],
        [320, 0],
      ]);
      const hole = createContour([
        [180, 100],
        [180, 600],
        [300, 600],
        [410, 530],
        [450, 410],
        [450, 290],
        [410, 170],
        [300, 100],
      ]);
      return { contours: [outer, hole], advanceWidth: 640, lsb: 80 };
    }
    case 'E': {
      const contour = createContour([
        [80, 0],
        [80, 700],
        [530, 700],
        [530, 605],
        [180, 605],
        [180, 395],
        [480, 395],
        [480, 305],
        [180, 305],
        [180, 95],
        [550, 95],
        [550, 0],
      ]);
      return { contours: [contour], advanceWidth: 610, lsb: 80 };
    }
    case 'F': {
      const contour = createContour([
        [80, 0],
        [80, 700],
        [530, 700],
        [530, 605],
        [180, 605],
        [180, 395],
        [470, 395],
        [470, 305],
        [180, 305],
        [180, 0],
      ]);
      return { contours: [contour], advanceWidth: 590, lsb: 80 };
    }
    case 'H': {
      const contour = createContour([
        [80, 0],
        [80, 700],
        [180, 700],
        [180, 400],
        [460, 400],
        [460, 700],
        [560, 700],
        [560, 0],
        [460, 0],
        [460, 305],
        [180, 305],
        [180, 0],
      ]);
      return { contours: [contour], advanceWidth: 640, lsb: 80 };
    }
    case 'I': {
      const contour = createContour([
        [70, 0],
        [70, 95],
        [160, 95],
        [160, 605],
        [70, 605],
        [70, 700],
        [330, 700],
        [330, 605],
        [240, 605],
        [240, 95],
        [330, 95],
        [330, 0],
      ]);
      return { contours: [contour], advanceWidth: 400, lsb: 70 };
    }
    case 'O': {
      const outer = createContour([
        [350, 700],
        [190, 650],
        [100, 500],
        [70, 350],
        [100, 200],
        [190, 50],
        [350, 0],
        [510, 50],
        [600, 200],
        [630, 350],
        [600, 500],
        [510, 650],
      ]);
      const inner = createContour([
        [350, 605],
        [450, 560],
        [515, 450],
        [530, 350],
        [515, 250],
        [450, 140],
        [350, 95],
        [250, 140],
        [185, 250],
        [170, 350],
        [185, 450],
        [250, 560],
      ]);
      return { contours: [outer, inner], advanceWidth: 700, lsb: 70 };
    }
    case 'T': {
      const contour = createContour([
        [240, 0],
        [240, 605],
        [40, 605],
        [40, 700],
        [540, 700],
        [540, 605],
        [340, 605],
        [340, 0],
      ]);
      return { contours: [contour], advanceWidth: 580, lsb: 40 };
    }
    case 'X': {
      const contour = createContour([
        [40, 0],
        [220, 350],
        [50, 700],
        [170, 700],
        [290, 470],
        [410, 700],
        [530, 700],
        [360, 350],
        [540, 0],
        [420, 0],
        [290, 240],
        [160, 0],
      ]);
      return { contours: [contour], advanceWidth: 580, lsb: 40 };
    }
    case 'Z': {
      const contour = createContour([
        [60, 0],
        [60, 95],
        [370, 605],
        [80, 605],
        [80, 700],
        [520, 700],
        [520, 615],
        [210, 95],
        [520, 95],
        [520, 0],
      ]);
      return { contours: [contour], advanceWidth: 580, lsb: 60 };
    }
    case ' ': {
      return { contours: [], advanceWidth: 280, lsb: 0 };
    }
    default: {
      // Elegant minimal geometric glyph for any other letter or symbol
      const w = 560;
      const left = 60;
      const stroke = 90;
      if (isLower) {
        // Lowercase base box
        const contour = createContour([
          [left, 0],
          [left, 500],
          [left + stroke, 500],
          [left + stroke, 0],
        ]);
        const cross = createContour([
          [left, 410],
          [w - left, 410],
          [w - left, 500],
          [left, 500],
        ]);
        return { contours: [contour, cross], advanceWidth: w, lsb: left };
      } else {
        // Uppercase minimal architectural pillar/frame
        const leftCol = createContour([
          [left, 0],
          [left, yTop],
          [left + stroke, yTop],
          [left + stroke, 0],
        ]);
        const rightCol = createContour([
          [w - stroke, 0],
          [w - stroke, yTop],
          [w, yTop],
          [w, 0],
        ]);
        const topBar = createContour([
          [left, yTop - stroke],
          [left, yTop],
          [w, yTop],
          [w, yTop - stroke],
        ]);
        return { contours: [leftCol, topBar, rightCol], advanceWidth: w + 60, lsb: left };
      }
    }
  }
}

// Generate the primary glyph set (A-Z, a-z, 0-9, common punctuation)
export function generateInitialGlyphSet(): Record<string, GlyphData> {
  const characters = [
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ...'abcdefghijklmnopqrstuvwxyz',
    ...'0123456789',
    ...'.:,;!?\'"-+*/=()[]{}#@',
    ' ',
  ];

  const glyphMap: Record<string, GlyphData> = {};

  characters.forEach((char) => {
    const { contours, advanceWidth, lsb } = createDefaultGlyphContours(char);
    const unicode = char.charCodeAt(0);
    glyphMap[char] = {
      unicode,
      name: char === ' ' ? 'space' : `uni${unicode.toString(16).toUpperCase().padStart(4, '0')}`,
      char,
      advanceWidth,
      leftSideBearing: lsb,
      contours,
      hasCustomPath: false,
    };
  });

  return glyphMap;
}
