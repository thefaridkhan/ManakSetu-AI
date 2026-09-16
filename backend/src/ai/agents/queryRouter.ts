import { detectLanguage, extractStandardNumbers } from '../../utils/textNormalizer.js';

export type QueryIntent =
  | 'CONVERSATIONAL_META'
  | 'CONCEPT_EXPLANATION'
  | 'STANDARDS_SEARCH'
  | 'PRODUCT_COMPLIANCE'
  | 'CERTIFICATION_SCHEME'
  | 'GRIEVANCE'
  | 'GENERAL_RAG';

export interface ClassifiedQuery {
  intent: QueryIntent;
  language: 'en' | 'hi' | 'hinglish';
  extractedStandards: string[];
  suggestedActions: string[];
}

export class QueryRouter {
  /**
   * Fast rule-based + heuristic query classifier
   */
  classify(query: string): ClassifiedQuery {
    const lang = detectLanguage(query);
    const extractedStandards = extractStandardNumbers(query);
    const lower = query.toLowerCase().trim();

    let intent: QueryIntent = 'GENERAL_RAG';
    const suggestedActions: string[] = [];

    // 1. Conversational & Meta queries
    if (
      /^(maine|mene|mera|hamne)\s+(kya|kaunsa|kya kya)\s+(puchha|pucha|bola|kaha)/i.test(lower) ||
      /what\s+(did\s+i\s+ask|was\s+my\s+(last\s+)?question|have\s+i\s+asked)/i.test(lower) ||
      /^(tum|aap)\s+(kaun|kon)\s+ho/i.test(lower) ||
      /^(who\s+are\s+you|what\s+are\s+you|what\s+can\s+you\s+do|tum\s+kya\s+kar\s+sakte\s+ho)/i.test(lower) ||
      /^(hi|hello|hey|namaste|pranam|namaskar|good\s+(morning|afternoon|evening)|kaise\s+ho|kya\s+haal\s+hai)$/i.test(lower) ||
      /^(thank\s+you|thanks|dhanyawad|shukriya|theek\s+hai|ok|okay|got\s+it)$/i.test(lower) ||
      /(2026|2025|2024|data|knowledge\s+base|dataset|updated|update|gyankosh|kahan\s+se)\s*(ka\s+data|hai\s+kya|kya\s+data|kab\s+tak|upto|available|\?)/i.test(lower) ||
      /(kya\s+tumhare\s+paas|kya\s+aapke\s+paas)\s*(2026|latest|sab|pura|update|current)/i.test(lower) ||
      /(data\s+source|dataset\s+version|last\s+updated)/i.test(lower)
    ) {
      intent = 'CONVERSATIONAL_META';
      suggestedActions.push('View conversation history');
      suggestedActions.push('Ask a new BIS compliance question');
    }
    // 2. BIS Concept explanation (e.g. "marking fee kya hota hai", "qco kya hota hai", "what is huid", "isi vs hallmark")
    else if (
      /(kya\s+hota\s+hai|kya\s+hai|ise\s+kya\s+kehte|what\s+is|what\s+are|define|definition|meaning\s+of|explain)\s+(marking\s+fee|qco|huid|hallmark|isi\s+mark|crs|fmcs|nabl|surveillance|licensing|scheme)/i.test(lower) ||
      /(marking\s+fee|qco|huid|hallmarking|crs|fmcs|nabl|surveillance\s+audit|licensing\s+process)\s+(kya\s+hota\s+hai|kya\s+hai|kise\s+kehte|ka\s+kya\s+matlab|ka\s+arth)/i.test(lower) ||
      /^(marking\s+fee|qco|huid|crs|fmcs|nabl)\s+(kya\s+hai|kya\s+hota\s+hai|matlab|\?)/i.test(lower)
    ) {
      intent = 'CONCEPT_EXPLANATION';
      suggestedActions.push('Explore related certification fee structures');
      suggestedActions.push('Check applicable QCO guidelines');
    }
    // 3. Grievance checks
    else if (
      /complaint|fake|fraud|cheat|shikayat|duplicate|substandard|karwai|care app|helpline|defective/i.test(lower)
    ) {
      intent = 'GRIEVANCE';
      suggestedActions.push('Open BIS Care App complaint guide');
      suggestedActions.push('Verify licensee details on e-BIS');
    }
    // 4. Specific standard search
    else if (extractedStandards.length > 0 || /standard|is\s*\d+|amendment|clause|specifications|ics/i.test(lower)) {
      intent = 'STANDARDS_SEARCH';
      suggestedActions.push('View complete IS standard specifications');
      suggestedActions.push('Check mandatory QCO status');
    }
    // 5. Product compliance / Manufacturer
    else if (
      /manufacture|factory|testing|lab|license|licence|product|water|cement|steel|pipe|bottle|toy|helmet|food|gold|silver|tmt/i.test(lower)
    ) {
      intent = 'PRODUCT_COMPLIANCE';
      suggestedActions.push('Generate compliance checklist');
      suggestedActions.push('Find recognized testing laboratories');
    }
    // 6. Scheme guide
    else if (/isi mark|crs|fmcs|hallmark|eco mark|scheme i|scheme ii|scheme iv/i.test(lower)) {
      intent = 'CERTIFICATION_SCHEME';
      suggestedActions.push('View scheme application procedure');
      suggestedActions.push('Download required document list');
    }

    return {
      intent,
      language: lang,
      extractedStandards,
      suggestedActions
    };
  }
}

export const queryRouter = new QueryRouter();
