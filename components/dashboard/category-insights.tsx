"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";

interface CategoryData {
  name: string;
  count: number;
  total: number;
  color: string;
}

interface CategoryInsightsProps {
  topCategories: CategoryData[];
  totalExpense: number;
}

export function CategoryInsights({ topCategories, totalExpense }: CategoryInsightsProps) {
  return (
    <section className="mt-4 md:mt-6" aria-labelledby="category-insights-title">
      <h2 className="mb-3 md:mb-4 text-lg md:text-xl font-semibold" id="category-insights-title">Category Insights</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Top spending categories */}
        <div className="overflow-hidden rounded-lg border bg-card p-4" aria-labelledby="top-spending-title">
          <h3 className="mb-3 text-lg font-medium" id="top-spending-title">Top Spending Categories</h3>
          <div className="space-y-4">
            {topCategories.length > 0 ? (
              topCategories.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(category.total)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((category.total / totalExpense) * 100)}% of expenses
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground" aria-live="polite">
                No expense data available
              </div>
            )}
          </div>
        </div>

        {/* Most used categories */}
        <div className="overflow-hidden rounded-lg border bg-card p-4" aria-labelledby="most-used-title">
          <h3 className="mb-3 text-lg font-medium" id="most-used-title">Most Used Categories</h3>
          <div className="space-y-4">
            {topCategories.length > 0 ? (
              [...topCategories]
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {category.count} transactions
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(category.total)} total
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center text-muted-foreground" aria-live="polite">
                No transaction data available
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}