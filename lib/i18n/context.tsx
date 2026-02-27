'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'tr' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Complete translations for homepage and navigation
const translations: Record<Language, Record<string, string>> = {
  tr: {
    'app.name': 'AI Yüz Rekonstrüksiyon',
    'nav.home': 'Ana Sayfa',
    'nav.login': 'Giriş Yap',
    'nav.register': 'Üye Ol',
    'nav.dashboard': 'Dashboard',
    'nav.getStarted': 'Başlayın',
    'nav.signIn': 'Giriş Yap',
    'nav.knowledgeBase': 'Bilgi Tabanı',
    'nav.newCase': 'Yeni Olgu',
    'nav.adminPanel': 'Yönetici Paneli',
    'nav.signOut': 'Çıkış',
    'feature.image.title': 'Pre-op Görüntü Yükleme',
    'feature.image.desc': 'Hasta yüz görüntülerini (frontal, oblik, bazal) yükleyin ve gelişmiş görüntü işleme ile AI destekli görüntü analizi yapın',
    'feature.analysis.title': 'Lokal Flep Analizi',
    'feature.analysis.desc': 'AI destekli karar destek sistemi, detaylı cerrahi planlama ve risk değerlendirmesi ile optimal lokal flep seçeneklerini değerlendirir',
    'feature.storage.title': 'Güvenli Veri Depolama',
    'feature.storage.desc': 'Tüm olguları güvenli şekilde saklayın ve KVKK uyumlu veri yönetimi ile post-operatif takipleri yönetin',
    'stats.total': 'Toplam Olgu',
    'stats.planned': 'Planlı',
    'stats.operated': 'Opere',
    'stats.followup': 'Takip',
    'stats.access': '24/7',
    'stats.accessDesc': 'Erişim',
    'stats.ai': 'AI',
    'stats.aiDesc': 'AI destekli tasarım mimarisi',
    'stats.secure': 'Güvenli',
    'stats.secureDesc': 'Etik & kullanıcı odaklı tasarım',
    'stats.accessible': 'Erişilebilir',
    'stats.accessibleDesc': 'Basit klinik akış',
    'stats.kvkk': 'KVKK',
    'stats.kvkkDesc': 'KVKK & GDPR uyumlu tasarım prensipleri',
    'notice.title': 'Klinik Karar Destek',
    'notice.text': 'Bu platform <strong>AI destekli karar destek</strong> sistemidir. Nihai kararlar hastayı değerlendiren klinik ekibe aittir. AI önerileri profesyonel tıbbi görüşe ek bir referans kaynağı olarak kullanılmalıdır.',
    'notice.learnMore': 'Daha Fazla Bilgi',
    'footer.copyright': '© 2024 AI Yüz Rekonstrüksiyon Platformu. Tüm hakları saklıdır.',
    'footer.copyright2': '© 2025 – FaceTech Fusion · The Head & Neck Engineers',
    'footer.disclaimer': 'Sağlık profesyonelleri için AI destekli klinik karar destek platformu.',
    'hero.badge': 'Klinik AI Karar Destek Platformu',
    'hero.title': 'AI Destekli',
    'hero.titleHighlight': 'Yüz Rekonstrüksiyon Platformu',
    'hero.description': 'Pre-op yüz görüntülerini analiz ederek lokal flep seçeneklerini değerlendiren, klinik karar sürecini standardize eden yapay zeka destekli cerrahi planlama platformu.',
    'hero.bullet1': 'AI destekli cerrahi karar destek',
    'hero.bullet2': 'Pre-op görüntü analizi & lokal flep planlama',
    'hero.bullet3': 'KVKK uyumlu güvenli veri yönetimi',
    'concept.title': 'Analiz Paneli',
    'concept.subtitle': 'Pre-op Yüz Analizi',
    'concept.badge': 'AI',
    'concept.region': 'Anatomik bölge',
    'concept.regionValue': 'Nazolabial üçgen',
    'concept.size': 'Defekt boyutu',
    'concept.sizeValue': '2.4 × 3.1 cm',
    'concept.zone': 'Estetik zon',
    'concept.zoneValue': 'Yüksek görünürlük',
    'concept.note': 'AI modeli defekt konumu ve çevre dokularla ilişkisini değerlendirerek optimal flep seçeneklerini sunar.',
  },
  en: {
    'app.name': 'AI Facial Reconstruction',
    'nav.home': 'Home',
    'nav.login': 'Sign In',
    'nav.register': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.getStarted': 'Get Started',
    'nav.signIn': 'Sign In',
    'nav.knowledgeBase': 'Knowledge Base',
    'nav.newCase': 'New Case',
    'nav.adminPanel': 'Admin Panel',
    'nav.signOut': 'Sign Out',
    'feature.image.title': 'Pre-op Image Upload',
    'feature.image.desc': 'Upload patient facial images (frontal, oblique, basal) for AI-powered vision analysis with advanced image processing',
    'feature.analysis.title': 'Local Flap Analysis',
    'feature.analysis.desc': 'AI-driven decision support system evaluates optimal local flap options with detailed surgical planning and risk assessment',
    'feature.storage.title': 'Secure Data Storage',
    'feature.storage.desc': 'Store all cases securely and manage post-operative follow-ups with KVKK-compliant data management',
    'stats.total': 'Total Cases',
    'stats.planned': 'Planned',
    'stats.operated': 'Operated',
    'stats.followup': 'Follow-up',
    'stats.access': '24/7',
    'stats.accessDesc': 'Access',
    'stats.ai': 'AI',
    'stats.aiDesc': 'AI-powered design architecture',
    'stats.secure': 'Secure',
    'stats.secureDesc': 'Ethical & user-centered design',
    'stats.accessible': 'Accessible',
    'stats.accessibleDesc': 'Simple clinical workflow',
    'stats.kvkk': 'KVKK',
    'stats.kvkkDesc': 'KVKK & GDPR compliant design principles',
    'notice.title': 'Clinical Decision Support',
    'notice.text': 'This platform is an <strong>AI-powered decision support</strong> system. Final decisions rest with the clinical team evaluating the patient. AI recommendations serve as an additional reference to professional medical judgment.',
    'notice.learnMore': 'Learn More',
    'footer.copyright': '© 2024 AI Facial Reconstruction Platform. All rights reserved.',
    'footer.copyright2': '© 2025 – FaceTech Fusion · The Head & Neck Engineers',
    'footer.disclaimer': 'AI-powered clinical decision support platform for healthcare professionals.',
    'hero.badge': 'Clinical AI Decision Support Platform',
    'hero.title': 'AI-Powered',
    'hero.titleHighlight': 'Facial Reconstruction Platform',
    'hero.description': 'An AI-powered surgical planning platform that analyzes pre-op facial images to evaluate local flap options and standardize the clinical decision-making process.',
    'hero.bullet1': 'AI-powered surgical decision support',
    'hero.bullet2': 'Pre-op image analysis & local flap planning',
    'hero.bullet3': 'KVKK-compliant secure data management',
    'concept.title': 'Analysis Panel',
    'concept.subtitle': 'Pre-op Facial Analysis',
    'concept.badge': 'AI',
    'concept.region': 'Anatomical region',
    'concept.regionValue': 'Nasolabial triangle',
    'concept.size': 'Defect size',
    'concept.sizeValue': '2.4 × 3.1 cm',
    'concept.zone': 'Aesthetic zone',
    'concept.zoneValue': 'High visibility',
    'concept.note': 'The AI model evaluates the relationship between defect location and surrounding tissues to present optimal flap options.',
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'tr' || saved === 'en')) {
          return saved;
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    return 'tr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('language', lang);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
