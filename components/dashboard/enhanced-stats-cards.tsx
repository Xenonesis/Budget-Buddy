"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon, DollarSign, Wallet, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  type: "income" | "expense" | "balance" | "savings";
  className?: string;
}

const CARD_STYLES = {
  income: {
    gradient: "bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/50 dark:to-green-900/50",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-300",
    trend: "text-emerald-600 dark:text-emerald-400"
  },
  expense: {
    gradient: "bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-950/50 dark:to-red-900/50",
    border: "border-rose-200 dark:border-rose-800",
    icon: "text-rose-600 dark:text-rose-400",
    value: "text-rose-700 dark:text-rose-300",
    trend: "text-rose-600 dark:text-rose-400"
  },
  balance: {
    gradient: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/50",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    value: "text-blue-700 dark:text-blue-300",
    trend: "text-blue-600 dark:text-blue-400"
  },
  savings: {
    gradient: "bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950/50 dark:to-purple-900/50",
    border: "border-violet-200 dark:border-violet-800",
    icon: "text-violet-600 dark:text-violet-400",
    value: "text-violet-700 dark:text-violet-300",
    trend: "text-violet-600 dark:text-violet-400"
  }
};

export function EnhancedStatsCard({ title, value, icon, trend, type, className }: StatsCardProps) {
  const styles = CARD_STYLES[type];
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      styles.gradient,
      styles.border,
      "group cursor-pointer",
      className
    )}>
      <CardContent className="p-6">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-lg bg-white/50 dark:bg-black/20", styles.icon)}>
            {icon}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              "bg-white/60 dark:bg-black/30",
              trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {trend.isPositive ? (
                <TrendingUpIcon className="h-3 w-3" />
              ) : (
                <TrendingDownIcon className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-muted-foreground mb-2 group-hover:text-foreground transition-colors">
          {title}
        </h3>

        {/* Value */}
        <div className={cn("text-2xl font-bold mb-2 transition-all duration-300", styles.value)}>
          {formatCurrency(value)}
        </div>

        {/* Trend details */}
        {trend && (
          <p className="text-xs text-muted-foreground">
            {trend.isPositive ? "+" : ""}{trend.value}% from {trend.period}
          </p>
        )}

        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </CardContent>
    </Card>
  );
}

interface EnhancedStatsGridProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate?: number;
  trends?: {
    income?: { value: number; isPositive: boolean };
    expense?: { value: number; isPositive: boolean };
    balance?: { value: number; isPositive: boolean };
  };
}

export function EnhancedStatsGrid({ 
  totalIncome, 
  totalExpense, 
  balance, 
  savingsRate = 0,
  trends 
}: EnhancedStatsGridProps) {
  const savings = totalIncome - totalExpense;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <EnhancedStatsCard
        title="Total Income"
        value={totalIncome}
        icon={<ArrowUpIcon className="h-5 w-5" />}
        type="income"
        trend={trends?.income ? { ...trends.income, period: "last month" } : undefined}
      />
      
      <EnhancedStatsCard
        title="Total Expenses"
        value={totalExpense}
        icon={<ArrowDownIcon className="h-5 w-5" />}
        type="expense"
        trend={trends?.expense ? { ...trends.expense, period: "last month" } : undefined}
      />
      
      <EnhancedStatsCard
        title="Current Balance"
        value={balance}
        icon={<Wallet className="h-5 w-5" />}
        type="balance"
        trend={trends?.balance ? { ...trends.balance, period: "last month" } : undefined}
      />
      
      <EnhancedStatsCard
        title="Monthly Savings"
        value={savings}
        icon={<PiggyBank className="h-5 w-5" />}
        type="savings"
        trend={savingsRate > 0 ? { 
          value: savingsRate, 
          isPositive: savingsRate > 0, 
          period: "target" 
        } : undefined}
      />
    </div>
  );
}