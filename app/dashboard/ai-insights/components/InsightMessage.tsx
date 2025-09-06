"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FinancialInsight } from "@/lib/ai";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Target,
  DollarSign,
  Calendar,
  ArrowRight
} from "lucide-react";

interface InsightMessageProps {
  insights: FinancialInsight[];
  onActionClick?: (action: string, insight: FinancialInsight) => void;
}

export function InsightMessage({ insights, onActionClick }: InsightMessageProps) {
  const getInsightIcon = (type: string) => {
    const iconProps = { className: "h-5 w-5" };
    switch (type) {
      case 'spending_pattern':
        return <TrendingUp {...iconProps} />;
      case 'saving_suggestion':
        return <Lightbulb {...iconProps} />;
      case 'budget_warning':
        return <AlertTriangle {...iconProps} />;
      case 'investment_tip':
        return <Target {...iconProps} />;
      case 'warning':
        return <AlertCircle {...iconProps} />;
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'trend':
        return <BarChart3 {...iconProps} />;
      case 'decline':
        return <TrendingDown {...iconProps} />;
      default:
        return <BarChart3 {...iconProps} />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'spending_pattern':
        return 'blue';
      case 'saving_suggestion':
        return 'green';
      case 'budget_warning':
        return 'orange';
      case 'investment_tip':
        return 'purple';
      case 'warning':
        return 'red';
      case 'success':
        return 'emerald';
      case 'trend':
        return 'indigo';
      case 'decline':
        return 'rose';
      default:
        return 'gray';
    }
  };

  const getTypeDisplayName = (type: string) => {
    const names: Record<string, string> = {
      'spending_pattern': 'Spending Pattern',
      'saving_suggestion': 'Savings Opportunity',
      'budget_warning': 'Budget Alert',
      'investment_tip': 'Investment Insight',
      'warning': 'Financial Warning',
      'success': 'Great Progress',
      'trend': 'Trend Analysis',
      'decline': 'Decline Alert'
    };
    return names[type] || 'Financial Insight';
  };

  if (insights.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">No Insights Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                I don't have any financial insights ready right now. Would you like me to analyze your recent financial activity and generate some fresh insights?
              </p>
              <Button 
                size="sm" 
                onClick={() => onActionClick?.('generate_insights', {} as FinancialInsight)}
                className="text-xs"
              >
                Generate New Insights
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Your Financial Insights</h3>
          <p className="text-sm text-muted-foreground">
            Based on your recent financial activity
          </p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const color = getInsightColor(insight.type);
          const icon = getInsightIcon(insight.type);
          
          return (
            <Card key={index} className="w-full overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {/* Header */}
                <div className={`p-4 bg-${color}-50 border-l-4 border-${color}-500 dark:bg-${color}-950/20`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/50 rounded-lg text-${color}-600 dark:text-${color}-400`}>
                        {icon}
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {getTypeDisplayName(insight.type)}
                        </Badge>
                        <h4 className="font-semibold text-base">{insight.title}</h4>
                      </div>
                    </div>
                    
                    {/* Confidence Score */}
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={insight.confidence * 100} 
                          className="w-16 h-2" 
                        />
                        <span className="text-sm font-medium">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm leading-relaxed text-foreground mb-4">
                    {insight.description}
                  </p>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {insight.amount && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          ${Math.abs(insight.amount).toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {insight.category && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-primary/20" />
                        <span>{insight.category}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onActionClick?.('tell-me-more', insight)}
                      className="text-xs"
                    >
                      Tell me more
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onActionClick?.('take-action', insight)}
                      className="text-xs"
                    >
                      Take action
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg text-sm">
        <div className="text-muted-foreground">
          Generated {insights.length} insight{insights.length !== 1 ? 's' : ''} • 
          Updated {new Date().toLocaleString()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onActionClick?.('refresh_insights', {} as FinancialInsight)}
          className="text-xs"
        >
          Refresh Insights
        </Button>
      </div>
    </div>
  );
}