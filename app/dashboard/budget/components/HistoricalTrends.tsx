"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  RefreshCw,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { HistoricalAnalyticsService, HistoricalDataPoint, HistoricalInsight } from '@/lib/historical-analytics-service';
import { supabase } from '@/lib/supabase';

interface HistoricalTrendsProps {
  userId?: string;
}

export function HistoricalTrends({ userId }: HistoricalTrendsProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [insights, setInsights] = useState<HistoricalInsight[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<6 | 12 | 24>(12);
  const [activeTab, setActiveTab] = useState<'trends' | 'insights' | 'forecast'>('trends');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedPeriod]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const [historicalResult, insightsResult, forecastResult] = await Promise.all([
        HistoricalAnalyticsService.getHistoricalData(userData.user.id, selectedPeriod),
        HistoricalAnalyticsService.generateHistoricalInsights(userData.user.id),
        HistoricalAnalyticsService.getSpendingForecast(userData.user.id, 3)
      ]);

      setHistoricalData(historicalResult);
      setInsights(insightsResult);
      setForecast(forecastResult);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchHistoricalData();
    setIsRefreshing(false);
  };

  const trendAnalysis = useMemo(() => {
    if (historicalData.length < 2) return null;

    const recentMonths = historicalData.slice(-3);
    const previousMonths = historicalData.slice(-6, -3);

    const recentAvg = recentMonths.reduce((sum, d) => sum + d.totalSpent, 0) / recentMonths.length;
    const previousAvg = previousMonths.reduce((sum, d) => sum + d.totalSpent, 0) / previousMonths.length;

    const percentageChange = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    return {
      direction: percentageChange > 5 ? 'increasing' : percentageChange < -5 ? 'decreasing' : 'stable',
      percentage: Math.abs(percentageChange),
      recentAvg,
      previousAvg
    };
  }, [historicalData]);

  const getInsightIcon = (type: HistoricalInsight['type']) => {
    switch (type) {
      case 'spending_pattern': return TrendingUp;
      case 'budget_efficiency': return Target;
      case 'category_trend': return BarChart3;
      case 'seasonal_pattern': return Calendar;
      default: return Info;
    }
  };

  const getInsightColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    if (confidence >= 60) return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    if (confidence >= 40) return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
    return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card shadow-lg overflow-hidden mb-8">
        <div className="p-12 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading historical trends...</p>
        </div>
      </div>
    );
  }

  if (historicalData.length === 0) {
    return (
      <div className="rounded-2xl border bg-card shadow-lg overflow-hidden mb-8">
        <div className="border-b p-6 bg-gradient-to-r from-card to-card/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Historical Trends
              </h2>
              <p className="text-muted-foreground mt-1">
                Track your spending patterns over time
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <LineChart className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="p-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-full bg-muted h-20 w-20 flex items-center justify-center mx-auto mb-6"
          >
            <Clock className="h-10 w-10 text-muted-foreground" />
          </motion.div>
          <h3 className="text-xl font-bold mb-3">No Historical Data</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start tracking your expenses to see spending trends and patterns over time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card shadow-lg overflow-hidden mb-8">
      <div className="border-b p-6 bg-gradient-to-r from-card to-card/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Historical Trends
            </h2>
            <p className="text-muted-foreground mt-1">
              Analyze your spending patterns over the past {selectedPeriod} months
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <LineChart className="h-6 w-6 text-primary" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 px-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[6, 12, 24].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period as 6 | 12 | 24)}
                className="h-8"
              >
                {period} months
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {[
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'insights', label: 'Insights', icon: Zap },
              { id: 'forecast', label: 'Forecast', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as any)}
                  className="h-8"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            {/* Trend Summary */}
            {trendAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    {trendAnalysis.direction === 'increasing' ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : trendAnalysis.direction === 'decreasing' ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="text-sm font-medium">Recent Trend</span>
                  </div>
                  <div className={`text-2xl font-bold ${
                    trendAnalysis.direction === 'increasing' ? 'text-red-500' :
                    trendAnalysis.direction === 'decreasing' ? 'text-green-500' : 'text-blue-500'
                  }`}>
                    {trendAnalysis.direction === 'stable' ? 'Stable' : 
                     `${trendAnalysis.percentage.toFixed(1)}%`}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {trendAnalysis.direction} spending
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Recent Average</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(trendAnalysis.recentAvg)}
                  </div>
                  <div className="text-xs text-muted-foreground">Last 3 months</div>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Previous Average</div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {formatCurrency(trendAnalysis.previousAvg)}
                  </div>
                  <div className="text-xs text-muted-foreground">3-6 months ago</div>
                </div>
              </div>
            )}

            {/* Monthly Data Chart */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Monthly Spending Overview
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {historicalData.slice(-12).map((month, index) => (
                  <motion.div
                    key={month.period}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">
                        {month.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            month.utilization > 100 ? 'bg-red-500' : 
                            month.utilization > 80 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, month.utilization)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Budget: {formatCurrency(month.totalBudget)}</span>
                      <span>Spent: {formatCurrency(month.totalSpent)}</span>
                      <span className={`font-medium ${
                        month.utilization > 100 ? 'text-red-600' :
                        month.utilization > 80 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {month.utilization.toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              AI-Powered Insights
              <Badge variant="secondary" className="ml-2">
                {insights.length}
              </Badge>
            </h3>
            
            {insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight, index) => {
                  const Icon = getInsightIcon(insight.type);
                  
                  return (
                    <motion.div
                      key={insight.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`rounded-lg border p-4 ${getInsightColor(insight.confidence)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence.toFixed(0)}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm mb-3 opacity-90">{insight.description}</p>
                          <div className="text-xs font-medium p-2 bg-white/50 dark:bg-black/20 rounded">
                            💡 {insight.recommendation}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No insights available yet</p>
                <p className="text-sm text-muted-foreground mt-1">More data needed for AI analysis</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'forecast' && (
          <motion.div
            key="forecast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Spending Forecast
            </h3>
            
            {forecast && forecast.forecast.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  {forecast.methodology}
                </div>
                
                <div className="space-y-3">
                  {forecast.forecast.map((month: any, index: number) => (
                    <motion.div
                      key={month.month}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-background/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {month.confidence.toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(month.predictedSpending)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Range: {formatCurrency(month.range.min)} - {formatCurrency(month.range.max)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Forecast unavailable</p>
                <p className="text-sm text-muted-foreground mt-1">Need more historical data</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}