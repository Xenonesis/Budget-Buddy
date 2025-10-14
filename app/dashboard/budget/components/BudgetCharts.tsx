"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
  ComposedChart, Area, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import { Budget, CategorySpending } from '../types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, BarChart2, PieChart as PieChartIcon, TrendingUp,
  DollarSign, ArrowUpCircle, AreaChart, GitBranch, 
  ListChecks, Info as InfoIcon, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced colors for charts with better contrast
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

interface BudgetChartsProps {
  budgets: Budget[];
  categorySpending: CategorySpending[];
}

export function BudgetCharts({ budgets, categorySpending }: BudgetChartsProps) {
  const [activeChart, setActiveChart] = useState<'distribution' | 'spending' | 'trends'>('distribution');
  const [spendingChartType, setSpendingChartType] = useState<'bar' | 'pie' | 'radial'>('bar');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Screen size detection for responsive layouts
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Check initially
    checkScreenSize();
    
    // Set up listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Data for budget distribution chart
  const budgetDistributionData = useMemo(() => {
    return budgets.map((budget, index) => ({
      name: budget.category_name || 'Uncategorized',
      value: budget.amount,
      color: COLORS[index % COLORS.length],
      id: budget.id
    }));
  }, [budgets]);

  // Calculate total budget for percentages
  const totalBudget = useMemo(() => {
    return budgets.reduce((sum, budget) => sum + budget.amount, 0);
  }, [budgets]);

  // Data for spending vs budget chart
  const spendingVsBudgetData = useMemo(() => {
    return categorySpending.map((category, index) => ({
      name: category.category_name,
      budget: category.budget,
      spent: category.spent,
      percentSpent: Math.min(category.percentage, 150), // Cap at 150% for visualization
      remaining: Math.max(category.budget - category.spent, 0),
      overBudgetAmount: category.percentage > 100 ? category.spent - category.budget : 0,
      color: COLORS[index % COLORS.length],
      overBudget: category.percentage > 100
    })).sort((a, b) => b.percentSpent - a.percentSpent); // Sort by percent spent
  }, [categorySpending]);

  // Pie chart data for spending
  const spendingPieData = useMemo(() => {
    return spendingVsBudgetData.map(item => ({
      name: item.name,
      value: item.spent,
      budget: item.budget,
      color: item.overBudget 
        ? '#EF4444' // Red for over budget
        : item.percentSpent > 90 
          ? '#F59E0B' // Amber for close to budget
          : '#10B981', // Green for under budget
      percentSpent: item.percentSpent
    }));
  }, [spendingVsBudgetData]);

  // Enhanced radial chart data with better color gradients
  const radialChartData = useMemo(() => {
    return spendingVsBudgetData.map((item, index) => {
      // Create color gradients based on spend percentage
      let fill;
      if (item.overBudget) {
        // Red gradient for over budget
        fill = item.percentSpent > 130 ? '#EF4444' : '#F87171';
      } else if (item.percentSpent > 90) {
        // Amber gradient for close to budget
        fill = item.percentSpent > 95 ? '#F59E0B' : '#FBBF24';
      } else {
        // Green gradient for under budget
        fill = item.percentSpent > 70 ? '#10B981' : '#34D399';
      }
      
      return {
        name: item.name,
        value: item.percentSpent,
        fill: fill,
        budget: item.budget,
        spent: item.spent,
        remaining: item.remaining,
        percentSpent: item.percentSpent,
        index: index
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Show top 6 for better visibility
  }, [spendingVsBudgetData]);

  // Current period trends data
  const monthlyTrendData = useMemo(() => {
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    
    const totalBudget = budgets.reduce((acc, budget) => acc + Number(budget.amount || 0), 0);
    const totalSpent = categorySpending.reduce((acc, category) => acc + Number(category.spent || 0), 0);
    
    return [{
      name: currentMonth,
      budget: totalBudget,
      spent: totalSpent,
      remaining: Math.max(totalBudget - totalSpent, 0),
      savings: Math.max(totalBudget - totalSpent, 0),
      overBudget: totalSpent > totalBudget ? totalSpent - totalBudget : 0
    }];
  }, [budgets, categorySpending]);

  // Enhanced tooltip with more visual information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-xl p-5 shadow-xl text-foreground backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/50">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ background: payload[0]?.color || payload[0]?.fill }}
            />
            <h4 className="font-bold text-lg">{label}</h4>
          </div>
          
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="font-semibold text-lg">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          
          {activeChart === 'distribution' && payload[0] && (
            <div className="mt-3 pt-3 border-t border-border/50 text-sm text-muted-foreground flex justify-between">
              <span>Percentage of total:</span>
              <span className="font-medium">
                {((payload[0].value / totalBudget) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Enhanced spending tooltip with budget comparison
  const SpendingTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the full data entry for this category
      const categoryData = spendingVsBudgetData.find(item => item.name === label);
      
      return (
        <div className="bg-card border rounded-xl p-5 shadow-xl text-foreground backdrop-blur-sm min-w-[280px]">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ background: payload[0]?.color || payload[0]?.fill }}
            />
            <h4 className="font-bold text-lg">{label}</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-semibold text-lg">{formatCurrency(categoryData?.budget || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Spent:</span>
              <span className={`font-semibold text-lg ${
                categoryData?.overBudget ? "text-red-500" : "text-emerald-500"
              }`}>
                {formatCurrency(categoryData?.spent || 0)}
              </span>
            </div>
            
            {categoryData?.overBudget ? (
              <div className="flex items-center justify-between bg-red-500/10 p-3 rounded-lg">
                <span className="text-red-700 dark:text-red-300">Over by:</span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(categoryData?.overBudgetAmount || 0)}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-emerald-500/10 p-3 rounded-lg">
                <span className="text-emerald-700 dark:text-emerald-300">Remaining:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(categoryData?.remaining || 0)}
                </span>
              </div>
            )}
            
            <div className="pt-3 border-t border-border/50 flex items-center justify-between">
              <span className="text-muted-foreground">Percent used:</span>
              <span className={`font-bold text-lg ${
                (categoryData?.percentSpent || 0) > 100 
                  ? "text-red-500" 
                  : (categoryData?.percentSpent || 0) > 90 
                    ? "text-amber-500" 
                    : "text-emerald-500"
              }`}>
                {Math.round(categoryData?.percentSpent || 0)}%
              </span>
            </div>
            
            {/* Progress bar visualization */}
            <div className="pt-2">
              <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    (categoryData?.percentSpent || 0) > 100 
                      ? "bg-red-500" 
                      : (categoryData?.percentSpent || 0) > 90 
                        ? "bg-amber-500" 
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(categoryData?.percentSpent || 0, 100)}%` }}
                />
                {/* 100% marker */}
                <div 
                  className="absolute top-0 h-full w-0.5 bg-foreground/30"
                  style={{ left: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Monthly trend tooltip
  const TrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-card border rounded-xl p-5 shadow-xl text-foreground backdrop-blur-sm min-w-[280px]">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
            <Calendar className="h-5 w-5 text-primary" />
            <h4 className="font-bold text-lg">{label}</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-semibold text-lg">{formatCurrency(data.budget)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Spent:</span>
              <span className={`font-semibold text-lg ${
                data.spent > data.budget ? "text-red-500" : "text-emerald-500"
              }`}>
                {formatCurrency(data.spent)}
              </span>
            </div>
            
            {data.spent > data.budget ? (
              <div className="flex items-center justify-between bg-red-500/10 p-3 rounded-lg">
                <span className="text-red-700 dark:text-red-300">Over Budget:</span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(data.overBudget)}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-emerald-500/10 p-3 rounded-lg">
                <span className="text-emerald-700 dark:text-emerald-300">Savings:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data.savings)}
                </span>
              </div>
            )}
            
            <div className="pt-3 border-t border-border/50 flex items-center justify-between">
              <span className="text-muted-foreground">Budget Used:</span>
              <span className={`font-bold text-lg ${
                data.spent > data.budget ? "text-red-500" : 
                data.spent > data.budget * 0.9 ? "text-amber-500" : "text-emerald-500"
              }`}>
                {data.budget > 0 ? ((data.spent / data.budget) * 100).toFixed(1) : 0}%
              </span>
            </div>
            
            {/* Progress bar visualization */}
            <div className="pt-2">
              <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    data.spent > data.budget ? "bg-red-500" : 
                    data.spent > data.budget * 0.9 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min((data.spent / data.budget) * 100 || 0, 100)}%` }}
                />
                {/* 100% marker */}
                <div 
                  className="absolute top-0 h-full w-0.5 bg-foreground/30"
                  style={{ left: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart that shows percentages more clearly
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="border-b p-4 sm:p-5">
        <h2 className="text-xl font-bold">Budget Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize and analyze your budget allocation and spending
        </p>
      </div>

      {/* Mobile-optimized chart navigation */}
      <div className="p-4 sm:p-5 border-b overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max space-x-2">
          <Button
            variant={activeChart === 'distribution' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChart('distribution')}
            className="px-4 text-sm h-10 whitespace-nowrap rounded-lg shadow-sm"
          >
            <PieChartIcon className="h-4 w-4 mr-2" />
            Budget Distribution
          </Button>
          <Button
            variant={activeChart === 'spending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChart('spending')}
            className="px-4 text-sm h-10 whitespace-nowrap rounded-lg shadow-sm"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Spending vs Budget
          </Button>
          <Button
            variant={activeChart === 'trends' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChart('trends')}
            className="px-4 text-sm h-10 whitespace-nowrap rounded-lg shadow-sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Monthly Trends
          </Button>
        </div>
      </div>

      {/* Chart display area */}
      <div className="p-2 sm:p-4 md:p-6">
        {/* Budget Distribution Chart */}
        {activeChart === 'distribution' && (
          <div>
            {budgetDistributionData.length > 0 ? (
              <div>
                <div className="h-[300px] sm:h-[350px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius="90%"
                        innerRadius="0%"
                        fill="#8884d8"
                        dataKey="value"
                        label={renderCustomizedLabel}
                      >
                        {budgetDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconSize={8}
                        iconType="circle"
                        formatter={(value, entry: any, index) => {
                          const item = budgetDistributionData[index];
                          const percentage = ((item.value / totalBudget) * 100).toFixed(1);
                          return (
                            <span className="text-xs sm:text-sm">
                              {value}: <span className="font-medium">{percentage}%</span>
                            </span>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center mt-2">
                  <div className="bg-primary/10 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-primary flex items-center gap-1.5">
                    <DollarSign size={16} />
                    Total Budget: {formatCurrency(totalBudget)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <PieChartIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1">No budget data available</h3>
                <p className="text-sm text-muted-foreground mb-6">Add some budgets to see your distribution</p>
              </div>
            )}
          </div>
        )}

        {/* Spending vs Budget Chart */}
        {activeChart === 'spending' && (
          <div>
            {spendingVsBudgetData.length > 0 ? (
              <div>
                {/* Chart Type Selector - More compact for mobile */}
                <div className="flex justify-center mb-5">
                  <div className="flex border rounded-lg overflow-hidden shadow-sm">
                    <Button 
                      variant={spendingChartType === 'bar' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSpendingChartType('bar')}
                      className="h-10 rounded-none px-4 text-sm font-medium"
                    >
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Bar
                    </Button>
                    <Button 
                      variant={spendingChartType === 'pie' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSpendingChartType('pie')}
                      className="h-10 rounded-none px-4 text-sm font-medium"
                    >
                      <PieChartIcon className="h-4 w-4 mr-2" />
                      Pie
                    </Button>
                    <Button 
                      variant={spendingChartType === 'radial' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSpendingChartType('radial')}
                      className="h-10 rounded-none px-4 text-sm font-medium"
                    >
                      <GitBranch className="h-4 w-4 mr-2" />
                      Radial
                    </Button>
                  </div>
                </div>

                {/* Bar Chart View */}
                {spendingChartType === 'bar' && (
                  <div className="h-[350px] sm:h-[400px] md:h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={spendingVsBudgetData.slice(0, 7)} // Limit to top 7 for mobile
                        margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} tick={{ fill: 'var(--foreground)' }} />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={100} 
                          tickFormatter={(value) => 
                            value.length > 12 ? `${value.substring(0, 12)}...` : value
                          }
                          tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                        />
                        <Tooltip content={<SpendingTooltip />} />
                        <Legend />
                        <Bar dataKey="budget" name="Budget" fill="#6366F1" />
                        <Bar 
                          dataKey="spent" 
                          name="Spent" 
                          fill="#EF4444"
                          background={{ fill: '#eee' }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Pie Chart View */}
                {spendingChartType === 'pie' && (
                  <div className="h-[300px] sm:h-[350px] md:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={spendingPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={renderCustomizedLabel}
                        >
                          {spendingPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<SpendingTooltip />} />
                        <Legend 
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          iconSize={8}
                          iconType="circle"
                          formatter={(value, entry: any, index) => {
                            const item = spendingPieData[index];
                            const percentage = item.percentSpent;
                            return (
                              <span className="text-xs sm:text-sm">
                                {value}
                                <span className={cn(
                                  "ml-2 text-xs font-medium",
                                  percentage > 100 ? "text-red-500" : 
                                  percentage > 90 ? "text-amber-500" : 
                                  "text-emerald-500"
                                )}>
                                  {Math.round(percentage)}%
                                </span>
                              </span>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                {/* Radial Chart View */}
                {spendingChartType === 'radial' && (
                  <div className="flex flex-col h-[350px] sm:h-[400px] md:h-[450px] w-full">
                    <div className="text-center mb-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Budget Utilization by Category (%)
                      </h3>
                    </div>
                    <div className="flex-1 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={isMobile ? "20%" : "15%"} 
                          outerRadius={isMobile ? "85%" : "90%"} 
                          barSize={isMobile ? 16 : 20}
                          data={radialChartData} 
                          startAngle={180} 
                          endAngle={0}
                        >
                          <RadialBar
                            background
                            dataKey="value"
                            cornerRadius={12}
                            label={{ 
                              position: 'insideStart', 
                              fill: '#fff',
                              fontWeight: 'bold',
                              fontSize: isMobile ? 10 : 12,
                              formatter: (value: any) => `${Math.round(Number(value) || 0)}%`,
                            }}
                            animationBegin={200}
                            animationDuration={1000}
                            animationEasing="ease-out"
                          />
                          <Legend 
                            iconSize={isMobile ? 8 : 10}
                            layout={isMobile ? "horizontal" : "vertical"}
                            verticalAlign={isMobile ? "bottom" : "middle"}
                            align={isMobile ? "center" : "right"}
                            wrapperStyle={{
                              paddingLeft: isMobile ? '0' : '20px',
                              paddingTop: isMobile ? '15px' : '0',
                              fontSize: isMobile ? '10px' : '12px',
                              maxWidth: '100%'
                            }}
                            formatter={(value, entry: any, index) => {
                              const item = radialChartData[index];
                              return (
                                <span className="text-xs sm:text-sm flex items-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-[150px]">
                                  <span className="truncate">{value}</span>
                                  <span className={cn(
                                    "ml-2 text-xs font-medium",
                                    (item.percentSpent || 0) > 100 ? "text-red-500" : 
                                    (item.percentSpent || 0) > 90 ? "text-amber-500" : 
                                    "text-emerald-500"
                                  )}>
                                    {Math.round(item.percentSpent || 0)}%
                                  </span>
                                </span>
                              );
                            }}
                          />
                          <Tooltip
                            content={<SpendingTooltip />}
                            cursor={{ fill: 'transparent' }}
                            wrapperStyle={{
                              backgroundColor: 'var(--background)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              padding: '8px 12px',
                              maxWidth: '250px',
                              color: 'var(--foreground)'
                            }}
                          />
                          <PolarAngleAxis
                            type="number"
                            domain={[0, 150]}
                            angleAxisId={0}
                            tick={false}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      
                      {/* Gradient legend */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-center mt-4 pb-2 space-x-3 pt-2">
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-emerald-500 rounded-full mr-1.5"></span>
                          <span className="text-xs">Under</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-amber-500 rounded-full mr-1.5"></span>
                          <span className="text-xs">Near</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-red-500 rounded-full mr-1.5"></span>
                          <span className="text-xs">Over</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-center text-xs text-muted-foreground">
                      Showing top {radialChartData.length} categories by percentage spent
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1">No spending data available</h3>
                <p className="text-sm text-muted-foreground mb-6">Track your expenses to see spending vs budget</p>
              </div>
            )}
          </div>
        )}

        {/* Monthly Trends Chart */}
        {activeChart === 'trends' && (
          <div>
            <div className="h-[300px] sm:h-[350px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyTrendData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    scale="band" 
                    tick={{ 
                      fill: 'var(--foreground)', 
                      fontWeight: 600,
                      fontSize: 12,
                      className: 'month-label'
                    }} 
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`} 
                    tick={{ fill: 'var(--foreground)' }} 
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Legend 
                    iconSize={8}
                    formatter={(value, entry: any) => (
                      <span className="text-xs sm:text-sm">{value}</span>
                    )}
                  />
                  <Area type="monotone" dataKey="budget" fill="#A5B4FC" stroke="#6366F1" fillOpacity={0.3} />
                  <Bar dataKey="spent" barSize={20} fill="#F87171" />
                  <Line type="monotone" dataKey="savings" stroke="#10B981" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center items-center mt-3 text-xs sm:text-sm text-muted-foreground">
              <InfoIcon className="h-4 w-4 mr-1.5" />
              <span>This is a simulated 6-month trend based on your current data</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 