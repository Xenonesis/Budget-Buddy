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
import { useUserPreferences, TimeRange, DateRange } from "@/lib/store";
import { AVAILABLE_WIDGETS, getDefaultLayout } from "@/lib/widget-config";
import { SIMPLE_WIDGET_CONFIG, getSimpleDefaultLayout } from "@/lib/simple-widget-config";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedExpensePieChart } from "@/components/dashboard/charts/enhanced-expense-pie-chart";
import { MonthlySpendingTrend } from "@/components/dashboard/charts/monthly-spending-trend";
import { YearOverYearComparison } from "@/components/dashboard/charts/year-over-year-comparison";
import { IncomeExpenseChart } from "@/components/dashboard/charts/income-expense-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CategoryInsights } from "@/components/dashboard/category-insights";
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

  // Fetch data with offline support
  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Try to load from localStorage first for immediate display
      const cachedStats = getFromLocalStorage<DashboardStats>(STORAGE_KEYS.TRANSACTIONS);
      const lastSync = getFromLocalStorage<number>(STORAGE_KEYS.LAST_SYNC);
      
      if (cachedStats) {
        setStats(cachedStats);
        setLoading(false);
        
        if (lastSync) {
          const date = new Date(lastSync);
          setLastSynced(date.toLocaleString());
        }
      }
      
      // If offline, don't try to fetch from server
      if (!isOnline()) {
        setIsOffline(true);
        if (!cachedStats) {
          setLoading(false); // No cached data and offline
        }
        return;
      }
      
      // Fetch from server if online
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
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

      // Fetch transactions with date filtering
      const { data: transactions } = await supabase
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

      if (!transactions) {
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

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:p-6 lg:p-8 max-w-screen-xl" role="main" aria-label="Dashboard">
      {/* Mobile-optimized header with responsive spacing and gradient text */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold md:text-4xl bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent" tabIndex={0}>Dashboard</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/customize" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Customize
            </Link>
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2">
          <p className="text-sm md:text-base text-muted-foreground" tabIndex={0}>Welcome back! Here's an overview of your finances.</p>
          
          {/* Time Range Selector */}
          <div className="mt-3 sm:mt-0 sm:mr-4">
            <TimeRangeSelector
              value={timeRange}
              customRange={customDateRange}
              onChange={setTimeRange}
              className="text-sm"
            />
          </div>
          
          {/* Improved offline status indicator */}
          <div className="mt-3 sm:mt-0">
            {isOffline ? (
              <div className="flex items-center text-amber-500 text-sm rounded-full bg-amber-500/10 px-3 py-1" role="status" aria-live="polite">
                <span className="h-2 w-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                Offline Mode
              </div>
            ) : (
              <div className="flex items-center text-green-500 text-sm rounded-full bg-green-500/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Online
                {lastSynced && <span className="ml-2 text-muted-foreground text-xs hidden sm:inline">Last synced: {lastSynced}</span>}
              </div>
            )}
            {isOffline && 
              <button 
                onClick={syncData} 
                className="text-blue-500 text-xs mt-2 hover:underline flex items-center justify-center rounded-full bg-blue-500/10 px-3 py-1"
                aria-label="Sync data when online"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync when online
              </button>
            }
          </div>
        </div>
      </header>
      
      {/* Stats Cards - Enhanced with gradients and better spacing */}
      {sectionVisibility.find(s => s.id === 'stats-cards')?.visible && (
        <div className="mb-8 md:mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="region" aria-label="Financial Summary">
        <div className="rounded-xl border bg-card p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300" tabIndex={0} aria-label="Total Income Summary">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            Total Income
          </div>
          <div className="mt-3 md:mt-4 text-2xl md:text-3xl font-bold">{formatCurrency(stats.totalIncome)}</div>
          <div className="mt-2 flex items-center text-xs sm:text-sm">
            {enhancedMetrics && enhancedMetrics.incomeGrowthRate !== 0 && (
              <>
                {enhancedMetrics.incomeGrowthRate > 0 ? (
                  <TrendingUpIcon className="mr-1 h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4 text-red-600" />
                )}
                <span className={enhancedMetrics.incomeGrowthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                  {enhancedMetrics.incomeGrowthRate > 0 ? '+' : ''}{enhancedMetrics.incomeGrowthRate.toFixed(1)}% vs last period
                </span>
              </>
            )}
            {(!enhancedMetrics || enhancedMetrics.incomeGrowthRate === 0) && (
              <span className="text-muted-foreground">Current period income</span>
            )}
          </div>
        </div>
        
        <div className="rounded-xl border bg-card p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300" tabIndex={0} aria-label="Total Expenses Summary">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
            </div>
            Total Expenses
          </div>
          <div className="mt-3 md:mt-4 text-2xl md:text-3xl font-bold">{formatCurrency(stats.totalExpense)}</div>
          <div className="mt-2 flex items-center text-xs sm:text-sm">
            {enhancedMetrics && enhancedMetrics.expenseGrowthRate !== 0 && (
              <>
                {enhancedMetrics.expenseGrowthRate > 0 ? (
                  <TrendingUpIcon className="mr-1 h-4 w-4 text-red-600" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4 text-green-600" />
                )}
                <span className={enhancedMetrics.expenseGrowthRate > 0 ? 'text-red-600' : 'text-green-600'}>
                  {enhancedMetrics.expenseGrowthRate > 0 ? '+' : ''}{enhancedMetrics.expenseGrowthRate.toFixed(1)}% vs last period
                </span>
              </>
            )}
            {(!enhancedMetrics || enhancedMetrics.expenseGrowthRate === 0) && (
              <span className="text-muted-foreground">Current period expenses</span>
            )}
          </div>
        </div>
        
        <div className="rounded-xl border bg-card p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1" tabIndex={0} aria-label="Current Balance Summary">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-violet-400 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            Current Balance
          </div>
          <div className={`mt-3 md:mt-4 text-2xl md:text-3xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} aria-live="polite">{formatCurrency(stats.balance)}</div>
          <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>As of {formatDate(new Date())}</span>
            </div>
            {enhancedMetrics && enhancedMetrics.savingsRate !== undefined && (
              <div className={`flex items-center ${enhancedMetrics.savingsRate >= 20 ? 'text-green-600' : enhancedMetrics.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                <span className="text-xs">Savings: {enhancedMetrics.savingsRate.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Enhanced Metrics Section */}
      {enhancedMetrics && sectionVisibility.find(s => s.id === 'stats-cards')?.visible && (
        <div className="mb-6 md:mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{enhancedMetrics.totalTransactions}</div>
              <div className="text-xs text-muted-foreground">Total Transactions</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(enhancedMetrics.averageTransactionAmount)}</div>
              <div className="text-xs text-muted-foreground">Avg Transaction</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{enhancedMetrics.mostActiveDay}</div>
              <div className="text-xs text-muted-foreground">Most Active Day</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary truncate" title={enhancedMetrics.mostActiveCategory}>
                {enhancedMetrics.mostActiveCategory.length > 10 ? 
                  enhancedMetrics.mostActiveCategory.substring(0, 10) + '...' : 
                  enhancedMetrics.mostActiveCategory
                }
              </div>
              <div className="text-xs text-muted-foreground">Top Category</div>
            </div>
          </div>
        </div>
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

      {/* Enhanced Charts with Interactive Features */}
      {sectionVisibility.find(s => s.id === 'charts')?.visible && (
        <div className="mb-8 md:mb-10 space-y-8" role="region" aria-label="Enhanced Financial Charts">
          {/* Drill-down breadcrumb with enhanced styling */}
          {drillDownData && (
            <div className="rounded-lg border bg-gradient-to-r from-primary/5 to-accent/5 p-4 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-muted-foreground">Filtering by:</span>
                  <span className="font-semibold text-foreground px-3 py-1 bg-primary/10 rounded-full">
                    {drillDownData.type === 'category' && `${drillDownData.data.name} Category`}
                    {drillDownData.type === 'month' && `${drillDownData.data.month} ${drillDownData.data.year}`}
                    {drillDownData.type === 'year' && `Year ${drillDownData.data.year}`}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDrillDownData(null)}
                  className="hover:bg-primary/10 transition-colors"
                >
                  Clear Filter
                </Button>
              </div>
            </div>
          )}

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-1">
            {/* Enhanced Expense Pie Chart - Full Width */}
            <div className="h-96">
              <EnhancedExpensePieChart
                categoryData={enhancedChartData.categoryData}
                onCategoryClick={handleCategoryClick}
              />
            </div>
          </div>

          {/* Year-over-Year Comparison - Full Width */}
          <div className="w-full">
            <div className="h-96">
              <YearOverYearComparison
                onYearClick={handleYearClick}
                className="h-full"
              />
            </div>
          </div>

          {/* Legacy Income vs Expenses Chart */}
          <div className="rounded-xl border bg-card p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold" id="income-expense-chart-title" tabIndex={0}>Income vs. Expenses</h2>
            <div aria-labelledby="income-expense-chart-title" className="h-96 md:h-[28rem]">
              <IncomeExpenseChart monthlyData={stats.monthlyData} />
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Transactions with Enhanced UI */}
      {sectionVisibility.find(s => s.id === 'recent-transactions')?.visible && (
        <RecentTransactions transactions={stats.recentTransactions} />
      )}

      {/* Category Insights Section - More responsive */}
      {sectionVisibility.find(s => s.id === 'category-insights')?.visible && (
        <CategoryInsights topCategories={stats.topCategories} totalExpense={stats.totalExpense} />
      )}

      {/* Offline warning banner - Make it more visible on mobile */}
      {isOffline && (
        <div className="mt-4 md:mt-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 md:p-4 sticky bottom-2 md:static" role="alert">
          <h2 className="font-medium text-amber-800 dark:text-amber-400 text-sm md:text-base">Offline Mode Active</h2>
          <p className="mt-1 text-xs md:text-sm text-amber-700 dark:text-amber-300">
            You're currently viewing cached data. Some features may be limited until you're back online.
          </p>
        </div>
      )}

      {/* Alert Notification System */}
      <AlertNotificationSystem />
    </div>
  );
} 