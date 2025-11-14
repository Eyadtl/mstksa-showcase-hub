# Google OAuth Quick Reference

Quick reference guide for Google OAuth configuration and troubleshooting.

## Quick Setup (5 Minutes)

### 1. Google Cloud Console

```
1. Create project at console.cloud.google.com
2. Enable Google+ API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Copy Client ID and Client Secret
```

### 2. Supabase Dashboard

```
1. Go to Authentication > Providers
2. Enable Google provider
3. Paste Client ID and Client Secret
4. Copy callback URL: https://[project-id].supabase.co/auth/v1/callback
```

### 3. Add Redirect URI to Google

```
1. Back to Google Cloud Console
2. Add Supabase callback URL to "Authorized redirect URIs"
3. Save
```

### 4. Configure Supabase URLs

```
1. Authentication > URL Configuration
2. Set Site URL: http://localhost:5173 (dev) or https://yourdomain.com (prod)
3. Add redirect URLs:
   - http://localhost:5173/admin/dashboard
   - https://yourdomain.com/admin/dashboard
```

## Environment Variables

```bash
# .env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Code Implementation

### Sign In with Google

```typescript
// Already implemented in src/contexts/AuthContext.tsx
const { signInWithGoogle } = useAuth();

// Usage in component
const handleGoogleSignIn = async () => {
  try {
    await signInWithGoogle();
    // User will be redirected to Google OAuth
  } catch (error) {
    console.error('Google sign in failed:', error);
  }
};
```

### Check Authentication Status

```typescript
const { user, loading } = useAuth();

if (loading) return <div>Loading...</div>;
if (!user) return <div>Not authenticated</div>;

return <div>Welcome, {user.email}</div>;
```

### Sign Out

```typescript
const { signOut } = useAuth();

const handleSignOut = async () => {
  await signOut();
  // User will be signed out and redirected
};
```

## Common URLs

### Development
- Auth page: `http://localhost:5173/auth`
- Admin dashboard: `http://localhost:5173/admin/dashboard`
- Supabase callback: `http://localhost:54321/auth/v1/callback` (local Supabase)

### Production
- Auth page: `https://yourdomain.com/auth`
- Admin dashboard: `https://yourdomain.com/admin/dashboard`
- Supabase callback: `https://[project-id].supabase.co/auth/v1/callback`

## Quick Troubleshooting

### Error: "redirect_uri_mismatch"

**Fix**: Add exact Supabase callback URL to Google Cloud Console "Authorized redirect URIs"

### Error: "Access blocked"

**Fix**: 
1. Enable Google+ API in Google Cloud Console
2. Complete OAuth consent screen configuration

### User authenticated but profile not created

**Fix**: Check Supabase logs and RLS policies. The `ensureProfileExists` function should create profiles automatically.

### Session not persisting

**Fix**: 
1. Check browser cookies are enabled
2. Verify Supabase session configuration
3. Check auth state listener in AuthContext

### OAuth button not working

**Fix**:
1. Check browser console for errors
2. Verify Google provider is enabled in Supabase
3. Verify Client ID and Secret are correct

## Testing Checklist

Quick checklist for testing OAuth:

- [ ] Click "Sign in with Google" button
- [ ] Redirected to Google consent screen
- [ ] Grant permissions
- [ ] Redirected to /admin/dashboard
- [ ] User email shown in header
- [ ] Can access admin pages
- [ ] Session persists after refresh
- [ ] Can sign out successfully
- [ ] Check Supabase for user and profile records

## SQL Queries for Testing

### Check if user exists

```sql
SELECT * FROM auth.users WHERE email = 'test@gmail.com';
```

### Check if profile exists

```sql
SELECT * FROM profiles WHERE email = 'test@gmail.com';
```

### Make user an admin

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'test@gmail.com';
```

### Delete test user (careful!)

```sql
-- Delete profile first
DELETE FROM profiles WHERE email = 'test@gmail.com';

-- Then delete auth user (do this in Supabase Dashboard)
```

## Important Notes

1. **OAuth Redirect**: After clicking "Sign in with Google", user is redirected to Google. After authentication, they're redirected back to your app.

2. **Profile Creation**: Profiles are automatically created for OAuth users via the `ensureProfileExists` function in AuthContext.

3. **Default Role**: New OAuth users get "user" role by default. Manually update to "admin" if needed.

4. **Session Duration**: Supabase sessions last 1 hour by default. Refresh tokens are used to maintain longer sessions.

5. **Multiple Sign-In Methods**: Users can sign in with both email/password and Google OAuth if they use the same email.

## Support Resources

- [Full Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [Testing Guide](./GOOGLE_OAUTH_TESTING.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)

## Quick Commands

```bash
# Start development server
npm run dev

# Check TypeScript errors
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**Last Updated**: November 14, 2025
