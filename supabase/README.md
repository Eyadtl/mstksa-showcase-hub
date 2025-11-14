# Supabase Database Migrations

This directory contains SQL migrations for the MST-KSA website database schema.

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Supabase project created at https://app.supabase.com
- Environment variables configured in `.env` file

## Applying Migrations

### Option 1: Using Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/20240101000000_initial_schema.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

1. Link your local project to Supabase:
   ```bash
   supabase link --project-ref qrnebvvvdajzlxowpryh
   ```

2. Apply the migration:
   ```bash
   supabase db push
   ```

### Option 3: Using the MCP Supabase Tool

If you have the Supabase MCP server configured, you can apply the migration using:
```
Apply the migration from supabase/migrations/20240101000000_initial_schema.sql
```

## Migration Contents

The initial schema migration includes:

### Tables
- **profiles** - User profiles extending auth.users with role information
- **categories** - Bilingual catalog categories (English/Arabic)
- **catalogs** - Product catalog metadata with file references
- **contact_submissions** - Contact form submissions

### Security
- Row Level Security (RLS) policies for all tables
- Public read access to published catalogs and categories
- Admin-only access for data management
- Secure storage bucket policies

### Storage Buckets
- **catalogs** - PDF files (10MB limit, public read)
- **thumbnails** - Catalog images (2MB limit, public read)

### Triggers
- Automatic `updated_at` timestamp updates
- Automatic profile creation on user signup

## Verifying the Migration

After applying the migration, verify it was successful:

1. Check tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. Check RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. Check storage buckets:
   ```sql
   SELECT * FROM storage.buckets;
   ```

## Creating an Admin User

After the migration, you'll need to create at least one admin user:

1. Sign up a user through the application or Supabase dashboard
2. Update their role to admin:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin-email@example.com';
   ```

## Troubleshooting

### Error: relation "storage.buckets" does not exist
- Storage buckets may need to be created via the Supabase Dashboard
- Go to **Storage** → **Create new bucket**
- Create `catalogs` and `thumbnails` buckets with public access

### Error: permission denied for schema auth
- This is normal - the trigger on `auth.users` requires SECURITY DEFINER
- The migration handles this automatically

### RLS policies not working
- Ensure you're using the correct Supabase client configuration
- Check that the anon key is set correctly in `.env`
- Verify policies with: `SELECT * FROM pg_policies WHERE schemaname = 'public';`

## Google OAuth Configuration

To enable Google OAuth authentication:

1. **Quick Setup**: See [GOOGLE_OAUTH_QUICK_REFERENCE.md](./GOOGLE_OAUTH_QUICK_REFERENCE.md) for a 5-minute setup guide
2. **Detailed Guide**: See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for comprehensive configuration instructions
3. **Testing**: See [GOOGLE_OAUTH_TESTING.md](./GOOGLE_OAUTH_TESTING.md) for complete testing procedures

### Quick OAuth Setup

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google provider in Supabase Dashboard (Authentication > Providers)
3. Add Supabase callback URL to Google Cloud Console redirect URIs
4. Configure Site URL and redirect URLs in Supabase

For detailed instructions, see the documentation files listed above.

## Next Steps

After applying the migration:

1. Create an admin user (see above)
2. Configure Google OAuth (see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md))
3. Test authentication flow (email/password and Google OAuth)
4. Add sample categories via admin dashboard
5. Upload test catalogs
6. Verify RLS policies are working correctly
