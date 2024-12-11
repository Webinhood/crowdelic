import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n/i18n';

type Language = 'en' | 'pt-BR';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Tenta recuperar o idioma do localStorage
    const savedLanguage = localStorage.getItem('language');
    // Se não existir, usa o idioma do navegador ou pt-BR como fallback
    return (savedLanguage as Language) || 
           (navigator.language.startsWith('pt') ? 'pt-BR' : 'en');
  });

  useEffect(() => {
    // Atualiza o i18n quando o idioma mudar
    i18n.changeLanguage(language);
    // Salva o idioma no localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const value = {
    language,
    setLanguage: (lang: Language) => {
      setLanguage(lang);
    },
  };

  return (
    <LanguageContext.Provider value={value}>
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
