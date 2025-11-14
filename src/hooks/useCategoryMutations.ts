import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { CategoryInsert, CategoryUpdate } from '@/types/database';
import { handleError } from '@/lib/error-handling';

/**
 * Custom hook for category CRUD operations
 * Provides mutations for creating, updating, and deleting categories
 * with automatic cache invalidation and toast notifications
 */
export const useCategoryMutations = () => {
  const { t: translate } = useTranslation();
  const t = translate as any;
  const queryClient = useQueryClient();

  /**
   * Create category mutation
   * Saves a new category to Supabase and invalidates the categories cache
   * Uses optimistic updates for better UX
   */
  const createCategory = useMutation({
    mutationFn: async (data: { name_en: string; name_ar: string; slug: string }) => {
      try {
        const insertData: CategoryInsert = {
          name_en: data.name_en,
          name_ar: data.name_ar,
          slug: data.slug,
        };
        
        const { data: result, error } = await supabase
          .from('categories')
          // @ts-ignore - Supabase type inference issue with Database generic
          .insert(insertData)
          .select()
          .single();
        
        if (error) {
          // Provide specific error messages for common database errors
          if (error.code === '23505') {
            throw new Error('A category with this name or slug already exists. Please use a different name.');
          }
          throw error;
        }
        
        return result;
      } catch (error) {
        handleError(error, 'create category');
        throw error;
      }
    },
    onMutate: async (newCategory) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData(['categories']);

      // Optimistically update to the new value
      queryClient.setQueryData(['categories'], (old: any) => {
        if (!old) return old;
        return [
          {
            id: 'temp-' + Date.now(),
            ...newCategory,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...old,
        ];
      });

      return { previousCategories };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('admin:categories.createSuccess'));
    },
    onError: (error: any, _newCategory, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
      // Error already handled in mutationFn, just show generic message
      if (!error.userMessage) {
        toast.error(t('admin:categories.createError'));
      }
    },
  });

  /**
   * Update category mutation
   * Updates an existing category in Supabase and invalidates the categories cache
   * Uses optimistic updates for better UX
   */
  const updateCategory = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name_en: string; name_ar: string; slug: string };
    }) => {
      try {
        const updateData: CategoryUpdate = {
          name_en: data.name_en,
          name_ar: data.name_ar,
          slug: data.slug,
        };
        
        const { error } = await supabase
          .from('categories')
          // @ts-ignore - Supabase type inference issue with Database generic
          .update(updateData)
          .eq('id', id);
        
        if (error) {
          // Provide specific error messages for common database errors
          if (error.code === '23505') {
            throw new Error('A category with this name or slug already exists. Please use a different name.');
          }
          if (error.code === 'PGRST116') {
            throw new Error('Category not found. It may have been deleted.');
          }
          throw error;
        }
      } catch (error) {
        handleError(error, 'update category');
        throw error;
      }
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData(['categories']);

      // Optimistically update to the new value
      queryClient.setQueryData(['categories'], (old: any) => {
        if (!old) return old;
        return old.map((category: any) =>
          category.id === id
            ? { ...category, ...data, updated_at: new Date().toISOString() }
            : category
        );
      });

      return { previousCategories };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('admin:categories.updateSuccess'));
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
      // Error already handled in mutationFn, just show generic message
      if (!error.userMessage) {
        toast.error(t('admin:categories.updateError'));
      }
    },
  });

  /**
   * Delete category mutation
   * Validates that the category has no associated catalogs before deletion
   * Removes the category from Supabase and invalidates the categories cache
   * Uses optimistic updates for better UX
   */
  const deleteCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      try {
        // First check if category has associated catalogs
        const { data: catalogs, error: catalogError } = await supabase
          .from('catalogs')
          .select('id')
          .eq('category_id', categoryId)
          .limit(1);

        if (catalogError) {
          handleError(catalogError, 'check for associated catalogs');
          throw catalogError;
        }

        // Prevent deletion if category has associated catalogs
        if (catalogs && catalogs.length > 0) {
          throw new Error('CATEGORY_HAS_CATALOGS');
        }

        // Delete the category
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryId);

        if (error) {
          // Provide specific error messages for common database errors
          if (error.code === 'PGRST116') {
            throw new Error('Category not found. It may have already been deleted.');
          }
          if (error.code === '23503') {
            throw new Error('Cannot delete this category because it is being used by catalogs.');
          }
          throw error;
        }
      } catch (error) {
        // Don't call handleError for CATEGORY_HAS_CATALOGS - it's a validation error
        if (error instanceof Error && error.message !== 'CATEGORY_HAS_CATALOGS') {
          handleError(error, 'delete category');
        }
        throw error;
      }
    },
    onMutate: async (categoryId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData(['categories']);

      // Optimistically remove the category
      queryClient.setQueryData(['categories'], (old: any) => {
        if (!old) return old;
        return old.filter((category: any) => category.id !== categoryId);
      });

      return { previousCategories };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('admin:categories.deleteSuccess'));
    },
    onError: (error: any, _categoryId, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
      
      // Display specific error message if category has associated catalogs
      if (error.message === 'CATEGORY_HAS_CATALOGS') {
        toast.error(t('admin:categories.deleteErrorHasCatalogs'));
      } else if (!error.userMessage) {
        // Error already handled in mutationFn, just show generic message
        toast.error(t('admin:categories.deleteError'));
      }
    },
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
