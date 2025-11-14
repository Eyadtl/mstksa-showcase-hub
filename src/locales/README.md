# Internationalization (i18n) Setup

This directory contains the translation files for the Mst-ksa website, supporting both English (en) and Arabic (ar) languages.

## Structure

```
locales/
├── en/
│   ├── translation.json    # Common UI strings and messages
│   ├── navigation.json      # Navigation menu items
│   ├── forms.json          # Form labels, placeholders, and validation
│   └── catalogs.json       # Catalog-specific translations
└── ar/
    ├── translation.json    # Arabic common UI strings
    ├── navigation.json      # Arabic navigation items
    ├── forms.json          # Arabic form translations
    └── catalogs.json       # Arabic catalog translations
```

## Configuration

The i18n system is configured in `src/lib/i18n.ts` with the following features:

- **Language Detection**: Automatically detects language from localStorage
- **Fallback Language**: English (en) is used when translations are missing
- **RTL Support**: Automatically applies RTL direction for Arabic
- **Namespaces**: Organized translations into logical namespaces
- **Persistence**: Language preference is saved to localStorage

## Usage in Components

### Basic Translation

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('common.loading')}</h1>;
}
```

### Using Namespaces

```typescript
import { useTranslation } from 'react-i18next';

function Navigation() {
  const { t } = useTranslation('navigation');
  
  return <a href="/">{t('home')}</a>;
}
```

### Multiple Namespaces

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation(['translation', 'forms']);
  
  return (
    <>
      <p>{t('common.loading')}</p>
      <p>{t('forms:contact.title')}</p>
    </>
  );
}
```

### Interpolation

```typescript
const { t } = useTranslation();

// Translation: "Must be at least {{count}} characters"
<p>{t('errors.minLength', { count: 8 })}</p>
```

### Changing Language

```typescript
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('ar')}>العربية</button>
    </>
  );
}
```

### Getting Current Language and Direction

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  const currentLanguage = i18n.language; // 'en' or 'ar'
  const direction = i18n.dir(); // 'ltr' or 'rtl'
  
  return <div dir={direction}>Content</div>;
}
```

## RTL Support

The system automatically applies RTL layout when Arabic is selected:

- Sets `dir="rtl"` on the document root element
- Sets `lang="ar"` on the document root element
- Use Tailwind's `rtl:` variant for RTL-specific styles

Example:
```tsx
<div className="ml-4 rtl:mr-4 rtl:ml-0">
  Content with RTL-aware margins
</div>
```

## Adding New Translations

1. Add the key-value pair to the appropriate JSON file in both `en/` and `ar/` directories
2. Use the translation key in your component with `t('namespace:key')`
3. The translation will be automatically available

Example:
```json
// en/navigation.json
{
  "newItem": "New Item"
}

// ar/navigation.json
{
  "newItem": "عنصر جديد"
}
```

```typescript
// In component
const { t } = useTranslation('navigation');
<span>{t('newItem')}</span>
```

## Available Namespaces

- **translation**: Common UI strings, errors, success messages
- **navigation**: Navigation menu items, theme, language labels
- **forms**: Form labels, placeholders, validation messages, auth forms
- **catalogs**: Catalog page content, PDF viewer controls

## Language Codes

- `en`: English (LTR)
- `ar`: Arabic (RTL)

## Notes

- All translations are loaded at application startup
- Language preference persists across browser sessions
- The system automatically handles text direction changes
- TypeScript types are generated for translation keys (see `src/types/i18next.d.ts`)
