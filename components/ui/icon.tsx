/**
 * Professional Icon Component
 * Replaces emoji usage with consistent Lucide icons
 */

import { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/design-system';

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  strokeWidth?: number;
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
} as const;

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'md', className, strokeWidth = 2 }, ref) => {
    // Get the icon name from our mapping or use the provided name directly
    const iconName = (iconMap[name as IconName] || name) as keyof typeof Icons;
    const LucideIcon = Icons[iconName] as LucideIcon;

    if (!LucideIcon) {
      console.warn(`Icon "${name}" not found. Falling back to default.`);
      return <Icons.Circle className={cn(sizeMap[size], className)} ref={ref} />;
    }

    return (
      <LucideIcon className={cn(sizeMap[size], className)} strokeWidth={strokeWidth} ref={ref} />
    );
  }
);

Icon.displayName = 'Icon';

// Category-specific icon component with semantic colors
export function CategoryIcon({
  category,
  size = 'md',
  className,
}: {
  category: string;
  size?: IconProps['size'];
  className?: string;
}) {
  const categoryLower = category.toLowerCase();

  // Map categories to professional icons
  const categoryIconMap: Record<string, IconName> = {
    food: 'food',
    groceries: 'food',
    dining: 'food',
    restaurant: 'food',
    transport: 'transport',
    transportation: 'transport',
    car: 'transport',
    gas: 'transport',
    shopping: 'shopping',
    retail: 'shopping',
    entertainment: 'entertainment',
    movies: 'entertainment',
    health: 'health',
    medical: 'health',
    fitness: 'health',
    utilities: 'utilities',
    bills: 'utilities',
    income: 'income',
    salary: 'income',
    expense: 'expense',
    savings: 'savings',
    investment: 'investment',
  };

  const iconName = categoryIconMap[categoryLower] || 'other';

  return <Icon name={iconName} size={size} className={className} />;
}

// Financial status icon with color coding
export function StatusIcon({
  type,
  size = 'md',
  className,
}: {
  type: 'success' | 'warning' | 'error' | 'info';
  size?: IconProps['size'];
  className?: string;
}) {
  const colorMap = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return <Icon name={type} size={size} className={cn(colorMap[type], className)} />;
}
