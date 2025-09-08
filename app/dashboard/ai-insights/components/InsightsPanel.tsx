"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info, Volume2, Eye, Zap, Target, DollarSign, Loader2, Sparkles, Brain } from "lucide-react";
import { FinancialInsight } from "@/lib/ai";
import { RealFinancialInsight } from "@/lib/real-financial-insights";

interface InsightsPanelProps {
  insights: (FinancialInsight | RealFinancialInsight)[];
  loading: boolean;
  onRefresh: () => void;
  className?: string;
  onSpeakInsight?: (text: string) => void;
  onAISummarize?: (insight: FinancialInsight | RealFinancialInsight) => Promise<void>;
  aiSummarizeLoading?: boolean;
  isAIEnabled?: boolean;
}

export function InsightsPanel({ 
  insights, 
  loading, 
  onRefresh, 
  className = "",
  onSpeakInsight,
  onAISummarize,
  aiSummarizeLoading = false,
  isAIEnabled = false
}: Readonly<InsightsPanelProps>) {
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
      case 'budget_warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'trend':
      case 'spending_pattern':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'decline':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'investment_tip':
        return <Target className="h-5 w-5 text-purple-500" />;
      case 'saving_suggestion':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
      case 'budget_warning':
        return 'destructive';
      case 'success':
        return 'default';
      case 'trend':
      case 'spending_pattern':
        return 'secondary';
      case 'decline':
        return 'destructive';
      case 'investment_tip':
        return 'secondary';
      case 'saving_suggestion':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getInsightGradient = (type: string) => {
    switch (type) {
      case 'warning':
      case 'budget_warning':
        return 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20';
      case 'success':
        return 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20';
      case 'trend':
      case 'spending_pattern':
        return 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20';
      case 'decline':
        return 'from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20';
      case 'investment_tip':
        return 'from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20';
      case 'saving_suggestion':
        return 'from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20';
      default:
        return 'from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20';
    }
  };

  const getAmountColor = (type: string) => {
    if (type === 'success' || type === 'saving_suggestion') {
      return 'text-green-600';
    }
    if (type === 'warning' || type === 'budget_warning' || type === 'decline') {
      return 'text-red-600';
    }
    return 'text-blue-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const speakInsight = (insight: FinancialInsight | RealFinancialInsight) => {
    if (onSpeakInsight) {
      const amountText = insight.amount ? ` The amount is ${formatCurrency(insight.amount)}.` : '';
      const text = `${insight.title}. ${insight.description}${amountText}`;
      onSpeakInsight(text);
    }
  };

  const handleAISummarize = async (insight: FinancialInsight | RealFinancialInsight) => {
    if (onAISummarize) {
      await onAISummarize(insight);
    }
  };

  const isRealInsight = (insight: FinancialInsight | RealFinancialInsight): insight is RealFinancialInsight => {
    return 'rawData' in insight;
  };

  const insightStats = {
    total: insights.length,
    warnings: insights.filter(i => i.type === 'warning').length,
    successes: insights.filter(i => i.type === 'success').length,
    trends: insights.filter(i => i.type === 'trend').length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Financial Insights
            </h2>
            <p className="text-sm text-muted-foreground">
              Real-time analysis of your financial data {isAIEnabled && "with optional AI enhancement"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'cards' ? 'compact' : 'cards')}
            >
              <Eye className="h-4 w-4 mr-1" />
              {viewMode === 'cards' ? 'Compact' : 'Cards'}
            </Button>
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
        </div>

        {/* Quick Stats */}
        {insights.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{insightStats.total}</div>
              <div className="text-xs text-blue-600/80">Total Insights</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600">{insightStats.warnings}</div>
              <div className="text-xs text-orange-600/80">Warnings</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{insightStats.successes}</div>
              <div className="text-xs text-green-600/80">Achievements</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">{insightStats.trends}</div>
              <div className="text-xs text-purple-600/80">Trends</div>
            </div>
          </div>
        )}
      </div>

      {insights.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gradient-to-br from-primary/10 to-purple/10 p-6 mb-6">
              <TrendingUp className="h-12 w-12 text-primary/60" />
            </div>
            <h3 className="text-xl font-semibold mb-3">No insights available</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Add some transactions and budgets to get personalized financial insights, 
              spending analysis, and budget optimization tips.
            </p>
            <Button onClick={onRefresh} disabled={loading} size="lg" className="shadow-lg">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Data...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Financial Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'cards' ? 'grid gap-6' : 'space-y-3'}>
          {insights.map((insight, index) => (
            <Card 
              key={`${insight.type}-${index}`} 
              className={`transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
                selectedInsight === index ? 'ring-2 ring-primary/50 shadow-lg' : ''
              } ${viewMode === 'compact' ? 'p-2' : ''}`}
              onClick={() => setSelectedInsight(selectedInsight === index ? null : index)}
            >
              <div className={`bg-gradient-to-r ${getInsightGradient(insight.type)} ${
                viewMode === 'cards' ? 'rounded-t-lg' : 'rounded-lg'
              } ${viewMode === 'compact' ? 'p-3' : 'p-4'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className={`leading-tight ${viewMode === 'compact' ? 'text-sm' : 'text-base'}`}>
                        {insight.title}
                      </CardTitle>
                      {viewMode === 'compact' && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {insight.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getInsightBadgeVariant(insight.type)} className="shrink-0 text-xs">
                      {insight.type}
                    </Badge>
                    {isRealInsight(insight) && !insight.isAISummarized && (
                      <Badge variant="outline" className="shrink-0 text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Real Data
                      </Badge>
                    )}
                    {isRealInsight(insight) && insight.isAISummarized && (
                      <Badge variant="outline" className="shrink-0 text-xs bg-purple-50 text-purple-700 border-purple-200">
                        AI Enhanced
                      </Badge>
                    )}
                    {onSpeakInsight && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakInsight(insight);
                        }}
                        className="h-6 w-6 p-0 hover:bg-white/50"
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {viewMode === 'cards' && (
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {insight.description}
                  </p>
                  
                  {/* Amount Display */}
                  {insight.amount && (
                    <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Amount:</span>
                        <span className={`text-lg font-bold ${getAmountColor(insight.type)}`}>
                          {formatCurrency(insight.amount)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge and AI Summarize Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {insight.category && (
                        <Badge variant="outline" className="text-xs">
                          📊 {insight.category}
                        </Badge>
                      )}
                      {isRealInsight(insight) && insight.rawData && (
                        <Badge variant="outline" className="text-xs bg-gray-50">
                          {insight.rawData.percentage && `${insight.rawData.percentage > 0 ? '+' : ''}${insight.rawData.percentage.toFixed(1)}%`}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAIEnabled && onAISummarize && isRealInsight(insight) && !insight.isAISummarized && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAISummarize(insight);
                          }}
                          disabled={aiSummarizeLoading}
                          className="h-7 px-2 text-xs"
                        >
                          {aiSummarizeLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              AI...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              Summarize with AI
                            </>
                          )}
                        </Button>
                      )}
                      {selectedInsight === index && (
                        <div className="text-xs text-muted-foreground">
                          Click to collapse
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
              
              {/* Compact mode amount display */}
              {viewMode === 'compact' && insight.amount && (
                <div className="px-3 pb-2">
                  <div className={`text-right text-sm font-semibold ${getAmountColor(insight.type)}`}>
                    {formatCurrency(insight.amount)}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Loading indicator for refresh */}
      {loading && insights.length > 0 && (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Refreshing insights...</span>
          </div>
        </div>
      )}
    </div>
  );
}