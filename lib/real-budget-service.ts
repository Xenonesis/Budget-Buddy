import { supabase } from './supabase';

export interface UserBudget {
  id: string;
  user_id: string;
  category_id: string;
  category: string; // This will be populated from the join
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export interface BudgetUsage {
  category: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  period: string;
  isOverBudget: boolean;
  daysRemaining: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentageUsed: number;
  categoriesOverBudget: number;
  totalCategories: number;
}

export class RealBudgetService {
  /**
   * Get user's budget settings from database
   */
  static async getUserBudgets(userId: string): Promise<UserBudget[]> {
    try {
      const { data: budgets, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories!inner(name)
        `)
        .eq('user_id', userId)
        .order('categories(name)');

      if (error) {
        console.error('Error fetching budgets:', error);
        return [];
      }

      // Transform the data to match the expected interface
      const transformedBudgets = budgets?.map(budget => ({
        ...budget,
        category: budget.categories?.name || 'Unknown'
      })) || [];

      return transformedBudgets;
    } catch (error) {
      console.error('Error in getUserBudgets:', error);
      return [];
    }
  }

  /**
   * Get total budget amount for user (replaces hardcoded 5000)
   */
  static async getTotalBudget(userId: string, period: 'monthly' | 'yearly' = 'monthly'): Promise<number> {
    try {
      const budgets = await this.getUserBudgets(userId);
      
      return budgets
        .filter(budget => budget.period === period)
        .reduce((total, budget) => total + budget.amount, 0);
    } catch (error) {
      console.error('Error calculating total budget:', error);
      return 0;
    }
  }

  /**
   * Calculate budget usage for current period
   */
  static async calculateBudgetUsage(userId: string): Promise<BudgetUsage[]> {
    try {
      const budgets = await this.getUserBudgets(userId);
      if (budgets.length === 0) return [];

      // Get current period transactions
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          amount, 
          type,
          categories!inner(name)
        `)
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      if (error) {
        console.error('Error fetching transactions for budget:', error);
        return [];
      }

      // Calculate spending by category
      const categorySpending = new Map<string, number>();
      transactions?.forEach(transaction => {
        const category = Array.isArray(transaction.categories) && transaction.categories.length > 0
          ? transaction.categories[0]?.name || 'Uncategorized'
          : 'Uncategorized';
        categorySpending.set(category, (categorySpending.get(category) || 0) + transaction.amount);
      });

      // Calculate days remaining in current period
      const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Create budget usage for each category
      return budgets
        .filter(budget => budget.period === 'monthly')
        .map(budget => {
          const spentAmount = categorySpending.get(budget.category) || 0;
          const remainingAmount = Math.max(0, budget.amount - spentAmount);
          const percentageUsed = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;

          return {
            category: budget.category,
            budgetAmount: budget.amount,
            spentAmount,
            remainingAmount,
            percentageUsed,
            period: 'monthly',
            isOverBudget: spentAmount > budget.amount,
            daysRemaining
          };
        })
        .sort((a, b) => b.percentageUsed - a.percentageUsed);
    } catch (error) {
      console.error('Error calculating budget usage:', error);
      return [];
    }
  }

  /**
   * Get budget summary
   */
  static async getBudgetSummary(userId: string): Promise<BudgetSummary> {
    try {
      const budgetUsage = await this.calculateBudgetUsage(userId);
      
      const totalBudget = budgetUsage.reduce((sum, usage) => sum + usage.budgetAmount, 0);
      const totalSpent = budgetUsage.reduce((sum, usage) => sum + usage.spentAmount, 0);
      const totalRemaining = Math.max(0, totalBudget - totalSpent);
      const overallPercentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      const categoriesOverBudget = budgetUsage.filter(usage => usage.isOverBudget).length;

      return {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallPercentageUsed,
        categoriesOverBudget,
        totalCategories: budgetUsage.length
      };
    } catch (error) {
      console.error('Error getting budget summary:', error);
      return {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallPercentageUsed: 0,
        categoriesOverBudget: 0,
        totalCategories: 0
      };
    }
  }

  /**
   * Create or update budget
   */
  static async upsertBudget(
    userId: string,
    categoryId: string,
    amount: number,
    period: 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('budgets')
        .upsert({
          user_id: userId,
          category_id: categoryId,
          amount,
          period,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,category_id,period'
        });

      if (error) {
        console.error('Error upserting budget:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in upsertBudget:', error);
      return false;
    }
  }

  /**
   * Delete budget
   */
  static async deleteBudget(userId: string, categoryId: string, period: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('period', period);

      if (error) {
        console.error('Error deleting budget:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteBudget:', error);
      return false;
    }
  }

  /**
   * Get budget recommendations based on spending patterns
   */
  static async getBudgetRecommendations(userId: string): Promise<{
    category: string;
    currentSpending: number;
    recommendedBudget: number;
    reason: string;
  }[]> {
    try {
      // Get last 3 months of spending data
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          amount, 
          date,
          categories!inner(name)
        `)
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', threeMonthsAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error || !transactions) {
        console.error('Error fetching transactions for recommendations:', error);
        return [];
      }

      // Calculate average monthly spending by category
      const categorySpending = new Map<string, number[]>();
      
      transactions.forEach(transaction => {
        const category = Array.isArray(transaction.categories) && transaction.categories.length > 0
          ? transaction.categories[0]?.name || 'Uncategorized'
          : 'Uncategorized';
        
        if (!categorySpending.has(category)) {
          categorySpending.set(category, []);
        }
        categorySpending.get(category)!.push(transaction.amount);
      });

      // Generate recommendations
      const recommendations = Array.from(categorySpending.entries())
        .map(([category, amounts]) => {
          const totalSpending = amounts.reduce((sum, amount) => sum + amount, 0);
          const avgMonthlySpending = totalSpending / 3; // 3 months average
          
          // Recommend 20% buffer above average spending
          const recommendedBudget = Math.ceil(avgMonthlySpending * 1.2);
          
          let reason = `Based on 3-month average of ${(avgMonthlySpending).toFixed(0)}`;
          if (avgMonthlySpending > 500) {
            reason += ' (high spending category)';
          } else if (avgMonthlySpending < 50) {
            reason += ' (low spending category)';
          }

          return {
            category,
            currentSpending: avgMonthlySpending,
            recommendedBudget,
            reason
          };
        })
        .filter(rec => rec.currentSpending > 10) // Only recommend for categories with meaningful spending
        .sort((a, b) => b.currentSpending - a.currentSpending)
        .slice(0, 10); // Top 10 categories

      return recommendations;
    } catch (error) {
      console.error('Error generating budget recommendations:', error);
      return [];
    }
  }
}