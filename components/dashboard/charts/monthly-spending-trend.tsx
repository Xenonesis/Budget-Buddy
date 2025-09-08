"use client";

import React, { memo, useState, useMemo } from "react";
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
  Brush
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MonthlyTrendData {
  month: string;
  year: number;
  totalSpending: number;
  categoryBreakdown: { [category: string]: number };
  transactionCount: number;
}

interface MonthlySpendingTrendProps {
  data: MonthlyTrendData[];
  selectedCategories?: string[];
  onCategoryToggle?: (category: string) => void;
  showYearOverYear?: boolean;
  onMonthClick?: (month: string, year: number) => void;
}

// Color palette for different categories
const CATEGORY_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#F97316', '#6366F1', '#14B8A6', '#A855F7'
];

function MonthlySpendingTrendComponent({ 
  data, 
  selectedCategories = [], 
  onCategoryToggle,
  showYearOverYear = false,
  onMonthClick
}: MonthlySpendingTrendProps) {
  const [showBrush, setShowBrush] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  const [compareMode, setCompareMode] = useState<'none' | 'previous-year' | 'average'>('none');

  // Process data for the chart with year-over-year comparison
  const chartData = useMemo(() => {
    const timeRangeMap = {
      '3m': 3,
      '6m': 6,
      '1y': 12,
      'all': data.length
    };
    const filteredData = data.slice(-timeRangeMap[selectedTimeRange]);

    const processedData = filteredData.map(item => ({
      name: `${item.month} ${item.year}`,
      month: item.month,
      year: item.year,
      totalSpending: item.totalSpending,
      transactionCount: item.transactionCount,
      ...item.categoryBreakdown
    }));

    // Add comparison data if enabled
    if (compareMode === 'previous-year' && showYearOverYear) {
      return processedData.map(item => {
        const previousYearData = data.find(d => 
          d.month === item.month && d.year === item.year - 1
        );
        
        return {
          ...item,
          previousYearSpending: previousYearData?.totalSpending || 0,
          yoyGrowth: previousYearData 
            ? ((item.totalSpending - previousYearData.totalSpending) / previousYearData.totalSpending) * 100
            : 0
        };
      });
    }

    if (compareMode === 'average') {
      const monthlyValues = new Map<string, number[]>();
      
      // Calculate average for each month across all years
      data.forEach(item => {
        const existing = monthlyValues.get(item.month) || [];
        monthlyValues.set(item.month, [...existing, item.totalSpending]);
      });
      
      // Convert to actual averages
      const monthlyAverages = new Map<string, number>();
      monthlyValues.forEach((values, month) => {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        monthlyAverages.set(month, avg);
      });

      return processedData.map(item => ({
        ...item,
        monthlyAverage: monthlyAverages.get(item.month) || 0
      }));
    }

    return processedData;
  }, [data, selectedTimeRange, compareMode, showYearOverYear]);

  // Get all available categories
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    data.forEach(item => {
      Object.keys(item.categoryBreakdown).forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  }, [data]);

  // Calculate trend indicators
  const trendAnalysis = useMemo(() => {
    if (chartData.length < 2) return null;
    
    const current = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    const change = current.totalSpending - previous.totalSpending;
    const percentChange = (change / previous.totalSpending) * 100;
    
    return {
      change,
      percentChange,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }, [chartData]);

  // Calculate average spending
  const averageSpending = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((sum, item) => sum + item.totalSpending, 0) / chartData.length;
  }, [chartData]);

  // Custom tooltip with enhanced comparison data
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm">
          <div className="font-medium text-foreground mb-2">{label}</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Spending:</span>
              <span className="font-semibold">{formatCurrency(data.totalSpending)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transactions:</span>
              <span className="font-semibold">{data.transactionCount}</span>
            </div>
            
            {/* Year-over-year comparison */}
            {data.previousYearSpending > 0 && (
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Previous Year:</span>
                  <span>{formatCurrency(data.previousYearSpending)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">YoY Growth:</span>
                  <span className={`font-medium ${data.yoyGrowth > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {data.yoyGrowth > 0 ? '+' : ''}{data.yoyGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
            
            {/* Monthly average comparison */}
            {data.monthlyAverage > 0 && (
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Monthly Avg:</span>
                  <span>{formatCurrency(data.monthlyAverage)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">vs Average:</span>
                  <span className={`font-medium ${data.totalSpending > data.monthlyAverage ? 'text-red-500' : 'text-green-500'}`}>
                    {((data.totalSpending - data.monthlyAverage) / data.monthlyAverage * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
            
            {/* Category breakdown */}
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-1">Top Categories:</div>
              {Object.entries(data)
                .filter(([key, value]) => 
                  !['name', 'month', 'year', 'totalSpending', 'transactionCount', 'previousYearSpending', 'yoyGrowth', 'monthlyAverage'].includes(key) && 
                  typeof value === 'number' && value > 0
                )
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 3)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{category}:</span>
                    <span>{formatCurrency(amount as number)}</span>
                  </div>
                ))
              }
            </div>
            
            <div className="pt-2 border-t text-xs text-muted-foreground">
              Click for detailed breakdown
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle chart click for drill-down
  const handleChartClick = (data: any) => {
    if (data && data.month && data.year) {
      onMonthClick?.(data.month, data.year);
    }
  };

  // Handle category line toggle
  const handleCategoryToggle = (category: string) => {
    onCategoryToggle?.(category);
  };

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Monthly Spending Trend
          </CardTitle>
          <CardDescription>
            Track your spending patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-80 text-center p-4">
            <TrendingUp className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No spending data available to show trends.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Monthly Spending Trend
            </CardTitle>
            <CardDescription>
              Track your spending patterns over time
            </CardDescription>
          </div>
          
          {/* Controls */}
          <div className="flex gap-2">
            {/* Comparison mode selector */}
            {showYearOverYear && (
              <div className="flex gap-1">
                {(['none', 'previous-year', 'average'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={compareMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCompareMode(mode)}
                    className="text-xs px-2 py-1"
                  >
                    {mode === 'none' ? 'None' : mode === 'previous-year' ? 'YoY' : 'Avg'}
                  </Button>
                ))}
              </div>
            )}
            
            {/* Time range selector */}
            <div className="flex gap-1">
              {(['3m', '6m', '1y', 'all'] as const).map((range) => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
                  className="text-xs px-2 py-1"
                >
                  {range === 'all' ? 'All' : range.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Trend indicator */}
        {trendAnalysis && (
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              {trendAnalysis.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
              {trendAnalysis.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
              {trendAnalysis.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
              <span className={`font-medium ${
                trendAnalysis.trend === 'up' ? 'text-red-500' : 
                trendAnalysis.trend === 'down' ? 'text-green-500' : 'text-gray-500'
              }`}>
                {trendAnalysis.percentChange > 0 ? '+' : ''}{trendAnalysis.percentChange.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
            <div className="text-muted-foreground">
              Avg: {formatCurrency(averageSpending)}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 40, left: 60, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickLine={{ stroke: 'var(--border)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000) return `$${(value/1000).toFixed(1)}k`;
                  return `$${value}`;
                }}
                tickLine={{ stroke: 'var(--border)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Average spending reference line */}
              <ReferenceLine 
                y={averageSpending} 
                stroke="var(--muted-foreground)" 
                strokeDasharray="5 5"
                label={{ value: "Average", position: "top" }}
              />
              
              {/* Main spending line */}
              <Line
                type="monotone"
                dataKey="totalSpending"
                name="Total Spending"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#EF4444' }}
                activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2, fill: '#fff' }}
              />
              
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
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
              
              {/* Brush for zooming */}
              {showBrush && (
                <Brush 
                  dataKey="name" 
                  height={30} 
                  stroke="var(--primary)"
                  fill="var(--muted)"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Category toggles */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Show Category Trends:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBrush(!showBrush)}
              className="text-xs"
            >
              {showBrush ? 'Hide' : 'Show'} Zoom
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {allCategories.slice(0, 6).map((category, index) => (
              <Button
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryToggle(category)}
                className="text-xs px-2 py-1"
                style={{
                  backgroundColor: selectedCategories.includes(category) 
                    ? CATEGORY_COLORS[index % CATEGORY_COLORS.length] 
                    : undefined
                }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const MonthlySpendingTrend = memo(MonthlySpendingTrendComponent);
MonthlySpendingTrend.displayName = 'MonthlySpendingTrend';