import { supabase } from './supabase';
import { YearOverYearService, YearlyComparisonData } from './year-over-year-service';

export interface PredictiveInsight {
  type: 'trend' | 'forecast' | 'alert' | 'recommendation';
  category: string;
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  value?: number;
  change?: number;
}

export interface SpendingForecast {
  month: string;
  year: number;
  predictedSpending: number;
  predictedIncome: number;
  confidence: number;
  factors: string[];
}

export interface BudgetPrediction {
  category: string;
  currentSpending: number;
  predictedSpending: number;
  budgetLimit: number;
  overBudgetRisk: number; // 0-100
  recommendedBudget: number;
}

export interface FinancialGoalProgress {
  goalType: 'savings' | 'debt_reduction' | 'spending_limit';
  targetAmount: number;
  currentAmount: number;
  predictedCompletion: Date;
  onTrack: boolean;
  adjustmentNeeded: number;
}

export class PredictiveAnalyticsService {
  /**
   * Generate comprehensive financial forecasts and insights
   */
  static async generatePredictiveInsights(userId: string): Promise<PredictiveInsight[]> {
    try {
      const insights: PredictiveInsight[] = [];
      
      // Get historical data for analysis
      const yearlyData = await YearOverYearService.fetchYearOverYearData(userId);
      if (yearlyData.length === 0) return insights;

      // Get current year data
      const currentYear = yearlyData[0];
      const previousYear = yearlyData[1];

      // 1. Spending Trend Analysis
      const spendingTrends = await this.analyzeSpendingTrends(currentYear, previousYear);
      insights.push(...spendingTrends);

      // 2. Seasonal Pattern Analysis
      const seasonalInsights = await this.analyzeSeasonalPatterns(yearlyData);
      insights.push(...seasonalInsights);

      // 3. Category-specific predictions
      const categoryPredictions = await this.analyzeCategoryTrends(currentYear, previousYear);
      insights.push(...categoryPredictions);

      // 4. Budget optimization recommendations
      const budgetOptimizations = await this.generateBudgetOptimizations(userId, currentYear);
      insights.push(...budgetOptimizations);

      // 5. Financial health alerts
      const healthAlerts = await this.generateFinancialHealthAlerts(currentYear, previousYear);
      insights.push(...healthAlerts);

      return insights.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      return [];
    }
  }

  /**
   * Generate spending forecasts for the next 6 months
   */
  static async generateSpendingForecast(userId: string): Promise<SpendingForecast[]> {
    try {
      const yearlyData = await YearOverYearService.fetchYearOverYearData(userId);
      if (yearlyData.length === 0) return [];

      const currentYear = yearlyData[0];
      const forecasts: SpendingForecast[] = [];
      
      // Calculate monthly averages and trends
      const monthlyAverages = this.calculateMonthlyAverages(yearlyData);
      const trendFactors = this.calculateTrendFactors(currentYear);

      // Generate forecasts for next 6 months
      const currentDate = new Date();
      for (let i = 1; i <= 6; i++) {
        const forecastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        const monthIndex = forecastDate.getMonth();
        const monthName = forecastDate.toLocaleString('default', { month: 'short' });

        const baseSpending = monthlyAverages.spending[monthIndex] || currentYear.averageMonthlySpending;
        const baseIncome = monthlyAverages.income[monthIndex] || (currentYear.totalIncome / 12);

        // Apply trend factors and seasonal adjustments
        const seasonalFactor = this.getSeasonalFactor(monthIndex);
        const trendFactor = trendFactors.spending;

        const predictedSpending = baseSpending * seasonalFactor * trendFactor;
        const predictedIncome = baseIncome * seasonalFactor * (trendFactors.income || 1);

        forecasts.push({
          month: monthName,
          year: forecastDate.getFullYear(),
          predictedSpending,
          predictedIncome,
          confidence: this.calculateForecastConfidence(i, yearlyData.length),
          factors: this.identifyForecastFactors(monthIndex, trendFactor, seasonalFactor)
        });
      }

      return forecasts;
    } catch (error) {
      console.error('Error generating spending forecast:', error);
      return [];
    }
  }

  /**
   * Generate budget predictions and recommendations
   */
  static async generateBudgetPredictions(userId: string): Promise<BudgetPrediction[]> {
    try {
      // Fetch current budgets
      const { data: budgets } = await supabase
        .from('budgets')
        .select(`
          *,
          categories!inner(name)
        `)
        .eq('user_id', userId)
        .eq('period', 'monthly');

      if (!budgets || budgets.length === 0) return [];

      const yearlyData = await YearOverYearService.fetchYearOverYearData(userId);
      if (yearlyData.length === 0) return [];

      const currentYear = yearlyData[0];
      const predictions: BudgetPrediction[] = [];

      for (const budget of budgets) {
        const categoryName = budget.categories?.name || 'Unknown';
        const categoryData = currentYear.categoryBreakdown[categoryName];
        const categorySpending = categoryData?.amount || 0;
        const monthlySpending = categorySpending / 12;

        // Calculate trend for this category
        const previousYearData = yearlyData[1]?.categoryBreakdown[categoryName];
        const previousYearSpending = previousYearData?.amount || 0;
        const trendFactor = previousYearSpending > 0 ? categorySpending / previousYearSpending : 1;

        // Predict next month's spending
        const predictedSpending = monthlySpending * trendFactor;
        const overBudgetRisk = Math.min(100, Math.max(0, (predictedSpending / budget.amount - 1) * 100));

        // Calculate recommended budget
        const recommendedBudget = Math.max(budget.amount, predictedSpending * 1.1);

        predictions.push({
          category: categoryName,
          currentSpending: monthlySpending,
          predictedSpending,
          budgetLimit: budget.amount,
          overBudgetRisk,
          recommendedBudget
        });
      }

      return predictions.sort((a, b) => b.overBudgetRisk - a.overBudgetRisk);
    } catch (error) {
      console.error('Error generating budget predictions:', error);
      return [];
    }
  }

  /**
   * Analyze spending trends and generate insights
   */
  private static async analyzeSpendingTrends(
    currentYear: YearlyComparisonData,
    previousYear?: YearlyComparisonData
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    if (!previousYear) return insights;

    const spendingGrowth = ((currentYear.totalSpending - previousYear.totalSpending) / previousYear.totalSpending) * 100;

    // Spending trend insight
    if (Math.abs(spendingGrowth) > 5) {
      const impactLevel = Math.abs(spendingGrowth) > 20 ? 'high' : Math.abs(spendingGrowth) > 10 ? 'medium' : 'low';
      
      insights.push({
        type: spendingGrowth > 0 ? 'alert' : 'trend',
        category: 'spending',
        title: `Spending ${spendingGrowth > 0 ? 'Increase' : 'Decrease'} Detected`,
        description: `Your spending has ${spendingGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(spendingGrowth).toFixed(1)}% compared to last year.`,
        confidence: 85,
        impact: Math.abs(spendingGrowth) > 20 ? 'high' : Math.abs(spendingGrowth) > 10 ? 'medium' : 'low',
        timeframe: 'Year-over-year',
        value: currentYear.totalSpending,
        change: spendingGrowth
      });
    }

    // Income vs spending balance
    const savingsRate = ((currentYear.totalIncome - currentYear.totalSpending) / currentYear.totalIncome) * 100;
    if (savingsRate < 10) {
      insights.push({
        type: 'alert',
        category: 'savings',
        title: 'Low Savings Rate Detected',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income.`,
        confidence: 90,
        impact: 'high',
        timeframe: 'Current',
        value: savingsRate
      });
    }

    return insights;
  }

  /**
   * Analyze seasonal spending patterns
   */
  private static async analyzeSeasonalPatterns(yearlyData: YearlyComparisonData[]): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    if (yearlyData.length === 0) return insights;

    // Analyze monthly patterns across years
    const monthlyPatterns = new Map<number, number[]>();
    
    yearlyData.forEach(year => {
      year.monthlyData.forEach(month => {
        const monthIndex = month.monthNumber - 1;
        if (!monthlyPatterns.has(monthIndex)) {
          monthlyPatterns.set(monthIndex, []);
        }
        monthlyPatterns.get(monthIndex)!.push(month.totalSpending);
      });
    });

    // Find months with consistently high spending
    const currentMonth = new Date().getMonth();
    const upcomingMonths = [currentMonth + 1, currentMonth + 2, currentMonth + 3].map(m => m % 12);

    upcomingMonths.forEach(monthIndex => {
      const monthSpending = monthlyPatterns.get(monthIndex) || [];
      if (monthSpending.length >= 2) {
        const avgSpending = monthSpending.reduce((sum, val) => sum + val, 0) / monthSpending.length;
        const yearAvg = yearlyData[0].averageMonthlySpending;
        
        if (avgSpending > yearAvg * 1.2) {
          const monthName = new Date(2024, monthIndex, 1).toLocaleString('default', { month: 'long' });
          insights.push({
            type: 'forecast',
            category: 'seasonal',
            title: `High Spending Period Approaching`,
            description: `${monthName} typically shows ${((avgSpending / yearAvg - 1) * 100).toFixed(0)}% higher spending than average. Plan accordingly.`,
            confidence: 75,
            impact: 'medium',
            timeframe: monthName,
            value: avgSpending
          });
        }
      }
    });

    return insights;
  }

  /**
   * Analyze category-specific trends
   */
  private static async analyzeCategoryTrends(
    currentYear: YearlyComparisonData,
    previousYear?: YearlyComparisonData
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    if (!previousYear) return insights;

    Object.entries(currentYear.categoryBreakdown).forEach(([category, currentData]) => {
      const previousData = previousYear.categoryBreakdown[category];
      const currentAmount = currentData?.amount || 0;
      const previousAmount = previousData?.amount || 0;
      
      if (previousAmount > 0) {
        const growth = ((currentAmount - previousAmount) / previousAmount) * 100;
        
        if (Math.abs(growth) > 25) {
          const impactLevel = Math.abs(growth) > 50 ? 'high' : 'medium';
          
          insights.push({
            type: growth > 0 ? 'alert' : 'trend',
            category,
            title: `${category} Spending ${growth > 0 ? 'Surge' : 'Drop'}`,
            description: `Your ${category.toLowerCase()} spending has ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth).toFixed(0)}% this year.`,
            confidence: 80,
            impact: impactLevel,
            timeframe: 'Year-over-year',
            value: currentAmount,
            change: growth
          });
        }
      }
    });

    return insights;
  }

  /**
   * Generate budget optimization recommendations
   */
  private static async generateBudgetOptimizations(
    userId: string,
    currentYear: YearlyComparisonData
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    // Find categories with highest spending that could be optimized
    const sortedCategories = Object.entries(currentYear.categoryBreakdown)
      .sort(([, a], [, b]) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 5);

    sortedCategories.forEach(([category, categoryData], index) => {
      const amount = categoryData.amount || 0;
      const monthlyAmount = amount / 12;
      const potentialSavings = monthlyAmount * 0.1; // 10% reduction potential

      if (potentialSavings > 50) { // Only suggest if savings > $50/month
        const impactLevel = potentialSavings > 200 ? 'high' : potentialSavings > 100 ? 'medium' : 'low';
        
        insights.push({
          type: 'recommendation',
          category,
          title: `Optimize ${category} Spending`,
          description: `Reducing ${category.toLowerCase()} spending by 10% could save you $${potentialSavings.toFixed(0)} per month.`,
          confidence: 70,
          impact: potentialSavings > 200 ? 'high' : potentialSavings > 100 ? 'medium' : 'low',
          timeframe: 'Monthly',
          value: potentialSavings
        });
      }
    });

    return insights;
  }

  /**
   * Generate financial health alerts
   */
  private static async generateFinancialHealthAlerts(
    currentYear: YearlyComparisonData,
    previousYear?: YearlyComparisonData
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    // Check for concerning patterns
    const monthlySpending = currentYear.totalSpending / 12;
    const monthlyIncome = currentYear.totalIncome / 12;
    const spendingRatio = monthlySpending / monthlyIncome;

    if (spendingRatio > 0.9) {
      insights.push({
        type: 'alert',
        category: 'financial_health',
        title: 'High Spending-to-Income Ratio',
        description: `You're spending ${(spendingRatio * 100).toFixed(0)}% of your income. Consider reducing expenses or increasing income.`,
        confidence: 95,
        impact: 'high',
        timeframe: 'Current',
        value: spendingRatio * 100
      });
    }

    // Check for irregular spending patterns
    if (currentYear.monthlyData.length >= 3) {
      const recentMonths = currentYear.monthlyData.slice(-3);
      const avgRecent = recentMonths.reduce((sum, month) => sum + month.totalSpending, 0) / 3;
      const yearAvg = currentYear.averageMonthlySpending;

      if (avgRecent > yearAvg * 1.3) {
        insights.push({
          type: 'alert',
          category: 'spending_pattern',
          title: 'Unusual Spending Spike',
          description: `Your spending in recent months is ${((avgRecent / yearAvg - 1) * 100).toFixed(0)}% above your yearly average.`,
          confidence: 85,
          impact: 'medium',
          timeframe: 'Recent months',
          value: avgRecent
        });
      }
    }

    return insights;
  }

  /**
   * Calculate monthly spending/income averages across years
   */
  private static calculateMonthlyAverages(yearlyData: YearlyComparisonData[]): {
    spending: number[];
    income: number[];
  } {
    const monthlySpending = new Array(12).fill(0);
    const monthlyIncome = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);

    yearlyData.forEach(year => {
      year.monthlyData.forEach(month => {
        const index = month.monthNumber - 1;
        monthlySpending[index] += month.totalSpending;
        monthlyIncome[index] += month.totalIncome;
        monthlyCounts[index]++;
      });
    });

    return {
      spending: monthlySpending.map((total, index) => 
        monthlyCounts[index] > 0 ? total / monthlyCounts[index] : 0
      ),
      income: monthlyIncome.map((total, index) => 
        monthlyCounts[index] > 0 ? total / monthlyCounts[index] : 0
      )
    };
  }

  /**
   * Calculate trend factors for spending and income
   */
  private static calculateTrendFactors(currentYear: YearlyComparisonData): {
    spending: number;
    income: number;
  } {
    if (currentYear.monthlyData.length < 3) {
      return { spending: 1, income: 1 };
    }

    // Calculate trend using linear regression on recent months
    const recentMonths = currentYear.monthlyData.slice(-6); // Last 6 months
    
    const spendingTrend = this.calculateLinearTrend(
      recentMonths.map(m => m.totalSpending)
    );
    
    const incomeTrend = this.calculateLinearTrend(
      recentMonths.map(m => m.totalIncome)
    );

    return {
      spending: Math.max(0.5, Math.min(2, 1 + spendingTrend)),
      income: Math.max(0.5, Math.min(2, 1 + incomeTrend))
    };
  }

  /**
   * Calculate linear trend from data points
   */
  private static calculateLinearTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;

    return avgY > 0 ? slope / avgY : 0; // Normalize by average
  }

  /**
   * Get seasonal adjustment factor for a given month
   */
  private static getSeasonalFactor(monthIndex: number): number {
    // Seasonal factors based on typical spending patterns
    const seasonalFactors = [
      1.1,  // January (post-holiday recovery)
      0.9,  // February
      1.0,  // March
      1.0,  // April
      1.1,  // May (spring spending)
      1.0,  // June
      1.1,  // July (summer vacation)
      1.1,  // August (back-to-school)
      1.0,  // September
      1.0,  // October
      1.2,  // November (holiday shopping)
      1.3   // December (holiday season)
    ];

    return seasonalFactors[monthIndex] || 1.0;
  }

  /**
   * Calculate forecast confidence based on data availability
   */
  private static calculateForecastConfidence(monthsAhead: number, yearsOfData: number): number {
    const baseConfidence = Math.max(50, 90 - (monthsAhead - 1) * 10);
    const dataBonus = Math.min(20, yearsOfData * 10);
    return Math.min(95, baseConfidence + dataBonus);
  }

  /**
   * Identify factors affecting the forecast
   */
  private static identifyForecastFactors(
    monthIndex: number,
    trendFactor: number,
    seasonalFactor: number
  ): string[] {
    const factors: string[] = [];

    if (Math.abs(trendFactor - 1) > 0.1) {
      factors.push(trendFactor > 1 ? 'Increasing trend' : 'Decreasing trend');
    }

    if (Math.abs(seasonalFactor - 1) > 0.1) {
      factors.push(seasonalFactor > 1 ? 'Seasonal increase' : 'Seasonal decrease');
    }

    // Month-specific factors
    const monthSpecificFactors: { [key: number]: string[] } = {
      0: ['New Year expenses', 'Post-holiday recovery'],
      4: ['Spring activities', 'Mother\'s Day'],
      6: ['Summer vacation', 'Outdoor activities'],
      7: ['Back-to-school shopping'],
      10: ['Holiday shopping begins', 'Thanksgiving'],
      11: ['Holiday season', 'Year-end expenses']
    };

    if (monthSpecificFactors[monthIndex]) {
      factors.push(...monthSpecificFactors[monthIndex]);
    }

    return factors.length > 0 ? factors : ['Historical patterns'];
  }
}