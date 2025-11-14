# MST-KSA Website

A modern, bilingual (Arabic/English) corporate website for MST-KSA, a premier steel manufacturing firm. The website showcases the company's brand, capabilities, and product catalogs with a comprehensive admin dashboard for content management.

## 🌟 Features

- **Bilingual Support**: Full Arabic and English translations with RTL layout support
- **Product Catalog Management**: Upload, organize, and display PDF catalogs with thumbnails
- **PDF Viewer**: Built-in PDF viewer with zoom, download, print, and share capabilities
- **Admin Dashboard**: Comprehensive admin interface for managing catalogs, categories, and contact submissions
- **Authentication**: Secure authentication with email/password and Google OAuth
- **Contact Form**: Contact form with backend integration and admin view
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode**: Light and dark theme support
- **SEO Optimized**: Meta tags, Open Graph, and structured data for better search visibility
- **Accessible**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support

## 🛠️ Technology Stack

**Frontend:**
- React 18.3 with TypeScript 5.8
- Vite 5.4 for build tooling
- React Router DOM 6.30 for routing
- Tailwind CSS 3.4 for styling
- Shadcn UI for component library
- react-i18next for internationalization
- TanStack Query 5.83 for data fetching and caching
- Framer Motion for animations

**Backend:**
- Supabase (PostgreSQL database, Auth, Storage)
- Row Level Security (RLS) for data protection
- Supabase Storage for file management

**State Management:**
- React Context API for global state (auth, i18n, theme)
- TanStack Query for server state management

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Supabase Setup](#supabase-setup)
- [Google OAuth Configuration](#google-oauth-configuration)
- [Development Workflow](#development-workflow)
- [Admin User Guide](#admin-user-guide)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- A Supabase account - [Sign up at supabase.com](https://supabase.com)
- Git installed

### Installation

1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables** (see [Environment Setup](#environment-setup))

4. **Set up Supabase** (see [Supabase Setup](#supabase-setup))

5. **Start the development server:**
   ```sh
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🔧 Environment Setup

This project requires environment variables to connect to Supabase and configure the application.

### Step 1: Create Environment File

Copy the example environment file:

```sh
cp .env.example .env
```

### Step 2: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **Anon/Public Key** → Use for `VITE_SUPABASE_ANON_KEY`

⚠️ **Important**: Never commit your `.env` file or expose your Supabase keys publicly!

### Step 3: Configure Environment Variables

Edit your `.env` file with your actual values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Configuration
VITE_ADMIN_EMAIL=admin@mst-ksa.com
```

**Environment Variables Explained:**

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | ✅ Yes |
| `VITE_ADMIN_EMAIL` | Email address for admin notifications | ✅ Yes |

### Step 4: Restart Development Server

After updating the `.env` file, restart your development server:

```sh
npm run dev
```

The application will validate all required environment variables on startup and display helpful error messages if any are missing.

### Troubleshooting

**Error: "Missing required environment variables"**
- Ensure all three environment variables are set in your `.env` file
- Check that variable names match exactly (including `VITE_` prefix)
- Restart the development server after making changes

**Error: "Failed to connect to Supabase"**
- Verify your Supabase URL is correct
- Ensure your Supabase project is active
- Check that the anon key is valid and not expired

## 🗄️ Supabase Setup

The application uses Supabase for authentication, database, and file storage. Follow these steps to set up your Supabase project.

### Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Fill in project details:
   - **Name**: MST-KSA Website
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
4. Click **Create new project** and wait for setup to complete (2-3 minutes)

### Step 2: Apply Database Migrations

The database schema includes tables for profiles, categories, catalogs, and contact submissions, along with Row Level Security policies.

**Option A: Using Supabase Dashboard (Recommended)**

1. In your Supabase project, navigate to **SQL Editor**
2. Open the file `supabase/migrations/20240101000000_initial_schema.sql` in your code editor
3. Copy the entire contents
4. Paste into the SQL Editor in Supabase
5. Click **Run** to execute the migration
6. Verify success by checking the **Table Editor** - you should see: `profiles`, `categories`, `catalogs`, `contact_submissions`

**Option B: Using Supabase CLI**

```sh
# Install Supabase CLI globally
npm install -g supabase

# Link your local project to Supabase
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Step 3: Verify Database Setup

Check that everything was created correctly:

1. Go to **Table Editor** in Supabase Dashboard
2. Verify these tables exist:
   - ✅ profiles
   - ✅ categories
   - ✅ catalogs
   - ✅ contact_submissions

3. Go to **Storage** in Supabase Dashboard
4. Verify these buckets exist:
   - ✅ catalogs (for PDF files)
   - ✅ thumbnails (for catalog images)

If buckets don't exist, create them manually:
- Click **New bucket**
- Name: `catalogs`, Public: ✅ Yes
- Name: `thumbnails`, Public: ✅ Yes

### Step 4: Create an Admin User

After setting up the database, you need at least one admin user:

1. **Sign up through the application:**
   - Start your dev server: `npm run dev`
   - Navigate to `/auth`
   - Sign up with your email and password

2. **Promote user to admin:**
   - Go to Supabase Dashboard → **SQL Editor**
   - Run this query (replace with your email):
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin-email@example.com';
   ```

3. **Verify admin access:**
   - Log out and log back in
   - You should now see the "Admin Dashboard" link in navigation
   - Navigate to `/admin` to access the dashboard

### Step 5: Configure Storage Policies

Storage policies should be created automatically by the migration. Verify them:

1. Go to **Storage** → **Policies**
2. Check that policies exist for:
   - Public read access to `catalogs` bucket
   - Public read access to `thumbnails` bucket
   - Admin upload/delete access to both buckets

If policies are missing, refer to `supabase/migrations/20240101000000_initial_schema.sql` for the policy definitions.

### Database Schema Overview

For detailed schema documentation, see [supabase/SCHEMA.md](./supabase/SCHEMA.md).

**Key Tables:**
- **profiles**: User profiles with role information (user/admin)
- **categories**: Bilingual catalog categories (English/Arabic)
- **catalogs**: Product catalog metadata with file references
- **contact_submissions**: Contact form submissions from users

**Security:**
- Row Level Security (RLS) enabled on all tables
- Public users can view published catalogs and categories
- Public users can submit contact forms
- Admin users have full CRUD access to all data
- Authenticated users can manage their own profiles

## 🔐 Google OAuth Configuration

Enable Google sign-in for administrators. For detailed instructions, see [supabase/GOOGLE_OAUTH_SETUP.md](./supabase/GOOGLE_OAUTH_SETUP.md).

### Quick Setup (5 minutes)

1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret**

2. **Configure Supabase:**
   - Go to Supabase Dashboard → **Authentication** → **Providers**
   - Find **Google** and toggle it on
   - Paste your **Client ID** and **Client Secret**
   - Click **Save**

3. **Configure Site URL:**
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL**: `http://localhost:5173` (development) or your production URL
   - Add redirect URLs:
     - `http://localhost:5173/**` (development)
     - `https://yourdomain.com/**` (production)
   - Click **Save**

4. **Test Google OAuth:**
   - Navigate to `/auth` in your application
   - Click **Sign in with Google**
   - Complete Google authentication
   - You should be redirected to the admin dashboard

### Troubleshooting OAuth

**Error: "redirect_uri_mismatch"**
- Ensure the redirect URI in Google Cloud Console matches exactly: `https://your-project-ref.supabase.co/auth/v1/callback`
- Check that there are no trailing slashes

**Error: "Invalid OAuth client"**
- Verify Client ID and Client Secret are correct in Supabase
- Ensure Google+ API is enabled in Google Cloud Console

**User created but not redirected:**
- Check Site URL configuration in Supabase
- Verify redirect URLs include your application URL

For comprehensive OAuth setup and testing, see:
- [supabase/GOOGLE_OAUTH_QUICK_REFERENCE.md](./supabase/GOOGLE_OAUTH_QUICK_REFERENCE.md)
- [supabase/GOOGLE_OAUTH_TESTING.md](./supabase/GOOGLE_OAUTH_TESTING.md)

## 💻 Development Workflow

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

### Development Best Practices

1. **Branch Strategy:**
   - `main`: Production-ready code
   - `develop`: Development branch
   - Feature branches: `feature/feature-name`
   - Bug fixes: `fix/bug-description`

2. **Code Style:**
   - Run `npm run lint` before committing
   - Follow TypeScript best practices
   - Use functional components with hooks
   - Keep components small and focused

3. **Commit Messages:**
   - Use clear, descriptive commit messages
   - Format: `type: description`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Example: `feat: add PDF viewer zoom controls`

4. **Testing:**
   - Test authentication flows
   - Test file uploads with various file types and sizes
   - Test RTL layout in Arabic language
   - Test responsive design on different screen sizes
   - Test dark mode theme switching

### Project Structure

```
mst-ksa-website/
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── admin/        # Admin-specific components
│   │   ├── ui/           # Shadcn UI components
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useLanguage.ts
│   │   └── ...
│   ├── layouts/          # Layout components
│   │   ├── AdminLayout.tsx
│   │   └── MainLayout.tsx
│   ├── lib/              # Utility libraries
│   │   ├── supabase.ts   # Supabase client
│   │   ├── i18n.ts       # i18n configuration
│   │   └── utils.ts      # Helper functions
│   ├── locales/          # Translation files
│   │   ├── en/           # English translations
│   │   └── ar/           # Arabic translations
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Catalogs.tsx
│   │   ├── Auth.tsx
│   │   └── admin/        # Admin pages
│   ├── types/            # TypeScript type definitions
│   │   └── database.types.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── supabase/
│   ├── migrations/       # Database migrations
│   ├── SCHEMA.md         # Database schema documentation
│   ├── README.md         # Supabase setup guide
│   └── GOOGLE_OAUTH_*.md # OAuth documentation
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── tailwind.config.ts    # Tailwind CSS configuration
```

### Adding New Features

1. **Create a new branch:**
   ```sh
   git checkout -b feature/your-feature-name
   ```

2. **Implement your feature:**
   - Add components in `src/components/`
   - Add pages in `src/pages/`
   - Add translations in `src/locales/en/` and `src/locales/ar/`
   - Update types in `src/types/`

3. **Test your changes:**
   - Test in both English and Arabic
   - Test in light and dark modes
   - Test on mobile and desktop
   - Test with and without authentication

4. **Commit and push:**
   ```sh
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create a pull request**

### Working with Translations

1. **Add new translation keys:**
   - Edit `src/locales/en/translation.json` for English
   - Edit `src/locales/ar/translation.json` for Arabic
   - Use nested keys for organization: `"catalog.title": "Catalogs"`

2. **Use translations in components:**
   ```tsx
   import { useTranslation } from 'react-i18next';
   
   function MyComponent() {
     const { t } = useTranslation();
     return <h1>{t('catalog.title')}</h1>;
   }
   ```

3. **RTL-aware styling:**
   ```tsx
   // Use Tailwind's rtl: variant
   <div className="ml-4 rtl:mr-4 rtl:ml-0">
     Content
   </div>
   ```

## 📚 Admin User Guide

### Accessing the Admin Dashboard

1. **Log in:**
   - Navigate to `/auth`
   - Sign in with your admin email and password
   - Or use "Sign in with Google"

2. **Navigate to dashboard:**
   - After login, you'll be redirected to `/admin`
   - Or click "Admin Dashboard" in the navigation menu

### Managing Categories

Categories organize your catalogs (e.g., "Structural Steel", "Fabrication").

**To add a category:**
1. Go to **Admin Dashboard** → **Categories**
2. Click **Add Category** button
3. Fill in:
   - **Name (English)**: Category name in English
   - **Name (Arabic)**: Category name in Arabic
   - **Slug**: Auto-generated URL-friendly identifier
4. Click **Save**

**To edit a category:**
1. Find the category in the table
2. Click the **Edit** icon (pencil)
3. Update the fields
4. Click **Save**

**To delete a category:**
1. Find the category in the table
2. Click the **Delete** icon (trash)
3. Confirm deletion
   - ⚠️ Note: You cannot delete a category that has catalogs. Remove or reassign catalogs first.

### Managing Catalogs

Catalogs are PDF documents showcasing your products.

**To upload a catalog:**
1. Go to **Admin Dashboard** → **Catalogs**
2. Click **Upload Catalog** button
3. Fill in the form:
   - **Title (English)**: Catalog title in English
   - **Title (Arabic)**: Catalog title in Arabic
   - **Category**: Select a category from dropdown
   - **PDF File**: Upload PDF (max 10MB)
   - **Thumbnail**: Upload image (PNG/JPG/WebP, max 2MB)
4. Click **Upload**
5. Wait for upload to complete (progress bar will show)

**File requirements:**
- PDF: Maximum 10MB, must be `.pdf` format
- Thumbnail: Maximum 2MB, must be `.png`, `.jpg`, `.jpeg`, or `.webp`

**To edit a catalog:**
1. Find the catalog in the table
2. Click the **Edit** icon (pencil)
3. Update metadata (title, category)
4. Optionally upload new PDF or thumbnail
5. Click **Save**

**To delete a catalog:**
1. Find the catalog in the table
2. Click the **Delete** icon (trash)
3. Confirm deletion
   - ⚠️ This will permanently delete the PDF and thumbnail from storage

**Search and filter:**
- Use the search box to filter by title
- Use the category dropdown to filter by category
- Combine search and category filters

### Viewing Contact Submissions

View and manage contact form submissions from users.

**To view submissions:**
1. Go to **Admin Dashboard** → **Contact Submissions**
2. View all submissions in the table
3. Click a row to expand and see the full message

**To mark as read:**
1. Find the submission
2. Click the **Mark as Read** button
3. Status will change from "new" to "read"

**To search submissions:**
- Use the search box to filter by name, email, or subject
- Submissions are sorted by date (newest first)

**Submission details:**
- **Date**: When the form was submitted
- **Name**: Submitter's name
- **Email**: Submitter's email address
- **Phone**: Submitter's phone number (if provided)
- **Subject**: Message subject
- **Message**: Full message content
- **Status**: new, read, or responded

### Best Practices

1. **Organize with categories:**
   - Create clear, descriptive category names
   - Use consistent naming in both languages
   - Don't create too many categories (5-10 is ideal)

2. **Optimize catalog files:**
   - Compress PDFs before uploading to reduce file size
   - Use high-quality thumbnails (recommended: 400x300px)
   - Use descriptive titles that help users find catalogs

3. **Respond to contacts:**
   - Check contact submissions regularly
   - Mark submissions as read after reviewing
   - Respond to inquiries promptly via email

4. **Regular maintenance:**
   - Remove outdated catalogs
   - Update catalog information as needed
   - Keep categories organized and relevant

## 🚀 Deployment

### Deploying to Vercel (Recommended)

1. **Prepare for deployment:**
   ```sh
   # Ensure all changes are committed
   git add .
   git commit -m "chore: prepare for deployment"
   git push
   ```

2. **Deploy to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click **New Project**
   - Import your Git repository
   - Configure project:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_ADMIN_EMAIL`
   - Click **Deploy**

3. **Update Supabase configuration:**
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
   - Add to **Redirect URLs**: `https://your-app.vercel.app/**`
   - Update Google OAuth redirect URIs if using Google sign-in

4. **Verify deployment:**
   - Visit your Vercel URL
   - Test authentication
   - Test catalog viewing
   - Test admin dashboard access

### Deploying to Other Platforms

**Netlify:**
```sh
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_ADMIN_EMAIL
```

**Custom Server:**
```sh
# Build the application
npm run build

# Serve the dist folder with a static file server
# Example with serve:
npm install -g serve
serve -s dist -p 3000
```

### Post-Deployment Checklist

- ✅ Environment variables are set correctly
- ✅ Supabase Site URL and Redirect URLs are updated
- ✅ Google OAuth redirect URIs are updated (if using)
- ✅ SSL certificate is active (HTTPS)
- ✅ Custom domain is configured (if applicable)
- ✅ Authentication works (email/password and Google)
- ✅ Admin dashboard is accessible
- ✅ Catalog uploads work
- ✅ Contact form submissions work
- ✅ Both languages (EN/AR) work correctly
- ✅ Theme switching works
- ✅ Mobile responsive design works

### Monitoring and Maintenance

**Performance Monitoring:**
- Use Vercel Analytics for performance insights
- Monitor Core Web Vitals
- Check bundle size regularly

**Error Tracking:**
- Consider integrating Sentry for error tracking
- Monitor Supabase logs for database errors
- Check browser console for client-side errors

**Regular Updates:**
- Keep dependencies updated: `npm update`
- Review and apply security patches
- Update Supabase client library regularly
- Test after updates

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For questions or issues:
- Email: admin@mst-ksa.com
- Documentation: See `supabase/` folder for detailed guides

## 🔗 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [react-i18next Documentation](https://react.i18next.com)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
