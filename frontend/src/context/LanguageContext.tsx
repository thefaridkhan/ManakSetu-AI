import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, { en: string; hi: string }> = {
  // Navigation
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.chat': { en: 'Ask AI', hi: 'एआई सहायक' },
  'nav.standards': { en: 'Indian Standards (IS)', hi: 'भारतीय मानक (IS)' },
  'nav.products': { en: 'Product Matcher', hi: 'उत्पाद खोज' },
  'nav.schemes': { en: 'Compliance & Schemes', hi: 'प्रमाणन योजनाएं' },
  'nav.grievance': { en: 'Consumer Grievance', hi: 'उपभोक्ता शिकायत' },
  'nav.admin': { en: 'Admin Telemetry', hi: 'प्रशासन टेलीमेट्री' },
  'nav.login': { en: 'Sign In', hi: 'लॉग इन' },
  'nav.register': { en: 'Register', hi: 'पंजीकरण' },
  'nav.logout': { en: 'Sign Out', hi: 'लॉग आउट' },

  // Hero
  'hero.tagline': { en: 'National Standards & Certification Intelligence', hi: 'राष्ट्रीय मानक एवं प्रमाणन सूचना प्रणाली' },
  'hero.title': { en: 'ManakSetu AI Assistant', hi: 'मानकसेतु एआई सहायक' },
  'hero.desc': {
    en: 'Authoritative, source-grounded answers for Indian Standards (IS), ISI Mark, CRS, FMCS, Hallmarking, and Quality Control Orders.',
    hi: 'भारतीय मानकों (IS), ISI मार्क, CRS, हॉलमार्किंग और अनिवार्य गुणवत्ता नियंत्रण आदेशों (QCO) की प्रामाणिक जानकारी।'
  },
  'hero.askBtn': { en: 'Start AI Consultation', hi: 'एआई से सवाल पूछें' },
  'hero.exploreBtn': { en: 'Browse Indian Standards', hi: 'भारतीय मानक खोजें' },

  // Features
  'features.grounded': { en: '100% Source Grounded', hi: 'प्रामाणिक बीआईएस स्रोतों पर आधारित' },
  'features.groundedDesc': { en: 'Strict anti-hallucination engine with exact IS standard numbers and clause citations.', hi: 'सटीक मानक संख्या एवं क्लॉज संदर्भ के साथ बिना किसी गलत जानकारी के।' },
  'features.industry': { en: 'Manufacturer Compliance', hi: 'उद्योग व निर्माताओं के लिए' },
  'features.industryDesc': { en: 'Generate instant factory audit roadmaps, lab test lists, and SIT checklists.', hi: 'फैक्ट्री ऑडिट रोडमैप, लैब टेस्ट सूची और आवश्यक दस्तावेजों की चेकलिस्ट।' },
  'features.consumer': { en: 'Consumer Protection', hi: 'उपभोक्ता सुरक्षा एवं शिकायत' },
  'features.consumerDesc': { en: 'Verify fake ISI marks, 6-digit HUID gold hallmarking, and BIS Care app workflows.', hi: 'फर्जी ISI मार्क व सोने की शुद्धता (HUID) जांचें और शिकायत दर्ज करें।' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
