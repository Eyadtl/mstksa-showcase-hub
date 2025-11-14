import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Supported languages
 */
export type Language = 'en' | 'ar';

/**
 * Text direction based on language
 */
export type TextDirection = 'ltr' | 'rtl';

/**
 * Language context type definition
 */
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: TextDirection;
  t: ReturnType<typeof useTranslation>['t'];
}

/**
 * Create the language context
 */
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Language Provider Component
 * Manages language state and provides language switching functionality
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n: i18nInstance } = useTranslation();
  const [language, setLanguageState] = useState<Language>(() => {
    // Get initial language from i18n (which reads from localStorage)
    return (i18nInstance.language as Language) || 'en';
  });
  const [dir, setDir] = useState<TextDirection>(() => {
    // Get initial direction based on language
    return language === 'ar' ? 'rtl' : 'ltr';
  });

  /**
   * Change the application language
   * Updates i18next, localStorage, and document direction
   */
  const setLanguage = (lang: Language): void => {
    // Update i18next language (this will trigger the languageChanged event)
    i18nInstance.changeLanguage(lang);
    
    // Update local state
    setLanguageState(lang);
    
    // Update text direction
    const newDir: TextDirection = lang === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
    
    // Apply direction to document root
    document.documentElement.dir = newDir;
    document.documentElement.lang = lang;
    
    // Store language preference in localStorage
    try {
      localStorage.setItem('language', lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  /**
   * Listen for language changes from i18next
   * This handles cases where language is changed outside this context
   */
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const newLang = lng as Language;
      setLanguageState(newLang);
      
      const newDir: TextDirection = newLang === 'ar' ? 'rtl' : 'ltr';
      setDir(newDir);
    };

    // Subscribe to i18next language changes
    i18nInstance.on('languageChanged', handleLanguageChange);

    // Cleanup subscription on unmount
    return () => {
      i18nInstance.off('languageChanged', handleLanguageChange);
    };
  }, [i18nInstance]);

  /**
   * Apply initial direction on mount
   */
  useEffect(() => {
    const currentDir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = currentDir;
    document.documentElement.lang = language;
  }, []);

  const value: LanguageContextType = {
    language,
    setLanguage,
    dir,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

/**
 * Custom hook to use the language context
 * Throws an error if used outside of LanguageProvider
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
