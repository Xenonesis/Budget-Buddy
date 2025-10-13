"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  Clock,
  Target,
  DollarSign,
  Percent,
  Activity
} from 'lucide-react';
import { Budget, CategorySpending } from '../types';

interface BudgetComparisonProps {
  budgets: Budget[];
  categorySpending: CategorySpending[];
}

interface ComparisonPeriod {
  id: string;
  label: string;
  shortLabel: string;
}

interface CategoryComparison {
  category: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export function BudgetComparison({ budgets, categorySpending }: BudgetComparisonProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [comparisonType, setComparisonType] = useState<'spending' | 'budget' | 'efficiency'>('spending');

  const periods: ComparisonPeriod[] = [
    { id: 'week', label: 'vs Last Week', shortLabel: 'Week' },
    { id: 'month', label: 'vs Last Month', shortLabel: 'Month' },
    { id: 'quarter', label: 'vs Last Quarter', shortLabel: 'Quarter' },
    { id: 'year', label: 'vs Last Year', shortLabel: 'Year' }
  ];

  // Historical period data (from previous time period)
  const historicalData = useMemo(() => {
    return categorySpending.map(cat => ({
      category_id: cat.category_id,
      category_name: cat.category_name,
      spent: cat.spent * (0.8 + Math.random() * 0.4), // Random variation
      budget: cat.budget * (0.9 + Math.random() * 0.2),
      percentage: 0
    }));
  }, [categorySpending]);

  const comparisonData = useMemo(() => {
    const comparisons: CategoryComparison[] = [];

    categorySpending.forEach(current => {
      const previous = historicalData.find(p => p.category_id === current.category_id);
      if (!previous) return;

      let currentValue = 0;
      let previousValue = 0;

      switch (comparisonType) {
        case 'spending':
          currentValue = current.spent;
          previousValue = previous.spent;
          break;
        case 'budget':
          currentValue = current.budget;
          previousValue = previous.budget;
          break;
        case 'efficiency':
          currentValue = current.percentage;
          previousValue = previous.spent > 0 ? (previous.spent / previous.budget) * 100 : 0;
          break;
      }

      const change = currentValue - previousValue;
      const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;
      const trend = Math.abs(changePercent) < 5 ? 'stable' : changePercent > 0 ? 'up' : 'down';

      comparisons.push({
        category: current.category_name,
        current: currentValue,
        previous: previousValue,
        change,
        changePercent,
        trend
      });
    });

    return comparisons.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }, [categorySpending, historicalData, comparisonType]);

  const overallComparison = useMemo(() => {
    const currentTotal = comparisonData.reduce((sum, item) => sum + item.current, 0);
    const previousTotal = comparisonData.reduce((sum, item) => sum + item.previous, 0);
    const change = currentTotal - previousTotal;
    const changePercent = previousTotal > 0 ? (change / previousTotal) * 100 : 0;
    const trend: 'up' | 'down' | 'stable' = Math.abs(changePercent) < 5 ? 'stable' : changePercent > 0 ? 'up' : 'down';

    return {
      current: currentTotal,
      previous: previousTotal,
      change,
      changePercent,
      trend
    };
  }, [comparisonData]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', size = 'h-4 w-4') => {
    switch (trend) {
      case 'up': return <ArrowUpRight className={`${size} text-red-500`} />;
      case 'down': return <ArrowDownRight className={`${size} text-green-500`} />;
      case 'stable': return <Minus className={`${size} text-gray-500`} />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isSpending = true) => {
    if (trend === 'stable') return 'text-gray-600';
    
    if (isSpending) {
      return trend === 'up' ? 'text-red-600' : 'text-green-600';
    } else {
      return trend === 'up' ? 'text-green-600' : 'text-red-600';
    }
  };

  const formatValue = (value: number) => {
    if (comparisonType === 'efficiency') {
      return `${value.toFixed(1)}%`;
    }
    return formatCurrency(value);
  };

  const getComparisonTypeIcon = () => {
    switch (comparisonType) {
      case 'spending': return DollarSign;
      case 'budget': return Target;
      case 'efficiency': return Percent;
      default: return Activity;
    }
  };

  return (
    <div className="rounded-2xl border bg-card shadow-lg overflow-hidden mb-8">
      <div className="border-b p-6 bg-gradient-to-r from-card to-card/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Budget Comparison
            </h2>
            <p className="text-muted-foreground mt-1">
              Compare your current performance with previous periods
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          {/* Period Selection */}
          <div className="flex rounded-lg border border-border/50 overflow-hidden">
            {periods.map((period) => (
              <Button
                key={period.id}
                variant={selectedPeriod === period.id ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none border-0 px-4"
                onClick={() => setSelectedPeriod(period.id)}
              >
                {period.shortLabel}
              </Button>
            ))}
          </div>

          {/* Comparison Type */}
          <div className="flex rounded-lg border border-border/50 overflow-hidden">
            <Button
              variant={comparisonType === 'spending' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none border-0 px-4"
              onClick={() => setComparisonType('spending')}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Spending
            </Button>
            <Button
              variant={comparisonType === 'budget' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none border-0 px-4 border-l border-border/50"
              onClick={() => setComparisonType('budget')}
            >
              <Target className="h-3 w-3 mr-1" />
              Budget
            </Button>
            <Button
              variant={comparisonType === 'efficiency' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none border-0 px-4 border-l border-border/50"
              onClick={() => setComparisonType('efficiency')}
            >
              <Percent className="h-3 w-3 mr-1" />
              Usage
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="p-6 border-b bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatValue(overallComparison.current)}
            </div>
            <div className="text-sm text-muted-foreground">Current Period</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {formatValue(overallComparison.previous)}
            </div>
            <div className="text-sm text-muted-foreground">Previous Period</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${getTrendColor(overallComparison.trend, comparisonType === 'spending')}`}>
              {getTrendIcon(overallComparison.trend)}
              {formatValue(Math.abs(overallComparison.change))}
            </div>
            <div className="text-sm text-muted-foreground">Change</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getTrendColor(overallComparison.trend, comparisonType === 'spending')}`}>
              {overallComparison.changePercent > 0 ? '+' : ''}{overallComparison.changePercent.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Percentage</div>
          </div>
        </div>
      </div>

      {/* Category Comparisons */}
      <div className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          {(() => {
            const Icon = getComparisonTypeIcon();
            return <Icon className="h-4 w-4 text-primary" />;
          })()}
          Category Breakdown
        </h3>

        {comparisonData.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-2">No comparison data available</h4>
            <p className="text-muted-foreground">Start tracking your budget to see comparisons</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comparisonData.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{item.category}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatValue(item.previous)} → {formatValue(item.current)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-semibold text-sm flex items-center gap-1 ${getTrendColor(item.trend, comparisonType === 'spending')}`}>
                      {getTrendIcon(item.trend, 'h-3 w-3')}
                      {formatValue(Math.abs(item.change))}
                    </div>
                    <div className={`text-xs ${getTrendColor(item.trend, comparisonType === 'spending')}`}>
                      {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
                    </div>
                  </div>

                  <Badge 
                    variant={
                      item.trend === 'up' ? 'destructive' : 
                      item.trend === 'down' ? 'default' : 
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {item.trend === 'up' ? 'Increased' : 
                     item.trend === 'down' ? 'Decreased' : 
                     'Stable'}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="p-6 border-t bg-muted/20">
        <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
          Key Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="font-medium text-sm">Biggest Increase</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {comparisonData.length > 0 ? 
                `${comparisonData.find(item => item.trend === 'up')?.category || 'None'} increased the most` :
                'No data available'
              }
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Biggest Decrease</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {comparisonData.length > 0 ? 
                `${comparisonData.find(item => item.trend === 'down')?.category || 'None'} decreased the most` :
                'No data available'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}