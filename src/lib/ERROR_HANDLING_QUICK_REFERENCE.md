# Error Handling Quick Reference

## Quick Start

### Import the Error Handler
```typescript
import { handleError, withErrorHandling, retryOperation } from '@/lib/error-handling';
```

## Common Patterns

### 1. Basic Error Handling
```typescript
try {
  await someAsyncOperation();
} catch (error) {
  handleError(error, 'operation description');
  throw error; // Re-throw if needed
}
```

### 2. Wrap Async Function
```typescript
const myFunction = withErrorHandling(
  async (param1, param2) => {
    // Your async code here
  },
  'operation description',
  { showToast: true } // Optional
);
```

### 3. Automatic Retry
```typescript
const result = await retryOperation(
  async () => {
    return await someUnreliableOperation();
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}`);
    }
  }
);
```

### 4. Silent Error Logging
```typescript
try {
  await cleanupOperation();
} catch (error) {
  handleError(error, 'cleanup', { showToast: false });
}
```

### 5. Custom Error Message
```typescript
try {
  await operation();
} catch (error) {
  handleError(error, 'operation', {
    customMessage: 'Custom user-friendly message'
  });
}
```

## Error Types

| Type | When to Use | Retryable |
|------|-------------|-----------|
| `NETWORK` | Connection failures | ✅ Yes |
| `AUTHENTICATION` | Login, session errors | ❌ No |
| `VALIDATION` | Form validation, file validation | ❌ No |
| `FILE_UPLOAD` | Upload failures | ✅ Yes |
| `DATABASE` | Database operations | ✅ Yes (transient) |
| `PERMISSION` | Access denied | ❌ No |
| `NOT_FOUND` | Resource not found | ❌ No |
| `UNKNOWN` | Unclassified errors | ✅ Yes |

## Specific Error Messages

### Database Errors
```typescript
if (error.code === '23505') {
  throw new Error('Item already exists. Please use a different name.');
}
if (error.code === '23503') {
  throw new Error('Cannot delete because it is being used elsewhere.');
}
if (error.code === 'PGRST116') {
  throw new Error('Item not found. It may have been deleted.');
}
```

### File Upload Errors
```typescript
// File type validation
if (file.type !== 'application/pdf') {
  throw {
    message: 'Invalid file type. Only PDF files are allowed.',
    code: 'INVALID_FILE_TYPE',
  };
}

// File size validation
if (file.size > MAX_SIZE) {
  throw {
    message: `File size exceeds limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
    code: 'FILE_TOO_LARGE',
  };
}
```

### Authentication Errors
```typescript
if (error.message.includes('Invalid login credentials')) {
  throw new Error('Invalid email or password. Please check your credentials and try again.');
}
if (error.message.includes('Email not confirmed')) {
  throw new Error('Please verify your email address before signing in.');
}
```

## Transaction Pattern

### File Upload + Database Save
```typescript
let uploadedFile;

try {
  // Step 1: Upload file
  uploadedFile = await uploadFile(file);
  
  // Step 2: Save to database
  await saveToDatabase(uploadedFile);
} catch (error) {
  // Cleanup on failure
  if (uploadedFile) {
    try {
      await deleteFile(uploadedFile.path);
    } catch (cleanupError) {
      handleError(cleanupError, 'cleanup', { showToast: false });
    }
  }
  handleError(error, 'save item');
  throw error;
}
```

## Mutation Hook Pattern

```typescript
const myMutation = useMutation({
  mutationFn: async (data) => {
    try {
      // Your operation here
      const result = await operation(data);
      return result;
    } catch (error) {
      handleError(error, 'operation description');
      throw error;
    }
  },
  onSuccess: () => {
    toast.success('Operation successful');
  },
  onError: (error: any) => {
    // Error already handled in mutationFn
    // Only show generic message if not already handled
    if (!error.userMessage) {
      toast.error('Operation failed');
    }
  },
});
```

## Don'ts

❌ **Don't** show multiple toasts for the same error
```typescript
// Bad
handleError(error, 'operation'); // Shows toast
toast.error('Operation failed'); // Shows another toast
```

❌ **Don't** lose error context
```typescript
// Bad
handleError(error);

// Good
handleError(error, 'upload PDF file');
```

❌ **Don't** ignore cleanup errors
```typescript
// Bad
try {
  await deleteFile(path);
} catch (error) {
  // Silently ignored
}

// Good
try {
  await deleteFile(path);
} catch (error) {
  handleError(error, 'cleanup file', { showToast: false });
}
```

❌ **Don't** retry non-retryable errors
```typescript
// Bad - validation errors shouldn't be retried
await retryOperation(() => validateForm());

// Good - only retry transient errors
await retryOperation(() => uploadFile());
```

## Cheat Sheet

| Scenario | Pattern |
|----------|---------|
| Simple async operation | `try/catch` + `handleError()` |
| Reusable async function | `withErrorHandling()` |
| Unreliable operation | `retryOperation()` |
| Background cleanup | `handleError(..., { showToast: false })` |
| File upload + DB save | Transaction pattern with cleanup |
| Mutation hook | Handle in `mutationFn`, check in `onError` |
| Validation error | Throw specific error, don't retry |
| Network error | Let retry logic handle it |

## Testing Checklist

- [ ] Network failure (disconnect internet)
- [ ] Invalid credentials
- [ ] File too large
- [ ] Wrong file type
- [ ] Duplicate entry
- [ ] Item not found
- [ ] Permission denied
- [ ] Session expired
- [ ] Database constraint violation
- [ ] Upload interruption

## Need Help?

See full documentation: `src/lib/ERROR_HANDLING.md`
