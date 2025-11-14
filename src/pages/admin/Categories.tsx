import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/layouts/AdminLayout';
import CategoryDialog from '@/components/admin/CategoryDialog';
import { useCategoryMutations } from '@/hooks/useCategoryMutations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FolderPlus, Pencil, Trash2, FolderOpen, AlertCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import type { Category } from '@/types/database';
import { DataTableSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/EmptyState';

/**
 * Categories Admin Page
 * Manages product categories with CRUD operations
 */
const Categories = () => {
  const { t: translate, i18n } = useTranslation();
  const t = translate as any;
  const isRTL = i18n.language === 'ar';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  // Use the category mutations hook
  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations();

  // Fetch categories from Supabase
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Category[];
    },
  });

  // Format date based on language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = isRTL ? ar : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  };

  // Handle delete button click
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      deleteCategory.mutate(categoryToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        },
      });
    }
  };

  // Handle edit button click
  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category);
    setCategoryDialogOpen(true);
  };

  // Handle add category button click
  const handleAddClick = () => {
    setCategoryToEdit(null);
    setCategoryDialogOpen(true);
  };

  // Handle category save (create or update)
  const handleCategorySave = async (data: {
    name_en: string;
    name_ar: string;
    slug: string;
  }) => {
    if (categoryToEdit) {
      // Update existing category
      await updateCategory.mutateAsync(
        { id: categoryToEdit.id, data },
        {
          onSuccess: () => {
            setCategoryDialogOpen(false);
            setCategoryToEdit(null);
          },
        }
      );
    } else {
      // Create new category
      await createCategory.mutateAsync(data, {
        onSuccess: () => {
          setCategoryDialogOpen(false);
          setCategoryToEdit(null);
        },
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('admin:categories.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('admin:categories.description')}</p>
          </div>
          <Button onClick={handleAddClick} className="gap-2">
            <FolderPlus className="h-4 w-4" />
            {t('admin:categories.addCategory')}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('admin:categories.loadError')}</AlertDescription>
          </Alert>
        )}

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin:categories.tableTitle')}</CardTitle>
            <CardDescription>
              {categories && categories.length > 0
                ? t('admin:categories.tableDescription', { count: categories.length })
                : t('admin:categories.tableDescriptionEmpty')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // Loading skeleton
              <DataTableSkeleton rows={5} columns={5} />
            ) : categories && categories.length > 0 ? (
              // Categories table
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin:categories.table.nameEn')}</TableHead>
                      <TableHead>{t('admin:categories.table.nameAr')}</TableHead>
                      <TableHead>{t('admin:categories.table.slug')}</TableHead>
                      <TableHead>{t('admin:categories.table.createdAt')}</TableHead>
                      <TableHead className="text-right rtl:text-left">
                        {t('admin:categories.table.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name_en}</TableCell>
                        <TableCell className="font-medium">{category.name_ar}</TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-sm">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(category.created_at)}
                        </TableCell>
                        <TableCell className="text-right rtl:text-left">
                          <div className="flex items-center justify-end rtl:justify-start gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(category)}
                              title={t('admin:categories.editCategory')}
                              disabled={updateCategory.isPending || deleteCategory.isPending}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(category)}
                              title={t('admin:categories.deleteCategory')}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={updateCategory.isPending || deleteCategory.isPending}
                            >
                              {deleteCategory.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              // Empty state
              <EmptyState
                icon={FolderOpen}
                title={t('admin:categories.emptyState.title')}
                description={t('admin:categories.emptyState.description')}
                action={{
                  label: t('admin:categories.addCategory'),
                  onClick: handleAddClick,
                  icon: FolderPlus,
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Category Dialog (Create/Edit) */}
        <CategoryDialog
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
          category={categoryToEdit}
          onSave={handleCategorySave}
          isSaving={createCategory.isPending || updateCategory.isPending}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin:categories.deleteDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('admin:categories.deleteDialog.description', {
                  name: categoryToDelete
                    ? isRTL
                      ? categoryToDelete.name_ar
                      : categoryToDelete.name_en
                    : '',
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteCategory.isPending}>
                {t('admin:categories.deleteDialog.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteCategory.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteCategory.isPending
                  ? t('admin:categories.deleteDialog.deleting')
                  : t('admin:categories.deleteDialog.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default Categories;
