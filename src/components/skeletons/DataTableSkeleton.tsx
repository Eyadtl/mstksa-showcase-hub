import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableSkeletonProps {
  rows?: number;
  columns?: number;
  showThumbnail?: boolean;
}

/**
 * DataTableSkeleton Component
 * 
 * Displays skeleton loaders for data tables during data fetching.
 * Supports customizable number of rows and columns.
 * 
 * @param rows - Number of skeleton rows to display (default: 5)
 * @param columns - Number of columns (default: 5)
 * @param showThumbnail - Whether to show thumbnail column (default: false)
 */
export const DataTableSkeleton = ({
  rows = 5,
  columns = 5,
  showThumbnail = false,
}: DataTableSkeletonProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  {showThumbnail && colIndex === 0 ? (
                    <Skeleton className="h-16 w-16 rounded" />
                  ) : (
                    <Skeleton className="h-4 w-full" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
