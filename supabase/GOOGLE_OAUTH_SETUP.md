# Google OAuth Configuration Guide for Supabase

This guide provides step-by-step instructions for configuring Google OAuth authentication in your Supabase project for the Mst-ksa website.

## Prerequisites

- A Supabase project (already created)
- A Google Cloud Platform account
- Admin access to your Supabase project dashboard

## Part 1: Configure Google Cloud Console

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter project name: "Mst-ksa Website" (or your preferred name)
5. Click "Create"

### Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on "Google+ API"
4. Click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Mst-ksa Website
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your company logo
   - **Application home page**: Your production URL (e.g., https://mst-ksa.com)
   - **Authorized domains**: Add your domain (e.g., mst-ksa.com)
   - **Developer contact information**: Your email address
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add the following scopes:
   - `userinfo.email`
   - `userinfo.profile`
8. Click "Update" then "Save and Continue"
9. On the "Test users" page (if in testing mode), add test user emails
10. Click "Save and Continue"
11. Review and click "Back to Dashboard"

### Step 4: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name: "Mst-ksa Website OAuth Client"
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:5173` (for local development)
   - Your production URL (e.g., `https://mst-ksa.com`)
6. Under "Authorized redirect URIs", add (we'll update these in the next section):
   - Leave empty for now - we'll get the exact URLs from Supabase
7. Click "Create"
8. **IMPORTANT**: Copy the "Client ID" and "Client Secret" - you'll need these for Supabase

## Part 2: Configure Supabase

### Step 5: Get Supabase OAuth Redirect URLs

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to "Authentication" > "Providers"
4. Scroll down to find "Google" provider
5. You'll see the "Callback URL (for OAuth)" - it will look like:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
6. **Copy this URL** - you'll need it for Google Cloud Console

### Step 6: Add Redirect URI to Google Cloud Console

1. Go back to Google Cloud Console
2. Navigate to "APIs & Services" > "Credentials"
3. Click on your OAuth 2.0 Client ID (created in Step 4)
4. Under "Authorized redirect URIs", click "Add URI"
5. Paste the Supabase callback URL you copied in Step 5
6. For local development, also add:
   ```
   http://localhost:54321/auth/v1/callback
   ```
   (This is for local Supabase development if you're using it)
7. Click "Save"

### Step 7: Enable Google Provider in Supabase

1. In your Supabase Dashboard, navigate to "Authentication" > "Providers"
2. Find "Google" in the list of providers
3. Toggle "Enable Sign in with Google" to ON
4. Enter the credentials from Google Cloud Console:
   - **Client ID**: Paste the Client ID from Step 4
   - **Client Secret**: Paste the Client Secret from Step 4
5. Under "Redirect URLs", verify the callback URL is correct
6. Click "Save"

### Step 8: Configure Site URL and Redirect URLs

1. In Supabase Dashboard, navigate to "Authentication" > "URL Configuration"
2. Set the **Site URL** to your production URL:
   - Production: `https://mst-ksa.com` (or your actual domain)
   - Development: `http://localhost:5173`
3. Under **Redirect URLs**, add the following allowed redirect URLs:
   - `http://localhost:5173/admin/dashboard` (development)
   - `https://mst-ksa.com/admin/dashboard` (production)
   - `http://localhost:5173/**` (wildcard for development)
   - `https://mst-ksa.com/**` (wildcard for production)
4. Click "Save"

## Part 3: Test the Integration

### Step 9: Test Google Sign-In Flow (Development)

1. Start your local development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/auth`

3. Click the "Sign in with Google" button

4. You should be redirected to Google's OAuth consent screen

5. Select your Google account and grant permissions

6. After successful authentication, you should be redirected to `/admin/dashboard`

7. Verify that:
   - You are logged in (check the header for your email)
   - Your user session is maintained (refresh the page)
   - You can access admin features

### Step 10: Verify User Record Creation

1. In Supabase Dashboard, navigate to "Authentication" > "Users"

2. You should see a new user record with:
   - Email from your Google account
   - Provider: "google"
   - Created timestamp

3. Navigate to "Table Editor" > "profiles"

4. Verify that a profile record was created with:
   - `id` matching the auth user ID
   - `email` from your Google account
   - `role` set to "user" (default)

5. If you need admin access, manually update the role:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

### Step 11: Test Error Handling

Test various error scenarios to ensure proper error handling:

1. **Cancel OAuth Flow**:
   - Click "Sign in with Google"
   - On the Google consent screen, click "Cancel"
   - Verify: Error toast appears with message "Failed to sign in with Google"

2. **Network Error**:
   - Disconnect from internet
   - Click "Sign in with Google"
   - Verify: Appropriate error message is displayed

3. **Invalid Configuration**:
   - Temporarily disable Google provider in Supabase
   - Try to sign in with Google
   - Verify: Error message indicates authentication failed

## Part 4: Production Deployment

### Step 12: Update Production URLs

Before deploying to production:

1. **Update Google Cloud Console**:
   - Add production domain to "Authorized JavaScript origins"
   - Add production callback URL to "Authorized redirect URIs"

2. **Update Supabase**:
   - Set Site URL to production domain
   - Add production redirect URLs

3. **Update OAuth Consent Screen**:
   - If still in "Testing" mode, publish the app:
     - Go to "OAuth consent screen"
     - Click "Publish App"
     - Confirm publication

### Step 13: Test Production Environment

1. Deploy your application to production

2. Navigate to your production auth page (e.g., `https://mst-ksa.com/auth`)

3. Test the complete Google OAuth flow:
   - Click "Sign in with Google"
   - Complete authentication
   - Verify redirect to admin dashboard
   - Verify session persistence

4. Test on multiple browsers:
   - Chrome
   - Firefox
   - Safari
   - Edge

## Troubleshooting

### Common Issues and Solutions

#### Issue: "redirect_uri_mismatch" Error

**Solution**: 
- Verify the redirect URI in Google Cloud Console exactly matches the Supabase callback URL
- Check for trailing slashes or typos
- Ensure the URI is added to "Authorized redirect URIs" not "Authorized JavaScript origins"

#### Issue: "Access blocked: This app's request is invalid"

**Solution**:
- Verify Google+ API is enabled in Google Cloud Console
- Check that OAuth consent screen is properly configured
- Ensure all required scopes are added

#### Issue: User is authenticated but not redirected

**Solution**:
- Check that redirect URL is added to Supabase "Redirect URLs" whitelist
- Verify the `redirectTo` option in `signInWithGoogle()` function
- Check browser console for JavaScript errors

#### Issue: Profile not created after Google sign-in

**Solution**:
- Check Supabase logs for errors
- Verify RLS policies allow profile creation
- Check that the auth state change listener is working properly

#### Issue: "Invalid client" error

**Solution**:
- Verify Client ID and Client Secret are correctly entered in Supabase
- Check for extra spaces or characters when copying credentials
- Regenerate credentials in Google Cloud Console if needed

## Security Best Practices

1. **Never commit credentials**: Keep Client ID and Client Secret secure
2. **Use environment variables**: Store sensitive data in `.env` files
3. **Restrict redirect URIs**: Only whitelist necessary URLs
4. **Enable email verification**: Consider requiring email verification for new users
5. **Monitor auth logs**: Regularly check Supabase auth logs for suspicious activity
6. **Rotate credentials**: Periodically rotate OAuth credentials
7. **Use HTTPS**: Always use HTTPS in production
8. **Implement rate limiting**: Protect against brute force attacks

## Additional Configuration

### Optional: Customize OAuth Consent Screen

You can enhance the user experience by customizing the OAuth consent screen:

1. Add your company logo (recommended size: 120x120 pixels)
2. Add a privacy policy URL
3. Add terms of service URL
4. Customize the app description

### Optional: Request Additional Scopes

If you need more user information, you can request additional scopes:

```typescript
const signInWithGoogle = async (): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/admin/dashboard`,
      scopes: 'email profile', // Add more scopes as needed
    },
  });
  // ... error handling
};
```

## Verification Checklist

Use this checklist to ensure everything is configured correctly:

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Client ID and Client Secret copied
- [ ] Supabase callback URL obtained
- [ ] Redirect URI added to Google Cloud Console
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Client Secret added to Supabase
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs whitelisted in Supabase
- [ ] Development environment tested
- [ ] User record creation verified
- [ ] Profile record creation verified
- [ ] Error handling tested
- [ ] Production URLs configured
- [ ] Production environment tested
- [ ] Cross-browser testing completed

## Support and Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Maintenance

### Regular Tasks

1. **Monitor OAuth usage**: Check Google Cloud Console for usage statistics
2. **Review auth logs**: Regularly check Supabase auth logs
3. **Update credentials**: Rotate credentials periodically for security
4. **Test authentication**: Periodically test the OAuth flow to ensure it's working
5. **Update consent screen**: Keep app information up to date

---

**Last Updated**: November 14, 2025
**Version**: 1.0
**Maintained by**: Development Team
