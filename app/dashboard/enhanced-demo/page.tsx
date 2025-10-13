"use client";

import React from "react";
import { EnhancedFinancialOverview } from "@/components/dashboard/enhanced-financial-overview";

// Real financial data for demonstration
const realTransactions = [
  {
    id: "1",
    amount: 3200.00,
    type: "income" as const,
    category: "Salary",
    date: "2025-01-15",
    description: "Software Developer Salary"
  },
  {
    id: "2", 
    amount: 950.00,
    type: "expense" as const,
    category: "Housing",
    date: "2025-01-14",
    description: "Monthly rent payment"
  },
  {
    id: "3",
    amount: 285.00,
    type: "expense" as const,
    category: "Groceries",
    date: "2025-01-13",
    description: "Weekly grocery shopping"
  },
  {
    id: "4",
    amount: 120.00,
    type: "expense" as const,
    category: "Utilities",
    date: "2025-01-12",
    description: "Electricity and gas bills"
  },
  {
    id: "5",
    amount: 750.00,
    type: "income" as const,
    category: "Freelance",
    date: "2025-01-11",
    description: "Website development project"
  }
];

export default function EnhancedDemoPage() {
  const totalIncome = realTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = realTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpense;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <EnhancedFinancialOverview
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        transactions={realTransactions}
        timeRange="January 2025"
        onRefresh={() => console.log("Refreshing data...")}
      />
    </div>
  );
}