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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm">
          <div className="font-medium text-foreground mb-2">{label}</div>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground text-sm">{entry.name}:</span>
                </div>
                <span className="font-semibold">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
          
          {/* Year-over-year comparison for monthly view */}
          {viewMode === 'monthly' && data.year && (
            <div className="pt-2 mt-2 border-t text-xs text-muted-foreground">
              Click to view {data.year} details
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
    <Card className={`h-full ${className}`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Year-over-Year Comparison
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                disabled={loading}
                className="ml-2"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
            <CardDescription>
              Compare {selectedMetric} patterns across different periods
            </CardDescription>
          </div>
          
          <div className="flex gap-2 flex-wrap justify-start sm:justify-end">
            <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spending">Spending</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="transactions">Transactions</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-full sm:w-24">
                <SelectValue placeholder="Chart" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="area">Area</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Enhanced Data Summary Section */}
        {yearlyData.length > 0 && (
          <div className="mt-4 p-4 bg-muted/20 rounded-lg border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-foreground">Total Years</div>
                <div className="text-lg text-muted-foreground">{yearlyData.length}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">Latest Year</div>
                <div className="text-lg text-muted-foreground">{formatCurrency(yearlyData[0]?.totalSpending || 0)}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">Categories</div>
                <div className="text-lg text-muted-foreground">{Math.max(0, availableCategories.length - 2)}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">Total Transactions</div>
                <div className="text-lg text-muted-foreground">
                  {yearlyData.reduce((sum, year) => sum + year.transactionCount, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* YoY Growth indicator with improved layout */}
        {yoyMetrics && availableYears.length > 1 && (
          <div className="mt-3 space-y-3">
            {/* Main metric growth */}
            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {getMetricGrowth(selectedMetric) > 0 ? (
                    <TrendingUp className={`h-4 w-4 flex-shrink-0 ${selectedMetric === 'spending' ? 'text-red-500' : 'text-green-500'}`} />
                  ) : (
                    <TrendingDown className={`h-4 w-4 flex-shrink-0 ${selectedMetric === 'spending' ? 'text-green-500' : 'text-red-500'}`} />
                  )}
                  <span className={`font-semibold ${
                    (selectedMetric === 'spending' && getMetricGrowth(selectedMetric) > 0) || 
                    (selectedMetric !== 'spending' && getMetricGrowth(selectedMetric) < 0) 
                      ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {getMetricGrowth(selectedMetric) > 0 ? '+' : ''}{getMetricGrowth(selectedMetric).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground text-xs capitalize">
                    {selectedMetric} vs {availableYears[1]}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">
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

            {/* Insights and alerts */}
            {(insights.trends.length > 0 || insights.alerts.length > 0 || predictiveInsights.length > 0) && (
              <div className="space-y-3">
                {/* Traditional insights */}
                {(insights.trends.length > 0 || insights.alerts.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {insights.trends.slice(0, 2).map((trend, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
                        <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-blue-700 dark:text-blue-300">{trend}</span>
                      </div>
                    ))}
                    {insights.alerts.slice(0, 2).map((alert, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs">
                        <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-amber-700 dark:text-amber-300">{alert}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Predictive Analytics Toggle */}
                {predictiveInsights.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-500" />
                        Predictive Analytics
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPredictive(!showPredictive)}
                        className="text-xs"
                      >
                        {showPredictive ? 'Hide' : 'Show'} Predictions
                      </Button>
                    </div>

                    {showPredictive && (
                      <div className="space-y-2">
                        {/* High-confidence predictions */}
                        {predictiveInsights
                          .filter(insight => insight.confidence >= 80)
                          .slice(0, 3)
                          .map((insight, index) => (
                            <div key={index} className={`flex items-start gap-2 p-2 rounded text-xs ${
                              insight.type === 'alert' ? 'bg-red-50 dark:bg-red-950/20' :
                              insight.type === 'recommendation' ? 'bg-green-50 dark:bg-green-950/20' :
                              insight.type === 'forecast' ? 'bg-purple-50 dark:bg-purple-950/20' :
                              'bg-blue-50 dark:bg-blue-950/20'
                            }`}>
                              <div className="flex items-center gap-1">
                                {insight.type === 'alert' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                                {insight.type === 'recommendation' && <Target className="h-3 w-3 text-green-500" />}
                                {insight.type === 'forecast' && <TrendingUp className="h-3 w-3 text-purple-500" />}
                                {insight.type === 'trend' && <Info className="h-3 w-3 text-blue-500" />}
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {insight.confidence}%
                                </Badge>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-foreground">{insight.title}</div>
                                <div className={`${
                                  insight.type === 'alert' ? 'text-red-700 dark:text-red-300' :
                                  insight.type === 'recommendation' ? 'text-green-700 dark:text-green-300' :
                                  insight.type === 'forecast' ? 'text-purple-700 dark:text-purple-300' :
                                  'text-blue-700 dark:text-blue-300'
                                }`}>
                                  {insight.description}
                                </div>
                                {insight.value && (
                                  <div className="text-muted-foreground mt-1">
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

                        {/* Spending Forecast */}
                        {spendingForecast.length > 0 && (
                          <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded">
                            <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
                              6-Month Spending Forecast
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {spendingForecast.slice(0, 3).map((forecast, index) => (
                                <div key={index} className="text-center">
                                  <div className="font-medium">{forecast.month}</div>
                                  <div className="text-muted-foreground">
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
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: viewMode === 'monthly' ? 60 : 20
              }}
              onClick={handleChartClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis
                dataKey="period"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickLine={{ stroke: 'var(--border)' }}
                axisLine={{ stroke: 'var(--border)' }}
                angle={viewMode === 'monthly' ? -45 : 0}
                textAnchor={viewMode === 'monthly' ? 'end' : 'middle'}
                height={viewMode === 'monthly' ? 70 : 40}
                interval={viewMode === 'monthly' ? 'preserveStartEnd' : 0}
                tickMargin={10}
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value/1000000).toFixed(0)}M`;
                  if (value >= 1000) return `${(value/1000).toFixed(0)}k`;
                  return `${value}`;
                }}
                tickLine={{ stroke: 'var(--border)' }}
                axisLine={{ stroke: 'var(--border)' }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted-foreground)', fillOpacity: 0.1 }} />
              <Legend
                wrapperStyle={{ paddingTop: '30px' }}
                iconSize={14}
                formatter={(value) => (
                  <span style={{ fontSize: '13px', color: 'var(--foreground)' }}>{value}</span>
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

                const color = `hsl(${(index * 130 + 200) % 360}, 70%, 60%)`;

                return (
                  <DataComponent
                    key={`${year}-${dataKey}`}
                    dataKey={value => {
                      if (value.year !== year) return null;
                      return value[dataKey] || 0;
                    }}
                    type="monotone"
                    name={`${year} - ${name}`}
                    fill={color}
                    stroke={chartType !== 'bar' ? color : undefined}
                    strokeWidth={chartType !== 'bar' ? 2 : undefined}
                    dot={chartType === 'line' ? { r: 4, strokeWidth: 1 } : false}
                    activeDot={chartType === 'line' ? { r: 6, strokeWidth: 2 } : undefined}
                    fillOpacity={chartType === 'area' ? 0.3 : 0.9}
                    barSize={20}
                  />
                );
              })}
              
              {chartData.length === 0 && (
                <text x="50%" y="50%" textAnchor="middle" fill="var(--muted-foreground)">
                  No data to display for the selected period.
                </text>
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
        
        {/* Enhanced Category/Metric selector with tabs */}
        <div className="mt-8 pt-6 border-t">
          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="metrics">
                <Target className="h-4 w-4 mr-2" />
                Key Metrics
              </TabsTrigger>
              <TabsTrigger value="categories">
                <BarChart3 className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="metrics" className="mt-4">
              <div className="flex flex-wrap justify-center gap-3">
                {['totalSpending', 'totalIncome'].map((metric) => (
                  <Button
                    key={metric}
                    variant={selectedCategory === metric ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedCategory(metric)}
                    className="text-xs px-4 py-2 rounded-full"
                  >
                    {metric === 'totalSpending' ? 'Total Spending' : 'Total Income'}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="categories" className="mt-4">
              <div className="flex flex-wrap justify-center gap-2 max-h-40 overflow-y-auto p-2 bg-muted/30 rounded-lg">
                {availableCategories.filter(c => !['totalSpending', 'totalIncome'].includes(c)).slice(0, 25).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs px-3 py-1"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Validation Section */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Data Validation</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runValidation}
              disabled={isValidating || !currentUserId}
              className="text-xs"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Info className="h-3 w-3 mr-1" />
                  Run Validation
                </>
              )}
            </Button>
          </div>
          
          {validationReport && (
            <div className="bg-muted p-3 rounded-md text-xs">
              <pre className="whitespace-pre-wrap font-mono text-xs overflow-auto max-h-40">
                {validationReport}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const YearOverYearComparison = memo(YearOverYearComparisonComponent);
YearOverYearComparison.displayName = 'YearOverYearComparison';