import opentype from 'opentype.js';
import { FontProject, GlyphData, PathContour, VectorPoint, DetectedFontFile } from '@/src/types/font';
import { DEFAULT_METRICS, generateInitialGlyphSet } from './defaultFont';
import { detectFontPrimaryLanguage } from './languagePresets';

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
 * Intelligently detect font family, style/type, weight, width, and slant from filename
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

  // Detect Width class across both family and style segments
  const combinedStr = `${family} ${stylePart} ${base}`.toLowerCase();
  let width = 'Normal';
  if (/ultra[-_ ]?condensed/i.test(combinedStr)) {
    width = 'UltraCondensed';
  } else if (/extra[-_ ]?condensed/i.test(combinedStr)) {
    width = 'ExtraCondensed';
  } else if (/semi[-_ ]?condensed/i.test(combinedStr)) {
    width = 'SemiCondensed';
  } else if (/condensed|[-_]cond\b|narrow|compressed/i.test(combinedStr)) {
    width = 'Condensed';
  } else if (/ultra[-_ ]?expanded/i.test(combinedStr)) {
    width = 'UltraExpanded';
  } else if (/extra[-_ ]?expanded/i.test(combinedStr)) {
    width = 'ExtraExpanded';
  } else if (/semi[-_ ]?expanded/i.test(combinedStr)) {
    width = 'SemiExpanded';
  } else if (/expanded|[-_]exp\b|wide/i.test(combinedStr)) {
    width = 'Expanded';
  }

  // Strip width keywords from family name
  family = family
    .replace(/(?:Ultra|Extra|Semi)?[-_ ]?(?:Condensed|Expanded|Cond|Exp|Narrow|Compressed|Wide)/gi, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

  let weight = 400;
  const lowerStyle = (stylePart || base).toLowerCase();
  const isItalic = lowerStyle.includes('italic') || lowerStyle.includes('oblique') || /[-_]it\b/i.test(base);

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

  // Compose style string incorporating width when not normal
  let baseStyleName = weightName;
  if (width !== 'Normal') {
    if (weight === 400) {
      baseStyleName = isItalic ? `${width} Italic` : `${width} Regular`;
    } else {
      baseStyleName = isItalic ? `${width} ${weightName} Italic` : `${width} ${weightName}`;
    }
  } else {
    baseStyleName = isItalic
      ? weight === 400 ? 'Italic' : `${weightName} Italic`
      : weightName;
  }

  return {
    family: family || 'Custom Font',
    style: baseStyleName,
    weight,
    width,
    isItalic,
  };
}

/**
 * Build exact SVG path string for a single contour
 */
export function generateContourSvgPath(contour: PathContour): string {
  if (!contour.points || contour.points.length === 0) return '';
  const pts = contour.points;
  let d = `M ${pts[0].x} ${pts[0].y} `;

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
  return d;
}

/**
 * Build exact SVG path string from glyph contours
 */
export function generateGlyphSvgPath(glyph: GlyphData | undefined | null): string {
  if (!glyph || !glyph.contours || glyph.contours.length === 0) return '';
  return glyph.contours.map(generateContourSvgPath).join(' ');
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
      const glyphColor = g.color || g.contours?.find((c) => c.color)?.color;
      const colorAttr = glyphColor ? ` fill="${glyphColor}"` : '';
      svgContent += `  <glyph unicode="${escapeXml(g.char)}" glyph-name="${g.name}" horiz-adv-x="${g.advanceWidth}" d="${pathData}"${colorAttr} />\n`;
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
 * Convert opentype.js commands into normalized PathContour array with control points
 */
export function convertCommandsToContours(commands: any[], glyphIndex = 0): PathContour[] {
  const roundCoord = (n: number) => Math.round(n * 100) / 100;
  const contours: PathContour[] = [];
  let currentContourPoints: VectorPoint[] = [];
  let contourIndex = 0;
  let pointSeq = 0;

  const pushPoint = (x: number, y: number, type: 'onCurve' | 'control1' | 'control2') => {
    pointSeq++;
    currentContourPoints.push({
      id: `pt_${glyphIndex}_${contourIndex}_${pointSeq}`,
      x: roundCoord(x),
      y: roundCoord(y),
      type,
    });
  };

  const finishContour = () => {
    if (currentContourPoints.length === 0) return;
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

    if (currentContourPoints.length > 0) {
      contours.push({
        id: `cnt_${glyphIndex}_${contourIndex}`,
        closed: true,
        points: currentContourPoints,
      });
      contourIndex++;
      currentContourPoints = [];
    }
  };

  for (const cmd of commands) {
    if (cmd.type === 'M') {
      finishContour();
      pushPoint(cmd.x, cmd.y, 'onCurve');
    } else if (cmd.type === 'L') {
      pushPoint(cmd.x, cmd.y, 'onCurve');
    } else if (cmd.type === 'Q') {
      pushPoint(cmd.x1, cmd.y1, 'control1');
      pushPoint(cmd.x, cmd.y, 'onCurve');
    } else if (cmd.type === 'C') {
      pushPoint(cmd.x1, cmd.y1, 'control1');
      pushPoint(cmd.x2, cmd.y2, 'control2');
      pushPoint(cmd.x, cmd.y, 'onCurve');
    } else if (cmd.type === 'Z') {
      finishContour();
    }
  }

  finishContour();
  return contours;
}

// In-memory cache of parsed opentype fonts for instant, zero-delay on-demand contour extraction
const opentypeFontCache = new Map<string, opentype.Font>();

export function cacheParsedOpentypeFont(family: string, font: opentype.Font): void {
  if (!family) return;
  const key = family.toLowerCase().trim();
  opentypeFontCache.set(key, font);
  // Also store simplified key without whitespace, hyphens, or underscores
  const stripped = key.replace(/[\s\-_]+/g, '');
  if (stripped && stripped !== key) {
    opentypeFontCache.set(stripped, font);
  }
}

export function extractSingleGlyphContours(
  family: string,
  charOrUnicode: string | number
): PathContour[] | null {
  if (opentypeFontCache.size === 0) return null;
  const rawKey = (family || '').toLowerCase().trim();
  const strippedKey = rawKey.replace(/[\s\-_]+/g, '');
  let font = opentypeFontCache.get(rawKey) || opentypeFontCache.get(strippedKey);

  // If not found by exact key, search cache for partial match or use the single cached font
  if (!font) {
    if (opentypeFontCache.size === 1) {
      font = opentypeFontCache.values().next().value;
    } else {
      for (const [k, f] of opentypeFontCache.entries()) {
        if (rawKey && (rawKey.includes(k) || k.includes(rawKey))) {
          font = f;
          break;
        }
      }
    }
  }

  if (!font) return null;

  try {
    let g: opentype.Glyph | null = null;
    if (typeof charOrUnicode === 'number') {
      try {
        const ch = String.fromCodePoint(charOrUnicode);
        g = font.charToGlyph(ch);
      } catch {
        g = font.glyphs.get(charOrUnicode) || null;
      }
    } else if (typeof charOrUnicode === 'string') {
      if (Array.from(charOrUnicode).length === 1) {
        g = font.charToGlyph(charOrUnicode);
      } else {
        g = (font.nameToGlyph && font.nameToGlyph(charOrUnicode)) || font.charToGlyph(charOrUnicode) || null;
      }
    }

    if (!g) return null;
    const pathObj = typeof g.path === 'function' ? (g as any).path() : g.path;
    const commands = pathObj?.commands || [];
    if (commands.length === 0) return [];

    return convertCommandsToContours(commands, g.index || 0);
  } catch (e) {
    console.warn('On-demand contour extraction error:', e);
    return null;
  }
}

/**
 * Convert opentype.js parsed font into a GlyphWorks project with 1:1 vector outline fidelity
 */
export async function parseFontFile(
  file: File,
  onProgress?: (percent: number, current: number, total: number) => void
): Promise<Partial<FontProject>> {
  const buffer = await file.arrayBuffer();

  // If json project
  if (file.name.endsWith('.json')) {
    const text = new TextDecoder().decode(buffer);
    const parsed = JSON.parse(text);
    return parsed;
  }

  const detectedMeta = detectFontMetaFromFilename(file.name);
  const parsedFont = opentype.parse(buffer);

  // Exact metrics from font tables
  const os2 = (parsedFont.tables as any)?.os2;
  const hhea = (parsedFont.tables as any)?.hhea;

  // Width from OS/2 table usWidthClass or detected filename
  const widthClassMap: Record<number, string> = {
    1: 'UltraCondensed',
    2: 'ExtraCondensed',
    3: 'Condensed',
    4: 'SemiCondensed',
    5: 'Normal',
    6: 'SemiExpanded',
    7: 'Expanded',
    8: 'ExtraExpanded',
    9: 'UltraExpanded',
  };
  const tableWidth = os2?.usWidthClass ? widthClassMap[os2.usWidthClass] : undefined;
  const width = (tableWidth && tableWidth !== 'Normal') ? tableWidth : detectedMeta.width;

  // Typographic family & subfamily resolution
  const preferredFamily = parsedFont.names.preferredFamily?.en;
  const standardFamily = parsedFont.names.fontFamily?.en;
  let family = preferredFamily || detectedMeta.family || standardFamily || file.name.replace(/\.[^/.]+$/, '');
  if (width !== 'Normal' && family.toLowerCase().endsWith(width.toLowerCase())) {
    family = family.slice(0, -width.length).trim();
  }

  const preferredSubfamily = parsedFont.names.preferredSubfamily?.en;
  const standardSubfamily = parsedFont.names.fontSubfamily?.en;
  let style = preferredSubfamily || detectedMeta.style || standardSubfamily || 'Regular';

  // Ensure width is part of style name when not normal
  if (width !== 'Normal' && !style.toLowerCase().includes(width.toLowerCase())) {
    style = `${width} ${style}`;
  }

  // Weight class resolution (handling legacy 250 Thin/ExtraLight)
  let detectedWeight = detectedMeta.weight;
  if (os2?.usWeightClass && os2.usWeightClass >= 100 && os2.usWeightClass <= 950) {
    if (detectedMeta.weight === 100) {
      detectedWeight = 100;
    } else if (detectedMeta.weight === 200 && os2.usWeightClass === 250) {
      detectedWeight = 200;
    } else {
      detectedWeight = os2.usWeightClass;
    }
  }

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
  const totalGlyphs = parsedFont.glyphs.length;
  const isMegaFont = totalGlyphs > 2000;
  // For mega-fonts (e.g. 30,000+ CJK glyphs), extract 300 core anchors up front, and lazy-load the rest on demand in 0.05ms
  const MAX_CONTOURS = isMegaFont ? 300 : 3500;
  let contoursExtracted = 0;

  // Cache the opentype font object for zero-latency on-demand contour extraction
  cacheParsedOpentypeFont(family, parsedFont);
  if (preferredFamily) cacheParsedOpentypeFont(preferredFamily, parsedFont);
  if (standardFamily) cacheParsedOpentypeFont(standardFamily, parsedFont);
  if (detectedMeta.family) cacheParsedOpentypeFont(detectedMeta.family, parsedFont);

  for (let i = 0; i < totalGlyphs; i++) {
    // Yield to the event loop every 100 glyphs so the browser thread remains fluid and progress updates smoothly
    if (i > 0 && i % 100 === 0) {
      if (onProgress) {
        onProgress(Math.round((i / totalGlyphs) * 100), i, totalGlyphs);
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const g = parsedFont.glyphs.get(i);
    if (!g) continue;

    // Resolve unicode & character key
    let char = '';
    const unicodeVal =
      g.unicode !== undefined && g.unicode !== 0
        ? g.unicode
        : g.unicodes && g.unicodes.length > 0
        ? g.unicodes[0]
        : undefined;

    if (unicodeVal !== undefined) {
      try {
        char = String.fromCodePoint(unicodeVal);
      } catch {
        char = String.fromCharCode(unicodeVal);
      }
    } else {
      char = g.name || `glyph_${i}`;
    }

    // Determine whether to extract full vector bezier contours
    let shouldExtractContours = true;
    if (isMegaFont) {
      const isAscii = unicodeVal !== undefined && unicodeVal >= 0x0020 && unicodeVal <= 0x007e;
      const isCoreAnchorChar =
        unicodeVal !== undefined &&
        (
          // Chinese (CJK)
          unicodeVal === 0x6c38 || // 永
          unicodeVal === 0x548c || // 和
          unicodeVal === 0x4e2d || // 中
          unicodeVal === 0x56fd || // 国
          unicodeVal === 0x6587 || // 文
          unicodeVal === 0x5b57 || // 字
          unicodeVal === 0x4eba || // 人
          unicodeVal === 0x5927 || // 大
          unicodeVal === 0x5929 || // 天
          unicodeVal === 0x5730 || // 地
          // Ethiopic
          unicodeVal === 0x1200 || // ሀ
          unicodeVal === 0x1208 || // ለ
          unicodeVal === 0x12a0 || // አ
          // Arabic
          unicodeVal === 0x0627 || // ا
          unicodeVal === 0x0628 || // ب
          // Cyrillic
          unicodeVal === 0x0416 || // Ж
          unicodeVal === 0x044f || // я
          // Greek
          unicodeVal === 0x03a9 || // Ω
          unicodeVal === 0x03b1 || // α
          // Hebrew
          unicodeVal === 0x05d0 || // א
          unicodeVal === 0x05d1 || // ב
          // Devanagari
          unicodeVal === 0x0905 || // अ
          unicodeVal === 0x0915 || // क
          // Japanese
          unicodeVal === 0x3042 || // あ
          unicodeVal === 0x30a2    // ア
        );

      if (isAscii || isCoreAnchorChar) {
        shouldExtractContours = true;
      } else if (contoursExtracted < MAX_CONTOURS) {
        shouldExtractContours = true;
      } else {
        shouldExtractContours = false;
      }
    }

    let contours: PathContour[] = [];
    if (shouldExtractContours) {
      const pathObj = typeof g.path === 'function' ? (g as any).path() : g.path;
      const commands = pathObj?.commands || [];
      if (commands.length > 0) {
        contours = convertCommandsToContours(commands, i);
        if (contours.length > 0) {
          contoursExtracted++;
        }
      }
    }

    glyphs[char] = {
      unicode: unicodeVal || (char.length === 1 ? char.codePointAt(0) || 0 : 0),
      name: g.name || `uni${(unicodeVal || 0).toString(16).toUpperCase()}`,
      char,
      advanceWidth: Math.round(g.advanceWidth !== undefined ? g.advanceWidth : (g.xMax || 600) + 50),
      leftSideBearing: Math.round(g.leftSideBearing !== undefined ? g.leftSideBearing : (g.xMin || 0)),
      contours,
      hasCustomPath: contours.length > 0,
    };
  }

  if (onProgress) {
    onProgress(100, totalGlyphs, totalGlyphs);
  }

  const rawTables = (parsedFont.tables as any) || {};
  const isColorFontTable = Boolean(
    rawTables.colr ||
    rawTables.cpal ||
    rawTables.svg ||
    rawTables['SVG '] ||
    rawTables.cbdt ||
    rawTables.sbix
  );
  const langDetection = detectFontPrimaryLanguage(glyphs);

  return {
    name: `${family} ${style}`.trim(),
    family,
    style,
    weight: detectedWeight,
    width,
    metrics,
    glyphs,
    isColorFont: isColorFontTable || langDetection.isColorFont,
    primaryScript: langDetection.primaryScript,
  };
}

/**
 * Inspect multiple font files with ultra-fast header/cmap reading (< 5ms per file).
 * Never blocks the main thread or attaches heavy parsed glyph outline trees during staging.
 */
export async function inspectFontFiles(files: File[]): Promise<DetectedFontFile[]> {
  const results: DetectedFontFile[] = [];

  for (const file of files) {
    const meta = detectFontMetaFromFilename(file.name);
    let glyphCount = 0;
    let familyName = meta.family;
    let styleName = meta.style;
    let weight = meta.weight;
    let width = meta.width;
    let isItalic = meta.isItalic;
    let isColorFont = false;
    let primaryScript = 'Latin';
    let sampleChars = 'Aa';

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        familyName = parsed.family || parsed.name || meta.family;
        styleName = parsed.style || meta.style;
        weight = parsed.weight || meta.weight;
        width = parsed.width || meta.width;
        glyphCount = Object.keys(parsed.glyphs || {}).length;
        isColorFont = Boolean(parsed.isColorFont);
        const langInfo = detectFontPrimaryLanguage(parsed.glyphs);
        primaryScript = parsed.primaryScript || langInfo.primaryScript;
        sampleChars = langInfo.sampleChars;
      } else {
        const buffer = await file.arrayBuffer();
        const parsedFont = opentype.parse(buffer);

        const os2 = (parsedFont.tables as any)?.os2;
        const rawTables = (parsedFont.tables as any) || {};

        glyphCount = parsedFont.glyphs ? parsedFont.glyphs.length : 0;
        if (!glyphCount && rawTables.maxp?.numGlyphs) {
          glyphCount = rawTables.maxp.numGlyphs;
        }

        const preferredFamily = parsedFont.names.preferredFamily?.en;
        const standardFamily = parsedFont.names.fontFamily?.en;
        familyName = preferredFamily || meta.family || standardFamily || file.name.replace(/\.[^/.]+$/, '');

        const preferredSubfamily = parsedFont.names.preferredSubfamily?.en;
        const standardSubfamily = parsedFont.names.fontSubfamily?.en;
        styleName = preferredSubfamily || meta.style || standardSubfamily || 'Regular';

        const widthClassMap: Record<number, string> = {
          1: 'UltraCondensed',
          2: 'ExtraCondensed',
          3: 'Condensed',
          4: 'SemiCondensed',
          5: 'Normal',
          6: 'SemiExpanded',
          7: 'Expanded',
          8: 'ExtraExpanded',
          9: 'UltraExpanded',
        };
        const tableWidth = os2?.usWidthClass ? widthClassMap[os2.usWidthClass] : undefined;
        if (tableWidth && tableWidth !== 'Normal') {
          width = tableWidth;
        }

        if (os2?.usWeightClass && os2.usWeightClass >= 100 && os2.usWeightClass <= 950) {
          weight = os2.usWeightClass;
        }

        isColorFont = Boolean(
          rawTables.colr ||
          rawTables.cpal ||
          rawTables.svg ||
          rawTables['SVG '] ||
          rawTables.cbdt ||
          rawTables.sbix
        );

        // Fast script & sample detection from the font cmap table
        const cmapMap = rawTables.cmap?.glyphIndexMap || {};

        const hasChineseAnchor = Boolean(
          cmapMap[0x6c38] || // 永
          cmapMap[0x548c] || // 和
          cmapMap[0x4e2d] || // 中
          cmapMap[0x56fd] || // 国
          cmapMap[0x6587] || // 文
          cmapMap[0x5b57]    // 字
        );
        const hasEthiopicAnchor = Boolean(cmapMap[0x1200] || cmapMap[0x1208] || cmapMap[0x12a0]);
        const hasArabicAnchor = Boolean(cmapMap[0x0627] || cmapMap[0x0628] || cmapMap[0x062c]);
        const hasHebrewAnchor = Boolean(cmapMap[0x05d0] || cmapMap[0x05d1] || cmapMap[0x05e9]);
        const hasCyrillicAnchor = Boolean(cmapMap[0x0416] || cmapMap[0x044f] || cmapMap[0x0424]);
        const hasGreekAnchor = Boolean(cmapMap[0x03a9] || cmapMap[0x03b1] || cmapMap[0x0394]);
        const hasDevanagariAnchor = Boolean(cmapMap[0x0905] || cmapMap[0x0915] || cmapMap[0x092e]);
        const hasJapaneseAnchor = Boolean(cmapMap[0x3042] || cmapMap[0x30a2] || cmapMap[0x3044]);

        const unicodes = Object.keys(cmapMap).map(Number);
        let hasChinese = hasChineseAnchor;
        let hasEthiopic = hasEthiopicAnchor;
        let hasArabic = hasArabicAnchor;
        let hasHebrew = hasHebrewAnchor;
        let hasCyrillic = hasCyrillicAnchor;
        let hasGreek = hasGreekAnchor;
        let hasDevanagari = hasDevanagariAnchor;
        let hasJapanese = hasJapaneseAnchor;

        if (!hasChinese && !hasEthiopic && !hasArabic && !hasHebrew && !hasCyrillic && !hasGreek && !hasDevanagari && !hasJapanese) {
          const step = Math.max(1, Math.floor(unicodes.length / 300));
          for (let i = 0; i < unicodes.length; i += step) {
            const code = unicodes[i];
            if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf) || (code >= 0x20000 && code <= 0x2a6df)) {
              hasChinese = true;
              break;
            }
            if (code >= 0x1200 && code <= 0x137f) {
              hasEthiopic = true;
              break;
            }
            if (code >= 0x0600 && code <= 0x06ff) hasArabic = true;
            if (code >= 0x0590 && code <= 0x05ff) hasHebrew = true;
            if (code >= 0x0400 && code <= 0x04ff) hasCyrillic = true;
            if (code >= 0x0370 && code <= 0x03ff) hasGreek = true;
            if (code >= 0x0900 && code <= 0x097f) hasDevanagari = true;
            if ((code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff)) hasJapanese = true;
          }
        }

        if (hasChinese || glyphCount > 10000) {
          primaryScript = 'Chinese (CJK)';
          sampleChars = '永和';
        } else if (hasEthiopic) {
          primaryScript = 'Ethiopic (Amharic)';
          sampleChars = 'ሀለ';
        } else if (hasArabic) {
          primaryScript = 'Arabic';
          sampleChars = 'اب';
        } else if (hasHebrew) {
          primaryScript = 'Hebrew';
          sampleChars = 'אב';
        } else if (hasCyrillic) {
          primaryScript = 'Cyrillic';
          sampleChars = 'Жя';
        } else if (hasGreek) {
          primaryScript = 'Greek';
          sampleChars = 'Ωα';
        } else if (hasDevanagari) {
          primaryScript = 'Devanagari';
          sampleChars = 'अक';
        } else if (hasJapanese) {
          primaryScript = 'Japanese Kana';
          sampleChars = 'あア';
        } else {
          primaryScript = 'Latin';
          sampleChars = 'Aa';
        }
      }
    } catch (e) {
      console.warn(`Could not fast-inspect ${file.name}:`, e);
    }

    results.push({
      id: 'fdet_' + Math.random().toString(36).substring(2, 8),
      file,
      fileName: file.name,
      familyName,
      styleName,
      weight,
      width,
      isItalic,
      glyphCount,
      primaryScript,
      sampleChars,
      isColorFont,
    });

    // Yield between files to keep UI 100% fluid
    await new Promise((r) => setTimeout(r, 0));
  }

  // Sort staged font files logically: width first, then weight, then slant
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

  results.sort((a, b) => {
    const wa = widthRank[a.width] || 5;
    const wb = widthRank[b.width] || 5;
    if (wa !== wb) return wa - wb;
    if (a.weight !== b.weight) return a.weight - b.weight;
    return (a.isItalic ? 1 : 0) - (b.isItalic ? 1 : 0);
  });

  // Ensure style names are unique
  const seenStyles = new Map<string, number>();
  for (const item of results) {
    const count = seenStyles.get(item.styleName) || 0;
    if (count > 0) {
      item.styleName = `${item.styleName} (${count + 1})`;
    }
    seenStyles.set(item.styleName, count + 1);
  }

  return results;
}

