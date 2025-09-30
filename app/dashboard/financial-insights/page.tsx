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
import { FinancialInsightsPanel } from "./components/FinancialInsightsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";

export default function FinancialInsightsPage() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading financial insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Insights</h1>
            <p className="text-muted-foreground mt-1">
              Get intelligent insights about your spending patterns, budgets, and financial health
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefreshInsights}
              disabled={insightLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${insightLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-lg font-semibold">
                    ${transactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-lg font-semibold">
                    ${transactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Budgets</p>
                  <p className="text-lg font-semibold">{budgets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Insights Generated</p>
                  <p className="text-lg font-semibold">{insights.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Insights Panel */}
        <FinancialInsightsPanel
          insights={insights}
          loading={insightLoading}
          onRefresh={handleRefreshInsights}
          transactions={transactions}
          budgets={budgets}
        />
      </div>
    </div>
  );
}