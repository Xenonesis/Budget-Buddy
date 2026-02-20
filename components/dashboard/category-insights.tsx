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
    <section className="mt-4 md:mt-6 mb-8" aria-labelledby="category-insights-title">
      <h2 className="mb-6 pb-4 md:mb-8 text-2xl md:text-3xl font-display font-semibold tracking-tight border-b border-border" id="category-insights-title">Category Insights</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top spending categories */}
        <div className="rounded-2xl border bg-card p-5 md:p-6 shadow-sm hover:shadow-md transition-all" aria-labelledby="top-spending-title">
          <h3 className="mb-4 text-lg font-semibold tracking-tight text-foreground" id="top-spending-title">Top Spending</h3>
          <div className="space-y-4">
            {topCategories.length > 0 ? (
              topCategories.map((category) => (
                <div key={category.name} className="flex items-center justify-between border-b border-border/50 pb-3 hover:bg-muted/30 transition-colors p-2 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    <span className="text-base font-medium capitalize">{category.name}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="font-semibold text-lg text-foreground">
                      {formatCurrency(category.total)}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground bg-accent px-2 py-0.5 rounded-full mt-1">
                      {Math.round((category.total / totalExpense) * 100)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground p-6 rounded-xl border border-dashed bg-muted/10 font-medium" aria-live="polite">
                No expense data available
              </div>
            )}
          </div>
        </div>

        {/* Most used categories */}
        <div className="rounded-2xl border bg-card p-5 md:p-6 shadow-sm hover:shadow-md transition-all" aria-labelledby="most-used-title">
          <h3 className="mb-4 text-lg font-semibold tracking-tight text-foreground" id="most-used-title">Most Used</h3>
          <div className="space-y-4">
            {topCategories.length > 0 ? (
              [...topCategories]
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((category) => (
                  <div key={category.name} className="flex items-center justify-between border-b border-border/50 pb-3 hover:bg-muted/30 transition-colors p-2 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <span className="text-base font-medium capitalize">{category.name}</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="font-semibold text-lg text-foreground">
                        {category.count} <span className="text-sm font-normal text-muted-foreground">txns</span>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground bg-accent px-2 py-0.5 rounded-full mt-1">
                        {formatCurrency(category.total)}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center text-muted-foreground p-6 rounded-xl border border-dashed bg-muted/10 font-medium" aria-live="polite">
                No transaction data available
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}