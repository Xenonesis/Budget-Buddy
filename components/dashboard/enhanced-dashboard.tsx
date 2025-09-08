"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedExpensePieChart } from "./charts/enhanced-expense-pie-chart";
import { MonthlySpendingTrend } from "./charts/monthly-spending-trend";
import { YearOverYearComparison } from "./charts/year-over-year-comparison";
import { Calendar, Filter, Download, RefreshCw } from "lucide-react";

// Sample data interfaces (replace with your actual data types)
export interface ExpenseData {
  id: string;
  amount: number;
  category: string;
  subcategory?: string;
  date: Date;
  description: string;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  subcategories?: { name: string; value: number; color: string; }[];
}

export interface MonthlyTrendData {
  month: string;
  year: number;
  totalSpending: number;
  categoryBreakdown: { [category: string]: number };
  transactionCount: number;
}

export interface YearlyData {
  year: number;
  monthlyData: MonthlyTrendData[];
  totalSpending: number;
  averageMonthlySpending: number;
}

interface EnhancedDashboardProps {
  expenses: ExpenseData[];
  onExport?: () => void;
  onRefresh?: () => void;
}

export function EnhancedDashboard({ expenses, onExport, onRefresh }: EnhancedDashboardProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('6m');
  const [activeTab, setActiveTab] = useState('overview');
  const [drillDownData, setDrillDownData] = useState<{
    type: 'category' | 'month' | 'year';
    data: any;
  } | null>(null);

  // Process expenses into chart data
  const processedData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (dateRange) {
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setFullYear(2000); // Show all data
    }

    const filteredExpenses = expenses.filter(expense => expense.date >= cutoffDate);

    // Category data for pie chart
    const categoryMap = new Map<string, { value: number; subcategories: Map<string, number> }>();
    
    filteredExpenses.forEach(expense => {
      const category = expense.category;
      const subcategory = expense.subcategory || 'Other';
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { value: 0, subcategories: new Map() });
      }
      
      const categoryData = categoryMap.get(category)!;
      categoryData.value += expense.amount;
      
      const currentSubcategoryValue = categoryData.subcategories.get(subcategory) || 0;
      categoryData.subcategories.set(subcategory, currentSubcategoryValue + expense.amount);
    });

    const categoryColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#F97316', '#6366F1', '#14B8A6', '#A855F7'
    ];

    const categoryData: CategoryData[] = Array.from(categoryMap.entries()).map(([name, data], index) => ({
      name,
      value: data.value,
      color: categoryColors[index % categoryColors.length],
      subcategories: Array.from(data.subcategories.entries()).map(([subName, subValue], subIndex) => ({
        name: subName,
        value: subValue,
        color: `${categoryColors[index % categoryColors.length]}${Math.floor(80 + (subIndex * 20))}` // Variations of main color
      }))
    }));

    // Monthly trend data
    const monthlyMap = new Map<string, MonthlyTrendData>();
    
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: monthName,
          year: date.getFullYear(),
          totalSpending: 0,
          categoryBreakdown: {},
          transactionCount: 0
        });
      }
      
      const monthData = monthlyMap.get(key)!;
      monthData.totalSpending += expense.amount;
      monthData.transactionCount += 1;
      
      const currentCategoryValue = monthData.categoryBreakdown[expense.category] || 0;
      monthData.categoryBreakdown[expense.category] = currentCategoryValue + expense.amount;
    });

    const monthlyTrendData = Array.from(monthlyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return new Date(`${a.month} 1, 2000`).getMonth() - new Date(`${b.month} 1, 2000`).getMonth();
    });

    // Yearly data for year-over-year comparison
    const yearlyMap = new Map<number, YearlyData>();
    
    monthlyTrendData.forEach(monthData => {
      if (!yearlyMap.has(monthData.year)) {
        yearlyMap.set(monthData.year, {
          year: monthData.year,
          monthlyData: [],
          totalSpending: 0,
          averageMonthlySpending: 0
        });
      }
      
      const yearData = yearlyMap.get(monthData.year)!;
      yearData.monthlyData.push(monthData);
      yearData.totalSpending += monthData.totalSpending;
    });

    // Calculate averages
    yearlyMap.forEach(yearData => {
      yearData.averageMonthlySpending = yearData.totalSpending / yearData.monthlyData.length;
    });

    const yearlyData = Array.from(yearlyMap.values()).sort((a, b) => b.year - a.year);

    return {
      categoryData,
      monthlyTrendData,
      yearlyData,
      totalExpenses: filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      transactionCount: filteredExpenses.length
    };
  }, [expenses, dateRange]);

  // Handle category selection for trend chart
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Handle drill-down interactions
  const handleCategoryClick = (category: CategoryData) => {
    setDrillDownData({
      type: 'category',
      data: category
    });
  };

  const handleMonthClick = (month: string, year: number) => {
    setDrillDownData({
      type: 'month',
      data: { month, year }
    });
  };

  const handleYearClick = (year: number) => {
    setDrillDownData({
      type: 'year',
      data: { year }
    });
  };

  const clearDrillDown = () => {
    setDrillDownData(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Enhanced Expense Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of your spending patterns with interactive drill-down capabilities
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${processedData.totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedData.transactionCount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedData.categoryData.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(processedData.totalExpenses / Math.max(processedData.monthlyTrendData.length, 1)).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drill-down breadcrumb */}
      {drillDownData && (
        <Card className="bg-muted/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                <span>Viewing:</span>
                <span className="font-medium">
                  {drillDownData.type === 'category' && `${drillDownData.data.name} Category`}
                  {drillDownData.type === 'month' && `${drillDownData.data.month} ${drillDownData.data.year}`}
                  {drillDownData.type === 'year' && `Year ${drillDownData.data.year}`}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearDrillDown}>
                Clear Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Year Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedExpensePieChart
              categoryData={processedData.categoryData}
              onCategoryClick={handleCategoryClick}
            />
            
            <MonthlySpendingTrend
              data={processedData.monthlyTrendData}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              showYearOverYear={true}
              onMonthClick={handleMonthClick}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <MonthlySpendingTrend
            data={processedData.monthlyTrendData}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            showYearOverYear={true}
            onMonthClick={handleMonthClick}
          />
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-4">
          <YearOverYearComparison
            onYearClick={handleYearClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}