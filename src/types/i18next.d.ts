import 'i18next';

// Import translation resources
import enTranslation from '../locales/en/translation.json';
import enNavigation from '../locales/en/navigation.json';
import enForms from '../locales/en/forms.json';
import enCatalogs from '../locales/en/catalogs.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof enTranslation;
      navigation: typeof enNavigation;
      forms: typeof enForms;
      catalogs: typeof enCatalogs;
    };
  }
}
