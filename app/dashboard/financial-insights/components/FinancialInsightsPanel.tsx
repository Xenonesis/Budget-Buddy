"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info, Eye, Target, DollarSign, Loader2, Calendar, PieChart } from "lucide-react";
import { RealFinancialInsight, Transaction, Budget } from "@/lib/real-financial-insights";

interface FinancialInsightsPanelProps {
  insights: RealFinancialInsight[];
  loading: boolean;
  onRefresh: () => void;
  transactions: Transaction[];
  budgets: Budget[];
  className?: string;
}

export function FinancialInsightsPanel({ 
  insights, 
  loading, 
  onRefresh, 
  transactions,
  budgets,
  className = ""
}: Readonly<FinancialInsightsPanelProps>) {
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
      case 'budget_alert':
        return <Target className="h-5 w-5 text-purple-500" />;
      case 'category_analysis':
        return <PieChart className="h-5 w-5 text-indigo-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
      case 'budget_warning':
        return 'border-orange-200 bg-orange-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'trend':
      case 'spending_pattern':
        return 'border-blue-200 bg-blue-50';
      case 'decline':
        return 'border-red-200 bg-red-50';
      case 'budget_alert':
        return 'border-purple-200 bg-purple-50';
      case 'category_analysis':
        return 'border-indigo-200 bg-indigo-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (insight: RealFinancialInsight) => {
    // Determine priority based on insight type and amount
    let priority = 'low';
    if (insight.type === 'budget_warning' || insight.type === 'warning') {
      priority = 'high';
    } else if (insight.type === 'spending_pattern' || insight.type === 'trend') {
      priority = 'medium';
    }
    
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`${colors[priority as keyof typeof colors] || colors.medium} text-xs`}
      >
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Financial Insights...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Insights
          </CardTitle>
          <Button
            onClick={onRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
            <p className="text-gray-500 mb-4">
              We need more transaction and budget data to generate meaningful insights.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Add more transactions to see spending patterns</p>
              <p>• Set up budgets to get budget alerts</p>
              <p>• Check back after a few days of activity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Financial Insights
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered analysis of your financial data
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="h-8 px-3"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('compact')}
                className="h-8 px-3"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Insights Display */}
      {viewMode === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {insights.map((insight, index) => (
            <Card 
              key={index} 
              className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                selectedInsight === index ? 'ring-2 ring-primary' : ''
              } ${getInsightColor(insight.type)}`}
              onClick={() => setSelectedInsight(selectedInsight === index ? null : index)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {insight.title}
                      </h3>
                      {getPriorityBadge(insight)}
                    </div>
                    
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {insight.description}
                    </p>
                    
                    {insight.rawData && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {insight.rawData.amount && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatAmount(insight.rawData.amount)}
                          </span>
                        )}
                        {insight.rawData.percentage && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {insight.rawData.percentage}%
                          </span>
                        )}
                        {insight.rawData.trend && (
                          <Badge variant="outline" className="text-xs">
                            {insight.rawData.trend}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {(insight.type === 'saving_suggestion' || insight.type === 'investment_tip') && (
                      <div className="mt-3 p-3 bg-white/50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-900 mb-1">Recommended Action:</p>
                        <p className="text-sm text-gray-700">Consider implementing this suggestion to improve your financial health.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {insights.map((insight, index) => (
                <div 
                  key={index}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedInsight(selectedInsight === index ? null : index)}
                >
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 truncate">
                          {insight.title}
                        </h4>
                        {getPriorityBadge(insight)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  
                  {selectedInsight === index && (insight.type === 'saving_suggestion' || insight.type === 'investment_tip') && (
                    <div className="mt-3 ml-8 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Recommended Action:</p>
                      <p className="text-sm text-gray-700">Consider implementing this suggestion to improve your financial health.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Insights Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {insights.filter(i => i.type === 'budget_warning' || i.type === 'warning').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {insights.filter(i => i.type === 'spending_pattern' || i.type === 'trend').length}
              </div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {insights.filter(i => i.type === 'success' || i.type === 'saving_suggestion').length}
              </div>
              <div className="text-sm text-gray-600">Low Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {insights.filter(i => i.type === 'saving_suggestion' || i.type === 'investment_tip').length}
              </div>
              <div className="text-sm text-gray-600">Actionable</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}