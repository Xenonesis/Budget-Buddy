import { supabase } from './supabase';

export interface HistoricalDataPoint {
  period: string;
  date: Date;
  totalBudget: number;
  totalSpent: number;
  utilization: number;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    budgeted: number;
    spent: number;
    percentage: number;
  }>;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  description: string;
}

export interface HistoricalInsight {
  type: 'spending_pattern' | 'budget_efficiency' | 'category_trend' | 'seasonal_pattern';
  title: string;
  description: string;
  trend: TrendAnalysis;
  recommendation: string;
  confidence: number; // 0-100
}

export class HistoricalAnalyticsService {
  /**
   * Get historical budget and spending data for the past N months
   */
  static async getHistoricalData(userId: string, months: number = 12): Promise<HistoricalDataPoint[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      // Get historical budgets
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          *,
          categories!inner(id, name, type)
        `)
        .eq('user_id', userId)
        .eq('categories.is_active', true);

      if (budgetError) throw budgetError;

      // Get historical transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (transactionError) throw transactionError;

      // Group data by month
      const monthlyData: { [key: string]: HistoricalDataPoint } = {};

      // Initialize months
      for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        monthlyData[monthKey] = {
          period: monthKey,
          date: new Date(date.getFullYear(), date.getMonth(), 1),
          totalBudget: 0,
          totalSpent: 0,
          utilization: 0,
          categoryBreakdown: []
        };
      }

      // Calculate budgets for each month
      budgets?.forEach(budget => {
        const monthlyAmount = this.convertToMonthlyAmount(budget.amount, budget.period);
        
        Object.keys(monthlyData).forEach(monthKey => {
          monthlyData[monthKey].totalBudget += monthlyAmount;
          
          // Find or create category breakdown
          let categoryBreakdown = monthlyData[monthKey].categoryBreakdown.find(
            cb => cb.categoryId === budget.category_id
          );
          
          if (!categoryBreakdown) {
            categoryBreakdown = {
              categoryId: budget.category_id,
              categoryName: budget.categories?.name || 'Unknown',
              budgeted: 0,
              spent: 0,
              percentage: 0
            };
            monthlyData[monthKey].categoryBreakdown.push(categoryBreakdown);
          }
          
          categoryBreakdown.budgeted += monthlyAmount;
        });
      });

      // Calculate spending for each month
      transactions?.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyData[monthKey]) {
          const amount = Number(transaction.amount);
          monthlyData[monthKey].totalSpent += amount;
          
          // Find category breakdown
          let categoryBreakdown = monthlyData[monthKey].categoryBreakdown.find(
            cb => cb.categoryId === transaction.category_id
          );
          
          if (categoryBreakdown) {
            categoryBreakdown.spent += amount;
          }
        }
      });

      // Calculate utilization and percentages
      Object.values(monthlyData).forEach(monthData => {
        monthData.utilization = monthData.totalBudget > 0 
          ? (monthData.totalSpent / monthData.totalBudget) * 100 
          : 0;
        
        monthData.categoryBreakdown.forEach(category => {
          category.percentage = category.budgeted > 0 
            ? (category.spent / category.budgeted) * 100 
            : 0;
        });
      });

      return Object.values(monthlyData).sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  /**
   * Analyze spending trends and generate insights
   */
  static async generateHistoricalInsights(userId: string): Promise<HistoricalInsight[]> {
    try {
      const historicalData = await this.getHistoricalData(userId, 6);
      const insights: HistoricalInsight[] = [];

      if (historicalData.length < 3) {
        return [{
          type: 'spending_pattern',
          title: 'Insufficient Data',
          description: 'Need at least 3 months of data to generate meaningful insights',
          trend: { direction: 'stable', percentage: 0, description: 'No trend available' },
          recommendation: 'Continue tracking your expenses for better insights',
          confidence: 0
        }];
      }

      // Analyze overall spending trend
      const spendingTrend = this.calculateTrend(
        historicalData.map(d => d.totalSpent)
      );
      
      insights.push({
        type: 'spending_pattern',
        title: 'Overall Spending Trend',
        description: `Your spending has been ${spendingTrend.direction} by ${spendingTrend.percentage.toFixed(1)}% over the past ${historicalData.length} months`,
        trend: spendingTrend,
        recommendation: spendingTrend.direction === 'increasing' 
          ? 'Consider reviewing your budget allocations and identifying areas to reduce spending'
          : 'Great job maintaining or reducing your spending levels',
        confidence: this.calculateConfidence(historicalData.length, spendingTrend.percentage)
      });

      // Analyze budget efficiency trend
      const efficiencyTrend = this.calculateTrend(
        historicalData.map(d => d.utilization)
      );
      
      insights.push({
        type: 'budget_efficiency',
        title: 'Budget Utilization Trend',
        description: `Your budget utilization has been ${efficiencyTrend.direction} by ${efficiencyTrend.percentage.toFixed(1)}%`,
        trend: efficiencyTrend,
        recommendation: efficiencyTrend.direction === 'increasing' && historicalData[historicalData.length - 1].utilization > 90
          ? 'Your budget utilization is high and increasing. Consider adjusting your budgets or reducing spending'
          : 'Your budget utilization trend looks healthy',
        confidence: this.calculateConfidence(historicalData.length, efficiencyTrend.percentage)
      });

      // Analyze category trends
      const categoryInsights = this.analyzeCategoryTrends(historicalData);
      insights.push(...categoryInsights);

      // Analyze seasonal patterns
      const seasonalInsights = this.analyzeSeasonalPatterns(historicalData);
      insights.push(...seasonalInsights);

      return insights.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error generating historical insights:', error);
      return [];
    }
  }

  /**
   * Get spending forecast based on historical data
   */
  static async getSpendingForecast(userId: string, monthsAhead: number = 3): Promise<{
    forecast: Array<{
      month: string;
      predictedSpending: number;
      confidence: number;
      range: { min: number; max: number };
    }>;
    methodology: string;
  }> {
    try {
      const historicalData = await this.getHistoricalData(userId, 12);
      
      if (historicalData.length < 3) {
        return {
          forecast: [],
          methodology: 'Insufficient historical data for forecasting'
        };
      }

      const forecast = [];
      const recentData = historicalData.slice(-6); // Use last 6 months
      const avgSpending = recentData.reduce((sum, d) => sum + d.totalSpent, 0) / recentData.length;
      const trend = this.calculateTrend(recentData.map(d => d.totalSpent));
      
      for (let i = 1; i <= monthsAhead; i++) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + i);
        
        // Simple linear trend projection
        const trendAdjustment = (trend.percentage / 100) * avgSpending * i;
        const predictedSpending = avgSpending + trendAdjustment;
        
        // Calculate confidence based on data consistency
        const variance = this.calculateVariance(recentData.map(d => d.totalSpent));
        const confidence = Math.max(20, 100 - (variance / avgSpending) * 100);
        
        // Calculate range based on variance
        const margin = Math.sqrt(variance) * 1.5;
        
        forecast.push({
          month: `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`,
          predictedSpending: Math.max(0, predictedSpending),
          confidence: Math.min(100, confidence),
          range: {
            min: Math.max(0, predictedSpending - margin),
            max: predictedSpending + margin
          }
        });
      }

      return {
        forecast,
        methodology: `Linear trend analysis based on ${recentData.length} months of historical data`
      };
    } catch (error) {
      console.error('Error generating spending forecast:', error);
      return { forecast: [], methodology: 'Error generating forecast' };
    }
  }

  // Helper methods
  private static convertToMonthlyAmount(amount: number, period: string): number {
    switch (period) {
      case 'weekly':
        return amount * 4.33; // Average weeks per month
      case 'yearly':
        return amount / 12;
      case 'monthly':
      default:
        return amount;
    }
  }

  private static calculateTrend(values: number[]): TrendAnalysis {
    if (values.length < 2) {
      return { direction: 'stable', percentage: 0, description: 'Insufficient data' };
    }

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const percentageChange = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    
    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(percentageChange) < 5) {
      direction = 'stable';
    } else if (percentageChange > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return {
      direction,
      percentage: Math.abs(percentageChange),
      description: `${direction} by ${Math.abs(percentageChange).toFixed(1)}%`
    };
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private static calculateConfidence(dataPoints: number, trendStrength: number): number {
    const dataConfidence = Math.min(100, (dataPoints / 12) * 100);
    const trendConfidence = Math.min(100, trendStrength * 2);
    return (dataConfidence + trendConfidence) / 2;
  }

  private static analyzeCategoryTrends(historicalData: HistoricalDataPoint[]): HistoricalInsight[] {
    const insights: HistoricalInsight[] = [];
    
    // Get all unique categories
    const categories = new Set<string>();
    historicalData.forEach(month => {
      month.categoryBreakdown.forEach(cat => categories.add(cat.categoryId));
    });

    categories.forEach(categoryId => {
      const categoryData = historicalData.map(month => {
        const catData = month.categoryBreakdown.find(c => c.categoryId === categoryId);
        return catData ? catData.spent : 0;
      });

      const trend = this.calculateTrend(categoryData);
      const categoryName = historicalData[0]?.categoryBreakdown.find(c => c.categoryId === categoryId)?.categoryName || 'Unknown';
      
      if (trend.percentage > 20) { // Only include significant trends
        insights.push({
          type: 'category_trend',
          title: `${categoryName} Spending Trend`,
          description: `Spending in ${categoryName} has been ${trend.direction} by ${trend.percentage.toFixed(1)}%`,
          trend,
          recommendation: trend.direction === 'increasing' 
            ? `Consider reviewing your ${categoryName} expenses and look for optimization opportunities`
            : `Great job managing your ${categoryName} spending`,
          confidence: this.calculateConfidence(historicalData.length, trend.percentage)
        });
      }
    });

    return insights.slice(0, 3); // Return top 3 category insights
  }

  private static analyzeSeasonalPatterns(historicalData: HistoricalDataPoint[]): HistoricalInsight[] {
    const insights: HistoricalInsight[] = [];
    
    if (historicalData.length < 6) return insights;

    // Group by season (simplified)
    const seasonalData: { [key: string]: number[] } = {
      'Winter': [], // Dec, Jan, Feb
      'Spring': [], // Mar, Apr, May
      'Summer': [], // Jun, Jul, Aug
      'Fall': []    // Sep, Oct, Nov
    };

    historicalData.forEach(month => {
      const monthNum = month.date.getMonth();
      let season: string;
      
      if (monthNum === 11 || monthNum <= 1) season = 'Winter';
      else if (monthNum >= 2 && monthNum <= 4) season = 'Spring';
      else if (monthNum >= 5 && monthNum <= 7) season = 'Summer';
      else season = 'Fall';
      
      seasonalData[season].push(month.totalSpent);
    });

    // Find the season with highest average spending
    let highestSeason = '';
    let highestAvg = 0;
    
    Object.entries(seasonalData).forEach(([season, values]) => {
      if (values.length > 0) {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        if (avg > highestAvg) {
          highestAvg = avg;
          highestSeason = season;
        }
      }
    });

    if (highestSeason) {
      insights.push({
        type: 'seasonal_pattern',
        title: 'Seasonal Spending Pattern',
        description: `Your highest spending typically occurs in ${highestSeason}`,
        trend: { direction: 'stable', percentage: 0, description: 'Seasonal pattern identified' },
        recommendation: `Plan ahead for ${highestSeason} by setting aside extra budget or reducing discretionary spending in other seasons`,
        confidence: this.calculateConfidence(historicalData.length, 50)
      });
    }

    return insights;
  }
}