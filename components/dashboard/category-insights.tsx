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
      <h2 className="mb-6 pb-4 md:mb-8 text-2xl md:text-3xl font-display font-black uppercase border-b-4 border-foreground tracking-tight" id="category-insights-title">Category Insights</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top spending categories */}
        <div className="border-4 border-foreground bg-paper p-5 md:p-6 shadow-[8px_8px_0px_hsl(var(--foreground))]" aria-labelledby="top-spending-title">
          <h3 className="mb-4 pb-2 border-b-2 border-foreground text-xl font-display font-black uppercase tracking-widest text-foreground bg-foreground/5 inline-block px-2 py-1" id="top-spending-title">Top Spending</h3>
          <div className="space-y-4 font-mono font-medium">
            {topCategories.length > 0 ? (
              topCategories.map((category) => (
                <div key={category.name} className="flex items-center justify-between border-b-2 border-foreground/20 pb-2 hover:bg-foreground/5 transition-colors p-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-4 w-4 border-2 border-foreground shadow-[2px_2px_0px_hsl(var(--foreground))]"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    <span className="text-base font-bold uppercase tracking-widest">{category.name}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="font-bold text-lg">
                      {formatCurrency(category.total)}
                    </div>
                    <div className="text-xs font-bold font-mono tracking-widest bg-foreground text-background px-1 mt-1 inline-block">
                      {Math.round((category.total / totalExpense) * 100)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-foreground font-bold p-4 border-2 border-foreground bg-foreground/10" aria-live="polite">
                No expense data available
              </div>
            )}
          </div>
        </div>

        {/* Most used categories */}
        <div className="border-4 border-foreground bg-paper p-5 md:p-6 shadow-[8px_8px_0px_hsl(var(--foreground))]" aria-labelledby="most-used-title">
          <h3 className="mb-4 pb-2 border-b-2 border-foreground text-xl font-display font-black uppercase tracking-widest text-foreground bg-foreground/5 inline-block px-2 py-1" id="most-used-title">Most Used</h3>
          <div className="space-y-4 font-mono font-medium">
            {topCategories.length > 0 ? (
              [...topCategories]
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((category) => (
                  <div key={category.name} className="flex items-center justify-between border-b-2 border-foreground/20 pb-2 hover:bg-foreground/5 transition-colors p-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-4 w-4 border-2 border-foreground shadow-[2px_2px_0px_hsl(var(--foreground))]"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <span className="text-base font-bold uppercase tracking-widest">{category.name}</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="font-bold text-lg">
                        {category.count} TXNS
                      </div>
                      <div className="text-xs font-bold font-mono tracking-widest bg-foreground/10 px-1 border-2 border-foreground inline-block mt-1">
                        {formatCurrency(category.total)}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center text-foreground font-bold p-4 border-2 border-foreground bg-foreground/10" aria-live="polite">
                No transaction data available
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}