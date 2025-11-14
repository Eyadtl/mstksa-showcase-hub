# Design Document: Mst-ksa Website

## Overview

This design document outlines the technical architecture and implementation approach for completing the Mst-ksa corporate website. The system builds upon an existing React/TypeScript foundation with Tailwind CSS and Shadcn UI components. The design focuses on integrating Supabase backend services, implementing bilingual support with RTL layout, creating an admin dashboard for content management, and enhancing the catalog viewing experience with PDF capabilities.

### Design Principles

1. **Progressive Enhancement**: Build upon existing components rather than replacing them
2. **Separation of Concerns**: Clear boundaries between presentation, business logic, and data layers
3. **Type Safety**: Leverage TypeScript for compile-time error detection
4. **Accessibility**: Ensure WCAG 2.1 AA compliance for all interactive elements
5. **Performance**: Optimize for fast load times and smooth interactions
6. **Maintainability**: Use consistent patterns and clear code organization

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │   Public   │  │   Admin    │  │   Shared Components    │ │
│  │   Pages    │  │  Dashboard │  │   (Nav, Footer, UI)    │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
│         │               │                    │               │
│         └───────────────┴────────────────────┘               │
│                         │                                    │
│              ┌──────────▼──────────┐                        │
│              │   Application Core   │                        │
│              │  - i18n Context      │                        │
│              │  - Auth Context      │                        │
│              │  - Theme Context     │                        │
│              └──────────┬──────────┘                        │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                ┌─────────▼─────────┐
                │  Supabase Client  │
                └─────────┬─────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │  Auth   │      │Database │      │ Storage │
   │ Service │      │ (Postgres)     │ Buckets │
   └─────────┘      └─────────┘      └─────────┘
```

### Technology Stack

**Frontend:**
- React 18.3 with TypeScript 5.8
- Vite 5.4 for build tooling
- React Router DOM 6.30 for routing
- Tailwind CSS 3.4 for styling
- Shadcn UI for component library
- react-i18next for internationalization
- TanStack Query 5.83 for data fetching and caching

**Backend:**
- Supabase (PostgreSQL database, Auth, Storage)
- Supabase Edge Functions for serverless operations

**State Management:**
- React Context API for global state (auth, i18n, theme)
- TanStack Query for server state management
- Local component state with useState/useReducer


## Components and Interfaces

### 1. Supabase Integration Layer

#### Supabase Client Configuration

**File:** `src/lib/supabase.ts`

```typescript
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Singleton Supabase client instance
// Configured with environment variables
// Provides typed access to auth, database, and storage
```

**Key Responsibilities:**
- Initialize Supabase client with environment variables
- Export typed client for use throughout application
- Provide helper functions for common operations

#### Database Schema

**Tables:**

1. **profiles** (extends Supabase auth.users)
   - id: uuid (FK to auth.users)
   - email: text
   - role: text (default: 'user', admin: 'admin')
   - created_at: timestamp
   - updated_at: timestamp

2. **categories**
   - id: uuid (PK)
   - name_en: text
   - name_ar: text
   - slug: text (unique)
   - created_at: timestamp
   - updated_at: timestamp

3. **catalogs**
   - id: uuid (PK)
   - title_en: text
   - title_ar: text
   - category_id: uuid (FK to categories)
   - pdf_url: text
   - thumbnail_url: text
   - file_size: bigint
   - published: boolean (default: true)
   - created_at: timestamp
   - updated_at: timestamp

4. **contact_submissions**
   - id: uuid (PK)
   - name: text
   - email: text
   - phone: text (nullable)
   - subject: text
   - message: text
   - status: text (default: 'new')
   - created_at: timestamp
   - read_at: timestamp (nullable)

**Storage Buckets:**
- `catalogs`: PDF files (public read access)
- `thumbnails`: Catalog thumbnail images (public read access)

**Row Level Security Policies:**
- Public users: SELECT on catalogs, categories (where published = true)
- Authenticated admins: Full CRUD on all tables
- Public users: INSERT on contact_submissions
- Authenticated admins: SELECT on contact_submissions


### 2. Internationalization (i18n) System

#### i18n Configuration

**File:** `src/lib/i18n.ts`

```typescript
interface TranslationResources {
  en: { translation: Record<string, string> };
  ar: { translation: Record<string, string> };
}

// Configure i18next with:
// - Language detection from localStorage
// - Fallback to English
// - RTL support for Arabic
// - Namespace organization
```

**Translation File Structure:**
```
src/
  locales/
    en/
      translation.json    # Common UI strings
      navigation.json     # Nav and footer
      forms.json          # Form labels and validation
      catalogs.json       # Catalog-specific text
    ar/
      translation.json
      navigation.json
      forms.json
      catalogs.json
```

#### Language Context

**File:** `src/contexts/LanguageContext.tsx`

```typescript
interface LanguageContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
}

// Provides:
// - Current language state
// - Language switching function
// - Text direction for layout
// - Translation function wrapper
```

**Key Features:**
- Persist language preference in localStorage
- Apply `dir` attribute to document root
- Trigger re-render on language change
- Integrate with react-i18next

#### RTL Layout Support

**Implementation Strategy:**
- Use Tailwind's `rtl:` variant for directional styles
- Mirror flex/grid layouts automatically
- Adjust padding/margin for RTL context
- Flip icons and arrows where appropriate

**Example Pattern:**
```css
/* LTR: padding-left, RTL: padding-right */
.element {
  @apply pl-4 rtl:pr-4 rtl:pl-0;
}
```


### 3. Authentication System

#### Auth Context

**File:** `src/contexts/AuthContext.tsx`

```typescript
interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Manages:
// - Current user session
// - Authentication state
// - Sign in/up/out operations
// - Session persistence
```

**Key Responsibilities:**
- Listen to Supabase auth state changes
- Fetch user profile data including role
- Provide authentication methods
- Handle authentication errors
- Maintain loading states

#### Protected Route Component

**File:** `src/components/ProtectedRoute.tsx`

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

// Wraps admin routes
// Redirects to /auth if not authenticated
// Checks admin role if requireAdmin=true
// Shows loading state during auth check
```

#### Authentication Pages

**File:** `src/pages/Auth.tsx`

**Components:**
- Tabbed interface (Login/Sign Up)
- Email/password form with validation
- Google OAuth button
- Error message display
- Loading states
- Redirect after successful auth

**Validation Rules:**
- Email: Valid email format
- Password: Minimum 8 characters
- Display field-specific errors
- Disable submit during processing


### 4. Admin Dashboard Architecture

#### Dashboard Layout

**File:** `src/layouts/AdminLayout.tsx`

```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
}

// Structure:
// - Sidebar navigation (collapsible on mobile)
// - Header with user info and logout
// - Main content area
// - Responsive breakpoints
```

**Navigation Structure:**
```
Dashboard
├── Overview (stats summary)
├── Catalogs (manage PDFs)
├── Categories (manage categories)
└── Contact Submissions (view inquiries)
```

#### Admin Pages

**1. Dashboard Overview** (`src/pages/admin/Dashboard.tsx`)
- Summary statistics cards
- Recent contact submissions
- Quick actions

**2. Catalog Management** (`src/pages/admin/Catalogs.tsx`)
- Data table with catalogs
- Upload new catalog button
- Edit/delete actions per row
- Search and filter functionality
- Pagination for large datasets

**3. Category Management** (`src/pages/admin/Categories.tsx`)
- Data table with categories
- Add new category button
- Inline editing capability
- Delete with confirmation
- Usage count (number of catalogs)

**4. Contact Submissions** (`src/pages/admin/ContactSubmissions.tsx`)
- Data table with submissions
- Expandable rows for full message
- Mark as read functionality
- Search by name/email/subject
- Date range filtering
- Export to CSV option

#### Admin Components

**CatalogUploadDialog** (`src/components/admin/CatalogUploadDialog.tsx`)
```typescript
interface CatalogFormData {
  titleEn: string;
  titleAr: string;
  categoryId: string;
  pdfFile: File;
  thumbnailFile: File;
}

// Features:
// - Multi-step form (metadata → files)
// - File validation (type, size)
// - Upload progress indicators
// - Preview before submit
// - Error handling
```

**CategoryDialog** (`src/components/admin/CategoryDialog.tsx`)
```typescript
interface CategoryFormData {
  nameEn: string;
  nameAr: string;
  slug: string; // auto-generated from nameEn
}

// Features:
// - Bilingual input fields
// - Slug auto-generation
// - Validation
// - Create/edit modes
```


### 5. Public Catalog System

#### Enhanced Catalogs Page

**File:** `src/pages/Catalogs.tsx` (enhancement)

**New Features:**
- Integration with Supabase data
- Real-time filtering and search
- Category-based filtering
- Loading skeletons
- Empty states
- Error handling

**Data Flow:**
```
Component Mount
    ↓
Fetch catalogs from Supabase (TanStack Query)
    ↓
Cache results
    ↓
Apply client-side filters (search + category)
    ↓
Render grid with filtered results
```

**Component Structure:**
```typescript
interface Catalog {
  id: string;
  titleEn: string;
  titleAr: string;
  categoryId: string;
  categoryNameEn: string;
  categoryNameAr: string;
  thumbnailUrl: string;
  pdfUrl: string;
  fileSize: number;
}

// State management:
// - catalogs: Catalog[] (from TanStack Query)
// - searchQuery: string
// - selectedCategory: string | null
// - isLoading: boolean
// - error: Error | null
```

#### PDF Viewer Component

**File:** `src/components/PDFViewer.tsx`

**Implementation Approach:**
Use browser's native PDF rendering with custom controls overlay.

```typescript
interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

// Features:
// - Full-screen modal
// - Embedded iframe with PDF
// - Custom control bar:
//   - Zoom in/out buttons
//   - Download button
//   - Print button
//   - Share (copy link) button
//   - Close button
// - Responsive layout
// - Loading state
// - Error handling
```

**Control Bar Actions:**
1. **Zoom**: Manipulate iframe scale transform
2. **Download**: Trigger download via anchor element
3. **Print**: Open browser print dialog
4. **Share**: Copy URL to clipboard with toast feedback
5. **Close**: Unmount component and return to grid

**Browser Native Approach Benefits:**
- No external dependencies
- Consistent rendering across browsers
- Built-in PDF features (search, navigation)
- Smaller bundle size
- Better performance


### 6. Contact Form Integration

#### Enhanced Contact Modal

**File:** `src/components/ContactModal.tsx` (enhancement)

**New Features:**
- Supabase database integration
- Form validation with react-hook-form + zod
- Loading states during submission
- Success/error feedback
- Email notification trigger (future: Edge Function)

**Data Flow:**
```
User submits form
    ↓
Validate with Zod schema
    ↓
Save to Supabase contact_submissions table
    ↓
[Future] Trigger Edge Function for email
    ↓
Show success toast
    ↓
Clear form and close modal
```

**Validation Schema:**
```typescript
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
```

**Error Handling:**
- Network errors: "Unable to submit. Please try again."
- Validation errors: Field-specific messages
- Database errors: "Something went wrong. Please contact us directly."


### 7. Navigation Enhancements

#### Updated Navigation Component

**File:** `src/components/Navigation.tsx` (enhancement)

**New Features:**
- Language switcher (EN/AR toggle)
- Integration with i18n context
- Translated navigation labels
- RTL layout support
- Auth-aware menu items (show admin link if authenticated)

**Language Switcher Design:**
```
┌─────────────┐
│  EN  │  AR  │  ← Toggle button
└─────────────┘
```

**Navigation Items (Dynamic):**
- Home (always visible)
- Catalogs (always visible)
- Admin Dashboard (visible only when authenticated)
- Contact Us (always visible)
- Theme Toggle (always visible)
- Language Toggle (always visible)

#### Updated Footer Component

**File:** `src/components/Footer.tsx` (enhancement)

**New Features:**
- Translated content
- RTL layout support
- Dynamic year display
- Localized contact information


## Data Models

### TypeScript Interfaces

```typescript
// Database Models
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      catalogs: {
        Row: Catalog;
        Insert: CatalogInsert;
        Update: CatalogUpdate;
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: ContactSubmissionInsert;
        Update: ContactSubmissionUpdate;
      };
    };
  };
}

export interface Profile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Catalog {
  id: string;
  title_en: string;
  title_ar: string;
  category_id: string;
  pdf_url: string;
  thumbnail_url: string;
  file_size: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  created_at: string;
  read_at: string | null;
}

// View Models (with joins)
export interface CatalogWithCategory extends Catalog {
  category: Category;
}

// Form Models
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface CatalogFormData {
  title_en: string;
  title_ar: string;
  category_id: string;
  pdf_file: File;
  thumbnail_file: File;
}

export interface CategoryFormData {
  name_en: string;
  name_ar: string;
}
```


## Error Handling

### Error Handling Strategy

**Levels of Error Handling:**

1. **Network/API Errors**
   - Catch at service layer
   - Return typed error objects
   - Display user-friendly messages
   - Log to console in development

2. **Validation Errors**
   - Catch at form level
   - Display field-specific errors
   - Prevent submission until resolved
   - Use Zod for schema validation

3. **Authentication Errors**
   - Handle in AuthContext
   - Redirect to login when session expires
   - Display clear error messages
   - Provide retry mechanisms

4. **File Upload Errors**
   - Validate before upload (size, type)
   - Handle upload failures gracefully
   - Show progress and allow cancellation
   - Clean up partial uploads

### Error Display Patterns

**Toast Notifications** (for transient feedback):
- Success: Green toast with checkmark
- Error: Red toast with error icon
- Info: Blue toast with info icon
- Duration: 5 seconds (dismissible)

**Inline Errors** (for form validation):
- Display below input field
- Red text with error icon
- Clear on field change
- Prevent form submission

**Error Boundaries** (for component crashes):
- Catch React component errors
- Display fallback UI
- Log error details
- Provide recovery action

**Empty States** (for no data):
- Friendly illustration
- Descriptive message
- Call-to-action button
- Helpful suggestions

### Error Messages

**Authentication:**
- "Invalid email or password"
- "This email is already registered"
- "Session expired. Please log in again"
- "Unable to connect. Please check your internet connection"

**File Upload:**
- "File size must be less than 10MB"
- "Only PDF files are allowed"
- "Upload failed. Please try again"
- "Invalid file format"

**Form Validation:**
- "This field is required"
- "Please enter a valid email address"
- "Message must be at least 10 characters"
- "Please select a category"

**Data Operations:**
- "Unable to load catalogs. Please refresh the page"
- "Failed to save changes. Please try again"
- "Cannot delete category with existing catalogs"
- "Something went wrong. Please contact support"


## Testing Strategy

### Testing Approach

**Unit Testing:**
- Utility functions (i18n helpers, formatters)
- Custom hooks (useAuth, useLanguage)
- Validation schemas
- Data transformations

**Integration Testing:**
- Component interactions with contexts
- Form submission flows
- Authentication flows
- Data fetching with TanStack Query

**Manual Testing:**
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Responsive design on various devices
- RTL layout verification
- Theme switching
- File upload functionality
- PDF viewer controls

### Testing Tools

- **Vitest**: Unit and integration testing
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Playwright** (optional): E2E testing

### Critical Test Scenarios

1. **Authentication Flow**
   - Sign up with email/password
   - Sign in with email/password
   - Sign in with Google OAuth
   - Session persistence
   - Protected route access
   - Sign out

2. **Catalog Management**
   - Upload catalog with valid files
   - Upload with invalid file types
   - Upload with oversized files
   - Edit catalog metadata
   - Delete catalog
   - View catalog in PDF viewer

3. **Category Management**
   - Create new category
   - Edit existing category
   - Delete empty category
   - Prevent deletion of category with catalogs

4. **Contact Form**
   - Submit with valid data
   - Submit with invalid email
   - Submit with missing required fields
   - Verify database entry
   - Check success feedback

5. **Internationalization**
   - Switch to Arabic (verify RTL)
   - Switch to English (verify LTR)
   - Verify translations load
   - Check language persistence
   - Verify dynamic content translation

6. **Theme Switching**
   - Toggle light/dark mode
   - Verify color scheme changes
   - Check theme persistence
   - Verify contrast ratios


## Implementation Phases

### Phase 1: Foundation Setup
- Configure Supabase client and environment variables
- Set up database schema and RLS policies
- Create storage buckets
- Implement TypeScript types for database models

### Phase 2: Authentication System
- Create AuthContext and provider
- Build authentication pages (login/signup)
- Implement Google OAuth integration
- Create ProtectedRoute component
- Add authentication to navigation

### Phase 3: Internationalization
- Install and configure react-i18next
- Create translation files (en/ar)
- Implement LanguageContext
- Add language switcher to navigation
- Apply RTL styles for Arabic
- Translate existing components

### Phase 4: Admin Dashboard Foundation
- Create AdminLayout component
- Build dashboard navigation
- Implement admin routing
- Create dashboard overview page

### Phase 5: Category Management
- Build category management page
- Create CategoryDialog component
- Implement CRUD operations
- Add validation and error handling

### Phase 6: Catalog Management
- Build catalog management page
- Create CatalogUploadDialog component
- Implement file upload to Supabase Storage
- Add catalog CRUD operations
- Implement search and filtering

### Phase 7: Public Catalog Enhancement
- Connect Catalogs page to Supabase
- Implement real-time filtering
- Add category-based filtering
- Create loading and empty states

### Phase 8: PDF Viewer
- Build PDFViewer component
- Implement zoom controls
- Add download/print/share functionality
- Integrate with catalog grid

### Phase 9: Contact Form Integration
- Connect ContactModal to Supabase
- Add form validation with Zod
- Implement database save
- Create contact submissions admin page
- Add search and filtering

### Phase 10: Polish and Optimization
- Add loading skeletons
- Implement error boundaries
- Optimize images and assets
- Add SEO meta tags
- Test across browsers and devices
- Fix accessibility issues
- Performance optimization


## Security Considerations

### Authentication Security
- Use Supabase Auth for secure credential handling
- Implement proper session management
- Store tokens securely (httpOnly cookies via Supabase)
- Validate user roles on both client and server
- Implement rate limiting for auth endpoints

### Data Access Security
- Implement Row Level Security (RLS) policies
- Validate user permissions before operations
- Sanitize user inputs
- Use parameterized queries (handled by Supabase)
- Protect admin routes with authentication checks

### File Upload Security
- Validate file types on client and server
- Enforce file size limits
- Scan uploaded files for malware (future enhancement)
- Use signed URLs for temporary access
- Implement proper CORS policies

### API Security
- Use environment variables for sensitive data
- Never expose Supabase service key on client
- Implement proper error handling (don't leak sensitive info)
- Use HTTPS for all communications
- Validate and sanitize all inputs

### XSS Prevention
- React's built-in XSS protection
- Sanitize user-generated content
- Use Content Security Policy headers
- Avoid dangerouslySetInnerHTML

### CSRF Protection
- Supabase handles CSRF tokens
- Use SameSite cookie attributes
- Validate origin headers

## Performance Optimization

### Code Splitting
- Lazy load admin routes
- Lazy load PDF viewer component
- Split vendor bundles
- Use dynamic imports for heavy components

### Image Optimization
- Use WebP format with fallbacks
- Implement lazy loading for images
- Optimize thumbnail sizes
- Use responsive images with srcset

### Caching Strategy
- TanStack Query for data caching
- Cache catalog list (5 minutes)
- Cache categories (10 minutes)
- Invalidate cache on mutations
- Use stale-while-revalidate pattern

### Bundle Optimization
- Tree shaking unused code
- Minimize CSS and JS
- Use production builds
- Analyze bundle size with vite-bundle-visualizer
- Remove unused dependencies

### Loading Performance
- Implement skeleton loaders
- Show loading states immediately
- Prefetch critical data
- Optimize font loading
- Minimize render-blocking resources

### Database Optimization
- Index frequently queried columns
- Use efficient queries with proper joins
- Implement pagination for large datasets
- Cache frequently accessed data
- Use database connection pooling (Supabase handles this)

## Accessibility Compliance

### WCAG 2.1 AA Requirements

**Perceivable:**
- Provide text alternatives for images
- Ensure sufficient color contrast (4.5:1 for text)
- Support text resizing up to 200%
- Avoid content that flashes

**Operable:**
- All functionality available via keyboard
- Provide skip navigation links
- Use descriptive link text
- Ensure focus indicators are visible
- Provide adequate time for interactions

**Understandable:**
- Use clear, simple language
- Provide error suggestions
- Use consistent navigation
- Label form inputs properly
- Indicate required fields

**Robust:**
- Use semantic HTML
- Ensure compatibility with assistive technologies
- Validate HTML markup
- Use ARIA labels where appropriate

### Implementation Details
- Use semantic HTML5 elements
- Add ARIA labels to interactive elements
- Ensure proper heading hierarchy
- Provide alt text for images
- Use role attributes appropriately
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Ensure keyboard navigation works
- Provide focus management in modals
- Use proper form labels and error messages

## Deployment Strategy

### Environment Setup
- Development: Local Vite dev server
- Staging: Vercel preview deployments
- Production: Vercel production deployment

### Environment Variables
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_ADMIN_EMAIL=admin@mst-ksa.com
```

### Build Process
1. Run type checking: `tsc --noEmit`
2. Run linting: `npm run lint`
3. Build production bundle: `npm run build`
4. Preview build: `npm run preview`
5. Deploy to Vercel

### Monitoring
- Error tracking with Sentry (optional)
- Analytics with Google Analytics (optional)
- Performance monitoring with Vercel Analytics
- Uptime monitoring

### Backup Strategy
- Supabase automatic daily backups
- Export database schema regularly
- Version control for all code
- Document deployment procedures

## Future Enhancements

### Phase 2 Features (Post-MVP)
- Email notifications via Supabase Edge Functions
- Advanced analytics dashboard
- Bulk catalog operations
- Catalog versioning
- User feedback system
- Newsletter subscription
- Blog/news section
- Project showcase gallery
- Client testimonials
- Advanced search with filters
- Catalog favorites/bookmarks
- Print-optimized catalog pages
- Multi-file catalog uploads
- Catalog categories hierarchy
- Admin activity logs
- Role-based permissions (multiple admin levels)

### Technical Improvements
- Implement E2E testing with Playwright
- Add Storybook for component documentation
- Implement CI/CD pipeline
- Add automated accessibility testing
- Implement progressive web app (PWA) features
- Add offline support
- Implement real-time updates with Supabase Realtime
- Add full-text search with PostgreSQL
- Implement advanced caching strategies
- Add GraphQL layer (optional)

---

## Design Decisions and Rationale

### Why Browser Native PDF Viewer?
- **Simplicity**: No external dependencies, smaller bundle
- **Performance**: Leverages browser's optimized rendering
- **Compatibility**: Works consistently across modern browsers
- **Maintenance**: Less code to maintain
- **User Familiarity**: Users know browser PDF controls

### Why react-i18next?
- **Industry Standard**: Most popular i18n library for React
- **RTL Support**: Built-in RTL layout support
- **Type Safety**: TypeScript support
- **Flexibility**: Supports namespaces, interpolation, pluralization
- **Performance**: Lazy loading of translations

### Why TanStack Query?
- **Caching**: Automatic caching and invalidation
- **Loading States**: Built-in loading and error states
- **Optimistic Updates**: Easy optimistic UI updates
- **Devtools**: Excellent debugging tools
- **Type Safety**: Full TypeScript support

### Why Supabase?
- **All-in-One**: Auth, database, storage in one platform
- **PostgreSQL**: Powerful relational database
- **Real-time**: Built-in real-time subscriptions
- **Security**: Row Level Security policies
- **Scalability**: Handles growth automatically
- **Developer Experience**: Excellent DX with TypeScript support

### Why Tailwind CSS?
- **Already Integrated**: Existing project uses Tailwind
- **Consistency**: Design system via configuration
- **Performance**: Purges unused CSS
- **RTL Support**: Built-in RTL utilities
- **Theme Support**: Easy dark mode implementation
- **Developer Experience**: Fast development with utility classes
