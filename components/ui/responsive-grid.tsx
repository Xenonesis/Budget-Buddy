"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  autoFit?: boolean;
  minItemWidth?: string;
}

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 4,
  autoFit = false,
  minItemWidth = "300px"
}: ResponsiveGridProps) {
  const gridClasses = cn(
    "grid",
    `gap-${gap}`,
    !autoFit && [
      cols.default && `grid-cols-${cols.default}`,
      cols.sm && `sm:grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
      cols.xl && `xl:grid-cols-${cols.xl}`
    ],
    className
  );

  if (autoFit) {
    return (
      <div 
        className={cn("grid", `gap-${gap}`, className)}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "2xl",
  padding = true
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full"
  };

  return (
    <div className={cn(
      "mx-auto w-full",
      maxWidthClasses[maxWidth],
      padding && "px-4 sm:px-6 lg:px-8",
      className
    )}>
      {children}
    </div>
  );
}

interface MobileFirstCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

export function MobileFirstCard({
  children,
  className,
  padding = "md",
  hover = true
}: MobileFirstCardProps) {
  const paddingClasses = {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  };

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg shadow-sm",
      paddingClasses[padding],
      hover && "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
      "touch-manipulation", // Better touch interactions
      className
    )}>
      {children}
    </div>
  );
}

interface StackProps {
  children: React.ReactNode;
  className?: string;
  direction?: "vertical" | "horizontal";
  spacing?: number;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
}

export function Stack({
  children,
  className,
  direction = "vertical",
  spacing = 4,
  align = "stretch",
  justify = "start",
  wrap = false
}: StackProps) {
  const isVertical = direction === "vertical";
  
  const alignClasses = {
    start: isVertical ? "items-start" : "justify-start",
    center: isVertical ? "items-center" : "justify-center", 
    end: isVertical ? "items-end" : "justify-end",
    stretch: isVertical ? "items-stretch" : "justify-stretch"
  };

  const justifyClasses = {
    start: isVertical ? "justify-start" : "items-start",
    center: isVertical ? "justify-center" : "items-center",
    end: isVertical ? "justify-end" : "items-end", 
    between: isVertical ? "justify-between" : "items-between",
    around: isVertical ? "justify-around" : "items-around",
    evenly: isVertical ? "justify-evenly" : "items-evenly"
  };

  return (
    <div className={cn(
      "flex",
      isVertical ? "flex-col" : "flex-row",
      isVertical ? `space-y-${spacing}` : `space-x-${spacing}`,
      alignClasses[align],
      justifyClasses[justify],
      wrap && "flex-wrap",
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized touch targets
interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TouchTarget({
  children,
  className,
  size = "md"
}: TouchTargetProps) {
  const sizeClasses = {
    sm: "min-h-[40px] min-w-[40px]",
    md: "min-h-[44px] min-w-[44px]", // Apple's recommended minimum
    lg: "min-h-[48px] min-w-[48px]"
  };

  return (
    <div className={cn(
      "flex items-center justify-center",
      sizeClasses[size],
      "touch-manipulation tap-highlight-transparent",
      className
    )}>
      {children}
    </div>
  );
}