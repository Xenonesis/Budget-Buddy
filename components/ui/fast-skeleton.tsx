"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FastSkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circle";
  lines?: number;
}

export function FastSkeleton({ 
  className, 
  variant = "default", 
  lines = 1 
}: FastSkeletonProps) {
  const baseClasses = "fast-skeleton";
  
  const variants = {
    default: "h-4 w-full rounded-lg bg-muted/60",
    card: "h-24 w-full rounded-xl bg-muted/60",
    text: "h-4 rounded-lg bg-muted/60",
    circle: "h-12 w-12 rounded-full bg-muted/60"
  };

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variants[variant],
              i === lines - 1 && variant === "text" ? "w-3/4" : "",
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
    />
  );
}

// Fast dashboard skeleton with minimal DOM elements
export function FastDashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-xl">
      {/* Header */}
      <div className="mb-6">
        <FastSkeleton className="h-8 w-48 mb-2" />
        <FastSkeleton className="h-4 w-96" />
      </div>
      
      {/* Stats cards - simplified */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <FastSkeleton variant="card" />
        <FastSkeleton variant="card" />
        <FastSkeleton variant="card" />
      </div>
      
      {/* Main content area */}
      <div className="space-y-6">
        <FastSkeleton className="h-64 rounded-xl" />
        <FastSkeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

// Fast transaction skeleton
export function FastTransactionSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <FastSkeleton className="h-6 w-48" />
        <FastSkeleton className="h-8 w-20" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FastSkeleton variant="circle" className="h-8 w-8" />
              <div>
                <FastSkeleton className="h-4 w-24 mb-1" />
                <FastSkeleton className="h-3 w-16" />
              </div>
            </div>
            <FastSkeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}