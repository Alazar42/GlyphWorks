import { GlyphData } from '@/src/types/font';

export interface LanguageScriptPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  characters: string[];
}

export const LANGUAGE_PRESETS: LanguageScriptPreset[] = [
  {
    id: 'latin_basic',
    name: 'Latin Basic (ASCII)',
    category: 'Latin',
    description: 'English uppercase, lowercase, numbers, and basic punctuation',
    characters: [
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      ...'abcdefghijklmnopqrstuvwxyz',
      ...'0123456789',
      ...'.:,;!?\'"-+*/=()[]{}#@$%&_<>|\\^~`',
      ' ',
    ],
  },
  {
    id: 'latin_extended',
    name: 'Latin Extended (European)',
    category: 'Latin',
    description: 'Accented characters for Spanish, French, German, Portuguese, Polish, Czech, Vietnamese, etc.',
    characters: [
      'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï',
      'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ', 'ß',
      'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï',
      'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', 'ø', 'ù', 'ú', 'û', 'ü', 'ý', 'þ', 'ÿ',
      'Ā', 'ā', 'Ă', 'ă', 'Ą', 'ą', 'Ć', 'ć', 'Č', 'č', 'Ď', 'ď', 'Đ', 'đ', 'Ē', 'ē',
      'Ė', 'ė', 'Ę', 'ę', 'Ě', 'ě', 'Ğ', 'ğ', 'Ł', 'ł', 'Ń', 'ń', 'Ň', 'ň', 'Ő', 'ő',
      'Œ', 'œ', 'Ŕ', 'ŕ', 'Ř', 'ř', 'Ś', 'ś', 'Ş', 'ş', 'Š', 'š', 'Ţ', 'ţ', 'Ť', 'ť',
      'Ů', 'ů', 'Ű', 'ű', 'Ÿ', 'Ź', 'ź', 'Ż', 'ż', 'Ž', 'ž',
    ],
  },
  {
    id: 'cyrillic',
    name: 'Cyrillic (Russian, Ukrainian, etc.)',
    category: 'Cyrillic',
    description: 'Modern Cyrillic alphabet for Russian, Ukrainian, Bulgarian, Serbian',
    characters: [
      'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О',
      'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я',
      'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о',
      'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я',
      'Є', 'є', 'І', 'і', 'Ї', 'ї', 'Ґ', 'ґ',
    ],
  },
  {
    id: 'greek',
    name: 'Greek',
    category: 'Greek',
    description: 'Modern Greek alphabet and accented vowels',
    characters: [
      'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π',
      'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω',
      'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π',
      'ρ', 'σ', 'ς', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
      'Ά', 'Έ', 'Ή', 'Ί', 'Ό', 'Ύ', 'Ώ', 'ά', 'έ', 'ή', 'ί', 'ό', 'ύ', 'ώ',
    ],
  },
  {
    id: 'ethiopic',
    name: 'Ethiopic / Ge\'ez (Amharic)',
    category: 'Ethiopic',
    description: 'Basic Ge\'ez script syllabary used in Amharic and Tigrinya',
    characters: [
      'ሀ', 'ሁ', 'ሂ', 'ሃ', 'ሄ', 'ህ', 'ሆ',
      'ለ', 'ሉ', 'ሊ', 'ላ', 'ሌ', 'ል', 'ሎ',
      'ሐ', 'ሑ', 'ሒ', 'ሓ', 'ሔ', 'ሕ', 'ሖ',
      'መ', 'ሙ', 'ሚ', 'ማ', 'ሜ', 'ም', 'ሞ',
      'ሠ', 'ሡ', 'ሢ', 'ሣ', 'ሤ', 'ሥ', 'ሦ',
      'ረ', 'ሩ', 'ሪ', 'ራ', 'ሬ', 'ር', 'ሮ',
      'ሰ', 'ሱ', 'ሲ', 'ሳ', 'ሴ', 'ስ', 'ሶ',
      'ሸ', 'ሹ', 'ሺ', 'ሻ', 'ሼ', 'ሽ', 'ሾ',
      'ቀ', 'ቁ', 'ቂ', 'ቃ', 'ቄ', 'ቅ', 'ቆ',
      'በ', 'ቡ', 'ቢ', 'ባ', 'ቤ', 'ብ', 'ቦ',
      'ተ', 'ቱ', 'ቲ', 'ታ', 'ቴ', 'ት', 'ቶ',
      'ቸ', 'ቹ', 'ቺ', 'ቻ', 'ቼ', 'ች', 'ቾ',
      'ነ', 'ኑ', 'ኒ', 'ና', 'ኔ', 'ን', 'ኖ',
      'አ', 'ኡ', 'ኢ', 'ኣ', 'ኤ', 'እ', 'ኦ',
      'ከ', 'ኩ', 'ኪ', 'ካ', 'ኬ', 'ክ', 'ኮ',
      'ወ', 'ዉ', 'ዊ', 'ዋ', 'ዌ', 'ው', 'ዎ',
      'ዘ', 'ዙ', 'ዚ', 'ዛ', 'ዜ', 'ዝ', 'ዞ',
      'የ', 'ዩ', 'ዪ', 'ያ', 'ዬ', 'ይ', 'ዮ',
      'ደ', 'ዱ', 'ዲ', 'ዳ', 'ዴ', 'ድ', 'ዶ',
      'ጀ', 'ጁ', 'ጂ', 'ጃ', 'ጄ', 'ጅ', 'ጆ',
      'ገ', 'ጉ', 'ጊ', 'ጋ', 'ጌ', 'ግ', 'ጎ',
      'ጠ', 'ጡ', 'ጢ', 'ጣ', 'ጤ', 'ጥ', 'ጦ',
      'ፈ', 'ፉ', 'ፊ', 'ፋ', 'ፌ', 'ፍ', 'ፎ',
      'ፐ', 'ፑ', 'ፒ', 'ፓ', 'ፔ', 'ፕ', 'ፖ',
      '፡', '።', '፣', '፤', '፥', '፦', '፧', '፨',
    ],
  },
  {
    id: 'arabic',
    name: 'Arabic',
    category: 'Arabic',
    description: 'Arabic script alphabet and common diacritics',
    characters: [
      'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض',
      'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ء', 'آ', 'ة', 'ى',
      '٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩',
      '؟', '،', '؛',
    ],
  },
  {
    id: 'hebrew',
    name: 'Hebrew',
    category: 'Hebrew',
    description: 'Hebrew alphabet and final forms',
    characters: [
      'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ך', 'ל', 'מ', 'ם', 'נ', 'ן',
      'ס', 'ע', 'פ', 'ף', 'צ', 'ץ', 'ק', 'ר', 'ש', 'ת',
    ],
  },
  {
    id: 'devanagari',
    name: 'Devanagari (Hindi)',
    category: 'Indic',
    description: 'Devanagari vowels, consonants, and numerals',
    characters: [
      'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ',
      'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ',
      'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
      'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह',
      '०', '१', '२', '३', '४', '५', '६', '७', '८', '९',
    ],
  },
  {
    id: 'japanese_kana',
    name: 'Japanese (Hiragana & Katakana)',
    category: 'East Asian',
    description: 'Core Japanese phonograms',
    characters: [
      'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ',
      'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と',
      'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ',
      'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'を', 'ん',
      'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ',
      'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト',
      'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
      'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ヲ', 'ン',
    ],
  },
  {
    id: 'chinese_common',
    name: 'Chinese (Common CJK)',
    category: 'East Asian',
    description: 'Core Chinese ideographs including basic strokes and radicals (永, 中, 国, 文, 字, etc.)',
    characters: [
      '永', '中', '国', '文', '字', '人', '大', '天', '地', '日', '月', '山', '水', '火', '木', '金', '土',
      '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万',
      '上', '下', '左', '右', '前', '后', '东', '南', '西', '北', '春', '夏', '秋', '冬',
      '美', '好', '和', '平', '学', '生', '家', '道', '心', '爱', '力', '气', '年', '时',
    ],
  },
  {
    id: 'symbols_currency',
    name: 'Currency & Symbols',
    category: 'Symbols',
    description: 'World currency symbols, typographic marks, and math operators',
    characters: [
      '€', '$', '£', '¥', '₹', '₽', '₩', '¢', '¤',
      '©', '®', '™', '°', '±', '×', '÷', '≠', '≈', '≤', '≥', '√', '∞',
      '•', '·', '–', '—', '‘', '’', '“', '”', '‹', '›', '«', '»', '…', '§', '¶', '†', '‡',
    ],
  },
];

/**
 * Determine the script / category of a character
 */
export function detectCharacterScript(char: string): string {
  if (!char || char.length === 0) return 'Other';
  const code = char.codePointAt(0) || 0;

  if (code >= 0x0041 && code <= 0x005a) return 'Latin Basic';
  if (code >= 0x0061 && code <= 0x007a) return 'Latin Basic';
  if (code >= 0x0030 && code <= 0x0039) return 'Numbers';
  if (code >= 0x0020 && code <= 0x002f) return 'Punctuation';
  if (code >= 0x003a && code <= 0x0040) return 'Punctuation';
  if (code >= 0x005b && code <= 0x0060) return 'Punctuation';
  if (code >= 0x007b && code <= 0x007e) return 'Punctuation';

  if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf) || (code >= 0x20000 && code <= 0x2a6df) || (code >= 0xf900 && code <= 0xfaff)) {
    return 'Chinese (CJK)';
  }
  if (code >= 0xac00 && code <= 0xd7af) return 'Korean Hangul';
  if (code >= 0x00a0 && code <= 0x024f) return 'Latin Extended';
  if (code >= 0x0400 && code <= 0x04ff) return 'Cyrillic';
  if (code >= 0x0500 && code <= 0x052f) return 'Cyrillic';
  if (code >= 0x0370 && code <= 0x03ff) return 'Greek';
  if (code >= 0x1200 && code <= 0x137f) return 'Ethiopic';
  if (code >= 0x0600 && code <= 0x06ff) return 'Arabic';
  if (code >= 0x0590 && code <= 0x05ff) return 'Hebrew';
  if (code >= 0x0900 && code <= 0x097f) return 'Devanagari';
  if (code >= 0x3040 && code <= 0x309f) return 'Japanese Kana';
  if (code >= 0x30a0 && code <= 0x30ff) return 'Japanese Kana';
  if (code >= 0x20a0 && code <= 0x20cf) return 'Currency';
  if (code >= 0x2000 && code <= 0x206f) return 'Symbols';
  if (code >= 0x2100 && code <= 0x214f) return 'Symbols';
  if (code >= 0x2200 && code <= 0x22ff) return 'Symbols';

  return 'Other';
}

export interface LanguageProofPreset {
  script: string;
  name: string;
  sample: string;
}

export const LANGUAGE_PROOF_PRESETS: Record<string, LanguageProofPreset> = {
  Chinese: {
    script: 'Chinese',
    name: 'Chinese (CJK)',
    sample: '永和九年 岁在癸丑 暮春之初\n天地玄黄 宇宙洪荒\n中华文化 源远流长\n\n一二三四五六七八九十\n0123456789',
  },
  Ethiopic: {
    script: 'Ethiopic',
    name: 'Ethiopic (Amharic)',
    sample: 'ሰላም ለዓለም ይሁን።\nኢትዮጵያ ሀገሬ የጥበብ መፍለቂያ።\n\nሀ ሁ ሂ ሃ ሄ ህ ሆ\nለ ሉ ሊ ላ ሌ ል ሎ\n\n፩ ፪ ፫ ፬ ፭ ፮ ፯ ፰ ፱ ፲\n0123456789',
  },
  Arabic: {
    script: 'Arabic',
    name: 'Arabic',
    sample: 'أبجد هوز حطي كلمن سعفص قرشت\nالسلام عليكم ورحمة الله وبركاته\nنص تجريبي لاختبار جمال الخط العربي وحروفه\n\n٠١٢٣٤٥٦٧٨٩\n0123456789',
  },
  Cyrillic: {
    script: 'Cyrillic',
    name: 'Cyrillic',
    sample: 'Съешь же ещё этих мягких французских булок, да выпей чаю.\nВ чащах юга жил-был цитрус? Да, но фальшивый экземпляр!\n\nАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ\nабвгдеёжзийклмнопрстуфхцчшщъыьэюя\n0123456789',
  },
  Greek: {
    script: 'Greek',
    name: 'Greek',
    sample: 'Ξεσκεπάζω την ψυχοφθόρα βδελυγμία.\nΟ καλύμνιος σφουγγαράς ψιθύρισε πως θα βρει ένα σπάνιο κοράλλι.\n\nΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ\nαβγδεζηθικλμνξοπρστυφχψω\n0123456789',
  },
  Hebrew: {
    script: 'Hebrew',
    name: 'Hebrew',
    sample: 'דג סקרן שט בים מאוכזב ולפתע מצא חברה.\nשפן אכל קצת גזר בטעם חסה, ודי.\n\nאבגדהוזחטיכלמנסעפצקרשת\n0123456789',
  },
  Devanagari: {
    script: 'Devanagari',
    name: 'Devanagari',
    sample: 'ऋषियों को सताने वाले दुष्ट राक्षसों के राजा रावण का सर्वनाश हुआ।\nसत्यमेव जयते नानृतम्।\n\nअ आ इ ई उ ऊ ऋ ए ऐ ओ औ\nक ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह\n\n०१२३४५६७८९\n0123456789',
  },
  Japanese: {
    script: 'Japanese',
    name: 'Japanese Kana',
    sample: '色は匂へど 散りぬるを 我が世誰ぞ 常ならむ\n有為の奥山 今日越えて 浅き夢見じ 酔ひもせず\n\nあいうえお かきくけこ さしすせそ\nアイウエオ カキクケコ サシスセソ\n0123456789',
  },
  Hangul: {
    script: 'Hangul',
    name: 'Korean Hangul',
    sample: '다람쥐 헌 쳇바퀴에 타고파.\n키스의 고유조건은 입술끼리 만나야 하고 특별한 기술은 필요치 않다.\n\n가나다라마바사아자차카타파하\n0123456789',
  },
  Latin: {
    script: 'Latin',
    name: 'Latin',
    sample: 'Aa\n\nThe quick brown fox jumps over the lazy dog.\nPack my box with five dozen liquor jugs.\n\nABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789',
  },
};

export function getLanguageProofSampleText(scriptOrLang?: string): string {
  const norm = (scriptOrLang || '').toLowerCase();
  if (norm.includes('chinese') || norm.includes('cjk')) return LANGUAGE_PROOF_PRESETS.Chinese.sample;
  if (norm.includes('ethiopic') || norm.includes('amharic') || norm.includes('ge\'ez')) return LANGUAGE_PROOF_PRESETS.Ethiopic.sample;
  if (norm.includes('arabic')) return LANGUAGE_PROOF_PRESETS.Arabic.sample;
  if (norm.includes('cyrillic') || norm.includes('russian')) return LANGUAGE_PROOF_PRESETS.Cyrillic.sample;
  if (norm.includes('greek')) return LANGUAGE_PROOF_PRESETS.Greek.sample;
  if (norm.includes('hebrew')) return LANGUAGE_PROOF_PRESETS.Hebrew.sample;
  if (norm.includes('devanagari') || norm.includes('hindi') || norm.includes('indic')) return LANGUAGE_PROOF_PRESETS.Devanagari.sample;
  if (norm.includes('japanese') || norm.includes('kana')) return LANGUAGE_PROOF_PRESETS.Japanese.sample;
  if (norm.includes('hangul') || norm.includes('korean')) return LANGUAGE_PROOF_PRESETS.Hangul.sample;
  return LANGUAGE_PROOF_PRESETS.Latin.sample;
}

export interface FontLanguageDetectionResult {
  script: string;
  primaryScript: string;
  label: string;
  sampleChars: string;
  showcaseGlyphs: GlyphData[];
  isColorFont: boolean;
}

/**
 * Intelligently detect the primary language script and sample characters for showcase
 * High-performance: samples glyphs with early exit so 50,000+ glyph fonts never freeze the browser!
 */
export function detectFontPrimaryLanguage(
  glyphs: Record<string, GlyphData> | undefined,
  hintScript?: string
): FontLanguageDetectionResult {
  if (!glyphs || Object.keys(glyphs).length === 0) {
    return {
      script: 'Latin',
      primaryScript: 'Latin',
      label: 'Latin',
      sampleChars: 'Aa',
      showcaseGlyphs: [],
      isColorFont: false,
    };
  }

  let isColorFont = false;

  // Check color presence across glyphs
  const checkColor = (g?: GlyphData) => {
    if (!g) return;
    if (g.color || g.isColor || (g.contours && g.contours.some((c) => !!c.color))) {
      isColorFont = true;
    }
  };

  const normHint = (hintScript || '').toLowerCase();

  // Helper to find showcase glyphs with real contours
  const findGlyph = (chars: string[], fallbackRange?: [number, number]): GlyphData | undefined => {
    // 1st priority: matches anchor char AND has extracted contours
    for (const ch of chars) {
      const g = glyphs[ch];
      if (g) {
        checkColor(g);
        if (g.hasCustomPath || (g.contours && g.contours.length > 0 && g.contours.some((c) => c.points && c.points.length > 2))) {
          return g;
        }
      }
    }
    // 2nd priority: matches anchor char
    for (const ch of chars) {
      const g = glyphs[ch];
      if (g) {
        checkColor(g);
        return g;
      }
    }
    // 3rd priority: any glyph in unicode range with contours
    if (fallbackRange) {
      for (const ch in glyphs) {
        const g = glyphs[ch];
        const code = g.unicode || (g.char ? g.char.codePointAt(0) : 0) || 0;
        if (code >= fallbackRange[0] && code <= fallbackRange[1]) {
          checkColor(g);
          if (g.hasCustomPath || (g.contours && g.contours.length > 0)) {
            return g;
          }
        }
      }
      // 4th priority: any glyph in unicode range
      for (const ch in glyphs) {
        const g = glyphs[ch];
        const code = g.unicode || (g.char ? g.char.codePointAt(0) : 0) || 0;
        if (code >= fallbackRange[0] && code <= fallbackRange[1]) {
          checkColor(g);
          return g;
        }
      }
    }
    return undefined;
  };

  // Hallmark anchor sets for immediate O(1) probe
  const chineseAnchors = ['永', '和', '中', '国', '文', '字', '天', '地', '大', '人', '汉'];
  const ethiopicAnchors = ['ሀ', 'ለ', 'ሐ', 'መ', 'ሠ', 'ረ', 'ሰ', 'አ', 'ወ', 'የ'];
  const arabicAnchors = ['ا', 'ب', 'ت', 'ج', 'ح', 'د', 'ر', 'س', 'ع', 'م', 'و', 'ي'];
  const cyrillicAnchors = ['Ж', 'я', 'А', 'Б', 'В', 'Г', 'Д', 'Ф', 'Ю', 'Ш', 'Щ'];
  const greekAnchors = ['Ω', 'α', 'Α', 'Β', 'Γ', 'Δ', 'Σ', 'Ψ', 'Φ', 'ω'];
  const hebrewAnchors = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש', 'ת', 'מ', 'ל'];
  const devanagariAnchors = ['अ', 'क', 'ख', 'ग', 'घ', 'च', 'ज', 'त', 'द', 'न', 'प', 'म'];
  const japaneseAnchors = ['あ', 'ア', 'い', 'イ', 'う', 'ウ', 'え', 'エ', 'お', 'オ'];

  const hasChineseAnchor = chineseAnchors.some((ch) => !!glyphs[ch]);
  const hasEthiopicAnchor = ethiopicAnchors.some((ch) => !!glyphs[ch]);
  const hasArabicAnchor = arabicAnchors.some((ch) => !!glyphs[ch]);
  const hasCyrillicAnchor = cyrillicAnchors.some((ch) => !!glyphs[ch]);
  const hasGreekAnchor = greekAnchors.some((ch) => !!glyphs[ch]);
  const hasHebrewAnchor = hebrewAnchors.some((ch) => !!glyphs[ch]);
  const hasDevanagariAnchor = devanagariAnchors.some((ch) => !!glyphs[ch]);
  const hasJapaneseAnchor = japaneseAnchors.some((ch) => !!glyphs[ch]);

  // Chinese (CJK)
  if (normHint.includes('chinese') || normHint.includes('cjk') || hasChineseAnchor) {
    const g1 = findGlyph(['永', '中', '天', '国', '文', '字', '大', '人'], [0x4e00, 0x9fff]);
    const g2 = findGlyph(['和', '地', '国', '文', '字', '大'].filter((ch) => ch !== g1?.char), [0x4e00, 0x9fff]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Chinese',
      primaryScript: 'Chinese (CJK)',
      label: 'Chinese (CJK)',
      sampleChars: showcase.map((g) => g.char).join('') || '永和',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  // Ethiopic (Amharic / Ge'ez)
  if (normHint.includes('ethiopic') || normHint.includes('amharic') || normHint.includes('ge\'ez') || hasEthiopicAnchor) {
    const g1 = findGlyph(['ሀ', 'አ', 'መ', 'ለ'], [0x1200, 0x137f]);
    const g2 = findGlyph(['ለ', 'መ', 'ረ'].filter((ch) => ch !== g1?.char), [0x1200, 0x137f]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Ethiopic',
      primaryScript: 'Ethiopic (Amharic)',
      label: 'Ethiopic (Amharic)',
      sampleChars: showcase.map((g) => g.char).join('') || 'ሀለ',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  // Arabic
  if (normHint.includes('arabic') || hasArabicAnchor) {
    const g1 = findGlyph(['ا', 'ب', 'ج'], [0x0600, 0x06ff]);
    const g2 = findGlyph(['ب', 'ت', 'د'].filter((ch) => ch !== g1?.char), [0x0600, 0x06ff]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Arabic',
      primaryScript: 'Arabic',
      label: 'Arabic',
      sampleChars: showcase.map((g) => g.char).join('') || 'اب',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  // Hebrew
  if (normHint.includes('hebrew') || hasHebrewAnchor) {
    const g1 = findGlyph(['א', 'ב', 'ש'], [0x0590, 0x05ff]);
    const g2 = findGlyph(['ב', 'ת', 'מ'].filter((ch) => ch !== g1?.char), [0x0590, 0x05ff]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Hebrew',
      primaryScript: 'Hebrew',
      label: 'Hebrew',
      sampleChars: showcase.map((g) => g.char).join('') || 'אב',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  // Cyrillic
  if (normHint.includes('cyrillic') || normHint.includes('russian') || hasCyrillicAnchor) {
    const g1 = findGlyph(['Ж', 'А', 'Б', 'Ф', 'Ю'], [0x0400, 0x04ff]);
    const g2 = findGlyph(['я', 'Б', 'в'].filter((ch) => ch !== g1?.char), [0x0400, 0x04ff]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Cyrillic',
      primaryScript: 'Cyrillic',
      label: 'Cyrillic',
      sampleChars: showcase.map((g) => g.char).join('') || 'Жя',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  // Greek
  if (normHint.includes('greek') || hasGreekAnchor) {
    const g1 = findGlyph(['Ω', 'Α', 'Δ', 'Σ', 'Ψ'], [0x0370, 0x03ff]);
    const g2 = findGlyph(['α', 'ω', 'β'].filter((ch) => ch !== g1?.char), [0x0370, 0x03ff]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Greek',
      primaryScript: 'Greek',
      label: 'Greek',
      sampleChars: showcase.map((g) => g.char).join('') || 'Ωα',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  // Devanagari
  if (normHint.includes('devanagari') || normHint.includes('hindi') || hasDevanagariAnchor) {
    const g1 = findGlyph(['अ', 'क', 'म'], [0x0900, 0x097f]);
    const g2 = findGlyph(['क', 'म', 'र'].filter((ch) => ch !== g1?.char), [0x0900, 0x097f]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Devanagari',
      primaryScript: 'Devanagari',
      label: 'Devanagari',
      sampleChars: showcase.map((g) => g.char).join('') || 'अक',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  // Japanese Kana
  if (normHint.includes('japanese') || normHint.includes('kana') || hasJapaneseAnchor) {
    const g1 = findGlyph(['あ', 'ア', 'い'], [0x3040, 0x30ff]);
    const g2 = findGlyph(['ア', 'い', 'イ'].filter((ch) => ch !== g1?.char), [0x3040, 0x30ff]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Japanese',
      primaryScript: 'Japanese Kana',
      label: 'Japanese Kana',
      sampleChars: showcase.map((g) => g.char).join('') || 'あア',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  // Fallback: Evenly sample glyphs across the entire font dictionary (handles 30,000+ fonts in 2ms)
  const keys = Object.keys(glyphs);
  const step = Math.max(1, Math.floor(keys.length / 500));
  const scriptCounts: Record<string, number> = {
    Chinese: 0,
    Ethiopic: 0,
    Arabic: 0,
    Cyrillic: 0,
    Greek: 0,
    Hebrew: 0,
    Devanagari: 0,
    Japanese: 0,
  };

  for (let i = 0; i < keys.length; i += step) {
    const g = glyphs[keys[i]];
    if (!g) continue;
    checkColor(g);

    const code = g.unicode || (g.char?.codePointAt(0) || 0);
    if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf) || (code >= 0x20000 && code <= 0x2a6df)) {
      scriptCounts.Chinese++;
    } else if (code >= 0x1200 && code <= 0x137f) {
      scriptCounts.Ethiopic++;
    } else if (code >= 0x0600 && code <= 0x06ff) {
      scriptCounts.Arabic++;
    } else if (code >= 0x0590 && code <= 0x05ff) {
      scriptCounts.Hebrew++;
    } else if ((code >= 0x0400 && code <= 0x04ff) || (code >= 0x0500 && code <= 0x052f)) {
      scriptCounts.Cyrillic++;
    } else if (code >= 0x0370 && code <= 0x03ff) {
      scriptCounts.Greek++;
    } else if (code >= 0x0900 && code <= 0x097f) {
      scriptCounts.Devanagari++;
    } else if ((code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff)) {
      scriptCounts.Japanese++;
    }
  }

  if (scriptCounts.Chinese >= 3) {
    const g1 = findGlyph(['永', '中', '国', '文'], [0x4e00, 0x9fff]);
    const g2 = findGlyph(['和', '地', '字'].filter((ch) => ch !== g1?.char), [0x4e00, 0x9fff]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Chinese',
      primaryScript: 'Chinese (CJK)',
      label: 'Chinese (CJK)',
      sampleChars: showcase.map((g) => g.char).join('') || '永和',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  if (scriptCounts.Ethiopic >= 3) {
    const g1 = findGlyph(['ሀ', 'አ'], [0x1200, 0x137f]);
    const g2 = findGlyph(['ለ', 'መ'].filter((ch) => ch !== g1?.char), [0x1200, 0x137f]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Ethiopic',
      primaryScript: 'Ethiopic (Amharic)',
      label: 'Ethiopic (Amharic)',
      sampleChars: showcase.map((g) => g.char).join('') || 'ሀለ',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  if (scriptCounts.Arabic >= 3) {
    const g1 = findGlyph(['ا'], [0x0600, 0x06ff]);
    const g2 = findGlyph(['ب'], [0x0600, 0x06ff]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Arabic',
      primaryScript: 'Arabic',
      label: 'Arabic',
      sampleChars: showcase.map((g) => g.char).join('') || 'اب',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  if (scriptCounts.Cyrillic >= 3) {
    const g1 = findGlyph(['Ж', 'А'], [0x0400, 0x04ff]);
    const g2 = findGlyph(['я', 'Б'], [0x0400, 0x04ff]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Cyrillic',
      primaryScript: 'Cyrillic',
      label: 'Cyrillic',
      sampleChars: showcase.map((g) => g.char).join('') || 'Жя',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  if (scriptCounts.Greek >= 3) {
    const g1 = findGlyph(['Ω', 'Α'], [0x0370, 0x03ff]);
    const g2 = findGlyph(['α', 'ω'], [0x0370, 0x03ff]);
    const showcase = [g1, g2 && g2 !== g1 ? g2 : undefined].filter(Boolean) as GlyphData[];
    return {
      script: 'Greek',
      primaryScript: 'Greek',
      label: 'Greek',
      sampleChars: showcase.map((g) => g.char).join('') || 'Ωα',
      showcaseGlyphs: showcase,
      isColorFont,
    };
  }

  // Latin standard fallback
  const gA = glyphs['A'];
  const ga = glyphs['a'];
  const showcase = [gA, ga].filter(Boolean) as GlyphData[];
  return {
    script: 'Latin',
    primaryScript: 'Latin',
    label: 'Latin',
    sampleChars: 'Aa',
    showcaseGlyphs: showcase,
    isColorFont,
  };
}
