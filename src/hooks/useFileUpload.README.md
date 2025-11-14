# useFileUpload Hook

A custom React hook for handling file uploads to Supabase Storage with built-in retry logic, progress tracking, and error handling.

## Features

- ✅ Upload PDF files to catalogs bucket
- ✅ Upload thumbnail images to thumbnails bucket
- ✅ Generate unique file names using UUID and timestamp
- ✅ Handle upload progress events
- ✅ Return public URLs after successful upload
- ✅ Automatic retry logic with exponential backoff
- ✅ Clean up failed uploads
- ✅ File validation (type and size)
- ✅ TypeScript support with full type safety

## Installation

The hook is already integrated into the project. Simply import it:

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';
```

## API Reference

### Hook Return Values

```typescript
const {
  // State
  isUploading,      // boolean - Upload in progress
  uploadProgress,   // number - Upload progress (0-100)
  error,           // FileUploadError | null - Upload error

  // Methods
  uploadPDF,       // (file: File, options?: UploadOptions) => Promise<FileUploadResult>
  uploadThumbnail, // (file: File, options?: UploadOptions) => Promise<FileUploadResult>
  deleteFile,      // (bucket: string, path: string) => Promise<void>
  resetUploadState // () => void
} = useFileUpload();
```

### Types

#### FileUploadResult
```typescript
interface FileUploadResult {
  publicUrl: string;  // Public URL to access the file
  path: string;       // Storage path of the file
  size: number;       // File size in bytes
}
```

#### FileUploadError
```typescript
interface FileUploadError {
  message: string;    // Human-readable error message
  code?: string;      // Error code (e.g., 'INVALID_FILE_TYPE', 'FILE_TOO_LARGE')
  originalError?: any; // Original error object
}
```

#### UploadOptions
```typescript
interface UploadOptions {
  onProgress?: (progress: number) => void; // Progress callback (0-100)
  maxRetries?: number;                     // Maximum retry attempts (default: 3)
  retryDelay?: number;                     // Base delay between retries in ms (default: 1000)
}
```

## Usage Examples

### Basic PDF Upload

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

function UploadComponent() {
  const { uploadPDF, isUploading, uploadProgress, error } = useFileUpload();

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadPDF(file);
      console.log('Uploaded to:', result.publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }} />
      {isUploading && <p>Uploading: {uploadProgress}%</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### Upload with Progress Tracking

```typescript
const { uploadThumbnail } = useFileUpload();

const handleUpload = async (file: File) => {
  try {
    const result = await uploadThumbnail(file, {
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
        // Update UI with progress
      }
    });
    console.log('Success:', result.publicUrl);
  } catch (err) {
    console.error('Failed:', err);
  }
};
```

### Upload Both PDF and Thumbnail

```typescript
const { uploadPDF, uploadThumbnail, isUploading } = useFileUpload();

const handleCatalogUpload = async (pdfFile: File, thumbnailFile: File) => {
  try {
    // Upload both files in parallel
    const [pdfResult, thumbnailResult] = await Promise.all([
      uploadPDF(pdfFile),
      uploadThumbnail(thumbnailFile)
    ]);

    // Save to database
    const catalogData = {
      pdf_url: pdfResult.publicUrl,
      thumbnail_url: thumbnailResult.publicUrl,
      file_size: pdfResult.size,
      // ... other metadata
    };

    // Insert into Supabase
    // await supabase.from('catalogs').insert(catalogData);
    
    return catalogData;
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
};
```

### Custom Retry Configuration

```typescript
const { uploadPDF } = useFileUpload();

const handleUpload = async (file: File) => {
  try {
    const result = await uploadPDF(file, {
      maxRetries: 5,        // Try up to 5 times
      retryDelay: 2000,     // Wait 2 seconds between retries
      onProgress: (progress) => {
        console.log(`Progress: ${progress}%`);
      }
    });
    return result;
  } catch (err) {
    console.error('Failed after all retries:', err);
    throw err;
  }
};
```

### File Cleanup

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';
import { STORAGE_BUCKETS } from '@/lib/supabase';

const { deleteFile } = useFileUpload();

// Delete a PDF
await deleteFile(STORAGE_BUCKETS.CATALOGS, 'path/to/file.pdf');

// Delete a thumbnail
await deleteFile(STORAGE_BUCKETS.THUMBNAILS, 'path/to/thumbnail.jpg');
```

### Error Handling

```typescript
const { uploadPDF, error } = useFileUpload();

const handleUpload = async (file: File) => {
  try {
    const result = await uploadPDF(file);
    return result;
  } catch (err: any) {
    // Handle specific error codes
    switch (err.code) {
      case 'INVALID_FILE_TYPE':
        alert('Please select a PDF file');
        break;
      case 'FILE_TOO_LARGE':
        alert('File size must be less than 10MB');
        break;
      default:
        alert(`Upload failed: ${err.message}`);
    }
  }
};
```

## Validation Rules

### PDF Files
- **Accepted type**: `application/pdf`
- **Maximum size**: 10MB
- **Storage bucket**: `catalogs`

### Thumbnail Images
- **Accepted types**: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`
- **Maximum size**: 2MB
- **Storage bucket**: `thumbnails`

## Retry Logic

The hook implements automatic retry with exponential backoff:

1. **First attempt**: Immediate upload
2. **Retry 1**: Wait 1 second (retryDelay × 1)
3. **Retry 2**: Wait 2 seconds (retryDelay × 2)
4. **Retry 3**: Wait 3 seconds (retryDelay × 3)
5. **Final failure**: Clean up and throw error

You can customize the retry behavior:

```typescript
await uploadPDF(file, {
  maxRetries: 5,      // More attempts
  retryDelay: 2000    // Longer delays
});
```

## File Naming

Files are automatically renamed using a unique identifier:

```
Format: {timestamp}-{randomString}.{extension}
Example: 1699564800000-abc123def456.pdf
```

This ensures:
- No file name conflicts
- Unique identifiers for each upload
- Original file extension is preserved

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_FILE_TYPE` | File type not accepted |
| `FILE_TOO_LARGE` | File exceeds size limit |
| (Supabase codes) | Various Supabase storage errors |

## Integration with CatalogUploadDialog

The hook is designed to work seamlessly with the `CatalogUploadDialog` component:

```typescript
// In CatalogUploadDialog.tsx
import { useFileUpload } from '@/hooks/useFileUpload';

const CatalogUploadDialog = () => {
  const { uploadPDF, uploadThumbnail, isUploading, uploadProgress } = useFileUpload();

  const handleSave = async (data) => {
    try {
      // Upload files
      const pdfResult = await uploadPDF(data.pdf_file);
      const thumbnailResult = await uploadThumbnail(data.thumbnail_file);

      // Save to database
      await supabase.from('catalogs').insert({
        title_en: data.title_en,
        title_ar: data.title_ar,
        category_id: data.category_id,
        pdf_url: pdfResult.publicUrl,
        thumbnail_url: thumbnailResult.publicUrl,
        file_size: pdfResult.size,
        published: true
      });

      toast.success('Catalog uploaded successfully!');
    } catch (err) {
      toast.error('Upload failed');
      console.error(err);
    }
  };

  return (
    // ... dialog UI with progress indicator
    {isUploading && <Progress value={uploadProgress} />}
  );
};
```

## Best Practices

1. **Always handle errors**: Wrap upload calls in try-catch blocks
2. **Show progress**: Use the `onProgress` callback for better UX
3. **Validate before upload**: Check file type and size on the client side first
4. **Clean up on unmount**: Reset state when component unmounts
5. **Use parallel uploads**: Upload multiple files with `Promise.all()` when possible
6. **Provide feedback**: Show loading states and error messages to users

## Troubleshooting

### Upload fails immediately
- Check Supabase credentials in `.env`
- Verify storage buckets exist in Supabase dashboard
- Ensure RLS policies allow uploads

### Progress not updating
- Make sure to pass `onProgress` callback
- Check that the callback updates your component state

### Files not accessible
- Verify bucket has public read access
- Check RLS policies on storage buckets
- Ensure file was uploaded successfully

### Retry logic not working
- Check network connectivity
- Verify Supabase service is available
- Increase `maxRetries` if needed

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- ✅ **Requirement 6.3**: Upload PDF to Supabase storage in catalogs bucket
- ✅ **Requirement 6.4**: Upload thumbnail image to Supabase storage in thumbnails bucket
- ✅ Generate unique file names using UUID
- ✅ Handle upload progress events
- ✅ Return public URLs after successful upload
- ✅ Handle upload errors with retry logic
- ✅ Clean up failed uploads

## Related Files

- `src/lib/supabase.ts` - Supabase client configuration
- `src/types/database.ts` - Database type definitions
- `src/components/admin/CatalogUploadDialog.tsx` - Upload dialog component
- `src/hooks/useCategoryMutations.ts` - Similar mutation hook pattern

## License

Part of the Mst-ksa website project.
