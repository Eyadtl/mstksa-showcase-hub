# Comprehensive Error Handling Implementation

This document describes the comprehensive error handling system implemented across the application.

## Overview

The error handling system provides:
- **Centralized error handling** with consistent patterns
- **User-friendly error messages** for all error types
- **Detailed error logging** for debugging
- **Network error detection** with retry suggestions
- **Validation error handling** with field-specific messages
- **Authentication error handling** with clear guidance
- **File upload error handling** with specific feedback
- **Automatic retry logic** for transient errors

## Core Components

### 1. Error Handling Utility (`src/lib/error-handling.ts`)

The central error handling utility provides:

#### Error Classification
```typescript
enum ErrorType {
  NETWORK,        // Network/connectivity errors
  AUTHENTICATION, // Auth errors (login, session, etc.)
  VALIDATION,     // Form validation and input errors
  FILE_UPLOAD,    // File upload specific errors
  DATABASE,       // Database operation errors
  PERMISSION,     // Access/permission errors
  NOT_FOUND,      // Resource not found errors
  UNKNOWN         // Unclassified errors
}
```

#### Key Functions

**`handleError(error, context, options)`**
- Classifies the error type
- Generates user-friendly messages
- Logs detailed error information
- Optionally shows toast notifications
- Returns structured AppError object

**`withErrorHandling(fn, context, options)`**
- Wraps async functions with automatic error handling
- Catches and processes errors consistently
- Provides context for better error messages

**`retryOperation(fn, options)`**
- Automatically retries failed operations
- Uses exponential backoff
- Only retries transient errors (network, upload, etc.)
- Configurable retry attempts and delays

## Implementation by Component

### Authentication (`src/contexts/AuthContext.tsx`)

**Enhanced Error Handling:**
- Specific error messages for common auth failures
- Network error detection
- OAuth error handling with clear guidance
- Session expiration handling

**Examples:**
```typescript
// Sign in with specific error messages
if (error.message.includes('Invalid login credentials')) {
  throw new Error('Invalid email or password. Please check your credentials and try again.');
}

// OAuth errors with guidance
if (error.message.includes('popup_closed_by_user')) {
  throw new Error('Sign in was cancelled. Please try again and complete the Google sign-in process.');
}
```

### File Upload (`src/hooks/useFileUpload.ts`)

**Enhanced Error Handling:**
- File type validation with clear messages
- File size validation with actual size display
- Automatic retry with exponential backoff
- Cleanup of failed uploads
- Detailed error logging

**Examples:**
```typescript
// File size validation
if (file.size > MAX_PDF_SIZE) {
  throw {
    message: `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
    code: 'FILE_TOO_LARGE',
  };
}

// Automatic retry with cleanup
return await retryOperation(
  async () => {
    // Upload logic
  },
  {
    maxRetries: 3,
    onRetry: (attempt, error) => {
      console.warn(`Upload attempt ${attempt} failed, retrying...`, error);
    },
  }
);
```

### Catalog Management (`src/hooks/useCatalogMutations.ts`)

**Enhanced Error Handling:**
- Transaction-like behavior with cleanup
- Specific database error messages
- File cleanup on failure
- Detailed error context

**Examples:**
```typescript
// Create catalog with cleanup on failure
try {
  pdfResult = await uploadPDF(data.pdf_file);
} catch (error) {
  handleError(error, 'upload PDF file');
  throw error;
}

try {
  thumbnailResult = await uploadThumbnail(data.thumbnail_file);
} catch (error) {
  // Clean up PDF if thumbnail fails
  await deleteFile(STORAGE_BUCKETS.CATALOGS, pdfResult.path);
  handleError(error, 'upload thumbnail image');
  throw error;
}

// Database errors with specific messages
if (error.code === '23505') {
  throw new Error('A catalog with this title already exists. Please use a different title.');
}
```

### Category Management (`src/hooks/useCategoryMutations.ts`)

**Enhanced Error Handling:**
- Validation before deletion (check for associated catalogs)
- Specific database error messages
- Optimistic updates with rollback
- Clear error messages for constraint violations

**Examples:**
```typescript
// Check for associated catalogs before deletion
const { data: catalogs, error: catalogError } = await supabase
  .from('catalogs')
  .select('id')
  .eq('category_id', categoryId)
  .limit(1);

if (catalogs && catalogs.length > 0) {
  throw new Error('CATEGORY_HAS_CATALOGS');
}

// Specific error messages
if (error.code === '23505') {
  throw new Error('A category with this name or slug already exists. Please use a different name.');
}
```

### Contact Form (`src/components/ContactModal.tsx`)

**Enhanced Error Handling:**
- Database error handling
- Duplicate submission detection
- User-friendly error messages
- Detailed error logging

**Examples:**
```typescript
if (error.code === '23505') {
  toast.error(t("forms:contact.errorMessage") + " (Duplicate submission)");
} else {
  handleError(error, 'submit contact form');
}
```

## Error Message Patterns

### Network Errors
- **User Message:** "Unable to connect to the server. Please check your internet connection and try again."
- **Retryable:** Yes
- **Logging:** Warning level with network icon

### Authentication Errors
- **User Messages:**
  - "Invalid email or password. Please check your credentials and try again."
  - "Your session has expired. Please log in again."
  - "Please verify your email address before signing in."
- **Retryable:** No
- **Logging:** Warning level with lock icon

### Validation Errors
- **User Messages:**
  - "Invalid file type. Only PDF files are allowed."
  - "File size exceeds 10MB limit. Your file is 15.3MB."
  - "Please check your input and try again."
- **Retryable:** No
- **Logging:** Info level with hand icon

### File Upload Errors
- **User Message:** "Failed to upload file. Please try again."
- **Retryable:** Yes
- **Logging:** Error level with standard icon

### Database Errors
- **User Messages:**
  - "A catalog with this title already exists. Please use a different title." (23505)
  - "Cannot delete this item because it is being used elsewhere." (23503)
  - "Failed to save changes. Please try again."
- **Retryable:** Yes (for transient errors)
- **Logging:** Error level with standard icon

## Best Practices

### 1. Always Provide Context
```typescript
// Good
handleError(error, 'upload PDF file');

// Bad
handleError(error);
```

### 2. Use Specific Error Messages
```typescript
// Good
if (error.code === '23505') {
  throw new Error('A catalog with this title already exists. Please use a different title.');
}

// Bad
throw error;
```

### 3. Clean Up on Failure
```typescript
try {
  const result = await uploadFile();
  await saveToDatabase(result);
} catch (error) {
  // Clean up uploaded file
  await deleteFile(result.path);
  throw error;
}
```

### 4. Don't Show Multiple Toasts
```typescript
// In mutation hooks, handle errors in mutationFn
// and only show generic toast in onError if not already handled
onError: (error: any) => {
  if (!error.userMessage) {
    toast.error(t('admin:catalogs.createError'));
  }
}
```

### 5. Log Errors Appropriately
```typescript
// Use handleError for user-facing errors
handleError(error, 'save catalog');

// Use handleError with showToast: false for background errors
handleError(error, 'clean up files', { showToast: false });
```

## Testing Error Handling

### Network Errors
1. Disconnect from internet
2. Try to perform any operation
3. Should see: "Unable to connect to the server. Please check your internet connection and try again."

### Authentication Errors
1. Try to sign in with wrong credentials
2. Should see: "Invalid email or password. Please check your credentials and try again."

### Validation Errors
1. Try to upload a file larger than 10MB
2. Should see: "File size exceeds 10MB limit. Your file is X.XMB."

### File Upload Errors
1. Simulate upload failure (network interruption)
2. Should automatically retry 3 times
3. Should clean up partial uploads on failure

### Database Errors
1. Try to create duplicate category
2. Should see: "A category with this name or slug already exists. Please use a different name."

## Future Enhancements

1. **Error Reporting Service**
   - Integrate with Sentry or similar service
   - Send error reports to backend
   - Track error frequency and patterns

2. **User Feedback**
   - Add "Report Problem" button on errors
   - Collect user feedback on error messages
   - Improve messages based on feedback

3. **Offline Support**
   - Queue operations when offline
   - Retry when connection restored
   - Show offline indicator

4. **Error Recovery**
   - Automatic session refresh
   - Resume interrupted uploads
   - Recover from partial failures

## Troubleshooting

### Error Not Being Caught
- Check if the error is thrown correctly
- Verify error handling wrapper is applied
- Check console for error logs

### Wrong Error Message
- Check error classification logic
- Verify error code/message patterns
- Update getUserFriendlyMessage function

### Retry Not Working
- Check if error type is retryable
- Verify network connectivity
- Check retry configuration

### Toast Not Showing
- Check if showToast option is true
- Verify toast provider is configured
- Check browser console for errors
