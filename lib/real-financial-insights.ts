import { FinancialInsight } from './ai';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  user_id: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  user_id: string;
}

export interface RealFinancialInsight extends FinancialInsight {
  isAISummarized?: boolean;
  rawData?: {
    amount?: number;
    percentage?: number;
    comparison?: string;
    trend?: 'up' | 'down' | 'stable';
  };
}

// Generate insights based on real financial data
export function generateRealFinancialInsights(
  transactions: Transaction[],
  budgets: Budget[]
): RealFinancialInsight[] {
  const insights: RealFinancialInsight[] = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  // Filter transactions for previous month
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === previousMonth && 
           transactionDate.getFullYear() === previousYear;
  });

  // 1. Spending by Category Analysis
  const categorySpending = getCategorySpending(currentMonthTransactions);
  const previousCategorySpending = getCategorySpending(previousMonthTransactions);
  
  Object.entries(categorySpending).forEach(([category, amount]) => {
    const previousAmount = previousCategorySpending[category] || 0;
    const percentageChange = previousAmount > 0 ? ((amount - previousAmount) / previousAmount) * 100 : 0;
    
    if (Math.abs(percentageChange) > 20 && amount > 100) {
      insights.push({
        type: percentageChange > 0 ? 'warning' : 'success',
        title: `${category} Spending ${percentageChange > 0 ? 'Increased' : 'Decreased'}`,
        description: `Your ${category.toLowerCase()} expenses ${percentageChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentageChange).toFixed(1)}% compared to last month.`,
        confidence: 0.9,
        relevantCategories: [category],
        createdAt: new Date().toISOString(),
        amount: amount,
        category: category,
        rawData: {
          amount: amount,
          percentage: percentageChange,
          comparison: 'month-over-month',
          trend: percentageChange > 0 ? 'up' : 'down'
        }
      });
    }
  });

  // 2. Budget Analysis
  budgets.forEach(budget => {
    const categoryTransactions = currentMonthTransactions.filter(t => 
      t.category.toLowerCase() === budget.category.toLowerCase() && t.type === 'expense'
    );
    const spent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const budgetAmount = budget.period === 'monthly' ? budget.amount : 
                        budget.period === 'weekly' ? budget.amount * 4 : 
                        budget.amount / 12;
    
    const percentageUsed = (spent / budgetAmount) * 100;
    
    if (percentageUsed > 80) {
      insights.push({
        type: percentageUsed > 100 ? 'warning' : 'budget_warning',
        title: `${budget.category} Budget ${percentageUsed > 100 ? 'Exceeded' : 'Alert'}`,
        description: `You've ${percentageUsed > 100 ? 'exceeded' : 'used'} ${percentageUsed.toFixed(1)}% of your ${budget.category.toLowerCase()} budget this month.`,
        confidence: 0.95,
        relevantCategories: [budget.category],
        createdAt: new Date().toISOString(),
        amount: spent,
        category: budget.category,
        rawData: {
          amount: spent,
          percentage: percentageUsed,
          comparison: 'budget-vs-actual'
        }
      });
    } else if (percentageUsed < 50) {
      insights.push({
        type: 'success',
        title: `${budget.category} Budget On Track`,
        description: `Great job! You've only used ${percentageUsed.toFixed(1)}% of your ${budget.category.toLowerCase()} budget this month.`,
        confidence: 0.8,
        relevantCategories: [budget.category],
        createdAt: new Date().toISOString(),
        amount: spent,
        category: budget.category,
        rawData: {
          amount: spent,
          percentage: percentageUsed,
          comparison: 'budget-vs-actual'
        }
      });
    }
  });

  // 3. Income vs Expenses
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  if (savingsRate < 10 && totalIncome > 0) {
    insights.push({
      type: 'warning',
      title: 'Low Savings Rate',
      description: `Your savings rate is ${savingsRate.toFixed(1)}%. Consider reducing expenses or increasing income to improve your financial health.`,
      confidence: 0.85,
      relevantCategories: ['Savings'],
      createdAt: new Date().toISOString(),
      amount: totalIncome - totalExpenses,
      category: 'Savings',
      rawData: {
        amount: totalIncome - totalExpenses,
        percentage: savingsRate,
        comparison: 'income-vs-expenses'
      }
    });
  } else if (savingsRate > 20) {
    insights.push({
      type: 'success',
      title: 'Excellent Savings Rate',
      description: `Outstanding! You're saving ${savingsRate.toFixed(1)}% of your income this month. Consider investing the surplus for long-term growth.`,
      confidence: 0.9,
      relevantCategories: ['Savings', 'Investments'],
      createdAt: new Date().toISOString(),
      amount: totalIncome - totalExpenses,
      category: 'Savings',
      rawData: {
        amount: totalIncome - totalExpenses,
        percentage: savingsRate,
        comparison: 'income-vs-expenses'
      }
    });
  }

  // 4. Frequent Small Expenses
  const smallExpenses = currentMonthTransactions.filter(t => 
    t.type === 'expense' && Math.abs(t.amount) < 20
  );
  
  if (smallExpenses.length > 20) {
    const totalSmallExpenses = smallExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    insights.push({
      type: 'saving_suggestion',
      title: 'Small Expenses Add Up',
      description: `You've made ${smallExpenses.length} small purchases totaling $${totalSmallExpenses.toFixed(2)} this month. Consider tracking these micro-expenses.`,
      confidence: 0.75,
      relevantCategories: ['Miscellaneous'],
      createdAt: new Date().toISOString(),
      amount: totalSmallExpenses,
      category: 'Miscellaneous',
      rawData: {
        amount: totalSmallExpenses,
        percentage: (totalSmallExpenses / totalExpenses) * 100,
        comparison: 'small-vs-total-expenses'
      }
    });
  }

  // 5. Top Spending Category
  const topCategory = Object.entries(categorySpending).reduce((max, [category, amount]) => 
    amount > max.amount ? { category, amount } : max, { category: '', amount: 0 }
  );

  if (topCategory.amount > 0) {
    const percentageOfTotal = (topCategory.amount / totalExpenses) * 100;
    insights.push({
      type: 'trend',
      title: `Top Spending: ${topCategory.category}`,
      description: `${topCategory.category} is your largest expense category, representing ${percentageOfTotal.toFixed(1)}% of your total spending this month.`,
      confidence: 0.95,
      relevantCategories: [topCategory.category],
      createdAt: new Date().toISOString(),
      amount: topCategory.amount,
      category: topCategory.category,
      rawData: {
        amount: topCategory.amount,
        percentage: percentageOfTotal,
        comparison: 'category-vs-total'
      }
    });
  }

  // 6. Subscription Detection
  const potentialSubscriptions = detectSubscriptions(currentMonthTransactions);
  if (potentialSubscriptions.length > 0) {
    const totalSubscriptions = potentialSubscriptions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    insights.push({
      type: 'saving_suggestion',
      title: 'Subscription Review Opportunity',
      description: `Found ${potentialSubscriptions.length} potential recurring subscriptions totaling $${totalSubscriptions.toFixed(2)}/month. Review these for potential savings.`,
      confidence: 0.7,
      relevantCategories: ['Subscriptions', 'Entertainment'],
      createdAt: new Date().toISOString(),
      amount: totalSubscriptions,
      category: 'Subscriptions',
      rawData: {
        amount: totalSubscriptions,
        percentage: (totalSubscriptions / totalExpenses) * 100,
        comparison: 'subscriptions-vs-total'
      }
    });
  }

  return insights.sort((a, b) => b.confidence - a.confidence);
}

// Helper function to calculate spending by category
function getCategorySpending(transactions: Transaction[]): Record<string, number> {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);
}

// Helper function to detect potential subscriptions
function detectSubscriptions(transactions: Transaction[]): Transaction[] {
  const subscriptionKeywords = [
    'netflix', 'spotify', 'apple', 'google', 'amazon prime', 'hulu', 'disney',
    'subscription', 'monthly', 'recurring', 'membership', 'premium'
  ];
  
  return transactions.filter(t => 
    t.type === 'expense' && 
    subscriptionKeywords.some(keyword => 
      t.description.toLowerCase().includes(keyword)
    )
  );
}

// Generate summary statistics for insights
export function generateInsightsSummary(insights: RealFinancialInsight[]) {
  return {
    total: insights.length,
    warnings: insights.filter(i => i.type === 'warning' || i.type === 'budget_warning').length,
    successes: insights.filter(i => i.type === 'success').length,
    suggestions: insights.filter(i => i.type === 'saving_suggestion').length,
    trends: insights.filter(i => i.type === 'trend').length,
    totalAmount: insights.reduce((sum, i) => sum + (i.amount || 0), 0),
    avgConfidence: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length
  };
}