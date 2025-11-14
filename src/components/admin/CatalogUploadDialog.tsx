import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { CatalogWithCategory, Category } from '@/types/database';

/**
 * File validation constants
 */
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_PDF_TYPES = ['application/pdf'];
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

/**
 * Validation schema for catalog form
 */
const createCatalogSchema = (t: any) =>
  z.object({
    title_en: z
      .string()
      .min(1, t('admin:catalogs.dialog.validation.titleEnRequired'))
      .min(3, t('admin:catalogs.dialog.validation.titleEnMin')),
    title_ar: z
      .string()
      .min(1, t('admin:catalogs.dialog.validation.titleArRequired'))
      .min(3, t('admin:catalogs.dialog.validation.titleArMin')),
    category_id: z
      .string()
      .min(1, t('admin:catalogs.dialog.validation.categoryRequired')),
  });

type CatalogFormData = z.infer<ReturnType<typeof createCatalogSchema>>;

interface CatalogUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog?: CatalogWithCategory | null;
  onSave: (data: {
    title_en: string;
    title_ar: string;
    category_id: string;
    pdf_file?: File;
    thumbnail_file?: File;
  }) => Promise<void>;
  isSaving?: boolean;
  uploadProgress?: number;
}

/**
 * CatalogUploadDialog Component
 * 
 * A dialog for uploading and editing catalogs with file upload support.
 * Features:
 * - Create and edit modes
 * - PDF file upload with drag-and-drop
 * - Thumbnail image upload with preview
 * - File validation (type and size)
 * - Upload progress indicators
 * - RTL support
 */
const CatalogUploadDialog = ({
  open,
  onOpenChange,
  catalog,
  onSave,
  isSaving = false,
  uploadProgress = 0,
}: CatalogUploadDialogProps) => {
  const { t: translate, i18n } = useTranslation();
  const t = translate as any;
  const isRTL = i18n.language === 'ar';
  const isEditMode = !!catalog;

  // File state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);

  // Fetch categories for dropdown
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name_en', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });

  // Initialize form with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CatalogFormData>({
    resolver: zodResolver(createCatalogSchema(t)),
    defaultValues: {
      title_en: '',
      title_ar: '',
      category_id: '',
    },
  });

  const selectedCategoryId = watch('category_id');

  // Reset form when dialog opens/closes or catalog changes
  useEffect(() => {
    if (open) {
      if (catalog) {
        // Edit mode: populate with existing data
        reset({
          title_en: catalog.title_en || '',
          title_ar: catalog.title_ar || '',
          category_id: catalog.category_id || '',
        });
        // Set thumbnail preview from existing URL
        setThumbnailPreview(catalog.thumbnail_url);
      } else {
        // Create mode: reset to empty
        reset({
          title_en: '',
          title_ar: '',
          category_id: '',
        });
        setPdfFile(null);
        setThumbnailFile(null);
        setThumbnailPreview(null);
      }
      setPdfError(null);
      setThumbnailError(null);
    }
  }, [open, catalog, reset]);

  // Validate PDF file
  const validatePdfFile = (file: File): string | null => {
    if (!ACCEPTED_PDF_TYPES.includes(file.type)) {
      return t('admin:catalogs.dialog.validation.pdfType');
    }
    if (file.size > MAX_PDF_SIZE) {
      return t('admin:catalogs.dialog.validation.pdfSize');
    }
    return null;
  };

  // Validate thumbnail file
  const validateThumbnailFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return t('admin:catalogs.dialog.validation.thumbnailType');
    }
    if (file.size > MAX_THUMBNAIL_SIZE) {
      return t('admin:catalogs.dialog.validation.thumbnailSize');
    }
    return null;
  };

  // Handle PDF file selection
  const handlePdfFileChange = (file: File | null) => {
    if (!file) {
      setPdfFile(null);
      setPdfError(null);
      return;
    }

    const error = validatePdfFile(file);
    if (error) {
      setPdfError(error);
      setPdfFile(null);
    } else {
      setPdfFile(file);
      setPdfError(null);
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailFileChange = (file: File | null) => {
    if (!file) {
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setThumbnailError(null);
      return;
    }

    const error = validateThumbnailFile(file);
    if (error) {
      setThumbnailError(error);
      setThumbnailFile(null);
      setThumbnailPreview(null);
    } else {
      setThumbnailFile(file);
      setThumbnailError(null);
      
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle PDF drag and drop
  const handlePdfDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPdf(true);
  };

  const handlePdfDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPdf(false);
  };

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPdf(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handlePdfFileChange(files[0]);
    }
  };

  // Handle thumbnail drag and drop
  const handleThumbnailDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumbnail(true);
  };

  const handleThumbnailDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleThumbnailFileChange(files[0]);
    }
  };

  // Handle form submission
  const onSubmit = async (data: CatalogFormData) => {
    // Validate files for create mode
    if (!isEditMode) {
      if (!pdfFile) {
        setPdfError(t('admin:catalogs.dialog.validation.pdfRequired'));
        return;
      }
      if (!thumbnailFile) {
        setThumbnailError(t('admin:catalogs.dialog.validation.thumbnailRequired'));
        return;
      }
    }

    await onSave({
      title_en: data.title_en,
      title_ar: data.title_ar,
      category_id: data.category_id,
      pdf_file: pdfFile || undefined,
      thumbnail_file: thumbnailFile || undefined,
    });
  };

  // Handle cancel
  const handleCancel = () => {
    onOpenChange(false);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-left rtl:text-right">
            {isEditMode
              ? t('admin:catalogs.dialog.editTitle')
              : t('admin:catalogs.dialog.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* English Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title_en" className="text-left rtl:text-right block">
              {t('admin:catalogs.dialog.titleEn')} *
            </Label>
            <Input
              id="title_en"
              {...register('title_en')}
              placeholder={t('admin:catalogs.dialog.titleEnPlaceholder')}
              disabled={isSaving}
              className={errors.title_en ? 'border-destructive' : ''}
            />
            {errors.title_en && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {errors.title_en.message}
              </p>
            )}
          </div>

          {/* Arabic Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title_ar" className="text-left rtl:text-right block">
              {t('admin:catalogs.dialog.titleAr')} *
            </Label>
            <Input
              id="title_ar"
              {...register('title_ar')}
              placeholder={t('admin:catalogs.dialog.titleArPlaceholder')}
              disabled={isSaving}
              className={errors.title_ar ? 'border-destructive' : ''}
            />
            {errors.title_ar && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {errors.title_ar.message}
              </p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category_id" className="text-left rtl:text-right block">
              {t('admin:catalogs.dialog.category')} *
            </Label>
            <Select
              value={selectedCategoryId}
              onValueChange={(value) => setValue('category_id', value)}
              disabled={isSaving}
            >
              <SelectTrigger
                className={errors.category_id ? 'border-destructive' : ''}
              >
                <SelectValue placeholder={t('admin:catalogs.dialog.categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {isRTL ? category.name_ar : category.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {errors.category_id.message}
              </p>
            )}
          </div>

          {/* PDF File Upload */}
          <div className="space-y-2">
            <Label className="text-left rtl:text-right block">
              {t('admin:catalogs.dialog.pdfFile')} {!isEditMode && '*'}
            </Label>
            <div
              onDragOver={handlePdfDragOver}
              onDragLeave={handlePdfDragLeave}
              onDrop={handlePdfDrop}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${isDraggingPdf ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${pdfError ? 'border-destructive' : ''}
                ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
              `}
            >
              {pdfFile ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                    <div className="text-left rtl:text-right flex-1 min-w-0">
                      <p className="font-medium truncate">{pdfFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(pdfFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePdfFileChange(null)}
                    disabled={isSaving}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">
                    {t('admin:catalogs.dialog.pdfUploadText')}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {t('admin:catalogs.dialog.pdfUploadHint')}
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfFileChange(file);
                    }}
                    disabled={isSaving}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                    disabled={isSaving}
                  >
                    {t('admin:catalogs.dialog.selectFile')}
                  </Button>
                </div>
              )}
            </div>
            {pdfError && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {pdfError}
              </p>
            )}
            {isEditMode && !pdfFile && (
              <p className="text-xs text-muted-foreground text-left rtl:text-right">
                {t('admin:catalogs.dialog.pdfEditHint')}
              </p>
            )}
          </div>

          {/* Thumbnail Image Upload */}
          <div className="space-y-2">
            <Label className="text-left rtl:text-right block">
              {t('admin:catalogs.dialog.thumbnail')} {!isEditMode && '*'}
            </Label>
            <div
              onDragOver={handleThumbnailDragOver}
              onDragLeave={handleThumbnailDragLeave}
              onDrop={handleThumbnailDrop}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${isDraggingThumbnail ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${thumbnailError ? 'border-destructive' : ''}
                ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
              `}
            >
              {thumbnailPreview ? (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-32 w-32 object-cover rounded-lg border mx-auto"
                    />
                    {thumbnailFile && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleThumbnailFileChange(null)}
                        disabled={isSaving}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {thumbnailFile && (
                    <div className="text-sm">
                      <p className="font-medium truncate">{thumbnailFile.name}</p>
                      <p className="text-muted-foreground">
                        {formatFileSize(thumbnailFile.size)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">
                    {t('admin:catalogs.dialog.thumbnailUploadText')}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {t('admin:catalogs.dialog.thumbnailUploadHint')}
                  </p>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailFileChange(file);
                    }}
                    disabled={isSaving}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('thumbnail-upload')?.click()}
                    disabled={isSaving}
                  >
                    {t('admin:catalogs.dialog.selectFile')}
                  </Button>
                </div>
              )}
            </div>
            {thumbnailError && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {thumbnailError}
              </p>
            )}
            {isEditMode && !thumbnailFile && thumbnailPreview && (
              <p className="text-xs text-muted-foreground text-left rtl:text-right">
                {t('admin:catalogs.dialog.thumbnailEditHint')}
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {isSaving && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('admin:catalogs.dialog.uploading')}
                </span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              {t('admin:catalogs.dialog.cancel')}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving
                ? t('admin:catalogs.dialog.saving')
                : t('admin:catalogs.dialog.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogUploadDialog;
