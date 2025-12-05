/**
 * Professional Badge Component
 * Modern, semantic badges for status, categories, etc.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './icon';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground border border-border',
        success:
          'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
        warning:
          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
        error:
          'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
        info: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        muted: 'bg-muted text-muted-foreground border border-border',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  icon?: IconName;
  iconPosition?: 'left' | 'right';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, iconPosition = 'left', children, ...props }, ref) => {
    return (
      <div className={cn(badgeVariants({ variant, size }), className)} ref={ref} {...props}>
        {icon && iconPosition === 'left' && <Icon name={icon} size="xs" />}
        {children}
        {icon && iconPosition === 'right' && <Icon name={icon} size="xs" />}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
