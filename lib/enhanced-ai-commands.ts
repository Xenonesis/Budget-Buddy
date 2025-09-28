import { supabase } from './supabase';
import { financeNewsService } from './finance-news-service';

/**
 * Enhanced AI command handler with real-time data querying and web crawling
 */
export class EnhancedAICommands {
  private static instance: EnhancedAICommands;

  static getInstance(): EnhancedAICommands {
    if (!EnhancedAICommands.instance) {
      EnhancedAICommands.instance = new EnhancedAICommands();
    }
    return EnhancedAICommands.instance;
  }

  /**
   * Process user query with context-aware responses
   */
  async processQuery(userId: string, query: string): Promise<string | null> {
    const lowerQuery = query.toLowerCase();

    // Financial data queries
    if (this.isDataQuery(lowerQuery)) {
      return await this.handleDataQuery(userId, lowerQuery);
    }

    // News and market queries
    if (this.isNewsQuery(lowerQuery)) {
      return await this.handleNewsQuery(lowerQuery);
    }

    // Insights and analysis queries
    if (this.isInsightQuery(lowerQuery)) {
      return await this.handleInsightQuery(userId, lowerQuery);
    }

    // Budget and planning queries
    if (this.isBudgetQuery(lowerQuery)) {
      return await this.handleBudgetQuery(userId, lowerQuery);
    }

    return null; // Let regular AI handle other queries
  }

  private isDataQuery(query: string): boolean {
    const dataKeywords = [
      'how much', 'total spent', 'spending', 'expenses', 'income',
      'transactions', 'last month', 'this month', 'this year',
      'category', 'categories', 'breakdown'
    ];
    return dataKeywords.some(keyword => query.includes(keyword));
  }

  private isNewsQuery(query: string): boolean {
    const newsKeywords = [
      'news', 'market', 'stock', 'economy', 'inflation',
      'financial news', 'latest', 'current events', 'market update'
    ];
    return newsKeywords.some(keyword => query.includes(keyword));
  }

  private isInsightQuery(query: string): boolean {
    const insightKeywords = [
      'insights', 'analysis', 'patterns', 'trends',
      'recommendations', 'advice', 'suggestions'
    ];
    return insightKeywords.some(keyword => query.includes(keyword));
  }

  private isBudgetQuery(query: string): boolean {
    const budgetKeywords = [
      'budget', 'save', 'saving', 'plan', 'goal',
      'reduce spending', 'cut costs', 'financial plan'
    ];
    return budgetKeywords.some(keyword => query.includes(keyword));
  }

  private async handleDataQuery(userId: string, query: string): Promise<string> {
    try {
      let timeFilter = '';
      let categoryFilter = '';

      // Parse time period
      if (query.includes('this month')) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        timeFilter = `AND EXTRACT(MONTH FROM date) = ${currentMonth} AND EXTRACT(YEAR FROM date) = ${currentYear}`;
      } else if (query.includes('last month')) {
        const lastMonth = new Date().getMonth() === 0 ? 12 : new Date().getMonth();
        const year = new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
        timeFilter = `AND EXTRACT(MONTH FROM date) = ${lastMonth} AND EXTRACT(YEAR FROM date) = ${year}`;
      } else if (query.includes('this year')) {
        const currentYear = new Date().getFullYear();
        timeFilter = `AND EXTRACT(YEAR FROM date) = ${currentYear}`;
      }

      // Parse category
      const categories = ['food', 'groceries', 'entertainment', 'transport', 'utilities', 'healthcare', 'shopping'];
      for (const category of categories) {
        if (query.includes(category)) {
          categoryFilter = `AND LOWER(category) LIKE '%${category}%'`;
          break;
        }
      }

      // Query transactions
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', this.getDateFilter(query))
        .order('date', { ascending: false });

      if (error) {
        console.error('Error querying transactions:', error);
        return "I couldn't retrieve your transaction data at the moment. Please try again.";
      }

      // Filter by category if specified
      let filteredTransactions = transactions || [];
      if (categoryFilter) {
        const categoryName = categories.find(cat => query.includes(cat));
        filteredTransactions = filteredTransactions.filter(t => 
          t.category?.toLowerCase().includes(categoryName?.toLowerCase() || '')
        );
      }

      // Filter by time if specified
      if (timeFilter) {
        filteredTransactions = this.filterByTime(filteredTransactions, query);
      }

      return this.formatDataResponse(filteredTransactions, query);

    } catch (error) {
      console.error('Error handling data query:', error);
      return "I encountered an error while analyzing your financial data. Please try again.";
    }
  }

  private async handleNewsQuery(query: string): Promise<string> {
    try {
      const articles = await financeNewsService.getFinanceNews();
      
      if (!articles || articles.length === 0) {
        return "I couldn't fetch the latest financial news at the moment. Please try again later.";
      }

      // Filter articles based on query context
      let relevantArticles = articles;
      if (query.includes('market') || query.includes('stock')) {
        relevantArticles = articles.filter(article => 
          article.title.toLowerCase().includes('market') || 
          article.title.toLowerCase().includes('stock') ||
          article.category === 'markets'
        );
      }

      const topArticles = relevantArticles.slice(0, 3);
      let response = "📰 Here's the latest financial news:\n\n";

      topArticles.forEach((article, index) => {
        response += `${index + 1}. **${article.title}**\n`;
        if (article.summary && article.summary !== article.title) {
          response += `   ${article.summary}\n`;
        }
        response += `   *Source: ${article.source}*\n\n`;
      });

      response += "💡 This information is current as of today and may impact your financial decisions. Always consult with a financial advisor for personalized advice.";

      return response;

    } catch (error) {
      console.error('Error handling news query:', error);
      return "I couldn't fetch the latest financial news at the moment. Please check your internet connection and try again.";
    }
  }

  private async handleInsightQuery(userId: string, query: string): Promise<string> {
    try {
      // Fetch recent transactions and budgets
      const [transactionsResult, budgetsResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(50),
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId)
      ]);

      const transactions = transactionsResult.data || [];
      const budgets = budgetsResult.data || [];

      if (transactions.length === 0) {
        return "I don't have enough transaction data to provide insights. Start by adding some transactions to see personalized financial insights.";
      }

      // Generate contextual insights
      const insights = this.generateContextualInsights(transactions, budgets, query);
      
      return insights;

    } catch (error) {
      console.error('Error handling insight query:', error);
      return "I couldn't generate insights at the moment. Please try again.";
    }
  }

  private async handleBudgetQuery(userId: string, query: string): Promise<string> {
    try {
      // Fetch user's budgets and recent transactions
      const [budgetsResult, transactionsResult] = await Promise.all([
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const budgets = budgetsResult.data || [];
      const recentTransactions = transactionsResult.data || [];

      return this.generateBudgetAdvice(budgets, recentTransactions, query);

    } catch (error) {
      console.error('Error handling budget query:', error);
      return "I couldn't analyze your budget at the moment. Please try again.";
    }
  }

  private getDateFilter(query: string): string {
    const now = new Date();
    
    if (query.includes('this month')) {
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    } else if (query.includes('last month')) {
      return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    } else if (query.includes('this year')) {
      return new Date(now.getFullYear(), 0, 1).toISOString();
    } else if (query.includes('last week')) {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    // Default to last 30 days
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  private filterByTime(transactions: any[], query: string): any[] {
    const now = new Date();
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      if (query.includes('this month')) {
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      } else if (query.includes('last month')) {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return transactionDate.getMonth() === lastMonth && 
               transactionDate.getFullYear() === year;
      } else if (query.includes('this year')) {
        return transactionDate.getFullYear() === now.getFullYear();
      }
      
      return true;
    });
  }

  private formatDataResponse(transactions: any[], query: string): string {
    if (transactions.length === 0) {
      return "I couldn't find any transactions matching your criteria. Try adjusting your time period or category.";
    }

    const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const expenses = transactions.filter(t => t.amount < 0);
    const income = transactions.filter(t => t.amount > 0);

    let response = "💰 Here's what I found:\n\n";

    if (query.includes('spent') || query.includes('expenses')) {
      const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      response += `💸 **Total Spent**: $${totalSpent.toFixed(2)}\n`;
      response += `📊 **Number of Transactions**: ${expenses.length}\n`;

      if (expenses.length > 0) {
        const avgTransaction = totalSpent / expenses.length;
        response += `📈 **Average Transaction**: $${avgTransaction.toFixed(2)}\n\n`;

        // Top categories
        const categoryTotals = this.getCategoryTotals(expenses);
        const topCategories = Object.entries(categoryTotals)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3);

        if (topCategories.length > 0) {
          response += "🏷️ **Top Spending Categories**:\n";
          topCategories.forEach(([category, amount], index) => {
            response += `${index + 1}. ${category}: $${amount.toFixed(2)}\n`;
          });
        }
      }
    } else if (query.includes('income')) {
      const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
      response += `💵 **Total Income**: $${totalIncome.toFixed(2)}\n`;
      response += `📊 **Number of Income Transactions**: ${income.length}\n`;
    } else {
      response += `💰 **Total Amount**: $${total.toFixed(2)}\n`;
      response += `📊 **Total Transactions**: ${transactions.length}\n`;
    }

    return response;
  }

  private getCategoryTotals(transactions: any[]): Record<string, number> {
    return transactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);
  }

  private generateContextualInsights(transactions: any[], budgets: any[], query: string): string {
    let insights = "💡 **Financial Insights**:\n\n";

    // Recent spending analysis
    const recentTransactions = transactions.slice(0, 10);
    const totalSpent = recentTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    insights += `📊 Based on your recent ${recentTransactions.length} transactions:\n`;
    insights += `💸 Total spent: $${totalSpent.toFixed(2)}\n\n`;

    // Category analysis
    const categoryTotals = this.getCategoryTotals(recentTransactions.filter(t => t.amount < 0));
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    if (topCategory) {
      insights += `🏆 Your biggest spending category: **${topCategory[0]}** ($${topCategory[1].toFixed(2)})\n\n`;
    }

    // Budget comparison
    if (budgets.length > 0) {
      insights += "📋 **Budget Status**:\n";
      budgets.forEach(budget => {
        const categorySpending = categoryTotals[budget.category] || 0;
        const percentage = (categorySpending / budget.amount) * 100;
        
        if (percentage > 100) {
          insights += `⚠️ ${budget.category}: Over budget by $${(categorySpending - budget.amount).toFixed(2)}\n`;
        } else if (percentage > 80) {
          insights += `⚡ ${budget.category}: ${percentage.toFixed(1)}% of budget used\n`;
        } else {
          insights += `✅ ${budget.category}: On track (${percentage.toFixed(1)}% used)\n`;
        }
      });
    }

    return insights;
  }

  private generateBudgetAdvice(budgets: any[], transactions: any[], query: string): string {
    let advice = "💡 **Budget & Savings Advice**:\n\n";

    if (budgets.length === 0) {
      advice += "🎯 **Get Started**: I notice you haven't set up any budgets yet. Creating budgets is a great first step to manage your finances better.\n\n";
      advice += "📋 **Recommendation**: Start by setting monthly budgets for your main spending categories like food, transportation, and entertainment.\n\n";
    }

    // Analyze recent spending patterns
    const monthlySpending = this.getCategoryTotals(transactions.filter(t => t.amount < 0));
    
    if (Object.keys(monthlySpending).length > 0) {
      advice += "📊 **Spending Pattern Analysis**:\n";
      
      const sortedSpending = Object.entries(monthlySpending)
        .sort(([,a], [,b]) => b - a);

      sortedSpending.slice(0, 3).forEach(([category, amount], index) => {
        advice += `${index + 1}. ${category}: $${amount.toFixed(2)}\n`;
      });

      advice += "\n💡 **Personalized Tips**:\n";
      
      // Generate specific advice based on spending
      if (monthlySpending['Food'] > 500) {
        advice += "🍽️ Consider meal planning to reduce food expenses\n";
      }
      if (monthlySpending['Entertainment'] > 300) {
        advice += "🎬 Look for free or low-cost entertainment alternatives\n";
      }
      if (monthlySpending['Shopping'] > 400) {
        advice += "🛍️ Try the 24-hour rule before making non-essential purchases\n";
      }
    }

    return advice;
  }
}

// Export singleton instance
export const enhancedAICommands = EnhancedAICommands.getInstance();