import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import { useFileUpload } from './useFileUpload';
import type { CatalogInsert, CatalogUpdate } from '@/types/database';
import { handleError } from '@/lib/error-handling';

/**
 * Interface for creating a new catalog
 */
interface CreateCatalogData {
  title_en: string;
  title_ar: string;
  category_id: string;
  pdf_file: File;
  thumbnail_file: File;
}

/**
 * Interface for updating an existing catalog
 */
interface UpdateCatalogData {
  id: string;
  title_en: string;
  title_ar: string;
  category_id: string;
  pdf_file?: File; // Optional - only if replacing PDF
  thumbnail_file?: File; // Optional - only if replacing thumbnail
  existing_pdf_url?: string; // Keep existing if no new file
  existing_thumbnail_url?: string; // Keep existing if no new file
}

/**
 * Extract file path from Supabase storage URL
 */
const extractPathFromUrl = (url: string, bucket: string): string => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`);
    return pathParts[1] || '';
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return '';
  }
};

/**
 * Custom hook for catalog CRUD operations
 * Provides mutations for creating, updating, and deleting catalogs
 * with file upload handling, automatic cache invalidation, and toast notifications
 */
export const useCatalogMutations = () => {
  const { t: translate } = useTranslation();
  const t = translate as any;
  const queryClient = useQueryClient();
  const { uploadPDF, uploadThumbnail, deleteFile } = useFileUpload();

  /**
   * Create catalog mutation
   * Uploads PDF and thumbnail files, then saves metadata to database
   */
  const createCatalog = useMutation({
    mutationFn: async (data: CreateCatalogData) => {
      let pdfResult;
      let thumbnailResult;

      try {
        // Step 1: Upload PDF file
        pdfResult = await uploadPDF(data.pdf_file);
      } catch (error) {
        handleError(error, 'upload PDF file');
        throw error;
      }

      try {
        // Step 2: Upload thumbnail file
        thumbnailResult = await uploadThumbnail(data.thumbnail_file);
      } catch (error) {
        // If thumbnail upload fails, clean up the PDF
        try {
          await deleteFile(STORAGE_BUCKETS.CATALOGS, pdfResult.path);
        } catch (cleanupError) {
          handleError(cleanupError, 'clean up PDF after thumbnail upload failure', { showToast: false });
        }
        handleError(error, 'upload thumbnail image');
        throw error;
      }

      try {
        // Step 3: Save catalog metadata to database
        const insertData: CatalogInsert = {
          title_en: data.title_en,
          title_ar: data.title_ar,
          category_id: data.category_id,
          pdf_url: pdfResult.publicUrl,
          thumbnail_url: thumbnailResult.publicUrl,
          file_size: pdfResult.size,
          published: true,
        };

        const { error } = await supabase
          .from('catalogs')
          // @ts-ignore - Supabase type inference issue with Database generic
          .insert(insertData);

        if (error) {
          // Provide specific error messages for common database errors
          if (error.code === '23505') {
            throw new Error('A catalog with this title already exists. Please use a different title.');
          }
          if (error.code === '23503') {
            throw new Error('The selected category does not exist. Please select a valid category.');
          }
          throw error;
        }
      } catch (error) {
        // If database save fails, clean up both uploaded files
        try {
          await deleteFile(STORAGE_BUCKETS.CATALOGS, pdfResult.path);
          await deleteFile(STORAGE_BUCKETS.THUMBNAILS, thumbnailResult.path);
        } catch (cleanupError) {
          handleError(cleanupError, 'clean up files after database save failure', { showToast: false });
        }
        handleError(error, 'save catalog to database');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success(t('admin:catalogs.createSuccess'));
    },
    onError: (error: any) => {
      // Error already handled in mutationFn, just show generic message
      if (!error.userMessage) {
        toast.error(t('admin:catalogs.createError'));
      }
    },
  });

  /**
   * Update catalog mutation
   * Updates metadata and optionally replaces PDF and/or thumbnail files
   */
  const updateCatalog = useMutation({
    mutationFn: async (data: UpdateCatalogData) => {
      let pdfUrl = data.existing_pdf_url;
      let thumbnailUrl = data.existing_thumbnail_url;
      let fileSize = 0;

      // Track old file paths for cleanup
      const oldPdfPath = data.existing_pdf_url
        ? extractPathFromUrl(data.existing_pdf_url, STORAGE_BUCKETS.CATALOGS)
        : '';
      const oldThumbnailPath = data.existing_thumbnail_url
        ? extractPathFromUrl(data.existing_thumbnail_url, STORAGE_BUCKETS.THUMBNAILS)
        : '';

      // Step 1: Upload new PDF if provided
      if (data.pdf_file) {
        try {
          const pdfResult = await uploadPDF(data.pdf_file);
          pdfUrl = pdfResult.publicUrl;
          fileSize = pdfResult.size;
        } catch (error) {
          handleError(error, 'upload new PDF file');
          throw error;
        }
      }

      // Step 2: Upload new thumbnail if provided
      if (data.thumbnail_file) {
        try {
          const thumbnailResult = await uploadThumbnail(data.thumbnail_file);
          thumbnailUrl = thumbnailResult.publicUrl;
        } catch (error) {
          // If thumbnail upload fails and we uploaded a new PDF, clean it up
          if (data.pdf_file && pdfUrl) {
            const newPdfPath = extractPathFromUrl(pdfUrl, STORAGE_BUCKETS.CATALOGS);
            try {
              await deleteFile(STORAGE_BUCKETS.CATALOGS, newPdfPath);
            } catch (cleanupError) {
              handleError(cleanupError, 'clean up new PDF after thumbnail upload failure', { showToast: false });
            }
          }
          handleError(error, 'upload new thumbnail image');
          throw error;
        }
      }

      try {
        // Step 3: Update catalog metadata in database
        const updateData: CatalogUpdate = {
          title_en: data.title_en,
          title_ar: data.title_ar,
          category_id: data.category_id,
          pdf_url: pdfUrl,
          thumbnail_url: thumbnailUrl,
        };

        // Only update file_size if a new PDF was uploaded
        if (data.pdf_file && fileSize > 0) {
          updateData.file_size = fileSize;
        }

        const { error } = await supabase
          .from('catalogs')
          // @ts-ignore - Supabase type inference issue with Database generic
          .update(updateData)
          .eq('id', data.id);

        if (error) {
          // Provide specific error messages for common database errors
          if (error.code === '23505') {
            throw new Error('A catalog with this title already exists. Please use a different title.');
          }
          if (error.code === '23503') {
            throw new Error('The selected category does not exist. Please select a valid category.');
          }
          throw error;
        }

        // Step 4: Clean up old files if new ones were uploaded
        if (data.pdf_file && oldPdfPath) {
          try {
            await deleteFile(STORAGE_BUCKETS.CATALOGS, oldPdfPath);
          } catch (cleanupError) {
            handleError(cleanupError, 'clean up old PDF file', { showToast: false });
          }
        }
        if (data.thumbnail_file && oldThumbnailPath) {
          try {
            await deleteFile(STORAGE_BUCKETS.THUMBNAILS, oldThumbnailPath);
          } catch (cleanupError) {
            handleError(cleanupError, 'clean up old thumbnail file', { showToast: false });
          }
        }
      } catch (error) {
        // If database update fails, clean up newly uploaded files
        if (data.pdf_file && pdfUrl) {
          const newPdfPath = extractPathFromUrl(pdfUrl, STORAGE_BUCKETS.CATALOGS);
          try {
            await deleteFile(STORAGE_BUCKETS.CATALOGS, newPdfPath);
          } catch (cleanupError) {
            handleError(cleanupError, 'clean up new PDF after database update failure', { showToast: false });
          }
        }
        if (data.thumbnail_file && thumbnailUrl) {
          const newThumbnailPath = extractPathFromUrl(thumbnailUrl, STORAGE_BUCKETS.THUMBNAILS);
          try {
            await deleteFile(STORAGE_BUCKETS.THUMBNAILS, newThumbnailPath);
          } catch (cleanupError) {
            handleError(cleanupError, 'clean up new thumbnail after database update failure', { showToast: false });
          }
        }
        handleError(error, 'update catalog in database');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success(t('admin:catalogs.updateSuccess'));
    },
    onError: (error: any) => {
      // Error already handled in mutationFn, just show generic message
      if (!error.userMessage) {
        toast.error(t('admin:catalogs.updateError'));
      }
    },
  });

  /**
   * Delete catalog mutation
   * Removes files from storage and deletes database record
   */
  const deleteCatalog = useMutation({
    mutationFn: async (catalog: { id: string; pdf_url: string; thumbnail_url: string }) => {
      try {
        // Step 1: Delete database record first
        const { error } = await supabase
          .from('catalogs')
          .delete()
          .eq('id', catalog.id);

        if (error) {
          // Provide specific error messages for common database errors
          if (error.code === '23503') {
            throw new Error('Cannot delete this catalog because it is being referenced elsewhere.');
          }
          throw error;
        }

        // Step 2: Delete files from storage (after database deletion succeeds)
        const pdfPath = extractPathFromUrl(catalog.pdf_url, STORAGE_BUCKETS.CATALOGS);
        const thumbnailPath = extractPathFromUrl(catalog.thumbnail_url, STORAGE_BUCKETS.THUMBNAILS);

        // Delete PDF file
        if (pdfPath) {
          try {
            await deleteFile(STORAGE_BUCKETS.CATALOGS, pdfPath);
          } catch (error) {
            // Log but don't throw - file might already be deleted
            handleError(error, 'delete PDF file from storage', { showToast: false });
          }
        }

        // Delete thumbnail file
        if (thumbnailPath) {
          try {
            await deleteFile(STORAGE_BUCKETS.THUMBNAILS, thumbnailPath);
          } catch (error) {
            // Log but don't throw - file might already be deleted
            handleError(error, 'delete thumbnail file from storage', { showToast: false });
          }
        }
      } catch (error) {
        handleError(error, 'delete catalog');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success(t('admin:catalogs.deleteSuccess'));
    },
    onError: (error: any) => {
      // Error already handled in mutationFn, just show generic message
      if (!error.userMessage) {
        toast.error(t('admin:catalogs.deleteError'));
      }
    },
  });

  return {
    createCatalog,
    updateCatalog,
    deleteCatalog,
  };
};
