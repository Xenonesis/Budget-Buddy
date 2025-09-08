"use client";

import React, { memo, useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  DollarSign,
  BarChart3,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Filter,
  Download,
  Info
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

interface MonthlyTrendData {
  month: string;
  year: number;
  totalSpending: number;
  totalIncome?: number;
  categoryBreakdown: { [category: string]: number };
  transactionCount: number;
  averageTransactionAmount?: number;
  budgetAmount?: number;
  previousYearSpending?: number;
}

interface MonthlySpendingTrendProps {
  data?: MonthlyTrendData[];
  selectedCategories?: string[];
  onCategoryToggle?: (category: string) => void;
  showYearOverYear?: boolean;
  onMonthClick?: (month: string, year: number) => void;
  className?: string;
}

interface RealMonthlyData {
  month: string;
  year: number;
  totalSpending: number;
  totalIncome: number;
  transactionCount: number;
  categoryBreakdown: { [category: string]: number };
  budgetAmount: number;
  averageTransactionAmount: number;
  previousYearSpending: number;
  netSavings: number;
  topCategory: string;
  spendingVsBudget: number;
}

// Enhanced color palette with better accessibility
const CATEGORY_COLORS = [
  '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED',
  '#DB2777', '#EA580C', '#4F46E5', '#0D9488', '#9333EA',
  '#BE185D', '#B45309', '#1D4ED8', '#047857', '#C2410C'
];

// Modern gradient colors for different chart elements
const CHART_GRADIENTS = {
  spending: ['#EF4444', '#DC2626'],
  income: ['#10B981', '#059669'],
  budget: ['#8B5CF6', '#7C3AED'],
  savings: ['#3B82F6', '#2563EB']
};

function MonthlySpendingTrendComponent({ 
  data = [],
  selectedCategories = [], 
  onCategoryToggle,
  showYearOverYear = false,
  onMonthClick,
  className = ""
}: MonthlySpendingTrendProps) {
  // Enhanced state management
  const [realData, setRealData] = useState<RealMonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'area' | 'composed'>('composed');
  const [viewMode, setViewMode] = useState<'spending' | 'income' | 'both' | 'savings'>('both');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  const [compareMode, setCompareMode] = useState<'none' | 'previous-year' | 'budget' | 'average'>('budget');
  const [showBrush, setShowBrush] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  // Fetch real data from Supabase
  useEffect(() => {
    fetchRealMonthlyData();
  }, [selectedTimeRange]);

  const fetchRealMonthlyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError('User not authenticated');
        return;
      }

      // Calculate date range
      const now = new Date();
      const monthsToFetch = selectedTimeRange === '3m' ? 3 : 
                           selectedTimeRange === '6m' ? 6 : 
                           selectedTimeRange === '1y' ? 12 : 24;
      
      const startDate = new Date(now.getFullYear(), now.getMonth() - monthsToFetch + 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch transactions with categories
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories:category_id (
            name,
            type
          )
        `)
        .eq('user_id', userData.user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (transactionError) throw transactionError;

      // Fetch budget data
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userData.user.id);

      // Process data by month
      const monthlyDataMap = new Map<string, RealMonthlyData>();
      
      // Initialize months
      for (let i = 0; i < monthsToFetch; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - monthsToFetch + 1 + i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        monthlyDataMap.set(monthKey, {
          month: monthName,
          year: date.getFullYear(),
          totalSpending: 0,
          totalIncome: 0,
          transactionCount: 0,
          categoryBreakdown: {},
          budgetAmount: 0,
          averageTransactionAmount: 0,
          previousYearSpending: 0,
          netSavings: 0,
          topCategory: '',
          spendingVsBudget: 0
        });
      }

      // Process transactions
      transactions?.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthData = monthlyDataMap.get(monthKey);
        
        if (monthData) {
          const categoryName = transaction.categories?.name || 'Uncategorized';
          
          if (transaction.type === 'expense') {
            monthData.totalSpending += transaction.amount;
            monthData.categoryBreakdown[categoryName] = 
              (monthData.categoryBreakdown[categoryName] || 0) + transaction.amount;
          } else {
            monthData.totalIncome += transaction.amount;
          }
          
          monthData.transactionCount++;
        }
      });

      // Calculate derived metrics and previous year data
      for (const [monthKey, monthData] of monthlyDataMap) {
        // Average transaction amount
        monthData.averageTransactionAmount = monthData.transactionCount > 0 
          ? (monthData.totalSpending + monthData.totalIncome) / monthData.transactionCount 
          : 0;

        // Net savings
        monthData.netSavings = monthData.totalIncome - monthData.totalSpending;

        // Top category
        const topCategoryEntry = Object.entries(monthData.categoryBreakdown)
          .sort(([,a], [,b]) => b - a)[0];
        monthData.topCategory = topCategoryEntry ? topCategoryEntry[0] : '';

        // Budget amount (simplified - could be enhanced with real budget logic)
        const monthBudgets = budgets?.filter(b => {
          const budgetDate = new Date(b.month);
          const currentDate = new Date(monthKey + '-01');
          return budgetDate.getMonth() === currentDate.getMonth() && 
                 budgetDate.getFullYear() === currentDate.getFullYear();
        }) || [];
        
        monthData.budgetAmount = monthBudgets.reduce((sum, b) => sum + b.amount, 0);
        monthData.spendingVsBudget = monthData.budgetAmount > 0 
          ? (monthData.totalSpending / monthData.budgetAmount) * 100 
          : 0;

        // Previous year spending
        const prevYearDate = new Date(monthKey + '-01');
        prevYearDate.setFullYear(prevYearDate.getFullYear() - 1);
        const prevYearStart = new Date(prevYearDate.getFullYear(), prevYearDate.getMonth(), 1);
        const prevYearEnd = new Date(prevYearDate.getFullYear(), prevYearDate.getMonth() + 1, 0);

        // Fetch previous year data (simplified for performance)
        supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', userData.user.id)
          .eq('type', 'expense')
          .gte('date', prevYearStart.toISOString().split('T')[0])
          .lte('date', prevYearEnd.toISOString().split('T')[0])
          .then(({ data: prevYearTrans }) => {
            if (prevYearTrans) {
              monthData.previousYearSpending = prevYearTrans.reduce((sum, t) => sum + t.amount, 0);
            }
          });
      }

      setRealData(Array.from(monthlyDataMap.values()));
      setAnimationKey(prev => prev + 1);
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      setError('Failed to load monthly spending data');
    } finally {
      setLoading(false);
    }
  };

  // Process chart data with enhanced metrics
  const chartData = useMemo(() => {
    if (realData.length === 0) return [];

    return realData.map(item => ({
      name: item.month,
      month: item.month,
      year: item.year,
      totalSpending: item.totalSpending,
      totalIncome: item.totalIncome,
      netSavings: item.netSavings,
      transactionCount: item.transactionCount,
      averageTransactionAmount: item.averageTransactionAmount,
      budgetAmount: item.budgetAmount,
      previousYearSpending: item.previousYearSpending,
      spendingVsBudget: item.spendingVsBudget,
      topCategory: item.topCategory,
      budgetVariance: item.budgetAmount > 0 ? item.totalSpending - item.budgetAmount : 0,
      yoyGrowth: item.previousYearSpending > 0 
        ? ((item.totalSpending - item.previousYearSpending) / item.previousYearSpending) * 100 
        : 0,
      savingsRate: item.totalIncome > 0 ? (item.netSavings / item.totalIncome) * 100 : 0,
      ...item.categoryBreakdown
    }));
  }, [realData]);

  // Get all available categories from real data
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    realData.forEach(item => {
      Object.keys(item.categoryBreakdown).forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  }, [realData]);

  // Enhanced analytics and insights
  const insights = useMemo(() => {
    if (chartData.length === 0) return null;

    const totalSpending = chartData.reduce((sum, item) => sum + item.totalSpending, 0);
    const totalIncome = chartData.reduce((sum, item) => sum + item.totalIncome, 0);
    const averageSpending = totalSpending / chartData.length;
    const averageIncome = totalIncome / chartData.length;
    const totalSavings = totalIncome - totalSpending;
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

    // Trend analysis
    const current = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    
    let trendAnalysis = null;
    if (current && previous) {
      const spendingChange = current.totalSpending - previous.totalSpending;
      const spendingPercentChange = previous.totalSpending > 0 ? (spendingChange / previous.totalSpending) * 100 : 0;
      const incomeChange = current.totalIncome - previous.totalIncome;
      const incomePercentChange = previous.totalIncome > 0 ? (incomeChange / previous.totalIncome) * 100 : 0;

      trendAnalysis = {
        spending: {
          change: spendingChange,
          percentChange: spendingPercentChange,
          trend: spendingChange > 0 ? 'up' : spendingChange < 0 ? 'down' : 'stable'
        },
        income: {
          change: incomeChange,
          percentChange: incomePercentChange,
          trend: incomeChange > 0 ? 'up' : incomeChange < 0 ? 'down' : 'stable'
        }
      };
    }

    // Budget performance
    const budgetPerformance = chartData
      .filter(item => item.budgetAmount > 0)
      .map(item => ({
        month: item.month,
        performance: (item.totalSpending / item.budgetAmount) * 100,
        variance: item.totalSpending - item.budgetAmount
      }));

    // Category insights
    const categoryTotals = new Map<string, number>();
    chartData.forEach(item => {
      Object.entries(item).forEach(([key, value]) => {
        if (typeof value === 'number' && allCategories.includes(key)) {
          categoryTotals.set(key, (categoryTotals.get(key) || 0) + value);
        }
      });
    });

    const topCategories = Array.from(categoryTotals.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, total]) => ({
        name,
        total,
        percentage: totalSpending > 0 ? (total / totalSpending) * 100 : 0
      }));

    return {
      totalSpending,
      totalIncome,
      totalSavings,
      savingsRate,
      averageSpending,
      averageIncome,
      trendAnalysis,
      budgetPerformance,
      topCategories,
      monthlyAverage: {
        spending: averageSpending,
        income: averageIncome,
        savings: totalSavings / chartData.length
      }
    };
  }, [chartData, allCategories]);

  // Enhanced custom tooltip with comprehensive data
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl p-5 max-w-sm">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{label}</span>
          </div>
          
          <div className="space-y-3">
            {/* Primary metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Spending</div>
                <div className="font-bold text-red-500">{formatCurrency(data.totalSpending)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Income</div>
                <div className="font-bold text-green-500">{formatCurrency(data.totalIncome || 0)}</div>
              </div>
            </div>

            {/* Net savings */}
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Net Savings:</span>
              <span className={`font-semibold ${data.netSavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(data.netSavings || 0)}
              </span>
            </div>

            {/* Budget comparison */}
            {data.budgetAmount > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Budget:</span>
                  <span>{formatCurrency(data.budgetAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Budget Usage:</span>
                  <Badge variant={data.spendingVsBudget > 100 ? "destructive" : data.spendingVsBudget > 80 ? "secondary" : "default"}>
                    {data.spendingVsBudget.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            )}

            {/* Year-over-year comparison */}
            {data.previousYearSpending > 0 && (
              <div className="pt-2 border-t space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Last Year:</span>
                  <span>{formatCurrency(data.previousYearSpending)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">YoY Change:</span>
                  <span className={`font-medium flex items-center gap-1 ${
                    data.yoyGrowth > 0 ? 'text-red-500' : data.yoyGrowth < 0 ? 'text-green-500' : 'text-muted-foreground'
                  }`}>
                    {data.yoyGrowth > 0 ? <TrendingUp className="h-3 w-3" /> : 
                     data.yoyGrowth < 0 ? <TrendingDown className="h-3 w-3" /> : 
                     <Minus className="h-3 w-3" />}
                    {data.yoyGrowth > 0 ? '+' : ''}{data.yoyGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Transaction insights */}
            <div className="pt-2 border-t space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Transactions:</span>
                <span className="font-medium">{data.transactionCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Avg Amount:</span>
                <span className="font-medium">{formatCurrency(data.averageTransactionAmount || 0)}</span>
              </div>
              {data.topCategory && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Top Category:</span>
                  <Badge variant="outline" className="text-xs">{data.topCategory}</Badge>
                </div>
              )}
            </div>

            <div className="pt-2 border-t text-xs text-muted-foreground text-center">
              Click to drill down into this month
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced event handlers
  const handleChartClick = (data: any) => {
    if (data && data.month && data.year) {
      onMonthClick?.(data.month, data.year);
    }
  };

  const handleCategoryToggle = (category: string) => {
    onCategoryToggle?.(category);
  };

  const handleExportData = () => {
    const csvData = chartData.map(item => ({
      Month: item.month,
      Year: item.year,
      'Total Spending': item.totalSpending,
      'Total Income': item.totalIncome,
      'Net Savings': item.netSavings,
      'Transaction Count': item.transactionCount,
      'Budget Amount': item.budgetAmount,
      'Spending vs Budget %': item.spendingVsBudget.toFixed(2),
      'YoY Growth %': item.yoyGrowth.toFixed(2)
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-spending-trend-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <Card className={`h-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Monthly Spending Trend
          </CardTitle>
          <CardDescription>
            Loading your financial insights...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-80 text-center p-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Analyzing your spending patterns...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`h-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Monthly Spending Trend
          </CardTitle>
          <CardDescription>
            Unable to load spending data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-80 text-center p-4">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-muted-foreground mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchRealMonthlyData}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <Card className={`h-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Monthly Spending Trend
          </CardTitle>
          <CardDescription>
            Track your spending patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-80 text-center p-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-medium text-foreground mb-2">No Data Available</h3>
            <p className="text-muted-foreground text-sm">
              Start adding transactions to see your spending trends
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full ${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''} overflow-hidden`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Monthly Spending Trend
              {insights && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {chartData.length} months
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm">
              Comprehensive analysis of your financial patterns
            </CardDescription>
          </div>
          
          {/* Enhanced Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
              className="text-xs"
            >
              {showInsights ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportData}
              className="text-xs"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-xs"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Enhanced Insights Panel */}
        {showInsights && insights && (
          <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{formatCurrency(insights.totalSpending)}</div>
                <div className="text-xs text-muted-foreground">Total Spending</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{formatCurrency(insights.totalIncome)}</div>
                <div className="text-xs text-muted-foreground">Total Income</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${insights.totalSavings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {formatCurrency(insights.totalSavings)}
                </div>
                <div className="text-xs text-muted-foreground">Net Savings</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${insights.savingsRate >= 20 ? 'text-green-600' : insights.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {insights.savingsRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Savings Rate</div>
              </div>
            </div>

            {/* Trend Analysis */}
            {insights.trendAnalysis && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Spending Trend:</span>
                  <div className="flex items-center gap-1">
                    {insights.trendAnalysis.spending.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                    {insights.trendAnalysis.spending.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                    {insights.trendAnalysis.spending.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                    <span className={`font-medium ${
                      insights.trendAnalysis.spending.trend === 'up' ? 'text-red-500' : 
                      insights.trendAnalysis.spending.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {insights.trendAnalysis.spending.percentChange > 0 ? '+' : ''}
                      {insights.trendAnalysis.spending.percentChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Income Trend:</span>
                  <div className="flex items-center gap-1">
                    {insights.trendAnalysis.income.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {insights.trendAnalysis.income.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {insights.trendAnalysis.income.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                    <span className={`font-medium ${
                      insights.trendAnalysis.income.trend === 'up' ? 'text-green-500' : 
                      insights.trendAnalysis.income.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {insights.trendAnalysis.income.percentChange > 0 ? '+' : ''}
                      {insights.trendAnalysis.income.percentChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <Tabs value={chartType} onValueChange={(value: any) => setChartType(value)} className="w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="line" className="text-xs">Line</TabsTrigger>
              <TabsTrigger value="area" className="text-xs">Area</TabsTrigger>
              <TabsTrigger value="composed" className="text-xs">Mixed</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="w-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="spending" className="text-xs">Spending</TabsTrigger>
              <TabsTrigger value="income" className="text-xs">Income</TabsTrigger>
              <TabsTrigger value="both" className="text-xs">Both</TabsTrigger>
              <TabsTrigger value="savings" className="text-xs">Savings</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-1">
            {(['3m', '6m', '1y', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
                className="text-xs px-3 py-1"
              >
                {range === 'all' ? 'All' : range.toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="flex gap-1">
            {(['none', 'previous-year', 'budget', 'average'] as const).map((mode) => (
              <Button
                key={mode}
                variant={compareMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setCompareMode(mode)}
                className="text-xs px-2 py-1"
              >
                {mode === 'none' ? 'None' : 
                 mode === 'previous-year' ? 'YoY' : 
                 mode === 'budget' ? 'Budget' : 'Avg'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2 overflow-hidden">
        <div className={`${isFullscreen ? 'h-[calc(100vh-300px)]' : 'h-[300px]'} transition-all duration-300`}>
          <ResponsiveContainer width="100%" height="100%" key={animationKey}>
            {chartType === 'line' ? (
              <LineChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                onClick={handleChartClick}
              >
                <defs>
                  <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_GRADIENTS.spending[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_GRADIENTS.spending[1]} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_GRADIENTS.income[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_GRADIENTS.income[1]} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value/1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value/1000).toFixed(1)}k`;
                    return `$${value}`;
                  }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Reference lines */}
                {insights && compareMode === 'average' && (
                  <ReferenceLine 
                    y={insights.monthlyAverage.spending} 
                    stroke="var(--muted-foreground)" 
                    strokeDasharray="5 5"
                    label={{ value: "Avg Spending", position: "top" }}
                  />
                )}
                
                {/* Main data lines */}
                {(viewMode === 'spending' || viewMode === 'both') && (
                  <Line
                    type="monotone"
                    dataKey="totalSpending"
                    name="Spending"
                    stroke={CHART_GRADIENTS.spending[0]}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: CHART_GRADIENTS.spending[0] }}
                    activeDot={{ r: 6, stroke: CHART_GRADIENTS.spending[0], strokeWidth: 2, fill: '#fff' }}
                    animationDuration={1000}
                  />
                )}
                
                {(viewMode === 'income' || viewMode === 'both') && (
                  <Line
                    type="monotone"
                    dataKey="totalIncome"
                    name="Income"
                    stroke={CHART_GRADIENTS.income[0]}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: CHART_GRADIENTS.income[0] }}
                    activeDot={{ r: 6, stroke: CHART_GRADIENTS.income[0], strokeWidth: 2, fill: '#fff' }}
                    animationDuration={1000}
                  />
                )}
                
                {viewMode === 'savings' && (
                  <Line
                    type="monotone"
                    dataKey="netSavings"
                    name="Net Savings"
                    stroke={CHART_GRADIENTS.savings[0]}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: CHART_GRADIENTS.savings[0] }}
                    activeDot={{ r: 6, stroke: CHART_GRADIENTS.savings[0], strokeWidth: 2, fill: '#fff' }}
                    animationDuration={1000}
                  />
                )}
                
                {/* Budget comparison */}
                {compareMode === 'budget' && (
                  <Line
                    type="monotone"
                    dataKey="budgetAmount"
                    name="Budget"
                    stroke={CHART_GRADIENTS.budget[0]}
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={{ r: 3, strokeWidth: 2, fill: CHART_GRADIENTS.budget[0] }}
                    activeDot={{ r: 5, stroke: CHART_GRADIENTS.budget[0], strokeWidth: 2, fill: '#fff' }}
                  />
                )}
                
                {/* Previous year comparison */}
                {compareMode === 'previous-year' && (
                  <Line
                    type="monotone"
                    dataKey="previousYearSpending"
                    name="Previous Year"
                    stroke="var(--muted-foreground)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, strokeWidth: 1, fill: 'var(--muted-foreground)' }}
                    activeDot={{ r: 5, stroke: 'var(--muted-foreground)', strokeWidth: 2, fill: '#fff' }}
                  />
                )}
                
                {/* Category lines */}
                {selectedCategories.map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                ))}
                
                {showBrush && (
                  <Brush 
                    dataKey="name" 
                    height={30} 
                    stroke="var(--primary)"
                    fill="var(--muted)"
                  />
                )}
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                onClick={handleChartClick}
              >
                <defs>
                  <linearGradient id="spendingAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_GRADIENTS.spending[0]} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={CHART_GRADIENTS.spending[1]} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="incomeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_GRADIENTS.income[0]} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={CHART_GRADIENTS.income[1]} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value/1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value/1000).toFixed(1)}k`;
                    return `$${value}`;
                  }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {(viewMode === 'spending' || viewMode === 'both') && (
                  <Area
                    type="monotone"
                    dataKey="totalSpending"
                    name="Spending"
                    stroke={CHART_GRADIENTS.spending[0]}
                    fillOpacity={0.6}
                    fill="url(#spendingAreaGradient)"
                    strokeWidth={2}
                    animationDuration={1000}
                  />
                )}
                
                {(viewMode === 'income' || viewMode === 'both') && (
                  <Area
                    type="monotone"
                    dataKey="totalIncome"
                    name="Income"
                    stroke={CHART_GRADIENTS.income[0]}
                    fillOpacity={0.6}
                    fill="url(#incomeAreaGradient)"
                    strokeWidth={2}
                    animationDuration={1000}
                  />
                )}
              </AreaChart>
            ) : (
              <ComposedChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                onClick={handleChartClick}
              >
                <defs>
                  <linearGradient id="composedSpendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_GRADIENTS.spending[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_GRADIENTS.spending[1]} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value/1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value/1000).toFixed(1)}k`;
                    return `$${value}`;
                  }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Bar
                  dataKey="totalSpending"
                  name="Spending"
                  fill="url(#composedSpendingGradient)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
                
                <Line
                  type="monotone"
                  dataKey="totalIncome"
                  name="Income"
                  stroke={CHART_GRADIENTS.income[0]}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: CHART_GRADIENTS.income[0] }}
                  activeDot={{ r: 6, stroke: CHART_GRADIENTS.income[0], strokeWidth: 2, fill: '#fff' }}
                  animationDuration={1000}
                />
                
                {compareMode === 'budget' && (
                  <Line
                    type="monotone"
                    dataKey="budgetAmount"
                    name="Budget"
                    stroke={CHART_GRADIENTS.budget[0]}
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={{ r: 3, strokeWidth: 2, fill: CHART_GRADIENTS.budget[0] }}
                  />
                )}
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Enhanced Category Controls */}
        {allCategories.length > 0 && (
          <div className="mt-6 pt-4 border-t space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Category Breakdown</span>
                <Badge variant="outline" className="text-xs">
                  {selectedCategories.length} selected
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBrush(!showBrush)}
                  className="text-xs"
                >
                  {showBrush ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                  Zoom
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCategoryToggle && allCategories.forEach(cat => onCategoryToggle(cat))}
                  className="text-xs"
                >
                  Select All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {allCategories.map((category, index) => {
                const isSelected = selectedCategories.includes(category);
                const categoryTotal = insights?.topCategories.find(c => c.name === category)?.total || 0;
                const categoryPercentage = insights?.topCategories.find(c => c.name === category)?.percentage || 0;
                
                return (
                  <Button
                    key={category}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryToggle(category)}
                    className="flex flex-col items-start p-3 h-auto text-left"
                    style={{
                      backgroundColor: isSelected 
                        ? CATEGORY_COLORS[index % CATEGORY_COLORS.length] 
                        : undefined,
                      borderColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                    }}
                  >
                    <span className="text-xs font-medium truncate w-full">{category}</span>
                    {categoryTotal > 0 && (
                      <div className="text-xs opacity-75 mt-1">
                        <div>{formatCurrency(categoryTotal)}</div>
                        <div>{categoryPercentage.toFixed(1)}%</div>
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Categories Insights */}
        {insights && insights.topCategories.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Top Spending Categories</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {insights.topCategories.slice(0, 6).map((category, index) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                    />
                    <div>
                      <div className="text-sm font-medium">{category.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(category.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const MonthlySpendingTrend = memo(MonthlySpendingTrendComponent);
MonthlySpendingTrend.displayName = 'MonthlySpendingTrend';