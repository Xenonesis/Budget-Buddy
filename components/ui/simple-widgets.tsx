"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { QuickStatsWidget, BudgetProgressWidget } from './dashboard-widgets';

// Enhanced widgets using the improved designs
export function SimpleQuickStatsWidget({ data }: { data: any }) {
  // Provide sample data if none provided
  const sampleData = {
    totalIncome: data?.totalIncome || 5000,
    totalExpense: data?.totalExpense || 3500,
    ...data
  };
  
  return <QuickStatsWidget data={sampleData} />;
}

export function SimpleBudgetWidget({ data }: { data: any }) {
  // Provide sample data if none provided
  const sampleData = {
    budgetUsed: data?.budgetUsed || 750,
    budgetTotal: data?.budgetTotal || 1000,
    ...data
  };
  
  return <BudgetProgressWidget data={sampleData} />;
}