"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, icon, className = "" }: StatCardProps) {
  return (
    <div className={`rounded-xl border bg-card p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-violet-400 text-white">
          {icon}
        </div>
        {title}
      </div>
      <div className="mt-3 md:mt-4 text-2xl md:text-3xl font-bold">
        {formatCurrency(value)}
      </div>
      <div className="mt-2 flex items-center text-xs sm:text-sm text-muted-foreground">
        <span>Current period</span>
      </div>
    </div>
  );
}

interface DashboardStatsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export function DashboardStats({ totalIncome, totalExpense, balance }: DashboardStatsProps) {
  return (
    <section className="mb-8 md:mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Financial Summary">
      <StatCard
        title="Total Income"
        value={totalIncome}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        }
      />

      <StatCard
        title="Total Expenses"
        value={totalExpense}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
          </svg>
        }
      />

      <div className={`rounded-xl border bg-card p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1`}>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-violet-400 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          Current Balance
        </div>
        <div className={`mt-3 md:mt-4 text-2xl md:text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} aria-live="polite">
          {formatCurrency(balance)}
        </div>
        <div className="mt-2 flex items-center text-xs sm:text-sm text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>As of today</span>
        </div>
      </div>
    </section>
  );
}