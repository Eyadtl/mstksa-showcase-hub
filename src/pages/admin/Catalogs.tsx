import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Upload, Pencil, Trash2, FileText, AlertCircle, Search, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import type { CatalogWithCategory, Category } from '@/types/database';
import CatalogUploadDialog from '@/components/admin/CatalogUploadDialog';
import { useCatalogMutations } from '@/hooks/useCatalogMutations';
import { DataTableSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/EmptyState';

/**
 * Catalogs Admin Page
 * Manages product catalogs with CRUD operations
 */
const Catalogs = () => {
  const { t: translate, i18n } = useTranslation();
  const t = translate as any;
  const isRTL = i18n.language === 'ar';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [catalogToDelete, setCatalogToDelete] = useState<CatalogWithCategory | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [catalogToEdit, setCatalogToEdit] = useState<CatalogWithCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get catalog mutations
  const { createCatalog, updateCatalog, deleteCatalog } = useCatalogMutations();

  // Fetch categories for filter dropdown
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

  // Fetch catalogs with category data using join query
  const { data: catalogs, isLoading, error } = useQuery<CatalogWithCategory[]>({
    queryKey: ['catalogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogs')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CatalogWithCategory[];
    },
  });

  // Filter catalogs based on search query and category
  const filteredCatalogs = useMemo(() => {
    if (!catalogs) return [];

    let filtered = catalogs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (catalog) =>
          catalog.title_en.toLowerCase().includes(query) ||
          catalog.title_ar.toLowerCase().includes(query) ||
          catalog.category.name_en.toLowerCase().includes(query) ||
          catalog.category.name_ar.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((catalog) => catalog.category_id === selectedCategory);
    }

    return filtered;
  }, [catalogs, searchQuery, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredCatalogs.length / itemsPerPage);
  const paginatedCatalogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCatalogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCatalogs, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Format date based on language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = isRTL ? ar : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle delete button click
  const handleDeleteClick = (catalog: CatalogWithCategory) => {
    setCatalogToDelete(catalog);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!catalogToDelete) return;

    await deleteCatalog.mutateAsync({
      id: catalogToDelete.id,
      pdf_url: catalogToDelete.pdf_url,
      thumbnail_url: catalogToDelete.thumbnail_url,
    });

    setDeleteDialogOpen(false);
    setCatalogToDelete(null);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    setCatalogToEdit(null);
    setUploadDialogOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (catalog: CatalogWithCategory) => {
    setCatalogToEdit(catalog);
    setUploadDialogOpen(true);
  };

  // Handle save catalog
  const handleSaveCatalog = async (data: {
    title_en: string;
    title_ar: string;
    category_id: string;
    pdf_file?: File;
    thumbnail_file?: File;
  }) => {
    if (catalogToEdit) {
      // Update existing catalog
      await updateCatalog.mutateAsync({
        id: catalogToEdit.id,
        title_en: data.title_en,
        title_ar: data.title_ar,
        category_id: data.category_id,
        pdf_file: data.pdf_file,
        thumbnail_file: data.thumbnail_file,
        existing_pdf_url: catalogToEdit.pdf_url,
        existing_thumbnail_url: catalogToEdit.thumbnail_url,
      });
    } else {
      // Create new catalog
      if (!data.pdf_file || !data.thumbnail_file) {
        throw new Error('PDF and thumbnail files are required for new catalogs');
      }

      await createCatalog.mutateAsync({
        title_en: data.title_en,
        title_ar: data.title_ar,
        category_id: data.category_id,
        pdf_file: data.pdf_file,
        thumbnail_file: data.thumbnail_file,
      });
    }

    setUploadDialogOpen(false);
    setCatalogToEdit(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('admin:catalogs.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('admin:catalogs.description')}</p>
          </div>
          <Button onClick={handleUploadClick} className="gap-2">
            <Upload className="h-4 w-4" />
            {t('admin:catalogs.uploadCatalog')}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('admin:catalogs.loadError')}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin:catalogs.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rtl:pl-3 rtl:pr-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder={t('admin:catalogs.filterByCategory')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin:catalogs.allCategories')}</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {isRTL ? category.name_ar : category.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Catalogs Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin:catalogs.tableTitle')}</CardTitle>
            <CardDescription>
              {filteredCatalogs && filteredCatalogs.length > 0
                ? t('admin:catalogs.tableDescription', { count: filteredCatalogs.length })
                : t('admin:catalogs.tableDescriptionEmpty')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // Loading skeleton
              <DataTableSkeleton rows={5} columns={7} showThumbnail={true} />
            ) : paginatedCatalogs && paginatedCatalogs.length > 0 ? (
              <>
                {/* Catalogs table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('admin:catalogs.table.thumbnail')}</TableHead>
                        <TableHead>{t('admin:catalogs.table.titleEn')}</TableHead>
                        <TableHead>{t('admin:catalogs.table.titleAr')}</TableHead>
                        <TableHead>{t('admin:catalogs.table.category')}</TableHead>
                        <TableHead>{t('admin:catalogs.table.fileSize')}</TableHead>
                        <TableHead>{t('admin:catalogs.table.createdAt')}</TableHead>
                        <TableHead className="text-right rtl:text-left">
                          {t('admin:catalogs.table.actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCatalogs.map((catalog) => (
                        <TableRow key={catalog.id}>
                          <TableCell>
                            <img
                              src={catalog.thumbnail_url}
                              alt={isRTL ? catalog.title_ar : catalog.title_en}
                              className="h-16 w-16 object-cover rounded border"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{catalog.title_en}</TableCell>
                          <TableCell className="font-medium">{catalog.title_ar}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {isRTL ? catalog.category.name_ar : catalog.category.name_en}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatFileSize(catalog.file_size)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(catalog.created_at)}
                          </TableCell>
                          <TableCell className="text-right rtl:text-left">
                            <div className="flex items-center justify-end rtl:justify-start gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(catalog)}
                                title={t('admin:catalogs.editCatalog')}
                                disabled={updateCatalog.isPending || deleteCatalog.isPending}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(catalog)}
                                title={t('admin:catalogs.deleteCatalog')}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={updateCatalog.isPending || deleteCatalog.isPending}
                              >
                                {deleteCatalog.isPending ? (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Empty state
              <EmptyState
                icon={FileText}
                title={t('admin:catalogs.emptyState.title')}
                description={t('admin:catalogs.emptyState.description')}
                action={{
                  label: t('admin:catalogs.uploadCatalog'),
                  onClick: handleUploadClick,
                  icon: Upload,
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin:catalogs.deleteDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('admin:catalogs.deleteDialog.description', {
                  name: catalogToDelete
                    ? isRTL
                      ? catalogToDelete.title_ar
                      : catalogToDelete.title_en
                    : '',
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteCatalog.isPending}>
                {t('admin:catalogs.deleteDialog.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteCatalog.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteCatalog.isPending
                  ? t('admin:catalogs.deleteDialog.deleting')
                  : t('admin:catalogs.deleteDialog.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Catalog Upload/Edit Dialog */}
        <CatalogUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          catalog={catalogToEdit}
          onSave={handleSaveCatalog}
          isSaving={createCatalog.isPending || updateCatalog.isPending}
        />
      </div>
    </AdminLayout>
  );
};

export default Catalogs;
