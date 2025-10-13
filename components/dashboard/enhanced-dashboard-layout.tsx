"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EnhancedStatsGrid } from "./enhanced-stats-cards";
import { EnhancedRecentTransactions } from "./enhanced-recent-transactions";
import { EnhancedCategoryInsights } from "./enhanced-category-insights";
import { TimeRangeSelector } from "@/components/ui/time-range-selector";
import { 
  Calendar, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Settings, 
  RefreshCw,
  Download,
  Filter,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  description?: string;
}

interface CategoryData {
  name: string;
  count: number;
  total: number;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  budget?: number;
}

interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: Transaction[];
  categoryData: CategoryData[];
  trends?: {
    income?: { value: number; isPositive: boolean };
    expense?: { value: number; isPositive: boolean };
    balance?: { value: number; isPositive: boolean };
  };
}

interface EnhancedDashboardLayoutProps {
  stats: DashboardStats;
  isLoading?: boolean;
  onRefresh?: () => void;
  onTimeRangeChange?: (range: any) => void;
  timeRange?: any;
}

export function EnhancedDashboardLayout({
  stats,
  isLoading = false,
  onRefresh,
  onTimeRangeChange,
  timeRange
}: EnhancedDashboardLayoutProps) {
  const [activeView, setActiveView] = useState<"overview" | "analytics">("overview");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-violet-600 bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your finances and achieve your goals
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          {onTimeRangeChange && (
            <TimeRangeSelector
              value={timeRange}
              onChange={onTimeRangeChange}
              className="min-w-[200px]"
            />
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "transition-colors",
                showFilters && "bg-primary text-primary-foreground"
              )}
            >
              {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="hidden sm:inline ml-2">
                {showFilters ? "Hide" : "Show"} Filters
              </span>
            </Button>
            
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>
            )}
            
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/customize" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Customize</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <EnhancedStatsGrid
        totalIncome={stats.totalIncome}
        totalExpense={stats.totalExpense}
        balance={stats.balance}
        trends={stats.trends}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Transactions - Takes up 2 columns on xl screens */}
            <div className="xl:col-span-2">
              <EnhancedRecentTransactions
                transactions={stats.recentTransactions}
                showFilters={showFilters}
                maxItems={8}
              />
            </div>
            
            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard/transactions/new" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Add Transaction
                  </Link>
                </Button>
                
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard/budget" className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Set Budget
                  </Link>
                </Button>
                
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard/reports" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                  </Link>
                </Button>
                
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard/goals" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Financial Goals
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <EnhancedCategoryInsights
            topCategories={stats.categoryData}
            totalExpense={stats.totalExpense}
            showBudgetComparison={true}
          />
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Updating dashboard...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}