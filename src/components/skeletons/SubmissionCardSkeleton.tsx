import { Skeleton } from '@/components/ui/skeleton';

interface SubmissionCardSkeletonProps {
  count?: number;
}

/**
 * SubmissionCardSkeleton Component
 * 
 * Displays skeleton loaders for contact submission cards.
 * Shows placeholder for avatar, name, subject, and metadata.
 * 
 * @param count - Number of skeleton cards to display (default: 3)
 */
export const SubmissionCardSkeleton = ({ count = 3 }: SubmissionCardSkeletonProps) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};
