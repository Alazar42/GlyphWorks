import opentype from 'opentype.js';
import { FontProject, GlyphData, PathContour, VectorPoint, DetectedFontFile } from '@/src/types/font';
import { DEFAULT_METRICS, generateInitialGlyphSet } from './defaultFont';

export interface ExportFontOptions {
  format: 'ttf' | 'otf' | 'woff' | 'svg' | 'json';
  familyName?: string;
  styleName?: string;
}

export interface DetectedFontMeta {
  family: string;
  style: string;
  weight: number;
  width: string;
  isItalic: boolean;
}

/**
 * Intelligently detect font family, style/type, weight, and slant from filename
 */
export function detectFontMetaFromFilename(fileName: string): DetectedFontMeta {
  const base = fileName.replace(/\.[^/.]+$/, '');
  let family = base;
  let stylePart = '';

  if (base.includes('-')) {
    const parts = base.split('-');
    family = parts[0].trim();
    stylePart = parts.slice(1).join(' ').trim();
  } else if (base.includes('_')) {
    const parts = base.split('_');
    family = parts[0].trim();
    stylePart = parts.slice(1).join(' ').trim();
  } else {
    const match = base.match(
      /^(.*?)((?:Thin|Hairline|ExtraLight|UltraLight|Light|Regular|Normal|Book|Roman|Medium|SemiBold|DemiBold|Bold|ExtraBold|UltraBold|Black|Heavy|Italic|Oblique)+.*)$/i
    );
    if (match) {
      family = match[1].trim() || base;
      stylePart = match[2].trim();
    }
  }

  family = family
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

  let weight = 400;
  const lowerStyle = (stylePart || base).toLowerCase();
  const isItalic = lowerStyle.includes('italic') || lowerStyle.includes('oblique');

  if (lowerStyle.includes('extrablack') || lowerStyle.includes('ultrablack')) {
    weight = 950;
  } else if (lowerStyle.includes('black') || lowerStyle.includes('heavy')) {
    weight = 900;
  } else if (lowerStyle.includes('extrabold') || lowerStyle.includes('ultrabold')) {
    weight = 800;
  } else if (lowerStyle.includes('semibold') || lowerStyle.includes('demibold')) {
    weight = 600;
  } else if (lowerStyle.includes('bold')) {
    weight = 700;
  } else if (lowerStyle.includes('medium')) {
    weight = 500;
  } else if (lowerStyle.includes('extralight') || lowerStyle.includes('ultralight')) {
    weight = 200;
  } else if (lowerStyle.includes('light')) {
    weight = 300;
  } else if (lowerStyle.includes('thin') || lowerStyle.includes('hairline')) {
    weight = 100;
  } else if (
    lowerStyle.includes('regular') ||
    lowerStyle.includes('book') ||
    lowerStyle.includes('roman') ||
    lowerStyle.includes('normal')
  ) {
    weight = 400;
  }

  let weightName = 'Regular';
  if (weight === 100) weightName = 'Thin';
  else if (weight === 200) weightName = 'ExtraLight';
  else if (weight === 300) weightName = 'Light';
  else if (weight === 400) weightName = 'Regular';
  else if (weight === 500) weightName = 'Medium';
  else if (weight === 600) weightName = 'SemiBold';
  else if (weight === 700) weightName = 'Bold';
  else if (weight === 800) weightName = 'ExtraBold';
  else if (weight === 900) weightName = 'Black';
  else if (weight === 950) weightName = 'ExtraBlack';

  let style = weightName;
  if (isItalic) {
    style = weight === 400 ? 'Italic' : `${weightName} Italic`;
  }

  return {
    family: family || 'Custom Font',
    style,
    weight,
    width: 'Normal',
    isItalic,
  };
}

/**
 * Build exact SVG path string from glyph contours
 */
export function generateGlyphSvgPath(glyph: GlyphData | undefined | null): string {
  if (!glyph || !glyph.contours || glyph.contours.length === 0) return '';
  let d = '';

  glyph.contours.forEach((contour) => {
    if (!contour.points || contour.points.length === 0) return;
    const pts = contour.points;
    d += `M ${pts[0].x} ${pts[0].y} `;

    let i = 1;
    while (i < pts.length) {
      const pt = pts[i];
      if (pt.type === 'onCurve') {
        d += `L ${pt.x} ${pt.y} `;
        i++;
      } else if (pt.type === 'control1') {
        const next = pts[i + 1];
        if (next && next.type === 'control2') {
          const end = pts[i + 2] || pts[0];
          d += `C ${pt.x} ${pt.y}, ${next.x} ${next.y}, ${end.x} ${end.y} `;
          i += 3;
        } else {
          const end = next || pts[0];
          d += `Q ${pt.x} ${pt.y}, ${end.x} ${end.y} `;
          i += 2;
        }
      } else {
        d += `L ${pt.x} ${pt.y} `;
        i++;
      }
    }

    if (contour.closed) {
      d += 'Z ';
    }
  });

  return d;
}

/**
 * Reconstruct an opentype.Glyph 1:1 with exact vector commands
 */
export function convertGlyphToOpentype(glyph: GlyphData): opentype.Glyph {
  const path = new opentype.Path();

  glyph.contours.forEach((contour) => {
    if (!contour.points || contour.points.length === 0) return;

    const first = contour.points[0];
    path.moveTo(first.x, first.y);

    let i = 1;
    while (i < contour.points.length) {
      const pt = contour.points[i];
      if (pt.type === 'onCurve') {
        path.lineTo(pt.x, pt.y);
        i++;
      } else if (pt.type === 'control1') {
        const nextPt = contour.points[i + 1];
        if (nextPt && nextPt.type === 'control2') {
          const endPt = contour.points[i + 2] || first;
          path.curveTo(pt.x, pt.y, nextPt.x, nextPt.y, endPt.x, endPt.y);
          i += 3;
        } else {
          const endPt = nextPt || first;
          path.quadTo(pt.x, pt.y, endPt.x, endPt.y);
          i += 2;
        }
      } else {
        path.lineTo(pt.x, pt.y);
        i++;
      }
    }

    if (contour.closed) {
      path.close();
    }
  });

  return new opentype.Glyph({
    name: glyph.name || `uni${(glyph.unicode || 0).toString(16).toUpperCase()}`,
    unicode: glyph.unicode,
    advanceWidth: glyph.advanceWidth || 600,
    path,
  });
}

export function buildOpentypeFont(project: FontProject): opentype.Font {
  const glyphsList: opentype.Glyph[] = [];

  // Mandatory .notdef glyph
  const notdefPath = new opentype.Path();
  const capH = project.metrics.capHeight || Math.round(project.metrics.ascender * 0.88) || 700;
  notdefPath.moveTo(100, 0);
  notdefPath.lineTo(100, capH);
  notdefPath.lineTo(500, capH);
  notdefPath.lineTo(500, 0);
  notdefPath.close();
  notdefPath.moveTo(180, 80);
  notdefPath.lineTo(420, 80);
  notdefPath.lineTo(420, capH - 80);
  notdefPath.lineTo(180, capH - 80);
  notdefPath.close();

  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 600,
    path: notdefPath,
  });
  glyphsList.push(notdefGlyph);

  // Convert all project glyphs
  Object.values(project.glyphs).forEach((g) => {
    if (g.name !== '.notdef') {
      try {
        const opGlyph = convertGlyphToOpentype(g);
        glyphsList.push(opGlyph);
      } catch (e) {
        console.warn(`Could not convert glyph '${g.char}':`, e);
      }
    }
  });

  const font = new opentype.Font({
    familyName: project.family || project.name || 'GlyphWorks Sans',
    styleName: project.style || 'Regular',
    unitsPerEm: project.metrics.unitsPerEm || 1000,
    ascender: project.metrics.ascender || 800,
    descender: project.metrics.descender || -200,
    glyphs: glyphsList,
  });

  return font;
}

export function exportFontFile(project: FontProject, options: ExportFontOptions): void {
  const safeName = (project.family || project.name || 'font').toLowerCase().replace(/\s+/g, '-');
  const safeStyle = (project.style || 'regular').toLowerCase().replace(/\s+/g, '-');
  const baseFilename = `${safeName}-${safeStyle}`;

  if (options.format === 'json') {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, `${baseFilename}.glyphworks.json`);
    return;
  }

  if (options.format === 'svg') {
    let svgContent = `<?xml version="1.0" standalone="no"?>\n`;
    svgContent += `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n`;
    svgContent += `<svg xmlns="http://www.w3.org/2000/svg">\n<defs>\n`;
    svgContent += `<font id="${project.family}" horiz-adv-x="${project.metrics.unitsPerEm}">\n`;
    svgContent += `<font-face font-family="${project.family}" units-per-em="${project.metrics.unitsPerEm}" ascent="${project.metrics.ascender}" descent="${project.metrics.descender}" />\n`;

    Object.values(project.glyphs).forEach((g) => {
      const pathData = generateGlyphSvgPath(g);
      svgContent += `  <glyph unicode="${escapeXml(g.char)}" glyph-name="${g.name}" horiz-adv-x="${g.advanceWidth}" d="${pathData}" />\n`;
    });

    svgContent += `</font>\n</defs>\n</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    downloadBlob(blob, `${baseFilename}.svg`);
    return;
  }

  try {
    const font = buildOpentypeFont(project);
    const buffer = font.toArrayBuffer();
    const extension = options.format === 'woff' ? 'woff' : options.format === 'otf' ? 'otf' : 'ttf';
    const mime = options.format === 'woff' ? 'font/woff' : 'font/ttf';
    const blob = new Blob([buffer], { type: mime });
    downloadBlob(blob, `${baseFilename}.${extension}`);
  } catch (err: any) {
    console.error('Export failed:', err);
    throw new Error('Failed to compile font: ' + (err?.message || 'Check contour winding or points'));
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convert opentype.js parsed font into a GlyphWorks project with 1:1 vector outline fidelity
 */
export async function parseFontFile(file: File): Promise<Partial<FontProject>> {
  const buffer = await file.arrayBuffer();

  // If json project
  if (file.name.endsWith('.json')) {
    const text = new TextDecoder().decode(buffer);
    const parsed = JSON.parse(text);
    return parsed;
  }

  const detectedMeta = detectFontMetaFromFilename(file.name);
  const parsedFont = opentype.parse(buffer);

  // Exact names
  const family =
    parsedFont.names.fontFamily?.en || detectedMeta.family || file.name.replace(/\.[^/.]+$/, '');
  const style = parsedFont.names.fontSubfamily?.en || detectedMeta.style || 'Regular';

  // Exact metrics from font tables
  const os2 = (parsedFont.tables as any)?.os2;
  const hhea = (parsedFont.tables as any)?.hhea;

  const unitsPerEm = parsedFont.unitsPerEm || 1000;
  const ascender = parsedFont.ascender || hhea?.ascender || os2?.sTypoAscender || 800;
  const descender = parsedFont.descender || hhea?.descender || os2?.sTypoDescender || -200;

  // Exact capHeight & xHeight from OS/2 table or measured from glyphs
  let capHeight = os2?.sCapHeight;
  let xHeight = os2?.sxHeight;

  if (!capHeight || capHeight <= 0) {
    const glyphH = parsedFont.charToGlyph('H');
    if (glyphH && glyphH.yMax) {
      capHeight = glyphH.yMax;
    } else {
      capHeight = Math.round(ascender * 0.88);
    }
  }

  if (!xHeight || xHeight <= 0) {
    const glyphX = parsedFont.charToGlyph('x');
    if (glyphX && glyphX.yMax) {
      xHeight = glyphX.yMax;
    } else {
      xHeight = Math.round(ascender * 0.62);
    }
  }

  const metrics = {
    unitsPerEm,
    ascender,
    capHeight,
    xHeight,
    baseline: 0,
    descender,
  };

  const glyphs: Record<string, GlyphData> = {};

  for (let i = 0; i < parsedFont.glyphs.length; i++) {
    const g = parsedFont.glyphs.get(i);
    if (!g) continue;

    // Resolve character key
    let char = '';
    if (g.unicode !== undefined && g.unicode !== 0) {
      try {
        char = String.fromCodePoint(g.unicode);
      } catch {
        char = String.fromCharCode(g.unicode);
      }
    } else if (g.unicodes && g.unicodes.length > 0) {
      try {
        char = String.fromCodePoint(g.unicodes[0]);
      } catch {
        char = String.fromCharCode(g.unicodes[0]);
      }
    } else {
      char = g.name || `glyph_${i}`;
    }

    const contours: PathContour[] = [];
    let currentContourPoints: VectorPoint[] = [];

    // Safely retrieve path commands (handling lazy evaluation)
    const pathObj = typeof g.path === 'function' ? (g as any).path() : g.path;
    const commands = pathObj?.commands || [];

    const roundCoord = (n: number) => Math.round(n * 100) / 100;

    for (const cmd of commands) {
      if (cmd.type === 'M') {
        if (currentContourPoints.length > 0) {
          // Remove duplicate closing point if present
          const first = currentContourPoints[0];
          const last = currentContourPoints[currentContourPoints.length - 1];
          if (
            currentContourPoints.length > 1 &&
            last.type === 'onCurve' &&
            last.x === first.x &&
            last.y === first.y
          ) {
            currentContourPoints.pop();
          }

          contours.push({
            id: `cnt_${i}_${contours.length}`,
            closed: true,
            points: currentContourPoints,
          });
          currentContourPoints = [];
        }

        currentContourPoints.push({
          id: `pt_${i}_${contours.length}_${currentContourPoints.length}`,
          x: roundCoord(cmd.x),
          y: roundCoord(cmd.y),
          type: 'onCurve',
        });
      } else if (cmd.type === 'L') {
        currentContourPoints.push({
          id: `pt_${i}_${contours.length}_${currentContourPoints.length}`,
          x: roundCoord(cmd.x),
          y: roundCoord(cmd.y),
          type: 'onCurve',
        });
      } else if (cmd.type === 'Q') {
        currentContourPoints.push({
          id: `pt_${i}_${contours.length}_${currentContourPoints.length}`,
          x: roundCoord(cmd.x1),
          y: roundCoord(cmd.y1),
          type: 'control1',
        });
        currentContourPoints.push({
          id: `pt_${i}_${contours.length}_${currentContourPoints.length + 1}`,
          x: roundCoord(cmd.x),
          y: roundCoord(cmd.y),
          type: 'onCurve',
        });
      } else if (cmd.type === 'C') {
        currentContourPoints.push({
          id: `pt_${i}_${contours.length}_${currentContourPoints.length}`,
          x: roundCoord(cmd.x1),
          y: roundCoord(cmd.y1),
          type: 'control1',
        });
        currentContourPoints.push({
          id: `pt_${i}_${contours.length}_${currentContourPoints.length + 1}`,
          x: roundCoord(cmd.x2),
          y: roundCoord(cmd.y2),
          type: 'control2',
        });
        currentContourPoints.push({
          id: `pt_${i}_${contours.length}_${currentContourPoints.length + 2}`,
          x: roundCoord(cmd.x),
          y: roundCoord(cmd.y),
          type: 'onCurve',
        });
      } else if (cmd.type === 'Z') {
        if (currentContourPoints.length > 0) {
          const first = currentContourPoints[0];
          const last = currentContourPoints[currentContourPoints.length - 1];
          if (
            currentContourPoints.length > 1 &&
            last.type === 'onCurve' &&
            last.x === first.x &&
            last.y === first.y
          ) {
            currentContourPoints.pop();
          }

          contours.push({
            id: `cnt_${i}_${contours.length}`,
            closed: true,
            points: currentContourPoints,
          });
          currentContourPoints = [];
        }
      }
    }

    if (currentContourPoints.length > 0) {
      contours.push({
        id: `cnt_${i}_${contours.length}`,
        closed: true,
        points: currentContourPoints,
      });
    }

    glyphs[char] = {
      unicode: g.unicode || (char.length === 1 ? char.codePointAt(0) || 0 : 0),
      name: g.name || `uni${(g.unicode || 0).toString(16).toUpperCase()}`,
      char,
      advanceWidth: Math.round(g.advanceWidth !== undefined ? g.advanceWidth : (g.xMax || 600) + 50),
      leftSideBearing: Math.round(g.leftSideBearing !== undefined ? g.leftSideBearing : (g.xMin || 0)),
      contours,
      hasCustomPath: contours.length > 0,
    };
  }

  // Detected weight class
  const detectedWeight = os2?.usWeightClass || detectedMeta.weight || 400;

  return {
    name: `${family} ${style}`.trim(),
    family,
    style,
    weight: detectedWeight,
    width: detectedMeta.width,
    metrics,
    glyphs,
  };
}

/**
 * Inspect multiple font files with precision
 */
export async function inspectFontFiles(files: File[]): Promise<DetectedFontFile[]> {
  const results: DetectedFontFile[] = [];

  for (const file of files) {
    const meta = detectFontMetaFromFilename(file.name);
    let parsed: Partial<FontProject> | undefined;
    let glyphCount = 0;

    try {
      parsed = await parseFontFile(file);
      glyphCount = Object.keys(parsed.glyphs || {}).length;
    } catch (e) {
      console.warn(`Could not pre-parse ${file.name}:`, e);
    }

    results.push({
      id: 'fdet_' + Math.random().toString(36).substring(2, 8),
      file,
      fileName: file.name,
      familyName: parsed?.family || meta.family,
      styleName: parsed?.style || meta.style,
      weight: parsed?.weight || meta.weight,
      width: parsed?.width || meta.width,
      isItalic: meta.isItalic,
      glyphCount,
      parsedProject: parsed,
    });
  }

  return results;
}
