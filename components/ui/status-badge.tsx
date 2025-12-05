/**
 * Status Badge Component
 * Professional status indicators with icons instead of emojis
 */

import { Badge } from './professional-badge';
import type { IconName } from './icon';

export type StatusType = 'income' | 'expense' | 'pending' | 'completed' | 'warning' | 'info';

interface StatusBadgeProps {
  type: StatusType;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { variant: any; icon: IconName; label?: string }> = {
  income: {
    variant: 'success',
    icon: 'income',
    label: 'Income',
  },
  expense: {
    variant: 'error',
    icon: 'expense',
    label: 'Expense',
  },
  pending: {
    variant: 'warning',
    icon: 'clock',
    label: 'Pending',
  },
  completed: {
    variant: 'success',
    icon: 'success',
    label: 'Completed',
  },
  warning: {
    variant: 'warning',
    icon: 'warning',
    label: 'Warning',
  },
  info: {
    variant: 'info',
    icon: 'info',
    label: 'Info',
  },
};

export function StatusBadge({ type, children, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[type];

  return (
    <Badge variant={config.variant} icon={config.icon} size={size}>
      {children || config.label}
    </Badge>
  );
}

// Financial metric badge
interface MetricBadgeProps {
  value: number;
  type: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export function MetricBadge({ value, type, trend, size = 'md' }: MetricBadgeProps) {
  const formatValue = () => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getTrendConfig = () => {
    if (!trend || trend === 'neutral') {
      return { variant: 'muted' as const, icon: 'minus' as IconName };
    }
    if (trend === 'up') {
      return { variant: 'success' as const, icon: 'income' as IconName };
    }
    return { variant: 'error' as const, icon: 'expense' as IconName };
  };

  const config = getTrendConfig();

  return (
    <Badge variant={config.variant} icon={config.icon} size={size}>
      {formatValue()}
    </Badge>
  );
}
