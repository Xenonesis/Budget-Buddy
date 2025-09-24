"use client";

import React, { memo, useMemo, useState, useEffect } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, LineChart, Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Custom tooltip component extracted outside for better performance
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  viewMode: ViewMode;
  showNet: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, viewMode, showNet }) => {
  if (active && payload?.length) {
    const data = payload[0].payload;
    
    const getSavingsRateColor = (rate: number) => {
      if (rate >= 20) return 'text-green-600';
      if (rate >= 10) return 'text-yellow-600';
      return 'text-red-600';
    };

    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-2">
          {(viewMode === 'all' || viewMode === 'income') && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <span className="font-medium text-emerald-600">{formatCurrency(data.income)}</span>
            </div>
          )}
          {(viewMode === 'all' || viewMode === 'expenses') && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
              <span className="font-medium text-red-600">{formatCurrency(data.expense)}</span>
            </div>
          )}
          {showNet && viewMode === 'all' && (
            <>
              <div className="h-px bg-border my-2"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${data.net >= 0 ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
                  <span className="text-sm text-muted-foreground">Net Balance</span>
                </div>
                <span className={`font-medium ${data.net >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
                  {formatCurrency(data.net)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Savings Rate</span>
                <span className={`text-xs font-medium ${getSavingsRateColor(data.savingsRate)}`}>
                  {data.savingsRate.toFixed(1)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Legend formatter component
const LegendFormatter = (value: string, entry: any, fontSize: number) => (
  <span style={{ color: entry.color, fontSize, fontWeight: 500 }}>
    {value}
  </span>
);

interface MonthlyData {
  name: string;
  income: number;
  expense: number;
}

interface IncomeExpenseChartProps {
  readonly monthlyData: MonthlyData[];
}

type ChartType = 'composed' | 'area' | 'bar';
type ViewMode = 'all' | 'income' | 'expenses';

function IncomeExpenseChartComponent({ monthlyData }: IncomeExpenseChartProps) {
  const [chartType, setChartType] = useState<ChartType>('composed');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [showNet, setShowNet] = useState(true);
  const [windowWidth, setWindowWidth] = useState(768);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Enhanced chart data with additional calculations
  const chartData = useMemo(() => {
    return monthlyData.map((item, index) => ({
      ...item,
      net: item.income - item.expense,
      savingsRate: item.income > 0 ? ((item.income - item.expense) / item.income) * 100 : 0,
      expenseRatio: item.income > 0 ? (item.expense / item.income) * 100 : 0,
      index
    }));
  }, [monthlyData]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = chartData.reduce((sum, item) => sum + item.expense, 0);
    const netBalance = totalIncome - totalExpenses;
    const avgIncome = totalIncome / (chartData.length || 1);
    const avgExpenses = totalExpenses / (chartData.length || 1);
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100) : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netBalance,
      avgIncome,
      avgExpenses,
      savingsRate
    };
  }, [chartData]);

  // Responsive chart configuration
  const chartConfig = useMemo(() => {
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth < 1024;
    
    let margin;
    if (isMobile) {
      margin = { top: 20, right: 15, left: 50, bottom: 80 };
    } else if (isTablet) {
      margin = { top: 25, right: 25, left: 60, bottom: 90 };
    } else {
      margin = { top: 30, right: 30, left: 70, bottom: 100 };
    }
    
    let fontSize;
    if (isMobile) {
      fontSize = 10;
    } else if (isTablet) {
      fontSize = 11;
    } else {
      fontSize = 12;
    }
    
    const intervalThreshold = isMobile ? 6 : 8;
    const tickInterval = chartData.length > intervalThreshold ? 1 : 0;
    
    let height;
    if (isMobile) {
      height = 280;
    } else if (isTablet) {
      height = 320;
    } else {
      height = 400;
    }
    
    return {
      margin,
      fontSize,
      tickInterval,
      height
    };
  }, [windowWidth, chartData.length]);

  // Enhanced color scheme
  const colors = {
    income: {
      primary: '#059669',
      light: '#10B981',
      gradient: 'url(#incomeGradient)',
      bg: 'rgba(5, 150, 105, 0.1)'
    },
    expense: {
      primary: '#DC2626',
      light: '#EF4444',
      gradient: 'url(#expenseGradient)',
      bg: 'rgba(220, 38, 38, 0.1)'
    },
    net: {
      positive: '#7C3AED',
      negative: '#F59E0B',
      neutral: '#6B7280'
    }
  };

  // Helper functions for styling
  const getSavingsRateStyles = (rate: number) => {
    if (rate >= 20) {
      return {
        cardClass: 'from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50',
        textClass: 'text-green-700 dark:text-green-300',
        valueClass: 'text-green-800 dark:text-green-200',
        badge: 'default' as const,
        label: 'Excellent'
      };
    }
    if (rate >= 10) {
      return {
        cardClass: 'from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200/50',
        textClass: 'text-yellow-700 dark:text-yellow-300',
        valueClass: 'text-yellow-800 dark:text-yellow-200',
        badge: 'secondary' as const,
        label: 'Good'
      };
    }
    return {
      cardClass: 'from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200/50',
      textClass: 'text-red-700 dark:text-red-300',
      valueClass: 'text-red-800 dark:text-red-200',
      badge: 'destructive' as const,
      label: 'Needs Work'
    };
  };

  const savingsRateStyles = getSavingsRateStyles(metrics.savingsRate);

  // Empty state
  if (chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Income vs. Expenses
          </CardTitle>
          <CardDescription>Monthly financial flow comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-lg mb-2">No data available</p>
            <p className="text-sm text-muted-foreground">Start adding transactions to see your financial flow</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-red-500/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              Income vs. Expenses
            </CardTitle>
            <CardDescription className="mt-2">
              Monthly financial flow with {chartData.length} months of data
            </CardDescription>
          </div>
          
          {/* Chart Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="income" className="text-xs">Income</TabsTrigger>
                <TabsTrigger value="expenses" className="text-xs">Expenses</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-1">
              <Button 
                variant={chartType === 'composed' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartType('composed')}
                className="px-2 py-1 h-8"
              >
                <BarChart3 className="h-3 w-3" />
              </Button>
              <Button 
                variant={chartType === 'area' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartType('area')}
                className="px-2 py-1 h-8"
              >
                <LineChart className="h-3 w-3" />
              </Button>
              <Button 
                variant={chartType === 'bar' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartType('bar')}
                className="px-2 py-1 h-8"
              >
                <PieChart className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 rounded-lg p-3 border border-emerald-200/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Total Income</span>
            </div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
              {formatCurrency(metrics.totalIncome)}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              Avg: {formatCurrency(metrics.avgIncome)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-lg p-3 border border-red-200/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700 dark:text-red-300 font-medium">Total Expenses</span>
            </div>
            <div className="text-lg font-bold text-red-800 dark:text-red-200">
              {formatCurrency(metrics.totalExpenses)}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              Avg: {formatCurrency(metrics.avgExpenses)}
            </div>
          </div>

          <div className={`bg-gradient-to-br rounded-lg p-3 border ${
            metrics.netBalance >= 0 
              ? 'from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50'
              : 'from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200/50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1 rounded ${metrics.netBalance >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
                {metrics.netBalance >= 0 ? '💰' : '⚠️'}
              </div>
              <span className={`text-xs font-medium ${
                metrics.netBalance >= 0 
                  ? 'text-purple-700 dark:text-purple-300' 
                  : 'text-orange-700 dark:text-orange-300'
              }`}>
                Net Balance
              </span>
            </div>
            <div className={`text-lg font-bold ${
              metrics.netBalance >= 0 
                ? 'text-purple-800 dark:text-purple-200' 
                : 'text-orange-800 dark:text-orange-200'
            }`}>
              {formatCurrency(metrics.netBalance)}
            </div>
          </div>

          <div className={`bg-gradient-to-br rounded-lg p-3 border ${savingsRateStyles.cardClass}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`text-xs font-medium ${savingsRateStyles.textClass}`}>
                💡 Savings Rate
              </div>
            </div>
            <div className={`text-lg font-bold ${savingsRateStyles.valueClass}`}>
              {metrics.savingsRate.toFixed(1)}%
            </div>
            <Badge variant={savingsRateStyles.badge} className="text-xs">
              {savingsRateStyles.label}
            </Badge>
          </div>
        </div>

        {/* Net Balance Toggle */}
        {viewMode === 'all' && (
          <div className="flex items-center justify-end mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNet(!showNet)}
              className="text-xs h-7 px-2"
            >
              {showNet ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              Net Balance Line
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div style={{ height: chartConfig.height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={chartConfig.margin}>
              {/* Enhanced Gradients */}
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#EF4444" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.1"/>
                </filter>
              </defs>

              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="var(--border)" 
                opacity={0.3}
                horizontal={true}
                vertical={false}
              />
              
              <XAxis
                dataKey="name"
                tick={{ 
                  fill: 'var(--muted-foreground)', 
                  fontSize: chartConfig.fontSize,
                  fontWeight: 500
                }}
                tickLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                interval={chartConfig.tickInterval}
                angle={windowWidth < 768 ? -45 : 0}
                textAnchor={windowWidth < 768 ? "end" : "middle"}
                height={windowWidth < 768 ? 60 : 40}
                padding={{ left: 10, right: 10 }}
              />
              
              <YAxis
                tick={{ 
                  fill: 'var(--muted-foreground)', 
                  fontSize: chartConfig.fontSize - 1
                }}
                tickFormatter={(value) => {
                  if (value === 0) return '₹0';
                  if (value >= 10000000) return `₹${(value/10000000).toFixed(1)}Cr`;
                  if (value >= 100000) return `₹${(value/100000).toFixed(1)}L`;
                  if (value >= 1000) return `₹${(value/1000).toFixed(0)}K`;
                  return `₹${value}`;
                }}
                tickLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                width={chartConfig.margin.left}
              />
              
              <Tooltip content={<CustomTooltip viewMode={viewMode} showNet={showNet} />} />
              
              {viewMode !== 'expenses' && chartType !== 'bar' && (
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke={colors.income.primary}
                  strokeWidth={2.5}
                  fill={colors.income.gradient}
                  fillOpacity={chartType === 'area' ? 0.6 : 0.3}
                  activeDot={{ 
                    r: 6, 
                    stroke: '#ffffff', 
                    strokeWidth: 2,
                    fill: colors.income.primary,
                    filter: 'url(#shadow)'
                  }}
                  animationBegin={0}
                  animationDuration={1500}
                />
              )}

              {viewMode !== 'income' && (
                <Bar
                  dataKey="expense"
                  name="Expenses"
                  fill={colors.expense.primary}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={windowWidth < 768 ? 20 : 35}
                  animationBegin={200}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`expense-${entry.name}-${index}`} fill={colors.expense.primary} />
                  ))}
                </Bar>
              )}

              {viewMode !== 'expenses' && chartType === 'bar' && (
                <Bar
                  dataKey="income"
                  name="Income"
                  fill={colors.income.primary}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={windowWidth < 768 ? 20 : 35}
                  animationBegin={400}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`income-${entry.name}-${index}`} fill={colors.income.primary} />
                  ))}
                </Bar>
              )}

              {showNet && viewMode === 'all' && (
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Net Balance"
                  stroke={colors.net.positive}
                  strokeWidth={3}
                  strokeDasharray={chartData.some(d => d.net < 0) ? "5 5" : "none"}
                  dot={{ 
                    r: 4, 
                    strokeWidth: 2,
                    fill: colors.net.positive
                  }}
                  activeDot={{ 
                    r: 7, 
                    stroke: '#ffffff', 
                    strokeWidth: 2,
                    fill: colors.net.positive,
                    filter: 'url(#shadow)'
                  }}
                  animationBegin={600}
                  animationDuration={1500}
                />
              )}

              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
                iconSize={12}
                align="center"
                verticalAlign="bottom"
                formatter={(value, entry) => LegendFormatter(value, entry, chartConfig.fontSize)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export const IncomeExpenseChart = memo(IncomeExpenseChartComponent);
IncomeExpenseChart.displayName = 'IncomeExpenseChart';