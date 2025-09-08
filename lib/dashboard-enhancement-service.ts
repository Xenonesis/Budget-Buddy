import { supabase } from './supabase';

export interface DashboardMetrics {
  totalTransactions: number;
  averageTransactionAmount: number;
  largestExpense: number;
  largestIncome: number;
  mostActiveDay: string;
  mostActiveCategory: string;
  savingsRate: number;
  expenseGrowthRate: number;
  incomeGrowthRate: number;
}

export interface CategoryInsight {
  category: string;
  totalSpent: number;
  transactionCount: number;
  averageAmount: number;
  percentageOfTotal: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
}

export interface TimeBasedInsight {
  period: string;
  totalSpending: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
  topCategory: string;
}

export class DashboardEnhancementService {
  /**
   * Get comprehensive dashboard metrics
   */
  static async getDashboardMetrics(userId: string, startDate: Date, endDate: Date): Promise<DashboardMetrics> {
    try {
      // Fetch current period transactions
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      // Fetch previous period for comparison
      const periodLength = endDate.getTime() - startDate.getTime();
      const prevStartDate = new Date(startDate.getTime() - periodLength);
      const prevEndDate = new Date(endDate.getTime() - periodLength);

      const { data: previousTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', prevStartDate.toISOString().split('T')[0])
        .lte('date', prevEndDate.toISOString().split('T')[0]);

      if (!currentTransactions) {
        return this.getEmptyMetrics();
      }

      // Calculate metrics
      const totalTransactions = currentTransactions.length;
      const totalAmount = currentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const averageTransactionAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

      const expenses = currentTransactions.filter(t => t.type === 'expense');
      const income = currentTransactions.filter(t => t.type === 'income');

      const largestExpense = expenses.length > 0 ? Math.max(...expenses.map(t => t.amount)) : 0;
      const largestIncome = income.length > 0 ? Math.max(...income.map(t => t.amount)) : 0;

      // Find most active day
      const dayCount = new Map<string, number>();
      currentTransactions.forEach(t => {
        const day = new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' });
        dayCount.set(day, (dayCount.get(day) || 0) + 1);
      });
      const mostActiveDay = Array.from(dayCount.entries()).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0] || 'N/A';

      // Find most active category
      const categoryCount = new Map<string, number>();
      currentTransactions.forEach(t => {
        const category = t.category || 'Uncategorized';
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      });
      const mostActiveCategory = Array.from(categoryCount.entries()).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0] || 'N/A';

      // Calculate savings rate
      const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

      // Calculate growth rates
      const prevExpenses = previousTransactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
      const prevIncome = previousTransactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;

      const expenseGrowthRate = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;
      const incomeGrowthRate = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;

      return {
        totalTransactions,
        averageTransactionAmount,
        largestExpense,
        largestIncome,
        mostActiveDay,
        mostActiveCategory,
        savingsRate,
        expenseGrowthRate,
        incomeGrowthRate
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * Get detailed category insights
   */
  static async getCategoryInsights(userId: string, startDate: Date, endDate: Date): Promise<CategoryInsight[]> {
    try {
      // Current period
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      // Previous period
      const periodLength = endDate.getTime() - startDate.getTime();
      const prevStartDate = new Date(startDate.getTime() - periodLength);
      const prevEndDate = new Date(endDate.getTime() - periodLength);

      const { data: previousTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', prevStartDate.toISOString().split('T')[0])
        .lte('date', prevEndDate.toISOString().split('T')[0]);

      if (!currentTransactions) return [];

      // Group by category
      const categoryData = new Map<string, { total: number; count: number }>();
      const prevCategoryData = new Map<string, number>();

      currentTransactions.forEach(t => {
        const category = t.category || 'Uncategorized';
        const current = categoryData.get(category) || { total: 0, count: 0 };
        categoryData.set(category, {
          total: current.total + t.amount,
          count: current.count + 1
        });
      });

      previousTransactions?.forEach(t => {
        const category = t.category || 'Uncategorized';
        prevCategoryData.set(category, (prevCategoryData.get(category) || 0) + t.amount);
      });

      const totalSpending = Array.from(categoryData.values()).reduce((sum, data) => sum + data.total, 0);

      return Array.from(categoryData.entries()).map(([category, data]) => {
        const previousAmount = prevCategoryData.get(category) || 0;
        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        let trendPercentage = 0;

        if (previousAmount > 0) {
          trendPercentage = ((data.total - previousAmount) / previousAmount) * 100;
          if (Math.abs(trendPercentage) > 5) {
            trend = trendPercentage > 0 ? 'increasing' : 'decreasing';
          }
        } else if (data.total > 0) {
          trend = 'increasing';
          trendPercentage = 100;
        }

        return {
          category,
          totalSpent: data.total,
          transactionCount: data.count,
          averageAmount: data.total / data.count,
          percentageOfTotal: totalSpending > 0 ? (data.total / totalSpending) * 100 : 0,
          trend,
          trendPercentage
        };
      }).sort((a, b) => b.totalSpent - a.totalSpent);
    } catch (error) {
      console.error('Error getting category insights:', error);
      return [];
    }
  }

  /**
   * Get time-based insights (daily, weekly, monthly patterns)
   */
  static async getTimeBasedInsights(userId: string, startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month'): Promise<TimeBasedInsight[]> {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date');

      if (!transactions) return [];

      const groupedData = new Map<string, {
        spending: number;
        income: number;
        transactions: any[];
      }>();

      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        let key: string;

        switch (groupBy) {
          case 'day':
            key = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0];
        }

        if (!groupedData.has(key)) {
          groupedData.set(key, { spending: 0, income: 0, transactions: [] });
        }

        const group = groupedData.get(key)!;
        if (transaction.type === 'expense') {
          group.spending += transaction.amount;
        } else {
          group.income += transaction.amount;
        }
        group.transactions.push(transaction);
      });

      return Array.from(groupedData.entries()).map(([period, data]) => {
        // Find top category for this period
        const categoryCount = new Map<string, number>();
        data.transactions.forEach(t => {
          if (t.type === 'expense') {
            const category = t.category || 'Uncategorized';
            categoryCount.set(category, (categoryCount.get(category) || 0) + t.amount);
          }
        });

        const topCategory = Array.from(categoryCount.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        return {
          period,
          totalSpending: data.spending,
          totalIncome: data.income,
          netAmount: data.income - data.spending,
          transactionCount: data.transactions.length,
          topCategory
        };
      }).sort((a, b) => a.period.localeCompare(b.period));
    } catch (error) {
      console.error('Error getting time-based insights:', error);
      return [];
    }
  }

  /**
   * Remove mock/fake data and replace with real calculations
   */
  static async getEnhancedMonthlyData(userId: string, startDate: Date, endDate: Date): Promise<{
    name: string;
    income: number;
    expense: number;
    transactionCount: number;
    netAmount: number;
    savingsRate: number;
  }[]> {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date');

      if (!transactions) return [];

      // Group by month
      const monthlyData = new Map<string, {
        income: number;
        expense: number;
        count: number;
      }>();

      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { income: 0, expense: 0, count: 0 });
        }

        const month = monthlyData.get(monthKey)!;
        month.count++;

        if (transaction.type === 'income') {
          month.income += transaction.amount;
        } else {
          month.expense += transaction.amount;
        }
      });

      return Array.from(monthlyData.entries()).map(([name, data]) => {
        const netAmount = data.income - data.expense;
        const savingsRate = data.income > 0 ? (netAmount / data.income) * 100 : 0;

        return {
          name,
          income: data.income,
          expense: data.expense,
          transactionCount: data.count,
          netAmount,
          savingsRate
        };
      }).sort((a, b) => {
        // Sort by date
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      });
    } catch (error) {
      console.error('Error getting enhanced monthly data:', error);
      return [];
    }
  }

  private static getEmptyMetrics(): DashboardMetrics {
    return {
      totalTransactions: 0,
      averageTransactionAmount: 0,
      largestExpense: 0,
      largestIncome: 0,
      mostActiveDay: 'N/A',
      mostActiveCategory: 'N/A',
      savingsRate: 0,
      expenseGrowthRate: 0,
      incomeGrowthRate: 0
    };
  }
}