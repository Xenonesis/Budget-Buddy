import { supabase } from "@/lib/supabase";

export interface FastDashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: any[];
  monthlyData: any[];
  categoryData: any[];
  topCategories: any[];
}

export class FastDashboardService {
  static async getFastDashboardData(userId: string, timeRange: string = 'this-month'): Promise<FastDashboardStats> {
    // Calculate simple date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'this-week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'this-month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Single database call to get all transactions
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(`
        id,
        amount,
        type,
        date,
        description,
        categories:category_id (name)
      `)
      .eq("user_id", userId)
      .gte("date", startDate.toISOString().split('T')[0])
      .order("date", { ascending: false })
      .limit(100); // Limit to improve performance

    if (error || !transactions) {
      throw error || new Error('No transactions found');
    }

    // Process data in a single pass for better performance
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = new Map<string, number>();
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    const processedTransactions = transactions.map(t => {
      const amount = Number(t.amount) || 0;
      const category = (t.categories as any)?.name || 'Uncategorized';
      const monthKey = t.date.substring(0, 7); // YYYY-MM

      // Calculate totals
      if (t.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        // Track categories for expenses only
        categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
      }

      // Track monthly data
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }
      const monthData = monthlyMap.get(monthKey)!;
      if (t.type === 'income') {
        monthData.income += amount;
      } else {
        monthData.expense += amount;
      }

      return {
        ...t,
        category
      };
    });

    // Convert maps to arrays
    const categoryData = Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: `hsl(${index * 45}, 70%, 50%)`
    })).sort((a, b) => b.value - a.value);

    const monthlyData = Array.from(monthlyMap.entries()).map(([monthKey, data]) => {
      const date = new Date(monthKey + '-01');
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    const topCategories = categoryData.slice(0, 5).map((cat, index) => ({
      name: cat.name,
      count: processedTransactions.filter(t => t.category === cat.name && t.type === 'expense').length,
      total: cat.value,
      color: cat.color
    }));

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      recentTransactions: processedTransactions.slice(0, 10),
      monthlyData,
      categoryData,
      topCategories
    };
  }
}