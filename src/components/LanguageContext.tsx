import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language } from '../types';
import koTranslations from '../locales/ko.json';
import vnTranslations from '../locales/vn.json';
import enTranslations from '../locales/en.json';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, any> = {
  ko: koTranslations,
  vn: vnTranslations,
  en: enTranslations,
};

const STORAGE_KEY = 'ggfinder_language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // localStorage에서 언어 설정 불러오기, 없으면 기본값 'ko'
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'ko' || stored === 'vn' || stored === 'en')) {
      return stored as Language;
    }
    return 'ko';
  });

  // 언어 변경 시 localStorage에 저장
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  // 중첩된 키 지원 (예: 'dashboard.tabs.grooms')
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    // 중첩된 키 탐색
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 키를 찾을 수 없으면 한국어로 fallback
        value = translations.ko;
        for (const k2 of keys) {
          if (value && typeof value === 'object' && k2 in value) {
            value = value[k2];
          } else {
            return key; // 한국어에도 없으면 키 자체 반환
          }
        }
        break;
      }
    }

    // 문자열이면 반환
    if (typeof value === 'string') {
      // 파라미터 치환 (예: {{count}}명)
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey]?.toString() || match;
        });
      }
      return value;
    }

    // 값을 찾을 수 없으면 키 자체 반환
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
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
