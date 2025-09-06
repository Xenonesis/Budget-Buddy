"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

// Quick Stats Widget - Matching website UI
export function QuickStatsWidget({ data }: { data: any }) {
  const balance = (data?.totalIncome || 0) - (data?.totalExpense || 0);
  
  return (
    <div className="rounded-xl border bg-card p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3 md:mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-violet-400 text-white">
          <DollarSign className="h-4 w-4" />
        </div>
        Quick Stats
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Income & Expense Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 text-white mx-auto mb-2">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-lg md:text-xl font-bold text-green-600">
              {formatCurrency(data?.totalIncome || 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Income</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white mx-auto mb-2">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div className="text-lg md:text-xl font-bold text-red-600">
              {formatCurrency(data?.totalExpense || 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Expenses</div>
          </div>
        </div>

        {/* Net Balance */}
        <div className="pt-4 border-t">
          <div className="text-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto mb-2 ${
              balance >= 0 
                ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                : 'bg-gradient-to-r from-red-500 to-pink-500'
            } text-white`}>
              <Activity className="h-4 w-4" />
            </div>
            <div className={`text-xl md:text-2xl font-bold ${
              balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(balance)}
            </div>
            <div className="text-xs text-muted-foreground">
              {balance >= 0 ? 'Positive Balance' : 'Negative Balance'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Budget Progress Widget - Matching website UI
export function BudgetProgressWidget({ data }: { data: any }) {
  const budgetUsed = data?.budgetUsed || 0;
  const budgetTotal = data?.budgetTotal || 1;
  const percentage = (budgetUsed / budgetTotal) * 100;
  const remaining = budgetTotal - budgetUsed;
  
  // Determine status and colors based on percentage
  const getStatusInfo = () => {
    if (percentage >= 100) {
      return {
        status: 'Over Budget',
        iconGradient: 'from-red-500 to-pink-500',
        textColor: 'text-red-600'
      };
    } else if (percentage >= 80) {
      return {
        status: 'Near Limit',
        iconGradient: 'from-amber-500 to-orange-500',
        textColor: 'text-amber-600'
      };
    } else {
      return {
        status: 'On Track',
        iconGradient: 'from-green-500 to-emerald-400',
        textColor: 'text-green-600'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="rounded-xl border bg-card p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3 md:mb-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${statusInfo.iconGradient} text-white`}>
          <Target className="h-4 w-4" />
        </div>
        Budget Progress
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Progress Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Monthly Progress</span>
            <span className={`text-sm font-semibold ${statusInfo.textColor}`}>
              {statusInfo.status}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${statusInfo.iconGradient} transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(percentage)}% used</span>
              <span>{formatCurrency(budgetUsed)} / {formatCurrency(budgetTotal)}</span>
            </div>
          </div>
        </div>

        {/* Budget Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white mx-auto mb-2">
              <DollarSign className="h-4 w-4" />
            </div>
            <div className="text-lg md:text-xl font-bold text-blue-600">
              {formatCurrency(budgetUsed)}
            </div>
            <div className="text-xs text-muted-foreground">Used</div>
          </div>
          
          <div className="text-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto mb-2 ${
              remaining >= 0 
                ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                : 'bg-gradient-to-r from-red-500 to-pink-500'
            } text-white`}>
              <Target className="h-4 w-4" />
            </div>
            <div className={`text-lg md:text-xl font-bold ${
              remaining >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(Math.abs(remaining))}
            </div>
            <div className="text-xs text-muted-foreground">
              {remaining >= 0 ? 'Remaining' : 'Over Budget'}
            </div>
          </div>
        </div>
      </div>
    </div>
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

// Simple Stats Widget (alias for QuickStatsWidget)
export function SimpleStatsWidget({ data }: { data: any }) {
  return <QuickStatsWidget data={data} />;
}

// Simple Budget Widget (alias for BudgetProgressWidget)
export function SimpleBudgetWidget({ data }: { data: any }) {
  return <BudgetProgressWidget data={data} />;
}

// Enhanced Stats Widget (alias for QuickStatsWidget with enhanced styling)
export function EnhancedStatsWidget({ data }: { data: any }) {
  return <QuickStatsWidget data={data} />;
}

// Enhanced Budget Widget (alias for BudgetProgressWidget with enhanced styling)
export function EnhancedBudgetWidget({ data }: { data: any }) {
  return <BudgetProgressWidget data={data} />;
}