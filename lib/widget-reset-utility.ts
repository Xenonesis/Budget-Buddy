/**
 * Utility functions to reset and fix widget layouts
 */

import { Widget, WidgetLayout } from '@/lib/store';
import { SIMPLE_WIDGET_CONFIG, getSimpleDefaultLayout } from '@/lib/simple-widget-config';
import { supabase } from '@/lib/supabase';

// Widget type to component mapping for validation
const VALID_WIDGET_TYPES = [
  'quick-stats',
  'budget-progress', 
  'recent-transactions',
  'monthly-summary',
  'category-breakdown',
  'simple-stats',
  'simple-budget',
  'enhanced-stats',
  'enhanced-budget'
];

/**
 * Validates if a widget layout has all required properties
 */
export function validateWidgetLayout(layout: any): layout is WidgetLayout {
  if (!layout || typeof layout !== 'object') return false;
  if (!Array.isArray(layout.widgets)) return false;
  if (typeof layout.columns !== 'number') return false;

  // Check if all widgets have required properties
  return layout.widgets.every((widget: any) => 
    widget.id && 
    widget.type && 
    VALID_WIDGET_TYPES.includes(widget.type) &&
    typeof widget.isVisible === 'boolean' &&
    typeof widget.position === 'number'
  );
}

/**
 * Fixes a widget layout by ensuring all widgets have proper component references
 */
export function fixWidgetLayout(layout: any): WidgetLayout {
  if (!validateWidgetLayout(layout)) {
    console.warn('Invalid widget layout detected, using default layout');
    return getSimpleDefaultLayout();
  }

  // Ensure all widgets have the required properties
  const fixedWidgets = layout.widgets.map((widget: any) => {
    // Find the widget config from SIMPLE_WIDGET_CONFIG
    const configWidget = SIMPLE_WIDGET_CONFIG.find(w => w.type === widget.type);
    
    return {
      ...widget,
      // Ensure component reference exists (will be resolved by component mapping)
      component: configWidget?.component || null,
      icon: configWidget?.icon || widget.icon,
      title: widget.title || configWidget?.title || widget.type,
      description: widget.description || configWidget?.description || '',
      size: widget.size || 'medium',
      settings: widget.settings || {}
    };
  });

  return {
    widgets: fixedWidgets,
    columns: layout.columns || 2
  };
}

/**
 * Resets the dashboard layout to default for the current user
 */
export async function resetDashboardLayout(userId: string): Promise<WidgetLayout> {
  const defaultLayout = getSimpleDefaultLayout();
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ dashboard_layout: defaultLayout })
      .eq('id', userId);

    if (error) {
      console.error('Error resetting dashboard layout:', error);
    }
  } catch (err) {
    console.error('Failed to reset dashboard layout:', err);
  }

  return defaultLayout;
}

/**
 * Helper function to clear localStorage widget data
 */
export function clearLocalStorageWidgets() {
  try {
    localStorage.removeItem('budgetBuddyDashboard');
    localStorage.removeItem('dashboardLayout');
  } catch (err) {
    console.error('Failed to clear local storage:', err);
  }
}