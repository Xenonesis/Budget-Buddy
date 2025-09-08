"use client";

import { useState, useEffect } from 'react';
import { Budget, CategorySpending } from '../types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  Bell,
  X,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BudgetInsightsProps {
  budgets: Budget[];
  categorySpending: CategorySpending[];
  onClose?: () => void;
}

interface BudgetAlert {
  id: string;
  type: 'warning' | 'danger' | 'success' | 'info';
  title: string;
  message: string;
  category: string;
  action?: string;
}

interface SpendingPrediction {
  category: string;
  currentSpending: number;
  predictedSpending: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export function BudgetInsights({ budgets, categorySpending, onClose }: BudgetInsightsProps) {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [predictions, setPredictions] = useState<SpendingPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    generateInsights();
  }, [budgets, categorySpending]);

  const generateInsights = () => {
    const newAlerts: BudgetAlert[] = [];
    const newPredictions: SpendingPrediction[] = [];
    const newRecommendations: string[] = [];

    // Generate alerts based on spending patterns
    categorySpending.forEach(spending => {
      const budget = budgets.find(b => b.category_id === spending.category_id);
      if (!budget) return;

      const percentage = spending.percentage;

      if (percentage > 100) {
        newAlerts.push({
          id: `over-${spending.category_id}`,
          type: 'danger',
          title: 'Budget Exceeded',
          message: `${spending.category_name} has exceeded its budget by ${formatCurrency(spending.spent - budget.amount)}`,
          category: spending.category_name,
          action: 'Reduce spending or increase budget'
        });
      } else if (percentage > 85) {
        newAlerts.push({
          id: `warning-${spending.category_id}`,
          type: 'warning',
          title: 'Approaching Budget Limit',
          message: `${spending.category_name} is at ${Math.round(percentage)}% of budget`,
          category: spending.category_name,
          action: 'Monitor spending closely'
        });
      } else if (percentage < 50) {
        newAlerts.push({
          id: `success-${spending.category_id}`,
          type: 'success',
          title: 'Great Budget Control',
          message: `${spending.category_name} spending is well under control`,
          category: spending.category_name
        });
      }

      // Generate spending predictions (simplified)
      const predictedSpending = spending.spent * 1.1; // Simple 10% increase prediction
      const confidence = Math.random() * 30 + 70; // 70-100% confidence

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (percentage > 80) {
        trend = 'increasing';
      } else if (percentage < 30) {
        trend = 'decreasing';
      }

      newPredictions.push({
        category: spending.category_name,
        currentSpending: spending.spent,
        predictedSpending,
        confidence,
        trend
      });
    });

    // Generate recommendations
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = categorySpending.reduce((sum, s) => sum + s.spent, 0);
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    if (overallPercentage > 90) {
      newRecommendations.push("Consider reviewing your overall budget allocation");
      newRecommendations.push("Look for categories where you can reduce spending");
    } else if (overallPercentage < 50) {
      newRecommendations.push("You're doing great! Consider increasing budgets for essential categories");
    }

    const overBudgetCategories = categorySpending.filter(s => s.percentage > 100);
    if (overBudgetCategories.length > 0) {
      newRecommendations.push(`Focus on reducing spending in ${overBudgetCategories.length} over-budget categories`);
    }

    setAlerts(newAlerts);
    setPredictions(newPredictions);
    setRecommendations(newRecommendations);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'info': return <Bell className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-emerald-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card border rounded-xl shadow-sm overflow-hidden max-w-4xl w-full"
    >
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Budget Insights
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                AI-powered analysis and personalized recommendations
              </p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Smart Alerts</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent"></div>
          </div>

          <div className="grid gap-3">
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  className={`group relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                    alert.type === 'danger'
                      ? 'bg-gradient-to-r from-red-50 to-red-25 border-red-200/50 dark:from-red-950/20 dark:to-red-900/10 dark:border-red-800/50'
                      : alert.type === 'warning'
                      ? 'bg-gradient-to-r from-amber-50 to-amber-25 border-amber-200/50 dark:from-amber-950/20 dark:to-amber-900/10 dark:border-amber-800/50'
                      : alert.type === 'success'
                      ? 'bg-gradient-to-r from-emerald-50 to-emerald-25 border-emerald-200/50 dark:from-emerald-950/20 dark:to-emerald-900/10 dark:border-emerald-800/50'
                      : 'bg-gradient-to-r from-blue-50 to-blue-25 border-blue-200/50 dark:from-blue-950/20 dark:to-blue-900/10 dark:border-blue-800/50'
                  }`}
                >
                  {/* Decorative background element */}
                  <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 ${
                    alert.type === 'danger' ? 'bg-red-500' :
                    alert.type === 'warning' ? 'bg-amber-500' :
                    alert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                  } -mr-10 -mt-10 group-hover:scale-110 transition-transform`}></div>

                  <div className="relative flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-sm ${
                        alert.type === 'danger' ? 'bg-red-500/10 text-red-600' :
                        alert.type === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                        alert.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'
                      }`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{alert.message}</p>
                        {alert.action && (
                          <div className="mt-3 p-2 rounded-lg bg-white/50 dark:bg-black/20 border border-current/10">
                            <p className="text-xs font-medium text-primary">{alert.action}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="h-8 w-8 p-0 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Predictions Section */}
      {predictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Spending Predictions</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictions.slice(0, 4).map((prediction, index) => (
              <motion.div
                key={prediction.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-all"
              >
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm">{prediction.category}</span>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      prediction.trend === 'increasing' ? 'bg-red-500/10 text-red-600' :
                      prediction.trend === 'decreasing' ? 'bg-emerald-500/10 text-emerald-600' :
                      'bg-gray-500/10 text-gray-600'
                    }`}>
                      {getTrendIcon(prediction.trend)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Current</span>
                      <span className="font-medium text-sm">{formatCurrency(prediction.currentSpending)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Predicted</span>
                      <span className="font-semibold text-primary">{formatCurrency(prediction.predictedSpending)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Confidence</span>
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all"
                            style={{ width: `${prediction.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-emerald-600">{Math.round(prediction.confidence)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <Target className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Smart Recommendations</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent"></div>
          </div>

          <div className="grid gap-3">
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl border bg-gradient-to-r from-primary/5 to-primary/10 p-4 shadow-sm hover:shadow-md transition-all"
              >
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>

                <div className="relative flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/80 dark:bg-black/20 flex items-center justify-center shadow-sm">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{recommendation}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Enhanced Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pt-6 border-t"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Insights Summary</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-red-50 to-red-25 dark:from-red-950/20 dark:to-red-900/10 p-4 text-center shadow-sm hover:shadow-md transition-all"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="text-2xl font-bold text-red-600 mb-1">{alerts.filter(a => a.type === 'danger').length}</div>
              <div className="text-xs text-muted-foreground font-medium">Critical Alerts</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50 to-amber-25 dark:from-amber-950/20 dark:to-amber-900/10 p-4 text-center shadow-sm hover:shadow-md transition-all"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="text-2xl font-bold text-amber-600 mb-1">{alerts.filter(a => a.type === 'warning').length}</div>
              <div className="text-xs text-muted-foreground font-medium">Warnings</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50 to-emerald-25 dark:from-emerald-950/20 dark:to-emerald-900/10 p-4 text-center shadow-sm hover:shadow-md transition-all"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="text-2xl font-bold text-emerald-600 mb-1">{predictions.filter(p => p.trend === 'decreasing').length}</div>
              <div className="text-xs text-muted-foreground font-medium">Improving</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-blue-25 dark:from-blue-950/20 dark:to-blue-900/10 p-4 text-center shadow-sm hover:shadow-md transition-all"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="text-2xl font-bold text-blue-600 mb-1">{recommendations.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Tips</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);
}