import { Widget, WidgetLayout } from '@/lib/store';
import {
  QuickStatsWidget,
  BudgetProgressWidget,
  RecentTransactionsWidget,
  MonthlySummaryWidget,
  CategoryBreakdownWidget
} from '@/components/ui/dashboard-widgets';
import React from 'react';
import { 
  DollarSign, 
  Target, 
  Activity, 
  Calendar, 
  PieChart 
} from 'lucide-react';

export const DEFAULT_WIDGET_CONFIG: Widget[] = [
  {
    id: 'quick-stats-default',
    type: 'quick-stats',
    title: 'Quick Stats',
    description: 'Overview of income, expenses, and balance',
    icon: React.createElement(DollarSign, { className: 'h-4 w-4' }),
    component: QuickStatsWidget,
    isVisible: true,
    position: 0,
    size: 'medium',
    settings: {}
  },
  {
    id: 'budget-progress-default',
    type: 'budget-progress',
    title: 'Budget Progress',
    description: 'Track your monthly budget usage',
    icon: React.createElement(Target, { className: 'h-4 w-4' }),
    component: BudgetProgressWidget,
    isVisible: true,
    position: 1,
    size: 'medium',
    settings: {}
  },
  {
    id: 'recent-transactions-default',
    type: 'recent-transactions',
    title: 'Recent Transactions',
    description: 'Your latest financial activity',
    icon: React.createElement(Activity, { className: 'h-4 w-4' }),
    component: RecentTransactionsWidget,
    isVisible: true,
    position: 2,
    size: 'large',
    settings: {}
  },
  {
    id: 'monthly-summary-default',
    type: 'monthly-summary',
    title: 'Monthly Summary',
    description: 'Current month financial overview',
    icon: React.createElement(Calendar, { className: 'h-4 w-4' }),
    component: MonthlySummaryWidget,
    isVisible: false,
    position: 3,
    size: 'medium',
    settings: {}
  },
  {
    id: 'category-breakdown-default',
    type: 'category-breakdown',
    title: 'Category Breakdown',
    description: 'Top spending categories',
    icon: React.createElement(PieChart, { className: 'h-4 w-4' }),
    component: CategoryBreakdownWidget,
    isVisible: false,
    position: 4,
    size: 'medium',
    settings: {}
  }
];

export const AVAILABLE_WIDGETS: Widget[] = [
  {
    id: 'quick-stats',
    type: 'quick-stats',
    title: 'Quick Stats',
    description: 'Overview of income, expenses, and balance',
    icon: React.createElement(DollarSign, { className: 'h-4 w-4' }),
    component: QuickStatsWidget,
    isVisible: true,
    position: 0,
    size: 'medium',
    settings: {}
  },
  {
    id: 'budget-progress',
    type: 'budget-progress',
    title: 'Budget Progress',
    description: 'Track your monthly budget usage',
    icon: React.createElement(Target, { className: 'h-4 w-4' }),
    component: BudgetProgressWidget,
    isVisible: true,
    position: 0,
    size: 'medium',
    settings: {}
  },
  {
    id: 'recent-transactions',
    type: 'recent-transactions',
    title: 'Recent Transactions',
    description: 'Your latest financial activity',
    icon: React.createElement(Activity, { className: 'h-4 w-4' }),
    component: RecentTransactionsWidget,
    isVisible: true,
    position: 0,
    size: 'large',
    settings: {}
  },
  {
    id: 'monthly-summary',
    type: 'monthly-summary',
    title: 'Monthly Summary',
    description: 'Current month financial overview',
    icon: React.createElement(Calendar, { className: 'h-4 w-4' }),
    component: MonthlySummaryWidget,
    isVisible: true,
    position: 0,
    size: 'medium',
    settings: {}
  },
  {
    id: 'category-breakdown',
    type: 'category-breakdown',
    title: 'Category Breakdown',
    description: 'Top spending categories',
    icon: React.createElement(PieChart, { className: 'h-4 w-4' }),
    component: CategoryBreakdownWidget,
    isVisible: true,
    position: 0,
    size: 'medium',
    settings: {}
  }
];

export function getDefaultLayout() {
  return {
    widgets: DEFAULT_WIDGET_CONFIG,
    columns: 3
  };
}