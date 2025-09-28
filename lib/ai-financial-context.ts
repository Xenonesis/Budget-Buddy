import { supabase } from './supabase';
import { calculateNextRecurringDate } from './utils';

export interface UserFinancialProfile {
  // Basic profile information
  userId: string;
  currency: string;
  timezone: string;
  username?: string;
  
  // Financial overview
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  savingsRate: number;
  
  // Transaction data
  recentTransactions: Array<{
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
  }>;
  
  // Spending patterns
  spendingByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  
  // Budget information
  budgets: Array<{
    id: string;
    category: string;
    budgetAmount: number;
    spentAmount: number;
    percentage: number;
    status: 'under' | 'over' | 'on-track';
    period: string;
  }>;
  
  // Financial goals
  goals: Array<{
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    progress: number;
  }>;
  
  // Recurring transactions
  recurringTransactions: Array<{
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    frequency: string;
    description: string;
    nextDate: string;
  }>;
  
  // Financial insights
  monthlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  
  // Risk factors and opportunities
  insights: {
    topExpenseCategories: string[];
    unusualSpending: Array<{
      category: string;
      amount: number;
      normalRange: string;
    }>;
    savingsOpportunities: Array<{
      category: string;
      potentialSavings: number;
      suggestion: string;
    }>;
    budgetAlerts: Array<{
      category: string;
      overspent: number;
      percentage: number;
    }>;
  };
}

/**
 * Fetches comprehensive financial data for a user to provide AI context
 */
export async function getUserFinancialProfile(userId: string): Promise<UserFinancialProfile | null> {
  try {
    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      console.error('No profile found for user:', userId);
      return null;
    }

    // Fetch recent transactions (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: transactions } = await supabase
      .from('transactions')
      .select(`
        id,
        type,
        amount,
        description,
        date,
        category_id,
        categories!category_id (name)
      `)
      .eq('user_id', userId)
      .gte('date', threeMonthsAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Fetch budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    // Fetch goals
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    // Fetch recurring transactions
    const { data: recurring } = await supabase
      .from('recurring_transactions')
      .select(`
        id,
        type,
        amount,
        description,
        frequency,
        start_date,
        category_id,
        categories!category_id (name)
      `)
      .eq('user_id', userId)
      .eq('active', true);

    // Process the data
    const processedTransactions = (transactions || []).map(t => ({
      id: t.id,
      type: t.type as 'income' | 'expense',
      category: (t.categories as any)?.name || 'Uncategorized',
      amount: t.amount,
      description: t.description || '',
      date: t.date
    }));

    // Calculate financial metrics
    const totalIncome = processedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = processedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netWorth = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Calculate spending by category
    const categorySpending = new Map<string, number>();
    processedTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending.set(t.category, (categorySpending.get(t.category) || 0) + t.amount);
      });

    const spendingByCategory = Array.from(categorySpending.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        trend: calculateSpendingTrend(category, processedTransactions)
      }))
      .sort((a, b) => b.amount - a.amount);

    // Process budgets
    const processedBudgets = (budgets || []).map(budget => {
      const categorySpent = categorySpending.get(budget.category_name) || 0;
      const percentage = budget.amount > 0 ? (categorySpent / budget.amount) * 100 : 0;
      
      let status: 'under' | 'over' | 'on-track' = 'under';
      if (percentage > 100) status = 'over';
      else if (percentage > 80) status = 'on-track';

      return {
        id: budget.id,
        category: budget.category_name,
        budgetAmount: budget.amount,
        spentAmount: categorySpent,
        percentage,
        status,
        period: budget.period || 'monthly'
      };
    });

    // Process goals
    const processedGoals = (goals || []).map(goal => ({
      id: goal.id,
      title: goal.title,
      targetAmount: goal.target_amount,
      currentAmount: goal.current_amount || 0,
      deadline: goal.target_date,
      progress: goal.target_amount > 0 ? ((goal.current_amount || 0) / goal.target_amount) * 100 : 0
    }));

    // Process recurring transactions
    const processedRecurring = (recurring || []).map(r => ({
      id: r.id,
      type: r.type as 'income' | 'expense',
      category: (r.categories as any)?.name || 'Uncategorized',
      amount: r.amount,
      frequency: r.frequency,
      description: r.description || '',
      nextDate: calculateNextRecurringDate(new Date(r.start_date), r.frequency).toISOString().split('T')[0]
    }));

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = calculateMonthlyTrends(processedTransactions);

    // Generate insights
    const insights = generateFinancialInsights(
      processedTransactions,
      spendingByCategory,
      processedBudgets
    );

    const userFinancialProfile: UserFinancialProfile = {
      userId,
      currency: profile.currency || 'USD',
      timezone: profile.timezone || 'UTC',
      username: profile.username,
      totalIncome,
      totalExpenses,
      netWorth,
      savingsRate,
      recentTransactions: processedTransactions.slice(0, 20), // Last 20 transactions
      spendingByCategory: spendingByCategory.slice(0, 10), // Top 10 categories
      budgets: processedBudgets,
      goals: processedGoals,
      recurringTransactions: processedRecurring,
      monthlyTrends,
      insights
    };

    return userFinancialProfile;

  } catch (error) {
    console.error('Error fetching user financial profile:', error);
    return null;
  }
}

/**
 * Calculates spending trend for a category based on recent transaction history
 */
function calculateSpendingTrend(category: string, transactions: any[]): 'increasing' | 'decreasing' | 'stable' {
  // Get last 3 months of data for this category
  const categoryTransactions = transactions
    .filter(t => t.category === category && t.type === 'expense')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (categoryTransactions.length < 2) return 'stable';

  // Split into first half and second half to compare trends
  const midpoint = Math.floor(categoryTransactions.length / 2);
  const firstHalf = categoryTransactions.slice(0, midpoint);
  const secondHalf = categoryTransactions.slice(midpoint);

  const firstHalfTotal = firstHalf.reduce((sum, t) => sum + t.amount, 0);
  const secondHalfTotal = secondHalf.reduce((sum, t) => sum + t.amount, 0);

  const firstHalfAvg = firstHalfTotal / firstHalf.length;
  const secondHalfAvg = secondHalfTotal / secondHalf.length;

  const percentageChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

  if (percentageChange > 20) return 'increasing';
  if (percentageChange < -20) return 'decreasing';
  return 'stable';
}

/**
 * Calculates monthly trends from transactions
 */
function calculateMonthlyTrends(transactions: any[]): Array<{
  month: string;
  income: number;
  expenses: number;
  savings: number;
}> {
  const monthlyData = new Map<string, { income: number; expenses: number }>();
  
  transactions.forEach(transaction => {
    const month = new Date(transaction.date).toISOString().slice(0, 7); // YYYY-MM format
    
    if (!monthlyData.has(month)) {
      monthlyData.set(month, { income: 0, expenses: 0 });
    }
    
    const data = monthlyData.get(month)!;
    if (transaction.type === 'income') {
      data.income += transaction.amount;
    } else {
      data.expenses += transaction.amount;
    }
  });

  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      savings: data.income - data.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months
}

/**
 * Generates financial insights and alerts
 */
function generateFinancialInsights(
  transactions: any[],
  spendingByCategory: any[],
  budgets: any[]
): UserFinancialProfile['insights'] {
  const topExpenseCategories = spendingByCategory
    .slice(0, 5)
    .map(cat => cat.category);

  // Find unusual spending (categories where current month exceeds average by 50%)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth) && t.type === 'expense'
  );

  const currentMonthSpending = new Map<string, number>();
  currentMonthTransactions.forEach(t => {
    currentMonthSpending.set(t.category, (currentMonthSpending.get(t.category) || 0) + t.amount);
  });

  // Calculate average spending per category (excluding current month)
  const historicalTransactions = transactions.filter(t => 
    !t.date.startsWith(currentMonth) && t.type === 'expense'
  );
  
  const avgSpending = new Map<string, number>();
  const categoryCount = new Map<string, number>();
  
  historicalTransactions.forEach(t => {
    avgSpending.set(t.category, (avgSpending.get(t.category) || 0) + t.amount);
    categoryCount.set(t.category, (categoryCount.get(t.category) || 0) + 1);
  });

  const unusualSpending = Array.from(currentMonthSpending.entries())
    .map(([category, currentAmount]) => {
      const avgAmount = avgSpending.get(category) || 0;
      const count = categoryCount.get(category) || 1;
      const monthlyAvg = avgAmount / Math.max(count / 30, 1); // Rough monthly average
      
      if (currentAmount > monthlyAvg * 1.5 && monthlyAvg > 0) {
        return {
          category,
          amount: currentAmount,
          normalRange: `$${monthlyAvg.toFixed(2)} average`
        };
      }
      return null;
    })
    .filter(Boolean) as Array<{
      category: string;
      amount: number;
      normalRange: string;
    }>;

  // Find savings opportunities (categories with consistent spending that could be reduced)
  const savingsOpportunities = spendingByCategory
    .filter(cat => cat.amount > 100) // Only categories with significant spending
    .slice(0, 3)
    .map(cat => ({
      category: cat.category,
      potentialSavings: Math.round(cat.amount * 0.15), // 15% reduction potential
      suggestion: `Consider reducing ${cat.category} spending by tracking expenses more closely`
    }));

  // Budget alerts
  const budgetAlerts = budgets
    .filter(budget => budget.status === 'over')
    .map(budget => ({
      category: budget.category,
      overspent: budget.spentAmount - budget.budgetAmount,
      percentage: budget.percentage
    }));

  return {
    topExpenseCategories,
    unusualSpending,
    savingsOpportunities,
    budgetAlerts
  };
}

/**
 * Builds a comprehensive system message with financial context for AI
 */
export function buildFinancialSystemMessage(profile: UserFinancialProfile): string {
  const currentDate = new Date().toLocaleDateString();
  
  return `You are an expert personal financial advisor with access to the user's complete financial data. Your role is to provide personalized, actionable financial advice based on their real financial situation.

USER FINANCIAL PROFILE (as of ${currentDate}):

BASIC INFO:
- Currency: ${profile.currency}
- Timezone: ${profile.timezone}
- Username: ${profile.username || 'User'}

FINANCIAL OVERVIEW:
- Total Income (3 months): ${profile.currency} ${profile.totalIncome.toLocaleString()}
- Total Expenses (3 months): ${profile.currency} ${profile.totalExpenses.toLocaleString()}
- Net Position: ${profile.currency} ${profile.netWorth.toLocaleString()}
- Savings Rate: ${profile.savingsRate.toFixed(1)}%

TOP SPENDING CATEGORIES:
${profile.spendingByCategory.slice(0, 5).map(cat => 
  `- ${cat.category}: ${profile.currency} ${cat.amount.toLocaleString()} (${cat.percentage.toFixed(1)}%)`
).join('\n')}

BUDGET STATUS:
${profile.budgets.length > 0 
  ? profile.budgets.map(budget => 
      `- ${budget.category}: ${profile.currency}${budget.spentAmount.toLocaleString()}/${profile.currency}${budget.budgetAmount.toLocaleString()} (${budget.percentage.toFixed(1)}%) - ${budget.status.toUpperCase()}`
    ).join('\n')
  : '- No budgets set up'
}

FINANCIAL GOALS:
${profile.goals.length > 0
  ? profile.goals.map(goal =>
      `- ${goal.title}: ${profile.currency}${goal.currentAmount.toLocaleString()}/${profile.currency}${goal.targetAmount.toLocaleString()} (${goal.progress.toFixed(1)}%) - Due: ${goal.deadline}`
    ).join('\n')
  : '- No financial goals set'
}

RECURRING TRANSACTIONS:
${profile.recurringTransactions.length > 0
  ? profile.recurringTransactions.map(recurring =>
      `- ${recurring.type === 'income' ? '+' : '-'} ${profile.currency}${recurring.amount.toLocaleString()} ${recurring.category} (${recurring.frequency})`
    ).join('\n')
  : '- No recurring transactions'
}

RECENT FINANCIAL ALERTS:
${profile.insights.budgetAlerts.length > 0
  ? profile.insights.budgetAlerts.map(alert =>
      `- BUDGET EXCEEDED: ${alert.category} overspent by ${profile.currency}${alert.overspent.toLocaleString()} (${alert.percentage.toFixed(1)}%)`
    ).join('\n')
  : '- No budget alerts'
}

${profile.insights.unusualSpending.length > 0
  ? `UNUSUAL SPENDING DETECTED:
${profile.insights.unusualSpending.map(spending =>
    `- ${spending.category}: ${profile.currency}${spending.amount.toLocaleString()} (normally ${spending.normalRange})`
  ).join('\n')}`
  : ''
}

SAVINGS OPPORTUNITIES:
${profile.insights.savingsOpportunities.map(opp =>
  `- ${opp.category}: Potential to save ${profile.currency}${opp.potentialSavings.toLocaleString()}`
).join('\n')}

MONTHLY TRENDS (Last 6 months):
${profile.monthlyTrends.map(trend =>
  `- ${trend.month}: Income ${profile.currency}${trend.income.toLocaleString()}, Expenses ${profile.currency}${trend.expenses.toLocaleString()}, Net ${profile.currency}${trend.savings.toLocaleString()}`
).join('\n')}

INSTRUCTIONS FOR RESPONSES:
1. Always use the user's actual financial data when providing advice
2. Be specific with numbers and reference their real transactions/budgets
3. Provide actionable, personalized recommendations
4. Alert them to any concerning patterns or overspending
5. Celebrate their financial wins and progress toward goals
6. Use their preferred currency (${profile.currency}) in all monetary references
7. Consider their timezone (${profile.timezone}) for time-sensitive advice
8. Be encouraging but honest about their financial situation
9. Suggest specific budget adjustments based on their spending patterns
10. Recommend goal adjustments if current goals seem unrealistic given their income/expenses

Remember: You have complete access to their financial information, so provide specific, data-driven advice rather than generic financial tips. Reference actual categories, amounts, and trends from their data.`;
}

/**
 * Builds a quick financial summary for lightweight contexts
 */
export function buildQuickFinancialSummary(profile: UserFinancialProfile): string {
  return `Financial Summary: ${profile.currency}${profile.totalIncome.toLocaleString()} income, ${profile.currency}${profile.totalExpenses.toLocaleString()} expenses (3mo), ${profile.savingsRate.toFixed(1)}% savings rate. Top spending: ${profile.spendingByCategory.slice(0, 3).map(c => c.category).join(', ')}. ${profile.insights.budgetAlerts.length} budget alerts.`;
}

/**
 * Analyzes spending patterns and provides actionable insights
 */
export function analyzeSpendingPatterns(profile: UserFinancialProfile): {
  analysis: string;
  recommendations: string[];
  riskFactors: string[];
} {
  const analysis = `Spending Analysis:
- Top expense categories: ${profile.spendingByCategory.slice(0, 3).map(c => `${c.category} (${c.percentage.toFixed(1)}%)`).join(', ')}
- Savings rate: ${profile.savingsRate.toFixed(1)}% ${profile.savingsRate < 10 ? '(Below recommended 10-20%)' : profile.savingsRate > 30 ? '(Excellent!)' : '(Good)'}
- Budget adherence: ${profile.budgets.filter(b => b.status === 'under').length}/${profile.budgets.length} budgets on track`;

  const recommendations: string[] = [];
  const riskFactors: string[] = [];

  // Generate recommendations based on spending patterns
  if (profile.savingsRate < 10) {
    recommendations.push("Increase savings rate to at least 10-20% of income");
    riskFactors.push("Low savings rate may impact financial security");
  }

  profile.spendingByCategory.slice(0, 3).forEach(category => {
    if (category.percentage > 30 && category.category !== 'Housing') {
      recommendations.push(`Consider reducing ${category.category} spending (currently ${category.percentage.toFixed(1)}% of expenses)`);
    }
    if (category.trend === 'increasing') {
      riskFactors.push(`${category.category} spending is trending upward`);
    }
  });

  // Budget-specific recommendations
  profile.budgets.forEach(budget => {
    if (budget.status === 'over') {
      recommendations.push(`Reduce ${budget.category} spending - currently ${budget.percentage.toFixed(1)}% over budget`);
      const overspent = budget.spentAmount - budget.budgetAmount;
      riskFactors.push(`${budget.category} budget exceeded by ${profile.currency}${overspent.toLocaleString()}`);
    }
  });

  return { analysis, recommendations, riskFactors };
}

/**
 * Calculates financial health metrics
 */
export function calculateFinancialHealth(profile: UserFinancialProfile): {
  score: number; // 0-100
  grade: string; // A, B, C, D, F
  factors: {
    savingsRate: { score: number; status: string };
    budgetAdherence: { score: number; status: string };
    debtManagement: { score: number; status: string };
    goalProgress: { score: number; status: string };
  };
} {
  let totalScore = 0;
  
  // Savings Rate (25% of total score)
  const savingsRateScore = Math.min(Math.max(profile.savingsRate * 5, 0), 100); // 20% savings = 100 points
  let savingsRateStatus = 'Poor';
  if (profile.savingsRate >= 20) savingsRateStatus = 'Excellent';
  else if (profile.savingsRate >= 10) savingsRateStatus = 'Good';
  else if (profile.savingsRate >= 5) savingsRateStatus = 'Fair';
  
  // Budget Adherence (25% of total score)
  const onTrackBudgets = profile.budgets.filter(b => b.status !== 'over').length;
  const budgetAdherenceScore = profile.budgets.length > 0 ? (onTrackBudgets / profile.budgets.length) * 100 : 50;
  let budgetAdherenceStatus = 'Poor';
  if (budgetAdherenceScore >= 90) budgetAdherenceStatus = 'Excellent';
  else if (budgetAdherenceScore >= 70) budgetAdherenceStatus = 'Good';
  else if (budgetAdherenceScore >= 50) budgetAdherenceStatus = 'Fair';
  
  // Debt Management (25% of total score) - simplified since we don't have debt data
  const debtManagementScore = profile.netWorth >= 0 ? 100 : Math.max(0, 100 + (profile.netWorth / profile.totalIncome) * 50);
  const debtManagementStatus = profile.netWorth >= 0 ? 'Good' : 'Needs Attention';
  
  // Goal Progress (25% of total score)
  const avgGoalProgress = profile.goals.length > 0 
    ? profile.goals.reduce((sum, goal) => sum + goal.progress, 0) / profile.goals.length
    : 0;
  const goalProgressScore = avgGoalProgress;
  
  let goalProgressStatus = 'Poor';
  if (avgGoalProgress >= 75) goalProgressStatus = 'Excellent';
  else if (avgGoalProgress >= 50) goalProgressStatus = 'Good';
  else if (avgGoalProgress >= 25) goalProgressStatus = 'Fair';
  
  totalScore = (savingsRateScore * 0.25) + (budgetAdherenceScore * 0.25) + (debtManagementScore * 0.25) + (goalProgressScore * 0.25);
  
  let grade = 'F';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 80) grade = 'B';
  else if (totalScore >= 70) grade = 'C';
  else if (totalScore >= 60) grade = 'D';
  
  return {
    score: Math.round(totalScore),
    grade,
    factors: {
      savingsRate: { score: Math.round(savingsRateScore), status: savingsRateStatus },
      budgetAdherence: { score: Math.round(budgetAdherenceScore), status: budgetAdherenceStatus },
      debtManagement: { score: Math.round(debtManagementScore), status: debtManagementStatus },
      goalProgress: { score: Math.round(goalProgressScore), status: goalProgressStatus }
    }
  };
}

/**
 * Generates personalized budget recommendations
 */
export function generateBudgetRecommendations(profile: UserFinancialProfile): {
  recommendedBudgets: Array<{
    category: string;
    currentSpending: number;
    recommendedBudget: number;
    reasoning: string;
  }>;
  totalRecommendedExpenses: number;
  projectedSavings: number;
} {
  const recommendedBudgets: any[] = [];
  
  // Use 50/30/20 rule as base (50% needs, 30% wants, 20% savings)
  const monthlyIncome = profile.totalIncome / 3; // Approximate monthly income
  const recommendedNeeds = monthlyIncome * 0.5;
  const recommendedWants = monthlyIncome * 0.3;
  
  // Categorize expenses into needs vs wants
  const needsCategories = ['Housing', 'Groceries', 'Utilities', 'Transportation', 'Healthcare', 'Insurance'];
  const wantsCategories = ['Dining Out', 'Entertainment', 'Shopping', 'Hobbies', 'Subscriptions'];
  
  let totalNeedsSpending = 0;
  let totalWantsSpending = 0;
  
  profile.spendingByCategory.forEach(category => {
    const monthlySpending = category.amount / 3; // Convert to monthly
    
    if (needsCategories.includes(category.category)) {
      totalNeedsSpending += monthlySpending;
    } else if (wantsCategories.includes(category.category)) {
      totalWantsSpending += monthlySpending;
    }
  });
  
  // Generate recommendations for top spending categories
  profile.spendingByCategory.slice(0, 8).forEach(category => {
    const monthlySpending = category.amount / 3;
    let recommendedBudget = monthlySpending;
    let reasoning = "Maintain current spending level";
    
    if (needsCategories.includes(category.category)) {
      if (totalNeedsSpending > recommendedNeeds) {
        recommendedBudget = Math.max(monthlySpending * 0.9, monthlySpending - 50);
        reasoning = "Reduce to stay within 50% needs budget";
      }
    } else if (wantsCategories.includes(category.category)) {
      if (totalWantsSpending > recommendedWants) {
        recommendedBudget = Math.max(monthlySpending * 0.8, monthlySpending - 100);
        reasoning = "Reduce discretionary spending to increase savings";
      }
    }
    
    // Special cases
    if (category.percentage > 25 && category.category !== 'Housing') {
      recommendedBudget = Math.max(recommendedBudget * 0.85, recommendedBudget - 75);
      reasoning = "Category represents large portion of expenses - consider reduction";
    }
    
    if (category.trend === 'increasing') {
      recommendedBudget = Math.max(recommendedBudget * 0.95, recommendedBudget - 25);
      reasoning = "Spending is trending upward - set tighter budget";
    }
    
    recommendedBudgets.push({
      category: category.category,
      currentSpending: monthlySpending,
      recommendedBudget: Math.round(recommendedBudget),
      reasoning
    });
  });
  
  const totalRecommendedExpenses = recommendedBudgets.reduce((sum, budget) => sum + budget.recommendedBudget, 0);
  const projectedSavings = monthlyIncome - totalRecommendedExpenses;
  
  return {
    recommendedBudgets,
    totalRecommendedExpenses,
    projectedSavings
  };
}