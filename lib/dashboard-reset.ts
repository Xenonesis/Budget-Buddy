/**
 * Dashboard Layout Reset Utility
 * This script helps reset user dashboard layouts to remove duplicates
 */

import { supabase } from '@/lib/supabase';

export async function resetAllDashboardLayouts() {
  try {
    console.log('Starting dashboard layout reset...');
    
    // Reset all dashboard layouts to null, which will trigger default layout loading
    const { error } = await supabase
      .from('profiles')
      .update({ dashboard_layout: null })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all real profiles
    
    if (error) {
      console.error('Error resetting dashboard layouts:', error);
      return false;
    }
    
    console.log('Dashboard layouts reset successfully');
    return true;
  } catch (err) {
    console.error('Failed to reset dashboard layouts:', err);
    return false;
  }
}

export async function resetUserDashboardLayout(userId: string) {
  try {
    console.log(`Resetting dashboard layout for user: ${userId}`);
    
    const { error } = await supabase
      .from('profiles')
      .update({ dashboard_layout: null })
      .eq('id', userId);
    
    if (error) {
      console.error('Error resetting user dashboard layout:', error);
      return false;
    }
    
    console.log('User dashboard layout reset successfully');
    return true;
  } catch (err) {
    console.error('Failed to reset user dashboard layout:', err);
    return false;
  }
}

// Clear localStorage for current user
export function clearLocalDashboardData() {
  try {
    const keysToRemove = [
      'widget-layout',
      'dashboard-layout',
      'userPreferences',
      'dashboard-widgets'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Local dashboard data cleared');
    return true;
  } catch (err) {
    console.error('Failed to clear local dashboard data:', err);
    return false;
  }
}