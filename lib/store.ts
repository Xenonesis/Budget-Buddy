import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';
import { supabase } from './supabase';

// Define WidgetLayout interface here to avoid circular imports
export interface Widget {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  isVisible: boolean;
  position: number;
  size: 'small' | 'medium' | 'large';
  settings?: WidgetSettings;
}

export interface WidgetSettings {
  timeRange?: TimeRange;
  customDateRange?: DateRange;
  alertThresholds?: WidgetAlertThreshold[];
  refreshInterval?: number; // in minutes
  showTrend?: boolean;
  compactView?: boolean;
}

export interface WidgetAlertThreshold {
  id: string;
  type: 'budget' | 'spending' | 'balance' | 'category';
  category?: string;
  threshold: number;
  condition: 'above' | 'below' | 'equals';
  enabled: boolean;
}

export interface WidgetLayout {
  widgets: Widget[];
  columns: number;
}

// Import types for personalization
export type TimeRange = 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-year' | 'last-year' | 'custom';
export type ThemeType = 'light' | 'dark' | 'system';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AlertThreshold {
  id: string;
  type: 'budget' | 'spending' | 'balance' | 'category';
  category?: string;
  threshold: number;
  condition: 'above' | 'below' | 'equals';
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface DashboardSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  visible: boolean;
}

export interface UserPreferences {
  userId: string | null;
  username: string;
  currency: string; 
  theme: ThemeType;
  initialized: boolean;
  timezone: string;
  dashboardLayout: WidgetLayout | null;
  // New personalization settings
  timeRange: TimeRange;
  customDateRange?: DateRange;
  alertThresholds: AlertThreshold[];
  sectionVisibility: DashboardSection[];
  setUserId: (userId: string | null) => void;
  setUsername: (username: string) => void;
  setCurrency: (currency: string) => void;
  setTheme: (theme: ThemeType) => void;
  syncWithDatabase: () => Promise<void>;
  setInitialized: (initialized: boolean) => void;
  resetPreferences: () => void;
  setTimezone: (timezone: string) => void;
  setDashboardLayout: (layout: WidgetLayout) => void;
  // New personalization setters
  setTimeRange: (range: TimeRange, customRange?: DateRange) => void;
  setAlertThresholds: (thresholds: AlertThreshold[]) => void;
  setSectionVisibility: (sections: DashboardSection[]) => void;
}

// Safe way to access localStorage that works in both client and server contexts
const getDefaultCurrency = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('budget-currency') || 'USD';
  }
  return 'USD'; // Default for server-side rendering
}

const getDefaultTheme = () => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('budget-theme') as 'light' | 'dark' | 'system') || 'system';
  }
  return 'system'; // Default for server-side rendering
}

export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set, get) => ({
      userId: null,
      username: '',
      currency: getDefaultCurrency(),
      theme: getDefaultTheme(),
      initialized: false,
      timezone: 'UTC',
      dashboardLayout: null,
      // New personalization settings
      timeRange: 'this-month' as TimeRange,
      customDateRange: undefined,
      alertThresholds: [],
      sectionVisibility: [
        {
          id: 'stats-cards',
          title: 'Financial Summary Cards',
          description: 'Total income, expenses, and balance overview',
          icon: null,
          visible: true,
        },
        {
          id: 'charts',
          title: 'Charts & Analytics',
          description: 'Income vs expenses and category breakdown charts',
          icon: null,
          visible: true,
        },
        {
          id: 'budget-overview',
          title: 'Monthly Budget Overview',
          description: 'Budget progress and spending vs budget analysis',
          icon: null,
          visible: true,
        },
        {
          id: 'recent-transactions',
          title: 'Recent Transactions',
          description: 'Latest financial activity and transaction history',
          icon: null,
          visible: true,
        },
        {
          id: 'category-insights',
          title: 'Category Insights',
          description: 'Top spending categories and spending patterns',
          icon: null,
          visible: true,
        },
        {
          id: 'widgets',
          title: 'Custom Widgets',
          description: 'Personalized dashboard widgets and components',
          icon: null,
          visible: true,
        },
      ],
      setUserId: (userId: string | null) => set({ userId }),
      setUsername: (username: string) => set({ username }),
      setCurrency: (currency: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('budget-currency', currency); // Redundant storage for reliability
        }
        set({ currency });
      },
      setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),
      setInitialized: (initialized: boolean) => set({ initialized }),
      setTimezone: (timezone: string) => set({ timezone }),
      setDashboardLayout: (layout: WidgetLayout) => set({ dashboardLayout: layout }),
      // New personalization setters
      setTimeRange: (range: TimeRange, customRange?: DateRange) => set({
        timeRange: range,
        customDateRange: customRange
      }),
      setAlertThresholds: (thresholds: AlertThreshold[]) => set({ alertThresholds: thresholds }),
      setSectionVisibility: (sections: DashboardSection[]) => set({ sectionVisibility: sections }),
      resetPreferences: () => set({
        userId: null,
        username: '',
        currency: 'USD',
        theme: 'system',
        initialized: false,
        timezone: 'UTC',
        dashboardLayout: null,
        timeRange: 'this-month' as TimeRange,
        customDateRange: undefined,
        alertThresholds: [],
        sectionVisibility: [
          {
            id: 'stats-cards',
            title: 'Financial Summary Cards',
            description: 'Total income, expenses, and balance overview',
            icon: null,
            visible: true,
          },
          {
            id: 'charts',
            title: 'Charts & Analytics',
            description: 'Income vs expenses and category breakdown charts',
            icon: null,
            visible: true,
          },
          {
            id: 'budget-overview',
            title: 'Monthly Budget Overview',
            description: 'Budget progress and spending vs budget analysis',
            icon: null,
            visible: true,
          },
          {
            id: 'recent-transactions',
            title: 'Recent Transactions',
            description: 'Latest financial activity and transaction history',
            icon: null,
            visible: true,
          },
          {
            id: 'category-insights',
            title: 'Category Insights',
            description: 'Top spending categories and spending patterns',
            icon: null,
            visible: true,
          },
          {
            id: 'widgets',
            title: 'Custom Widgets',
            description: 'Personalized dashboard widgets and components',
            icon: null,
            visible: true,
          },
        ]
      }),
      syncWithDatabase: async () => {
        const { userId } = get();
        if (!userId) return;

        try {
          // Fetch user profile from database
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (error) {
            console.error('Error fetching user profile for sync:', error);
            
            // Attempt to fall back to auth metadata if profile fetch fails
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user?.user_metadata?.preferred_currency) {
              const preferredCurrency = userData.user.user_metadata.preferred_currency;
              
              // Update local store with auth metadata values
              set({
                username: userData.user.user_metadata?.name || get().username,
                currency: preferredCurrency,
                initialized: true
              });
              
              // Also update localStorage for redundancy
              if (typeof window !== 'undefined') {
                localStorage.setItem('budget-currency', preferredCurrency);
              }
            }
            
            return;
          }
          
          if (data) {
            // Default to USD if no currency is set
            const defaultCurrency = data.currency || 'USD';
            // Default to UTC if no timezone is set
            const defaultTimezone = data.timezone || 'UTC';
            
            // Update local store with database values
            set({
              username: data.name || get().username,
              currency: defaultCurrency,
              timezone: defaultTimezone,
              initialized: true
            });

            // Also update localStorage for redundancy
            if (typeof window !== 'undefined') {
              localStorage.setItem('budget-currency', defaultCurrency);
              console.log('Currency set in localStorage:', defaultCurrency);
            }

            // Update user metadata in auth to keep everything in sync
            await supabase.auth.updateUser({
              data: {
                name: data.name || get().username,
                preferred_currency: defaultCurrency,
                preferred_timezone: defaultTimezone
              }
            });
            
            console.log('User preferences synced from database');
          }
        } catch (error) {
          console.error('Error syncing user preferences with database:', error);
        }
      }
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (typeof window !== 'undefined') {
            return localStorage.getItem(name);
          }
          return null;
        },
        setItem: (name, value) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(name, value);
          }
        },
        removeItem: (name) => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(name);
          }
        },
      })),
      partialize: (state) => ({ 
        userId: state.userId,
        username: state.username, 
        currency: state.currency,
        theme: state.theme,
        initialized: state.initialized,
        timezone: state.timezone,
        dashboardLayout: state.dashboardLayout,
        timeRange: state.timeRange,
        customDateRange: state.customDateRange,
        alertThresholds: state.alertThresholds,
        sectionVisibility: state.sectionVisibility
      }),
    }
  )
);

// Initialize theme and keep in sync via next-themes. We still persist to localStorage for user prefs.
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('budget-theme') || useUserPreferences.getState().theme || 'system';
  localStorage.setItem('budget-theme', storedTheme);
}

// Update currency and theme in user profile when they change - CLIENT SIDE ONLY
if (typeof window !== 'undefined') {
  useUserPreferences.subscribe((state) => {
    if (state.currency) {
      localStorage.setItem('budget-currency', state.currency);
    }
    if (state.theme) {
      localStorage.setItem('budget-theme', state.theme);
      // Do not manually toggle the 'dark' class here; next-themes controls it
    }
  });
}

export const formatCurrency = (
  amount: number,
  currency?: string
) => {
  // Get from parameter, or get from store, or fallback to USD as last resort
  const currencyToUse = currency || useUserPreferences.getState().currency || 
    (typeof window !== 'undefined' ? localStorage.getItem('budget-currency') : null) || 'USD';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyToUse,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // If there's an invalid currency code, fall back to USD
    console.error('Error formatting currency:', error);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}; 