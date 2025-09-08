"use client";

import React, { memo, useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  LineChart,
  Area,
  AreaChart
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, TrendingDown, BarChart3, RefreshCw, AlertTriangle, Info, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YearOverYearService, YearlyComparisonData, YearOverYearMetrics } from "@/lib/year-over-year-service";
import { PredictiveAnalyticsService, PredictiveInsight, SpendingForecast } from "@/lib/predictive-analytics-service";
import { validateYearOverYearFunctionality } from "@/lib/year-over-year-validator";
import { supabase } from "@/lib/supabase";

interface YearOverYearComparisonProps {
  onYearClick?: (year: number) => void;
  className?: string;
}

type ViewMode = 'monthly' | 'quarterly' | 'annual';
type ChartType = 'bar' | 'line' | 'area';
type MetricType = 'spending' | 'income' | 'transactions';

function YearOverYearComparisonComponent({ onYearClick, className }: YearOverYearComparisonProps) {
  const [yearlyData, setYearlyData] = useState<YearlyComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedCategory, setSelectedCategory] = useState<string>('totalSpending');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('spending');
  const [yoyMetrics, setYoyMetrics] = useState<YearOverYearMetrics | null>(null);
  const [insights, setInsights] = useState<{
    trends: string[];
    recommendations: string[];
    alerts: string[];
  }>({ trends: [], recommendations: [], alerts: [] });
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [spendingForecast, setSpendingForecast] = useState<SpendingForecast[]>([]);
  const [showPredictive, setShowPredictive] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [validationReport, setValidationReport] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Fetch data on component mount and get current user
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          setError('User not authenticated');
          return;
        }

        setCurrentUserId(userData.user.id);

        const data = await YearOverYearService.fetchYearOverYearData(userData.user.id);
        setYearlyData(data);

        // Calculate metrics if we have at least 2 years of data
        if (data.length >= 2) {
          const metrics = YearOverYearService.calculateYearOverYearMetrics(data[0], data[1]);
          setYoyMetrics(metrics);
        }

        // Get insights
        const spendingInsights = YearOverYearService.getSpendingInsights(data);
        setInsights(spendingInsights);

        // Get predictive analytics
        const predictiveData = await PredictiveAnalyticsService.generatePredictiveInsights(userData.user.id);
        setPredictiveInsights(predictiveData);

        // Get spending forecast
        const forecastData = await PredictiveAnalyticsService.generateSpendingForecast(userData.user.id);
        setSpendingForecast(forecastData);

      } catch (err) {
        console.error('Error fetching year-over-year data:', err);
        setError('Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Validation function
  const runValidation = async () => {
    if (!currentUserId) return;

    setIsValidating(true);
    try {
      const report = await validateYearOverYearFunctionality(currentUserId);
      setValidationReport(report);
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationReport(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Get available years and categories
  const availableYears = useMemo(() => 
    yearlyData.map(d => d.year).sort((a, b) => b - a), 
    [yearlyData]
  );

  const availableCategories = useMemo(() => {
    // Get top categories from the enhanced category data
    const allCategories = new Set<string>();
    yearlyData.forEach(yearData => {
      if (yearData.categoryBreakdown) {
        Object.keys(yearData.categoryBreakdown).forEach(category => {
          allCategories.add(category);
        });
      }
    });
    
    // Sort categories by total spending across all years
    const categoryTotals = Array.from(allCategories).map(category => {
      const total = yearlyData.reduce((sum, yearData) => {
        return sum + (yearData.categoryBreakdown[category]?.amount || 0);
      }, 0);
      return { category, total };
    }).sort((a, b) => b.total - a.total);
    
    const topCategories = categoryTotals.slice(0, 15).map(item => item.category);
    return ['totalSpending', 'totalIncome', ...topCategories];
  }, [yearlyData]);

  // Process data based on view mode with better error handling
  const chartData = useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) {
      return [];
    }

    if (viewMode === 'annual') {
      return YearOverYearService.getAnnualData(yearlyData);
    }

    if (viewMode === 'quarterly') {
      return YearOverYearService.getQuarterlyData(yearlyData);
    }

    // Monthly view - improved data handling with CategoryData support
    const monthlyData: any[] = [];
    yearlyData.forEach(yearData => {
      if (yearData.monthlyData && yearData.monthlyData.length > 0) {
        yearData.monthlyData.forEach(monthData => {
          const dataPoint: any = {
            period: `${monthData.month} ${yearData.year}`,
            month: monthData.month,
            year: yearData.year,
            totalSpending: monthData.totalSpending || 0,
            totalIncome: monthData.totalIncome || 0,
            transactionCount: monthData.transactionCount || 0
          };
          
          // Add category breakdown data (convert CategoryData to numbers for chart)
          if (monthData.categoryBreakdown) {
            Object.entries(monthData.categoryBreakdown).forEach(([category, categoryData]) => {
              dataPoint[category] = categoryData.amount || 0;
            });
          }
          
          monthlyData.push(dataPoint);
        });
      }
    });
    
    // Sort by year and month for better display
    return monthlyData
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      })
      .slice(-24); // Show last 24 months max for better performance
  }, [yearlyData, viewMode, availableCategories]);

  // Get current metric value for display
  const getMetricValue = (data: any, metric: MetricType): number => {
    switch (metric) {
      case 'spending':
        return data.totalSpending || 0;
      case 'income':
        return data.totalIncome || 0;
      case 'transactions':
        return data.transactionCount || 0;
      default:
        return 0;
    }
  };

  // Get metric growth from YoY metrics
  const getMetricGrowth = (metric: MetricType): number => {
    if (!yoyMetrics) return 0;
    switch (metric) {
      case 'spending':
        return yoyMetrics.spendingGrowth;
      case 'income':
        return yoyMetrics.incomeGrowth;
      case 'transactions':
        return yoyMetrics.transactionGrowth;
      default:
        return 0;
    }
  };

  // Refresh data function
  const refreshData = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      const data = await YearOverYearService.fetchYearOverYearData(currentUserId);
      setYearlyData(data);
      
      if (data.length >= 2) {
        const metrics = YearOverYearService.calculateYearOverYearMetrics(data[0], data[1]);
        setYoyMetrics(metrics);
      }
      
      const spendingInsights = YearOverYearService.getSpendingInsights(data);
      setInsights(spendingInsights);
      
      // Refresh predictive analytics
      const predictiveData = await PredictiveAnalyticsService.generatePredictiveInsights(currentUserId);
      setPredictiveInsights(predictiveData);
      
      const forecastData = await PredictiveAnalyticsService.generateSpendingForecast(currentUserId);
      setSpendingForecast(forecastData);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip - Enhanced design
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-gradient-to-br from-background to-muted/20 border border-border/50 rounded-xl shadow-2xl p-4 max-w-sm backdrop-blur-sm">
          <div className="font-semibold text-foreground mb-3 text-center border-b border-border/30 pb-2">
            {label}
          </div>
          <div className="space-y-3">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground text-sm font-medium">{entry.name}:</span>
                </div>
                <span className="font-bold text-foreground bg-muted/30 px-2 py-1 rounded-lg">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Year-over-year comparison for monthly view */}
          {viewMode === 'monthly' && data.year && (
            <div className="pt-3 mt-3 border-t border-border/30 text-center">
              <span className="text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded-full">
                💡 Click to view {data.year} details
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Handle chart click
  const handleChartClick = (data: any) => {
    if (data && data.year) {
      onYearClick?.(data.year);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className={`h-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Year-over-Year Comparison
          </CardTitle>
          <CardDescription>
            Loading comparison data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-80 text-center p-4">
            <RefreshCw className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Fetching your financial data...</p>
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
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Year-over-Year Comparison
          </CardTitle>
          <CardDescription>
            Failed to load comparison data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-80 text-center p-4">
            <AlertTriangle className="h-12 w-12 text-destructive/40 mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (yearlyData.length === 0) {
    return (
      <Card className={`h-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Year-over-Year Comparison
          </CardTitle>
          <CardDescription>
            Compare spending patterns across different years
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-80 text-center p-4">
            <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground mb-2">No yearly data available for comparison.</p>
            <p className="text-sm text-muted-foreground">Start adding transactions to see insights!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ChartComponent = chartType === 'bar' ? BarChart : chartType === 'line' ? LineChart : AreaChart;
  const DataComponent = chartType === 'bar' ? Bar : chartType === 'line' ? Line : Area;

  return (
    <div className={`flex flex-col h-full space-y-6 ${className}`}>
      {/* Header Section - Completely redesigned */}
      <Card className="bg-gradient-to-br from-background to-muted/30 border-2 border-border/50 shadow-lg">
        <CardHeader className="pb-6">
          {/* Title and Controls Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Year-over-Year Comparison
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    Compare {selectedMetric} patterns across different periods
                  </CardDescription>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={loading}
                className="px-3 py-2 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/5 hover:border-primary/40"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Control Filters - Redesigned with better spacing */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="flex flex-1 gap-2">
              <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
                <SelectTrigger className="bg-background/80 backdrop-blur-sm border-primary/20">
                  <SelectValue placeholder="Metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spending">💰 Spending</SelectItem>
                  <SelectItem value="income">💵 Income</SelectItem>
                  <SelectItem value="transactions">📊 Transactions</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                <SelectTrigger className="bg-background/80 backdrop-blur-sm border-primary/20">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">📅 Monthly</SelectItem>
                  <SelectItem value="quarterly">📈 Quarterly</SelectItem>
                  <SelectItem value="annual">🗓️ Annual</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
                <SelectTrigger className="bg-background/80 backdrop-blur-sm border-primary/20">
                  <SelectValue placeholder="Chart" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">📊 Bar</SelectItem>
                  <SelectItem value="line">📈 Line</SelectItem>
                  <SelectItem value="area">📉 Area</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        {/* Data Summary Cards - Redesigned */}
        {yearlyData.length > 0 && (
          <CardContent className="pt-0 pb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50">
                <div className="text-center">
                  <div className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
                    {yearlyData.length}
                  </div>
                  <div className="text-blue-700 dark:text-blue-300 text-sm font-medium mt-1">
                    Total Years
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-800/50">
                <div className="text-center">
                  <div className="text-green-600 dark:text-green-400 text-lg font-bold truncate">
                    {formatCurrency(yearlyData[0]?.totalSpending || 0)}
                  </div>
                  <div className="text-green-700 dark:text-green-300 text-sm font-medium mt-1">
                    Latest Year
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800/50">
                <div className="text-center">
                  <div className="text-purple-600 dark:text-purple-400 text-2xl font-bold">
                    {Math.max(0, availableCategories.length - 2)}
                  </div>
                  <div className="text-purple-700 dark:text-purple-300 text-sm font-medium mt-1">
                    Categories
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 p-4 rounded-xl border border-orange-200 dark:border-orange-800/50">
                <div className="text-center">
                  <div className="text-orange-600 dark:text-orange-400 text-lg font-bold">
                    {yearlyData.reduce((sum, year) => sum + year.transactionCount, 0).toLocaleString()}
                  </div>
                  <div className="text-orange-700 dark:text-orange-300 text-sm font-medium mt-1">
                    Total Transactions
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* YoY Growth & Insights Section - Separated for better organization */}
      {yoyMetrics && availableYears.length > 1 && (
        <Card className="bg-gradient-to-br from-background to-accent/5 border border-border/50 shadow-md">
          <CardContent className="p-6">
            {/* Main metric growth - Enhanced design */}
            <div className="bg-gradient-to-r from-muted/30 to-muted/10 p-4 rounded-xl border border-border/50 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    getMetricGrowth(selectedMetric) > 0 ? 
                      (selectedMetric === 'spending' ? 'bg-red-100 dark:bg-red-950/30' : 'bg-green-100 dark:bg-green-950/30') :
                      (selectedMetric === 'spending' ? 'bg-green-100 dark:bg-green-950/30' : 'bg-red-100 dark:bg-red-950/30')
                  }`}>
                    {getMetricGrowth(selectedMetric) > 0 ? (
                      <TrendingUp className={`h-5 w-5 ${selectedMetric === 'spending' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                    ) : (
                      <TrendingDown className={`h-5 w-5 ${selectedMetric === 'spending' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${
                        (selectedMetric === 'spending' && getMetricGrowth(selectedMetric) > 0) || 
                        (selectedMetric !== 'spending' && getMetricGrowth(selectedMetric) < 0) 
                          ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {getMetricGrowth(selectedMetric) > 0 ? '+' : ''}{getMetricGrowth(selectedMetric).toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground text-sm capitalize bg-muted/50 px-2 py-1 rounded-full">
                        {selectedMetric} vs {availableYears[1]}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-sm mt-1">
                      <span className="font-medium">{availableYears[0]}:</span> {
                        selectedMetric === 'transactions' 
                          ? getMetricValue(yearlyData[0], selectedMetric).toLocaleString()
                          : formatCurrency(getMetricValue(yearlyData[0], selectedMetric))
                      } • 
                      <span className="font-medium">{availableYears[1]}:</span> {
                        selectedMetric === 'transactions' 
                          ? getMetricValue(yearlyData[1], selectedMetric).toLocaleString()
                          : formatCurrency(getMetricValue(yearlyData[1], selectedMetric))
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights and alerts - Improved layout */}
            {(insights.trends.length > 0 || insights.alerts.length > 0 || predictiveInsights.length > 0) && (
              <div className="space-y-4">
                {/* Traditional insights */}
                {(insights.trends.length > 0 || insights.alerts.length > 0) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {insights.trends.slice(0, 2).map((trend, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
                        <div className="p-1 bg-blue-200 dark:bg-blue-800/50 rounded-full">
                          <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">{trend}</span>
                      </div>
                    ))}
                    {insights.alerts.slice(0, 2).map((alert, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
                        <div className="p-1 bg-amber-200 dark:bg-amber-800/50 rounded-full">
                          <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-amber-800 dark:text-amber-200 text-sm font-medium">{alert}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Predictive Analytics Toggle - Enhanced */}
                {predictiveInsights.length > 0 && (
                  <div className="border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-purple-100 dark:bg-purple-950/30 rounded-full">
                          <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          Predictive Analytics
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPredictive(!showPredictive)}
                        className="text-xs bg-background/80 backdrop-blur-sm"
                      >
                        {showPredictive ? 'Hide' : 'Show'} Predictions
                      </Button>
                    </div>

                    {showPredictive && (
                      <div className="space-y-3">
                        {/* High-confidence predictions */}
                        {predictiveInsights
                          .filter(insight => insight.confidence >= 80)
                          .slice(0, 3)
                          .map((insight, index) => (
                            <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border ${
                              insight.type === 'alert' ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800/50' :
                              insight.type === 'recommendation' ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800/50' :
                              insight.type === 'forecast' ? 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800/50' :
                              'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/50'
                            }`}>
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded-full ${
                                  insight.type === 'alert' ? 'bg-red-200 dark:bg-red-800/50' :
                                  insight.type === 'recommendation' ? 'bg-green-200 dark:bg-green-800/50' :
                                  insight.type === 'forecast' ? 'bg-purple-200 dark:bg-purple-800/50' :
                                  'bg-blue-200 dark:bg-blue-800/50'
                                }`}>
                                  {insight.type === 'alert' && <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />}
                                  {insight.type === 'recommendation' && <Target className="h-3 w-3 text-green-600 dark:text-green-400" />}
                                  {insight.type === 'forecast' && <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />}
                                  {insight.type === 'trend' && <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
                                </div>
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-background/80">
                                  {insight.confidence}%
                                </Badge>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-foreground text-sm">{insight.title}</div>
                                <div className={`text-sm ${
                                  insight.type === 'alert' ? 'text-red-700 dark:text-red-300' :
                                  insight.type === 'recommendation' ? 'text-green-700 dark:text-green-300' :
                                  insight.type === 'forecast' ? 'text-purple-700 dark:text-purple-300' :
                                  'text-blue-700 dark:text-blue-300'
                                }`}>
                                  {insight.description}
                                </div>
                                {insight.value && (
                                  <div className="text-muted-foreground text-xs mt-1">
                                    {insight.category === 'spending' || insight.category === 'income' ? 
                                      formatCurrency(insight.value) : 
                                      insight.value.toLocaleString()
                                    }
                                    {insight.change && (
                                      <span className={`ml-1 ${insight.change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        ({insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                        {/* Spending Forecast - Enhanced */}
                        {spendingForecast.length > 0 && (
                          <div className="p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-purple-200 dark:border-purple-800/50">
                            <div className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              6-Month Spending Forecast
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {spendingForecast.slice(0, 3).map((forecast, index) => (
                                <div key={index} className="text-center bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/50 dark:border-purple-800/30">
                                  <div className="font-semibold text-sm text-foreground">{forecast.month}</div>
                                  <div className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                                    {formatCurrency(forecast.predictedSpending)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {forecast.confidence}% confidence
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Main Chart Section - Completely redesigned */}
      <Card className="bg-gradient-to-br from-background via-muted/10 to-background border border-border/50 shadow-lg">
        <CardContent className="p-6">
          <div className="bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl p-4 border border-border/30">
            <ResponsiveContainer width="100%" height={450}>
              <ChartComponent
                data={chartData}
                margin={{
                  top: 30,
                  right: 40,
                  left: 30,
                  bottom: viewMode === 'monthly' ? 80 : 30
                }}
                onClick={handleChartClick}
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="var(--border)" 
                  opacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  tick={{ 
                    fill: 'var(--muted-foreground)', 
                    fontSize: 12,
                    fontWeight: 500
                  }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  angle={viewMode === 'monthly' ? -35 : 0}
                  textAnchor={viewMode === 'monthly' ? 'end' : 'middle'}
                  height={viewMode === 'monthly' ? 80 : 50}
                  interval={viewMode === 'monthly' ? 'preserveStartEnd' : 0}
                  tickMargin={15}
                />
                <YAxis
                  tick={{ 
                    fill: 'var(--muted-foreground)', 
                    fontSize: 12,
                    fontWeight: 500
                  }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `₹${(value/1000000).toFixed(1)}M`;
                    if (value >= 1000) return `₹${(value/1000).toFixed(0)}k`;
                    return `₹${value}`;
                  }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  width={80}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ 
                    fill: 'var(--primary)', 
                    fillOpacity: 0.1,
                    stroke: 'var(--primary)',
                    strokeWidth: 1,
                    strokeDasharray: '3 3'
                  }} 
                />
                <Legend
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    paddingBottom: '10px'
                  }}
                  iconSize={16}
                  formatter={(value) => (
                    <span style={{ 
                      fontSize: '14px', 
                      color: 'var(--foreground)',
                      fontWeight: 500
                    }}>
                      {value}
                    </span>
                  )}
                />
                
                {chartData.length > 0 && availableYears.map((year, index) => {
                  const dataKey = selectedCategory === 'totalSpending' ? 'totalSpending' :
                                  selectedCategory === 'totalIncome' ? 'totalIncome' :
                                  selectedCategory === 'transactionCount' ? 'transactionCount' :
                                  selectedCategory;
                  
                  const name = selectedCategory === 'totalSpending' ? 'Spending' :
                               selectedCategory === 'totalIncome' ? 'Income' :
                               selectedCategory === 'transactionCount' ? 'Transactions' :
                               selectedCategory;

                  const colors = [
                    'hsl(221, 83%, 53%)', // Blue
                    'hsl(142, 76%, 36%)', // Green
                    'hsl(262, 83%, 58%)', // Purple
                    'hsl(25, 95%, 53%)',  // Orange
                    'hsl(346, 87%, 43%)', // Red
                    'hsl(178, 90%, 48%)', // Teal
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <DataComponent
                      key={`${year}-${dataKey}`}
                      dataKey={value => {
                        if (value.year !== year) return null;
                        return value[dataKey] || 0;
                      }}
                      type="monotone"
                      name={`${year} - ${name}`}
                      fill={chartType === 'area' ? `url(#chartGradient-${index})` : color}
                      stroke={chartType !== 'bar' ? color : undefined}
                      strokeWidth={chartType !== 'bar' ? 3 : undefined}
                      dot={chartType === 'line' ? { 
                        r: 5, 
                        strokeWidth: 2,
                        fill: color,
                        stroke: 'var(--background)',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      } : false}
                      activeDot={chartType === 'line' ? { 
                        r: 7, 
                        strokeWidth: 2,
                        fill: color,
                        stroke: 'var(--background)',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                      } : undefined}
                      fillOpacity={chartType === 'area' ? 0.4 : 0.95}
                      barSize={Math.max(20, Math.min(40, 300 / chartData.length))}
                    />
                  );
                })}
                
                {/* Add gradient definitions for area charts */}
                <defs>
                  {availableYears.map((year, index) => {
                    const colors = [
                      'hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(262, 83%, 58%)', 
                      'hsl(25, 95%, 53%)', 'hsl(346, 87%, 43%)', 'hsl(178, 90%, 48%)'
                    ];
                    const color = colors[index % colors.length];
                    return (
                      <linearGradient key={`gradient-${index}`} id={`chartGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                      </linearGradient>
                    );
                  })}
                </defs>
                
                {chartData.length === 0 && (
                  <text 
                    x="50%" 
                    y="50%" 
                    textAnchor="middle" 
                    fill="var(--muted-foreground)"
                    fontSize="16"
                    fontWeight="500"
                  >
                    No data to display for the selected period.
                  </text>
                )}
              </ChartComponent>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Controls Section - Enhanced category/metric selector */}
      <Card className="bg-gradient-to-br from-background to-muted/20 border border-border/50 shadow-md">
        <CardContent className="p-6">
          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-xl">
              <TabsTrigger 
                value="metrics"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
              >
                <Target className="h-4 w-4 mr-2" />
                Key Metrics
              </TabsTrigger>
              <TabsTrigger 
                value="categories"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="metrics" className="mt-6">
              <div className="flex flex-wrap justify-center gap-3">
                {['totalSpending', 'totalIncome'].map((metric) => (
                  <Button
                    key={metric}
                    variant={selectedCategory === metric ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSelectedCategory(metric)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      selectedCategory === metric 
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                        : 'bg-background hover:bg-muted/80 hover:scale-105'
                    }`}
                  >
                    {metric === 'totalSpending' ? '💰 Total Spending' : '💵 Total Income'}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="categories" className="mt-6">
              <div className="bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl p-4 border border-border/30">
                <div className="flex flex-wrap justify-center gap-2 max-h-48 overflow-y-auto">
                  {availableCategories.filter(c => !['totalSpending', 'totalIncome'].includes(c)).slice(0, 25).map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category 
                          ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                          : 'bg-background/80 hover:bg-muted/60 hover:scale-105 backdrop-blur-sm'
                      }`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Validation Section - Enhanced */}
      <Card className="bg-gradient-to-br from-muted/10 to-muted/5 border border-border/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-foreground">Data Validation</h4>
            </div>
            <Button 
              variant="outline" 
              size="default"
              onClick={runValidation}
              disabled={isValidating || !currentUserId}
              className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/5 hover:border-primary/40 px-4 py-2"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Info className="h-4 w-4 mr-2" />
                  Run Validation
                </>
              )}
            </Button>
          </div>
          
          {validationReport && (
            <div className="bg-gradient-to-br from-muted/30 to-muted/10 p-4 rounded-xl border border-border/30">
              <pre className="whitespace-pre-wrap font-mono text-sm overflow-auto max-h-48 text-foreground">
                {validationReport}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const YearOverYearComparison = memo(YearOverYearComparisonComponent);
YearOverYearComparison.displayName = 'YearOverYearComparison';