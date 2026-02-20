"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Skeleton for stats cards
export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden rounded-none border-4 border-foreground shadow-[8px_8px_0px_hsl(var(--foreground))]", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-10 rounded-none" />
          <Skeleton className="h-6 w-16 rounded-none" />
        </div>
        <Skeleton className="h-4 w-24 mb-2 rounded-none" />
        <Skeleton className="h-8 w-32 mb-2 rounded-none" />
        <Skeleton className="h-3 w-20 rounded-none" />
      </CardContent>
    </Card>
  );
}

// Skeleton for transaction items
export function TransactionItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-none border-4 border-foreground bg-paper shadow-[4px_4px_0px_hsl(var(--foreground))] mb-4 last:mb-0">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-none" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-none" />
          </div>
          <Skeleton className="h-4 w-24 rounded-none" />
        </div>
      </div>
      <div className="text-right space-y-1">
        <Skeleton className="h-6 w-20 rounded-none" />
      </div>
    </div>
  );
}

// Skeleton for recent transactions card
export function RecentTransactionsSkeleton() {
  return (
    <Card className="rounded-none border-4 border-foreground shadow-[12px_12px_0px_hsl(var(--foreground))]">
      <CardHeader className="pb-4 border-b-4 border-foreground bg-foreground/5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40 rounded-none" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-none" />
            <Skeleton className="h-8 w-20 rounded-none" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <TransactionItemSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for category insights
export function CategoryInsightsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="col-span-1 lg:col-span-2 rounded-none border-4 border-foreground shadow-[12px_12px_0px_hsl(var(--foreground))]">
        <CardHeader className="border-b-4 border-foreground bg-foreground/5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40 rounded-none" />
            <Skeleton className="h-8 w-32 rounded-none" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-none border-4 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] bg-paper">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-6 h-6 rounded-none" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1 rounded-none" />
                      <Skeleton className="h-3 w-16 rounded-none" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-1 rounded-none" />
                    <Skeleton className="h-3 w-12 rounded-none" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full rounded-none" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="rounded-none border-4 border-foreground shadow-[8px_8px_0px_hsl(var(--foreground))]">
        <CardHeader className="pb-3 border-b-4 border-foreground bg-foreground/5">
          <Skeleton className="h-5 w-32 rounded-none" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-none border-2 border-foreground" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-none" />
              <Skeleton className="h-3 w-32 rounded-none" />
              <Skeleton className="h-3 w-28 rounded-none" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="rounded-none border-4 border-foreground shadow-[8px_8px_0px_hsl(var(--foreground))]">
        <CardHeader className="pb-3 border-b-4 border-foreground bg-foreground/5">
          <Skeleton className="h-5 w-32 rounded-none" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-none border-2 border-foreground" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-none" />
              <Skeleton className="h-3 w-32 rounded-none" />
              <Skeleton className="h-3 w-28 rounded-none" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Full dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-none" />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RecentTransactionsSkeleton />
          </div>
          <Card className="rounded-none border-4 border-foreground shadow-[12px_12px_0px_hsl(var(--foreground))]">
            <CardHeader className="border-b-4 border-foreground bg-foreground/5">
              <Skeleton className="h-5 w-32 rounded-none" />
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-none" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Animated loading dots
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-3 h-3 bg-foreground border-2 border-background animate-bounce [animation-delay:-0.3s] shadow-[2px_2px_0px_hsl(var(--foreground))]" />
      <div className="w-3 h-3 bg-foreground border-2 border-background animate-bounce [animation-delay:-0.15s] shadow-[2px_2px_0px_hsl(var(--foreground))]" />
      <div className="w-3 h-3 bg-foreground border-2 border-background animate-bounce shadow-[2px_2px_0px_hsl(var(--foreground))]" />
    </div>
  );
}

// Pulse loading indicator
export function PulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-4 border-4 border-foreground border-dashed bg-foreground/5", className)}>
      <div className="w-10 h-10 bg-chartreuse border-4 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] animate-pulse" />
    </div>
  );
}