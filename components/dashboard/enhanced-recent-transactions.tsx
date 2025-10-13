"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, Calendar, Filter, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

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

const CATEGORY_COLORS: Record<string, string> = {
  food: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  transport: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  utilities: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  healthcare: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  salary: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  freelance: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
};

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === "income";
  const categoryColor = CATEGORY_COLORS[transaction.category.toLowerCase()] || CATEGORY_COLORS.default;
  
  return (
    <div className="group flex items-center justify-between p-4 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* Transaction type icon */}
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 group-hover:scale-110",
          isIncome 
            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
            : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
        )}>
          {isIncome ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
        </div>
        
        {/* Transaction details */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className={cn("text-xs", categoryColor)}>
              {transaction.category}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(new Date(transaction.date))}
          </div>
        </div>
      </div>
      
      {/* Amount */}
      <div className="text-right">
        <div className={cn(
          "font-semibold text-lg transition-colors",
          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
        )}>
          {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
        </div>
      </div>
    </div>
  );
}

export function EnhancedRecentTransactions({ 
  transactions, 
  showFilters = false, 
  maxItems = 5 
}: EnhancedRecentTransactionsProps) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  
  const filteredTransactions = transactions
    .filter(t => filter === "all" || t.type === filter)
    .slice(0, maxItems);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Recent Transactions
          </CardTitle>
          <div className="flex items-center gap-2">
            {showFilters && (
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={filter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="h-7 px-3 text-xs"
                >
                  All
                </Button>
                <Button
                  variant={filter === "income" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("income")}
                  className="h-7 px-3 text-xs"
                >
                  Income
                </Button>
                <Button
                  variant={filter === "expense" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("expense")}
                  className="h-7 px-3 text-xs"
                >
                  Expenses
                </Button>
              </div>
            )}
            <Button asChild variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-colors">
              <Link href="/dashboard/transactions" className="flex items-center gap-1">
                View All
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No transactions found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === "all" 
                ? "Start by adding your first transaction" 
                : `No ${filter} transactions found`}
            </p>
            <Button asChild>
              <Link href="/dashboard/transactions/new">
                Add Transaction
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}