"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  RefreshCw,
  Download,
  Settings,
  Eye,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EnhancedStatsGrid } from "./enhanced-stats-cards";
import { EnhancedRecentTransactions } from "./enhanced-recent-transactions";
import { EnhancedSummarySection } from "./enhanced-summary-section";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  description?: string;
}

interface FinancialOverviewProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: Transaction[];
  isLoading?: boolean;
  onRefresh?: () => void;
  timeRange?: string;
}

export function EnhancedFinancialOverview({
  totalIncome,
  totalExpense,
  balance,
  transactions,
  isLoading = false,
  onRefresh,
  timeRange = "This Month"
}: FinancialOverviewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Calculate category statistics
  const categoryStats = React.useMemo(() => {
    const expenseCategories = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const incomeCategories = transactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topExpenseCategory = Object.entries(expenseCategories)
      .sort(([,a], [,b]) => b - a)[0];
    
    const topIncomeCategory = Object.entries(incomeCategories)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      expense: {
        totalAmount: totalExpense,
        categories: Object.keys(expenseCategories).length,
        period: timeRange,
        topCategory: topExpenseCategory ? {
          name: topExpenseCategory[0],
          amount: topExpenseCategory[1],
          percentage: Math.round((topExpenseCategory[1] / totalExpense) * 100)
        } : undefined
      },
      income: {
        totalAmount: totalIncome,
        categories: Object.keys(incomeCategories).length,
        period: timeRange,
        topCategory: topIncomeCategory ? {
          name: topIncomeCategory[0],
          amount: topIncomeCategory[1],
          percentage: Math.round((topIncomeCategory[1] / totalIncome) * 100)
        } : undefined
      }
    };
  }, [transactions, totalIncome, totalExpense, timeRange]);

  const trends = {
    income: { value: 12, isPositive: true },
    expense: { value: 8, isPositive: false },
    balance: { value: 15, isPositive: true }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Financial Overview
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {timeRange} • Last updated {formatDate(new Date())}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <EnhancedStatsGrid
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        trends={trends}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Summary Cards */}
              <div className="space-y-6">
                <EnhancedSummarySection
                  data={categoryStats.income}
                  type="income"
                />
                <EnhancedSummarySection
                  data={categoryStats.expense}
                  type="expense"
                />
              </div>

              {/* Recent Transactions */}
              <div className="lg:col-span-1">
                <EnhancedRecentTransactions
                  transactions={transactions}
                  showFilters={true}
                  maxItems={8}
                />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                <div className="text-center">
                  <PieChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Advanced charts and analytics will be displayed here
                  </p>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                <div className="text-center">
                  <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Financial Insights</h3>
                  <p className="text-muted-foreground">
                    AI-powered insights and recommendations will be shown here
                  </p>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-3 p-6 rounded-xl bg-muted/30 backdrop-blur-sm"
      >
        <h3 className="w-full text-sm font-semibold text-muted-foreground mb-2">Quick Actions</h3>
        <Button size="sm" variant="outline">Add Transaction</Button>
        <Button size="sm" variant="outline">Set Budget</Button>
        <Button size="sm" variant="outline">View Reports</Button>
        <Button size="sm" variant="outline">Export Data</Button>
      </motion.div>
    </div>
  );
}