"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { AnimatedCounter, AnimatedPercentage } from "@/components/ui/animated-counter";
import { 
  CreditCard, 
  Calculator, 
  Calendar, 
  Tag,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  BarChart3,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedMetrics {
  totalTransactions: number;
  averageTransactionAmount: number;
  mostActiveDay: string;
  mostActiveCategory: string;
  trends?: {
    transactions?: { value: number; isPositive: boolean };
    avgAmount?: { value: number; isPositive: boolean };
    dayActivity?: { value: number; isPositive: boolean };
    categoryActivity?: { value: number; isPositive: boolean };
  };
}

interface PremiumMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: "blue" | "green" | "purple" | "orange";
  description?: string;
  isAnimated?: boolean;
}

const premiumColorStyles = {
  blue: {
    gradient: "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-blue-900/40",
    border: "border-blue-300/60 dark:border-blue-700/60",
    icon: "text-blue-600 dark:text-blue-400 bg-blue-200/50 dark:bg-blue-800/30",
    value: "text-blue-900 dark:text-blue-50",
    trend: "text-blue-700 dark:text-blue-300",
    glow: "shadow-blue-200/50 dark:shadow-blue-900/30"
  },
  green: {
    gradient: "bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-emerald-900/40",
    border: "border-emerald-300/60 dark:border-emerald-700/60",
    icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-200/50 dark:bg-emerald-800/30",
    value: "text-emerald-900 dark:text-emerald-50",
    trend: "text-emerald-700 dark:text-emerald-300",
    glow: "shadow-emerald-200/50 dark:shadow-emerald-900/30"
  },
  purple: {
    gradient: "bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-violet-900/40",
    border: "border-violet-300/60 dark:border-violet-700/60",
    icon: "text-violet-600 dark:text-violet-400 bg-violet-200/50 dark:bg-violet-800/30",
    value: "text-violet-900 dark:text-violet-50",
    trend: "text-violet-700 dark:text-violet-300",
    glow: "shadow-violet-200/50 dark:shadow-violet-900/30"
  },
  orange: {
    gradient: "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-orange-900/40",
    border: "border-orange-300/60 dark:border-orange-700/60",
    icon: "text-orange-600 dark:text-orange-400 bg-orange-200/50 dark:bg-orange-800/30",
    value: "text-orange-900 dark:text-orange-50",
    trend: "text-orange-700 dark:text-orange-300",
    glow: "shadow-orange-200/50 dark:shadow-orange-900/30"
  }
};

function PremiumMetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  color, 
  description, 
  isAnimated = true 
}: PremiumMetricCardProps) {
  const styles = premiumColorStyles[color];
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-500 group cursor-pointer",
        "hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]",
        styles.gradient,
        styles.border,
        "border-2 backdrop-blur-sm",
        isHovered && styles.glow
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6 relative z-10">
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute -top-2 -right-2 w-4 h-4 rounded-full opacity-20 animate-bounce",
            color === "blue" && "bg-blue-400",
            color === "green" && "bg-emerald-400",
            color === "purple" && "bg-violet-400",
            color === "orange" && "bg-orange-400"
          )} style={{ animationDelay: "0s" }} />
          <div className={cn(
            "absolute top-1/2 -left-1 w-2 h-2 rounded-full opacity-30 animate-bounce",
            color === "blue" && "bg-cyan-400",
            color === "green" && "bg-green-400",
            color === "purple" && "bg-purple-400",
            color === "orange" && "bg-amber-400"
          )} style={{ animationDelay: "0.5s" }} />
          <div className={cn(
            "absolute bottom-2 right-1/3 w-3 h-3 rounded-full opacity-25 animate-bounce",
            color === "blue" && "bg-blue-300",
            color === "green" && "bg-emerald-300",
            color === "purple" && "bg-violet-300",
            color === "orange" && "bg-orange-300"
          )} style={{ animationDelay: "1s" }} />
        </div>

        {/* Header with icon and trend */}
        <div className="flex items-start justify-between mb-6">
          <div className={cn(
            "p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
            styles.icon,
            "shadow-lg backdrop-blur-sm"
          )}>
            {icon}
          </div>
          
          {trend && (
            <Badge 
              variant="secondary" 
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full",
                "bg-white/70 dark:bg-black/30 backdrop-blur-md border-0",
                "shadow-lg transition-all duration-300 group-hover:scale-105",
                trend.isPositive ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <AnimatedPercentage value={Math.abs(trend.value)} duration={1000} />
            </Badge>
          )}
        </div>

        {/* Value with enhanced animation */}
        <div className={cn(
          "text-4xl font-black mb-3 transition-all duration-500 group-hover:scale-110",
          styles.value,
          "tracking-tight"
        )}>
          {isAnimated && typeof value === 'number' && title.includes('Amount') ? (
            <AnimatedCounter value={value} isCurrency={true} duration={1500} />
          ) : isAnimated && typeof value === 'number' ? (
            <AnimatedCounter value={value} duration={1200} />
          ) : (
            value
          )}
        </div>

        {/* Title and description */}
        <div className="space-y-2">
          <h3 className={cn(
            "text-sm font-bold tracking-wide uppercase transition-colors duration-300",
            "text-muted-foreground group-hover:text-foreground"
          )}>
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Enhanced animated background effects */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out" />
          
          {/* Radial glow */}
          <div className={cn(
            "absolute inset-0 blur-2xl opacity-30",
            color === "blue" && "bg-gradient-radial from-blue-400/20 to-transparent",
            color === "green" && "bg-gradient-radial from-emerald-400/20 to-transparent",
            color === "purple" && "bg-gradient-radial from-violet-400/20 to-transparent",
            color === "orange" && "bg-gradient-radial from-orange-400/20 to-transparent"
          )} />
        </div>

        {/* Corner accent */}
        <div className={cn(
          "absolute top-0 right-0 w-16 h-16 opacity-10 transition-opacity duration-300 group-hover:opacity-20",
          color === "blue" && "bg-gradient-to-bl from-blue-400 to-transparent",
          color === "green" && "bg-gradient-to-bl from-emerald-400 to-transparent",
          color === "purple" && "bg-gradient-to-bl from-violet-400 to-transparent",
          color === "orange" && "bg-gradient-to-bl from-orange-400 to-transparent"
        )} />
      </CardContent>
    </Card>
  );
}

interface PremiumMetricsSectionProps {
  metrics: EnhancedMetrics;
  className?: string;
}

export function PremiumMetricsSection({ metrics, className }: PremiumMetricsSectionProps) {
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");
  const [showTrends, setShowTrends] = useState(true);

  const formatCategory = (category: string) => {
    if (!category || category === 'N/A') return 'N/A';
    return category.length > 12 ? category.substring(0, 12) + '...' : category;
  };

  const formatDay = (day: string) => {
    if (!day || day === 'N/A') return 'N/A';
    const dayMap: Record<string, string> = {
      'Monday': 'Monday',
      'Tuesday': 'Tuesday', 
      'Wednesday': 'Wednesday',
      'Thursday': 'Thursday',
      'Friday': 'Friday',
      'Saturday': 'Saturday',
      'Sunday': 'Sunday'
    };
    return dayMap[day] || day;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Financial Metrics</h2>
            <p className="text-sm text-muted-foreground">Key performance indicators</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrends(!showTrends)}
            className="flex items-center gap-2"
          >
            {showTrends ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Trends
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "detailed" ? "compact" : "detailed")}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {viewMode === "detailed" ? "Compact" : "Detailed"}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={cn(
        "grid gap-6 transition-all duration-500",
        viewMode === "detailed" 
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" 
          : "grid-cols-2 lg:grid-cols-4"
      )}>
        <PremiumMetricCard
          title="Total Transactions"
          value={metrics.totalTransactions || 0}
          icon={<CreditCard className="h-7 w-7" />}
          color="blue"
          trend={showTrends ? metrics.trends?.transactions : undefined}
          description="All recorded transactions"
          isAnimated={true}
        />
        
        <PremiumMetricCard
          title="Average Amount"
          value={metrics.averageTransactionAmount || 0}
          icon={<Calculator className="h-7 w-7" />}
          color="green"
          trend={showTrends ? metrics.trends?.avgAmount : undefined}
          description="Mean transaction value"
          isAnimated={true}
        />
        
        <PremiumMetricCard
          title="Peak Activity Day"
          value={formatDay(metrics.mostActiveDay)}
          icon={<Calendar className="h-7 w-7" />}
          color="purple"
          trend={showTrends ? metrics.trends?.dayActivity : undefined}
          description="Most transactions recorded"
          isAnimated={false}
        />
        
        <PremiumMetricCard
          title="Top Category"
          value={formatCategory(metrics.mostActiveCategory)}
          icon={<Tag className="h-7 w-7" />}
          color="orange"
          trend={showTrends ? metrics.trends?.categoryActivity : undefined}
          description="Most frequently used"
          isAnimated={false}
        />
      </div>
    </div>
  );
}