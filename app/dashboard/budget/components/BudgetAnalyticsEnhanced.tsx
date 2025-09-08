"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Target,
  Calendar,
  DollarSign
} from 'lucide-react';
import { BudgetAnalytics } from './BudgetAnalytics';
import { HistoricalTrends } from './HistoricalTrends';
import { BudgetManagementTools } from './BudgetManagementTools';
import { Budget, CategorySpending } from '../types';

interface BudgetAnalyticsEnhancedProps {
  budgets: Budget[];
  categorySpending: CategorySpending[];
  onBudgetsUpdate: () => void;
}

interface AnalyticsSummary {
  totalTests: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  features: {
    basicAnalytics: boolean;
    historicalTrends: boolean;
    aiInsights: boolean;
    managementTools: boolean;
  };
  recommendations: string[];
}

export function BudgetAnalyticsEnhanced({ budgets, categorySpending, onBudgetsUpdate }: BudgetAnalyticsEnhancedProps) {
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);

  useEffect(() => {
    analyzeDataQuality();
  }, [budgets, categorySpending]);

  const analyzeDataQuality = async () => {
    setIsAnalyzing(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Analyze data quality
      const hasRecentTransactions = categorySpending.some(cs => cs.spent > 0);
      const hasDiverseCategories = budgets.length >= 3;
      const hasRealisticBudgets = budgets.every(b => b.amount > 0 && b.amount < 100000);
      const hasSpendingData = categorySpending.some(cs => cs.percentage > 0);

      // Get transaction count for the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userData.user.id)
        .gte('date', threeMonthsAgo.toISOString().split('T')[0]);

      const transactionCount = recentTransactions?.length || 0;

      // Determine data quality
      let dataQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
      let score = 0;

      if (hasRecentTransactions) score += 25;
      if (hasDiverseCategories) score += 25;
      if (hasRealisticBudgets) score += 25;
      if (transactionCount >= 10) score += 25;

      if (score >= 90) dataQuality = 'excellent';
      else if (score >= 70) dataQuality = 'good';
      else if (score >= 50) dataQuality = 'fair';

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (!hasRecentTransactions) {
        recommendations.push('Add more transactions to see spending patterns');
      }
      if (!hasDiverseCategories) {
        recommendations.push('Create budgets for more categories to get better insights');
      }
      if (transactionCount < 10) {
        recommendations.push('Track expenses for at least a month for meaningful trends');
      }
      if (categorySpending.some(cs => cs.percentage > 150)) {
        recommendations.push('Review over-budget categories and adjust spending');
      }
      if (categorySpending.filter(cs => cs.percentage > 0).length < budgets.length / 2) {
        recommendations.push('Start spending in budgeted categories to track progress');
      }

      if (recommendations.length === 0) {
        recommendations.push('Great job! Your budget tracking is comprehensive');
        recommendations.push('Consider setting up budget alerts for proactive management');
        recommendations.push('Review historical trends to identify seasonal patterns');
      }

      setAnalyticsSummary({
        totalTests: 8,
        dataQuality,
        features: {
          basicAnalytics: budgets.length > 0 && categorySpending.length > 0,
          historicalTrends: transactionCount >= 5,
          aiInsights: transactionCount >= 10 && budgets.length >= 3,
          managementTools: budgets.length > 0
        },
        recommendations: recommendations.slice(0, 3) // Top 3 recommendations
      });

    } catch (error) {
      console.error('Error analyzing data quality:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return CheckCircle;
      case 'good': return CheckCircle;
      case 'fair': return AlertTriangle;
      case 'poor': return AlertTriangle;
      default: return Info;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="rounded-2xl border bg-card shadow-lg overflow-hidden mb-8">
        <div className="p-12 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing your budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analytics Summary Card */}
      {analyticsSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-card shadow-lg overflow-hidden"
        >
          <div className="border-b p-6 bg-gradient-to-r from-card to-card/80">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Analytics Summary
                </h2>
                <p className="text-muted-foreground mt-1">
                  Your budget tracking health and recommendations
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Data Quality Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Data Quality
                </h3>
                <div className={`rounded-lg border p-4 ${getQualityColor(analyticsSummary.dataQuality)}`}>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = getQualityIcon(analyticsSummary.dataQuality);
                      return <Icon className="h-5 w-5" />;
                    })()}
                    <div>
                      <div className="font-medium capitalize">{analyticsSummary.dataQuality}</div>
                      <div className="text-xs opacity-75">
                        {analyticsSummary.dataQuality === 'excellent' && 'All systems operational'}
                        {analyticsSummary.dataQuality === 'good' && 'Good data coverage'}
                        {analyticsSummary.dataQuality === 'fair' && 'Needs more data'}
                        {analyticsSummary.dataQuality === 'poor' && 'Insufficient data'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Available Features
                </h3>
                <div className="space-y-2">
                  {Object.entries(analyticsSummary.features).map(([feature, available]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge variant={available ? 'default' : 'secondary'}>
                        {available ? 'Available' : 'Limited'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Recommendations
              </h3>
              <div className="space-y-2">
                {analyticsSummary.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{budgets.length}</div>
                <div className="text-xs text-muted-foreground">Active Budgets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{categorySpending.length}</div>
                <div className="text-xs text-muted-foreground">Categories Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {categorySpending.filter(cs => cs.percentage > 0).length}
                </div>
                <div className="text-xs text-muted-foreground">With Spending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {categorySpending.filter(cs => cs.percentage <= 100).length}
                </div>
                <div className="text-xs text-muted-foreground">On Track</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Analytics Components */}
      <BudgetAnalytics budgets={budgets} categorySpending={categorySpending} />
      
      {analyticsSummary?.features.historicalTrends && (
        <HistoricalTrends />
      )}
      
      {analyticsSummary?.features.managementTools && (
        <BudgetManagementTools 
          budgets={budgets} 
          categorySpending={categorySpending}
          onBudgetsUpdate={onBudgetsUpdate}
        />
      )}
    </div>
  );
}