import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  /**
   * Icon to display (Lucide icon component)
   */
  icon: LucideIcon;
  
  /**
   * Title text for the empty state
   */
  title: string;
  
  /**
   * Description text explaining the empty state
   */
  description: string;
  
  /**
   * Optional call-to-action button
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  
  /**
   * Optional custom icon size (default: 16 = 4rem)
   */
  iconSize?: number;
}

/**
 * EmptyState Component
 * 
 * A reusable component for displaying empty states across the application.
 * Provides a consistent design with an icon, title, description, and optional CTA button.
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={FileText}
 *   title="No catalogs yet"
 *   description="Get started by uploading your first product catalog"
 *   action={{
 *     label: "Upload Catalog",
 *     onClick: handleUpload,
 *     icon: Upload
 *   }}
 * />
 * ```
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  iconSize = 16,
}: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <Icon 
        className={`h-${iconSize} w-${iconSize} text-muted-foreground mx-auto mb-4`}
        style={{ width: `${iconSize * 0.25}rem`, height: `${iconSize * 0.25}rem` }}
      />
      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
};
