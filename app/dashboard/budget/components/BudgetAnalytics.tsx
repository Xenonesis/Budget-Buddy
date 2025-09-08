"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Target,
  PieChart,
  Activity,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import { Budget, CategorySpending } from '../types';

interface BudgetAnalyticsProps {
  budgets: Budget[];
  categorySpending: CategorySpending[];
}

interface AnalyticsInsight {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  value?: string;
  trend?: 'up' | 'down' | 'stable';
  action?: string;
}

export function BudgetAnalytics({ budgets, categorySpending }: BudgetAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showDetails, setShowDetails] = useState(false);

  const analytics = useMemo(() => {
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = categorySpending.reduce((sum, cat) => sum + cat.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Category analysis
    const overBudgetCategories = categorySpending.filter(cat => cat.percentage > 100);
    const nearLimitCategories = categorySpending.filter(cat => cat.percentage > 80 && cat.percentage <= 100);
    const underUtilizedCategories = categorySpending.filter(cat => cat.percentage < 50);

    // Spending patterns
    const highestSpendingCategory = categorySpending.reduce((max, cat) => 
      cat.spent > max.spent ? cat : max, categorySpending[0] || { spent: 0, category_name: 'None' }
    );

    const mostEfficientCategory = categorySpending.reduce((min, cat) => 
      cat.percentage < min.percentage && cat.percentage > 0 ? cat : min, 
      categorySpending.find(cat => cat.percentage > 0) || { percentage: 0, category_name: 'None' }
    );

    // Budget distribution
    const budgetDistribution = budgets.map(budget => ({
      category: budget.category_name || 'Unknown',
      amount: budget.amount,
      percentage: totalBudget > 0 ? (budget.amount / totalBudget) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      overallUtilization,
      overBudgetCategories,
      nearLimitCategories,
      underUtilizedCategories,
      highestSpendingCategory,
      mostEfficientCategory,
      budgetDistribution
    };
  }, [budgets, categorySpending]);

  const insights: AnalyticsInsight[] = useMemo(() => {
    const insights: AnalyticsInsight[] = [];

    // Overall budget health
    if (analytics.overallUtilization > 90) {
      insights.push({
        id: 'budget-health-danger',
        type: 'danger',
        title: 'Budget Alert',
        description: 'You\'ve used over 90% of your total budget',
        value: `${analytics.overallUtilization.toFixed(1)}%`,
        trend: 'up',
        action: 'Consider reducing spending or adjusting budgets'
      });
    } else if (analytics.overallUtilization > 75) {
      insights.push({
        id: 'budget-health-warning',
        type: 'warning',
        title: 'Budget Watch',
        description: 'You\'re approaching your budget limits',
        value: `${analytics.overallUtilization.toFixed(1)}%`,
        trend: 'up',
        action: 'Monitor spending closely'
      });
    } else {
      insights.push({
        id: 'budget-health-good',
        type: 'success',
        title: 'Budget on Track',
        description: 'Your spending is well within budget limits',
        value: `${analytics.overallUtilization.toFixed(1)}%`,
        trend: 'stable',
        action: 'Keep up the good work!'
      });
    }

    // Over budget categories
    if (analytics.overBudgetCategories.length > 0) {
      insights.push({
        id: 'over-budget',
        type: 'danger',
        title: 'Over Budget Categories',
        description: `${analytics.overBudgetCategories.length} categories are over budget`,
        value: analytics.overBudgetCategories.map(cat => cat.category_name).join(', '),
        trend: 'up',
        action: 'Review and adjust these category budgets'
      });
    }

    // Near limit categories
    if (analytics.nearLimitCategories.length > 0) {
      insights.push({
        id: 'near-limit',
        type: 'warning',
        title: 'Approaching Limits',
        description: `${analytics.nearLimitCategories.length} categories are near their budget limits`,
        value: analytics.nearLimitCategories.map(cat => cat.category_name).join(', '),
        trend: 'up',
        action: 'Monitor these categories closely'
      });
    }

    // Under-utilized categories
    if (analytics.underUtilizedCategories.length > 0) {
      insights.push({
        id: 'under-utilized',
        type: 'info',
        title: 'Under-Utilized Budgets',
        description: `${analytics.underUtilizedCategories.length} categories are using less than 50% of their budget`,
        value: analytics.underUtilizedCategories.map(cat => cat.category_name).join(', '),
        trend: 'down',
        action: 'Consider reallocating funds to other categories'
      });
    }

    // Highest spending insight
    if (analytics.highestSpendingCategory.spent > 0) {
      insights.push({
        id: 'highest-spending',
        type: 'info',
        title: 'Top Spending Category',
        description: `${analytics.highestSpendingCategory.category_name} is your highest expense`,
        value: formatCurrency(analytics.highestSpendingCategory.spent),
        trend: 'up',
        action: 'Review if this aligns with your priorities'
      });
    }

    return insights;
  }, [analytics]);

  const getInsightIcon = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'danger': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getInsightColor = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'danger': return 'text-red-600 bg-red-50 border-red-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return ArrowUpRight;
      case 'down': return ArrowDownRight;
      default: return Activity;
    }
  };

  return (
    <div className="rounded-2xl border bg-card shadow-lg overflow-hidden mb-8">
      <div className="border-b p-6 bg-gradient-to-r from-card to-card/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Budget Analytics
            </h2>
            <p className="text-muted-foreground mt-1">
              Insights and trends from your spending data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="h-10 px-4"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-primary">{formatCurrency(analytics.totalBudget)}</div>
            <div className="text-sm text-muted-foreground">Total Budget</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-red-500">{formatCurrency(analytics.totalSpent)}</div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-green-500">{formatCurrency(analytics.totalRemaining)}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className={`text-2xl font-bold ${analytics.overallUtilization > 90 ? 'text-red-500' : analytics.overallUtilization > 75 ? 'text-orange-500' : 'text-green-500'}`}>
              {analytics.overallUtilization.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Utilization</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Smart Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            const TrendIcon = getTrendIcon(insight.trend);
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`rounded-lg border p-4 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      {insight.trend && (
                        <TrendIcon className="h-3 w-3" />
                      )}
                    </div>
                    <p className="text-xs mb-2 opacity-90">{insight.description}</p>
                    {insight.value && (
                      <div className="text-xs font-medium mb-2 bg-white/50 rounded px-2 py-1 inline-block">
                        {insight.value}
                      </div>
                    )}
                    {insight.action && (
                      <p className="text-xs font-medium opacity-75">{insight.action}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detailed Analytics */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t bg-muted/20"
          >
            <div className="p-6 space-y-6">
              {/* Budget Distribution */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  Budget Distribution
                </h4>
                <div className="space-y-2">
                  {analytics.budgetDistribution.slice(0, 5).map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full bg-primary`} style={{ opacity: 1 - (index * 0.15) }}></div>
                        <span className="font-medium text-sm">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{formatCurrency(item.amount)}</div>
                        <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Performance */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Category Performance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-red-600 font-semibold text-lg">{analytics.overBudgetCategories.length}</div>
                    <div className="text-red-600 text-sm">Over Budget</div>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="text-orange-600 font-semibold text-lg">{analytics.nearLimitCategories.length}</div>
                    <div className="text-orange-600 text-sm">Near Limit</div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-blue-600 font-semibold text-lg">{analytics.underUtilizedCategories.length}</div>
                    <div className="text-blue-600 text-sm">Under-Utilized</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}