"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Calendar, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SummaryData {
  totalAmount: number;
  categories: number;
  period: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  topCategory?: {
    name: string;
    amount: number;
    percentage: number;
  };
}

interface EnhancedSummarySectionProps {
  data: SummaryData;
  type: "income" | "expense";
}

export function EnhancedSummarySection({ data, type }: EnhancedSummarySectionProps) {
  const isIncome = type === "income";
  
  const colorScheme = {
    income: {
      gradient: "bg-gradient-to-br from-emerald-500 to-green-600",
      text: "text-white",
      badge: "bg-white/20 text-white border-white/30",
      icon: "text-emerald-100",
      accent: "text-emerald-200"
    },
    expense: {
      gradient: "bg-gradient-to-br from-rose-500 to-red-600", 
      text: "text-white",
      badge: "bg-white/20 text-white border-white/30",
      icon: "text-rose-100",
      accent: "text-rose-200"
    }
  };

  const scheme = colorScheme[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn(
        "relative overflow-hidden border-0 shadow-2xl",
        scheme.gradient
      )}>
        <CardContent className="p-8 relative">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <div className="w-full h-full rounded-full bg-white blur-3xl" />
          </div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 opacity-10">
            <div className="w-full h-full rounded-full bg-white blur-2xl" />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  {isIncome ? (
                    <TrendingUp className={cn("h-6 w-6", scheme.icon)} />
                  ) : (
                    <TrendingDown className={cn("h-6 w-6", scheme.icon)} />
                  )}
                </div>
                <div>
                  <h2 className={cn("text-xl font-bold", scheme.text)}>
                    {isIncome ? "Total Income" : "Total Expenses"}
                  </h2>
                  <p className={cn("text-sm", scheme.accent)}>
                    {data.period}
                  </p>
                </div>
              </div>

              {data.trend && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <Badge className={cn("px-3 py-1", scheme.badge)}>
                    {data.trend.isPositive ? "+" : ""}{data.trend.value}%
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Main amount */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <div className={cn("text-5xl font-bold mb-2", scheme.text)}>
                {formatCurrency(data.totalAmount)}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Target className={cn("h-4 w-4", scheme.accent)} />
                  <span className={cn("text-sm font-medium", scheme.accent)}>
                    {data.categories} {data.categories === 1 ? "Category" : "Categories"}
                  </span>
                </div>
                {data.topCategory && (
                  <div className="flex items-center gap-2">
                    <Zap className={cn("h-4 w-4", scheme.accent)} />
                    <span className={cn("text-sm font-medium", scheme.accent)}>
                      Top: {data.topCategory.name} ({data.topCategory.percentage}%)
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Bottom stats */}
            {data.topCategory && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm"
              >
                <div>
                  <div className={cn("text-sm font-medium", scheme.accent)}>
                    Highest Category
                  </div>
                  <div className={cn("text-lg font-bold", scheme.text)}>
                    {data.topCategory.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("text-sm font-medium", scheme.accent)}>
                    Amount
                  </div>
                  <div className={cn("text-lg font-bold", scheme.text)}>
                    {formatCurrency(data.topCategory.amount)}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        </CardContent>
      </Card>
    </motion.div>
  );
}