import { useState, useCallback } from 'react';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import { handleError, retryOperation } from '@/lib/error-handling';

/**
 * File upload result interface
 */
export interface FileUploadResult {
  publicUrl: string;
  path: string;
  size: number;
}

/**
 * File upload error interface
 */
export interface FileUploadError {
  message: string;
  code?: string;
  originalError?: any;
}

/**
 * Upload progress callback type
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload options interface
 */
interface UploadOptions {
  onProgress?: UploadProgressCallback;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Generate a unique file name using UUID and original file extension
 */
const generateUniqueFileName = (originalFileName: string): string => {
  const extension = originalFileName.split('.').pop() || '';
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomString}.${extension}`;
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * useFileUpload Hook
 * 
 * Custom hook for handling file uploads to Supabase Storage.
 * Features:
 * - Upload PDF files to catalogs bucket
 * - Upload thumbnail images to thumbnails bucket
 * - Generate unique file names using UUID
 * - Handle upload progress events
 * - Return public URLs after successful upload
 * - Handle upload errors with retry logic
 * - Clean up failed uploads
 */
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<FileUploadError | null>(null);

  /**
   * Upload a file to a specific storage bucket with retry logic
   */
  const uploadFile = useCallback(
    async (
      file: File,
      bucket: string,
      options: UploadOptions = {}
    ): Promise<FileUploadResult> => {
      const {
        onProgress,
        maxRetries = 3,
      } = options;

      const uniqueFileName = generateUniqueFileName(file.name);

      // Use retryOperation for automatic retry with exponential backoff
      return await retryOperation(
        async () => {
          try {
            // Report initial progress
            if (onProgress) {
              onProgress(0);
            }

            // Upload file to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
              .from(bucket)
              .upload(uniqueFileName, file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              // Enhance error message for common storage errors
              if (uploadError.message.includes('Duplicate')) {
                throw new Error('A file with this name already exists. Please try again.');
              }
              if (uploadError.message.includes('size')) {
                throw new Error('File size exceeds the maximum allowed size.');
              }
              if (uploadError.message.includes('type')) {
                throw new Error('File type is not allowed.');
              }
              throw uploadError;
            }

            if (!data) {
              throw new Error('Upload succeeded but no data returned. Please try again.');
            }

            // Report completion
            if (onProgress) {
              onProgress(100);
            }

            // Get public URL for the uploaded file
            const { data: urlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(data.path);

            return {
              publicUrl: urlData.publicUrl,
              path: data.path,
              size: file.size,
            };
          } catch (err: any) {
            // Try to clean up on error
            try {
              await supabase.storage.from(bucket).remove([uniqueFileName]);
            } catch (cleanupError) {
              handleError(cleanupError, 'clean up failed upload', { showToast: false });
            }

            // Throw structured error
            throw {
              message: err.message || 'Upload failed. Please try again.',
              code: err.code || 'UPLOAD_FAILED',
              originalError: err,
            } as FileUploadError;
          }
        },
        {
          maxRetries,
          onRetry: (attempt, error) => {
            console.warn(`Upload attempt ${attempt} failed, retrying...`, error);
          },
        }
      );
    },
    []
  );

  /**
   * Upload a PDF file to the catalogs bucket
   */
  const uploadPDF = useCallback(
    async (
      file: File,
      options: UploadOptions = {}
    ): Promise<FileUploadResult> => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // Validate file type
        if (file.type !== 'application/pdf') {
          const validationError: FileUploadError = {
            message: 'Invalid file type. Only PDF files are allowed.',
            code: 'INVALID_FILE_TYPE',
          };
          throw validationError;
        }

        // Validate file size (10MB max)
        const MAX_PDF_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_PDF_SIZE) {
          const validationError: FileUploadError = {
            message: `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
            code: 'FILE_TOO_LARGE',
          };
          throw validationError;
        }

        // Create progress callback that updates state
        const progressCallback: UploadProgressCallback = (progress) => {
          setUploadProgress(progress);
          if (options.onProgress) {
            options.onProgress(progress);
          }
        };

        // Upload the file
        const result = await uploadFile(file, STORAGE_BUCKETS.CATALOGS, {
          ...options,
          onProgress: progressCallback,
        });

        setIsUploading(false);
        return result;
      } catch (err: any) {
        const uploadError: FileUploadError = {
          message: err.message || 'Failed to upload PDF. Please try again.',
          code: err.code || 'UPLOAD_FAILED',
          originalError: err,
        };
        setError(uploadError);
        setIsUploading(false);
        
        // Log error with context
        handleError(uploadError, 'upload PDF file', { showToast: false });
        
        throw uploadError;
      }
    },
    [uploadFile]
  );

  /**
   * Upload a thumbnail image to the thumbnails bucket
   */
  const uploadThumbnail = useCallback(
    async (
      file: File,
      options: UploadOptions = {}
    ): Promise<FileUploadResult> => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // Validate file type
        const ACCEPTED_IMAGE_TYPES = [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp',
        ];
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          const validationError: FileUploadError = {
            message: 'Invalid file type. Only PNG, JPG, and WebP images are allowed.',
            code: 'INVALID_FILE_TYPE',
          };
          throw validationError;
        }

        // Validate file size (2MB max)
        const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_THUMBNAIL_SIZE) {
          const validationError: FileUploadError = {
            message: `File size exceeds 2MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
            code: 'FILE_TOO_LARGE',
          };
          throw validationError;
        }

        // Create progress callback that updates state
        const progressCallback: UploadProgressCallback = (progress) => {
          setUploadProgress(progress);
          if (options.onProgress) {
            options.onProgress(progress);
          }
        };

        // Upload the file
        const result = await uploadFile(file, STORAGE_BUCKETS.THUMBNAILS, {
          ...options,
          onProgress: progressCallback,
        });

        setIsUploading(false);
        return result;
      } catch (err: any) {
        const uploadError: FileUploadError = {
          message: err.message || 'Failed to upload thumbnail. Please try again.',
          code: err.code || 'UPLOAD_FAILED',
          originalError: err,
        };
        setError(uploadError);
        setIsUploading(false);
        
        // Log error with context
        handleError(uploadError, 'upload thumbnail image', { showToast: false });
        
        throw uploadError;
      }
    },
    [uploadFile]
  );

  /**
   * Delete a file from storage (cleanup utility)
   */
  const deleteFile = useCallback(
    async (bucket: string, path: string): Promise<void> => {
      try {
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([path]);

        if (deleteError) {
          throw deleteError;
        }
      } catch (err: any) {
        const deleteFileError: FileUploadError = {
          message: err.message || 'Failed to delete file. Please try again.',
          code: err.code || 'DELETE_FAILED',
          originalError: err,
        };
        
        // Log error with context
        handleError(deleteFileError, 'delete file from storage', { showToast: false });
        
        throw deleteFileError;
      }
    },
    []
  );

  /**
   * Reset upload state
   */
  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    // State
    isUploading,
    uploadProgress,
    error,

    // Methods
    uploadPDF,
    uploadThumbnail,
    deleteFile,
    resetUploadState,
  };
};
