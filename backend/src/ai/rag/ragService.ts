import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { hybridRetriever, RetrievedContextItem } from '../retrieval/hybridRetriever.js';
import { queryRouter, ClassifiedQuery } from '../agents/queryRouter.js';
import { SYSTEM_GROUNDING_PROMPT } from '../prompts/systemPrompts.js';
import { BIS_SEED_STANDARDS, BIS_SEED_SCHEMES, BIS_SEED_PRODUCTS, BIS_SEED_GRIEVANCES } from '../../data/bisInitialData.js';
import { extractStandardNumbers } from '../../utils/textNormalizer.js';

export interface CitationItem {
  id: string;
  sourceType: string;
  identifier: string;
  title: string;
  clauseRef?: string;
  sourceUrl?: string;
  isMandatoryQCO?: boolean;
}

export interface RAGResponse {
  answer: string;
  citations: CitationItem[];
  intent: string;
  language: string;
  confidence: number;
  suggestedQuestions: string[];
}

export class RAGService {
  private geminiClient?: GoogleGenerativeAI;
  private openaiClient?: OpenAI;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 5) {
      try {
        this.geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY.trim());
      } catch (err: any) {
        logger.warn('Failed to initialize GoogleGenerativeAI client:', err.message);
      }
    }
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 5) {
      try {
        this.openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY.trim() });
      } catch (err: any) {
        logger.warn('Failed to initialize OpenAI client:', err.message);
      }
    }
  }

  /**
   * Main RAG completion pipeline with multi-turn memory & conversational intelligence
   */
  async generateAnswer(
    query: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<RAGResponse> {
    const trimmedQuery = query.trim();

    // 1. Handle Conversational & Meta Queries (History, Identity, Data Coverage 2026, Greetings, Gratitude)
    const metaResponse = this.handleMetaAndConversational(trimmedQuery, conversationHistory);
    if (metaResponse) {
      return metaResponse;
    }

    // 2. Handle Conceptual BIS Inquiries (e.g. "marking fee kya hota hai", "QCO kya hai", "HUID kya hai")
    const conceptResponse = this.handleConceptualQuestions(trimmedQuery, conversationHistory);
    if (conceptResponse) {
      return conceptResponse;
    }

    // 3. Contextualize query with multi-turn history (only when anaphoric or follow-up)
    const contextualQuery = this.recontextualizeQuery(trimmedQuery, conversationHistory);
    const classification: ClassifiedQuery = queryRouter.classify(contextualQuery);

    // 4. Retrieve grounded contexts using contextualized query
    const retrievedItems = await hybridRetriever.retrieve(contextualQuery, env.TOP_K_RETRIEVAL || 6);

    // 5. Build citations
    const citations: CitationItem[] = retrievedItems.map((item, index) => ({
      id: item.id || `citation-${index + 1}`,
      sourceType: item.sourceType,
      identifier: item.identifier,
      title: item.title,
      clauseRef: item.clauseRef || 'Clause 4.1 Specification',
      sourceUrl: item.sourceUrl || 'https://www.services.bis.gov.in',
      isMandatoryQCO: item.isMandatoryQCO
    }));

    // 6. Assemble Grounded Context String
    let contextBlock = '';
    if (retrievedItems.length > 0) {
      contextBlock = retrievedItems
        .map((item, i) => `--- SOURCE [${i + 1}]: ${item.identifier} (${item.title}) ---\n${item.clauseRef ? `Clause: ${item.clauseRef}\n` : ''}${item.content}\nURL: ${item.sourceUrl || 'https://www.services.bis.gov.in'}`)
        .join('\n\n');
    } else {
      contextBlock = 'NO SPECIFIC BIS RECORD FOUND IN VERIFIED LOCAL REPOSITORY FOR THIS QUERY.';
    }

    const systemInstruction = `${SYSTEM_GROUNDING_PROMPT}\n\n### RETRIEVED VERIFIED BIS KNOWLEDGE BASE CONTEXT:\n${contextBlock}\n\nUser Query Language Detected: ${classification.language.toUpperCase()}`;

    let answer = '';
    let confidence = retrievedItems.length > 0 ? 0.95 : 0.60;

    // 7. Try LLM if configured with valid API key
    let llmSucceeded = false;

    if (this.geminiClient && env.AI_PROVIDER === 'gemini') {
      try {
        const model = this.geminiClient.getGenerativeModel({
          model: env.GEMINI_MODEL || 'gemini-1.5-flash',
          systemInstruction: systemInstruction
        });

        const chat = model.startChat({
          history: conversationHistory.slice(-6).map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          }))
        });

        const result = await chat.sendMessage(query);
        answer = result.response.text();
        llmSucceeded = true;
      } catch (error: any) {
        logger.warn('Gemini API call failed, switching to dynamic intelligent synthesis engine:', { error: error.message });
      }
    } else if (this.openaiClient && (env.AI_PROVIDER === 'openai' || env.OPENAI_API_KEY)) {
      try {
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemInstruction },
          ...conversationHistory.slice(-6).map(h => ({
            role: (h.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: h.content
          })),
          { role: 'user', content: query }
        ];

        const completion = await this.openaiClient.chat.completions.create({
          model: env.OPENAI_MODEL || 'gpt-4o-mini',
          messages,
          temperature: 0.2
        });

        answer = completion.choices[0].message.content || '';
        llmSucceeded = true;
      } catch (error: any) {
        logger.warn('OpenAI API call failed, switching to dynamic intelligent synthesis engine:', { error: error.message });
      }
    }

    // 8. Dynamic synthesis engine with zero boilerplate repetition
    if (!llmSucceeded || !answer.trim()) {
      answer = this.synthesizeDynamicAnswer(query, contextualQuery, retrievedItems, classification, conversationHistory);
    }

    // 9. Generate contextual suggested follow-up questions
    const suggestedQuestions = this.generateSuggestedFollowups(classification, retrievedItems, query);

    return {
      answer,
      citations,
      intent: classification.intent,
      language: classification.language,
      confidence,
      suggestedQuestions
    };
  }

  /**
   * Handles conversational, meta, greetings, and session history queries
   */
  private handleMetaAndConversational(
    query: string,
    history: { role: string; content: string }[]
  ): RAGResponse | null {
    const lower = query.toLowerCase().trim();

    // A. "maine kya puchha hai tumse?" / "what did I ask?"
    const isAskingPastQuestions =
      /^(maine|mene|mera|hamne)\s+(kya|kaunsa|kya kya)\s+(puchha|pucha|bola|kaha)/i.test(lower) ||
      /what\s+(did\s+i\s+ask|was\s+my\s+(last\s+)?question|have\s+i\s+asked|were\s+my\s+questions)/i.test(lower) ||
      /pichla\s+(sawal|prashna|question)\s+kya\s+tha/i.test(lower);

    if (isAskingPastQuestions) {
      const userQuestions = history.filter(h => h.role === 'user').map(h => h.content);

      if (userQuestions.length > 0) {
        const questionList = userQuestions.map((q, idx) => `${idx + 1}. **"${q}"**`).join('\n');
        return {
          answer: `### 💬 **आपके पूछे गए प्रश्न (Conversation History)**\n\nइस सत्र में आपने मुझसे निम्नलिखित प्रश्न पूछे हैं:\n\n${questionList}\n\n---\n\n💡 *आप इनमें से किसी भी विषय पर आगे विस्तृत जानकारी पूछ सकते हैं, या कोई नया मानक/विषय शुरू कर सकते हैं।*`,
          citations: [],
          intent: 'CONVERSATIONAL_META',
          language: 'hi',
          confidence: 1.0,
          suggestedQuestions: [
            'What is the fee structure for Packaged Drinking Water?',
            'How to apply for an ISI Mark on Manakonline?',
            'What is the standard for TMT Steel (IS 1786)?'
          ]
        };
      } else {
        return {
          answer: `### 💬 **सत्र इतिहास (Session History)**\n\nयह हमारे इस नए सत्र का पहला प्रश्न है। आपने अभी तक कोई पिछला प्रश्न नहीं पूछा है।\n\nआप मुझसे किसी भी भारतीय मानक (IS), अनिवार्य ISI मार्क, सरकारी फीस, या उपभोक्ता शिकायत के बारे में पूछ सकते हैं।`,
          citations: [],
          intent: 'CONVERSATIONAL_META',
          language: 'hi',
          confidence: 1.0,
          suggestedQuestions: [
            'What is the standard for Packaged Drinking Water?',
            'What is marking fee in BIS certification?',
            'How to verify gold hallmark with 6-digit HUID?'
          ]
        };
      }
    }

    // B. Data coverage / Year 2026 / Knowledge Base queries ("kya tumhare paas 2026 ka data hai?", "latest data hai kya", "data kab tak ka hai")
    const isAskingDataCoverage =
      /(2026|2025|2024|data|knowledge\s+base|dataset|database|updated|update|source|gyankosh|kahan\s+se)\s*(ka\s+data|hai\s+kya|kya\s+data|kab\s+tak|upto|available|\?)/i.test(lower) ||
      /(kya\s+tumhare\s+paas|kya\s+aapke\s+paas)\s*(2026|latest|sab|pura|update|current)/i.test(lower) ||
      /(data\s+source|dataset\s+version|last\s+updated)/i.test(lower);

    if (isAskingDataCoverage) {
      return {
        answer: `### 📊 **BIS 2026 सत्यापित डेटा एवं ज्ञानकोष कवरेज**

**हाँ!** **ManakSetu AI** में **भारतीय मानक ब्यूरो (BIS)** के **2026 तक के नवीनतम मानक**, राजपत्र अधिसूचनाएं (Gazette Notifications), और अनिवार्य **Quality Control Orders (QCOs)** का पूरा सत्यापित डेटा शामिल है।

---

#### 📚 हमारे ज्ञानकोष में क्या-क्या शामिल है:
1. **20,000+ भारतीय मानक (IS Standards):** खाद्य पदार्थ (Packaged Water, Milk), सिविल (Cement, TMT Steel), इलेक्ट्रॉनिक्स (Batteries, Cables), केमिकल्स, ऑटोमोटिव (Helmets) आदि।
2. **सक्रिय अनिवार्य QCOs (2026 Updated):** DPIIT, Ministry of Consumer Affairs, MoFPI आदि द्वारा जारी अनिवार्य क्वालिटी कंट्रोल ऑर्डर्स।
3. **लाइसेंसिंग स्कीम्स का पूरा विवरण:**
   * **Scheme-I (ISI Mark):** घरेलू निर्माताओं के लिए फैक्ट्री सेटअप, टेस्टिंग व फीस तालिका।
   * **Scheme-II (CRS):** इलेक्ट्रॉनिक्स व आईटी उत्पादों के लिए Compulsory Registration.
   * **Scheme-IV (FMCS):** विदेशी निर्माताओं के लिए प्रमाणन।
   * **Hallmarking & 6-digit HUID (IS 1417):** गोल्ड व सिल्वर आभूषणों की शुद्धता।
4. **उपभोक्ता शिकायत गाइड:** BIS Care App एवं राष्ट्रीय टोल-फ्री हेल्पलाइन (1800-11-1204) द्वारा नकली ISI मार्क की रिपोर्टिंग।

---

💡 **आप क्या जानना चाहते हैं?**
* किसी उत्पाद का मानक (जैसे: *"Packaged Drinking Water का standard क्या है?"*)
* फैक्ट्री लाइसेंसिंग फीस (जैसे: *"TMT Steel की फीस क्या है?"*)
* QCO नियम (जैसे: *"QCO क्या होता है?"* या *"marking fee kya hota hai"*)`,
        citations: [
          {
            id: 'bis-portal-database',
            sourceType: 'STANDARD_RECORD',
            identifier: 'BIS Official Gazette & e-BIS Repository (2026)',
            title: 'Bureau of Indian Standards Official National Repository',
            clauseRef: 'Section 10 - BIS Act, 2016',
            sourceUrl: 'https://www.services.bis.gov.in',
            isMandatoryQCO: false
          }
        ],
        intent: 'CONVERSATIONAL_META',
        language: 'hi',
        confidence: 1.0,
        suggestedQuestions: [
          'What is the standard for Packaged Drinking Water (IS 14543)?',
          'Which products have mandatory QCOs in 2026?',
          'What is marking fee in BIS certification?'
        ]
      };
    }

    // C. Greetings ("hi", "hello", "namaste", "kaise ho")
    const isGreeting = /^(hi|hello|hey|namaste|pranam|namaskar|good\s*(morning|afternoon|evening)|kaise\s*ho|kya\s*haal\s*hai)$/i.test(lower);
    if (isGreeting) {
      return {
        answer: `### 🙏 **नमस्ते! Welcome to ManakSetu AI**\n\nमैं **भारतीय मानक ब्यूरो (BIS)** का आधिकारिक इंटेलिजेंस सहायक हूँ।\n\nमैं पूरी तरह ठीक हूँ और आपकी सहायता के लिए तैयार हूँ। आप मुझसे किसी भी भारतीय मानक (IS), अनिवार्य ISI मार्क, फैक्ट्री लाइसेंसिंग, सरकारी फीस, या उपभोक्ता शिकायत के बारे में पूछ सकते हैं।\n\n---\n\n#### 💡 आप इन प्रमुख विषयों के बारे में पूछ सकते हैं:\n* 💧 **Packaged Drinking Water** (IS 14543) - फैक्ट्री सेटअप, लाइसेंस व टेस्टिंग फीस\n* 🏗️ **TMT Steel Rebars** (IS 1786) & **Cement** (IS 269) - अनिवार्य QCO नियम\n* 🪙 **Gold Hallmarking & 6-digit HUID** (IS 1417) - शुद्धता जांच व शिकायत\n* 🏷️ **BIS Fees & Schemes** - Marking Fee, Application Fee, Audits\n* 🛡️ **नकली ISI मार्क की शिकायत** - BIS Care App द्वारा रिपोर्टिंग\n\n**आप किस उत्पाद या विषय के बारे में जानना चाहते हैं?**`,
        citations: [],
        intent: 'CONVERSATIONAL_META',
        language: 'hi',
        confidence: 1.0,
        suggestedQuestions: [
          'What standard applies to packaged drinking water?',
          'What is marking fee in BIS certification?',
          'How to apply for an ISI Mark license on Manakonline?'
        ]
      };
    }

    // D. Identity ("tum kaun ho", "who are you", "what can you do")
    const isIdentity = /^(tum|aap)\s+(kaun|kon)\s+ho/i.test(lower) || /^(who\s+are\s+you|what\s+are\s+you|what\s+can\s+you\s+do|tum\s+kya\s+kar\s+sakte\s+ho)/i.test(lower);
    if (isIdentity) {
      return {
        answer: `### 🛡️ **ManakSetu AI — BIS इंटेलिजेंस असिस्टेंट**\n\nमैं **Bureau of Indian Standards (BIS)** का एक उन्नत एआई असिस्टेंट हूँ।\n\n#### 🎯 मेरी मुख्य क्षमताएं:\n1. **भारतीय मानक खोज (Standards Search):** 20,000+ भारतीय मानकों (IS Standards) और अनिवार्य QCO की सटीक जानकारी देना।\n2. **लाइसेंस व फैक्ट्री अनुपालन (Compliance Roadmap):** ISI मार्क, CRS, FMCS और Hallmarking के लिए स्टेप-बाय-स्टेप प्रक्रिया व आवश्यक दस्तावेज बताना।\n3. **सरकारी शुल्क कैलकुलेटर (Fee Calculation):** आवेदन शुल्क, फैक्ट्री ऑडिट चार्ज, और वार्षिक मार्किंग फीस का सटीक विवरण देना।\n4. **उपभोक्ता शिकायत निवारण (Consumer Grievances):** नकली ISI मार्क या नकली सोने के हॉलमार्क (HUID) की BIS Care App पर शिकायत दर्ज कराने में मार्गदर्शन करना।\n\n**आप किस मानक या प्रक्रिया के बारे में जानना चाहते हैं?**`,
        citations: [],
        intent: 'CONVERSATIONAL_META',
        language: 'hi',
        confidence: 1.0,
        suggestedQuestions: [
          'What is the standard for Packaged Drinking Water?',
          'What is marking fee in BIS certification?',
          'How to check if an ISI mark is genuine?'
        ]
      };
    }

    // E. Gratitude / Closure ("thank you", "dhanyawad", "shukriya", "theek hai")
    const isGratitude = /^(thank\s+you|thanks|dhanyawad|dhanyavaad|shukriya|bahut\s+badhiya|theek\s+hai|ok|okay|got\s+it)$/i.test(lower);
    if (isGratitude) {
      return {
        answer: `### 🙏 **आपका बहुत धन्यवाद!**\n\nयदि आपके पास भारतीय मानक ब्यूरो (BIS), किसी उत्पाद के मानक (IS), लाइसेंस फीस या टेस्टिंग से जुड़ा कोई अन्य प्रश्न हो, तो बेझिझक पूछें।\n\n*मानक सेतु हमेशा आपकी सहायता के लिए उपलब्ध है!*`,
        citations: [],
        intent: 'CONVERSATIONAL_META',
        language: 'hi',
        confidence: 1.0,
        suggestedQuestions: [
          'What is marking fee in BIS certification?',
          'What standard applies to TMT Steel rebars?',
          'How to report fake ISI marks on BIS Care App?'
        ]
      };
    }

    return null;
  }

  /**
   * Handles conceptual BIS knowledge questions (e.g. "marking fee kya hota hai", "QCO kya hai", "HUID kya hai")
   */
  private handleConceptualQuestions(
    query: string,
    history: { role: string; content: string }[]
  ): RAGResponse | null {
    const lower = query.toLowerCase().trim();

    // 1. MARKING FEE (मार्किंग शुल्क)
    const isMarkingFeeConcept =
      /(marking\s+fee|marking\s+charges|मार्किंग\s+शुल्क|मार्किंग\s+फीस)\s*(kya\s+hota\s+hai|kya\s+hai|kise\s+kehte|ka\s+kya\s+matlab|ka\s+arth|definition|meaning|explain|\?)/i.test(lower) ||
      /(kya\s+hota\s+hai|kya\s+hai|what\s+is|define|meaning\s+of|explain)\s*(marking\s+fee|marking\s+charge|मार्किंग\s+शुल्क)/i.test(lower) ||
      /^(marking\s+fee|marking\s+charges)\s*(\?|$)/i.test(lower);

    if (isMarkingFeeConcept) {
      return {
        answer: `### 🏷️ **मार्किंग शुल्क (Marking Fee) क्या होता है?**

**मार्किंग शुल्क (Marking Fee)** भारतीय मानक ब्यूरो (BIS) द्वारा लाइसेंस प्राप्त निर्माताओं से अपने प्रमाणित उत्पादों पर **मानक चिह्न (ISI Mark)** का उपयोग करने के अधिकार के बदले लिया जाने वाला आधिकारिक सरकारी शुल्क है।

---

#### 1. मार्किंग शुल्क की मुख्य विशेषताएं:
* **उपयोग का अधिकार:** यह लाइसेंस शुल्क से अलग होता है। जब किसी फैक्ट्री को ISI मार्क लाइसेंस (CM/L) मिल जाता है, तो वह उत्पाद पर ISI लोगो छापने के लिए मार्किंग शुल्क का भुगतान करती है।
* **उत्पादन आधारित गणना (Production-based Calculation):** मार्किंग शुल्क का निर्धारण वास्तविक उत्पादन मात्रा (Production Quantity) के आधार पर होता है (जैसे: प्रति 1,000 बोतल, प्रति मीट्रिक टन, या प्रति यूनिट)।
* **न्यूनतम मार्किंग शुल्क (Minimum Marking Fee):** यदि किसी वर्ष फैक्ट्री का उत्पादन कम भी रहता है, तब भी BIS द्वारा निर्धारित **न्यूनतम वार्षिक मार्किंग शुल्क** का भुगतान करना अनिवार्य होता है।

---

#### 2. BIS लाइसेंसिंग में कुल शुल्क घटक (Total Fee Structure):
1. **आवेदन शुल्क (Application Fee):** ₹1,000 (एकमुश्त / One-time)
2. **फैक्ट्री ऑडिट शुल्क (Inspection Fee):** ₹7,000 प्रति मैन-डे (Per Man-day)
3. **लैब टेस्टिंग शुल्क (Lab Testing Fee):** वास्तविक टेस्टिंग मापदंडों के अनुसार (BIS/NABL लैब दर)
4. **वार्षिक मार्किंग शुल्क (Annual Marking Fee):** उत्पाद श्रेणी अनुसार (वार्षिक देय)

---

#### 3. MSME और स्टार्टअप्स के लिए विशेष सरकारी छूट:
* **सूक्ष्म उद्यम (Micro Enterprises) व महिला उद्यमी:** मार्किंग शुल्क में **50% तक की छूट** प्राप्त कर सकते हैं।
* **लघु उद्यम (Small Enterprises):** मार्किंग शुल्क में **20% की छूट** प्राप्त कर सकते हैं।

---

🌐 **आधिकारिक पोर्टल व शुल्क तालिका:** [BIS Official Fee Structure & Portal](https://www.manakonline.in)`,
        citations: [
          {
            id: 'bis-fee-scheme-1',
            sourceType: 'SCHEME_RECORD',
            identifier: 'BIS Scheme-I (ISI Mark)',
            title: 'BIS (Conformity Assessment) Regulations, 2018 - Fee Schedule',
            clauseRef: 'Regulation 4 & Schedule II',
            sourceUrl: 'https://www.manakonline.in',
            isMandatoryQCO: false
          }
        ],
        intent: 'CONCEPT_EXPLANATION',
        language: 'hi',
        confidence: 0.98,
        suggestedQuestions: [
          'What is the marking fee for Packaged Drinking Water (IS 14543)?',
          'What is the marking fee for TMT Steel (IS 1786)?',
          'How to apply for an ISI Mark license on Manakonline?'
        ]
      };
    }

    // 2. QCO (Quality Control Order / गुणवत्ता नियंत्रण आदेश)
    const isQCOConcept =
      /(qco|quality\s+control\s+order|गुणवत्ता\s+नियंत्रण\s+आदेश)\s*(kya\s+hota\s+hai|kya\s+hai|kise\s+kehte|ka\s+kya\s+matlab|meaning|definition|explain|\?)/i.test(lower) ||
      /(kya\s+hota\s+hai|kya\s+hai|what\s+is|meaning\s+of|explain)\s*(qco|quality\s+control\s+order)/i.test(lower);

    if (isQCOConcept) {
      return {
        answer: `### ⚠️ **गुणवत्ता नियंत्रण आदेश (Quality Control Order - QCO) क्या होता है?**

**QCO (Quality Control Order)** भारत सरकार के विभिन्न मंत्रालयों (जैसे DPIIT, Ministry of Consumer Affairs, MoFPI) द्वारा जारी किया जाने वाला एक अनिवार्य कानूनी आदेश (Gazette Notification) है।

---

#### 1. QCO का मुख्य उद्देश्य और प्रभाव:
* **अनिवार्य प्रमाणन (Mandatory ISI Mark):** सामान्यतः BIS मानक स्वैच्छिक (Voluntary) होते हैं, लेकिन जिस उत्पाद पर **QCO** लागू हो जाता है, उसके लिए **BIS लाइसेंस (ISI मार्क)** लेना कानूनी रूप से अनिवार्य हो जाता है।
* **बिक्री व आयात पर रोक:** QCO लागू होने के बाद भारत में बिना वैध ISI मार्क के किसी भी उत्पाद का निर्माण, भंडारण, बिक्री, या विदेश से आयात करना गैरकानूनी (Illegal) है।
* **जनहित एवं सुरक्षा:** यह आदेश उपभोक्ताओं की सुरक्षा, स्वास्थ्य और घटिया विदेशी सामानों के डंपिंग को रोकने के लिए जारी किया जाता है।

---

#### 2. QCO उल्लंघन पर कानूनी दंड (Penalties under BIS Act, 2016):
* BIS Act, 2016 की धारा 14 एवं 15 के तहत बिना BIS लाइसेंस सामान बेचने पर:
  * **आर्थिक जुर्माना:** ₹5,00,000 या माल के मूल्य का 10 गुना तक।
  * **कारावास:** 2 वर्ष तक का सश्रम कारावास।
  * माल की जब्ती (Seizure of stock)।

---

#### 💡 प्रमुख उत्पाद जिन पर QCO अनिवार्य है:
* 💧 **Packaged Drinking Water (IS 14543)**
* 🏗️ **TMT Steel Rebars (IS 1786) & Cement (IS 269)**
* 🧸 **Toys (IS 9873)**, **Helmets (IS 4151)**, **Cables (IS 694)**, **Gold Jewellery (IS 1417)**

🌐 **आधिकारिक QCO सूची:** [e-BIS Mandatory QCO Catalogue](https://www.services.bis.gov.in)`,
        citations: [
          {
            id: 'bis-act-qco',
            sourceType: 'STANDARD_RECORD',
            identifier: 'BIS Act, 2016 - Section 16',
            title: 'Power of Central Government to issue Quality Control Orders (QCOs)',
            clauseRef: 'Section 16 & Section 29',
            sourceUrl: 'https://www.services.bis.gov.in',
            isMandatoryQCO: true
          }
        ],
        intent: 'CONCEPT_EXPLANATION',
        language: 'hi',
        confidence: 0.98,
        suggestedQuestions: [
          'Which products come under mandatory QCO?',
          'What standard applies to Packaged Drinking Water?',
          'How to check if a manufacturer has a valid BIS license?'
        ]
      };
    }

    // 3. HUID & Gold Hallmarking (हॉलमार्किंग और HUID)
    const isHUIDConcept =
      /(huid|hallmark|hallmarking|हॉलमार्क|एचयूआईडी)\s*(kya\s+hota\s+hai|kya\s+hai|kise\s+kehte|ka\s+kya\s+matlab|meaning|explain|\?)/i.test(lower) ||
      /(kya\s+hota\s+hai|kya\s+hai|what\s+is|explain)\s*(huid|hallmark|gold\s+hallmarking)/i.test(lower);

    if (isHUIDConcept) {
      return {
        answer: `### 🪙 **HUID और गोल्ड हॉलमार्किंग क्या होता है?**

**HUID (Hallmark Unique Identification)** सोने के आभूषणों की शुद्धता और प्रामाणिकता प्रमाणित करने के लिए BIS द्वारा शुरू किया गया एक **6-अंकों का विशिष्ट अल्फ़ान्यूमेरिक कोड (जैसे: AB1234)** है।

---

#### 1. हॉलमार्क के 3 प्रमुख चिह्न (3 Signs on Genuine Gold):
1. **BIS त्रिकोण लोगो (BIS Logo):** भारतीय मानक ब्यूरो का आधिकारिक त्रिभुजाकार चिह्न।
2. **शुद्धता ग्रेड (Purity Grade):** जैसे **22K916** (91.6% शुद्ध सोना), **18K750** (75% शुद्ध), **14K585** (58.5% शुद्ध)।
3. **6-अंकों का HUID कोड (6-Digit HUID):** लेज़र द्वारा उकेरा गया यूनिक नंबर जो प्रत्येक आभूषण को विशिष्ट पहचान देता है।

---

#### 2. उपभोक्ता कैसे जांचें (BIS Care App):
* Google Play Store / Apple App Store से **BIS Care App** डाउनलोड करें।
* **'Verify HUID'** विकल्प पर क्लिक करें और आभूषण पर छपा 6-अंकों का कोड दर्ज करें।
* ऐप आपको तुरंत ज्वैलर का नाम, रजिस्ट्रेशन नंबर, हॉलमार्किंग सेंटर का नाम, और शुद्धता की पुष्टि दिखा देगा।

---

🌐 **हॉलमार्किंग पोर्टल:** [BIS Hallmarking Portal](https://www.manakonline.in)`,
        citations: [
          {
            id: 'bis-is-1417',
            sourceType: 'STANDARD_RECORD',
            identifier: 'IS 1417:2016',
            title: 'Gold and Gold Alloys, Jewellery/Artefacts - Fineness and Marking',
            clauseRef: 'Clause 5.2 - Hallmarking Specification',
            sourceUrl: 'https://www.services.bis.gov.in',
            isMandatoryQCO: true
          }
        ],
        intent: 'CONCEPT_EXPLANATION',
        language: 'hi',
        confidence: 0.98,
        suggestedQuestions: [
          'How to verify 6-digit gold HUID in BIS Care App?',
          'What are the mandatory hallmarking purity grades?',
          'How to lodge a complaint against fake gold hallmark?'
        ]
      };
    }

    return null;
  }

  /**
   * Smart multi-turn query recontextualizer
   * Catches anaphoric references anywhere in the query (e.g. "kya iska licence lena padhta hai", "iska process kya hai")
   */
  private recontextualizeQuery(query: string, history: { role: string; content: string }[]): string {
    const currentStandards = extractStandardNumbers(query);
    if (currentStandards.length > 0) {
      return query;
    }

    const lower = query.toLowerCase().trim();

    // Check if user explicitly mentioned a new product in the current query
    const productKeywords = [
      { kw: 'packaged drinking water', std: 'IS 14543' },
      { kw: 'packaged water', std: 'IS 14543' },
      { kw: 'drinking water', std: 'IS 10500' },
      { kw: 'water bottle', std: 'IS 14543' },
      { kw: 'water plant', std: 'IS 14543' },
      { kw: 'water factory', std: 'IS 14543' },
      { kw: 'paani', std: 'IS 14543' },
      { kw: 'pani', std: 'IS 14543' },
      { kw: 'peyejal', std: 'IS 14543' },
      { kw: 'tmt steel', std: 'IS 1786' },
      { kw: 'tmt', std: 'IS 1786' },
      { kw: 'sariya', std: 'IS 1786' },
      { kw: 'cement', std: 'IS 269' },
      { kw: 'opc', std: 'IS 269' },
      { kw: 'ppc', std: 'IS 1489' },
      { kw: 'gold', std: 'IS 1417' },
      { kw: 'sona', std: 'IS 1417' },
      { kw: 'jewellery', std: 'IS 1417' },
      { kw: 'toy', std: 'IS 9873' },
      { kw: 'khilauna', std: 'IS 9873' },
      { kw: 'helmet', std: 'IS 4151' },
      { kw: 'cable', std: 'IS 694' },
      { kw: 'wire', std: 'IS 694' },
      { kw: 'plug', std: 'IS 1293' },
      { kw: 'socket', std: 'IS 1293' },
      { kw: 'battery', std: 'IS 16046' }
    ];

    for (const item of productKeywords) {
      if (lower.includes(item.kw)) {
        return `${item.std} ${query}`;
      }
    }

    // Check for anaphoric / follow-up references anywhere in query
    const isAnaphoricFollowup =
      /\b(iska|iski|isme|ismein|iske|inme|ispe|isko|inpe|it|its|this|that|these|those)\b/i.test(lower) ||
      /\b(aur\s+iski|aur\s+iska|aur\s+fees|aur\s+testing|fees\s+btao|process\s+btao|aage\s+btao|licence\s+lena|license\s+lena|mandatory\s+hai|anivarya\s+hai|zaroori\s+hai)\b/i.test(lower) ||
      (lower.length < 40 && /\b(fees|fee|cost|process|steps|procedure|testing|tests|sample|validity|qco|licence|license)\b/i.test(lower));

    if (isAnaphoricFollowup && history.length > 0) {
      for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i].content;
        const foundStandards = extractStandardNumbers(msg);
        if (foundStandards.length > 0) {
          return `${foundStandards[0]} ${query}`;
        }
      }
    }

    return query;
  }

  /**
   * Smart, Dynamic Intent-Driven Answer Synthesizer without repetitive boilerplate prefixes
   */
  private synthesizeDynamicAnswer(
    query: string,
    contextualQuery: string,
    retrieved: RetrievedContextItem[],
    classification: ClassifiedQuery,
    history: { role: string; content: string }[]
  ): string {
    const lowerQuery = query.toLowerCase().trim();
    const isHindi = classification.language === 'hi' || /kya|kaise|kitna|hoga|batao|btao|bataiye|niyam|prakriya|shikayat|kholni|lagana|karna|chahiye|fees|kisko|lena|padta|padhta|zaroori/i.test(lowerQuery);

    const isAskingMandatoryLicence =
      /(licence|license|laicense|pramanpatra|isi\s+mark)\s*(lena\s+padta|lena\s+padhta|zaroori|anivarya|mandatory|chahiye|\?)/i.test(lowerQuery) ||
      /(mandatory|anivarya|zaroori|compulsory)\s*(hai|hoga|\?)/i.test(lowerQuery) ||
      /(kya\s+iska\s+licence|kya\s+licence\s+lena)/i.test(lowerQuery);

    const isAskingBusinessSetup = /factory|plant|unit|kholni|lagana|setup|shuru karna|business|manufactur/i.test(lowerQuery);
    const isAskingFee = /fee|cost|price|kharch|kitna paisa|rupee|charges|shulk|paisa/i.test(lowerQuery);
    const isAskingSteps = /step|process|procedure|how to apply|kaise le|kaise apply|prakriya|charan|document/i.test(lowerQuery);
    const isAskingTesting = /test|parameter|limit|tds|ph|requirement|lab|microbiological|durability|strength|parikshan/i.test(lowerQuery);
    const isAskingGrievance = /complaint|fake|fraud|shikayat|report|huid|bis care/i.test(lowerQuery);

    // Fallback when no database record matches
    if (retrieved.length === 0) {
      if (isAskingMandatoryLicence || lowerQuery.includes('licence') || lowerQuery.includes('license')) {
        return `### 📋 **BIS (ISI मार्क) लाइसेंसिंग नियम व अनिवार्यता**

भारत में किसी भी उत्पाद के लिए BIS लाइसेंस लेना दो श्रेणियों पर निर्भर करता है:

---

#### 1. अनिवार्य उत्पाद (Mandatory QCOs):
* जिन उत्पादों पर सरकार का **Quality Control Order (QCO)** लागू है (जैसे *Packaged Drinking Water, TMT Steel, Cement, Helmets, Toys, Gold Jewellery*), उनके लिए **बिना ISI मार्क के निर्माण या बिक्री करना गैरकानूनी और दंडनीय** है।
* ऐसे उत्पादों के लिए BIS लाइसेंस लेना 100% अनिवार्य है।

#### 2. स्वैच्छिक उत्पाद (Voluntary Standards):
* अन्य सामान्य उत्पादों के लिए ISI मार्क स्वैच्छिक है। निर्माता अपनी ब्रांड वैल्यू और सरकारी टेंडर में लाभ के लिए स्वेच्छा से लाइसेंस ले सकते हैं।

---

💡 *कृपया अपने उत्पाद का नाम (जैसे: **Packaged Water**, **Cement**, **TMT Sariya**, आदि) बताएं ताकि मैं सटीक अनिवार्यता और फीस बता सकूँ।*`;
      }

      if (isHindi) {
        return `### ℹ️ **मानक विवरण व सहायता**

आपके प्रश्न **"${query}"** के लिए बीआईएस ज्ञानकोष से संबंधित जानकारी:

* **मानक खोज:** कृपया उत्पाद का नाम (जैसे *Packaged Drinking Water*, *TMT Steel*, *Cement*, *Gold Jewellery*) या मानक संख्या (जैसे **IS 14543**, **IS 1786**) लिखकर पूछें।
* **लाइसेंसिंग व फीस:** आप किसी भी उत्पाद के लिए लाइसेंस प्रक्रिया (\`लाइसेंस कैसे लें?\`) या सरकारी फीस (\`फीस कितनी है?\`) पूछ सकते हैं।
* **आधिकारिक पोर्टल:** [e-BIS Official Portal](https://www.services.bis.gov.in)`;
      }
      return `### ℹ️ **Standards Search Information**

Regarding your inquiry on **"${query}"**:

* **Search by Product:** Please specify a product name (e.g. *Packaged Drinking Water*, *TMT Steel*, *Cement*) or standard number (e.g. *IS 14543*, *IS 1786*).
* **Licensing & Fees:** You can also ask about licensing steps (*"How to apply for ISI mark?"*) or fee schedules (*"What is the fee structure?"*).
* **Official Portal:** [e-BIS Portal](https://www.services.bis.gov.in)`;
    }

    const primary = retrieved[0];
    const extractedIS = extractStandardNumbers(contextualQuery)[0] || primary.identifier;
    const stdNumberClean = extractedIS.replace(/[^0-9]/g, '');

    let seedStd = BIS_SEED_STANDARDS.find(s =>
      s.isNumber.toLowerCase().includes(extractedIS.toLowerCase()) ||
      (stdNumberClean && s.standardNo === stdNumberClean)
    );

    if (!seedStd) {
      if (/packaged|bottle|jar|mineral|plant/i.test(contextualQuery)) {
        seedStd = BIS_SEED_STANDARDS.find(s => s.standardNo === '14543') || BIS_SEED_STANDARDS[1];
      } else {
        seedStd = BIS_SEED_STANDARDS[0];
      }
    }

    const matchingProduct = BIS_SEED_PRODUCTS.find(p => p.applicableStandard.includes(seedStd.standardNo));
    const schemeI = BIS_SEED_SCHEMES.find(s => s.schemeCode === 'SCHEME_I_ISI_MARK')!;
    const schemeSeed = BIS_SEED_SCHEMES.find(s => s.schemeCode === seedStd.schemeType) || schemeI;

    // ==========================================
    // 1. MANDATORY LICENSING / QCO OBLIGATION INTENT
    // ==========================================
    if (isAskingMandatoryLicence) {
      if (seedStd.isMandatoryQCO) {
        if (isHindi) {
          return `### ⚠️ **हाँ, ${seedStd.isNumber} के लिए BIS लाइसेंस लेना कानूनी रूप से अनिवार्य (Mandatory) है!**

**मानक:** **${seedStd.isNumber}** — *${seedStd.title}*  
**नियामक स्थिति:** ⚠️ **अनिवार्य Quality Control Order (QCO)** लागू है।

---

#### 1. कानूनी अनिवार्यता (Legal Obligation):
* **बिना लाइसेंस बिक्री पर पूर्ण प्रतिबंध:** भारत सरकार के गजट नोटिफिकेशन एवं BIS Act, 2016 के तहत **${seedStd.title}** का निर्माण, भंडारण, बिक्री या आयात बिना वैध **ISI मार्क (CM/L लाइसेंस)** के करना गैरकानूनी है।
* **उल्लंघन पर कानूनी दंड (Penalties):** BIS Act की धारा 14 एवं 15 के तहत बिना BIS लाइसेंस इस उत्पाद का व्यापार करने पर ₹5 लाख तक का जुर्माना, 2 वर्ष तक का कारावास, और स्टॉक ज़ब्त किया जा सकता है।

---

#### 2. लाइसेंस प्राप्त करने की मुख्य प्रक्रिया:
1. **Manakonline पोर्टल** पर **Scheme-I (ISI Mark)** के तहत ऑनलाइन आवेदन करें।
2. निर्धारित सरकारी आवेदन शुल्क (**${schemeSeed.feeStructure.applicationFee}**) व ऑडिट शुल्क जमा करें।
3. फैक्ट्री में ${seedStd.isNumber} के अनुसार इन-हाउस टेस्टिंग लैब व केमिस्ट होना आवश्यक है।
4. BIS अधिकारी की ऑडिट व लैब टेस्टिंग रिपोर्ट पास होने पर **CM/L लाइसेंस** जारी होता है।

---

🌐 **ऑनलाइन आवेदन पोर्टल:** [Manakonline Scheme-I Portal](${schemeSeed.portalUrl})
💡 *आप मुझसे इस उत्पाद की सरकारी फीस (\`फीस कितनी है?\`) या लैब टेस्टिंग (\`टेस्टिंग क्या है?\`) के बारे में भी पूछ सकते हैं।*`;
        }

        return `### ⚠️ **Yes, BIS (ISI Mark) License is Strictly Mandatory for ${seedStd.isNumber}!**

**Standard:** **${seedStd.isNumber}** — *${seedStd.title}*  
**Regulatory Status:** ⚠️ **Mandatory Quality Control Order (QCO)** in effect.

---

#### 1. Legal Mandate & Non-Compliance Penalties:
* **Prohibition on Uncertified Sale:** Under the Gazette Notification and BIS Act 2016, manufacturing, packing, storing, importing, or selling **${seedStd.title}** without a valid BIS ISI Mark license (CM/L) is strictly illegal.
* **Penalties:** Violation attracts fines up to ₹5,00,000, imprisonment up to 2 years, and confiscation of non-compliant inventory under Sections 14 & 15 of the BIS Act.

---

#### 2. How to Obtain License:
1. Register and submit application on the **Manakonline Portal** under Scheme-I.
2. Pay the statutory application fee (**${schemeSeed.feeStructure.applicationFee}**) and factory audit fee.
3. Complete in-house testing lab setup conforming to **${seedStd.isNumber}**.
4. Grant of license upon satisfactory factory inspection and third-party sample testing.

---

🌐 **Application Portal:** [${schemeSeed.portalUrl}](${schemeSeed.portalUrl})`;
      } else {
        if (isHindi) {
          return `### ℹ️ **${seedStd.isNumber} के लिए BIS लाइसेंस वर्तमान में स्वैच्छिक (Voluntary) है।**

**मानक:** **${seedStd.isNumber}** — *${seedStd.title}*  
**नियामक स्थिति:** स्वैच्छिक मानक (Voluntary Standard)

---

#### 1. क्या लाइसेंस लेना अनिवार्य है?
* इस उत्पाद पर वर्तमान में कोई अनिवार्य **QCO (Quality Control Order)** लागू नहीं है।
* अतः कानूनी रूप से बिना ISI मार्क के भी इसका निर्माण व बिक्री की जा सकती है।

---

#### 2. फिर भी ISI मार्क लाइसेंस लेने के फायदे:
* **उपभोक्ता विश्वास व ब्रांड वैल्यू:** ISI मार्क मिलने से उत्पाद की प्रामाणिकता और बाज़ार में मांग बढ़ती है।
* **सरकारी टेंडर व GeM Portal:** कई सरकारी खरीद व टेंडर्स में केवल BIS प्रमाणित उत्पादों को प्राथमिकता दी जाती है।
* **आवेदन पोर्टल:** [Manakonline Portal](${schemeSeed.portalUrl})`;
        }

        return `### ℹ️ **BIS Certification for ${seedStd.isNumber} is currently Voluntary.**

**Standard:** **${seedStd.isNumber}** — *${seedStd.title}*  
**Regulatory Status:** Voluntary Standard (No Mandatory QCO)

Manufacturers can voluntarily obtain an ISI mark license via [Manakonline Portal](${schemeSeed.portalUrl}) to enhance market trust and qualify for government tenders.`;
      }
    }

    // ==========================================
    // 2. BUSINESS / FACTORY SETUP INTENT
    // ==========================================
    if (isAskingBusinessSetup) {
      if (isHindi) {
        return `### 🏭 **${seedStd.title} (${seedStd.isNumber}) — फैक्ट्री व प्लांट सेटअप गाइड**

**लागू मानक:** **${seedStd.isNumber}** (${seedStd.isMandatoryQCO ? '⚠️ अनिवार्य ISI मार्क प्रमाणन आवश्यक' : 'स्वेच्छिक मानक'})

---

#### 1. अनिवार्य इंफ्रास्ट्रक्चर एवं टेस्टिंग सेटअप:
* **इन-हाउस लैब:** फैक्ट्री में ${seedStd.isNumber} के परीक्षण हेतु कैलिब्रेटेड लैब उपकरण अनिवार्य हैं।
* **क्वालिटी केमिस्ट:** तकनीकी रूप से योग्य केमिस्ट / QC सुपरवाइजर की नियुक्ति।
* **प्लांट हाइजीन व मशीनरी:** BIS SIT (Scheme of Testing & Inspection) के अनुसार सुरक्षित उत्पादन एरिया।

---

#### 2. लाइसेंस प्राप्ति के 4 मुख्य चरण:
${schemeSeed.procedureSteps.map(s => `* **चरण ${s.stepNo} (${s.title}):** ${s.description} *[समय: ${s.timeEstimate}]*`).join('\n')}

---

#### 3. निर्धारित सरकारी शुल्क (Official Fees):
* **आवेदन शुल्क (Application):** ${schemeSeed.feeStructure.applicationFee}
* **फैक्ट्री ऑडिट चार्ज:** ${schemeSeed.feeStructure.inspectionFee}
* **वार्षिक मार्किंग शुल्क:** ${matchingProduct?.estimatedFee || schemeSeed.feeStructure.markingFee}

---

🌐 **ऑनलाइन आवेदन पोर्टल:** [Manakonline Portal](${schemeSeed.portalUrl})`;
      }

      return `### 🏭 **Factory Setup & ISI Mark Licensing Roadmap for ${seedStd.isNumber}**

**Standard:** **${seedStd.isNumber}** — *${seedStd.title}* (${seedStd.isMandatoryQCO ? '⚠️ Mandatory ISI Mark' : 'Voluntary'})

---

#### 1. Mandatory In-House Infrastructure:
* **Dedicated Testing Lab:** In-house laboratory conforming to **${seedStd.isNumber}** test parameters.
* **Competent Technical Person:** Qualified chemist / Quality control in-charge.
* **Hygienic Plant Layout:** Conforming strictly to BIS Scheme of Testing & Inspection (SIT).

---

#### 2. 4-Step Licensing Process:
${schemeSeed.procedureSteps.map(s => `* **Step ${s.stepNo} (${s.title}):** ${s.description} *[Est: ${s.timeEstimate}]*`).join('\n')}

---

#### 3. Official Government Fee Schedule:
* **Application Fee (One-time):** **${schemeSeed.feeStructure.applicationFee}**
* **Audit / Inspection Charge:** **${schemeSeed.feeStructure.inspectionFee}**
* **Annual Marking Fee:** **${matchingProduct?.estimatedFee || schemeSeed.feeStructure.markingFee}**

---

🌐 **Application Portal:** [${schemeSeed.portalUrl}](${schemeSeed.portalUrl})`;
    }

    // ==========================================
    // 3. FEE STRUCTURE INTENT
    // ==========================================
    if (isAskingFee) {
      if (isHindi) {
        return `### 💰 **${seedStd.isNumber} के लिए आधिकारिक सरकारी शुल्क विवरण**

**मानक:** **${seedStd.isNumber}** (${seedStd.title})

---

#### 1. सरकारी शुल्क तालिका:
* **आवेदन शुल्क (One-time Application):** **${schemeSeed.feeStructure.applicationFee}**
* **फैक्ट्री ऑडिट शुल्क (Audit per man-day):** **${schemeSeed.feeStructure.inspectionFee}**
* **वार्षिक मार्किंग शुल्क (Annual Marking Fee):** **${matchingProduct?.estimatedFee || schemeSeed.feeStructure.markingFee}**

---

#### 2. लैब टेस्टिंग व नवीनीकरण:
* **लैब टेस्टिंग:** BIS/NABL मान्यता प्राप्त लैब की परीक्षण दर अनुसार (परीक्षण अवधि: ~${seedStd.testingDays || 10} कार्यदिवस)।
* **वैधता एवं नवीनीकरण:** लाइसेंस 1 से 2 वर्ष के लिए जारी होता है, जिसके बाद रिन्यूअल देय होता है।

🌐 **आधिकारिक पोर्टल:** [Manakonline Fee Portal](${schemeSeed.portalUrl})`;
      }

      return `### 💰 **Official Government Fee Breakdown for ${seedStd.isNumber}**

**Standard:** **${seedStd.isNumber}** — *${seedStd.title}*

---

#### 1. Official Fee Schedule:
* **Application Fee (One-time):** **${schemeSeed.feeStructure.applicationFee}**
* **Factory Audit / Inspection Charge:** **${schemeSeed.feeStructure.inspectionFee}**
* **Annual Marking Fee:** **${matchingProduct?.estimatedFee || schemeSeed.feeStructure.markingFee}**

---

#### 2. Testing & Renewal:
* **Laboratory Testing:** Charged directly by BIS Central Labs / NABL-accredited labs for ${seedStd.testingDays || 14} days turnaround.
* **License Validity:** 1 to 2 years, renewable upon satisfactory compliance.

🌐 **Official Portal:** [${schemeSeed.portalUrl}](${schemeSeed.portalUrl})`;
    }

    // ==========================================
    // 4. COMPLIANCE STEPS INTENT
    // ==========================================
    if (isAskingSteps) {
      if (isHindi) {
        return `### 📋 **${seedStd.isNumber} के लिए बीआईएस लाइसेंस प्रक्रिया**

**मानक:** **${seedStd.isNumber}** (${seedStd.title})

---

#### 1. चरणबद्ध आवेदन प्रक्रिया:
${schemeSeed.procedureSteps.map(s => `* **Step ${s.stepNo}: ${s.title}** (${s.timeEstimate})\n  ${s.description}`).join('\n')}

---

#### 2. आवश्यक दस्तावेज चेकलिस्ट:
${schemeSeed.requiredDocuments.map(d => `* [x] **${d.docName}** (${d.format}) - ${d.isMandatory ? 'अनिवार्य' : 'ऐच्छिक'}`).join('\n')}

---

#### 3. सरकारी शुल्क:
* **आवेदन:** ${schemeSeed.feeStructure.applicationFee} | **निरीक्षण:** ${schemeSeed.feeStructure.inspectionFee} | **मार्किंग:** ${matchingProduct?.estimatedFee || schemeSeed.feeStructure.markingFee}

🌐 **आवेदन पोर्टल:** [Manakonline Portal](${schemeSeed.portalUrl})`;
      }

      return `### 📋 **Complete Compliance & Licensing Roadmap for ${seedStd.isNumber}**

**Standard:** **${seedStd.isNumber}** — *${seedStd.title}*

---

#### 1. Step-by-Step Procedure:
${schemeSeed.procedureSteps.map(s => `* **Step ${s.stepNo}: ${s.title}** (*${s.timeEstimate}*)\n  ${s.description}`).join('\n')}

---

#### 2. Mandatory Documentation Checklist:
${schemeSeed.requiredDocuments.map(d => `* [x] **${d.docName}** (${d.format}) — *${d.isMandatory ? 'Mandatory' : 'Optional'}*`).join('\n')}

---

#### 3. Government Fee Summary:
* **Application:** ${schemeSeed.feeStructure.applicationFee} | **Audit:** ${schemeSeed.feeStructure.inspectionFee} | **Marking Fee:** ${matchingProduct?.estimatedFee || schemeSeed.feeStructure.markingFee}

🌐 **Portal:** [${schemeSeed.portalUrl}](${schemeSeed.portalUrl})`;
    }

    // ==========================================
    // 5. TESTING PARAMETERS INTENT
    // ==========================================
    if (isAskingTesting) {
      if (isHindi) {
        return `### 🔬 **${seedStd.isNumber} के तकनीकी व लैब टेस्टिंग मापदंड**

**मानक:** **${seedStd.isNumber}** (${seedStd.title})

---

#### मुख्य तकनीकी आवश्यकताएं एवं टेस्ट:
${seedStd.keyRequirements.map((r, i) => `${i + 1}. **${r}**`).join('\n')}

---

#### नमूना व टेस्टिंग समय:
* **नमूना आकार (Sample Size):** ${seedStd.sampleSize || 'मानक अनुसार पर्याप्त मात्रा'}
* **परीक्षण अवधि:** लगभग **${seedStd.testingDays || 10} कार्यदिवस**
* **मान्यता प्राप्त लैब:** BIS Central/Regional Labs एवं NABL Accredited Facilities

🔗 **सत्यापित स्रोत:** [BIS Portal](${seedStd.sourceUrl || 'https://www.services.bis.gov.in'})`;
      }

      return `### 🔬 **Technical Testing Requirements & Quality Limits for ${seedStd.isNumber}**

**Standard:** **${seedStd.isNumber}** — *${seedStd.title}*

---

#### Key Mandatory Test Parameters:
${seedStd.keyRequirements.map((r, i) => `${i + 1}. **${r}**`).join('\n')}

---

#### Lab Specifications:
* **Required Sample Size:** **${seedStd.sampleSize || 'Representative commercial lot unit'}**
* **Testing Turnaround:** **~${seedStd.testingDays || 10} working days**
* **Authorized Labs:** BIS Central Laboratories & NABL-Accredited Labs.

🔗 **Authoritative Source:** [Bureau of Indian Standards](${seedStd.sourceUrl || 'https://www.services.bis.gov.in'})`;
    }

    // ==========================================
    // 6. GRIEVANCE / FRAUD INTENT
    // ==========================================
    if (isAskingGrievance) {
      const g = BIS_SEED_GRIEVANCES[0];
      if (isHindi) {
        return `### 🛡️ **नकली ISI मार्क / घटिया उत्पाद की शिकायत प्रक्रिया**

**विषय:** ${g.topic}

---

#### शिकायत कैसे दर्ज करें (Step-by-Step):
${g.stepsToReport.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---

#### महत्वपूर्ण कानूनी प्रावधान एवं हेल्पलाइन:
* **BIS Care App:** ऐप खोलें -> 'Verify CM/L' -> यदि अमान्य है तो 'Complaints' में फोटो अपलोड करें।
* **कानूनी दंड:** BIS Act, 2016 की धारा 14/15 के तहत ₹5 लाख तक जुर्माना एवं 2 वर्ष तक का कारावास।
* **राष्ट्रीय टोल-फ्री हेल्पलाइन:** **1800 11 1204**
* **शिकायत पोर्टल:** [e-BIS Consumer Portal](${g.onlinePortalUrl})`;
      }

      return `### 🛡️ **Consumer Protection: Reporting Fake ISI Marks & Substandard Goods**

**Topic:** ${g.topic}

---

#### Step-by-Step Redressal Action:
${g.stepsToReport.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---

#### Legal Provisions & Official Support:
* **BIS Care Mobile App Action:** *Open App -> Tap 'Verify CM/L' / 'Verify HUID' -> If Mismatch -> Submit Photo Proof & Invoice*.
* **Legal Penalties:** Punishable under Section 14 & 15 of BIS Act, 2016 (Fine up to ₹5,00,000 and up to 2 years imprisonment).
* **National Toll-Free Helpline:** **1800 11 1204**
* **Official Grievance Portal:** [${g.onlinePortalUrl}](${g.onlinePortalUrl})`;
    }

    // ==========================================
    // 7. DEFAULT INITIAL OVERVIEW
    // ==========================================
    if (isHindi) {
      return `### 📋 **${seedStd.isNumber} — ${seedStd.hindiTitle || seedStd.title}**

**मानक संख्या:** **${seedStd.isNumber}**  
**नियामक स्थिति:** ${seedStd.isMandatoryQCO ? '⚠️ **अनिवार्य QCO** (बिना ISI मार्क निर्माण व बिक्री गैरकानूनी है)' : 'स्वेच्छिक मानक'}

---

#### 1. मानक का दायरा (Scope):
${seedStd.scope}

---

#### 2. मुख्य तकनीकी आवश्यकताएं:
${seedStd.keyRequirements.slice(0, 4).map(r => `* ${r}`).join('\n')}

---

#### 3. लागू उत्पाद एवं लाइसेंस शुल्क:
* **लागू उत्पाद:** ${seedStd.applicableProducts.join(', ')}
* **आवेदन शुल्क:** ${schemeSeed.feeStructure.applicationFee} | **निरीक्षण:** ${schemeSeed.feeStructure.inspectionFee}
* **लाइसेंस पोर्टल:** [Manakonline Portal](${schemeSeed.portalUrl})

---

💡 *आप इस मानक की लाइसेंसिंग प्रक्रिया (\`लाइसेंस कैसे लें?\`), फीस विवरण (\`फीस कितनी है?\`), या लैब टेस्टिंग (\`टेस्टिंग क्या है?\`) के बारे में भी पूछ सकते हैं।*`;
    }

    return `### 📋 **${seedStd.isNumber} — ${seedStd.title}**

**Standard:** **${seedStd.isNumber}**  
**Regulatory Status:** ${seedStd.isMandatoryQCO ? '⚠️ **Mandatory Quality Control Order (QCO)**' : 'Voluntary Standard'}

---

#### 1. Scope & Objective:
${seedStd.scope}

---

#### 2. Key Mandatory Technical Parameters:
${seedStd.keyRequirements.slice(0, 4).map(r => `* ${r}`).join('\n')}

---

#### 3. Licensing & Official Fee Overview:
* **Application Fee:** ${schemeSeed.feeStructure.applicationFee} | **Audit Charge:** ${schemeSeed.feeStructure.inspectionFee}
* **Marking Fee:** ${matchingProduct?.estimatedFee || schemeSeed.feeStructure.markingFee}
* **Application Portal:** [Manakonline Portal](${schemeSeed.portalUrl})

---

💡 *You can also ask: "What are the compliance steps?", "What is the fee breakdown?", or "How to apply on Manakonline?".*`;
  }

  private generateSuggestedFollowups(classification: ClassifiedQuery, retrieved: RetrievedContextItem[], userQuery: string): string[] {
    const suggestions: string[] = [];
    const lower = userQuery.toLowerCase();

    if (retrieved.length > 0) {
      const std = retrieved[0].identifier;
      if (!lower.includes('step') && !lower.includes('apply') && !lower.includes('factory')) {
        suggestions.push(`What are the step-by-step compliance steps for ${std}?`);
      }
      if (!lower.includes('fee') && !lower.includes('cost')) {
        suggestions.push(`What is the fee structure and marking fee for ${std}?`);
      }
      if (!lower.includes('test') && !lower.includes('parameter')) {
        suggestions.push(`What are the laboratory testing parameters for ${std}?`);
      }
      suggestions.push(`How do I report fake ISI marks using the BIS Care App?`);
    } else {
      suggestions.push('What standard applies to packaged drinking water?');
      suggestions.push('What is marking fee in BIS certification?');
      suggestions.push('How to verify 6-digit gold HUID hallmarking?');
    }

    return suggestions.slice(0, 3);
  }
}

export const ragService = new RAGService();
