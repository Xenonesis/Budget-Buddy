"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Target, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryData {
  name: string;
  count: number;
  total: number;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  budget?: number;
}

interface EnhancedCategoryInsightsProps {
  topCategories: CategoryData[];
  totalExpense: number;
  showBudgetComparison?: boolean;
}

function CategoryProgressBar({ 
  category, 
  percentage, 
  totalExpense 
}: { 
  category: CategoryData; 
  percentage: number; 
  totalExpense: number;
}) {
  const budgetPercentage = category.budget ? (category.total / category.budget) * 100 : 0;
  const isOverBudget = category.budget && category.total > category.budget;
  
  return (
    <div className="group p-4 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform"
            style={{ backgroundColor: category.color }}
          />
          <div>
            <h4 className="font-medium text-sm">{category.name}</h4>
            <p className="text-xs text-muted-foreground">
              {category.count} transaction{category.count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-semibold text-sm">
            {formatCurrency(category.total)}
          </div>
          <div className="text-xs text-muted-foreground">
            {percentage.toFixed(1)}% of total
          </div>
        </div>
      </div>
      
      {/* Spending progress bar */}
      <div className="space-y-2">
        <Progress 
          value={percentage} 
          className="h-2"
          style={{ 
            '--progress-background': category.color,
          } as React.CSSProperties}
        />
        
        {/* Budget comparison if available */}
        {category.budget && (
          <div className="flex items-center justify-between text-xs">
            <span className={cn(
              "flex items-center gap-1",
              isOverBudget ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
            )}>
              <Target className="h-3 w-3" />
              Budget: {formatCurrency(category.budget)}
            </span>
            <Badge 
              variant={isOverBudget ? "destructive" : "secondary"}
              className="text-xs"
            >
              {budgetPercentage.toFixed(0)}% used
            </Badge>
          </div>
        )}
        
        {/* Trend indicator */}
        {category.trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs",
            category.trend.isPositive ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
          )}>
            {category.trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(category.trend.value)}% vs last month
          </div>
        )}
      </div>
    </div>
  );
}

export function EnhancedCategoryInsights({ 
  topCategories, 
  totalExpense, 
  showBudgetComparison = false 
}: EnhancedCategoryInsightsProps) {
  const [viewMode, setViewMode] = useState<"spending" | "frequency">("spending");
  
  const sortedCategories = [...topCategories].sort((a, b) => 
    viewMode === "spending" ? b.total - a.total : b.count - a.count
  );
  
  const displayCategories = sortedCategories.slice(0, 6);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main category breakdown */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Category Breakdown
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={viewMode === "spending" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("spending")}
                  className="h-7 px-3 text-xs"
                >
                  <PieChart className="h-3 w-3 mr-1" />
                  By Amount
                </Button>
                <Button
                  variant={viewMode === "frequency" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("frequency")}
                  className="h-7 px-3 text-xs"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  By Frequency
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {displayCategories.length > 0 ? (
            <div className="space-y-4">
              {displayCategories.map((category) => {
                const percentage = viewMode === "spending" 
                  ? (category.total / totalExpense) * 100
                  : (category.count / topCategories.reduce((sum, c) => sum + c.count, 0)) * 100;
                
                return (
                  <CategoryProgressBar
                    key={category.name}
                    category={category}
                    percentage={percentage}
                    totalExpense={totalExpense}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <PieChart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">No expense data</h3>
              <p className="text-muted-foreground">
                Start tracking expenses to see category insights
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick insights cards */}
      {displayCategories.length > 0 && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Top Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayCategories[0] && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: displayCategories[0].color }}
                  />
                  <div>
                    <h4 className="font-semibold">{displayCategories[0].name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(displayCategories[0].total)} • {displayCategories[0].count} transactions
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((displayCategories[0].total / totalExpense) * 100).toFixed(1)}% of total expenses
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Most Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              {[...displayCategories].sort((a, b) => b.count - a.count)[0] && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: [...displayCategories].sort((a, b) => b.count - a.count)[0].color }}
                  />
                  <div>
                    <h4 className="font-semibold">
                      {[...displayCategories].sort((a, b) => b.count - a.count)[0].name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {[...displayCategories].sort((a, b) => b.count - a.count)[0].count} transactions this month
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Average: {formatCurrency([...displayCategories].sort((a, b) => b.count - a.count)[0].total / [...displayCategories].sort((a, b) => b.count - a.count)[0].count)} per transaction
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}