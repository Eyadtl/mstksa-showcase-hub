/**
 * useFileUpload Hook - Usage Examples
 * 
 * This file demonstrates how to use the useFileUpload hook
 * for uploading PDF catalogs and thumbnail images to Supabase Storage.
 */

import { useFileUpload } from './useFileUpload';

/**
 * Example 1: Basic PDF Upload
 */
export const BasicPDFUploadExample = () => {
  const { uploadPDF, isUploading, uploadProgress, error } = useFileUpload();

  const handleFileSelect = async (file: File) => {
    try {
      const result = await uploadPDF(file);
      console.log('PDF uploaded successfully:', result);
      console.log('Public URL:', result.publicUrl);
      console.log('Storage path:', result.path);
      console.log('File size:', result.size);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return { handleFileSelect, isUploading, uploadProgress, error };
};

/**
 * Example 2: Thumbnail Upload with Progress Tracking
 */
export const ThumbnailUploadWithProgressExample = () => {
  const { uploadThumbnail, isUploading, uploadProgress } = useFileUpload();

  const handleThumbnailUpload = async (file: File) => {
    try {
      const result = await uploadThumbnail(file, {
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress}%`);
        },
      });
      console.log('Thumbnail uploaded:', result.publicUrl);
    } catch (err) {
      console.error('Thumbnail upload failed:', err);
    }
  };

  return { handleThumbnailUpload, isUploading, uploadProgress };
};

/**
 * Example 3: Upload Both PDF and Thumbnail (Catalog Creation)
 */
export const CatalogUploadExample = () => {
  const {
    uploadPDF,
    uploadThumbnail,
    isUploading,
    uploadProgress,
    error,
    resetUploadState,
  } = useFileUpload();

  const handleCatalogUpload = async (pdfFile: File, thumbnailFile: File) => {
    resetUploadState();

    try {
      // Upload PDF first
      console.log('Uploading PDF...');
      const pdfResult = await uploadPDF(pdfFile, {
        onProgress: (progress) => {
          console.log(`PDF upload: ${progress}%`);
        },
      });

      // Upload thumbnail
      console.log('Uploading thumbnail...');
      const thumbnailResult = await uploadThumbnail(thumbnailFile, {
        onProgress: (progress) => {
          console.log(`Thumbnail upload: ${progress}%`);
        },
      });

      // Both uploads successful
      return {
        pdfUrl: pdfResult.publicUrl,
        thumbnailUrl: thumbnailResult.publicUrl,
        pdfPath: pdfResult.path,
        thumbnailPath: thumbnailResult.path,
      };
    } catch (err) {
      console.error('Catalog upload failed:', err);
      throw err;
    }
  };

  return { handleCatalogUpload, isUploading, uploadProgress, error };
};

/**
 * Example 4: Upload with Custom Retry Configuration
 */
export const UploadWithRetryExample = () => {
  const { uploadPDF } = useFileUpload();

  const handleUploadWithRetry = async (file: File) => {
    try {
      const result = await uploadPDF(file, {
        maxRetries: 5, // Try up to 5 times
        retryDelay: 2000, // Wait 2 seconds between retries (with exponential backoff)
        onProgress: (progress) => {
          console.log(`Progress: ${progress}%`);
        },
      });
      return result;
    } catch (err) {
      console.error('Upload failed after all retries:', err);
      throw err;
    }
  };

  return { handleUploadWithRetry };
};

/**
 * Example 5: File Cleanup (Delete)
 */
export const FileCleanupExample = () => {
  const { deleteFile } = useFileUpload();
  const { STORAGE_BUCKETS } = require('@/lib/supabase');

  const handleDeletePDF = async (filePath: string) => {
    try {
      await deleteFile(STORAGE_BUCKETS.CATALOGS, filePath);
      console.log('PDF deleted successfully');
    } catch (err) {
      console.error('Failed to delete PDF:', err);
    }
  };

  const handleDeleteThumbnail = async (filePath: string) => {
    try {
      await deleteFile(STORAGE_BUCKETS.THUMBNAILS, filePath);
      console.log('Thumbnail deleted successfully');
    } catch (err) {
      console.error('Failed to delete thumbnail:', err);
    }
  };

  return { handleDeletePDF, handleDeleteThumbnail };
};

/**
 * Example 6: Integration with React Component
 */
export const ReactComponentExample = () => {
  const {
    uploadPDF,
    uploadThumbnail,
    isUploading,
    uploadProgress,
    error,
    resetUploadState,
  } = useFileUpload();

  const handleSubmit = async (
    pdfFile: File,
    thumbnailFile: File,
    metadata: { title_en: string; title_ar: string; category_id: string }
  ) => {
    try {
      // Reset state before starting
      resetUploadState();

      // Upload files
      const [pdfResult, thumbnailResult] = await Promise.all([
        uploadPDF(pdfFile),
        uploadThumbnail(thumbnailFile),
      ]);

      // Save catalog metadata to database
      const catalogData = {
        title_en: metadata.title_en,
        title_ar: metadata.title_ar,
        category_id: metadata.category_id,
        pdf_url: pdfResult.publicUrl,
        thumbnail_url: thumbnailResult.publicUrl,
        file_size: pdfResult.size,
        published: true,
      };

      // Insert into database (pseudo-code)
      // await supabase.from('catalogs').insert(catalogData);

      console.log('Catalog created successfully!');
      return catalogData;
    } catch (err) {
      console.error('Failed to create catalog:', err);
      throw err;
    }
  };

  return {
    handleSubmit,
    isUploading,
    uploadProgress,
    error,
  };
};

/**
 * Example 7: Error Handling
 */
export const ErrorHandlingExample = () => {
  const { uploadPDF, error } = useFileUpload();

  const handleUploadWithErrorHandling = async (file: File) => {
    try {
      const result = await uploadPDF(file);
      return result;
    } catch (err: any) {
      // Handle specific error codes
      if (err.code === 'INVALID_FILE_TYPE') {
        console.error('Please select a PDF file');
      } else if (err.code === 'FILE_TOO_LARGE') {
        console.error('File size must be less than 10MB');
      } else {
        console.error('Upload failed:', err.message);
      }
      throw err;
    }
  };

  return { handleUploadWithErrorHandling, error };
};
