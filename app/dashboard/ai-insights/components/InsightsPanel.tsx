"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info } from "lucide-react";
import { FinancialInsight } from "@/lib/ai";

interface InsightsPanelProps {
  insights: FinancialInsight[];
  loading: boolean;
  onRefresh: () => void;
  className?: string;
}

export function InsightsPanel({ insights, loading, onRefresh, className = "" }: InsightsPanelProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'decline':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'destructive';
      case 'success':
        return 'default';
      case 'trend':
        return 'secondary';
      case 'decline':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Financial Insights</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {insights.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No insights available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate AI insights to get personalized financial recommendations
            </p>
            <Button onClick={onRefresh} disabled={loading} size="sm">
              {loading ? 'Generating...' : 'Generate Insights'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {insights.map((insight, index) => (
            <Card key={index} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    {getInsightIcon(insight.type)}
                    <CardTitle className="text-base leading-tight">
                      {insight.title}
                    </CardTitle>
                  </div>
                  <Badge variant={getInsightBadgeVariant(insight.type)} className="shrink-0">
                    {insight.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight.description}
                </p>
                {insight.amount && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Amount:</span>
                      <span className={`font-semibold ${
                        insight.type === 'success' ? 'text-green-600' : 
                        insight.type === 'warning' || insight.type === 'decline' ? 'text-red-600' : 
                        'text-blue-600'
                      }`}>
                        ${Math.abs(insight.amount).toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    </div>
                  </div>
                )}
                {insight.category && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.category}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}