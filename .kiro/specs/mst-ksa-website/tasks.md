
# Implementation Plan: Mst-ksa Website

This implementation plan breaks down the development of the Mst-ksa website into discrete, actionable coding tasks. Each task builds incrementally on previous work, ensuring a systematic approach to completing all requirements.

## Task List

- [x] 1. Set up Supabase integration foundation





  - Configure Supabase client with environment variables for project URL and anonymous key
  - Create TypeScript types for database models (Profile, Category, Catalog, ContactSubmission)
  - Set up environment variable validation on application startup
  - Create .env.example file documenting all required variables
  - _Requirements: 1.1, 1.2, 12.1, 12.2, 12.4, 12.5_

- [x] 2. Create database schema and security policies





  - Write SQL migration for profiles table extending auth.users
  - Write SQL migration for categories table with bilingual name fields
  - Write SQL migration for catalogs table with foreign key to categories
  - Write SQL migration for contact_submissions table
  - Implement Row Level Security policies for public read access to catalogs and categories
  - Implement Row Level Security policies for admin full access
  - Create storage buckets for catalogs (PDFs) and thumbnails with public read access
  - _Requirements: 1.3, 1.4, 1.5, 4.2_

- [x] 3. Implement authentication context and provider





  - Create AuthContext with user state, loading state, and authentication methods
  - Implement signIn method using Supabase email/password authentication
  - Implement signUp method using Supabase email/password authentication
  - Implement signInWithGoogle method using Supabase OAuth
  - Implement signOut method that clears session
  - Add Supabase auth state change listener to maintain session
  - Fetch user profile data including role after authentication
  - Handle authentication errors with appropriate error messages
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4. Build authentication pages





  - Create Auth page component with tabbed interface for Login and Sign Up
  - Implement login form with email and password fields
  - Implement sign up form with email and password fields
  - Add Google OAuth button to both login and sign up tabs
  - Integrate forms with AuthContext methods
  - Add form validation for email format and password length
  - Display error messages for failed authentication attempts
  - Implement redirect to admin dashboard after successful authentication
  - Add loading states during authentication process
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Implement protected route component





  - Create ProtectedRoute component that wraps admin routes
  - Check authentication status using AuthContext
  - Redirect unauthenticated users to /auth page
  - Verify admin role for routes requiring admin access
  - Show loading state during authentication check
  - Handle session expiration with redirect to login
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. Set up internationalization (i18n) system





  - Install and configure react-i18next library
  - Create translation file structure (en/ar directories with namespaces)
  - Write English translation files for navigation, forms, catalogs, and common UI strings
  - Write Arabic translation files for navigation, forms, catalogs, and common UI strings
  - Configure i18next with language detection from localStorage
  - Set fallback language to English
  - Configure RTL support for Arabic language
  - _Requirements: 2.1, 2.5_
-

- [x] 7. Create language context and provider




  - Create LanguageContext with language state and setLanguage function
  - Implement language switching that updates i18next and localStorage
  - Provide text direction (ltr/rtl) based on selected language
  - Apply dir attribute to document root element when language changes
  - Integrate with react-i18next translation function
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 8. Add language switcher to navigation





  - Create language switcher toggle component (EN/AR)
  - Integrate with LanguageContext to change language
  - Update navigation labels to use translations
  - Add RTL-aware styling using Tailwind rtl: variants
  - Show admin dashboard link only when user is authenticated
  - _Requirements: 2.2, 2.3, 2.4, 8.1_

- [x] 9. Apply RTL layout support across components





  - Update Navigation component with RTL-aware padding and margins
  - Update Footer component with RTL-aware layout
  - Update HeroSection with RTL-aware text alignment
  - Update ClientsCarousel with RTL-aware direction
  - Update ServicesSection with RTL-aware layout
  - Update MetricsSection with RTL-aware layout
  - Add rtl: variants to Tailwind classes where needed
  - _Requirements: 2.3, 2.4_

- [x] 10. Translate existing components





  - Translate Navigation component labels and buttons
  - Translate Footer component content and contact information
  - Translate HeroSection headline and CTA button
  - Translate ServicesSection title and description
  - Translate MetricsSection labels
  - Translate ContactModal form labels and placeholders
  - Translate success and error messages
  - _Requirements: 2.6, 13.6_


- [x] 11. Create admin dashboard layout




  - Create AdminLayout component with sidebar navigation and header
  - Implement responsive sidebar that collapses on mobile devices
  - Add navigation links for Dashboard, Catalogs, Categories, and Contact Submissions
  - Highlight active navigation item based on current route
  - Display authenticated user email in header
  - Add logout button in header that calls signOut from AuthContext
  - Style layout consistent with existing theme system
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 12. Build admin dashboard overview page





  - Create Dashboard page component as admin home
  - Display summary statistics cards (total catalogs, categories, submissions)
  - Show recent contact submissions in a list
  - Add quick action buttons for common tasks
  - Fetch data from Supabase using TanStack Query
  - Implement loading states with skeleton loaders
  - Handle errors with appropriate error messages
  - _Requirements: 11.1_

- [x] 13. Implement category management page





  - Create Categories admin page with data table
  - Fetch categories from Supabase using TanStack Query
  - Display categories with name (EN/AR), slug, and created date
  - Add "Add Category" button that opens CategoryDialog
  - Add edit icon button for each category row
  - Add delete icon button for each category row
  - Implement loading state while fetching categories
  - Display empty state when no categories exist
  - _Requirements: 5.1, 5.2, 9.1_
-

- [x] 14. Create category dialog component




  - Create CategoryDialog component with form for name_en and name_ar
  - Auto-generate slug from name_en using kebab-case conversion
  - Support both create and edit modes
  - Implement form validation with Zod schema
  - Display validation errors inline
  - Add save button that submits form
  - Add cancel button that closes dialog
  - _Requirements: 5.2, 5.3, 5.4, 5.5_
-

- [x] 15. Implement category CRUD operations




  - Create useCategoryMutations hook with TanStack Query mutations
  - Implement createCategory mutation that saves to Supabase
  - Implement updateCategory mutation that updates Supabase record
  - Implement deleteCategory mutation with validation check
  - Prevent deletion if category has associated catalogs
  - Display confirmation dialog before deletion
  - Show success toast after successful operations
  - Show error toast if operations fail
  - Invalidate categories query cache after mutations
  - _Requirements: 5.3, 5.5, 5.6, 5.7, 5.8_

- [x] 16. Build catalog management page





  - Create Catalogs admin page with data table
  - Fetch catalogs with category data using Supabase join query
  - Display catalogs with thumbnail, title (EN/AR), category, and file size
  - Add "Upload Catalog" button that opens CatalogUploadDialog
  - Add edit icon button for each catalog row
  - Add delete icon button for each catalog row
  - Implement search functionality to filter by title
  - Add category filter dropdown
  - Implement pagination for large datasets
  - Display loading state with skeleton loaders
  - Display empty state when no catalogs exist
  - _Requirements: 6.1, 6.8, 6.9, 6.10, 6.11_
-

- [x] 17. Create catalog upload dialog component




  - Create CatalogUploadDialog component with multi-step form
  - Add form fields for title_en, title_ar, and category_id
  - Add file input for PDF upload with drag-and-drop support
  - Add file input for thumbnail image upload with preview
  - Validate PDF file type and size (max 10MB) on client side
  - Validate thumbnail file type (PNG/JPG/WebP) and size (max 2MB)
  - Display file validation errors
  - Show upload progress indicators
  - Support both create and edit modes
  - _Requirements: 6.2, 6.3, 6.6, 6.7, 6.8_
- [x] 18. Implement catalog file upload to Supabase Storage
















  



- [ ] 18. Implement catalog file upload to Supabase Storage

  - Create useFileUpload hook for handling file uploads
  - Implement uploadPDF function that uploads to catalogs bucket
  - Implement uploadThumbnail function that uploads to thumbnails bucket
  - Generate unique file names using UUID
  - Handle upload progress events
  - Return public URLs after successful upload
  - Handle upload errors with retry logic
  - Clean up failed uploads
  - _Requirements: 6.3, 6.4_

- [x] 19. Implement catalog CRUD operations





  - Create useCatalogMutations hook with TanStack Query mutations
  - Implement createCatalog mutation that uploads files then saves metadata
  - Implement updateCatalog mutation that updates metadata and optionally replaces files
  - Implement deleteCatalog mutation that removes files from storage and database record
  - Display confirmation dialog before deletion
  - Show success toast after successful operations
  - Show error toast if operations fail
  - Invalidate catalogs query cache after mutations
  - _Requirements: 6.5, 6.9, 6.10, 6.11_

- [x] 20. Enhance public catalogs page with Supabase integration





  - Update Catalogs page to fetch data from Supabase using TanStack Query
  - Fetch catalogs with category information using join query
  - Display catalog thumbnail from Supabase Storage URL
  - Show catalog title in selected language (titleEn or titleAr)
  - Show category name in selected language
  - Implement client-side search filtering by title and category
  - Add category filter dropdown with all available categories
  - Combine search and category filters
  - Display loading state with skeleton loaders
  - Display "No catalogs found" message when filters return no results
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 2.7_

- [x] 21. Create PDF viewer component





  - Create PDFViewer component that displays PDF in full-screen modal
  - Use iframe with PDF URL from Supabase Storage
  - Add custom control bar overlay with buttons
  - Implement zoom in button that increases scale by 25%
  - Implement zoom out button that decreases scale by 25%
  - Add download button that triggers PDF download
  - Add print button that opens browser print dialog
  - Add share button that copies PDF URL to clipboard
  - Display toast notification when URL is copied
  - Add close button to exit viewer
  - Handle PDF loading state
  - Handle PDF loading errors
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

- [x] 22. Integrate PDF viewer with catalog grid





  - Add click handler to catalog thumbnails on public Catalogs page
  - Open PDFViewer component in modal when thumbnail is clicked
  - Pass PDF URL and catalog title to PDFViewer
  - Close PDFViewer and return to catalog grid on close button click
  - Maintain scroll position when returning to grid
  - _Requirements: 8.1_

- [x] 23. Enhance contact form with backend integration





  - Install and configure Zod for form validation
  - Create validation schema for contact form with all field rules
  - Integrate react-hook-form with Zod resolver
  - Update ContactModal to use react-hook-form
  - Display field-specific validation errors inline
  - Implement form submission handler that saves to Supabase
  - Save form data to contact_submissions table
  - Show loading state during submission
  - Display success toast after successful submission
  - Display error toast if submission fails
  - Clear form fields after successful submission
  - Close modal after successful submission
  - _Requirements: 9.1, 9.2, 9.3, 9.6, 9.7, 9.8, 9.9_

- [x] 24. Create contact submissions admin page





  - Create ContactSubmissions admin page with data table
  - Fetch submissions from Supabase using TanStack Query
  - Display columns for date, name, email, phone, subject, and status
  - Sort submissions by date with most recent first
  - Implement expandable rows to show full message content
  - Add search functionality to filter by name, email, or subject
  - Implement mark as read functionality that updates status
  - Display loading state with skeleton loaders
  - Display "No submissions yet" message when empty
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_
-

- [x] 25. Update routing configuration



  - Add /auth route for authentication page
  - Add /admin route with ProtectedRoute wrapper
  - Add /admin/dashboard route for dashboard overview
  - Add /admin/catalogs route for catalog management
  - Add /admin/categories route for category management
  - Add /admin/contact-submissions route for submissions view
  - Update App.tsx with all new routes
  - Ensure admin routes require authentication
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 26. Configure Google OAuth in Supabase





  - Document steps to configure Google OAuth provider in Supabase dashboard
  - Register OAuth redirect URLs for development and production
  - Test Google sign-in flow from authentication page
  - Verify user record creation in Supabase after Google auth
  - Verify redirect to admin dashboard after successful Google auth
  - Handle OAuth errors with appropriate error messages
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_
-

- [x] 27. Implement hardcoded success metrics




  - Update MetricsSection component to use constant values
  - Set "Years in Business" to 25
  - Set "Projects Completed" to 500
  - Set "Clients Served" to 150
  - Format numbers with thousand separators
  - Translate metric labels using i18n
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
-

- [x] 28. Add loading states and skeletons




  - Create skeleton loader components for catalog grid
  - Create skeleton loader for data tables
  - Add loading states to all data fetching operations
  - Show skeletons during initial data load
  - Show loading spinners during mutations
  - Implement optimistic updates for better UX
  - _Requirements: 7.9, 10.7_
- [-] 29. Implement error boundaries







- [ ] 29. Implement error boundaries

  - Create ErrorBoundary component to catch React errors
  - Add fallback UI for component crashes
  - Log errors to console in development
  - Provide recovery action (reload page)
  - Wrap main application sections with ErrorBoundary
  - _Requirements: Error handling strategy_

- [x] 30. Add empty states for all data views





  - Create EmptyState component with illustration and message
  - Add empty state to Catalogs page when no catalogs exist
  - Add empty state to Categories admin page
  - Add empty state to Catalogs admin page
  - Add empty state to Contact Submissions page
  - Include helpful call-to-action in each empty state
  - _Requirements: 7.7, 10.8_
-

- [x] 31. Implement comprehensive error handling




  - Add try-catch blocks to all async operations
  - Display user-friendly error messages via toast notifications
  - Log detailed errors to console for debugging
  - Handle network errors with retry suggestions
  - Handle validation errors with field-specific messages
  - Handle authentication errors with clear guidance
  - Handle file upload errors with specific feedback
  - _Requirements: Error handling strategy_


- [x] 32. Add accessibility improvements




  - Add ARIA labels to all interactive elements
  - Ensure proper heading hierarchy across all pages
  - Add alt text to all images
  - Ensure keyboard navigation works for all interactive elements
  - Add focus management to modals and dialogs
  - Verify color contrast ratios meet WCAG AA standards
  - Test with screen reader (NVDA or VoiceOver)
  - Add skip navigation links
  - _Requirements: Accessibility compliance_

- [x] 33. Optimize performance




  - Implement code splitting for admin routes using React.lazy
  - Lazy load PDF viewer component
  - Optimize images with WebP format and lazy loading
  - Configure TanStack Query cache times appropriately
  - Implement pagination for large datasets
  - Analyze bundle size and remove unused dependencies
  - Minimize CSS and JS in production build
  - _Requirements: Performance optimization_

- [x] 34. Add SEO meta tags





  - Add meta description to all public pages
  - Add Open Graph tags for social sharing
  - Add Twitter Card tags
  - Generate sitemap.xml for search engines
  - Add structured data (Schema.org) for organization
  - Ensure proper title tags on all pages
  - Add canonical URLs
  - _Requirements: SEO best practices_


- [x] 35. Cross-browser and responsive testing



  - Test on Chrome, Firefox, Safari, and Edge browsers
  - Test responsive design on mobile devices (iOS and Android)
  - Test responsive design on tablets
  - Verify RTL layout on all screen sizes
  - Test theme switching on all browsers
  - Fix any browser-specific issues
  - Verify touch interactions on mobile devices
  - _Requirements: Manual testing strategy_
- [x] 36. Write documentation

- [x] 36. Write documentation




  - Document environment variable setup in README
  - Document Supabase setup steps
  - Document Google OAuth configuration steps
  - Document database schema and migrations
  - Document deployment process
  - Create admin user guide for catalog management
  - Document development workflow
  - _Requirements: Deployment strategy_
