import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { Category } from '@/types/database';

/**
 * Validation schema for category form
 */
const createCategorySchema = (t: any) =>
  z.object({
    name_en: z
      .string()
      .min(1, t('admin:categories.dialog.validation.nameEnRequired'))
      .min(2, t('admin:categories.dialog.validation.nameEnMin')),
    name_ar: z
      .string()
      .min(1, t('admin:categories.dialog.validation.nameArRequired'))
      .min(2, t('admin:categories.dialog.validation.nameArMin')),
    slug: z.string(),
  });

type CategoryFormData = z.infer<ReturnType<typeof createCategorySchema>>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSave: (data: { name_en: string; name_ar: string; slug: string }) => Promise<void>;
  isSaving?: boolean;
}

/**
 * Convert string to kebab-case for slug generation
 */
const toKebabCase = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * CategoryDialog Component
 * 
 * A dialog for creating and editing categories with bilingual support.
 * Features:
 * - Create and edit modes
 * - Auto-generate slug from English name
 * - Form validation with Zod
 * - Inline error display
 * - RTL support
 */
const CategoryDialog = ({
  open,
  onOpenChange,
  category,
  onSave,
  isSaving = false,
}: CategoryDialogProps) => {
  const { t: translate } = useTranslation();
  const t = translate as any;
  const isEditMode = !!category;

  // Initialize form with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(createCategorySchema(t)),
    defaultValues: {
      name_en: '',
      name_ar: '',
      slug: '',
    },
  });

  // Watch name_en to auto-generate slug
  const nameEn = watch('name_en');

  // Auto-generate slug from name_en
  useEffect(() => {
    if (nameEn && !isEditMode) {
      const generatedSlug = toKebabCase(nameEn);
      setValue('slug', generatedSlug);
    }
  }, [nameEn, isEditMode, setValue]);

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        // Edit mode: populate with existing data
        reset({
          name_en: category.name_en || '',
          name_ar: category.name_ar || '',
          slug: category.slug || '',
        });
      } else {
        // Create mode: reset to empty
        reset({
          name_en: '',
          name_ar: '',
          slug: '',
        });
      }
    }
  }, [open, category, reset]);

  // Handle form submission
  const onSubmit = async (data: CategoryFormData) => {
    await onSave({
      name_en: data.name_en,
      name_ar: data.name_ar,
      slug: data.slug,
    });
  };

  // Handle cancel
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-left rtl:text-right">
            {isEditMode
              ? t('admin:categories.dialog.editTitle')
              : t('admin:categories.dialog.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* English Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name_en" className="text-left rtl:text-right block">
              {t('admin:categories.dialog.nameEn')} *
            </Label>
            <Input
              id="name_en"
              {...register('name_en')}
              placeholder={t('admin:categories.dialog.nameEnPlaceholder')}
              disabled={isSaving}
              className={errors.name_en ? 'border-destructive' : ''}
            />
            {errors.name_en && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {errors.name_en.message}
              </p>
            )}
          </div>

          {/* Arabic Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name_ar" className="text-left rtl:text-right block">
              {t('admin:categories.dialog.nameAr')} *
            </Label>
            <Input
              id="name_ar"
              {...register('name_ar')}
              placeholder={t('admin:categories.dialog.nameArPlaceholder')}
              disabled={isSaving}
              className={errors.name_ar ? 'border-destructive' : ''}
            />
            {errors.name_ar && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {errors.name_ar.message}
              </p>
            )}
          </div>

          {/* Slug Field (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-left rtl:text-right block">
              {t('admin:categories.dialog.slug')}
            </Label>
            <Input
              id="slug"
              {...register('slug')}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground text-left rtl:text-right">
              {t('admin:categories.dialog.slugHelp')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              {t('admin:categories.dialog.cancel')}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving
                ? t('admin:categories.dialog.saving')
                : t('admin:categories.dialog.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
