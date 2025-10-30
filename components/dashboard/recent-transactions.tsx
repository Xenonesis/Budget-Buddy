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
    <div className="rounded-xl border bg-card p-5 md:p-6 shadow-md" role="region" aria-labelledby="recent-transactions-title">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold" id="recent-transactions-title" tabIndex={0}>Recent Transactions</h2>
        <Button asChild variant="outline" size="sm" className="text-xs md:text-sm hover:bg-primary hover:text-white transition-colors duration-300 rounded-lg">
          <Link href="/dashboard/transactions" aria-label="View all transactions">View All</Link>
        </Button>
      </div>
      {transactions.length > 0 ? (
        <div>
          {/* Hide table on small screens, show cards instead */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse" aria-labelledby="recent-transactions-title">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                  <th className="pb-3 pr-4" scope="col">Date</th>
                  <th className="pb-3 pr-4" scope="col">Category</th>
                  <th className="pb-3 pr-4" scope="col">Amount</th>
                  <th className="pb-3" scope="col">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b text-sm">
                    <td className="py-3 pr-4">{formatDate(new Date(transaction.date))}</td>
                    <td className="py-3 pr-4 capitalize">{transaction.category}</td>
                    <td className="py-3 pr-4 font-medium">{formatCurrency(transaction.amount)}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          transaction.type === "income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
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
          <div className="sm:hidden space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-3 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-xs">{formatDate(new Date(transaction.date))}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      transaction.type === "income"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transaction.type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="capitalize">{transaction.category}</span>
                  <span className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
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