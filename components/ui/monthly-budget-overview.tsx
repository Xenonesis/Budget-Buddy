"use client";

import { useState, useEffect, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, TrendingUp, DollarSign, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetVsActual {
  category: string;
  budget_amount: number;
  actual_amount: number;
  difference: number;
  percentage: number;
}

interface MonthlyBudgetOverviewProps {
  className?: string;
}

export function MonthlyBudgetOverview({ className }: MonthlyBudgetOverviewProps) {
  const [budgetData, setBudgetData] = useState<BudgetVsActual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current month's budget vs actual data
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setError('User not authenticated');
          return;
        }

        // Get current month's budget vs actual data
        const { data: budgetVsActual, error: budgetError } = await supabase
          .from('budget_vs_actual')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('period', 'monthly');

        if (budgetError) {
          console.error('Error fetching budget data:', budgetError);
          setError('Failed to fetch budget data');
          return;
        }

        // Transform the data and calculate percentages
        const transformedData: BudgetVsActual[] = (budgetVsActual || []).map(item => ({
          category: item.category,
          budget_amount: item.budget_amount,
          actual_amount: item.actual_amount,
          difference: item.difference,
          percentage: item.budget_amount > 0 ? (item.actual_amount / item.budget_amount) * 100 : 0
        }));

        setBudgetData(transformedData);
      } catch (err) {
        console.error('Error in fetchBudgetData:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalBudget = budgetData.reduce((sum, item) => sum + item.budget_amount, 0);
    const totalSpent = budgetData.reduce((sum, item) => sum + item.actual_amount, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const categoriesOverBudget = budgetData.filter(item => item.percentage > 100).length;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      overallPercentage,
      categoriesOverBudget
    };
  }, [budgetData]);

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (budgetData.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Budgets Set</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Set up monthly budgets to track your spending progress
          </p>
          <a 
            href="/dashboard/budget" 
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Create Budget
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Monthly Budget Overview</h3>
            <p className="text-sm text-muted-foreground">
              Current month's spending vs budget
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {Math.round(summary.overallPercentage)}%
            </div>
            <div className="text-xs text-muted-foreground">Used</div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Progress</span>
            <span className={cn(
              "font-medium",
              summary.overallPercentage > 100 ? "text-red-600" : 
              summary.overallPercentage > 90 ? "text-amber-600" : "text-green-600"
            )}>
              {formatCurrency(summary.totalSpent)} / {formatCurrency(summary.totalBudget)}
            </span>
          </div>
          <Progress 
            value={Math.min(summary.overallPercentage, 100)} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {summary.categoriesOverBudget > 0 && (
                <span className="text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {summary.categoriesOverBudget} over budget
                </span>
              )}
            </span>
            <span>
              {summary.totalRemaining >= 0 ? 
                `${formatCurrency(summary.totalRemaining)} remaining` : 
                `${formatCurrency(Math.abs(summary.totalRemaining))} over budget`
              }
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Category Breakdown</h4>
          <div className="space-y-3">
            {budgetData
              .sort((a, b) => b.percentage - a.percentage)
              .slice(0, 5) // Show top 5 categories
              .map((item, index) => (
                <div key={`${item.category}-${index}`} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium capitalize">{item.category}</span>
                    <div className="text-right">
                      <div className={cn(
                        "font-medium",
                        item.percentage > 100 ? "text-red-600" : 
                        item.percentage > 90 ? "text-amber-600" : "text-green-600"
                      )}>
                        {Math.round(item.percentage)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(item.actual_amount)} / {formatCurrency(item.budget_amount)}
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(item.percentage, 100)} 
                    className={cn(
                      "h-2",
                      item.percentage > 100 && "bg-red-100"
                    )}
                  />
                  {item.percentage > 100 && (
                    <div className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Over by {formatCurrency(item.actual_amount - item.budget_amount)}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-lg font-semibold">{formatCurrency(summary.totalBudget)}</div>
            <div className="text-xs text-muted-foreground">Total Budget</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold">{formatCurrency(summary.totalSpent)}</div>
            <div className="text-xs text-muted-foreground">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className={cn(
                "h-4 w-4",
                summary.totalRemaining >= 0 ? "text-green-600" : "text-red-600"
              )} />
            </div>
            <div className={cn(
              "text-lg font-semibold",
              summary.totalRemaining >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(Math.abs(summary.totalRemaining))}
            </div>
            <div className="text-xs text-muted-foreground">
              {summary.totalRemaining >= 0 ? "Remaining" : "Over Budget"}
            </div>
          </div>
        </div>

        {/* View All Link */}
        {budgetData.length > 5 && (
          <div className="text-center pt-2">
            <a 
              href="/dashboard/budget" 
              className="text-sm text-primary hover:underline"
            >
              View all {budgetData.length} categories →
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}