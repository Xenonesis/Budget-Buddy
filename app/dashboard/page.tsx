'use client';

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import {
  formatCurrency,
  formatDate,
  getFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS,
  isOnline,
  syncOfflineChanges,
} from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WidgetLayout } from '@/lib/store';
import { useUserPreferences, TimeRange, DateRange } from '@/hooks/use-user-preferences';
import { SIMPLE_WIDGET_CONFIG, getSimpleDefaultLayout } from '@/lib/simple-widget-config';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FastDashboardSkeleton } from '@/components/ui/fast-skeleton';
import { TimeRangeSelector } from '@/components/ui/time-range-selector';
import { FastDashboardService } from '@/lib/fast-dashboard-service';

// Lazy load heavy chart components for faster initial render
const EnhancedExpensePieChart = dynamic(
  () =>
    import('@/components/dashboard/charts/enhanced-expense-pie-chart').then(
      (mod) => mod.EnhancedExpensePieChart
    ),
  { ssr: false, loading: () => <div className="h-80 rounded-xl fast-skeleton" /> }
);

const MonthlySpendingTrend = dynamic(
  () =>
    import('@/components/dashboard/charts/monthly-spending-trend').then(
      (mod) => mod.MonthlySpendingTrend
    ),
  { ssr: false, loading: () => <div className="h-80 rounded-xl fast-skeleton" /> }
);

// Lazy load below-the-fold components
const RecentTransactions = dynamic(
  () => import('@/components/dashboard/recent-transactions').then((mod) => mod.RecentTransactions),
  { ssr: true, loading: () => <div className="h-64 rounded-xl fast-skeleton" /> }
);

const CategoryInsights = dynamic(
  () => import('@/components/dashboard/category-insights').then((mod) => mod.CategoryInsights),
  { ssr: true, loading: () => <div className="h-48 rounded-xl fast-skeleton" /> }
);

const PremiumMetricsSection = dynamic(
  () =>
    import('@/components/dashboard/premium-metrics-section').then(
      (mod) => mod.PremiumMetricsSection
    ),
  { ssr: true, loading: () => <div className="h-32 rounded-xl fast-skeleton" /> }
);

const WidgetSystem = dynamic(
  () => import('@/components/ui/widget-system').then((mod) => mod.WidgetSystem),
  { ssr: true, loading: () => <div className="h-48 rounded-xl fast-skeleton" /> }
);

const AlertNotificationSystem = dynamic(
  () =>
    import('@/components/ui/alert-notification-system').then((mod) => mod.AlertNotificationSystem),
  { ssr: false }
);

const MonthlyBudgetOverview = dynamic(
  () => import('@/components/ui/monthly-budget-overview').then((mod) => mod.MonthlyBudgetOverview),
  { ssr: true, loading: () => <div className="h-[500px] rounded-xl fast-skeleton" /> }
);

// Validation function to clean up duplicate widgets
function validateAndCleanLayout(layout: WidgetLayout): WidgetLayout {
  const allowedTypes = ['enhanced-stats', 'enhanced-budget'];
  const seenTypes = new Set<string>();

  const cleanedWidgets = layout.widgets.filter((widget) => {
    // Only allow widgets that are in our simple config
    if (!allowedTypes.includes(widget.type)) {
      return false;
    }

    // Remove duplicates
    if (seenTypes.has(widget.type)) {
      return false;
    }

    seenTypes.add(widget.type);
    return true;
  });

  return {
    widgets: cleanedWidgets,
    columns: Math.min(layout.columns || 2, 2), // Ensure max 2 columns
  };
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: Transaction[];
  monthlyData: { name: string; income: number; expense: number; transactionCount?: number }[];
  categoryData: { name: string; value: number; color: string }[];
  topCategories: { name: string; count: number; total: number; color: string }[];
  previousYearData?: {
    year: number;
    monthlyData: any[];
    totalSpending: number;
    averageMonthlySpending: number;
  };
}

// Enhanced colors for better visualization
const COLORS = [
  '#DFFF00', // Chartreuse
  '#FF3366', // Sharp Red
  '#00E5FF', // Cyan
  '#FF9900', // Sharp Orange
  '#CC00FF', // Neon Purple
  '#00FF66', // Neon Green
  '#FF0099', // Hot Pink
  '#FFFF00', // Pure Yellow
  '#0066FF', // Sharp Blue
  '#FFFFFF', // Pure White
];

// Memoized chart components to prevent unnecessary re-renders
// Optimize the monthly data calculation with memoization and efficient date handling
function getMonthlyData(transactions: any[]) {
  // If no transactions, return empty array
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const now = new Date();
  const monthsMap: Record<
    string,
    { name: string; income: number; expense: number; balance: number; transactionCount: number }
  > = {};

  // Get the past 12 months in YYYY-MM format for better historical data
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('default', { month: 'short' });

    monthsMap[monthKey] = {
      name: monthName,
      income: 0,
      expense: 0,
      balance: 0, // Will calculate after summing income and expense
      transactionCount: 0,
    };
  }

  // Add transaction amounts to the respective months
  transactions.forEach((tx) => {
    if (!tx.date) return; // Skip if date is missing

    const monthKey = tx.date.substring(0, 7); // Get YYYY-MM part
    if (monthsMap[monthKey]) {
      // Parse amount to ensure it's a number
      const amount = Number(tx.amount) || 0;

      if (tx.type === 'income') {
        monthsMap[monthKey].income += amount;
      } else if (tx.type === 'expense') {
        monthsMap[monthKey].expense += amount;
      }
      // Count all transactions
      monthsMap[monthKey].transactionCount += 1;
    }
  });

  // Calculate balance for each month and convert to array
  const result = Object.values(monthsMap).map((month) => {
    month.balance = month.income - month.expense;
    return month;
  });

  // Sort by most recent month first, but only return months with data
  return result
    .reverse()
    .filter((month) => month.transactionCount > 0 || month.income > 0 || month.expense > 0);
}

// Optimize category data calculation with a single pass through transactions
function getCategoryData(transactions: any[]) {
  const colors = [
    '#FF3366', // Sharp Red
    '#00E5FF', // Cyan
    '#DFFF00', // Chartreuse
    '#FF9900', // Sharp Orange
    '#CC00FF', // Neon Purple
    '#00FF66', // Neon Green
    '#FF0099', // Hot Pink
    '#FFFF00', // Pure Yellow
    '#0066FF', // Sharp Blue
    '#FFFFFF', // Pure White
  ];

  // Only consider expenses for the category chart
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  if (expenseTransactions.length === 0) {
    return [];
  }

  // Use a map for O(1) lookup instead of repeated filtering
  const categorySums = new Map();

  // Single pass to calculate all category sums
  expenseTransactions.forEach((t) => {
    const category = t.category || 'Uncategorized';
    if (!categorySums.has(category)) {
      categorySums.set(category, 0);
    }
    categorySums.set(category, categorySums.get(category) + t.amount);
  });

  // Convert to array for chart data
  const result = Array.from(categorySums.entries()).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length],
  }));

  return result.sort((a, b) => b.value - a.value);
}

// Generate top categories by usage and spending - optimized to reduce iterations
const getTopCategories = (transactions: any[]) => {
  const colors = [
    '#FF3366', // Sharp Red
    '#00E5FF', // Cyan
    '#DFFF00', // Chartreuse
    '#FF9900', // Sharp Orange
    '#CC00FF', // Neon Purple
    '#00FF66', // Neon Green
    '#FF0099', // Hot Pink
    '#FFFF00', // Pure Yellow
    '#0066FF', // Sharp Blue
    '#FFFFFF', // Pure White
  ];

  // Only consider expenses for the category analysis
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  if (expenseTransactions.length === 0) {
    return [];
  }

  // Use reduce instead of forEach to minimize iterations
  const categories = expenseTransactions.reduce(
    (acc, t) => {
      const categoryName = t.category || 'Uncategorized';

      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, total: 0 };
      }

      acc[categoryName].count += 1;
      acc[categoryName].total += t.amount;

      return acc;
    },
    {} as Record<string, { count: number; total: number }>
  );

  return Object.keys(categories)
    .map((name, index) => ({
      name,
      count: categories[name].count,
      total: categories[name].total,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Get top 5 categories
};

// Use React.memo for optimized rendering of card components
const StatCard = memo(
  ({
    title,
    value,
    icon,
    className = '',
  }: {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    className?: string;
  }) => (
    <div className={cn(`p-4 border-4 border-foreground bg-paper shadow-[4px_4px_0px_hsl(var(--foreground))] ${className}`, 'transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_transparent]')}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground bg-foreground/5 px-2 py-1 inline-block mb-2 self-start border-2 border-foreground">{title}</h3>
          <p className="text-3xl font-mono font-black tracking-tight">{value}</p>
        </div>
        {icon && <div className="p-3 border-2 border-foreground bg-background text-foreground shadow-[2px_2px_0px_hsl(var(--foreground))]">{icon}</div>}
      </div>
    </div>
  )
);
StatCard.displayName = 'StatCard';

export default function DashboardPage() {
  const {
    dashboardLayout,
    setDashboardLayout,
    timeRange,
    customDateRange,
    sectionVisibility,
    setTimeRange,
  } = useUserPreferences();

  // Enhanced chart states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [drillDownData, setDrillDownData] = useState<any>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    recentTransactions: [],
    monthlyData: [],
    categoryData: [],
    topCategories: [],
  });
  const [enhancedMetrics, setEnhancedMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Enhanced chart interaction handlers
  const handleCategoryToggle = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }, []);

  const handleCategoryClick = useCallback((category: any) => {
    setDrillDownData({ type: 'category', data: category });
  }, []);

  const handleMonthClick = useCallback((month: string, year: number) => {
    setDrillDownData({ type: 'month', data: { month, year } });
  }, []);

  const handleYearClick = useCallback((year: number) => {
    setDrillDownData({ type: 'year', data: { year } });
  }, []);

  // Transform data for enhanced charts with drill-down filtering
  const enhancedChartData = useMemo(() => {
    // Apply drill-down filtering if active
    let filteredStats = stats;

    if (drillDownData) {
      switch (drillDownData.type) {
        case 'category':
          // Filter to show only selected category data
          filteredStats = {
            ...stats,
            categoryData: stats.categoryData.filter((cat) => cat.name === drillDownData.data.name),
            // Filter monthly data to show only this category's spending
            monthlyData: stats.monthlyData.map((month) => ({
              ...month,
              expense: month.expense * (drillDownData.data.value / stats.totalExpense) || 0,
            })),
          };
          break;
        case 'month':
          // Filter to show only selected month data
          const selectedMonthData = stats.monthlyData.find((month) =>
            month.name.includes(drillDownData.data.month)
          );
          if (selectedMonthData) {
            filteredStats = {
              ...stats,
              monthlyData: [selectedMonthData],
              totalExpense: selectedMonthData.expense,
              totalIncome: selectedMonthData.income,
            };
          }
          break;
        case 'year':
          // Show year-specific data (would need historical data from database)
          // For now, just show current data
          break;
      }
    }

    // Transform category data for enhanced pie chart
    const enhancedCategoryData = filteredStats.categoryData.map((category) => ({
      ...category,
      subcategories: [], // We'll populate this when we have subcategory data
    }));

    // Use real monthly data from database
    const monthlyTrendData = filteredStats.monthlyData.map((month) => {
      // Create category breakdown for this month
      const categoryBreakdown = filteredStats.categoryData.reduce(
        (acc, cat) => {
          // Use actual category proportions from database
          acc[cat.name] = month.expense * (cat.value / filteredStats.totalExpense) || 0;
          return acc;
        },
        {} as { [key: string]: number }
      );

      return {
        month: month.name,
        year: new Date().getFullYear(),
        totalSpending: month.expense,
        categoryBreakdown,
        transactionCount: month.transactionCount || 0,
      };
    });

    // Create yearly data for YoY comparison using real historical data
    const currentYear = new Date().getFullYear();
    const yearlyData = [
      {
        year: currentYear,
        monthlyData: monthlyTrendData,
        totalSpending: filteredStats.totalExpense,
        averageMonthlySpending: filteredStats.totalExpense / Math.max(monthlyTrendData.length, 1),
      },
      // Previous year data will be fetched from database separately
      ...(filteredStats.previousYearData ? [filteredStats.previousYearData] : []),
    ];

    return {
      categoryData: enhancedCategoryData,
      monthlyTrendData,
      yearlyData,
    };
  }, [stats, drillDownData]);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<WidgetLayout>(
    dashboardLayout || getSimpleDefaultLayout()
  );

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncData();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Check initial status
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to sync data with server when online
  const syncData = async () => {
    if (isOnline()) {
      try {
        // Attempt to sync any offline changes
        const syncResult = await syncOfflineChanges(supabase);
        if (syncResult.syncedCount > 0) {
          // If changes were synced, refresh data from server
          fetchData();
        }
      } catch (error) {
        console.error('Error syncing offline changes:', error);
      }
    }
  };

  // Fast data fetching with minimal database calls
  const fetchData = async () => {
    setLoading(true);

    try {
      // Quick cache check
      const cachedStats = getFromLocalStorage<DashboardStats>(STORAGE_KEYS.TRANSACTIONS);
      if (cachedStats && !isOnline()) {
        setStats(cachedStats);
        setIsOffline(true);
        setLoading(false);
        return;
      }

      // Get user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setLoading(false);
        return;
      }

      // Use fast dashboard service
      const fastStats = await FastDashboardService.getFastDashboardData(
        userData.user.id,
        timeRange
      );

      // Convert to expected format
      const newStats: DashboardStats = {
        totalIncome: fastStats.totalIncome,
        totalExpense: fastStats.totalExpense,
        balance: fastStats.balance,
        recentTransactions: fastStats.recentTransactions,
        monthlyData: fastStats.monthlyData,
        categoryData: fastStats.categoryData,
        topCategories: fastStats.topCategories,
      };

      // Cache and update state
      saveToLocalStorage(STORAGE_KEYS.TRANSACTIONS, newStats, 30); // Cache for 30 minutes
      setStats(newStats);
      setIsOffline(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when time range changes
  useEffect(() => {
    fetchData();
  }, [timeRange, customDateRange]);

  // Initialize layout if not set or invalid
  useEffect(() => {
    if (!dashboardLayout) {
      const defaultLayout = getSimpleDefaultLayout();
      setCurrentLayout(defaultLayout);
      setDashboardLayout(defaultLayout);
    } else {
      // Validate existing layout and remove duplicates
      const cleanLayout = validateAndCleanLayout(dashboardLayout);
      if (JSON.stringify(cleanLayout) !== JSON.stringify(dashboardLayout)) {
        console.log('Cleaned up duplicate widgets from saved layout');
        setCurrentLayout(cleanLayout);
        setDashboardLayout(cleanLayout);
      } else {
        setCurrentLayout(dashboardLayout);
      }
    }
  }, [dashboardLayout, setDashboardLayout]);

  const handleLayoutChange = (newLayout: WidgetLayout) => {
    setCurrentLayout(newLayout);
    setDashboardLayout(newLayout);
  };

  // Real budget data state
  const [realBudgetData, setRealBudgetData] = useState({
    budgetTotal: 0,
    budgetUsed: 0,
    budgetRemaining: 0,
  });

  // Fetch real budget data
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { RealBudgetService } = await import('@/lib/real-budget-service');
          const budgetSummary = await RealBudgetService.getBudgetSummary(userData.user.id);
          setRealBudgetData({
            budgetTotal: budgetSummary.totalBudget,
            budgetUsed: budgetSummary.totalSpent,
            budgetRemaining: budgetSummary.totalRemaining,
          });
        }
      } catch (error) {
        console.error('Error fetching budget data:', error);
      }
    };

    fetchBudgetData();
  }, [timeRange, customDateRange]);

  // Prepare widget data with real budget information
  const widgetData = {
    totalIncome: stats.totalIncome,
    totalExpense: stats.totalExpense,
    recentTransactions: stats.recentTransactions,
    budgetUsed: realBudgetData.budgetUsed,
    budgetTotal: realBudgetData.budgetTotal || stats.totalExpense * 1.2, // Fallback to 120% of current spending
    monthlyIncome: stats.totalIncome,
    monthlyExpense: stats.totalExpense,
    topCategories: stats.topCategories,
  };

  // Add passive event listeners for scroll and touch events with real functionality
  useEffect(() => {
    let pullToRefreshStartY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        pullToRefreshStartY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isPulling && window.scrollY === 0) {
        const currentY = e.touches[0].clientY;
        const pullDistance = currentY - pullToRefreshStartY;

        if (pullDistance > 100) {
          // Visual feedback for pull-to-refresh
          document.body.style.transform = `translateY(${Math.min(pullDistance - 100, 50)}px)`;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isPulling) {
        const currentY = e.changedTouches[0].clientY;
        const pullDistance = currentY - pullToRefreshStartY;

        document.body.style.transform = '';

        if (pullDistance > 150) {
          // Trigger refresh
          fetchData();
        }

        isPulling = false;
      }
    };

    const handleScroll = () => {
      // Auto-hide/show header on scroll for better mobile experience
      const header = document.querySelector('header');
      if (header) {
        if (window.scrollY > 100) {
          header.style.transform = 'translateY(-100%)';
        } else {
          header.style.transform = 'translateY(0)';
        }
      }
    };

    const options = { passive: true };
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);
    document.addEventListener('scroll', handleScroll, options);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('scroll', handleScroll);
      document.body.style.transform = '';
    };
  }, []);

  // Fast loading state
  if (loading) {
    return <FastDashboardSkeleton />;
  }

  // Enhanced error state
  if (error && !isOffline) {
    return (
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-6 lg:px-8 lg:py-8 max-w-screen-xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-red-100 p-4 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">{error}</p>
          <Button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 py-6 md:px-6 md:py-6 lg:px-8 lg:py-8 max-w-screen-xl"
      role="main"
      aria-label="Dashboard"
    >
      {/* Enhanced Brutalist Header */}
      <header className="mb-8 md:mb-10 w-full border-b-4 border-foreground pb-4 lg:pb-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center p-3 border-4 border-foreground bg-foreground text-background shadow-[4px_4px_0px_hsl(var(--primary))] shrink-0 hover:translate-x-1 hover:-translate-y-1 transition-transform">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-display font-black uppercase tracking-tight text-foreground"
                  tabIndex={0}
                >
                  Dashboard
                </h1>
                <p className="text-sm font-mono font-bold tracking-widest uppercase mt-1 px-1 bg-foreground text-background inline-block self-start" tabIndex={0}>
                  Financial Overview
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Time Range Selector */}
            <div className="order-2 sm:order-1">
              <TimeRangeSelector
                value={timeRange}
                customRange={customDateRange}
                onChange={setTimeRange}
                className="text-sm w-full sm:w-auto"
              />
            </div>

            {/* Status and Actions */}
            <div className="order-1 sm:order-2 flex items-center justify-between sm:justify-end gap-3">
              {/* Connection Status */}
              <div className="flex items-center">
                {isOffline ? (
                  <div
                    className="flex items-center text-background text-sm font-bold tracking-widest uppercase bg-amber-600 px-3 py-1.5 border-2 border-foreground shadow-[2px_2px_0px_hsl(var(--foreground))]"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="font-mono">Offline</span>
                  </div>
                ) : (
                  <div className="flex items-center text-foreground text-sm font-bold tracking-widest uppercase bg-green-500/20 px-3 py-1.5 border-2 border-green-500 shadow-[2px_2px_0px_hsl(var(--green-500))]">
                    <div className="h-2 w-2 bg-green-500 mr-2 animate-pulse border border-foreground"></div>
                    <span className="font-mono text-green-600">Online</span>
                    {lastSynced && (
                      <span className="ml-2 text-foreground text-xs hidden lg:inline font-mono">
                        • {lastSynced}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Customize Button */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="shrink-0 border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background shadow-[2px_2px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:translate-x-1 hover:translate-y-1 rounded-none font-mono font-bold uppercase transition-all"
              >
                <Link href="/dashboard/customize" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" strokeWidth={3} />
                  <span className="hidden sm:inline tracking-widest">Customize</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Offline Sync Button */}
        {isOffline && (
          <div className="mt-4 p-4 border-4 border-amber-500 bg-amber-500/10 shadow-[4px_4px_0px_hsl(var(--amber-500))]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center text-foreground font-bold tracking-widest uppercase text-sm">
                <svg className="h-5 w-5 mr-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex flex-col">
                  <span>Viewing Cached Data</span>
                  <span className="text-xs font-mono font-medium opacity-80">Connect to sync latest information</span>
                </div>
              </div>
              <Button
                onClick={syncData}
                size="sm"
                variant="outline"
                className="shrink-0 border-2 border-amber-500 bg-amber-500/20 text-foreground hover:bg-amber-500 hover:text-black shadow-[2px_2px_0px_hsl(var(--amber-500))] hover:shadow-[0px_0px_0px_transparent] hover:translate-x-1 hover:translate-y-1 rounded-none font-mono font-bold uppercase transition-all"
                aria-label="Sync data when online"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Sync Now
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Enhanced Stats Cards with Real Data Only */}
      {sectionVisibility.find((s) => s.id === 'stats-cards')?.visible && (
        <section
          className="mb-8 md:mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="region"
          aria-label="Financial Summary"
        >
          {/* Total Income Card */}
          <div
            className="group rounded-xl border bg-card p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            tabIndex={0}
            aria-label="Total Income Summary"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <span className="font-semibold">Total Income</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400 mb-3">
              {stats.totalIncome > 0 ? formatCurrency(stats.totalIncome) : formatCurrency(0)}
            </div>
            <div className="flex items-center text-xs sm:text-sm space-x-2">
              {enhancedMetrics &&
              typeof enhancedMetrics.incomeGrowthRate === 'number' &&
              enhancedMetrics.incomeGrowthRate !== 0 ? (
                <>
                  {enhancedMetrics.incomeGrowthRate > 0 ? (
                    <TrendingUpIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${
                      enhancedMetrics.incomeGrowthRate > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {enhancedMetrics.incomeGrowthRate > 0 ? '+' : ''}
                    {Math.abs(enhancedMetrics.incomeGrowthRate).toFixed(1)}% vs last period
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground flex items-center">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  Current period
                </span>
              )}
            </div>
          </div>

          {/* Total Expenses Card */}
          <div
            className="group rounded-xl border bg-card p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            tabIndex={0}
            aria-label="Total Expenses Summary"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="m22 2-5 10-5-10z"></path>
                </svg>
              </div>
              <span className="font-semibold">Total Expenses</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-red-700 dark:text-red-400 mb-3">
              {stats.totalExpense > 0 ? formatCurrency(stats.totalExpense) : formatCurrency(0)}
            </div>
            <div className="flex items-center text-xs sm:text-sm space-x-2">
              {enhancedMetrics &&
              typeof enhancedMetrics.expenseGrowthRate === 'number' &&
              enhancedMetrics.expenseGrowthRate !== 0 ? (
                <>
                  {enhancedMetrics.expenseGrowthRate > 0 ? (
                    <TrendingUpIcon className="h-4 w-4 text-red-600" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-green-600" />
                  )}
                  <span
                    className={`font-medium ${
                      enhancedMetrics.expenseGrowthRate > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {enhancedMetrics.expenseGrowthRate > 0 ? '+' : ''}
                    {Math.abs(enhancedMetrics.expenseGrowthRate).toFixed(1)}% vs last period
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground flex items-center">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 0 0-8 0v4H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2z"
                    />
                  </svg>
                  Current period
                </span>
              )}
            </div>
          </div>

          {/* Current Balance Card */}
          <div
            className="group rounded-xl border bg-card p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
            tabIndex={0}
            aria-label="Current Balance Summary"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground mb-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                  stats.balance >= 0
                    ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-500'
                    : 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-500'
                } text-white`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <span className="font-semibold">Current Balance</span>
            </div>
            <div
              className={`text-2xl md:text-3xl font-bold mb-3 ${
                stats.balance >= 0
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-red-700 dark:text-red-400'
              }`}
              aria-live="polite"
            >
              {formatCurrency(Math.abs(stats.balance))}
              {stats.balance < 0 && <span className="text-sm ml-1">(deficit)</span>}
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-4 w-4"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                <span>As of {formatDate(new Date())}</span>
              </div>
              {enhancedMetrics && typeof enhancedMetrics.savingsRate === 'number' && (
                <div
                  className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    enhancedMetrics.savingsRate >= 20
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : enhancedMetrics.savingsRate >= 10
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Savings: {enhancedMetrics.savingsRate.toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Premium Metrics Summary Section */}
      {enhancedMetrics && sectionVisibility.find((s) => s.id === 'stats-cards')?.visible && (
        <section className="mb-8 md:mb-10" aria-label="Enhanced Financial Metrics">
          <PremiumMetricsSection
            metrics={{
              totalTransactions: enhancedMetrics.totalTransactions || 0,
              averageTransactionAmount: enhancedMetrics.averageTransactionAmount || 0,
              mostActiveDay: enhancedMetrics.mostActiveDay || 'N/A',
              mostActiveCategory: enhancedMetrics.mostActiveCategory || 'N/A',
              trends: {
                transactions: { value: 12, isPositive: true },
                avgAmount: { value: 8, isPositive: true },
                dayActivity: { value: 5, isPositive: false },
                categoryActivity: { value: 15, isPositive: true },
              },
            }}
          />
        </section>
      )}

      {/* Customizable Widgets Section */}
      {sectionVisibility.find((s) => s.id === 'widgets')?.visible && (
        <div className="mb-8 md:mb-10">
          <WidgetSystem
            layout={currentLayout}
            onLayoutChange={handleLayoutChange}
            isEditMode={false}
            onEditModeChange={() => {}}
            availableWidgets={SIMPLE_WIDGET_CONFIG}
            widgetData={widgetData}
          />
        </div>
      )}

      {/* Monthly Spending Trend Overview */}
      {sectionVisibility.find((s) => s.id === 'budget-overview')?.visible && (
        <div className="mb-8 md:mb-10">
          <div className="h-[500px]">
            <MonthlySpendingTrend
              data={enhancedChartData.monthlyTrendData}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              showYearOverYear={true}
              onMonthClick={handleMonthClick}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Enhanced Charts with Real Data and Interactive Features */}
      {sectionVisibility.find((s) => s.id === 'charts')?.visible && (
        <section
          className="mb-8 md:mb-10 space-y-6 md:space-y-8"
          role="region"
          aria-label="Financial Charts and Analytics"
        >
          {/* Enhanced Header with Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  Financial Analytics
                </h2>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                Visual insights into your spending patterns and financial trends
              </p>
            </div>

            {stats.categoryData.length > 0 && (
              <div className="flex items-center gap-3 ml-11 sm:ml-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-medium">Live Data</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/analytics">
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7h10v10"
                      />
                    </svg>
                    Advanced Analytics
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Enhanced Drill-down Filter */}
          {drillDownData && (
            <div className="rounded-xl border bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-4 border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground font-medium">Active Filter</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      {drillDownData.type === 'category' && `${drillDownData.data.name} Category`}
                      {drillDownData.type === 'month' &&
                        `${drillDownData.data.month} ${drillDownData.data.year}`}
                      {drillDownData.type === 'year' && `Year ${drillDownData.data.year}`}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDrillDownData(null)}
                  className="hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 text-blue-700 dark:text-blue-300"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear Filter
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Charts Grid with Multiple Visualizations */}
          {stats.categoryData.length > 0 ? (
            <div className="space-y-6">
              {/* Chart Metrics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Categories</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {stats.categoryData.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Avg/Month</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${(stats.totalExpense / Math.max(1, new Date().getMonth() + 1)).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Top Category</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate">
                        {stats.categoryData[0]?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Transactions</p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {stats.recentTransactions.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Charts Container with Enhanced Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enhanced Expense Pie Chart */}
                <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Spending by Category
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Click segments to drill down
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {stats.categoryData.length} categories
                    </div>
                  </div>
                  <div className="h-80 lg:h-96">
                    <EnhancedExpensePieChart
                      categoryData={enhancedChartData.categoryData}
                      onCategoryClick={handleCategoryClick}
                    />
                  </div>
                </div>

                {/* Monthly Spending Trend */}
                <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Monthly Trend</h3>
                        <p className="text-xs text-muted-foreground">Spending patterns over time</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard/analytics">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7h10v10"
                          />
                        </svg>
                      </Link>
                    </Button>
                  </div>
                  <div className="h-80 lg:h-96">
                    <MonthlySpendingTrend
                      data={enhancedChartData.monthlyTrendData}
                      onMonthClick={(month, year) =>
                        setDrillDownData({ type: 'month', data: { month, year } })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border rounded-xl p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <svg
                    className="h-10 w-10 text-blue-500 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="space-y-3 max-w-md">
                  <h3 className="text-xl font-semibold text-foreground">No Financial Data Yet</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Start tracking your finances by adding transactions. You&apos;ll see beautiful
                    charts and insights about your spending patterns, trends, and categories.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Link href="/dashboard/transactions/new">
                      <svg
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Your First Transaction
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/analytics">
                      <svg
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Recent Transactions with Enhanced UI */}
      {sectionVisibility.find((s) => s.id === 'recent-transactions')?.visible && (
        <RecentTransactions transactions={stats.recentTransactions} />
      )}

      {/* Category Insights Section - More responsive */}
      {sectionVisibility.find((s) => s.id === 'category-insights')?.visible && (
        <CategoryInsights topCategories={stats.topCategories} totalExpense={stats.totalExpense} />
      )}

      {/* Enhanced Performance and Accessibility Notice */}
      <div className="mt-8 md:mt-10 pt-6 border-t-4 border-foreground w-full mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-center text-xs font-mono font-bold uppercase tracking-widest text-foreground gap-4 bg-foreground/5 p-4 border-2 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 mr-2 animate-pulse border-2 border-foreground shadow-[2px_2px_0px_hsl(var(--green-500))]"></div>
            <span>Real-time Data</span>
          </div>
          <span className="hidden sm:inline text-foreground/30">|</span>
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Bank-grade Security</span>
          </div>
          <span className="hidden sm:inline text-foreground/30">|</span>
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Lightning Fast</span>
          </div>
        </div>
      </div>

      {/* Alert Notification System */}
      <AlertNotificationSystem />
    </div>
  );
}
