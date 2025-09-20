"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  CreditCard,
  Activity,
  PieChart,
  Brain,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { generateGoogleAIInsights, FinancialInsight } from '@/lib/ai';
import { supabase } from '@/lib/supabase';

// Quick Stats Widget // Simple Stats Widget (alias for QuickStatsWidget)
export function SimpleStatsWidget({ data }: Readonly<{ data: any }>) {
  return <QuickStatsWidget data={data} />;
}

// Simple Budget Widget (alias for BudgetProgressWidget)
export function SimpleBudgetWidget({ data }: Readonly<{ data: any }>) {
  return <BudgetProgressWidget data={data} />;
}

// Enhanced Stats Widget (alias for QuickStatsWidget with enhanced styling)
export function EnhancedStatsWidget({ data }: Readonly<{ data: any }>) {
  return <QuickStatsWidget data={data} />;
}

// Enhanced Budget Widget (alias for BudgetProgressWidget with enhanced styling)
export function EnhancedBudgetWidget({ data }: Readonly<{ data: any }>) {
  return <BudgetProgressWidget data={data} />;
}

export function QuickStatsWidget({ data }: Readonly<{ data: any }>) {
  const [aiInsights, setAiInsights] = useState<FinancialInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [isAiInsightsEnabled, setIsAiInsightsEnabled] = useState(false);

  const totalIncome = data?.totalIncome || 0;
  const totalExpense = data?.totalExpense || 0;
  const balance = totalIncome - totalExpense;
  
  // Calculate basic financial ratios (fallback)
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
  const expenseRatio = totalIncome > 0 ? ((totalExpense / totalIncome) * 100) : 0;
  const avgDailySpend = totalExpense / 30; // Assuming monthly data
  const daysUntilBroke = balance > 0 && avgDailySpend > 0 ? Math.floor(balance / avgDailySpend) : 0;
  
  // Get financial health status
  const getFinancialHealth = () => {
    if (savingsRate >= 20) return { status: 'Excellent', color: 'text-green-600', bgColor: 'from-green-500 to-emerald-400' };
    if (savingsRate >= 10) return { status: 'Good', color: 'text-blue-600', bgColor: 'from-blue-500 to-indigo-500' };
    if (savingsRate >= 0) return { status: 'Fair', color: 'text-amber-600', bgColor: 'from-amber-500 to-orange-500' };
    return { status: 'Poor', color: 'text-red-600', bgColor: 'from-red-500 to-pink-500' };
  };
  
  const healthStatus = getFinancialHealth();

  // Get user ID and fetch AI insights
  useEffect(() => {
    const getUserAndInsights = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setInsightsError('Please log in to view AI insights');
          return;
        }

        // Fetch AI settings directly from the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("ai_settings")
          .eq("id", userData.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setInsightsError('Failed to load settings');
          return;
        }

        const aiInsightsEnabled = profileData?.ai_settings?.enable_financial_insights ?? false;
        setIsAiInsightsEnabled(aiInsightsEnabled);

        if (aiInsightsEnabled) {
          // Fetch transaction data for AI insights
          const { data: transactions } = await supabase
            .from("transactions")
            .select(`
              *,
              categories:category_id (
                name,
                type
              )
            `)
            .eq("user_id", userData.user.id)
            .order("date", { ascending: false })
            .limit(100); // Get recent transactions for analysis
          
          if (transactions && transactions.length > 0) {
            setLoadingInsights(true);
            setInsightsError(null);
            
            // Prepare transaction data for AI
            const processedTransactions = transactions.map(t => ({
              id: t.id,
              amount: t.amount,
              category: t.categories?.name || 'Uncategorized',
              description: t.description,
              date: t.date,
              type: t.type
            }));
            
            // Get AI insights
            const insights = await generateGoogleAIInsights(
              userData.user.id,
              processedTransactions,
              [] // Could add budget data here if available
            );
            
            if (Array.isArray(insights)) {
              setAiInsights(insights);
            } else if (typeof insights === 'string') {
              setInsightsError(insights);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        setInsightsError('Failed to load AI insights');
      } finally {
        setLoadingInsights(false);
      }
    };

    getUserAndInsights();
  }, [data]); // Re-fetch when data changes

  // Get insight type styling
  const getInsightTypeStyle = (type: string) => {
    switch (type) {
      case 'spending_pattern':
        return { icon: TrendingDown, color: 'text-blue-600', bgColor: 'from-blue-500 to-indigo-500' };
      case 'saving_suggestion':
        return { icon: Target, color: 'text-green-600', bgColor: 'from-green-500 to-emerald-400' };
      case 'budget_warning':
        return { icon: AlertCircle, color: 'text-amber-600', bgColor: 'from-amber-500 to-orange-500' };
      case 'investment_tip':
        return { icon: TrendingUp, color: 'text-purple-600', bgColor: 'from-purple-500 to-violet-500' };
      case 'warning':
        return { icon: AlertCircle, color: 'text-red-600', bgColor: 'from-red-500 to-pink-500' };
      case 'success':
        return { icon: Activity, color: 'text-green-600', bgColor: 'from-green-500 to-emerald-400' };
      case 'trend':
        return { icon: TrendingUp, color: 'text-cyan-600', bgColor: 'from-cyan-500 to-blue-500' };
      case 'decline':
        return { icon: TrendingDown, color: 'text-red-600', bgColor: 'from-red-500 to-pink-500' };
      default:
        return { icon: Brain, color: 'text-gray-600', bgColor: 'from-gray-500 to-gray-400' };
    }
  };

  // Render content based on state
  const renderContent = () => {
    if (loadingInsights) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Analyzing your finances...</span>
        </div>
      );
    }

    if (insightsError) {
      return (
        <div className="text-center py-4">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{insightsError}</p>
          <p className="text-xs text-muted-foreground mt-2">Showing basic financial metrics below</p>
        </div>
      );
    }

    if (aiInsights.length > 0) {
      const initialLimit = 3;
      const displayedInsights = showAllInsights ? aiInsights : aiInsights.slice(0, initialLimit);
      const hasMoreInsights = aiInsights.length > initialLimit;
      
      return (
        <div className="space-y-4">
          {/* Display AI insights */}
          {displayedInsights.map((insight, index) => {
            const style = getInsightTypeStyle(insight.type);
            const IconComponent = style.icon;
            
            return (
              <div key={`insight-${insight.type}-${index}`} className="p-3 rounded-lg border bg-gradient-to-r from-background to-muted/20">
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${style.bgColor} text-white flex-shrink-0`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold ${style.color} mb-1`}>
                      {insight.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                    {insight.amount && (
                      <p className="text-xs font-medium text-muted-foreground mt-1">
                        Amount: {formatCurrency(insight.amount)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-xs text-muted-foreground">
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </div>
                      {insight.relevantCategories && insight.relevantCategories.length > 0 && (
                        <div className="flex gap-1">
                          {insight.relevantCategories.slice(0, 2).map((cat, catIndex) => (
                            <span key={`cat-${cat}-${catIndex}`} className="text-xs bg-muted px-2 py-0.5 rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* See More/Less Button */}
          {hasMoreInsights && (
            <div className="text-center pt-2 border-t">
              <button
                onClick={() => setShowAllInsights(!showAllInsights)}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                {showAllInsights ? (
                  <>
                    <TrendingUp className="h-4 w-4 rotate-180" />
                    See Less
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4" />
                    See More (+{aiInsights.length - initialLimit} insights)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      );
    }

    // Fallback to basic financial metrics
    return (
      <div className="space-y-4">
        {/* Savings Rate & Expense Ratio */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${healthStatus.bgColor} text-white mx-auto mb-2`}>
              <Target className="h-4 w-4" />
            </div>
            <div className={`text-lg md:text-xl font-bold ${healthStatus.color}`}>
              {savingsRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Savings Rate</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white mx-auto mb-2">
              <PieChart className="h-4 w-4" />
            </div>
            <div className="text-lg md:text-xl font-bold text-purple-600">
              {expenseRatio.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Expense Ratio</div>
          </div>
        </div>

        {/* Financial Health & Daily Spend */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${healthStatus.bgColor} text-white mx-auto mb-2`}>
              <Activity className="h-4 w-4" />
            </div>
            <div className={`text-sm md:text-base font-bold ${healthStatus.color}`}>
              {healthStatus.status}
            </div>
            <div className="text-xs text-muted-foreground">Financial Health</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white mx-auto mb-2">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="text-sm md:text-base font-bold text-cyan-600">
              {formatCurrency(avgDailySpend)}
            </div>
            <div className="text-xs text-muted-foreground">Daily Avg Spend</div>
          </div>
        </div>

        {/* Runway Indicator */}
        {balance > 0 && avgDailySpend > 0 && (
          <div className="pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white mx-auto mb-2">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-lg md:text-xl font-bold text-indigo-600">
                {daysUntilBroke} days
              </div>
              <div className="text-xs text-muted-foreground">
                Financial Runway
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl border bg-card p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3 md:mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-violet-400 text-white">
          <Brain className="h-4 w-4" />
        </div>
        Financial Insights
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
}

// Budget Progress Widget - Matching website UI
export function BudgetProgressWidget({ data }: Readonly<{ data: any }>) {
  const budgetUsed = data?.budgetUsed || 0;
  const budgetTotal = data?.budgetTotal || 1;
  const percentage = (budgetUsed / budgetTotal) * 100;
  const remaining = budgetTotal - budgetUsed;
  
  // Determine status and colors based on percentage
  const getStatusInfo = () => {
    if (percentage >= 100) {
      return {
        status: 'Over Budget',
        iconGradient: 'from-red-500 to-pink-500',
        textColor: 'text-red-600'
      };
    } else if (percentage >= 80) {
      return {
        status: 'Near Limit',
        iconGradient: 'from-amber-500 to-orange-500',
        textColor: 'text-amber-600'
      };
    } else {
      return {
        status: 'On Track',
        iconGradient: 'from-green-500 to-emerald-400',
        textColor: 'text-green-600'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="rounded-xl border bg-card p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3 md:mb-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${statusInfo.iconGradient} text-white`}>
          <Target className="h-4 w-4" />
        </div>
        Budget Progress
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Progress Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Monthly Progress</span>
            <span className={`text-sm font-semibold ${statusInfo.textColor}`}>
              {statusInfo.status}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${statusInfo.iconGradient} transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(percentage)}% used</span>
              <span>{formatCurrency(budgetUsed)} / {formatCurrency(budgetTotal)}</span>
            </div>
          </div>
        </div>

        {/* Budget Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white mx-auto mb-2">
              <DollarSign className="h-4 w-4" />
            </div>
            <div className="text-lg md:text-xl font-bold text-blue-600">
              {formatCurrency(budgetUsed)}
            </div>
            <div className="text-xs text-muted-foreground">Used</div>
          </div>
          
          <div className="text-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto mb-2 ${
              remaining >= 0 
                ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                : 'bg-gradient-to-r from-red-500 to-pink-500'
            } text-white`}>
              <Target className="h-4 w-4" />
            </div>
            <div className={`text-lg md:text-xl font-bold ${
              remaining >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(Math.abs(remaining))}
            </div>
            <div className="text-xs text-muted-foreground">
              {remaining >= 0 ? 'Remaining' : 'Over Budget'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Recent Transactions Widget
export function RecentTransactionsWidget({ data }: Readonly<{ data: any }>) {
  const transactions = data?.recentTransactions || [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Transactions
        </CardTitle>
        <CardDescription>Latest financial activity</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3">
          {transactions.slice(0, 3).map((transaction: any, index: number) => (
            <div key={`transaction-${transaction.id || index}`} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{transaction.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Monthly Summary Widget
export function MonthlySummaryWidget({ data }: Readonly<{ data: any }>) {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {currentMonth} Summary
        </CardTitle>
        <CardDescription>This month's financial overview</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-600 font-medium">Income</p>
            <p className="text-lg font-bold text-green-700">
              {formatCurrency(data?.monthlyIncome || 0)}
            </p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <CreditCard className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium">Expenses</p>
            <p className="text-lg font-bold text-red-700">
              {formatCurrency(data?.monthlyExpense || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Category Breakdown Widget
export function CategoryBreakdownWidget({ data }: Readonly<{ data: any }>) {
  const categories = data?.topCategories || [];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChart className="h-4 w-4" />
          Top Categories
        </CardTitle>
        <CardDescription>Your spending breakdown</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3">
          {categories.slice(0, 4).map((category: any, index: number) => (
            <div key={`category-${category.name || index}`} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium capitalize">
                  {category.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatCurrency(category.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {category.count} transactions
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}