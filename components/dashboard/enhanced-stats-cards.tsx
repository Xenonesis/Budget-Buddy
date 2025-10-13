"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon, DollarSign, Wallet, PiggyBank, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    gradient: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30",
    border: "border-emerald-200/50 dark:border-emerald-800/50",
    icon: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    value: "text-emerald-700 dark:text-emerald-300",
    trend: "text-emerald-600 dark:text-emerald-400",
    shadow: "shadow-emerald-100/50 dark:shadow-emerald-900/20",
    glow: "group-hover:shadow-emerald-200/60 dark:group-hover:shadow-emerald-900/40"
  },
  expense: {
    gradient: "bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 dark:from-rose-950/30 dark:via-red-950/30 dark:to-pink-950/30",
    border: "border-rose-200/50 dark:border-rose-800/50",
    icon: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    value: "text-rose-700 dark:text-rose-300",
    trend: "text-rose-600 dark:text-rose-400",
    shadow: "shadow-rose-100/50 dark:shadow-rose-900/20",
    glow: "group-hover:shadow-rose-200/60 dark:group-hover:shadow-rose-900/40"
  },
  balance: {
    gradient: "bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-cyan-950/30",
    border: "border-blue-200/50 dark:border-blue-800/50",
    icon: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    value: "text-blue-700 dark:text-blue-300",
    trend: "text-blue-600 dark:text-blue-400",
    shadow: "shadow-blue-100/50 dark:shadow-blue-900/20",
    glow: "group-hover:shadow-blue-200/60 dark:group-hover:shadow-blue-900/40"
  },
  savings: {
    gradient: "bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30",
    border: "border-violet-200/50 dark:border-violet-800/50",
    icon: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    value: "text-violet-700 dark:text-violet-300",
    trend: "text-violet-600 dark:text-violet-400",
    shadow: "shadow-violet-100/50 dark:shadow-violet-900/20",
    glow: "group-hover:shadow-violet-200/60 dark:group-hover:shadow-violet-900/40"
  }
};

export function EnhancedStatsCard({ title, value, icon, trend, type, className }: StatsCardProps) {
  const styles = CARD_STYLES[type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-500 border-0 backdrop-blur-sm",
        styles.gradient,
        styles.shadow,
        styles.glow,
        "group cursor-pointer",
        className
      )}>
        <CardContent className="p-6 relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className={cn("w-full h-full rounded-full", styles.iconBg, "blur-2xl")} />
          </div>
          
          {/* Header with enhanced icon */}
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              className={cn(
                "p-3 rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-md",
                styles.iconBg,
                styles.icon
              )}
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {icon}
            </motion.div>
            {trend && (
              <motion.div 
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm border",
                  "bg-white/80 dark:bg-black/40 border-white/20 dark:border-white/10",
                  trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 15 }}
              >
                {trend.isPositive ? (
                  <TrendingUpIcon className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDownIcon className="h-3.5 w-3.5" />
                )}
                {Math.abs(trend.value)}%
              </motion.div>
            )}
          </div>

          {/* Title with enhanced typography */}
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 group-hover:text-foreground transition-colors duration-300 tracking-wide uppercase">
            {title}
          </h3>

          {/* Enhanced value display */}
          <motion.div 
            className={cn("text-3xl font-bold mb-3 transition-all duration-300", styles.value)}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 15 }}
          >
            {formatCurrency(value)}
          </motion.div>

          {/* Enhanced trend details */}
          {trend && (
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground font-medium">
                {trend.isPositive ? "+" : ""}{trend.value}% from {trend.period}
              </p>
              {Math.abs(trend.value) > 10 && (
                <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
              )}
            </div>
          )}

          {/* Enhanced animated background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={cn("absolute w-1 h-1 rounded-full opacity-30", styles.iconBg)}
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: "100%",
                  scale: 0 
                }}
                animate={{ 
                  y: "-20%",
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
  const savingsPercentage = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, staggerChildren: 0.1 }}
    >
      <EnhancedStatsCard
        title="Total Income"
        value={totalIncome}
        icon={<ArrowUpIcon className="h-6 w-6" />}
        type="income"
        trend={trends?.income ? { ...trends.income, period: "last month" } : undefined}
      />
      
      <EnhancedStatsCard
        title="Total Expenses"
        value={totalExpense}
        icon={<ArrowDownIcon className="h-6 w-6" />}
        type="expense"
        trend={trends?.expense ? { ...trends.expense, period: "last month" } : undefined}
      />
      
      <EnhancedStatsCard
        title="Current Balance"
        value={balance}
        icon={<Wallet className="h-6 w-6" />}
        type="balance"
        trend={trends?.balance ? { ...trends.balance, period: "last month" } : undefined}
      />
      
      <EnhancedStatsCard
        title="Monthly Savings"
        value={savings}
        icon={<PiggyBank className="h-6 w-6" />}
        type="savings"
        trend={savingsPercentage > 0 ? { 
          value: Math.round(savingsPercentage), 
          isPositive: savingsPercentage > 0, 
          period: "of income" 
        } : undefined}
      />
    </motion.div>
  );
}