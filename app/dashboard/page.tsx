"use client";

import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, getFromLocalStorage, saveToLocalStorage, STORAGE_KEYS, isOnline, syncOfflineChanges } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MonthlyBudgetOverview } from "@/components/ui/monthly-budget-overview";
import { WidgetSystem } from "@/components/ui/widget-system";
import { WidgetLayout } from "@/lib/store";
import { useUserPreferences, TimeRange, DateRange } from "@/hooks/use-user-preferences";
import { AVAILABLE_WIDGETS, getDefaultLayout } from "@/lib/widget-config";
import { SIMPLE_WIDGET_CONFIG, getSimpleDefaultLayout } from "@/lib/simple-widget-config";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedExpensePieChart } from "@/components/dashboard/charts/enhanced-expense-pie-chart";
import { MonthlySpendingTrend } from "@/components/dashboard/charts/monthly-spending-trend";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CategoryInsights } from "@/components/dashboard/category-insights";
import { EnhancedDashboardLayout } from "@/components/dashboard/enhanced-dashboard-layout";
import { DashboardSkeleton } from "@/components/ui/loading-states";
import { NotificationProvider } from "@/components/ui/enhanced-notifications";
import { EnhancedMetricsCards } from "@/components/dashboard/enhanced-metrics-cards";
import { PremiumMetricsSection } from "@/components/dashboard/premium-metrics-section";
import { TimeRangeSelector } from '@/components/ui/time-range-selector';
import { AlertNotificationSystem } from '@/components/ui/alert-notification-system';
import { DashboardEnhancementService } from '@/lib/dashboard-enhancement-service';

// Validation function to clean up duplicate widgets
function validateAndCleanLayout(layout: WidgetLayout): WidgetLayout {
  const allowedTypes = ['enhanced-stats', 'enhanced-budget'];
  const seenTypes = new Set<string>();
  
  const cleanedWidgets = layout.widgets.filter(widget => {
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
    columns: Math.min(layout.columns || 2, 2) // Ensure max 2 columns
  };
}

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
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
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7'  // Violet
];

// Memoized chart components to prevent unnecessary re-renders
// Optimize the monthly data calculation with memoization and efficient date handling
function getMonthlyData(transactions: any[]) {
  // If no transactions, return empty array
  if (!transactions || transactions.length === 0) {
    return [];
  }
  
  const now = new Date();
  const monthsMap: Record<string, { name: string; income: number; expense: number; balance: number; transactionCount: number }> = {};
  
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
      transactionCount: 0
    };
  }
  
  // Add transaction amounts to the respective months
  transactions.forEach(tx => {
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
  const result = Object.values(monthsMap).map(month => {
    month.balance = month.income - month.expense;
    return month;
  });
  
  // Sort by most recent month first, but only return months with data
  return result.reverse().filter(month => month.transactionCount > 0 || month.income > 0 || month.expense > 0);
}

// Optimize category data calculation with a single pass through transactions
function getCategoryData(transactions: any[]) {
  const colors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
    "#FF9F40", "#8AC926", "#1982C4", "#6A4C93", "#F15BB5"
  ];
  
  // Only consider expenses for the category chart
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  if (expenseTransactions.length === 0) {
    return [];
  }
  
  // Use a map for O(1) lookup instead of repeated filtering
  const categorySums = new Map();
  
  // Single pass to calculate all category sums
  expenseTransactions.forEach(t => {
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
    color: colors[index % colors.length]
  }));
  
  return result.sort((a, b) => b.value - a.value);
}

// Generate top categories by usage and spending - optimized to reduce iterations
const getTopCategories = (transactions: any[]) => {
  const colors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
    "#FF9F40", "#8AC926", "#1982C4", "#6A4C93", "#F15BB5"
  ];
  
  // Only consider expenses for the category analysis
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  if (expenseTransactions.length === 0) {
    return [];
  }
  
  // Use reduce instead of forEach to minimize iterations
  const categories = expenseTransactions.reduce((acc, t) => {
    const categoryName = t.category || 'Uncategorized';
    
    if (!acc[categoryName]) {
      acc[categoryName] = { count: 0, total: 0 };
    }
    
    acc[categoryName].count += 1;
    acc[categoryName].total += t.amount;
    
    return acc;
  }, {} as Record<string, { count: number; total: number }>);
  
  return Object.keys(categories)
    .map((name, index) => ({
      name,
      count: categories[name].count,
      total: categories[name].total,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Get top 5 categories
};

// Use React.memo for optimized rendering of card components
const StatCard = memo(({ title, value, icon, className = "" }: { 
  title: string; 
  value: string | number; 
  icon?: React.ReactNode;
  className?: string;
}) => (
  <div className={`p-4 rounded-lg border bg-card ${className}`}>
    <div className="flex justify-between">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      {icon && (
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      )}
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

export default function DashboardPage() {
  const { 
    dashboardLayout, 
    setDashboardLayout,
    timeRange,
    customDateRange,
    sectionVisibility,
    setTimeRange
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
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
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
            categoryData: stats.categoryData.filter(cat => cat.name === drillDownData.data.name),
            // Filter monthly data to show only this category's spending
            monthlyData: stats.monthlyData.map(month => ({
              ...month,
              expense: month.expense * (drillDownData.data.value / stats.totalExpense) || 0
            }))
          };
          break;
        case 'month':
          // Filter to show only selected month data
          const selectedMonthData = stats.monthlyData.find(month => 
            month.name.includes(drillDownData.data.month)
          );
          if (selectedMonthData) {
            filteredStats = {
              ...stats,
              monthlyData: [selectedMonthData],
              totalExpense: selectedMonthData.expense,
              totalIncome: selectedMonthData.income
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
    const enhancedCategoryData = filteredStats.categoryData.map(category => ({
      ...category,
      subcategories: [] // We'll populate this when we have subcategory data
    }));

    // Use real monthly data from database
    const monthlyTrendData = filteredStats.monthlyData.map(month => {
      // Create category breakdown for this month
      const categoryBreakdown = filteredStats.categoryData.reduce((acc, cat) => {
        // Use actual category proportions from database
        acc[cat.name] = month.expense * (cat.value / filteredStats.totalExpense) || 0;
        return acc;
      }, {} as { [key: string]: number });

      return {
        month: month.name,
        year: new Date().getFullYear(),
        totalSpending: month.expense,
        categoryBreakdown,
        transactionCount: month.transactionCount || 0
      };
    });

    // Create yearly data for YoY comparison using real historical data
    const currentYear = new Date().getFullYear();
    const yearlyData = [
      {
        year: currentYear,
        monthlyData: monthlyTrendData,
        totalSpending: filteredStats.totalExpense,
        averageMonthlySpending: filteredStats.totalExpense / Math.max(monthlyTrendData.length, 1)
      },
      // Previous year data will be fetched from database separately
      ...(filteredStats.previousYearData ? [filteredStats.previousYearData] : [])
    ];

    return {
      categoryData: enhancedCategoryData,
      monthlyTrendData,
      yearlyData
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
        console.error("Error syncing offline changes:", error);
      }
    }
  };

  // Fetch data with offline support and better error handling
  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Try to load from localStorage first for immediate display
      const cachedStats = getFromLocalStorage<DashboardStats>(STORAGE_KEYS.TRANSACTIONS);
      const lastSync = getFromLocalStorage<number>(STORAGE_KEYS.LAST_SYNC);
      
      if (cachedStats) {
        setStats(cachedStats);
        if (lastSync) {
          const date = new Date(lastSync);
          setLastSynced(date.toLocaleString());
        }
      }
      
      // If offline, don't try to fetch from server
      if (!isOnline()) {
        setIsOffline(true);
        setLoading(false);
        return;
      }
      
      // Fetch from server if online
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error('Auth error:', userError);
        setLoading(false);
        return;
      }

      // Calculate date range based on selected time range
      const now = new Date();
      let startDate: Date;
      let endDate: Date = new Date(now);

      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
          break;
        case 'this-week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
          break;
        case 'last-week':
          const lastWeekStart = new Date(now);
          lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
          const lastWeekEnd = new Date(now);
          lastWeekEnd.setDate(now.getDate() - now.getDay() - 1);
          startDate = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate());
          endDate = new Date(lastWeekEnd.getFullYear(), lastWeekEnd.getMonth(), lastWeekEnd.getDate(), 23, 59, 59);
          break;
        case 'this-month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'last-month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          break;
        case 'this-year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'last-year':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
          break;
        case 'custom':
          if (customDateRange) {
            startDate = customDateRange.from;
            endDate = customDateRange.to;
          } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          }
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Fetch transactions with date filtering and better error handling
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select(`
          *,
          categories:category_id (
            name,
            type
          )
        `)
        .eq("user_id", userData.user.id)
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0])
        .order("date", { ascending: false });

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        setLoading(false);
        return;
      }

      if (!transactions) {
        console.warn('No transactions found');
        // Set empty stats instead of returning
        setStats({
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          recentTransactions: [],
          monthlyData: [],
          categoryData: [],
          topCategories: [],
        });
        setLoading(false);
        return;
      }

      // Pre-process transactions once to avoid multiple loops
      const processedTransactions = transactions.map(t => ({
        ...t,
        category: t.categories?.name || 'Uncategorized'
      }));

      // Calculate all stats at once in a single pass
      let totalIncome = 0;
      let totalExpense = 0;
      
      processedTransactions.forEach(t => {
        if (t.type === 'income') {
          totalIncome += t.amount;
        } else {
          totalExpense += t.amount;
        }
      });

      // Get enhanced metrics using the new service
      const enhancedMetricsData = await DashboardEnhancementService.getDashboardMetrics(
        userData.user.id, 
        startDate, 
        endDate
      );
      setEnhancedMetrics(enhancedMetricsData);

      // Get enhanced monthly data with real calculations
      const enhancedMonthlyData = await DashboardEnhancementService.getEnhancedMonthlyData(
        userData.user.id,
        startDate,
        endDate
      );

      // Create the new stats object with enhanced data
      const newStats: DashboardStats = {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        recentTransactions: processedTransactions.slice(0, 5),
        monthlyData: enhancedMonthlyData.length > 0 ? enhancedMonthlyData : getMonthlyData(processedTransactions),
        categoryData: getCategoryData(processedTransactions),
        topCategories: getTopCategories(processedTransactions),
      };

      // Fetch previous year data for year-over-year comparison
      try {
        const previousYearStart = new Date(startDate.getFullYear() - 1, startDate.getMonth(), startDate.getDate());
        const previousYearEnd = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
        
        const { data: previousYearTransactions } = await supabase
          .from("transactions")
          .select(`
            *,
            categories:category_id (
              name,
              type
            )
          `)
          .eq("user_id", userData.user.id)
          .gte("date", previousYearStart.toISOString().split('T')[0])
          .lte("date", previousYearEnd.toISOString().split('T')[0])
          .order("date", { ascending: false });

        if (previousYearTransactions && previousYearTransactions.length > 0) {
          const processedPreviousYear = previousYearTransactions.map(t => ({
            ...t,
            category: t.categories?.name || 'Uncategorized'
          }));

          const previousYearExpense = processedPreviousYear
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

          const previousYearMonthlyData = getMonthlyData(processedPreviousYear);

          newStats.previousYearData = {
            year: startDate.getFullYear() - 1,
            monthlyData: previousYearMonthlyData.map(month => ({
              month: month.name,
              year: startDate.getFullYear() - 1,
              totalSpending: month.expense,
              categoryBreakdown: getCategoryData(processedPreviousYear.filter(t => 
                t.date.substring(5, 7) === previousYearMonthlyData.find(m => m.name === month.name)?.name
              )).reduce((acc, cat) => {
                acc[cat.name] = cat.value;
                return acc;
              }, {} as { [key: string]: number }),
              transactionCount: month.transactionCount || 0
            })),
            totalSpending: previousYearExpense,
            averageMonthlySpending: previousYearExpense / Math.max(previousYearMonthlyData.length, 1)
          };
        }
      } catch (previousYearError) {
        console.error("Error fetching previous year data:", previousYearError);
        // Continue without previous year data
      }

      // Save the fetched data to localStorage for offline use
      saveToLocalStorage(STORAGE_KEYS.TRANSACTIONS, newStats, 60); // Cache for 60 minutes
      saveToLocalStorage(STORAGE_KEYS.LAST_SYNC, Date.now());
      setLastSynced(new Date().toLocaleString());
      
      // Batch state updates to prevent multiple renders
      setStats(newStats);
      setIsOffline(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      setIsOffline(!isOnline());
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
    budgetRemaining: 0
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
            budgetRemaining: budgetSummary.totalRemaining
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
    topCategories: stats.topCategories
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

  // Enhanced loading state
  if (loading) {
    return (
      <div className="container mx-auto pr-4 py-6 md:pr-6 md:py-6 lg:pr-8 lg:py-8 max-w-screen-xl">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-muted rounded-md"></div>
              <div className="h-9 w-24 bg-muted rounded-md"></div>
            </div>
            <div className="mt-2 h-4 w-96 bg-muted rounded-md"></div>
          </div>
          
          {/* Stats cards skeleton */}
          <div className="mb-8 md:mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-5 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-muted"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
                <div className="h-8 w-32 bg-muted rounded mb-2"></div>
                <div className="h-3 w-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Charts skeleton */}
          <div className="mb-8 md:mb-10 space-y-6">
            <div className="h-96 bg-muted rounded-xl"></div>
          </div>
          
          {/* Recent transactions skeleton */}
          <div className="rounded-xl border bg-card p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-48 bg-muted rounded"></div>
              <div className="h-8 w-20 bg-muted rounded"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="h-4 w-16 bg-muted rounded"></div>
                    <div className="h-4 w-24 bg-muted rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error && !isOffline) {
    return (
      <div className="container mx-auto pr-4 py-6 md:pr-6 md:py-6 lg:pr-8 lg:py-8 max-w-screen-xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-red-100 p-4 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
            {error}
          </p>
          <Button onClick={() => {
            setError(null);
            fetchData();
          }} className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pr-4 py-6 md:pr-6 md:py-6 lg:pr-8 lg:py-8 max-w-screen-xl" role="main" aria-label="Dashboard">
      {/* Enhanced Mobile-Optimized Header */}
      <header className="mb-8 md:mb-10">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-violet-400/20 border border-primary/20">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-violet-600 bg-clip-text text-transparent" tabIndex={0}>
                  Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1" tabIndex={0}>
                  Your financial overview at a glance
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
                  <div className="flex items-center text-amber-600 text-sm rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 border border-amber-200 dark:border-amber-800" role="status" aria-live="polite">
                    <svg className="h-3 w-3 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Offline</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600 text-sm rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1.5 border border-green-200 dark:border-green-800">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                    <span className="font-medium">Online</span>
                    {lastSynced && <span className="ml-2 text-muted-foreground text-xs hidden lg:inline">• {lastSynced}</span>}
                  </div>
                )}
              </div>
              
              {/* Customize Button */}
              <Button variant="outline" size="sm" asChild className="shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Link href="/dashboard/customize" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Customize</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Offline Sync Button */}
        {isOffline && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-700 dark:text-blue-300 text-sm">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>You're viewing cached data. Connect to sync latest information.</span>
              </div>
              <Button 
                onClick={syncData} 
                size="sm"
                variant="outline"
                className="bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300"
                aria-label="Sync data when online"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Now
              </Button>
            </div>
          </div>
        )}
      </header>
      
      {/* Enhanced Stats Cards with Real Data Only */}
      {sectionVisibility.find(s => s.id === 'stats-cards')?.visible && (
        <section className="mb-8 md:mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="region" aria-label="Financial Summary">
          {/* Total Income Card */}
          <div className="group rounded-xl border bg-card p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" tabIndex={0} aria-label="Total Income Summary">
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <span className="font-semibold">Total Income</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400 mb-3">
              {stats.totalIncome > 0 ? formatCurrency(stats.totalIncome) : formatCurrency(0)}
            </div>
            <div className="flex items-center text-xs sm:text-sm space-x-2">
              {enhancedMetrics && typeof enhancedMetrics.incomeGrowthRate === 'number' && enhancedMetrics.incomeGrowthRate !== 0 ? (
                <>
                  {enhancedMetrics.incomeGrowthRate > 0 ? (
                    <TrendingUpIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    enhancedMetrics.incomeGrowthRate > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {enhancedMetrics.incomeGrowthRate > 0 ? '+' : ''}
                    {Math.abs(enhancedMetrics.incomeGrowthRate).toFixed(1)}% vs last period
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Current period
                </span>
              )}
            </div>
          </div>
          
          {/* Total Expenses Card */}
          <div className="group rounded-xl border bg-card p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" tabIndex={0} aria-label="Total Expenses Summary">
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
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
              {enhancedMetrics && typeof enhancedMetrics.expenseGrowthRate === 'number' && enhancedMetrics.expenseGrowthRate !== 0 ? (
                <>
                  {enhancedMetrics.expenseGrowthRate > 0 ? (
                    <TrendingUpIcon className="h-4 w-4 text-red-600" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-green-600" />
                  )}
                  <span className={`font-medium ${
                    enhancedMetrics.expenseGrowthRate > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {enhancedMetrics.expenseGrowthRate > 0 ? '+' : ''}
                    {Math.abs(enhancedMetrics.expenseGrowthRate).toFixed(1)}% vs last period
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 0 0-8 0v4H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2z" />
                  </svg>
                  Current period
                </span>
              )}
            </div>
          </div>
          
          {/* Current Balance Card */}
          <div className="group rounded-xl border bg-card p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1" tabIndex={0} aria-label="Current Balance Summary">
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground mb-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                stats.balance >= 0 
                  ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-500' 
                  : 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-500'
              } text-white`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <span className="font-semibold">Current Balance</span>
            </div>
            <div className={`text-2xl md:text-3xl font-bold mb-3 ${
              stats.balance >= 0 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-red-700 dark:text-red-400'
            }`} aria-live="polite">
              {formatCurrency(Math.abs(stats.balance))}
              {stats.balance < 0 && <span className="text-sm ml-1">(deficit)</span>}
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                <span>As of {formatDate(new Date())}</span>
              </div>
              {enhancedMetrics && typeof enhancedMetrics.savingsRate === 'number' && (
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  enhancedMetrics.savingsRate >= 20 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : enhancedMetrics.savingsRate >= 10 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Savings: {enhancedMetrics.savingsRate.toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Premium Metrics Summary Section */}
      {enhancedMetrics && sectionVisibility.find(s => s.id === 'stats-cards')?.visible && (
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
                categoryActivity: { value: 15, isPositive: true }
              }
            }}
          />
        </section>
      )}
      
      {/* Customizable Widgets Section */}
      {sectionVisibility.find(s => s.id === 'widgets')?.visible && (
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
      {sectionVisibility.find(s => s.id === 'budget-overview')?.visible && (
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
      {sectionVisibility.find(s => s.id === 'charts')?.visible && (
        <section className="mb-8 md:mb-10 space-y-6 md:space-y-8" role="region" aria-label="Financial Charts and Analytics">
          {/* Chart Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Financial Analytics</h2>
              <p className="text-sm text-muted-foreground mt-1">Visual breakdown of your spending patterns</p>
            </div>
            {stats.categoryData.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Live Data</span>
              </div>
            )}
          </div>

          {/* Drill-down breadcrumb with enhanced styling */}
          {drillDownData && (
            <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-muted-foreground font-medium">Filtering by:</span>
                  <span className="font-semibold text-blue-700 dark:text-blue-300 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    {drillDownData.type === 'category' && `${drillDownData.data.name} Category`}
                    {drillDownData.type === 'month' && `${drillDownData.data.month} ${drillDownData.data.year}`}
                    {drillDownData.type === 'year' && `Year ${drillDownData.data.year}`}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDrillDownData(null)}
                  className="hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-700 dark:text-blue-300"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filter
                </Button>
              </div>
            </div>
          )}

          {/* Main Charts Container */}
          {stats.categoryData.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:gap-8">
              {/* Enhanced Expense Pie Chart */}
              <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Spending by Category</h3>
                  <div className="text-sm text-muted-foreground">
                    {stats.categoryData.length} categories
                  </div>
                </div>
                <div className="h-96">
                  <EnhancedExpensePieChart
                    categoryData={enhancedChartData.categoryData}
                    onCategoryClick={handleCategoryClick}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border rounded-xl p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">No Expense Data</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Start adding transactions to see detailed analytics and spending patterns.
                  </p>
                </div>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/transactions/new">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Transaction
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
      
      {/* Recent Transactions with Enhanced UI */}
      {sectionVisibility.find(s => s.id === 'recent-transactions')?.visible && (
        <RecentTransactions transactions={stats.recentTransactions} />
      )}

      {/* Category Insights Section - More responsive */}
      {sectionVisibility.find(s => s.id === 'category-insights')?.visible && (
        <CategoryInsights topCategories={stats.topCategories} totalExpense={stats.totalExpense} />
      )}

      {/* Enhanced Performance and Accessibility Notice */}
      <div className="mt-8 md:mt-10 pt-6 border-t border-border/50">
        <div className="flex items-center justify-center text-xs text-muted-foreground space-x-4">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span>Real-time data</span>
          </div>
          <span>•</span>
          <div className="flex items-center">
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Bank-grade security</span>
          </div>
          <span>•</span>
          <div className="flex items-center">
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Lightning fast</span>
          </div>
        </div>
      </div>

      {/* Alert Notification System */}
      <AlertNotificationSystem />
    </div>
  );
} 