import { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, AlertCircle, FileText } from "lucide-react";
import type { CatalogWithCategory, Category } from "@/types/database";
import { useLanguage } from "@/contexts/LanguageContext";
import { CatalogGridSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/EmptyState";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SkipNavigation from "@/components/SkipNavigation";
import { SEO } from "@/components/SEO";

// Lazy load PDFViewer component (only loaded when needed)
const PDFViewer = lazy(() => import("@/components/PDFViewer").then(module => ({ default: module.PDFViewer })));

const Catalogs = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogWithCategory | null>(null);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  
  // Ref to store scroll position
  const scrollPositionRef = useRef<number>(0);

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

  // Fetch catalogs with category information using join query
  const { data: catalogs, isLoading, error } = useQuery<CatalogWithCategory[]>({
    queryKey: ['public-catalogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogs')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CatalogWithCategory[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Filter catalogs based on search query and category
  const filteredCatalogs = useMemo(() => {
    if (!catalogs) return [];

    let filtered = catalogs;

    // Apply search filter by title and category
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
    if (selectedCategory !== "all") {
      filtered = filtered.filter((catalog) => catalog.category_id === selectedCategory);
    }

    return filtered;
  }, [catalogs, searchQuery, selectedCategory]);

  // Get catalog title in selected language
  const getCatalogTitle = (catalog: CatalogWithCategory): string => {
    return isRTL ? catalog.title_ar : catalog.title_en;
  };

  // Get category name in selected language
  const getCategoryName = (catalog: CatalogWithCategory): string => {
    return isRTL ? catalog.category.name_ar : catalog.category.name_en;
  };

  /**
   * Handle catalog thumbnail click - opens PDF viewer
   */
  const handleCatalogClick = (catalog: CatalogWithCategory) => {
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;
    
    // Set selected catalog and open viewer
    setSelectedCatalog(catalog);
    setIsPDFViewerOpen(true);
  };

  /**
   * Handle PDF viewer close - returns to catalog grid
   */
  const handleClosePDFViewer = () => {
    setIsPDFViewerOpen(false);
    setSelectedCatalog(null);
  };

  /**
   * Restore scroll position after PDF viewer closes
   */
  useEffect(() => {
    if (!isPDFViewerOpen && scrollPositionRef.current > 0) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
      }, 0);
    }
  }, [isPDFViewerOpen]);

  return (
    <div className="min-h-screen">
      <SEO
        title={t('seo.catalogs.title', { defaultValue: 'Product Catalogs' })}
        description={t('seo.catalogs.description', { defaultValue: 'Browse our comprehensive collection of steel product catalogs. Download detailed specifications, technical data, and product information for all our steel manufacturing solutions.' })}
        keywords={t('seo.catalogs.keywords', { defaultValue: 'steel catalogs, product specifications, steel products, technical data, manufacturing catalogs, steel documentation' })}
      />
      <SkipNavigation />
      <Navigation onContactClick={() => {}} />
      <main id="main-content" className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 brand-serif">
              {t('catalogs:title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('catalogs:subtitle')}
            </p>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>
                  {t('catalogs:error', { defaultValue: 'Failed to load catalogs. Please try again.' })}
                </AlertDescription>
              </Alert>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12" role="search" aria-label={t('catalogs:searchAndFilter')}>
              <div className="relative flex-1">
                <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder={t('catalogs:searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rtl:pl-3 rtl:pr-10"
                  aria-label={t('catalogs:searchPlaceholder')}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[240px]" aria-label={t('catalogs:filterByCategory')}>
                  <SelectValue placeholder={t('catalogs:filterByCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('catalogs:allCategories')}</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {isRTL ? category.name_ar : category.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          {/* Loading State */}
          {isLoading && <CatalogGridSkeleton count={6} />}

          {/* Catalog Grid */}
          {!isLoading && filteredCatalogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label={t('catalogs:catalogList')}>
              {filteredCatalogs.map((catalog) => (
                <article
                  key={catalog.id}
                  onClick={() => handleCatalogClick(catalog)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCatalogClick(catalog);
                    }
                  }}
                  className="group cursor-pointer bg-card rounded-xl border border-border hover:border-primary transition-smooth hover:shadow-red overflow-hidden"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${getCatalogTitle(catalog)} - ${getCategoryName(catalog)}`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={catalog.thumbnail_url}
                      alt={`${t('catalogs:thumbnailFor')} ${getCatalogTitle(catalog)}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-fast line-clamp-2">
                      {getCatalogTitle(catalog)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryName(catalog)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredCatalogs.length === 0 && (
            <EmptyState
              icon={FileText}
              title={t('catalogs:noCatalogs')}
              description={t('catalogs:noCatalogsDescription')}
            />
          )}
          </div>
        </div>
      </main>
      <Footer />

      {/* PDF Viewer Modal - Lazy loaded */}
      {selectedCatalog && (
        <Suspense fallback={null}>
          <PDFViewer
            pdfUrl={selectedCatalog.pdf_url}
            title={getCatalogTitle(selectedCatalog)}
            isOpen={isPDFViewerOpen}
            onClose={handleClosePDFViewer}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Catalogs;
