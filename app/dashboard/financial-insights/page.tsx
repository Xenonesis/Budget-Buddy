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
import { YearOverYearService, type YearlyComparisonData, type YearOverYearMetrics } from "@/lib/year-over-year-service";
import { EnhancedFinancialInsightsPanel } from "./components/EnhancedFinancialInsightsPanel";
import { FinancialGoalsPanel } from "./components/FinancialGoalsPanel";
import { InsightsSettings } from "./components/InsightsSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CheckCircle2,
  Download,
  Share2,
  Settings,
  Bell,
  Filter,
  Clock,
  Zap,
  TrendingDown as TrendingDownIcon,
  Users,
  BookOpen,
  Calculator,
  LineChart,
  Activity
} from "lucide-react";

export default function FinancialInsightsPage() {
  const router = useRouter();
  const { userId } = useUserPreferences();

  // Core state
  const [loading, setLoading] = useState<boolean>(true);
  const [insights, setInsights] = useState<RealFinancialInsight[]>([]);
  const [insightLoading, setInsightLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  // New enhanced state
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [insightHistory, setInsightHistory] = useState<RealFinancialInsight[]>([]);
  const [financialGoals, setFinancialGoals] = useState<any[]>([]);
  const [spendingTrends, setSpendingTrends] = useState<any[]>([]);
  const [yearOverYearData, setYearOverYearData] = useState<YearlyComparisonData[]>([]);
  const [yoyMetrics, setYoyMetrics] = useState<YearOverYearMetrics | null>(null);
  const [yoyLoading, setYoyLoading] = useState<boolean>(false);
  const [insightsSettings, setInsightsSettings] = useState({
    autoRefresh: false,
    notifications: true,
    refreshInterval: 30,
    insightTypes: ['spending_pattern', 'budget_warning', 'saving_suggestion', 'trend'],
    priorityFilter: 'all',
    exportFormat: 'json'
  });

  // Financial Goals Management
  const handleAddGoal = (goalData: any) => {
    const newGoal = {
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setFinancialGoals(prev => [...prev, newGoal]);
    toast.success("Financial goal created successfully!");
  };

  const handleUpdateGoal = (id: string, updates: any) => {
    setFinancialGoals(prev => 
      prev.map(goal => goal.id === id ? { ...goal, ...updates } : goal)
    );
    toast.success("Goal updated successfully!");
  };

  const handleDeleteGoal = (id: string) => {
    setFinancialGoals(prev => prev.filter(goal => goal.id !== id));
    toast.success("Goal deleted successfully!");
  };

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
        fetchBudgets(),
        fetchYearOverYearData()
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

  const fetchYearOverYearData = async () => {
    if (!userId) return;

    setYoyLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const years = [currentYear, currentYear - 1, currentYear - 2];
      
      const yearlyData = await YearOverYearService.fetchYearOverYearData(userId, years);
      setYearOverYearData(yearlyData);

      // Calculate year-over-year metrics if we have at least 2 years of data
      if (yearlyData.length >= 2) {
        const metrics = YearOverYearService.calculateYearOverYearMetrics(
          yearlyData[0], // Current year
          yearlyData[1]  // Previous year
        );
        setYoyMetrics(metrics);
      }
    } catch (error) {
      console.error("Error fetching year-over-year data:", error);
      toast.error("Failed to load year-over-year data");
    } finally {
      setYoyLoading(false);
    }
  };

  const handleRefreshInsights = async () => {
    if (!userId) return;

    setInsightLoading(true);
    try {
      // Refresh data first
      await Promise.all([
        fetchTransactions(),
        fetchBudgets(),
        fetchYearOverYearData()
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

  // Enhanced financial calculations
  const calculateSpendingTrends = () => {
    const currentDate = new Date();
    const last30Days = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const daysDiff = (currentDate.getTime() - transactionDate.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 30 && t.type === 'expense';
    });

    const categorySpending = last30Days.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categorySpending)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const calculateFinancialHealth = () => {
    const totalIncome = financialMetrics.totalIncome;
    const totalExpenses = financialMetrics.totalExpenses;
    const savingsRateNum = parseFloat(savingsRate);
    
    let score = 0;
    let factors = [];

    // Savings rate scoring (40% of total score)
    if (savingsRateNum >= 20) {
      score += 40;
      factors.push({ name: "Excellent Savings Rate", impact: "positive", value: `${savingsRate}%` });
    } else if (savingsRateNum >= 10) {
      score += 25;
      factors.push({ name: "Good Savings Rate", impact: "neutral", value: `${savingsRate}%` });
    } else if (savingsRateNum >= 0) {
      score += 10;
      factors.push({ name: "Low Savings Rate", impact: "negative", value: `${savingsRate}%` });
    } else {
      factors.push({ name: "Negative Savings", impact: "negative", value: `${savingsRate}%` });
    }

    // Budget adherence (30% of total score)
    const budgetAdherence = budgets.length > 0 ? 
      budgets.filter(b => {
        const categorySpending = transactions
          .filter(t => t.category === b.category && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        return categorySpending <= b.amount;
      }).length / budgets.length : 0;

    score += budgetAdherence * 30;
    factors.push({ 
      name: "Budget Adherence", 
      impact: budgetAdherence > 0.8 ? "positive" : budgetAdherence > 0.5 ? "neutral" : "negative",
      value: `${(budgetAdherence * 100).toFixed(0)}%`
    });

    // Expense diversity (20% of total score)
    const categories = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))];
    const diversityScore = Math.min(categories.length / 8, 1) * 20;
    score += diversityScore;
    factors.push({ 
      name: "Expense Diversity", 
      impact: categories.length >= 6 ? "positive" : categories.length >= 3 ? "neutral" : "negative",
      value: `${categories.length} categories`
    });

    // Income stability (10% of total score)
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const hasRegularIncome = incomeTransactions.length > 0;
    if (hasRegularIncome) {
      score += 10;
      factors.push({ name: "Regular Income", impact: "positive", value: "Active" });
    } else {
      factors.push({ name: "No Income Recorded", impact: "negative", value: "Inactive" });
    }

    return {
      score: Math.round(score),
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
      factors
    };
  };

  const generateRecommendations = () => {
    const recommendations = [];
    const healthScore = calculateFinancialHealth();
    
    if (parseFloat(savingsRate) < 10) {
      recommendations.push({
        title: "Increase Your Savings Rate",
        description: "Aim to save at least 10-20% of your income for better financial security.",
        priority: "high",
        action: "Review expenses and identify areas to cut back",
        category: "savings"
      });
    }

    if (budgets.length === 0) {
      recommendations.push({
        title: "Set Up Budget Categories",
        description: "Create budgets for your main expense categories to better control spending.",
        priority: "medium",
        action: "Go to Budget page and create your first budget",
        category: "budgeting"
      });
    }

    const topSpendingCategories = calculateSpendingTrends();
    if (topSpendingCategories.length > 0) {
      const topCategory = topSpendingCategories[0];
      recommendations.push({
        title: `Monitor ${topCategory.category} Spending`,
        description: `${topCategory.category} is your largest expense category at $${topCategory.amount.toLocaleString()}.`,
        priority: "medium",
        action: "Consider setting a budget for this category",
        category: "spending"
      });
    }

    return recommendations;
  };

  const exportInsights = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      financialHealth: calculateFinancialHealth(),
      insights: insights,
      recommendations: generateRecommendations(),
      metrics: financialMetrics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Financial insights exported successfully!");
  };

  const shareInsights = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Financial Insights',
          text: `I have ${insights.length} financial insights with a ${calculateFinancialHealth().grade} financial health score!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      const shareText = `Check out my financial insights: ${insights.length} insights generated with a ${calculateFinancialHealth().grade} financial health score!`;
      navigator.clipboard.writeText(shareText);
      toast.success("Insights summary copied to clipboard!");
    }
  };

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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">
                      ${financialMetrics.totalIncome.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">All income sources</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">
                      ${financialMetrics.totalExpenses.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">All spending categories</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Net Income</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">
                      ${netIncome.toLocaleString()}
                    </p>
                    <div className={`flex items-center gap-1 text-sm ${netIncome > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {netIncome > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      <span>{savingsRate}% savings rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Active Budgets</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">{financialMetrics.activeBudgets}</p>
                    <p className="text-xs text-muted-foreground">Budget categories set</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 lg:col-span-1 xl:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                      <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">AI Insights</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">{financialMetrics.insightsGenerated}</p>
                    <div className={`flex items-center gap-1 text-sm ${financialMetrics.highPriorityInsights > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      <span>{financialMetrics.highPriorityInsights > 0 ? `${financialMetrics.highPriorityInsights} high priority` : 'All clear'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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

        {/* Enhanced Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <TabsList className="grid w-full lg:w-auto grid-cols-5 lg:grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <span className="hidden sm:inline">Trends</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Goals</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                onClick={exportInsights}
                variant="outline"
                size="sm"
                className="shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={shareInsights}
                variant="outline"
                size="sm"
                className="shadow-sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Financial Health Score */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Financial Health Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-primary">
                        {calculateFinancialHealth().score}
                      </div>
                      <div className="space-y-1">
                        <Badge 
                          variant={calculateFinancialHealth().grade === 'A' ? 'default' : 
                                  calculateFinancialHealth().grade === 'B' ? 'secondary' : 'destructive'}
                          className="text-lg px-3 py-1"
                        >
                          Grade {calculateFinancialHealth().grade}
                        </Badge>
                        <p className="text-sm text-muted-foreground">Out of 100</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Progress 
                      value={calculateFinancialHealth().score} 
                      className="w-32 h-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calculateFinancialHealth().factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          factor.impact === 'positive' ? 'bg-green-500' :
                          factor.impact === 'neutral' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm font-medium">{factor.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{factor.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generateRecommendations().map((rec, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{rec.title}</h4>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          {rec.action}
                        </Button>
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Spending Categories */}
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Top Spending Categories (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {calculateSpendingTrends().length > 0 ? (
                    calculateSpendingTrends().map((category, index) => {
                      const percentage = financialMetrics.totalExpenses > 0 
                        ? (category.amount / financialMetrics.totalExpenses * 100).toFixed(1)
                        : '0.0';
                      
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{category.category}</p>
                              <p className="text-sm text-muted-foreground">{percentage}% of total expenses</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${category.amount.toLocaleString()}</p>
                            <Progress value={parseFloat(percentage)} className="w-20 h-2 mt-1" />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <PieChart className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No spending data available for the last 30 days</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Insights Summary */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Quick Insights Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-background/60 dark:bg-background/40 border">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Savings Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {savingsRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {parseFloat(savingsRate) >= 20 ? 'Excellent!' : 
                       parseFloat(savingsRate) >= 10 ? 'Good progress' : 'Needs improvement'}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-background/60 dark:bg-background/40 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Active Goals</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {financialGoals.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {financialGoals.length === 0 ? 'Set your first goal' : 
                       `${financialGoals.filter(g => (g.currentAmount / g.targetAmount) >= 1).length} completed`}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-background/60 dark:bg-background/40 border">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Alerts</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {financialMetrics.highPriorityInsights}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {financialMetrics.highPriorityInsights === 0 ? 'All clear!' : 'Need attention'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <EnhancedFinancialInsightsPanel
              insights={insights}
              loading={insightLoading}
              onRefresh={handleRefreshInsights}
              transactions={transactions}
              budgets={budgets}
            />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {/* Spending Trends Analysis */}
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Spending Trends Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Average Daily Spending</p>
                    <p className="text-2xl font-bold">
                      ${(financialMetrics.totalExpenses / 30).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Largest Single Expense</p>
                    <p className="text-2xl font-bold">
                      ${Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount), 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">This period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Transaction Frequency</p>
                    <p className="text-2xl font-bold">
                      {transactions.filter(t => t.type === 'expense').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Total transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Comparison */}
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Monthly Comparison
                  {yoyLoading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {yoyLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading monthly comparison data...</p>
                  </div>
                ) : yoyMetrics && yoyMetrics.monthlyComparison.length > 0 ? (
                  <div className="space-y-6">
                    {/* Year-over-Year Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {yoyMetrics.spendingGrowth > 0 ? '+' : ''}{yoyMetrics.spendingGrowth.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Spending Growth</div>
                        <div className={`text-xs ${yoyMetrics.spendingGrowth > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          vs. Previous Year
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {yoyMetrics.incomeGrowth > 0 ? '+' : ''}{yoyMetrics.incomeGrowth.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Income Growth</div>
                        <div className={`text-xs ${yoyMetrics.incomeGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          vs. Previous Year
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {yoyMetrics.savingsRateChange > 0 ? '+' : ''}{yoyMetrics.savingsRateChange.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Savings Rate Change</div>
                        <div className={`text-xs ${yoyMetrics.savingsRateChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Percentage Points
                        </div>
                      </div>
                    </div>

                    {/* Monthly Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground mb-3">Month-by-Month Comparison</h4>
                      <div className="grid gap-3">
                        {yoyMetrics.monthlyComparison.map((monthData, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-12 text-sm font-medium text-muted-foreground">
                                {monthData.month}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    ${monthData.currentYear.spending.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    vs ${monthData.previousYear.spending.toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {monthData.currentYear.transactions} transactions
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`flex items-center gap-1 text-sm font-medium ${
                                monthData.growth.spendingGrowth > 0 ? 'text-red-600' : 
                                monthData.growth.spendingGrowth < 0 ? 'text-green-600' : 'text-muted-foreground'
                              }`}>
                                {monthData.growth.spendingGrowth > 0 ? (
                                  <ArrowUpRight className="h-3 w-3" />
                                ) : monthData.growth.spendingGrowth < 0 ? (
                                  <ArrowDownRight className="h-3 w-3" />
                                ) : null}
                                {monthData.growth.spendingGrowth > 0 ? '+' : ''}{monthData.growth.spendingGrowth.toFixed(1)}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {monthData.growth.spendingGrowth > 0 ? 'Higher' : 
                                 monthData.growth.spendingGrowth < 0 ? 'Lower' : 'Same'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Insights */}
                    {yearOverYearData.length >= 2 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground mb-3">Key Insights</h4>
                        <div className="space-y-2">
                          {(() => {
                            const insights = YearOverYearService.getSpendingInsights(yearOverYearData);
                            const allInsights = [...insights.trends, ...insights.recommendations, ...insights.alerts];
                            return allInsights.slice(0, 3).map((insight, index) => (
                              <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-foreground">{insight}</p>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Comparison Data</h3>
                    <p className="text-muted-foreground mb-4">
                      Monthly comparison requires at least 2 years of transaction history.
                    </p>
                    <Button
                      onClick={fetchYearOverYearData}
                      variant="outline"
                      size="sm"
                      disabled={yoyLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${yoyLoading ? 'animate-spin' : ''}`} />
                      Refresh Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <FinancialGoalsPanel
              goals={financialGoals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <InsightsSettings
              settings={insightsSettings}
              onSettingsChange={setInsightsSettings}
            />
          </TabsContent>
        </Tabs>

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