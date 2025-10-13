"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface EnhancedProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  max?: number;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  animated?: boolean;
  gradient?: boolean;
}

const sizeClasses = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4"
};

const variantClasses = {
  default: "bg-primary",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500"
};

const EnhancedProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  EnhancedProgressProps
>(({ 
  className, 
  value = 0, 
  max = 100,
  showValue = false,
  size = "md",
  variant = "default",
  animated = false,
  gradient = false,
  ...props 
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className="space-y-2">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full bg-secondary",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-out",
            gradient 
              ? "bg-gradient-to-r from-primary/80 to-primary" 
              : variantClasses[variant],
            animated && "animate-pulse"
          )}
          style={{ 
            transform: `translateX(-${100 - percentage}%)`,
            background: gradient 
              ? `linear-gradient(90deg, ${variantClasses[variant]}80, ${variantClasses[variant]})`
              : undefined
          }}
        />
        
        {/* Animated shimmer effect */}
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        )}
      </ProgressPrimitive.Root>
      
      {showValue && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{value}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
});

EnhancedProgress.displayName = "EnhancedProgress";

export { EnhancedProgress };