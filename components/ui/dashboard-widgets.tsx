"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  CreditCard,
  Activity,
  PieChart
} from 'lucide-react';

// Quick Stats Widget
export function QuickStatsWidget({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Quick Stats</CardTitle>
        <CardDescription>Your financial overview</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Income</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(data?.totalIncome || 0)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Expenses</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(data?.totalExpense || 0)}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Net Balance</span>
            <span className={`text-lg font-bold ${
              (data?.totalIncome || 0) - (data?.totalExpense || 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {formatCurrency((data?.totalIncome || 0) - (data?.totalExpense || 0))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Budget Progress Widget
export function BudgetProgressWidget({ data }: { data: any }) {
  const budgetUsed = data?.budgetUsed || 0;
  const budgetTotal = data?.budgetTotal || 1;
  const percentage = (budgetUsed / budgetTotal) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4" />
          Budget Progress
        </CardTitle>
        <CardDescription>Monthly budget tracking</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Used: {formatCurrency(budgetUsed)}</span>
            <span>Total: {formatCurrency(budgetTotal)}</span>
          </div>
          <Progress value={Math.min(percentage, 100)} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(percentage)}% used</span>
            <span>{formatCurrency(budgetTotal - budgetUsed)} remaining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Transactions Widget
export function RecentTransactionsWidget({ data }: { data: any }) {
  const transactions = data?.recentTransactions || [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Transactions
        </CardTitle>
        <CardDescription>Latest financial activity</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3">
          {transactions.slice(0, 3).map((transaction: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{transaction.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Monthly Summary Widget
export function MonthlySummaryWidget({ data }: { data: any }) {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {currentMonth} Summary
        </CardTitle>
        <CardDescription>This month's financial overview</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-600 font-medium">Income</p>
            <p className="text-lg font-bold text-green-700">
              {formatCurrency(data?.monthlyIncome || 0)}
            </p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <CreditCard className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium">Expenses</p>
            <p className="text-lg font-bold text-red-700">
              {formatCurrency(data?.monthlyExpense || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Category Breakdown Widget
export function CategoryBreakdownWidget({ data }: { data: any }) {
  const categories = data?.topCategories || [];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChart className="h-4 w-4" />
          Top Categories
        </CardTitle>
        <CardDescription>Your spending breakdown</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3">
          {categories.slice(0, 4).map((category: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium capitalize">
                  {category.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatCurrency(category.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {category.count} transactions
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}