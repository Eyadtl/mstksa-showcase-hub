import { Skeleton } from '@/components/ui/skeleton';

interface CatalogGridSkeletonProps {
  count?: number;
}

/**
 * CatalogGridSkeleton Component
 * 
 * Displays skeleton loaders for catalog grid during data fetching.
 * Shows placeholder cards with thumbnail and text areas.
 * 
 * @param count - Number of skeleton cards to display (default: 6)
 */
export const CatalogGridSkeleton = ({ count = 6 }: CatalogGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
};
