"use client";

import React from "react";
import { EnhancedFinancialOverview } from "@/components/dashboard/enhanced-financial-overview";

// Sample data for demonstration
const sampleTransactions = [
  {
    id: "1",
    amount: 51000.00,
    type: "expense" as const,
    category: "Dining Out",
    date: "2025-10-13",
    description: "Expensive restaurant dinner"
  },
  {
    id: "2", 
    amount: 2500.00,
    type: "income" as const,
    category: "Salary",
    date: "2025-10-12",
    description: "Monthly salary payment"
  },
  {
    id: "3",
    amount: 850.00,
    type: "expense" as const,
    category: "Transport",
    date: "2025-10-11",
    description: "Gas and car maintenance"
  },
  {
    id: "4",
    amount: 1200.00,
    type: "expense" as const,
    category: "Shopping",
    date: "2025-10-10",
    description: "Clothing and accessories"
  },
  {
    id: "5",
    amount: 500.00,
    type: "income" as const,
    category: "Freelance",
    date: "2025-10-09",
    description: "Web design project"
  }
];

export default function EnhancedDemoPage() {
  const totalIncome = sampleTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = sampleTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpense;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <EnhancedFinancialOverview
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        transactions={sampleTransactions}
        timeRange="October 2025"
        onRefresh={() => console.log("Refreshing data...")}
      />
    </div>
  );
}