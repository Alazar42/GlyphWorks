import opentype from 'opentype.js';
import { FontProject, GlyphData, PathContour, VectorPoint } from '@/src/types/font';

export interface ExportFontOptions {
  format: 'ttf' | 'otf' | 'woff' | 'svg' | 'json';
  familyName?: string;
  styleName?: string;
}

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
    name: glyph.name || `uni${glyph.unicode.toString(16)}`,
    unicode: glyph.unicode,
    advanceWidth: glyph.advanceWidth || 600,
    path,
  });
}

export function buildOpentypeFont(project: FontProject): opentype.Font {
  const glyphsList: opentype.Glyph[] = [];

  // Mandatory .notdef glyph
  const notdefPath = new opentype.Path();
  notdefPath.moveTo(100, 0);
  notdefPath.lineTo(100, project.metrics.capHeight);
  notdefPath.lineTo(500, project.metrics.capHeight);
  notdefPath.lineTo(500, 0);
  notdefPath.close();
  notdefPath.moveTo(180, 80);
  notdefPath.lineTo(420, 80);
  notdefPath.lineTo(420, project.metrics.capHeight - 80);
  notdefPath.lineTo(180, project.metrics.capHeight - 80);
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
    if (g.unicode !== 0) {
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
  const safeStyle = (project.style || 'regular').toLowerCase();
  const baseFilename = `${safeName}-${safeStyle}`;

  if (options.format === 'json') {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, `${baseFilename}.glyphworks.json`);
    return;
  }

  if (options.format === 'svg') {
    const font = buildOpentypeFont(project);
    let svgContent = `<?xml version="1.0" standalone="no"?>\n`;
    svgContent += `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n`;
    svgContent += `<svg xmlns="http://www.w3.org/2000/svg">\n<defs>\n`;
    svgContent += `<font id="${project.family}" horiz-adv-x="${project.metrics.unitsPerEm}">\n`;
    svgContent += `<font-face font-family="${project.family}" units-per-em="${project.metrics.unitsPerEm}" ascent="${project.metrics.ascender}" descent="${project.metrics.descender}" />\n`;

    Object.values(project.glyphs).forEach((g) => {
      const opGlyph = convertGlyphToOpentype(g);
      const pathData = opGlyph.path.toPathData(2);
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

// Convert opentype.js parsed font into a GlyphWorks project
export async function parseFontFile(file: File): Promise<Partial<FontProject>> {
  const buffer = await file.arrayBuffer();

  // If json project
  if (file.name.endsWith('.json')) {
    const text = new TextDecoder().decode(buffer);
    const parsed = JSON.parse(text);
    return parsed;
  }

  const parsedFont = opentype.parse(buffer);

  const family = parsedFont.names.fontFamily?.en || file.name.replace(/\.[^/.]+$/, '');
  const style = parsedFont.names.fontSubfamily?.en || 'Regular';

  const metrics = {
    unitsPerEm: parsedFont.unitsPerEm || 1000,
    ascender: parsedFont.ascender || 800,
    capHeight: Math.round((parsedFont.ascender || 800) * 0.88),
    xHeight: Math.round((parsedFont.ascender || 800) * 0.62),
    baseline: 0,
    descender: parsedFont.descender || -200,
  };

  const glyphs: Record<string, GlyphData> = {};

  for (let i = 0; i < parsedFont.glyphs.length; i++) {
    const g = parsedFont.glyphs.get(i);
    if (!g.unicode) continue;

    const char = String.fromCharCode(g.unicode);
    const contours: PathContour[] = [];
    let currentContourPoints: VectorPoint[] = [];

    const commands = g.path.commands;
    for (const cmd of commands) {
      if (cmd.type === 'M') {
        if (currentContourPoints.length > 0) {
          contours.push({
            id: `cnt_${Math.random().toString(36).substring(2, 7)}`,
            closed: true,
            points: currentContourPoints,
          });
          currentContourPoints = [];
        }
        currentContourPoints.push({
          id: `pt_${Math.random().toString(36).substring(2, 7)}`,
          x: Math.round(cmd.x),
          y: Math.round(cmd.y),
          type: 'onCurve',
        });
      } else if (cmd.type === 'L') {
        currentContourPoints.push({
          id: `pt_${Math.random().toString(36).substring(2, 7)}`,
          x: Math.round(cmd.x),
          y: Math.round(cmd.y),
          type: 'onCurve',
        });
      } else if (cmd.type === 'Q') {
        currentContourPoints.push({
          id: `pt_${Math.random().toString(36).substring(2, 7)}`,
          x: Math.round(cmd.x1),
          y: Math.round(cmd.y1),
          type: 'control1',
        });
        currentContourPoints.push({
          id: `pt_${Math.random().toString(36).substring(2, 7)}`,
          x: Math.round(cmd.x),
          y: Math.round(cmd.y),
          type: 'onCurve',
        });
      } else if (cmd.type === 'C') {
        currentContourPoints.push({
          id: `pt_${Math.random().toString(36).substring(2, 7)}`,
          x: Math.round(cmd.x1),
          y: Math.round(cmd.y1),
          type: 'control1',
        });
        currentContourPoints.push({
          id: `pt_${Math.random().toString(36).substring(2, 7)}`,
          x: Math.round(cmd.x2),
          y: Math.round(cmd.y2),
          type: 'control2',
        });
        currentContourPoints.push({
          id: `pt_${Math.random().toString(36).substring(2, 7)}`,
          x: Math.round(cmd.x),
          y: Math.round(cmd.y),
          type: 'onCurve',
        });
      } else if (cmd.type === 'Z') {
        if (currentContourPoints.length > 0) {
          contours.push({
            id: `cnt_${Math.random().toString(36).substring(2, 7)}`,
            closed: true,
            points: currentContourPoints,
          });
          currentContourPoints = [];
        }
      }
    }

    if (currentContourPoints.length > 0) {
      contours.push({
        id: `cnt_${Math.random().toString(36).substring(2, 7)}`,
        closed: false,
        points: currentContourPoints,
      });
    }

    glyphs[char] = {
      unicode: g.unicode,
      name: g.name || `uni${g.unicode.toString(16)}`,
      char,
      advanceWidth: Math.round(g.advanceWidth || 600),
      leftSideBearing: Math.round(g.leftSideBearing || 40),
      contours,
      hasCustomPath: true,
    };
  }

  return {
    name: family,
    family,
    style,
    metrics,
    glyphs,
  };
}
