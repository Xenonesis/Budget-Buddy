"use client";

import React from "react";
import { EnhancedDashboard } from "./enhanced-dashboard";

// Sample data for demonstration
const sampleExpenses = [
  {
    id: "1",
    amount: 1200,
    category: "Housing",
    subcategory: "Rent",
    date: new Date("2024-01-15"),
    description: "Monthly rent payment"
  },
  {
    id: "2",
    amount: 450,
    category: "Food",
    subcategory: "Groceries",
    date: new Date("2024-01-20"),
    description: "Weekly grocery shopping"
  },
  {
    id: "3",
    amount: 80,
    category: "Transportation",
    subcategory: "Gas",
    date: new Date("2024-01-25"),
    description: "Gas station fill-up"
  },
  {
    id: "4",
    amount: 150,
    category: "Entertainment",
    subcategory: "Dining Out",
    date: new Date("2024-02-01"),
    description: "Restaurant dinner"
  },
  {
    id: "5",
    amount: 1200,
    category: "Housing",
    subcategory: "Rent",
    date: new Date("2024-02-15"),
    description: "Monthly rent payment"
  },
  {
    id: "6",
    amount: 320,
    category: "Food",
    subcategory: "Groceries",
    date: new Date("2024-02-18"),
    description: "Grocery shopping"
  },
  {
    id: "7",
    amount: 75,
    category: "Transportation",
    subcategory: "Gas",
    date: new Date("2024-02-22"),
    description: "Gas station"
  },
  {
    id: "8",
    amount: 200,
    category: "Shopping",
    subcategory: "Clothing",
    date: new Date("2024-02-28"),
    description: "New clothes"
  },
  // Add more sample data for previous year comparison
  {
    id: "9",
    amount: 1100,
    category: "Housing",
    subcategory: "Rent",
    date: new Date("2023-01-15"),
    description: "Monthly rent payment"
  },
  {
    id: "10",
    amount: 380,
    category: "Food",
    subcategory: "Groceries",
    date: new Date("2023-01-20"),
    description: "Weekly grocery shopping"
  },
  {
    id: "11",
    amount: 70,
    category: "Transportation",
    subcategory: "Gas",
    date: new Date("2023-01-25"),
    description: "Gas station fill-up"
  },
  {
    id: "12",
    amount: 120,
    category: "Entertainment",
    subcategory: "Dining Out",
    date: new Date("2023-02-01"),
    description: "Restaurant dinner"
  }
];

export function ExampleDashboard() {
  const handleExport = () => {
    console.log("Exporting data...");
    // Implement your export logic here
  };

  const handleRefresh = () => {
    console.log("Refreshing data...");
    // Implement your refresh logic here
  };

  return (
    <div className="container mx-auto p-6">
      <EnhancedDashboard
        expenses={sampleExpenses}
        onExport={handleExport}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

export default ExampleDashboard;