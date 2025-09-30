"use client";

import { useEffect, useState } from 'react';
import { useUserPreferences as useUserPreferencesStore, TimeRange, DateRange } from '@/lib/store';

// Re-export types
export type { TimeRange, DateRange };

// Safe wrapper for useUserPreferences that handles SSR
export function useUserPreferences() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const store = useUserPreferencesStore();

  // Return safe defaults during SSR
  if (!isClient) {
    return {
      userId: null,
      username: '',
      currency: 'USD',
      theme: 'system' as const,
      initialized: false,
      timezone: 'UTC',
      dashboardLayout: null,
      timeRange: 'this-month' as const,
      customDateRange: undefined,
      alertThresholds: [],
      sectionVisibility: [],
      setUserId: () => {},
      setUsername: () => {},
      setCurrency: () => {},
      setTheme: () => {},
      syncWithDatabase: async () => {},
      setInitialized: () => {},
      resetPreferences: () => {},
      setTimezone: () => {},
      setDashboardLayout: () => {},
      setTimeRange: () => {},
      setAlertThresholds: () => {},
      setSectionVisibility: () => {},
    };
  }

  return store;
}