# EmptyState Component

A reusable component for displaying empty states across the application with a consistent design pattern.

## Features

- **Consistent Design**: Provides a uniform look and feel for all empty states
- **Flexible**: Supports custom icons, titles, descriptions, and optional CTAs
- **Accessible**: Uses semantic HTML and proper ARIA attributes
- **Responsive**: Works well on all screen sizes
- **i18n Ready**: Accepts translated strings for internationalization

## Usage

### Basic Empty State

```tsx
import { EmptyState } from '@/components/EmptyState';
import { FileText } from 'lucide-react';

<EmptyState
  icon={FileText}
  title="No catalogs found"
  description="Try adjusting your search or filter criteria"
/>
```

### Empty State with Call-to-Action

```tsx
import { EmptyState } from '@/components/EmptyState';
import { FolderOpen, FolderPlus } from 'lucide-react';

<EmptyState
  icon={FolderOpen}
  title="No categories yet"
  description="Get started by creating your first category to organize catalogs"
  action={{
    label: "Add Category",
    onClick: handleAddClick,
    icon: FolderPlus,
  }}
/>
```

### Custom Icon Size

```tsx
<EmptyState
  icon={MessageSquare}
  title="No messages"
  description="You don't have any messages yet"
  iconSize={12} // Smaller icon (3rem instead of default 4rem)
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `icon` | `LucideIcon` | Yes | - | Icon component from lucide-react |
| `title` | `string` | Yes | - | Main heading text |
| `description` | `string` | Yes | - | Descriptive text explaining the empty state |
| `action` | `object` | No | - | Optional CTA button configuration |
| `action.label` | `string` | Yes* | - | Button text (*required if action is provided) |
| `action.onClick` | `() => void` | Yes* | - | Button click handler (*required if action is provided) |
| `action.icon` | `LucideIcon` | No | - | Optional icon for the button |
| `iconSize` | `number` | No | `16` | Icon size in Tailwind units (16 = 4rem) |

## Implementation Locations

The EmptyState component is currently used in:

1. **Public Catalogs Page** (`src/pages/Catalogs.tsx`)
   - Shown when no catalogs match search/filter criteria
   - No CTA button (public page)

2. **Admin Categories Page** (`src/pages/admin/Categories.tsx`)
   - Shown when no categories exist
   - CTA: "Add Category" button

3. **Admin Catalogs Page** (`src/pages/admin/Catalogs.tsx`)
   - Shown when no catalogs exist
   - CTA: "Upload Catalog" button

4. **Admin Contact Submissions Page** (`src/pages/admin/ContactSubmissions.tsx`)
   - Shown when no submissions exist or no search results
   - No CTA button (submissions are user-generated)

## Design Guidelines

### When to Use

- When a data view has no items to display
- When search/filter results return no matches
- When a feature hasn't been used yet (onboarding)

### When NOT to Use

- For loading states (use skeletons instead)
- For error states (use Alert component instead)
- For temporary states that resolve quickly

### Best Practices

1. **Icon Selection**: Choose icons that clearly represent the missing content
   - `FileText` for documents/catalogs
   - `FolderOpen` for categories/folders
   - `MessageSquare` for messages/submissions
   - `Users` for user lists
   - `Package` for products

2. **Title**: Keep it short and descriptive
   - ✅ "No catalogs yet"
   - ✅ "No results found"
   - ❌ "There are currently no catalogs available in the system"

3. **Description**: Provide helpful context or next steps
   - ✅ "Get started by uploading your first product catalog"
   - ✅ "Try adjusting your search or filter criteria"
   - ❌ "No data"

4. **CTA Button**: Only include when there's a clear action
   - Include for admin pages where users can create content
   - Omit for public pages or user-generated content
   - Make the action specific and actionable

## Styling

The component uses Tailwind CSS classes and respects the application's theme:

- Icon: `text-muted-foreground` (adapts to light/dark mode)
- Title: `text-lg font-semibold` (prominent but not overwhelming)
- Description: `text-muted-foreground` (secondary text color)
- Spacing: `py-12` (generous vertical padding)
- Button: Uses the standard Button component with primary styling

## Accessibility

- Uses semantic HTML (`h3` for title, `p` for description)
- Icon has proper sizing for visibility
- Button follows standard accessibility patterns
- Text contrast meets WCAG AA standards

## Future Enhancements

Potential improvements for future iterations:

1. **Illustration Support**: Add support for custom SVG illustrations
2. **Animation**: Add subtle fade-in animation
3. **Multiple Actions**: Support for multiple CTA buttons
4. **Link Support**: Allow CTA to be a link instead of button
5. **Custom Styling**: Accept className prop for custom styling
6. **Variants**: Add preset variants (info, warning, success)
