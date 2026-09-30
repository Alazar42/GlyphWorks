export interface VectorPoint {
  id: string;
  x: number;
  y: number;
  type: 'onCurve' | 'control1' | 'control2';
  selected?: boolean;
}

export interface PathContour {
  id: string;
  closed: boolean;
  points: VectorPoint[];
}

export interface GlyphData {
  unicode: number;
  name: string;
  char: string;
  advanceWidth: number;
  leftSideBearing: number;
  contours: PathContour[];
  hasCustomPath?: boolean;
}

export interface FontMetrics {
  unitsPerEm: number;
  ascender: number;
  capHeight: number;
  xHeight: number;
  baseline: number;
  descender: number;
}

export interface FontTypeStyle {
  id: string;
  name: string; // e.g. "Regular", "Bold", "Light Italic"
  weight: number; // 100 to 950
  width: string; // "Normal", "Condensed", etc.
  isItalic?: boolean;
  metrics: FontMetrics;
  glyphs: Record<string, GlyphData>;
}

export interface FontProject {
  id: string;
  name: string;
  family: string;
  familyId?: string;
  style: string;
  weight: number;
  width: string;
  version: string;
  description?: string;
  designer?: string;
  license?: string;
  createdAt: string;
  updatedAt: string;
  isFamily?: boolean;
  types?: FontTypeStyle[];
  activeTypeId?: string;
  metrics: FontMetrics;
  glyphs: Record<string, GlyphData>; // Keyed by char or glyph name
}

export type EditorTool = 
  | 'select' 
  | 'node' 
  | 'pen' 
  | 'brush'
  | 'arc'
  | 'line' 
  | 'rectangle' 
  | 'ellipse' 
  | 'pan' 
  | 'measure';

export interface EditorViewTransform {
  zoom: number;
  panX: number;
  panY: number;
}

export interface DetectedFontFile {
  id: string;
  file: File;
  fileName: string;
  familyName: string;
  styleName: string;
  weight: number;
  width: string;
  isItalic: boolean;
  glyphCount?: number;
  parsedProject?: Partial<FontProject>;
}
