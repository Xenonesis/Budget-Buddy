"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  Calendar, 
  Filter, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Search,
  MoreHorizontal,
  Plus,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FastTransactionSkeleton } from "@/components/ui/fast-skeleton";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function RecentTransactions({ transactions, loading = false }: RecentTransactionsProps) {
  if (loading) {
    return <FastTransactionSkeleton />;
  }

  return (
    <div className="rounded-2xl border bg-card p-5 md:p-6 mb-8 shadow-sm hover:shadow-md transition-all" role="region" aria-labelledby="recent-transactions-title">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight" id="recent-transactions-title" tabIndex={0}>Recent Transactions</h2>
        <Button asChild variant="outline" size="sm" className="rounded-full font-medium transition-all">
          <Link href="/dashboard/transactions" aria-label="View all transactions">View All</Link>
        </Button>
      </div>
      {transactions.length > 0 ? (
        <div>
          {/* Hide table on small screens, show cards instead */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse" aria-labelledby="recent-transactions-title">
              <thead>
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-4 pr-4 pl-2 font-medium" scope="col">Date</th>
                  <th className="pb-4 pr-4 font-medium" scope="col">Category</th>
                  <th className="pb-4 pr-4 font-medium" scope="col">Amount</th>
                  <th className="pb-4 pr-2 font-medium" scope="col">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border/50 text-sm hover:bg-muted/30 transition-colors">
                    <td className="py-4 pr-4 pl-2 text-muted-foreground whitespace-nowrap">{formatDate(new Date(transaction.date))}</td>
                    <td className="py-4 pr-4 capitalize font-medium">{transaction.category}</td>
                    <td className="py-4 pr-4 font-semibold text-base">{formatCurrency(transaction.amount)}</td>
                    <td className="py-4 pr-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          transaction.type === "income"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view - show on small screens only */}
          <div className="sm:hidden space-y-4 mt-2">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="rounded-xl border bg-card p-4 text-sm shadow-sm">
                <div className="flex justify-between items-start mb-3 border-b border-border/50 pb-3">
                  <span className="text-muted-foreground font-medium text-xs">{formatDate(new Date(transaction.date))}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      transaction.type === "income"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {transaction.type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="capitalize font-medium text-lg text-foreground">{transaction.category}</span>
                  <span className="font-semibold text-xl">
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center text-muted-foreground" tabIndex={0} aria-live="polite">
          No transactions found
        </div>
      )}
    </div>
  );
}