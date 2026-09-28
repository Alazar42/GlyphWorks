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

export interface FontProject {
  id: string;
  name: string;
  family: string;
  style: string;
  weight: number;
  width: string;
  version: string;
  description?: string;
  designer?: string;
  license?: string;
  createdAt: string;
  updatedAt: string;
  metrics: FontMetrics;
  glyphs: Record<string, GlyphData>; // keyed by char or unicode hex
}

export type EditorTool = 
  | 'select' 
  | 'node' 
  | 'pen' 
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
