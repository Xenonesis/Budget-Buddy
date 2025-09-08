import { supabase } from './supabase';
import { 
  YearlyAnalytics, 
  MonthlyAnalytics,
  YoYMetrics,
  CategoryBreakdown,
  CategoryData
} from './types/analytics';

// Legacy interfaces for backward compatibility
export interface YearlyComparisonData extends YearlyAnalytics {}
export interface MonthlyData extends MonthlyAnalytics {}
export interface YearOverYearMetrics extends YoYMetrics {}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export class YearOverYearService {
  /**
   * Fetch comprehensive year-over-year data using optimized SQL functions
   */
  static async fetchYearOverYearDataOptimized(userId: string, years: number[] = []): Promise<YearlyComparisonData[]> {
    try {
      // If no specific years provided, get data for current year and previous 2 years
      if (years.length === 0) {
        const currentYear = new Date().getFullYear();
        years = [currentYear, currentYear - 1, currentYear - 2];
      }

      // Use the optimized SQL function for data retrieval
      const { data: summaryData, error } = await supabase
        .rpc('get_yearly_financial_summary', {
          p_user_id: userId,
          p_years: years
        });

      if (error) {
        console.error('Error calling get_yearly_financial_summary:', error);
        // Fallback to the original method
        return this.fetchYearOverYearData(userId, years);
      }

      if (!summaryData || summaryData.length === 0) {
        return [];
      }

      // Process the SQL function results into our data structure
      const yearlyDataMap = new Map<number, YearlyComparisonData>();

      summaryData.forEach((row: any) => {
        const year = row.year;
        
        if (!yearlyDataMap.has(year)) {
          yearlyDataMap.set(year, {
            year,
            monthlyData: [],
            totalSpending: 0,
            totalIncome: 0,
            netIncome: 0,
            averageMonthlySpending: 0,
            averageMonthlyIncome: 0,
            transactionCount: 0,
            categoryBreakdown: {},
            quarterlyData: [],
            topCategories: [],
            spendingTrends: {
              monthlyGrowth: 0,
              quarterlyGrowth: 0,
              yearlyGrowth: 0,
              direction: 'stable',
              volatility: 'low',
              seasonality: []
            }
          });
        }

        const yearData = yearlyDataMap.get(year)!;
        
        // Update yearly totals
        yearData.totalSpending = Math.max(yearData.totalSpending, row.total_spending || 0);
        yearData.totalIncome = Math.max(yearData.totalIncome, row.total_income || 0);
        yearData.netIncome = Math.max(yearData.netIncome, row.net_income || 0);
        yearData.transactionCount = Math.max(yearData.transactionCount, row.transaction_count || 0);

        // Handle monthly data
        let monthData = yearData.monthlyData.find(m => m.monthNumber === row.month_number);
        
        if (!monthData) {
          monthData = {
            month: row.month_name,
            monthNumber: row.month_number,
            year,
            totalSpending: row.total_spending || 0,
            totalIncome: row.total_income || 0,
            netIncome: row.net_income || 0,
            transactionCount: row.transaction_count || 0,
            categoryBreakdown: {},
            averageDailySpending: 0
          };
          
          const daysInMonth = new Date(year, row.month_number, 0).getDate();
          monthData.averageDailySpending = monthData.totalSpending / daysInMonth;
          
          yearData.monthlyData.push(monthData);
        }

        // Handle category data
        if (row.category_name && row.category_amount > 0) {
          const categoryName = row.category_name;
          
          // Initialize category in monthly data if not exists
          if (!monthData.categoryBreakdown[categoryName]) {
            monthData.categoryBreakdown[categoryName] = {
              amount: 0,
              percentage: 0,
              transactionCount: 0,
              averageTransactionAmount: 0
            };
          }
          
          // Update monthly category data
          monthData.categoryBreakdown[categoryName].amount = row.category_amount;
          monthData.categoryBreakdown[categoryName].transactionCount = row.category_transaction_count || 0;
          monthData.categoryBreakdown[categoryName].averageTransactionAmount = 
            monthData.categoryBreakdown[categoryName].transactionCount > 0 ?
            monthData.categoryBreakdown[categoryName].amount / monthData.categoryBreakdown[categoryName].transactionCount : 0;

          // Initialize category in yearly data if not exists
          if (!yearData.categoryBreakdown[categoryName]) {
            yearData.categoryBreakdown[categoryName] = {
              amount: 0,
              percentage: 0,
              transactionCount: 0,
              averageTransactionAmount: 0
            };
          }
          
          // Accumulate yearly category totals
          yearData.categoryBreakdown[categoryName].amount += row.category_amount;
          yearData.categoryBreakdown[categoryName].transactionCount += row.category_transaction_count || 0;
        }
      });

      // Finalize data processing
      const yearlyData = Array.from(yearlyDataMap.values());
      
      yearlyData.forEach(yearData => {
        // Calculate averages
        yearData.averageMonthlySpending = yearData.totalSpending / 12;
        yearData.averageMonthlyIncome = yearData.totalIncome / 12;
        
        // Calculate category percentages and averages
        Object.values(yearData.categoryBreakdown).forEach(categoryData => {
          categoryData.percentage = yearData.totalSpending > 0 ? 
            (categoryData.amount / yearData.totalSpending) * 100 : 0;
          categoryData.averageTransactionAmount = categoryData.transactionCount > 0 ? 
            categoryData.amount / categoryData.transactionCount : 0;
        });

        // Generate top categories
        yearData.topCategories = Object.entries(yearData.categoryBreakdown)
          .map(([name, data]) => ({
            name,
            amount: data.amount,
            percentage: data.percentage,
            transactionCount: data.transactionCount,
            averageAmount: data.averageTransactionAmount
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10);

        // Sort monthly data
        yearData.monthlyData.sort((a, b) => a.monthNumber - b.monthNumber);
      });

      return yearlyData.sort((a, b) => b.year - a.year);
      
    } catch (error) {
      console.error('Error in fetchYearOverYearDataOptimized:', error);
      // Fallback to original method
      return this.fetchYearOverYearData(userId, years);
    }
  }
  /**
   * Main entry point - uses optimized SQL functions with fallback
   */
  static async fetchYearOverYearData(userId: string, years: number[] = []): Promise<YearlyComparisonData[]> {
    // Try optimized function first, fallback to original implementation
    try {
      return await this.fetchYearOverYearDataOptimized(userId, years);
    } catch (error) {
      console.warn('Optimized fetch failed, using fallback:', error);
      return await this.fetchYearOverYearDataLegacy(userId, years);
    }
  }

  /**
   * Legacy implementation for fallback
   */
  static async fetchYearOverYearDataLegacy(userId: string, years: number[] = []): Promise<YearlyComparisonData[]> {
    try {
      // If no specific years provided, get data for current year and previous 2 years
      if (years.length === 0) {
        const currentYear = new Date().getFullYear();
        years = [currentYear, currentYear - 1, currentYear - 2];
      }

      const yearlyData: YearlyComparisonData[] = [];

      for (const year of years) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        // Fetch transactions with category information using proper joins
        const { data: transactions, error } = await supabase
          .from('transactions')
          .select(`
            *,
            categories:category_id (
              name,
              type,
              icon
            )
          `)
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });

        if (error) {
          console.error(`Error fetching transactions for year ${year}:`, error);
          continue;
        }

        if (!transactions || transactions.length === 0) {
          // Add empty year data if no transactions
          yearlyData.push({
            year,
            monthlyData: [],
            totalSpending: 0,
            totalIncome: 0,
            netIncome: 0,
            averageMonthlySpending: 0,
            averageMonthlyIncome: 0,
            transactionCount: 0,
            categoryBreakdown: {},
            quarterlyData: [],
            topCategories: [],
            spendingTrends: {
              monthlyGrowth: 0,
              quarterlyGrowth: 0,
              yearlyGrowth: 0,
              direction: 'stable',
              volatility: 'low',
              seasonality: []
            }
          });
          continue;
        }

        // Process transactions by month with proper category handling
        const monthlyDataMap = new Map<number, MonthlyData>();
        const categoryTotals: { [category: string]: CategoryData } = {};
        let totalSpending = 0;
        let totalIncome = 0;

        // Initialize all 12 months
        for (let month = 0; month < 12; month++) {
          monthlyDataMap.set(month, {
            month: MONTH_NAMES[month],
            monthNumber: month + 1,
            year,
            totalSpending: 0,
            totalIncome: 0,
            netIncome: 0,
            transactionCount: 0,
            categoryBreakdown: {},
            averageDailySpending: 0
          });
        }

        // Process each transaction with category relationships
        transactions.forEach(transaction => {
          const transactionDate = new Date(transaction.date);
          const monthIndex = transactionDate.getMonth();
          const monthData = monthlyDataMap.get(monthIndex)!;

          // Get category name from the relationship or use fallback
          const categoryName = transaction.categories?.name || 'Uncategorized';

          // Update monthly totals
          if (transaction.type === 'expense') {
            monthData.totalSpending += transaction.amount;
            totalSpending += transaction.amount;
            
            // Update category breakdown with proper CategoryData structure
            if (!monthData.categoryBreakdown[categoryName]) {
              monthData.categoryBreakdown[categoryName] = {
                amount: 0,
                percentage: 0,
                transactionCount: 0,
                averageTransactionAmount: 0
              };
            }
            monthData.categoryBreakdown[categoryName].amount += transaction.amount;
            monthData.categoryBreakdown[categoryName].transactionCount++;
            
            // Update yearly category totals
            if (!categoryTotals[categoryName]) {
              categoryTotals[categoryName] = {
                amount: 0,
                percentage: 0,
                transactionCount: 0,
                averageTransactionAmount: 0
              };
            }
            categoryTotals[categoryName].amount += transaction.amount;
            categoryTotals[categoryName].transactionCount++;
            
          } else if (transaction.type === 'income') {
            monthData.totalIncome += transaction.amount;
            totalIncome += transaction.amount;
            
            // Track income categories separately with proper CategoryData structure
            if (!monthData.categoryBreakdown[categoryName]) {
              monthData.categoryBreakdown[categoryName] = {
                amount: 0,
                percentage: 0,
                transactionCount: 0,
                averageTransactionAmount: 0
              };
            }
            monthData.categoryBreakdown[categoryName].amount += transaction.amount;
            monthData.categoryBreakdown[categoryName].transactionCount++;
            
            if (!categoryTotals[categoryName]) {
              categoryTotals[categoryName] = {
                amount: 0,
                percentage: 0,
                transactionCount: 0,
                averageTransactionAmount: 0
              };
            }
            categoryTotals[categoryName].amount += transaction.amount;
            categoryTotals[categoryName].transactionCount++;
          }

          monthData.transactionCount++;
          
          // Update net income and average daily spending for the month
          monthData.netIncome = monthData.totalIncome - monthData.totalSpending;
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          monthData.averageDailySpending = monthData.totalSpending / daysInMonth;
        });

        // Convert map to array - keep all months for complete year view
        const monthlyData = Array.from(monthlyDataMap.values());

        // Calculate percentages for categories
        Object.values(categoryTotals).forEach(categoryData => {
          categoryData.percentage = totalSpending > 0 ? (categoryData.amount / totalSpending) * 100 : 0;
          categoryData.averageTransactionAmount = categoryData.transactionCount > 0 ? 
            categoryData.amount / categoryData.transactionCount : 0;
        });

        // Calculate top categories
        const topCategories = Object.entries(categoryTotals)
          .map(([name, data]) => ({
            name,
            amount: data.amount,
            percentage: data.percentage,
            transactionCount: data.transactionCount,
            averageAmount: data.averageTransactionAmount
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10);

        // Create quarterly data
        const quarterlyData = [];
        for (let quarter = 1; quarter <= 4; quarter++) {
          const quarterMonths = monthlyData.filter(month => {
            const monthQuarter = Math.ceil(month.monthNumber / 3);
            return monthQuarter === quarter;
          });

          if (quarterMonths.length > 0) {
            const quarterSpending = quarterMonths.reduce((sum, month) => sum + month.totalSpending, 0);
            const quarterIncome = quarterMonths.reduce((sum, month) => sum + month.totalIncome, 0);

            quarterlyData.push({
              quarter,
              year,
              period: `Q${quarter} ${year}`,
              totalSpending: quarterSpending,
              totalIncome: quarterIncome,
              netIncome: quarterIncome - quarterSpending,
              transactionCount: quarterMonths.reduce((sum, month) => sum + month.transactionCount, 0),
              categoryBreakdown: {}, // Will be calculated if needed
              monthsIncluded: quarterMonths.map(m => m.month)
            });
          }
        }

        yearlyData.push({
          year,
          monthlyData,
          totalSpending,
          totalIncome,
          netIncome: totalIncome - totalSpending,
          averageMonthlySpending: totalSpending / 12,
          averageMonthlyIncome: totalIncome / 12,
          transactionCount: transactions.length,
          categoryBreakdown: categoryTotals,
          quarterlyData,
          topCategories,
          spendingTrends: {
            monthlyGrowth: 0, // Will be calculated when comparing years
            quarterlyGrowth: 0,
            yearlyGrowth: 0,
            direction: 'stable',
            volatility: 'low',
            seasonality: []
          }
        });
      }

      return yearlyData.sort((a, b) => b.year - a.year); // Sort by year descending
    } catch (error) {
      console.error('Error in fetchYearOverYearData:', error);
      return [];
    }
  }

  /**
   * Calculate year-over-year growth metrics
   */
  static calculateYearOverYearMetrics(
    currentYearData: YearlyComparisonData,
    previousYearData: YearlyComparisonData
  ): YearOverYearMetrics {
    const spendingGrowth = this.calculateGrowthPercentage(
      currentYearData.totalSpending,
      previousYearData.totalSpending
    );

    const incomeGrowth = this.calculateGrowthPercentage(
      currentYearData.totalIncome,
      previousYearData.totalIncome
    );

    const transactionGrowth = this.calculateGrowthPercentage(
      currentYearData.transactionCount,
      previousYearData.transactionCount
    );

    // Calculate category-wise growth
    const categoryGrowth: { [category: string]: number } = {};
    const allCategories = new Set([
      ...Object.keys(currentYearData.categoryBreakdown),
      ...Object.keys(previousYearData.categoryBreakdown)
    ]);

    allCategories.forEach(category => {
      const currentAmount = currentYearData.categoryBreakdown[category]?.amount || 0;
      const previousAmount = previousYearData.categoryBreakdown[category]?.amount || 0;
      categoryGrowth[category] = this.calculateGrowthPercentage(currentAmount, previousAmount);
    });

    // Calculate monthly comparison
    const monthlyComparison = MONTH_NAMES.map((monthName, index) => {
      const currentMonthData = currentYearData.monthlyData.find(m => m.monthNumber === index + 1);
      const previousMonthData = previousYearData.monthlyData.find(m => m.monthNumber === index + 1);

      const currentAmount = currentMonthData?.totalSpending || 0;
      const previousAmount = previousMonthData?.totalSpending || 0;

      return {
        month: monthName,
        monthNumber: index + 1,
        currentYear: {
          spending: currentAmount,
          income: currentMonthData?.totalIncome || 0,
          netIncome: currentMonthData?.netIncome || 0,
          transactions: currentMonthData?.transactionCount || 0,
          topCategory: '' // Could be enhanced to find top category
        },
        previousYear: {
          spending: previousAmount,
          income: previousMonthData?.totalIncome || 0,
          netIncome: previousMonthData?.netIncome || 0,
          transactions: previousMonthData?.transactionCount || 0,
          topCategory: ''
        },
        growth: {
          spendingGrowth: this.calculateGrowthPercentage(currentAmount, previousAmount),
          incomeGrowth: this.calculateGrowthPercentage(
            currentMonthData?.totalIncome || 0,
            previousMonthData?.totalIncome || 0
          ),
          netIncomeGrowth: this.calculateGrowthPercentage(
            currentMonthData?.netIncome || 0,
            previousMonthData?.netIncome || 0
          ),
          transactionGrowth: this.calculateGrowthPercentage(
            currentMonthData?.transactionCount || 0,
            previousMonthData?.transactionCount || 0
          ),
          percentage: this.calculateGrowthPercentage(currentAmount, previousAmount)
        }
      };
    });

    const netIncomeGrowth = this.calculateGrowthPercentage(
      currentYearData.netIncome,
      previousYearData.netIncome
    );

    const averageTransactionSizeGrowth = this.calculateGrowthPercentage(
      currentYearData.transactionCount > 0 ? currentYearData.totalSpending / currentYearData.transactionCount : 0,
      previousYearData.transactionCount > 0 ? previousYearData.totalSpending / previousYearData.transactionCount : 0
    );

    const currentSavingsRate = currentYearData.totalIncome > 0 ? 
      ((currentYearData.totalIncome - currentYearData.totalSpending) / currentYearData.totalIncome) * 100 : 0;
    const previousSavingsRate = previousYearData.totalIncome > 0 ? 
      ((previousYearData.totalIncome - previousYearData.totalSpending) / previousYearData.totalIncome) * 100 : 0;
    const savingsRateChange = currentSavingsRate - previousSavingsRate;

    return {
      spendingGrowth,
      incomeGrowth,
      netIncomeGrowth,
      transactionGrowth,
      categoryGrowth,
      monthlyComparison,
      quarterlyComparison: [], // Will be implemented if needed
      averageTransactionSizeGrowth,
      savingsRateChange
    };
  }

  /**
   * Get quarterly aggregated data
   */
  static getQuarterlyData(yearlyData: YearlyComparisonData[]): any[] {
    const quarterlyData: any[] = [];

    yearlyData.forEach(yearData => {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterMonths = yearData.monthlyData.filter(month => {
          const monthQuarter = Math.ceil(month.monthNumber / 3);
          return monthQuarter === quarter;
        });

        if (quarterMonths.length > 0) {
          const quarterSpending = quarterMonths.reduce((sum, month) => sum + month.totalSpending, 0);
          const quarterIncome = quarterMonths.reduce((sum, month) => sum + month.totalIncome, 0);
          const quarterTransactions = quarterMonths.reduce((sum, month) => sum + month.transactionCount, 0);

            // Aggregate category breakdown for the quarter (simplified)
            const quarterCategoryBreakdown: { [category: string]: number } = {};
            quarterMonths.forEach(month => {
              Object.entries(month.categoryBreakdown).forEach(([category, categoryData]) => {
                quarterCategoryBreakdown[category] = (quarterCategoryBreakdown[category] || 0) + categoryData.amount;
              });
            });          quarterlyData.push({
            period: `Q${quarter} ${yearData.year}`,
            year: yearData.year,
            quarter,
            totalSpending: quarterSpending,
            totalIncome: quarterIncome,
            transactionCount: quarterTransactions,
            ...quarterCategoryBreakdown
          });
        }
      }
    });

    return quarterlyData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });
  }

  /**
   * Get annual aggregated data
   */
  static getAnnualData(yearlyData: YearlyComparisonData[]): any[] {
    return yearlyData.map(yearData => ({
      period: yearData.year.toString(),
      year: yearData.year,
      totalSpending: yearData.totalSpending,
      totalIncome: yearData.totalIncome,
      transactionCount: yearData.transactionCount,
      averageMonthlySpending: yearData.averageMonthlySpending,
      averageMonthlyIncome: yearData.averageMonthlyIncome,
      ...yearData.categoryBreakdown
    }));
  }

  /**
   * Get top spending categories across all years
   */
  static getTopCategories(yearlyData: YearlyComparisonData[], limit: number = 10): string[] {
    const categoryTotals: { [category: string]: number } = {};

    yearlyData.forEach(yearData => {
      Object.entries(yearData.categoryBreakdown).forEach(([category, categoryData]) => {
        categoryTotals[category] = (categoryTotals[category] || 0) + categoryData.amount;
      });
    });

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([category]) => category);
  }

  /**
   * Calculate growth percentage between two values
   */
  private static calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get spending trends and insights
   */
  static getSpendingInsights(yearlyData: YearlyComparisonData[]): {
    trends: string[];
    recommendations: string[];
    alerts: string[];
  } {
    const trends: string[] = [];
    const recommendations: string[] = [];
    const alerts: string[] = [];

    if (yearlyData.length >= 2) {
      const currentYear = yearlyData[0];
      const previousYear = yearlyData[1];
      const metrics = this.calculateYearOverYearMetrics(currentYear, previousYear);

      // Analyze spending trends
      if (metrics.spendingGrowth > 20) {
        alerts.push(`Spending increased by ${metrics.spendingGrowth.toFixed(1)}% compared to last year`);
        recommendations.push('Consider reviewing your budget and identifying areas to reduce expenses');
      } else if (metrics.spendingGrowth > 5) {
        trends.push(`Moderate spending increase of ${metrics.spendingGrowth.toFixed(1)}% year-over-year`);
      } else if (metrics.spendingGrowth < -5) {
        trends.push(`Great job! Spending decreased by ${Math.abs(metrics.spendingGrowth).toFixed(1)}% compared to last year`);
      }

      // Analyze income trends
      if (metrics.incomeGrowth > 10) {
        trends.push(`Income increased by ${metrics.incomeGrowth.toFixed(1)}% - excellent progress!`);
      } else if (metrics.incomeGrowth < -10) {
        alerts.push(`Income decreased by ${Math.abs(metrics.incomeGrowth).toFixed(1)}% compared to last year`);
        recommendations.push('Consider exploring additional income sources or optimizing existing ones');
      }

      // Analyze category trends
      Object.entries(metrics.categoryGrowth).forEach(([category, growth]) => {
        if (growth > 50) {
          alerts.push(`${category} spending increased significantly by ${growth.toFixed(1)}%`);
        }
      });
    }

    return { trends, recommendations, alerts };
  }
}