"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Target
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

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: "blue" | "green" | "purple" | "orange";
  description?: string;
}

const colorStyles = {
  blue: {
    gradient: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
    border: "border-blue-200/50 dark:border-blue-800/50",
    icon: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
    value: "text-blue-900 dark:text-blue-100",
    trend: "text-blue-600 dark:text-blue-400"
  },
  green: {
    gradient: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30",
    border: "border-emerald-200/50 dark:border-emerald-800/50",
    icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
    value: "text-emerald-900 dark:text-emerald-100",
    trend: "text-emerald-600 dark:text-emerald-400"
  },
  purple: {
    gradient: "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
    border: "border-violet-200/50 dark:border-violet-800/50",
    icon: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30",
    value: "text-violet-900 dark:text-violet-100",
    trend: "text-violet-600 dark:text-violet-400"
  },
  orange: {
    gradient: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
    border: "border-orange-200/50 dark:border-orange-800/50",
    icon: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
    value: "text-orange-900 dark:text-orange-100",
    trend: "text-orange-600 dark:text-orange-400"
  }
};

function MetricCard({ title, value, icon, trend, color, description }: MetricCardProps) {
  const styles = colorStyles[color];
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group",
      styles.gradient,
      styles.border,
      "border-2"
    )}>
      <CardContent className="p-6">
        {/* Header with icon and trend */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
            styles.icon
          )}>
            {icon}
          </div>
          
          {trend && (
            <Badge 
              variant="secondary" 
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1",
                "bg-white/60 dark:bg-black/20 backdrop-blur-sm",
                trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <AnimatedPercentage value={Math.abs(trend.value)} duration={800} />
            </Badge>
          )}
        </div>

        {/* Value */}
        <div className={cn(
          "text-3xl font-bold mb-2 transition-all duration-300 group-hover:scale-105",
          styles.value
        )}>
          {typeof value === 'number' && title.includes('Amount') ? (
            <AnimatedCounter value={value} isCurrency={true} duration={1200} />
          ) : typeof value === 'number' ? (
            <AnimatedCounter value={value} duration={1000} />
          ) : (
            value
          )}
        </div>

        {/* Title and description */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1 group-hover:text-foreground transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground/80">
              {description}
            </p>
          )}
        </div>

        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={cn(
            "absolute inset-0 blur-xl",
            color === "blue" && "bg-blue-400/10",
            color === "green" && "bg-emerald-400/10",
            color === "purple" && "bg-violet-400/10",
            color === "orange" && "bg-orange-400/10"
          )} />
        </div>
      </CardContent>
    </Card>
  );
}

interface EnhancedMetricsCardsProps {
  metrics: EnhancedMetrics;
  className?: string;
}

export function EnhancedMetricsCards({ metrics, className }: EnhancedMetricsCardsProps) {
  const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const formatCategory = (category: string) => {
    if (!category || category === 'N/A') return 'N/A';
    return category.length > 10 ? category.substring(0, 10) + '...' : category;
  };

  const formatDay = (day: string) => {
    if (!day || day === 'N/A') return 'N/A';
    // Convert full day names to short forms
    const dayMap: Record<string, string> = {
      'Monday': 'Mon',
      'Tuesday': 'Tue', 
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    return dayMap[day] || day;
  };

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <MetricCard
        title="Total Transactions"
        value={formatValue(metrics.totalTransactions || 0)}
        icon={<CreditCard className="h-6 w-6" />}
        color="blue"
        trend={metrics.trends?.transactions}
        description="All time transactions"
      />
      
      <MetricCard
        title="Average Amount"
        value={formatCurrency(metrics.averageTransactionAmount || 0)}
        icon={<Calculator className="h-6 w-6" />}
        color="green"
        trend={metrics.trends?.avgAmount}
        description="Per transaction"
      />
      
      <MetricCard
        title="Most Active Day"
        value={formatDay(metrics.mostActiveDay)}
        icon={<Calendar className="h-6 w-6" />}
        color="purple"
        trend={metrics.trends?.dayActivity}
        description="Peak activity day"
      />
      
      <MetricCard
        title="Top Category"
        value={formatCategory(metrics.mostActiveCategory)}
        icon={<Tag className="h-6 w-6" />}
        color="orange"
        trend={metrics.trends?.categoryActivity}
        description="Most used category"
      />
    </div>
  );
}

// Alternative compact version for smaller screens
export function CompactMetricsCards({ metrics, className }: EnhancedMetricsCardsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50 dark:border-blue-800/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {metrics.totalTransactions || 0}
              </div>
              <div className="text-xs text-muted-foreground">Transactions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200/50 dark:border-emerald-800/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                {formatCurrency(metrics.averageTransactionAmount || 0)}
              </div>
              <div className="text-xs text-muted-foreground">Average</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50 dark:border-violet-800/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-violet-900 dark:text-violet-100">
                {formatDay(metrics.mostActiveDay)}
              </div>
              <div className="text-xs text-muted-foreground">Peak Day</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200/50 dark:border-orange-800/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
                {formatCategory(metrics.mostActiveCategory)}
              </div>
              <div className="text-xs text-muted-foreground">Top Category</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}