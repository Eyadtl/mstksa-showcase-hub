# Development Workflow Guide

This guide provides detailed instructions for developers working on the MST-KSA website project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Working with Components](#working-with-components)
- [Working with Translations](#working-with-translations)
- [Working with Supabase](#working-with-supabase)
- [Testing Guidelines](#testing-guidelines)
- [Debugging Tips](#debugging-tips)
- [Common Tasks](#common-tasks)

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Recommended VS Code Extensions

Install these extensions for the best development experience:

- **ESLint**: For code linting
- **Prettier**: For code formatting
- **Tailwind CSS IntelliSense**: For Tailwind class autocomplete
- **TypeScript Vue Plugin (Volar)**: For TypeScript support
- **i18n Ally**: For translation management
- **GitLens**: For Git integration
- **Error Lens**: For inline error display

### Initial Setup

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd mst-ksa-website
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   ```sh
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server:**
   ```sh
   npm run dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:5173`

## Development Environment Setup

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Configuration
VITE_ADMIN_EMAIL=admin@mst-ksa.com
```

### Available Scripts

```sh
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Build for development (with source maps)
npm run build:dev

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint
```

### Development Server

The development server runs on `http://localhost:5173` with:
- Hot Module Replacement (HMR) for instant updates
- Fast refresh for React components
- TypeScript type checking
- ESLint integration

## Project Structure

```
mst-ksa-website/
├── public/                 # Static assets
│   ├── favicon.ico        # Site favicon
│   ├── robots.txt         # Search engine instructions
│   └── sitemap.xml        # Site map for SEO
│
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── admin/        # Admin-specific components
│   │   │   ├── CatalogUploadDialog.tsx
│   │   │   ├── CategoryDialog.tsx
│   │   │   └── ...
│   │   ├── ui/           # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── ContactModal.tsx
│   │   ├── PDFViewer.tsx
│   │   └── ...
│   │
│   ├── contexts/         # React contexts for global state
│   │   ├── AuthContext.tsx      # Authentication state
│   │   ├── LanguageContext.tsx  # i18n state
│   │   └── ThemeContext.tsx     # Theme state
│   │
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useLanguage.ts       # Language hook
│   │   ├── useCatalogs.ts       # Catalog data hook
│   │   └── ...
│   │
│   ├── layouts/          # Layout components
│   │   ├── AdminLayout.tsx      # Admin dashboard layout
│   │   └── MainLayout.tsx       # Public pages layout
│   │
│   ├── lib/              # Utility libraries
│   │   ├── supabase.ts          # Supabase client
│   │   ├── i18n.ts              # i18n configuration
│   │   └── utils.ts             # Helper functions
│   │
│   ├── locales/          # Translation files
│   │   ├── en/                  # English translations
│   │   │   ├── translation.json
│   │   │   ├── navigation.json
│   │   │   ├── forms.json
│   │   │   └── catalogs.json
│   │   └── ar/                  # Arabic translations
│   │       ├── translation.json
│   │       ├── navigation.json
│   │       ├── forms.json
│   │       └── catalogs.json
│   │
│   ├── pages/            # Page components
│   │   ├── Home.tsx             # Landing page
│   │   ├── Catalogs.tsx         # Public catalogs page
│   │   ├── Auth.tsx             # Authentication page
│   │   └── admin/               # Admin pages
│   │       ├── Dashboard.tsx
│   │       ├── Catalogs.tsx
│   │       ├── Categories.tsx
│   │       └── ContactSubmissions.tsx
│   │
│   ├── types/            # TypeScript type definitions
│   │   └── database.types.ts    # Supabase database types
│   │
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
│
├── supabase/
│   ├── migrations/       # Database migrations
│   │   └── 20240101000000_initial_schema.sql
│   ├── SCHEMA.md         # Database schema documentation
│   ├── README.md         # Supabase setup guide
│   └── GOOGLE_OAUTH_*.md # OAuth documentation
│
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── eslint.config.js      # ESLint configuration
└── README.md             # Project documentation
```

## Coding Standards

### TypeScript

**Use TypeScript for all files:**
```tsx
// ✅ Good
interface CatalogProps {
  id: string;
  title: string;
  onSelect: (id: string) => void;
}

export function Catalog({ id, title, onSelect }: CatalogProps) {
  // ...
}

// ❌ Bad - no types
export function Catalog({ id, title, onSelect }) {
  // ...
}
```

**Define interfaces for props and data:**
```tsx
// ✅ Good
interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// ❌ Bad - using any
const user: any = { ... };
```

### React Components

**Use functional components with hooks:**
```tsx
// ✅ Good
export function MyComponent() {
  const [state, setState] = useState<string>('');
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  return <div>{state}</div>;
}

// ❌ Bad - class component
export class MyComponent extends React.Component {
  // ...
}
```

**Keep components small and focused:**
```tsx
// ✅ Good - single responsibility
export function CatalogCard({ catalog }: CatalogCardProps) {
  return (
    <Card>
      <CardImage src={catalog.thumbnailUrl} />
      <CardTitle>{catalog.title}</CardTitle>
    </Card>
  );
}

// ❌ Bad - too many responsibilities
export function CatalogPage() {
  // Fetching, filtering, rendering, modals, etc. all in one component
}
```

**Extract custom hooks for reusable logic:**
```tsx
// ✅ Good
function useCatalogs() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['catalogs'],
    queryFn: fetchCatalogs,
  });
  
  return { catalogs: data, isLoading, error };
}

// Use in component
function CatalogsPage() {
  const { catalogs, isLoading } = useCatalogs();
  // ...
}
```

### Styling with Tailwind

**Use Tailwind utility classes:**
```tsx
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">
  <h1 className="text-2xl font-bold">Title</h1>
</div>

// ❌ Bad - inline styles
<div style={{ display: 'flex', padding: '16px' }}>
  <h1 style={{ fontSize: '24px' }}>Title</h1>
</div>
```

**Use RTL-aware classes for Arabic:**
```tsx
// ✅ Good
<div className="ml-4 rtl:mr-4 rtl:ml-0">
  Content
</div>

// ❌ Bad - not RTL-aware
<div className="ml-4">
  Content
</div>
```

**Use cn() utility for conditional classes:**
```tsx
import { cn } from '@/lib/utils';

// ✅ Good
<button className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Button
</button>
```

### Naming Conventions

**Files and folders:**
- Components: PascalCase (e.g., `CatalogCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useCatalogs.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase (e.g., `database.types.ts`)

**Variables and functions:**
```tsx
// ✅ Good
const catalogList = catalogs.map(...);
const handleSubmit = () => { ... };
const isLoading = true;

// ❌ Bad
const CatalogList = catalogs.map(...);
const submit = () => { ... };
const loading = true;
```

**Constants:**
```tsx
// ✅ Good
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const API_ENDPOINTS = { ... };

// ❌ Bad
const maxFileSize = 10485760;
const endpoints = { ... };
```

## Git Workflow

### Branch Strategy

```
main (production)
  ↓
develop (development)
  ↓
feature/feature-name (feature branches)
fix/bug-description (bug fix branches)
```

### Creating a Feature Branch

```sh
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/catalog-search

# Work on your feature
# ... make changes ...

# Commit changes
git add .
git commit -m "feat: add catalog search functionality"

# Push to remote
git push origin feature/catalog-search

# Create pull request on GitHub/GitLab
```

### Commit Message Format

Follow the Conventional Commits specification:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```sh
git commit -m "feat: add PDF zoom controls"
git commit -m "fix: resolve RTL layout issue in navigation"
git commit -m "docs: update deployment guide"
git commit -m "refactor: extract catalog card component"
git commit -m "style: format code with prettier"
git commit -m "chore: update dependencies"
```

### Pull Request Guidelines

1. **Create descriptive PR title:**
   - Use same format as commit messages
   - Example: "feat: add catalog search and filtering"

2. **Write clear PR description:**
   - What changes were made
   - Why the changes were needed
   - How to test the changes
   - Screenshots (if UI changes)

3. **Ensure CI passes:**
   - All tests pass
   - No linting errors
   - Build succeeds

4. **Request review:**
   - Assign reviewers
   - Address feedback
   - Update PR as needed

5. **Merge:**
   - Squash and merge (preferred)
   - Delete branch after merge

## Working with Components

### Creating a New Component

1. **Create component file:**
   ```tsx
   // src/components/CatalogCard.tsx
   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
   
   interface CatalogCardProps {
     title: string;
     thumbnailUrl: string;
     onSelect: () => void;
   }
   
   export function CatalogCard({ title, thumbnailUrl, onSelect }: CatalogCardProps) {
     return (
       <Card onClick={onSelect} className="cursor-pointer hover:shadow-lg transition-shadow">
         <CardHeader>
           <img src={thumbnailUrl} alt={title} className="w-full h-48 object-cover" />
         </CardHeader>
         <CardContent>
           <CardTitle>{title}</CardTitle>
         </CardContent>
       </Card>
     );
   }
   ```

2. **Export from index (if creating a component folder):**
   ```tsx
   // src/components/catalog/index.ts
   export { CatalogCard } from './CatalogCard';
   export { CatalogGrid } from './CatalogGrid';
   ```

3. **Use in parent component:**
   ```tsx
   import { CatalogCard } from '@/components/CatalogCard';
   
   function CatalogsPage() {
     return (
       <div className="grid grid-cols-3 gap-4">
         {catalogs.map(catalog => (
           <CatalogCard
             key={catalog.id}
             title={catalog.title}
             thumbnailUrl={catalog.thumbnailUrl}
             onSelect={() => handleSelect(catalog.id)}
           />
         ))}
       </div>
     );
   }
   ```

### Using Shadcn UI Components

```sh
# Add a new Shadcn component
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

This adds the component to `src/components/ui/`.

## Working with Translations

### Adding New Translation Keys

1. **Add to English translation file:**
   ```json
   // src/locales/en/translation.json
   {
     "catalog": {
       "title": "Catalogs",
       "search": "Search catalogs...",
       "noResults": "No catalogs found"
     }
   }
   ```

2. **Add to Arabic translation file:**
   ```json
   // src/locales/ar/translation.json
   {
     "catalog": {
       "title": "الكتالوجات",
       "search": "البحث في الكتالوجات...",
       "noResults": "لم يتم العثور على كتالوجات"
     }
   }
   ```

3. **Use in component:**
   ```tsx
   import { useTranslation } from 'react-i18next';
   
   function CatalogsPage() {
     const { t } = useTranslation();
     
     return (
       <div>
         <h1>{t('catalog.title')}</h1>
         <input placeholder={t('catalog.search')} />
       </div>
     );
   }
   ```

### Translation Best Practices

- Use nested keys for organization
- Keep keys descriptive and consistent
- Always add translations for both languages
- Use interpolation for dynamic values:
  ```tsx
  // Translation file
  {
    "welcome": "Welcome, {{name}}!"
  }
  
  // Component
  {t('welcome', { name: user.name })}
  ```

## Working with Supabase

### Fetching Data with TanStack Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

function useCatalogs() {
  return useQuery({
    queryKey: ['catalogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogs')
        .select('*, category:categories(*)')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

// Use in component
function CatalogsPage() {
  const { data: catalogs, isLoading, error } = useCatalogs();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <CatalogGrid catalogs={catalogs} />;
}
```

### Mutations with TanStack Query

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

function useCreateCatalog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (catalogData: CatalogFormData) => {
      const { data, error } = await supabase
        .from('catalogs')
        .insert(catalogData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success('Catalog created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create catalog');
      console.error(error);
    },
  });
}

// Use in component
function CatalogUploadDialog() {
  const createCatalog = useCreateCatalog();
  
  const handleSubmit = (data: CatalogFormData) => {
    createCatalog.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={createCatalog.isPending}>
        {createCatalog.isPending ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
```

### File Uploads

```tsx
async function uploadFile(file: File, bucket: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return publicUrl;
}
```

## Testing Guidelines

### Manual Testing Checklist

Before committing changes, test:

- [ ] Functionality works as expected
- [ ] Works in both English and Arabic
- [ ] RTL layout is correct in Arabic
- [ ] Works in light and dark themes
- [ ] Responsive on mobile, tablet, and desktop
- [ ] No console errors or warnings
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Forms validate correctly
- [ ] Authentication works (if applicable)

### Browser Testing

Test in these browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Accessibility Testing

- Test keyboard navigation (Tab, Enter, Escape)
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Check color contrast ratios
- Verify ARIA labels are present
- Ensure focus indicators are visible

## Debugging Tips

### React DevTools

Install React DevTools browser extension for:
- Inspecting component props and state
- Viewing component hierarchy
- Profiling performance

### TanStack Query DevTools

Already integrated in development mode:
- View query cache
- Inspect query states
- Debug refetch behavior
- Monitor mutations

### Supabase Debugging

```tsx
// Enable detailed logging
const { data, error } = await supabase
  .from('catalogs')
  .select('*')
  .eq('id', catalogId);

console.log('Query result:', { data, error });
```

### Common Issues

**Issue: "Module not found"**
- Check import path is correct
- Ensure file exists
- Check file extension (.tsx vs .ts)

**Issue: "Hydration error"**
- Check for mismatched HTML between server and client
- Ensure no browser-only code runs during SSR

**Issue: "Too many re-renders"**
- Check for infinite loops in useEffect
- Ensure dependencies array is correct
- Check for state updates in render

## Common Tasks

### Adding a New Page

1. Create page component in `src/pages/`:
   ```tsx
   // src/pages/About.tsx
   export function About() {
     return <div>About Page</div>;
   }
   ```

2. Add route in `App.tsx`:
   ```tsx
   <Route path="/about" element={<About />} />
   ```

3. Add navigation link:
   ```tsx
   <Link to="/about">{t('navigation.about')}</Link>
   ```

4. Add translations for the page

### Adding a New Admin Feature

1. Create admin page in `src/pages/admin/`
2. Add route with ProtectedRoute wrapper
3. Add navigation link in AdminLayout
4. Create necessary components
5. Add Supabase queries/mutations
6. Add translations
7. Test thoroughly

### Updating Database Schema

1. Create new migration file in `supabase/migrations/`
2. Write SQL for schema changes
3. Test migration locally
4. Apply to production via Supabase Dashboard
5. Update TypeScript types
6. Update documentation

### Optimizing Performance

1. Use React.lazy for code splitting:
   ```tsx
   const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
   ```

2. Memoize expensive computations:
   ```tsx
   const filteredCatalogs = useMemo(
     () => catalogs.filter(c => c.title.includes(search)),
     [catalogs, search]
   );
   ```

3. Use TanStack Query caching effectively
4. Optimize images and assets
5. Lazy load images with loading="lazy"

---

**Happy Coding! 🚀**

For questions or issues, refer to the [README.md](./README.md) or contact the development team.
