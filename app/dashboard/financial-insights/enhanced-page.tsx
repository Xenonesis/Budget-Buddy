"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { supabase } from "@/lib/supabase";
import { 
  generateRealFinancialInsights, 
  type RealFinancialInsight,
  type Transaction,
  type Budget
} from "@/lib/real-financial-insights";
import { EnhancedFinancialInsightsPanel } from "./components/EnhancedFinancialInsightsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Calendar,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface QuickStatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

function QuickStatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  description,
  className = "" 
}: QuickStatCardProps) {
  const changeColor = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground'
  }[changeType];

  const changeIcon = changeType === 'positive' ? (
    <ArrowUpRight className="h-3 w-3" />
  ) : changeType === 'negative' ? (
    <ArrowDownRight className="h-3 w-3" />
  ) : null;

  return (
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                {icon}
              </div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {change && (
                <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
                  {changeIcon}
                  <span>{change}</span>
                </div>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EnhancedFinancialInsightsPage() {
  const router = useRouter();
  const { userId } = useUserPreferences();

  // Core state
  const [loading, setLoading] = useState<boolean>(true);
  const [insights, setInsights] = useState<RealFinancialInsight[]>([]);
  const [insightLoading, setInsightLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Initialize data
  useEffect(() => {
    if (userId) {
      initializeData();
    }
  }, [userId]);

  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTransactions(),
        fetchBudgets()
      ]);
    } catch (error) {
      console.error("Error initializing financial insights data:", error);
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    }
  };

  const fetchBudgets = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Failed to load budgets");
    }
  };

  const handleRefreshInsights = async () => {
    if (!userId) return;

    setInsightLoading(true);
    try {
      // Refresh data first
      await Promise.all([
        fetchTransactions(),
        fetchBudgets()
      ]);

      // Generate fresh insights
      const freshInsights = generateRealFinancialInsights(transactions, budgets);
      setInsights(freshInsights);
      
      toast.success("Financial insights refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing insights:", error);
      toast.error("Failed to refresh insights");
    } finally {
      setInsightLoading(false);
    }
  };

  // Generate insights when transactions or budgets change
  useEffect(() => {
    if (transactions.length > 0 || budgets.length > 0) {
      const freshInsights = generateRealFinancialInsights(transactions, budgets);
      setInsights(freshInsights);
    }
  }, [transactions, budgets]);

  // Calculate financial metrics
  const financialMetrics = {
    totalIncome: transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    activeBudgets: budgets.length,
    insightsGenerated: insights.length,
    highPriorityInsights: insights.filter(i => 
      i.type === 'budget_warning' || i.type === 'warning'
    ).length
  };

  const netIncome = financialMetrics.totalIncome - financialMetrics.totalExpenses;
  const savingsRate = financialMetrics.totalIncome > 0 
    ? ((netIncome / financialMetrics.totalIncome) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Loading Financial Insights</h2>
                <p className="text-muted-foreground">Analyzing your financial data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Financial Insights
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Get intelligent insights about your spending patterns, budgets, and financial health with AI-powered analysis
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/dashboard/transactions')}
                variant="outline"
                size="sm"
                className="shadow-sm"
              >
                <PieChart className="h-4 w-4 mr-2" />
                View Transactions
              </Button>
              <Button
                onClick={() => router.push('/dashboard/budget')}
                variant="outline"
                size="sm"
                className="shadow-sm"
              >
                <Target className="h-4 w-4 mr-2" />
                Manage Budgets
              </Button>
              <Button
                onClick={handleRefreshInsights}
                disabled={insightLoading}
                variant="default"
                size="sm"
                className="shadow-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${insightLoading ? 'animate-spin' : ''}`} />
                Refresh Insights
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          <QuickStatCard
            title="Total Income"
            value={`$${financialMetrics.totalIncome.toLocaleString()}`}
            change="+12.5% from last month"
            changeType="positive"
            icon={<DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />}
            description="All income sources"
          />
          
          <QuickStatCard
            title="Total Expenses"
            value={`$${financialMetrics.totalExpenses.toLocaleString()}`}
            change="-5.2% from last month"
            changeType="positive"
            icon={<TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />}
            description="All spending categories"
          />
          
          <QuickStatCard
            title="Net Income"
            value={`$${netIncome.toLocaleString()}`}
            change={`${savingsRate}% savings rate`}
            changeType={netIncome > 0 ? 'positive' : 'negative'}
            icon={<BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            description="Income minus expenses"
          />
          
          <QuickStatCard
            title="Active Budgets"
            value={financialMetrics.activeBudgets.toString()}
            description="Budget categories set"
            icon={<Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          />
          
          <QuickStatCard
            title="AI Insights"
            value={financialMetrics.insightsGenerated.toString()}
            change={financialMetrics.highPriorityInsights > 0 ? `${financialMetrics.highPriorityInsights} high priority` : 'All clear'}
            changeType={financialMetrics.highPriorityInsights > 0 ? 'negative' : 'positive'}
            icon={<Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            description="Generated insights"
            className="lg:col-span-1 xl:col-span-1"
          />
        </div>

        {/* Financial Health Alert */}
        {financialMetrics.highPriorityInsights > 0 && (
          <Card className="mb-8 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                    Action Required
                  </h3>
                  <p className="text-orange-700 dark:text-orange-200 text-sm">
                    You have {financialMetrics.highPriorityInsights} high-priority financial insights that need your attention. 
                    Review them below to improve your financial health.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Positive Financial Health Message */}
        {financialMetrics.highPriorityInsights === 0 && insights.length > 0 && (
          <Card className="mb-8 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Great Financial Health!
                  </h3>
                  <p className="text-green-700 dark:text-green-200 text-sm">
                    Your finances are looking healthy. Keep up the good work! Check out the insights below for optimization opportunities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Financial Insights Panel */}
        <EnhancedFinancialInsightsPanel
          insights={insights}
          loading={insightLoading}
          onRefresh={handleRefreshInsights}
          transactions={transactions}
          budgets={budgets}
        />

        {/* Footer Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button
            onClick={() => router.push('/dashboard/analytics')}
            variant="outline"
            size="lg"
            className="shadow-sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Detailed Analytics
          </Button>
          <Button
            onClick={() => router.push('/dashboard/budget')}
            variant="outline"
            size="lg"
            className="shadow-sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Set Financial Goals
          </Button>
        </div>
      </div>
    </div>
  );
}