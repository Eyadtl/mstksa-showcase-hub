-- =====================================================
-- MST-KSA Website Database Schema
-- =====================================================
-- This migration creates the complete database schema including:
-- 1. Profiles table (extends auth.users)
-- 2. Categories table (bilingual)
-- 3. Catalogs table (with foreign keys)
-- 4. Contact submissions table
-- 5. Row Level Security policies
-- 6. Storage buckets for PDFs and thumbnails
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
-- Extends auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Create index on role for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- 2. CATEGORIES TABLE
-- =====================================================
-- Stores catalog categories with bilingual names
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- =====================================================
-- 3. CATALOGS TABLE
-- =====================================================
-- Stores catalog metadata with references to files in storage
CREATE TABLE IF NOT EXISTS public.catalogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    pdf_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category_id for faster joins
CREATE INDEX IF NOT EXISTS idx_catalogs_category_id ON public.catalogs(category_id);

-- Create index on published for filtering
CREATE INDEX IF NOT EXISTS idx_catalogs_published ON public.catalogs(published);

-- =====================================================
-- 4. CONTACT SUBMISSIONS TABLE
-- =====================================================
-- Stores contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

-- Create index on email for searching
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);

-- =====================================================
-- 5. UPDATED_AT TRIGGER FUNCTION
-- =====================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to profiles
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Apply updated_at trigger to categories
DROP TRIGGER IF EXISTS set_updated_at_categories ON public.categories;
CREATE TRIGGER set_updated_at_categories
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Apply updated_at trigger to catalogs
DROP TRIGGER IF EXISTS set_updated_at_catalogs ON public.catalogs;
CREATE TRIGGER set_updated_at_catalogs
    BEFORE UPDATE ON public.catalogs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- PROFILES TABLE POLICIES
-- -----------------------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Admins have full access to all profiles
CREATE POLICY "Admins have full access to profiles"
    ON public.profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- -----------------------------------------------------
-- CATEGORIES TABLE POLICIES
-- -----------------------------------------------------

-- Public users can view all categories
CREATE POLICY "Public users can view categories"
    ON public.categories
    FOR SELECT
    TO public
    USING (true);

-- Authenticated users can view all categories
CREATE POLICY "Authenticated users can view categories"
    ON public.categories
    FOR SELECT
    TO authenticated
    USING (true);

-- Admins can insert categories
CREATE POLICY "Admins can insert categories"
    ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update categories
CREATE POLICY "Admins can update categories"
    ON public.categories
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete categories
CREATE POLICY "Admins can delete categories"
    ON public.categories
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- -----------------------------------------------------
-- CATALOGS TABLE POLICIES
-- -----------------------------------------------------

-- Public users can view published catalogs
CREATE POLICY "Public users can view published catalogs"
    ON public.catalogs
    FOR SELECT
    TO public
    USING (published = true);

-- Authenticated users can view all catalogs
CREATE POLICY "Authenticated users can view all catalogs"
    ON public.catalogs
    FOR SELECT
    TO authenticated
    USING (true);

-- Admins can insert catalogs
CREATE POLICY "Admins can insert catalogs"
    ON public.catalogs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update catalogs
CREATE POLICY "Admins can update catalogs"
    ON public.catalogs
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete catalogs
CREATE POLICY "Admins can delete catalogs"
    ON public.catalogs
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- -----------------------------------------------------
-- CONTACT SUBMISSIONS TABLE POLICIES
-- -----------------------------------------------------

-- Public users can insert contact submissions
CREATE POLICY "Public users can insert contact submissions"
    ON public.contact_submissions
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Admins can view all contact submissions
CREATE POLICY "Admins can view contact submissions"
    ON public.contact_submissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update contact submissions (for marking as read)
CREATE POLICY "Admins can update contact submissions"
    ON public.contact_submissions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete contact submissions
CREATE POLICY "Admins can delete contact submissions"
    ON public.contact_submissions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 7. STORAGE BUCKETS
-- =====================================================
-- Note: Storage buckets are typically created via Supabase Dashboard or CLI
-- This section documents the required bucket configuration
-- 
-- Required buckets:
-- 1. 'catalogs' - for PDF files (public read access)
-- 2. 'thumbnails' - for catalog thumbnail images (public read access)
--
-- To create these buckets, run the following SQL or use Supabase Dashboard:

-- Create catalogs bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'catalogs',
    'catalogs',
    true,
    10485760, -- 10MB limit
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create thumbnails bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'thumbnails',
    'thumbnails',
    true,
    2097152, -- 2MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. STORAGE POLICIES
-- =====================================================

-- Catalogs bucket policies
-- Public users can view/download PDFs
CREATE POLICY "Public users can view catalogs"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'catalogs');

-- Admins can upload PDFs
CREATE POLICY "Admins can upload catalogs"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'catalogs' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update PDFs
CREATE POLICY "Admins can update catalogs"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'catalogs' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete PDFs
CREATE POLICY "Admins can delete catalogs"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'catalogs' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Thumbnails bucket policies
-- Public users can view thumbnails
CREATE POLICY "Public users can view thumbnails"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'thumbnails');

-- Admins can upload thumbnails
CREATE POLICY "Admins can upload thumbnails"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'thumbnails' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update thumbnails
CREATE POLICY "Admins can update thumbnails"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'thumbnails' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete thumbnails
CREATE POLICY "Admins can delete thumbnails"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'thumbnails' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 9. HELPER FUNCTION: Create profile on user signup
-- =====================================================
-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 10. SEED DATA (Optional - for development)
-- =====================================================
-- Uncomment to add sample categories for testing

-- INSERT INTO public.categories (name_en, name_ar, slug) VALUES
--     ('Structural Steel', 'الفولاذ الإنشائي', 'structural-steel'),
--     ('Steel Fabrication', 'تصنيع الفولاذ', 'steel-fabrication'),
--     ('Industrial Solutions', 'الحلول الصناعية', 'industrial-solutions'),
--     ('Custom Projects', 'المشاريع المخصصة', 'custom-projects');

-- =====================================================
-- END OF MIGRATION
-- =====================================================
