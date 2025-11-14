# Skeleton Components

This directory contains reusable skeleton loader components that provide visual feedback during data loading states throughout the application.

## Components

### CatalogGridSkeleton

Displays skeleton loaders for catalog grid layouts.

**Usage:**
```tsx
import { CatalogGridSkeleton } from '@/components/skeletons';

<CatalogGridSkeleton count={6} />
```

**Props:**
- `count` (optional): Number of skeleton cards to display (default: 6)

**Use Cases:**
- Public catalogs page during initial data load
- Catalog search/filter operations

---

### DataTableSkeleton

Displays skeleton loaders for data tables with customizable rows and columns.

**Usage:**
```tsx
import { DataTableSkeleton } from '@/components/skeletons';

<DataTableSkeleton rows={5} columns={7} showThumbnail={true} />
```

**Props:**
- `rows` (optional): Number of skeleton rows (default: 5)
- `columns` (optional): Number of columns (default: 5)
- `showThumbnail` (optional): Show thumbnail in first column (default: false)

**Use Cases:**
- Admin catalogs table
- Admin categories table
- Admin contact submissions table

---

### StatCardSkeleton

Displays skeleton loader for statistics cards on the dashboard.

**Usage:**
```tsx
import { StatCardSkeleton } from '@/components/skeletons';

<StatCardSkeleton />
```

**Props:** None

**Use Cases:**
- Dashboard statistics cards during data load

---

### SubmissionCardSkeleton

Displays skeleton loaders for contact submission cards.

**Usage:**
```tsx
import { SubmissionCardSkeleton } from '@/components/skeletons';

<SubmissionCardSkeleton count={3} />
```

**Props:**
- `count` (optional): Number of skeleton cards (default: 3)

**Use Cases:**
- Dashboard recent submissions section
- Contact submissions list

---

## Design Principles

1. **Consistency**: All skeletons use the same base `Skeleton` component from shadcn/ui
2. **Flexibility**: Customizable props allow adaptation to different use cases
3. **Performance**: Lightweight components with minimal re-renders
4. **Accessibility**: Proper ARIA attributes inherited from base Skeleton component

## Implementation Pattern

```tsx
// 1. Import the skeleton component
import { CatalogGridSkeleton } from '@/components/skeletons';

// 2. Use in loading state
{isLoading ? (
  <CatalogGridSkeleton count={6} />
) : (
  // Actual content
)}
```

## Best Practices

1. **Match Layout**: Skeleton should closely match the actual content layout
2. **Appropriate Count**: Use realistic counts that match typical data volumes
3. **Consistent Timing**: Show skeletons immediately when loading starts
4. **Smooth Transitions**: Ensure smooth transition from skeleton to actual content

## Related Components

- `src/components/ui/skeleton.tsx` - Base skeleton component
- All skeleton components use Tailwind CSS for styling
- Compatible with dark mode via Tailwind's dark mode utilities
