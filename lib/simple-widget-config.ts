import { Widget } from '@/lib/store';
import { 
  EnhancedStatsWidget,
  EnhancedBudgetWidget
} from '@/components/ui/dashboard-widgets';
import React from 'react';
import { DollarSign, Target } from 'lucide-react';

export const SIMPLE_WIDGET_CONFIG: Widget[] = [
  {
    id: 'enhanced-stats',
    type: 'enhanced-stats',
    title: 'Quick Stats',
    description: 'Enhanced financial overview with beautiful design',
    icon: React.createElement(DollarSign, { className: 'h-4 w-4' }),
    component: EnhancedStatsWidget,
    isVisible: true,
    position: 0,
    size: 'medium',
    settings: {}
  },
  {
    id: 'enhanced-budget',
    type: 'enhanced-budget',
    title: 'Budget Progress',
    description: 'Enhanced budget tracking with status indicators',
    icon: React.createElement(Target, { className: 'h-4 w-4' }),
    component: EnhancedBudgetWidget,
    isVisible: true,
    position: 1,
    size: 'medium',
    settings: {}
  }
];

export function getSimpleDefaultLayout() {
  return {
    widgets: SIMPLE_WIDGET_CONFIG,
    columns: 2
  };
}