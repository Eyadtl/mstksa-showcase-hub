import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from '../locales/en/translation.json';
import enNavigation from '../locales/en/navigation.json';
import enForms from '../locales/en/forms.json';
import enCatalogs from '../locales/en/catalogs.json';
import enCommon from '../locales/en/common.json';
import enAdmin from '../locales/en/admin.json';
import enMvs from '../locales/en/mvs.json';
import enProducts from '../locales/en/products.json';

import arTranslation from '../locales/ar/translation.json';
import arNavigation from '../locales/ar/navigation.json';
import arForms from '../locales/ar/forms.json';
import arCatalogs from '../locales/ar/catalogs.json';
import arCommon from '../locales/ar/common.json';
import arAdmin from '../locales/ar/admin.json';
import arMvs from '../locales/ar/mvs.json';
import arProducts from '../locales/ar/products.json';

// Define resources
const resources = {
  en: {
    translation: enTranslation,
    navigation: enNavigation,
    forms: enForms,
    catalogs: enCatalogs,
    common: enCommon,
    admin: enAdmin,
    mvs: enMvs,
    products: enProducts,
  },
  ar: {
    translation: arTranslation,
    navigation: arNavigation,
    forms: arForms,
    catalogs: arCatalogs,
    common: arCommon,
    admin: arAdmin,
    mvs: arMvs,
    products: arProducts,
  },
};

// Get language from localStorage or default to English
const getStoredLanguage = (): string => {
  try {
    return localStorage.getItem('language') || 'en';
  } catch {
    return 'en';
  }
};

// Initialize i18next
i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    lng: getStoredLanguage(), // Language to use (from localStorage or default)
    fallbackLng: 'en', // Fallback language if translation is missing
    defaultNS: 'translation', // Default namespace
    ns: ['translation', 'navigation', 'forms', 'catalogs', 'common', 'admin', 'mvs', 'products'], // Available namespaces
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Disable suspense mode for better error handling
    },
  });

// Apply RTL direction based on language
const applyDirection = (language: string) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
};

// Apply direction on initialization
applyDirection(i18n.language);

// Listen for language changes and update direction
i18n.on('languageChanged', (lng) => {
  applyDirection(lng);
  // Store language preference
  try {
    localStorage.setItem('language', lng);
  } catch (error) {
    console.error('Failed to save language preference:', error);
  }
});

export default i18n;
