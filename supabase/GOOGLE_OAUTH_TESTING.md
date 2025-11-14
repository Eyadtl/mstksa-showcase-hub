# Google OAuth Testing Guide

This document provides comprehensive testing procedures for the Google OAuth integration in the Mst-ksa website.

## Test Environment Setup

### Prerequisites

Before testing, ensure:

1. ✅ Google OAuth is configured in Google Cloud Console
2. ✅ Google provider is enabled in Supabase
3. ✅ Redirect URLs are properly configured
4. ✅ Development server is running (`npm run dev`)
5. ✅ `.env` file contains correct Supabase credentials

### Test User Accounts

Prepare test accounts:

1. **Primary Test Account**: Your personal Google account
2. **Secondary Test Account**: Another Google account for multi-user testing
3. **Admin Test Account**: Account that will be granted admin role

## Test Scenarios

### Test 1: Successful Google Sign-In (New User)

**Objective**: Verify that a new user can sign in with Google and their profile is created.

**Steps**:

1. Navigate to `http://localhost:5173/auth`
2. Click the "Sign in with Google" button
3. Select a Google account that has never signed in before
4. Grant the requested permissions
5. Wait for redirect

**Expected Results**:

- ✅ Redirected to Google OAuth consent screen
- ✅ Consent screen shows correct app name and permissions
- ✅ After granting permissions, redirected to `/admin/dashboard`
- ✅ User email displayed in dashboard header
- ✅ No error messages displayed
- ✅ User can navigate to other admin pages

**Verification in Supabase**:

1. Go to Supabase Dashboard > Authentication > Users
2. Verify new user exists with:
   - Email from Google account
   - Provider: "google"
   - Last sign in timestamp is recent

3. Go to Table Editor > profiles
4. Verify profile record exists with:
   - `id` matches auth user ID
   - `email` matches Google account email
   - `role` is "user"
   - `created_at` timestamp is recent

**Pass Criteria**: All expected results and verifications are met.

---

### Test 2: Successful Google Sign-In (Returning User)

**Objective**: Verify that an existing user can sign in with Google.

**Steps**:

1. Sign out if currently logged in
2. Navigate to `http://localhost:5173/auth`
3. Click "Sign in with Google"
4. Select the same Google account used in Test 1
5. Wait for redirect (may not show consent screen again)

**Expected Results**:

- ✅ Redirected to `/admin/dashboard` (may skip consent screen)
- ✅ User email displayed in dashboard header
- ✅ Session is maintained (refresh page and still logged in)
- ✅ No duplicate user records created

**Verification in Supabase**:

1. Check Authentication > Users
2. Verify only ONE user record exists for this email
3. Verify "Last sign in" timestamp is updated

**Pass Criteria**: User can sign in without issues, no duplicates created.

---

### Test 3: Google Sign-Up (New User via Sign Up Tab)

**Objective**: Verify Google OAuth works from the Sign Up tab.

**Steps**:

1. Navigate to `http://localhost:5173/auth`
2. Click the "Sign Up" tab
3. Click "Sign up with Google"
4. Use a different Google account than Test 1
5. Grant permissions

**Expected Results**:

- ✅ Same OAuth flow as sign-in
- ✅ Redirected to `/admin/dashboard`
- ✅ Profile created with default "user" role
- ✅ User can access admin features

**Pass Criteria**: Sign up via Google works identically to sign in.

---

### Test 4: OAuth Flow Cancellation

**Objective**: Verify proper error handling when user cancels OAuth.

**Steps**:

1. Navigate to `http://localhost:5173/auth`
2. Click "Sign in with Google"
3. On the Google consent screen, click "Cancel" or close the window
4. Observe the behavior

**Expected Results**:

- ✅ User returned to `/auth` page
- ✅ Error toast displayed with message: "Sign in was cancelled. Please try again."
- ✅ No error logged in browser console (or only expected OAuth cancellation)
- ✅ User can try again without issues

**Pass Criteria**: Cancellation is handled gracefully with clear feedback.

---

### Test 5: Permission Denial

**Objective**: Verify error handling when user denies permissions.

**Steps**:

1. Navigate to `http://localhost:5173/auth`
2. Click "Sign in with Google"
3. On the consent screen, click "Deny" or deselect required permissions
4. Observe the behavior

**Expected Results**:

- ✅ Error toast displayed: "Access was denied. Please grant the required permissions."
- ✅ User remains on `/auth` page
- ✅ User can retry authentication

**Pass Criteria**: Permission denial is handled with appropriate error message.

---

### Test 6: Network Error During OAuth

**Objective**: Verify error handling for network issues.

**Steps**:

1. Open browser DevTools > Network tab
2. Set network throttling to "Offline"
3. Navigate to `http://localhost:5173/auth`
4. Click "Sign in with Google"
5. Observe the behavior
6. Re-enable network

**Expected Results**:

- ✅ Error message displayed indicating connection issue
- ✅ User can retry after network is restored
- ✅ No application crash

**Pass Criteria**: Network errors are handled gracefully.

---

### Test 7: Session Persistence

**Objective**: Verify that OAuth sessions persist across page refreshes.

**Steps**:

1. Sign in with Google successfully
2. Navigate to `/admin/dashboard`
3. Refresh the page (F5)
4. Close the browser tab
5. Open a new tab and navigate to `http://localhost:5173/admin/dashboard`

**Expected Results**:

- ✅ After refresh, user remains logged in
- ✅ After reopening, user remains logged in (within session timeout)
- ✅ User email still displayed in header
- ✅ No redirect to `/auth` page

**Pass Criteria**: Session persists correctly.

---

### Test 8: Admin Role Verification

**Objective**: Verify that admin role grants proper access.

**Steps**:

1. Sign in with Google
2. In Supabase, update the user's role to "admin":
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-test-email@gmail.com';
   ```
3. Sign out and sign in again with Google
4. Navigate to admin pages

**Expected Results**:

- ✅ User can access all admin pages
- ✅ Admin features are available
- ✅ Role is correctly reflected in the application

**Pass Criteria**: Admin role works correctly with OAuth users.

---

### Test 9: Multiple Browser Testing

**Objective**: Verify OAuth works across different browsers.

**Browsers to Test**:
- Chrome
- Firefox
- Safari (if on macOS)
- Edge

**Steps** (for each browser):

1. Open browser
2. Navigate to `http://localhost:5173/auth`
3. Click "Sign in with Google"
4. Complete OAuth flow
5. Verify successful authentication

**Expected Results**:

- ✅ OAuth works in all tested browsers
- ✅ No browser-specific errors
- ✅ Consistent user experience

**Pass Criteria**: OAuth works in all major browsers.

---

### Test 10: Concurrent Sessions

**Objective**: Verify behavior with multiple simultaneous sessions.

**Steps**:

1. Sign in with Google in Browser 1
2. Open Browser 2 (or incognito window)
3. Sign in with the same Google account in Browser 2
4. Perform actions in both browsers
5. Sign out in Browser 1
6. Check Browser 2

**Expected Results**:

- ✅ Both sessions work independently
- ✅ Signing out in one browser doesn't affect the other
- ✅ No session conflicts

**Pass Criteria**: Multiple sessions are handled correctly.

---

### Test 11: OAuth with Existing Email/Password Account

**Objective**: Verify behavior when Google email matches existing account.

**Steps**:

1. Create an account with email/password using email: `test@gmail.com`
2. Sign out
3. Try to sign in with Google using the same email: `test@gmail.com`
4. Observe the behavior

**Expected Results**:

- ✅ Supabase links the accounts (default behavior)
- ✅ User can sign in with either method
- ✅ Profile data is preserved

**Note**: Supabase automatically links accounts with the same email by default.

**Pass Criteria**: Account linking works as expected.

---

### Test 12: Sign Out After Google Sign-In

**Objective**: Verify sign out works correctly for OAuth users.

**Steps**:

1. Sign in with Google
2. Navigate to `/admin/dashboard`
3. Click the "Logout" button in the header
4. Observe the behavior

**Expected Results**:

- ✅ User is signed out
- ✅ Redirected to home page (`/`)
- ✅ Attempting to access `/admin/dashboard` redirects to `/auth`
- ✅ User email no longer displayed in header
- ✅ Session is completely cleared

**Pass Criteria**: Sign out works correctly for OAuth users.

---

### Test 13: Protected Route Access

**Objective**: Verify protected routes work correctly with OAuth.

**Steps**:

1. Without signing in, try to access:
   - `http://localhost:5173/admin/dashboard`
   - `http://localhost:5173/admin/catalogs`
   - `http://localhost:5173/admin/categories`
   - `http://localhost:5173/admin/contact-submissions`

2. Sign in with Google

3. Try accessing the same routes again

**Expected Results**:

**Before Sign In**:
- ✅ All admin routes redirect to `/auth`
- ✅ No admin content is visible

**After Sign In**:
- ✅ All admin routes are accessible
- ✅ Content loads correctly
- ✅ No unauthorized access errors

**Pass Criteria**: Protected routes work correctly with OAuth authentication.

---

### Test 14: OAuth Error Messages

**Objective**: Verify all error messages are user-friendly and helpful.

**Test Cases**:

| Scenario | Expected Error Message |
|----------|----------------------|
| User cancels OAuth | "Sign in was cancelled. Please try again." |
| User denies permissions | "Access was denied. Please grant the required permissions." |
| Network error | "Failed to sign in with Google" or network-related message |
| Invalid configuration | "Failed to sign in with Google" |
| Session expired | Redirect to `/auth` with no error (silent) |

**Steps**:

1. Trigger each error scenario
2. Verify the error message matches expectations
3. Verify error messages are displayed in toast notifications
4. Verify error messages are clear and actionable

**Pass Criteria**: All error messages are appropriate and helpful.

---

### Test 15: Loading States

**Objective**: Verify loading indicators work correctly during OAuth.

**Steps**:

1. Navigate to `/auth`
2. Click "Sign in with Google"
3. Observe the button state
4. Complete OAuth flow
5. Observe loading state during redirect

**Expected Results**:

- ✅ Button shows loading spinner and "Connecting..." text
- ✅ Button is disabled during OAuth process
- ✅ Loading state is cleared after redirect
- ✅ No stuck loading states

**Pass Criteria**: Loading states provide clear feedback.

---

## Production Testing

### Pre-Production Checklist

Before testing in production:

- [ ] Production URLs added to Google Cloud Console
- [ ] Production redirect URLs added to Supabase
- [ ] Site URL updated in Supabase for production domain
- [ ] OAuth consent screen published (not in testing mode)
- [ ] SSL certificate valid for production domain
- [ ] Environment variables set correctly in production

### Production Test Scenarios

Repeat the following tests in production:

1. ✅ Test 1: Successful Google Sign-In (New User)
2. ✅ Test 2: Successful Google Sign-In (Returning User)
3. ✅ Test 7: Session Persistence
4. ✅ Test 9: Multiple Browser Testing
5. ✅ Test 12: Sign Out After Google Sign-In
6. ✅ Test 13: Protected Route Access

### Production-Specific Tests

**Test P1: HTTPS Verification**

- Verify OAuth works over HTTPS
- Check for mixed content warnings
- Verify SSL certificate is valid

**Test P2: Domain Verification**

- Verify OAuth works with production domain
- Check redirect URLs work correctly
- Verify no CORS errors

**Test P3: Performance**

- Measure OAuth flow completion time
- Verify no significant delays
- Check for any performance bottlenecks

---

## Automated Testing Considerations

While this task focuses on manual testing, consider these automated test scenarios for future implementation:

### Unit Tests

```typescript
// Example test cases
describe('AuthContext - Google OAuth', () => {
  it('should call signInWithOAuth with correct parameters', async () => {
    // Test implementation
  });

  it('should handle OAuth errors correctly', async () => {
    // Test implementation
  });

  it('should create profile for new OAuth users', async () => {
    // Test implementation
  });
});
```

### Integration Tests

- Test complete OAuth flow with mock Supabase
- Test profile creation for OAuth users
- Test session persistence
- Test error handling

---

## Test Results Template

Use this template to document test results:

```markdown
## Test Execution Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Development/Production]
**Browser**: [Browser Name and Version]

### Test Results

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Successful Google Sign-In (New User) | ✅ Pass | |
| 2 | Successful Google Sign-In (Returning User) | ✅ Pass | |
| 3 | Google Sign-Up | ✅ Pass | |
| 4 | OAuth Flow Cancellation | ✅ Pass | |
| 5 | Permission Denial | ✅ Pass | |
| 6 | Network Error During OAuth | ✅ Pass | |
| 7 | Session Persistence | ✅ Pass | |
| 8 | Admin Role Verification | ✅ Pass | |
| 9 | Multiple Browser Testing | ✅ Pass | |
| 10 | Concurrent Sessions | ✅ Pass | |
| 11 | OAuth with Existing Account | ✅ Pass | |
| 12 | Sign Out After Google Sign-In | ✅ Pass | |
| 13 | Protected Route Access | ✅ Pass | |
| 14 | OAuth Error Messages | ✅ Pass | |
| 15 | Loading States | ✅ Pass | |

### Issues Found

[List any issues discovered during testing]

### Recommendations

[List any recommendations for improvements]
```

---

## Troubleshooting During Testing

### Issue: OAuth redirect doesn't work

**Check**:
1. Verify redirect URL in Google Cloud Console
2. Check Supabase redirect URL configuration
3. Look for CORS errors in browser console
4. Verify Site URL in Supabase settings

### Issue: Profile not created

**Check**:
1. Check Supabase logs for errors
2. Verify RLS policies allow INSERT on profiles table
3. Check `ensureProfileExists` function is being called
4. Verify auth state change listener is working

### Issue: Session not persisting

**Check**:
1. Check browser cookies are enabled
2. Verify Supabase session configuration
3. Check for errors in browser console
4. Verify auth state listener is set up correctly

---

**Last Updated**: November 14, 2025
**Version**: 1.0
