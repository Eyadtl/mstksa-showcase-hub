# useCatalogMutations Hook

## Overview

The `useCatalogMutations` hook provides TanStack Query mutations for catalog CRUD operations with integrated file upload handling, automatic cache invalidation, and user feedback via toast notifications.

## Features

- **Create Catalog**: Uploads PDF and thumbnail files, then saves metadata to database
- **Update Catalog**: Updates metadata and optionally replaces PDF and/or thumbnail files
- **Delete Catalog**: Removes files from storage and deletes database record
- **Automatic Cleanup**: Cleans up uploaded files if database operations fail
- **Cache Invalidation**: Automatically invalidates the catalogs query cache after mutations
- **Toast Notifications**: Shows success/error messages in both English and Arabic
- **Error Handling**: Comprehensive error handling with rollback on failures

## Usage

```typescript
import { useCatalogMutations } from '@/hooks/useCatalogMutations';

const MyComponent = () => {
  const { createCatalog, updateCatalog, deleteCatalog } = useCatalogMutations();

  // Create a new catalog
  const handleCreate = async () => {
    await createCatalog.mutateAsync({
      title_en: 'Steel Beams Catalog',
      title_ar: 'كتالوج العوارض الفولاذية',
      category_id: 'category-uuid',
      pdf_file: pdfFile,
      thumbnail_file: thumbnailFile,
    });
  };

  // Update an existing catalog
  const handleUpdate = async () => {
    await updateCatalog.mutateAsync({
      id: 'catalog-uuid',
      title_en: 'Updated Title',
      title_ar: 'العنوان المحدث',
      category_id: 'category-uuid',
      pdf_file: newPdfFile, // Optional - only if replacing
      thumbnail_file: newThumbnailFile, // Optional - only if replacing
      existing_pdf_url: 'https://...', // Keep existing if no new file
      existing_thumbnail_url: 'https://...', // Keep existing if no new file
    });
  };

  // Delete a catalog
  const handleDelete = async () => {
    await deleteCatalog.mutateAsync({
      id: 'catalog-uuid',
      pdf_url: 'https://...',
      thumbnail_url: 'https://...',
    });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={createCatalog.isPending}>
        Create Catalog
      </button>
      <button onClick={handleUpdate} disabled={updateCatalog.isPending}>
        Update Catalog
      </button>
      <button onClick={handleDelete} disabled={deleteCatalog.isPending}>
        Delete Catalog
      </button>
    </div>
  );
};
```

## API Reference

### createCatalog

Creates a new catalog by uploading files and saving metadata.

**Parameters:**
```typescript
{
  title_en: string;
  title_ar: string;
  category_id: string;
  pdf_file: File;
  thumbnail_file: File;
}
```

**Process:**
1. Uploads PDF file to Supabase storage (catalogs bucket)
2. Uploads thumbnail file to Supabase storage (thumbnails bucket)
3. Saves catalog metadata to database with file URLs
4. If any step fails, cleans up uploaded files

**Returns:** TanStack Query mutation object with `mutate`, `mutateAsync`, `isPending`, etc.

### updateCatalog

Updates an existing catalog's metadata and optionally replaces files.

**Parameters:**
```typescript
{
  id: string;
  title_en: string;
  title_ar: string;
  category_id: string;
  pdf_file?: File; // Optional - only if replacing PDF
  thumbnail_file?: File; // Optional - only if replacing thumbnail
  existing_pdf_url?: string; // Keep existing if no new file
  existing_thumbnail_url?: string; // Keep existing if no new file
}
```

**Process:**
1. Uploads new PDF file if provided
2. Uploads new thumbnail file if provided
3. Updates catalog metadata in database
4. Deletes old files from storage if new ones were uploaded
5. If any step fails, cleans up newly uploaded files

**Returns:** TanStack Query mutation object

### deleteCatalog

Deletes a catalog by removing files from storage and database record.

**Parameters:**
```typescript
{
  id: string;
  pdf_url: string;
  thumbnail_url: string;
}
```

**Process:**
1. Extracts file paths from URLs
2. Deletes PDF file from storage
3. Deletes thumbnail file from storage
4. Deletes database record

**Returns:** TanStack Query mutation object

## Error Handling

The hook implements comprehensive error handling:

- **File Upload Failures**: Automatically cleans up partially uploaded files
- **Database Failures**: Rolls back file uploads if database operations fail
- **User Feedback**: Shows localized error messages via toast notifications
- **Console Logging**: Logs detailed error information for debugging

## Dependencies

- `@tanstack/react-query`: For mutation management and cache invalidation
- `react-i18next`: For internationalized toast messages
- `sonner`: For toast notifications
- `@/hooks/useFileUpload`: For file upload operations
- `@/lib/supabase`: For database and storage operations

## Integration

This hook is integrated with:

- **Catalogs Admin Page** (`src/pages/admin/Catalogs.tsx`): Uses all three mutations for catalog management
- **CatalogUploadDialog** (`src/components/admin/CatalogUploadDialog.tsx`): Provides the UI for create/update operations

## Translation Keys

The hook uses the following translation keys from `admin.json`:

- `admin:catalogs.createSuccess`
- `admin:catalogs.createError`
- `admin:catalogs.updateSuccess`
- `admin:catalogs.updateError`
- `admin:catalogs.deleteSuccess`
- `admin:catalogs.deleteError`

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 6.5**: Create catalog mutation that uploads files then saves metadata
- **Requirement 6.9**: Update catalog mutation that updates metadata and optionally replaces files
- **Requirement 6.10**: Delete catalog mutation that removes files from storage and database record
- **Requirement 6.11**: Display confirmation dialog before deletion (implemented in Catalogs page)

## Notes

- The hook uses the `useFileUpload` hook for file upload operations with retry logic
- File paths are extracted from Supabase storage URLs using the `extractPathFromUrl` helper
- The hook automatically invalidates the `['catalogs']` query cache after successful mutations
- All mutations show loading states via `isPending` property
- Toast notifications are automatically localized based on the current language
