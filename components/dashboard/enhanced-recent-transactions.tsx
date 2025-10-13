"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, Calendar, Filter, Eye, TrendingUp, TrendingDown, MoreHorizontal, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  description?: string;
}

interface EnhancedRecentTransactionsProps {
  transactions: Transaction[];
  showFilters?: boolean;
  maxItems?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  "dining out": { 
    bg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30", 
    text: "text-orange-700 dark:text-orange-300",
    icon: "🍽️"
  },
  food: { 
    bg: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30", 
    text: "text-orange-700 dark:text-orange-300",
    icon: "🍕"
  },
  transport: { 
    bg: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30", 
    text: "text-blue-700 dark:text-blue-300",
    icon: "🚗"
  },
  entertainment: { 
    bg: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30", 
    text: "text-purple-700 dark:text-purple-300",
    icon: "🎬"
  },
  shopping: { 
    bg: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30", 
    text: "text-pink-700 dark:text-pink-300",
    icon: "🛍️"
  },
  utilities: { 
    bg: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30", 
    text: "text-yellow-700 dark:text-yellow-300",
    icon: "⚡"
  },
  healthcare: { 
    bg: "bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30", 
    text: "text-red-700 dark:text-red-300",
    icon: "🏥"
  },
  salary: { 
    bg: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30", 
    text: "text-green-700 dark:text-green-300",
    icon: "💰"
  },
  freelance: { 
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30", 
    text: "text-emerald-700 dark:text-emerald-300",
    icon: "💼"
  },
  default: { 
    bg: "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30", 
    text: "text-gray-700 dark:text-gray-300",
    icon: "📊"
  }
};

function TransactionItem({ transaction, index }: { transaction: Transaction; index: number }) {
  const isIncome = transaction.type === "income";
  const categoryKey = transaction.category.toLowerCase();
  const categoryStyle = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.default;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="group relative overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-border hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm hover:bg-card">
        <div className="flex items-center gap-4">
          {/* Enhanced category icon with emoji */}
          <div className={cn(
            "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3",
            categoryStyle.bg
          )}>
            <span className="text-lg">{categoryStyle.icon}</span>
            <div className={cn(
              "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
              isIncome 
                ? "bg-emerald-500 text-white" 
                : "bg-rose-500 text-white"
            )}>
              {isIncome ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" />
              )}
            </div>
          </div>
          
          {/* Enhanced transaction details */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground capitalize">
                {transaction.category}
              </h4>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs px-2 py-0.5 font-medium border-0",
                  isIncome ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                )}
              >
                {isIncome ? "Income" : "Expense"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(new Date(transaction.date))}</span>
            </div>
            {transaction.description && (
              <p className="text-xs text-muted-foreground truncate max-w-48">
                {transaction.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Enhanced amount display */}
        <div className="text-right flex flex-col items-end gap-1">
          <div className={cn(
            "font-bold text-xl transition-all duration-200 group-hover:scale-105",
            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}>
            {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
          </div>
          <div className="text-xs text-muted-foreground">
            {isIncome ? "Received" : "Spent"}
          </div>
        </div>

        {/* Hover action button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function EnhancedRecentTransactions({ 
  transactions, 
  showFilters = true, 
  maxItems = 5 
}: EnhancedRecentTransactionsProps) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesFilter = filter === "all" || t.type === filter;
        const matchesSearch = searchTerm === "" || 
          t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
      })
      .slice(0, maxItems);
  }, [transactions, filter, searchTerm, maxItems]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => {
      return sum + (t.type === "income" ? t.amount : -t.amount);
    }, 0);
  }, [filteredTransactions]);

  const filterButtons = [
    { key: "all" as const, label: "All", count: transactions.length },
    { key: "income" as const, label: "Income", count: transactions.filter(t => t.type === "income").length },
    { key: "expense" as const, label: "Expenses", count: transactions.filter(t => t.type === "expense").length }
  ];

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card/80 to-card backdrop-blur-sm">
      <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredTransactions.length} of {transactions.length} transactions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Net Total</div>
                <div className={cn(
                  "font-bold text-lg",
                  totalAmount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {totalAmount >= 0 ? "+" : ""}{formatCurrency(Math.abs(totalAmount))}
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm">
                <Link href="/dashboard/transactions" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View All
                </Link>
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter buttons */}
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl backdrop-blur-sm">
                {filterButtons.map((btn) => (
                  <Button
                    key={btn.key}
                    variant={filter === btn.key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(btn.key)}
                    className={cn(
                      "h-8 px-4 text-xs font-medium transition-all duration-200",
                      filter === btn.key 
                        ? "shadow-sm" 
                        : "hover:bg-background/80"
                    )}
                  >
                    {btn.label}
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      {btn.count}
                    </Badge>
                  </Button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-8 pl-10 pr-4 text-sm bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {filteredTransactions.length > 0 ? (
            <motion.div
              key="transactions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredTransactions.map((transaction, index) => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction} 
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mb-6">
                {searchTerm ? (
                  <Search className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <Filter className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-semibold text-xl mb-2">
                {searchTerm ? "No matching transactions" : "No transactions found"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {searchTerm 
                  ? `No transactions match "${searchTerm}". Try adjusting your search.`
                  : filter === "all" 
                    ? "Start by adding your first transaction to see it here" 
                    : `No ${filter} transactions found for the selected period`}
              </p>
              <div className="flex gap-3">
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
                <Button asChild className="shadow-sm">
                  <Link href="/dashboard/transactions/new">
                    Add Transaction
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}