/**
 * Utility for normalizing Hindi, English, and Hinglish queries
 * and extracting potential IS Standard numbers.
 */

export function detectLanguage(text: string): 'en' | 'hi' | 'hinglish' {
  // Check for Devanagari script range \u0900-\u097F
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) {
    return 'hi';
  }

  // Hinglish heuristics: common Hindi words transliterated in Latin script
  const hinglishMarkers = [
    /\b(kaise|kya|kyun|kahan|kaunsa|kripya|chahiye|hoga|hoti|hota|karein|kare|ke liye|mai|mein|paani|pani|sona|chandi|loha|mitti|doodh|khadya|shikayat|pramanpatra|manak|sariya)\b/i
  ];

  for (const regex of hinglishMarkers) {
    if (regex.test(text)) {
      return 'hinglish';
    }
  }

  return 'en';
}

/**
 * Hindi-to-English semantic keyword bridge for BIS domain terms
 */
export const HINDI_DOMAIN_DICTIONARY: Record<string, string[]> = {
  'खिलौने': ['toy', 'toys', '9873'],
  'खिलौना': ['toy', 'toys', '9873'],
  'खिलौनों': ['toy', 'toys', '9873'],
  'पानी': ['water', 'drinking water', '10500', '14543'],
  'पेयजल': ['drinking water', 'packaged water', '10500', '14543'],
  'सीमेंट': ['cement', 'opc', 'ppc', '269', '1489'],
  'सोना': ['gold', 'jewellery', 'hallmark', '1417', 'huid'],
  'आभूषण': ['jewellery', 'gold', 'hallmark', '1417'],
  'चांदी': ['silver', 'hallmarking', '2112'],
  'लोहा': ['steel', 'tmt', '1786'],
  'सरिया': ['tmt', 'steel', 'rebar', '1786'],
  'हेलमेट': ['helmet', 'protective', '4151'],
  'बैटरी': ['battery', 'lithium', 'cell', '16046'],
  'तार': ['cable', 'wire', 'pvc', '694', '1554'],
  'बिजली': ['electrical', 'plugs', 'socket', '1293'],
  'प्लग': ['plug', 'socket', '1293'],
  'शिकायत': ['complaint', 'grievance', 'fake', 'care app'],
  'फर्जी': ['fake', 'counterfeit', 'complaint'],
  'प्रमाणन': ['certification', 'license', 'isi mark']
};

/**
 * Expands query with cross-lingual vocabulary
 */
export function expandCrossLingualQuery(query: string): string[] {
  const expanded: string[] = [];
  const words = query.toLowerCase().split(/\s+/);

  for (const word of words) {
    // Check dictionary
    for (const [hindiKey, englishTerms] of Object.entries(HINDI_DOMAIN_DICTIONARY)) {
      if (word.includes(hindiKey)) {
        expanded.push(...englishTerms);
      }
    }
  }

  return [...new Set(expanded)];
}

/**
 * Extracts Indian Standard numbers like IS 10500, IS 14543, IS1786, IS:10500:2012 from text
 */
export function extractStandardNumbers(text: string): string[] {
  const isPattern = /\b(?:IS|is|Is)\s*:?\s*(\d{2,6})(?::(\d{4}))?\b/gi;
  const matches: string[] = [];
  let match;

  while ((match = isPattern.exec(text)) !== null) {
    const stdNum = match[1];
    const year = match[2];
    if (year) {
      matches.push(`IS ${stdNum}:${year}`);
    } else {
      matches.push(`IS ${stdNum}`);
    }
  }

  return [...new Set(matches)];
}

/**
 * Clean & tokenize query string
 */
export function cleanQueryString(query: string): string {
  return query
    .replace(/[^\w\s\u0900-\u097F:-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
