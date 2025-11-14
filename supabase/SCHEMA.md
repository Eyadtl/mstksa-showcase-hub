# Database Schema Reference

This document provides a quick reference for the MST-KSA website database schema.

## Tables

### 1. profiles
Extends `auth.users` with additional profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users(id) |
| email | TEXT | User email address |
| role | TEXT | User role: 'user' or 'admin' (default: 'user') |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_profiles_email` on email
- `idx_profiles_role` on role

**RLS Policies:**
- Users can view/update their own profile
- Admins have full access to all profiles

---

### 2. categories
Stores catalog categories with bilingual names.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name_en | TEXT | Category name in English |
| name_ar | TEXT | Category name in Arabic |
| slug | TEXT | URL-friendly identifier (unique) |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_categories_slug` on slug

**RLS Policies:**
- Public users can view all categories
- Authenticated users can view all categories
- Admins can insert/update/delete categories

---

### 3. catalogs
Stores catalog metadata with references to files in storage.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title_en | TEXT | Catalog title in English |
| title_ar | TEXT | Catalog title in Arabic |
| category_id | UUID | Foreign key to categories(id) |
| pdf_url | TEXT | URL to PDF file in storage |
| thumbnail_url | TEXT | URL to thumbnail image in storage |
| file_size | BIGINT | PDF file size in bytes |
| published | BOOLEAN | Publication status (default: true) |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_catalogs_category_id` on category_id
- `idx_catalogs_published` on published

**Foreign Keys:**
- `category_id` references `categories(id)` ON DELETE RESTRICT

**RLS Policies:**
- Public users can view published catalogs
- Authenticated users can view all catalogs
- Admins can insert/update/delete catalogs

---

### 4. contact_submissions
Stores contact form submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Submitter name |
| email | TEXT | Submitter email |
| phone | TEXT | Submitter phone (nullable) |
| subject | TEXT | Message subject |
| message | TEXT | Message content |
| status | TEXT | Status: 'new', 'read', or 'responded' (default: 'new') |
| created_at | TIMESTAMPTZ | Submission timestamp |
| read_at | TIMESTAMPTZ | When marked as read (nullable) |

**Indexes:**
- `idx_contact_submissions_status` on status
- `idx_contact_submissions_created_at` on created_at (DESC)
- `idx_contact_submissions_email` on email

**RLS Policies:**
- Public users can insert submissions
- Admins can view/update/delete submissions

---

## Storage Buckets

### 1. catalogs
Stores PDF catalog files.

- **Public Access:** Yes
- **File Size Limit:** 10MB (10,485,760 bytes)
- **Allowed MIME Types:** application/pdf

**Storage Policies:**
- Public users can view/download PDFs
- Admins can upload/update/delete PDFs

---

### 2. thumbnails
Stores catalog thumbnail images.

- **Public Access:** Yes
- **File Size Limit:** 2MB (2,097,152 bytes)
- **Allowed MIME Types:** image/png, image/jpeg, image/jpg, image/webp

**Storage Policies:**
- Public users can view thumbnails
- Admins can upload/update/delete thumbnails

---

## Triggers

### 1. Updated At Triggers
Automatically updates the `updated_at` timestamp on UPDATE operations.

- `set_updated_at_profiles` on profiles table
- `set_updated_at_categories` on categories table
- `set_updated_at_catalogs` on catalogs table

### 2. User Profile Creation Trigger
Automatically creates a profile record when a new user signs up.

- `on_auth_user_created` on auth.users table
- Executes `handle_new_user()` function
- Creates profile with role='user' by default

---

## Security Model

### Row Level Security (RLS)
All tables have RLS enabled with the following access patterns:

**Public Users (Unauthenticated):**
- Can view published catalogs
- Can view all categories
- Can insert contact submissions

**Authenticated Users:**
- Can view their own profile
- Can update their own profile
- Can view all catalogs (including unpublished)
- Can view all categories

**Admin Users:**
- Full CRUD access to all tables
- Can manage catalogs, categories, and contact submissions
- Can view and manage all user profiles
- Can upload/delete files in storage buckets

### Admin Role Check
Admin privileges are determined by checking:
```sql
EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
)
```

---

## Common Queries

### Get all published catalogs with category info
```sql
SELECT 
    c.*,
    cat.name_en as category_name_en,
    cat.name_ar as category_name_ar,
    cat.slug as category_slug
FROM public.catalogs c
JOIN public.categories cat ON c.category_id = cat.id
WHERE c.published = true
ORDER BY c.created_at DESC;
```

### Get contact submissions (admin only)
```sql
SELECT *
FROM public.contact_submissions
ORDER BY created_at DESC;
```

### Check if user is admin
```sql
SELECT role
FROM public.profiles
WHERE id = auth.uid();
```

### Get categories with catalog count
```sql
SELECT 
    cat.*,
    COUNT(c.id) as catalog_count
FROM public.categories cat
LEFT JOIN public.catalogs c ON cat.id = c.category_id
GROUP BY cat.id
ORDER BY cat.name_en;
```

---

## Migration Status

✅ Initial schema migration applied successfully
✅ All tables created with proper constraints
✅ RLS policies configured
✅ Storage buckets created
✅ Storage policies configured
✅ Triggers configured
✅ Indexes created

**Migration File:** `supabase/migrations/20240101000000_initial_schema.sql`
**Applied On:** [Timestamp from Supabase]
