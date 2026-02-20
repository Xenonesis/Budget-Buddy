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
    <div className="border-4 border-foreground bg-paper shadow-[8px_8px_0px_hsl(var(--foreground))] p-5 md:p-6 mb-8" role="region" aria-labelledby="recent-transactions-title">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-foreground">
        <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight" id="recent-transactions-title" tabIndex={0}>Recent Transactions</h2>
        <Button asChild variant="outline" size="sm" className="border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:-translate-y-1 hover:translate-x-1 transition-all rounded-none font-mono font-bold uppercase tracking-widest">
          <Link href="/dashboard/transactions" aria-label="View all transactions">View All</Link>
        </Button>
      </div>
      {transactions.length > 0 ? (
        <div>
          {/* Hide table on small screens, show cards instead */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse" aria-labelledby="recent-transactions-title">
              <thead>
                <tr className="border-b-4 border-foreground text-left text-xs font-mono font-bold uppercase tracking-widest text-foreground">
                  <th className="pb-4 pr-4 pl-2" scope="col">Date</th>
                  <th className="pb-4 pr-4" scope="col">Category</th>
                  <th className="pb-4 pr-4" scope="col">Amount</th>
                  <th className="pb-4 pr-2" scope="col">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b-2 border-foreground/30 text-sm font-medium hover:bg-foreground/5 transition-colors">
                    <td className="py-4 pr-4 pl-2 font-mono whitespace-nowrap">{formatDate(new Date(transaction.date))}</td>
                    <td className="py-4 pr-4 capitalize font-bold">{transaction.category}</td>
                    <td className="py-4 pr-4 font-mono font-bold text-base">{formatCurrency(transaction.amount)}</td>
                    <td className="py-4 pr-2">
                      <span
                        className={`inline-flex items-center border-2 border-foreground px-2 py-1 text-xs font-mono font-bold uppercase tracking-widest ${
                          transaction.type === "income"
                            ? "bg-[#DFFF00] text-black shadow-[2px_2px_0px_hsl(var(--foreground))]"
                            : "bg-[#FF3366] text-white shadow-[2px_2px_0px_hsl(var(--foreground))]"
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
              <div key={transaction.id} className="border-4 border-foreground bg-background p-4 text-sm shadow-[4px_4px_0px_hsl(var(--foreground))]">
                <div className="flex justify-between items-start mb-3 border-b-2 border-foreground pb-2">
                  <span className="text-foreground font-mono font-bold text-xs bg-foreground/10 px-2 py-1 border-2 border-foreground">{formatDate(new Date(transaction.date))}</span>
                  <span
                    className={`inline-flex items-center border-2 border-foreground px-2 py-1 text-xs font-mono font-bold uppercase tracking-widest ${
                      transaction.type === "income"
                        ? "bg-[#DFFF00] text-black shadow-[2px_2px_0px_hsl(var(--foreground))]"
                        : "bg-[#FF3366] text-white shadow-[2px_2px_0px_hsl(var(--foreground))]"
                    }`}
                  >
                    {transaction.type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="capitalize font-bold text-lg">{transaction.category}</span>
                  <span className="font-mono font-black text-xl">
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