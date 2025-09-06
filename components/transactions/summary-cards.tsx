import React from 'react';
import { Currency } from '@/components/ui/currency';

interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface TransactionSummaryCardsProps {
  summary: TransactionSummary;
}

export const TransactionSummaryCards: React.FC<TransactionSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
        <h2 className="text-sm font-medium text-muted-foreground">Total Income</h2>
        <p className="mt-1 text-2xl font-bold text-green-500">
          <Currency value={summary.totalIncome} />
        </p>
      </div>
      <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
        <h2 className="text-sm font-medium text-muted-foreground">Total Expenses</h2>
        <p className="mt-1 text-2xl font-bold text-destructive">
          <Currency value={summary.totalExpense} />
        </p>
      </div>
      <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:col-span-2 md:col-span-1">
        <h2 className="text-sm font-medium text-muted-foreground">Net Balance</h2>
        <p
          className={`mt-1 text-2xl font-bold ${
            summary.balance >= 0 ? "text-green-500" : "text-destructive"
          }`}
        >
          <Currency value={summary.balance} />
        </p>
      </div>
    </div>
  );
};