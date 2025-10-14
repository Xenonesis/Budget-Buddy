"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
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
  Info,
  RefreshCw,
  Database,
  Eye,
  EyeOff
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

interface EnhancedAnalytics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallUtilization: number;
  overBudgetCategories: CategorySpending[];
  nearLimitCategories: CategorySpending[];
  underUtilizedCategories: CategorySpending[];
  highestSpendingCategory: CategorySpending;
  mostEfficientCategory: CategorySpending;
  budgetDistribution: Array<{
    category: string;
    amount: number;
    percentage: number;
    spent: number;
    remaining: number;
    utilization: number;
  }>;
  spendingTrends: Array<{
    period: string;
    amount: number;
    budgetAmount: number;
    variance: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    budgetAmount: number;
    spentAmount: number;
    percentage: number;
    status: 'over' | 'near' | 'good' | 'under';
    variance: number;
  }>;
}

export function BudgetAnalytics({ budgets, categorySpending }: BudgetAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showDetails, setShowDetails] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [additionalData, setAdditionalData] = useState<{
    transactionCount: number;
    avgTransactionAmount: number;
    lastTransactionDate: string | null;
  }>({
    transactionCount: 0,
    avgTransactionAmount: 0,
    lastTransactionDate: null
  });

  // Fetch additional analytics data
  const fetchAdditionalData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Get transaction statistics
      const { data: transactionStats, error } = await supabase
        .from('transactions')
        .select('amount, date, type')
        .eq('user_id', userData.user.id)
        .eq('type', 'expense');

      if (error) throw error;

      const transactionCount = transactionStats?.length || 0;
      const totalAmount = transactionStats?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const avgTransactionAmount = transactionCount > 0 ? totalAmount / transactionCount : 0;
      
      // Get last transaction date
      const lastTransaction = transactionStats?.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      setAdditionalData({
        transactionCount,
        avgTransactionAmount,
        lastTransactionDate: lastTransaction?.date || null
      });
    } catch (error) {
      console.error('Error fetching additional analytics data:', error);
    }
  };

  useEffect(() => {
    if (budgets.length > 0 || categorySpending.length > 0) {
      fetchAdditionalData();
    }
  }, [budgets.length, categorySpending.length]);

  const analytics: EnhancedAnalytics = useMemo(() => {
    // Handle empty data gracefully
    if (!budgets.length && !categorySpending.length) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallUtilization: 0,
        overBudgetCategories: [],
        nearLimitCategories: [],
        underUtilizedCategories: [],
        highestSpendingCategory: { spent: 0, category_name: 'None', budget: 0, percentage: 0, category_id: '' },
        mostEfficientCategory: { percentage: 0, category_name: 'None', budget: 0, spent: 0, category_id: '' },
        budgetDistribution: [],
        spendingTrends: [],
        categoryPerformance: []
      };
    }

    const totalBudget = budgets.reduce((sum, budget) => sum + (budget.amount || 0), 0);
    const totalSpent = categorySpending.reduce((sum, cat) => sum + (cat.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Category analysis with better error handling
    const overBudgetCategories = categorySpending.filter(cat => 
      cat && typeof cat.percentage === 'number' && cat.percentage > 100
    );
    const nearLimitCategories = categorySpending.filter(cat => 
      cat && typeof cat.percentage === 'number' && cat.percentage > 80 && cat.percentage <= 100
    );
    const underUtilizedCategories = categorySpending.filter(cat => 
      cat && typeof cat.percentage === 'number' && cat.percentage < 50 && cat.percentage > 0
    );

    // Spending patterns with safe defaults
    const highestSpendingCategory = categorySpending.length > 0 
      ? categorySpending.reduce((max, cat) => 
          (cat?.spent || 0) > (max?.spent || 0) ? cat : max, 
          categorySpending[0]
        )
      : { spent: 0, category_name: 'None', budget: 0, percentage: 0, category_id: '' };

    const categoriesWithSpending = categorySpending.filter(cat => 
      cat && typeof cat.percentage === 'number' && cat.percentage > 0
    );
    const mostEfficientCategory = categoriesWithSpending.length > 0
      ? categoriesWithSpending.reduce((min, cat) => 
          (cat?.percentage || 100) < (min?.percentage || 100) ? cat : min
        )
      : { percentage: 0, category_name: 'None', budget: 0, spent: 0, category_id: '' };

    // Enhanced budget distribution with spending data
    const budgetDistribution = budgets.map(budget => {
      const spending = categorySpending.find(cat => cat.category_id === budget.category_id);
      const spent = spending?.spent || 0;
      const remaining = (budget.amount || 0) - spent;
      const utilization = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        category: budget.category_name || 'Unknown',
        amount: budget.amount || 0,
        percentage: totalBudget > 0 ? ((budget.amount || 0) / totalBudget) * 100 : 0,
        spent,
        remaining,
        utilization
      };
    }).sort((a, b) => b.amount - a.amount);

    // Category performance analysis
    const categoryPerformance = categorySpending.map(cat => {
      const variance = (cat.spent || 0) - (cat.budget || 0);
      let status: 'over' | 'near' | 'good' | 'under' = 'good';
      
      if (cat.percentage > 100) status = 'over';
      else if (cat.percentage > 80) status = 'near';
      else if (cat.percentage < 50) status = 'under';

      return {
        category: cat.category_name || 'Unknown',
        budgetAmount: cat.budget || 0,
        spentAmount: cat.spent || 0,
        percentage: cat.percentage || 0,
        status,
        variance
      };
    }).sort((a, b) => b.percentage - a.percentage);

    // Current period spending trends
    const spendingTrends = [
      {
        period: 'This Month',
        amount: totalSpent,
        budgetAmount: totalBudget,
        variance: totalSpent - totalBudget
      }
    ];

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
      budgetDistribution,
      spendingTrends,
      categoryPerformance
    };
  }, [budgets, categorySpending]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAdditionalData();
      // Trigger parent component refresh if needed
      setTimeout(() => setIsRefreshing(false), 1000);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      setIsRefreshing(false);
    }
  };

  const insights: AnalyticsInsight[] = useMemo(() => {
    const insights: AnalyticsInsight[] = [];

    // Handle no data case
    if (!budgets.length && !categorySpending.length) {
      insights.push({
        id: 'no-data',
        type: 'info',
        title: 'No Budget Data',
        description: 'Create budgets and add transactions to see analytics',
        action: 'Start by setting up your first budget'
      });
      return insights;
    }

    // Data quality insight
    if (additionalData.transactionCount > 0) {
      insights.push({
        id: 'data-quality',
        type: 'info',
        title: 'Data Overview',
        description: `Analysis based on ${additionalData.transactionCount} transactions`,
        value: `Avg: ${formatCurrency(additionalData.avgTransactionAmount)}`,
        action: additionalData.lastTransactionDate 
          ? `Last transaction: ${new Date(additionalData.lastTransactionDate).toLocaleDateString()}`
          : 'No recent transactions'
      });
    }

    // Overall budget health
    if (analytics.totalBudget > 0) {
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
      } else if (analytics.overallUtilization > 0) {
        insights.push({
          id: 'budget-health-good',
          type: 'success',
          title: 'Budget on Track',
          description: 'Your spending is well within budget limits',
          value: `${analytics.overallUtilization.toFixed(1)}%`,
          trend: 'stable',
          action: 'Keep up the good work!'
        });
      } else {
        insights.push({
          id: 'no-spending',
          type: 'info',
          title: 'No Spending Recorded',
          description: 'You have budgets set but no expenses recorded',
          value: `${budgets.length} budget${budgets.length !== 1 ? 's' : ''} active`,
          action: 'Add some transactions to see spending analysis'
        });
      }
    }

    // Over budget categories
    if (analytics.overBudgetCategories.length > 0) {
      insights.push({
        id: 'over-budget',
        type: 'danger',
        title: 'Over Budget Categories',
        description: `${analytics.overBudgetCategories.length} categories are over budget`,
        value: analytics.overBudgetCategories.slice(0, 3).map(cat => cat.category_name).join(', ') + 
               (analytics.overBudgetCategories.length > 3 ? '...' : ''),
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
        value: analytics.nearLimitCategories.slice(0, 3).map(cat => cat.category_name).join(', ') +
               (analytics.nearLimitCategories.length > 3 ? '...' : ''),
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
        value: analytics.underUtilizedCategories.slice(0, 3).map(cat => cat.category_name).join(', ') +
               (analytics.underUtilizedCategories.length > 3 ? '...' : ''),
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

    // Most efficient category
    if (analytics.mostEfficientCategory.percentage > 0 && analytics.mostEfficientCategory.category_name !== 'None') {
      insights.push({
        id: 'most-efficient',
        type: 'success',
        title: 'Most Efficient Budget',
        description: `${analytics.mostEfficientCategory.category_name} has the best budget utilization`,
        value: `${analytics.mostEfficientCategory.percentage.toFixed(1)}%`,
        trend: 'stable',
        action: 'Great job staying within this budget!'
      });
    }

    return insights;
  }, [analytics, additionalData, budgets.length, categorySpending.length]);

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

  // Show empty state if no data
  if (!budgets.length && !categorySpending.length) {
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
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="p-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-full bg-muted h-20 w-20 flex items-center justify-center mx-auto mb-6"
          >
            <Database className="h-10 w-10 text-muted-foreground" />
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-xl font-bold mb-3"
          >
            No Analytics Data Available
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-muted-foreground mb-6 max-w-md mx-auto"
          >
            Create budgets and add transactions to see detailed analytics and insights about your spending patterns.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="space-y-3"
          >
            <div className="text-sm text-muted-foreground">
              <p>• Set up budgets for your expense categories</p>
              <p>• Add transactions to track your spending</p>
              <p>• Get personalized insights and recommendations</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 px-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="h-10 px-4"
            >
              {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRawData(!showRawData)}
              className="h-10 px-4"
            >
              <Database className="h-4 w-4 mr-2" />
              Debug
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

      {/* Debug Section */}
      <AnimatePresence>
        {showRawData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-b bg-muted/10"
          >
            <div className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Debug Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <h4 className="font-medium">Raw Data</h4>
                  <div className="bg-background/50 rounded p-3 font-mono">
                    <p>Budgets: {budgets.length}</p>
                    <p>Category Spending: {categorySpending.length}</p>
                    <p>Transaction Count: {additionalData.transactionCount}</p>
                    <p>Avg Transaction: {formatCurrency(additionalData.avgTransactionAmount)}</p>
                    <p>Last Transaction: {additionalData.lastTransactionDate || 'None'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Analytics Summary</h4>
                  <div className="bg-background/50 rounded p-3 font-mono">
                    <p>Total Budget: {formatCurrency(analytics.totalBudget)}</p>
                    <p>Total Spent: {formatCurrency(analytics.totalSpent)}</p>
                    <p>Utilization: {analytics.overallUtilization.toFixed(2)}%</p>
                    <p>Over Budget: {analytics.overBudgetCategories.length}</p>
                    <p>Near Limit: {analytics.nearLimitCategories.length}</p>
                    <p>Under-utilized: {analytics.underUtilizedCategories.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insights */}
      <div className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Smart Insights
          <Badge variant="secondary" className="ml-2">
            {insights.length}
          </Badge>
        </h3>
        
        {insights.length > 0 ? (
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
                  className={`rounded-lg border p-4 ${getInsightColor(insight.type)} hover:shadow-md transition-shadow duration-200`}
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
                        <div className="text-xs font-medium mb-2 bg-white/50 dark:bg-black/20 rounded px-2 py-1 inline-block">
                          {insight.value}
                        </div>
                      )}
                      {insight.action && (
                        <p className="text-xs font-medium opacity-75 italic">{insight.action}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No insights available yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add more budget data to generate insights</p>
          </div>
        )}
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
            <div className="p-6 space-y-8">
              {/* Enhanced Budget Distribution */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  Budget Distribution & Utilization
                </h4>
                <div className="space-y-3">
                  {analytics.budgetDistribution.length > 0 ? (
                    analytics.budgetDistribution.map((item, index) => (
                      <motion.div 
                        key={item.category} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div 
                            className="h-4 w-4 rounded-full bg-primary flex-shrink-0" 
                            style={{ opacity: Math.max(0.3, 1 - (index * 0.15)) }}
                          ></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{item.category}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.percentage.toFixed(1)}% of total budget
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <span>Budget: {formatCurrency(item.amount)}</span>
                              <span>Spent: {formatCurrency(item.spent)}</span>
                              <span>Remaining: {formatCurrency(item.remaining)}</span>
                              <span className={`font-medium ${
                                item.utilization > 100 ? 'text-red-600' : 
                                item.utilization > 80 ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {item.utilization.toFixed(1)}% used
                              </span>
                            </div>
                            <div className="mt-2 w-full bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  item.utilization > 100 ? 'bg-red-500' : 
                                  item.utilization > 80 ? 'bg-orange-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, item.utilization)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No budget distribution data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Category Performance */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Category Performance Overview
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  >
                    <div className="text-red-600 font-semibold text-2xl">{analytics.overBudgetCategories.length}</div>
                    <div className="text-red-600 text-sm font-medium">Over Budget</div>
                    <div className="text-xs text-red-600/70 mt-1">
                      {analytics.overBudgetCategories.length > 0 && 
                        `Avg: ${(analytics.overBudgetCategories.reduce((sum, cat) => sum + cat.percentage, 0) / analytics.overBudgetCategories.length).toFixed(1)}%`
                      }
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                  >
                    <div className="text-orange-600 font-semibold text-2xl">{analytics.nearLimitCategories.length}</div>
                    <div className="text-orange-600 text-sm font-medium">Near Limit</div>
                    <div className="text-xs text-orange-600/70 mt-1">80-100% used</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  >
                    <div className="text-green-600 font-semibold text-2xl">
                      {categorySpending.filter(cat => cat.percentage > 50 && cat.percentage <= 80).length}
                    </div>
                    <div className="text-green-600 text-sm font-medium">Healthy</div>
                    <div className="text-xs text-green-600/70 mt-1">50-80% used</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                  >
                    <div className="text-blue-600 font-semibold text-2xl">{analytics.underUtilizedCategories.length}</div>
                    <div className="text-blue-600 text-sm font-medium">Under-Utilized</div>
                    <div className="text-xs text-blue-600/70 mt-1">&lt;50% used</div>
                  </motion.div>
                </div>

                {/* Detailed Category Performance List */}
                {analytics.categoryPerformance.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3 text-sm text-muted-foreground">Detailed Performance</h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {analytics.categoryPerformance.map((category, index) => (
                        <motion.div
                          key={category.category}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 rounded bg-background/30 text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${
                              category.status === 'over' ? 'bg-red-500' :
                              category.status === 'near' ? 'bg-orange-500' :
                              category.status === 'under' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                            <span className="font-medium">{category.category}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span>{formatCurrency(category.spentAmount)} / {formatCurrency(category.budgetAmount)}</span>
                            <span className={`font-medium ${
                              category.percentage > 100 ? 'text-red-600' :
                              category.percentage > 80 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {category.percentage.toFixed(1)}%
                            </span>
                            <span className={`${category.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {category.variance > 0 ? '+' : ''}{formatCurrency(category.variance)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Insights */}
              {(analytics.totalBudget > 0 || analytics.totalSpent > 0) && (
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Additional Insights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-background/30">
                      <h5 className="font-medium mb-2 text-sm">Spending Efficiency</h5>
                      <div className="text-2xl font-bold text-primary mb-1">
                        {analytics.totalBudget > 0 ? (analytics.totalSpent / analytics.totalBudget * 100).toFixed(1) : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analytics.totalSpent < analytics.totalBudget ? 'Under budget' : 'Over budget'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/30">
                      <h5 className="font-medium mb-2 text-sm">Average Category Usage</h5>
                      <div className="text-2xl font-bold text-primary mb-1">
                        {categorySpending.length > 0 
                          ? (categorySpending.reduce((sum, cat) => sum + cat.percentage, 0) / categorySpending.length).toFixed(1)
                          : 0
                        }%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Across {categorySpending.length} categories
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}