import { clientFinanceNewsService } from './client-finance-news-service';

/**
 * Client-side Enhanced AI command handler - Simplified version to avoid Puppeteer conflicts
 */
export class ClientEnhancedAICommands {
  private static instance: ClientEnhancedAICommands;

  static getInstance(): ClientEnhancedAICommands {
    if (!ClientEnhancedAICommands.instance) {
      ClientEnhancedAICommands.instance = new ClientEnhancedAICommands();
    }
    return ClientEnhancedAICommands.instance;
  }

  /**
   * Process user query with context-aware responses
   */
  async processQuery(userId: string, query: string): Promise<string | null> {
    try {
      const lowerQuery = query.toLowerCase();

      // News and market queries
      if (this.isNewsQuery(lowerQuery)) {
        return await this.handleNewsQuery(lowerQuery);
      }

      // Financial data queries - now handles ANY finance-related question
      if (this.isDataQuery(lowerQuery) || this.isFinanceRelated(lowerQuery)) {
        return await this.handleFinancialDataQuery(userId, query);
      }

      return null; // Not a recognized query type
    } catch (error) {
      console.error('Error processing query:', error);
      return null;
    }
  }
  
  /**
   * Detect if query is finance-related using broader patterns
   */
  private isFinanceRelated(query: string): boolean {
    const financePatterns = [
      // Common question patterns
      /\b(what|how|when|where|why|which)\b.*\b(money|financial|finance|cash|dollar|cent)\b/i,
      /\b(can you|could you|would you)\b.*\b(help|tell|show|explain)\b.*\b(financial|money|budget|spending)\b/i,
      /\b(my|our)\b.*\b(money|finances|budget|spending|income|expenses|account|balance)\b/i,
      /\b(help me|assist me)\b.*\b(financial|money|budget)\b/i,
      
      // Financial verbs
      /\b(spend|spent|buy|bought|purchase|purchased|pay|paid|earn|earned|save|saved|invest|invested)\b/i,
      
      // Financial nouns
      /\b(transaction|transactions|payment|payments|bill|bills|receipt|receipts|purchase|purchases)\b/i,
      /\b(salary|wage|wages|paycheck|bonus|allowance|refund|refunds|dividend|dividends)\b/i,
      /\b(loan|loans|debt|debts|credit|mortgage|rent|insurance|tax|taxes)\b/i,
      
      // Money-related amounts
      /\$\d+/,
      /\b\d+\s*(dollar|dollars|cent|cents|buck|bucks)\b/i,
      
      // Financial concepts
      /\b(net worth|cash flow|savings rate|financial health|credit score|investment|portfolio)\b/i,
      /\b(emergency fund|retirement|401k|ira|roth|stocks|bonds|mutual fund)\b/i,
      
      // Time + money context
      /\b(monthly|weekly|daily|yearly|annual)\b.*\b(expenses|income|budget|spending|savings)\b/i,
      
      // Comparative financial questions
      /\b(more|less|most|least|biggest|smallest|highest|lowest)\b.*\b(expense|income|category|spending)\b/i
    ];
    
    return financePatterns.some(pattern => pattern.test(query));
  }

  private isDataQuery(query: string): boolean {
    const dataKeywords = [
      // Basic financial terms
      'spending', 'expenses', 'budget', 'transactions', 'balance', 'income', 'savings',
      'categories', 'total spent', 'monthly', 'current balance', 'account balance',
      'financial status', 'money', 'cost', 'price', 'pay', 'paid', 'earn', 'earned',
      // Natural language patterns
      'how much', 'what did i', 'where did', 'show me', 'tell me about',
      'what is my', 'what are my', 'how many', 'when did i', 'which',
      // Question words + financial context
      'what.*spend', 'what.*buy', 'what.*cost', 'how.*money', 'where.*money',
      'which.*expensive', 'what.*income', 'how.*budget', 'what.*save',
      // Specific queries
      'biggest expense', 'largest', 'most expensive', 'cheapest', 'least expensive',
      'this week', 'this month', 'last month', 'this year', 'last year',
      'recent', 'latest', 'today', 'yesterday', 'past', 'history',
      // Financial health
      'financial health', 'net worth', 'debt', 'credit', 'assets', 'liabilities',
      'cash flow', 'profit', 'loss', 'surplus', 'deficit',
      // Goals and planning
      'goals', 'target', 'plan', 'forecast', 'projection', 'future', 'retirement',
      'emergency fund', 'rainy day', 'vacation fund', 'car fund', 'house fund'
    ];
    
    // Check for any financial keyword or question pattern
    return dataKeywords.some(keyword => {
      if (keyword.includes('.*')) {
        // Use regex for pattern matching
        const regex = new RegExp(keyword, 'i');
        return regex.test(query);
      }
      return query.toLowerCase().includes(keyword.toLowerCase());
    });
  }

  private async handleFinancialDataQuery(userId: string, query: string): Promise<string> {
    try {
      // Import supabase client to fetch user data
      const { supabase } = await import('./supabase');
      
      // Fetch all user's financial data upfront for comprehensive analysis
      const [transactionsResult, budgetsResult] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('budgets').select('*').eq('user_id', userId)
      ]);
      
      const transactions = transactionsResult.data || [];
      const budgets = budgetsResult.data || [];
      
      if (transactions.length === 0) {
        return "I don't see any financial data in your account yet. Please add some transactions to get personalized insights and answers to your questions!";
      }
      
      // Use AI to analyze the query and provide intelligent response
      return await this.analyzeQueryWithAI(userId, query, transactions, budgets);
      
    } catch (error) {
      console.error('Error handling financial data query:', error);
      return "I'm having trouble accessing your financial data right now. Please try again later.";
    }
  }



  
  private async analyzeQueryWithAI(userId: string, query: string, transactions: any[], budgets: any[]): Promise<string> {
    try {
      // Calculate comprehensive financial metrics
      const financialData = this.calculateFinancialMetrics(transactions, budgets);
      
      // Create a detailed prompt for the AI to analyze the user's query
      const prompt = `You are an intelligent financial assistant with complete access to the user's financial data. Your role is to understand their natural language questions and provide personalized, data-driven answers.

USER'S COMPLETE FINANCIAL PROFILE:
${JSON.stringify(financialData, null, 2)}

RECENT TRANSACTIONS SAMPLE:
${JSON.stringify(transactions.slice(0, 15).map(t => ({
  date: t.date,
  amount: t.amount,
  type: t.type,
  category: t.category || 'Uncategorized',
  description: t.description || 'No description'
})), null, 2)}

USER'S NATURAL LANGUAGE QUERY: "${query}"

YOUR TASK:
1. **Understand the Intent**: Parse what the user is really asking, even if they use casual or imprecise language
2. **Use Real Data**: Always reference their actual numbers, not hypothetical examples
3. **Be Conversational**: Respond naturally, as if you're a knowledgeable friend who has access to their financial records
4. **Provide Context**: Explain not just the numbers but what they mean for the user
5. **Give Actionable Advice**: When appropriate, suggest specific steps they can take
6. **Handle Ambiguity**: If the question could mean multiple things, address the most likely interpretations
7. **Use Their Data**: Calculate percentages, trends, comparisons using their actual transactions
8. **Be Encouraging**: Frame insights positively while being honest about their financial situation

EXAMPLES OF HOW TO HANDLE NATURAL LANGUAGE:
- "How much did I blow on food last month?" → Calculate food spending for the previous month
- "Am I spending too much?" → Compare their spending to income and provide analysis
- "What's my biggest money drain?" → Identify the highest expense category
- "Can I afford a vacation?" → Analyze their savings capacity and current financial health
- "Where does all my money go?" → Break down spending by category with percentages

Provide a comprehensive, personalized response using their actual financial data. Be specific with numbers, dates, and calculations.`;

      // Use the main AI system to generate the response
      const { chatWithAI } = await import('./ai');
      const response = await chatWithAI(userId, [{ role: 'user', content: prompt }]);
      
      return response || this.getDirectFinancialAnswer(query, transactions, budgets);
      
    } catch (error) {
      console.error('Error analyzing query with AI:', error);
      // Fallback to direct analysis
      return this.getDirectFinancialAnswer(query, transactions, budgets);
    }
  }
  
  private calculateFinancialMetrics(transactions: any[], budgets: any[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate totals
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netWorth = totalIncome - totalExpenses;
    
    // Current month data
    const thisMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
    
    const monthlyIncome = thisMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const monthlyExpenses = thisMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Category breakdown
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const category = t.category || 'Other';
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
    
    const incomeByCategory = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        const category = t.category || 'Other';
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
    
    // Budget analysis
    const budgetAnalysis = budgets.map(budget => {
      const spent = thisMonthTransactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return {
        category: budget.category,
        budgeted: budget.amount,
        spent: spent,
        remaining: budget.amount - spent,
        percentUsed: budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      };
    });
    
    // Recent transactions
    const recentTransactions = transactions.slice(0, 10).map(t => ({
      date: t.date,
      amount: t.amount,
      category: t.category,
      description: t.description,
      type: t.type
    }));
    
    return {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpenses,
      netWorth,
      currentBalance: netWorth,
      monthlyIncome,
      monthlyExpenses,
      monthlyNet: monthlyIncome - monthlyExpenses,
      expensesByCategory,
      incomeByCategory,
      budgetAnalysis,
      recentTransactions,
      activeBudgets: budgets.length,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    };
  }
  
  private getDirectFinancialAnswer(query: string, transactions: any[], budgets: any[]): string {
    const lowerQuery = query.toLowerCase();
    const financialData = this.calculateFinancialMetrics(transactions, budgets);
    
    if (/\b(balance|worth|have|got|left|current)\b/i.test(lowerQuery)) {
      return this.getBalanceResponse(financialData);
    }
    
    if (/\b(spend|spent|blow|waste|cost|expense|buy|bought|purchase)\b/i.test(lowerQuery)) {
      return this.getSpendingResponse(financialData);
    }
    
    if (/\b(income|earn|earned|make|made|salary|wage|money coming in|revenue)\b/i.test(lowerQuery)) {
      return this.getIncomeResponse(financialData);
    }
    
    if (/\b(budget|budgeting|plan|allowance|limit)\b/i.test(lowerQuery)) {
      return this.getBudgetResponse(financialData, budgets);
    }
    
    return this.getComprehensiveOverview(financialData, budgets);
  }
  
  private getBalanceResponse(financialData: any): string {
    const status = financialData.currentBalance >= 0 ? 'positive' : 'negative';
    const emoji = financialData.currentBalance >= 0 ? '💰' : '🚨';
    
    return `${emoji} **Current Balance: ${financialData.currentBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}**\n\nYou have a ${status} balance calculated from ${financialData.totalTransactions} transactions:\n• Total Income: ${financialData.totalIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n• Total Expenses: ${financialData.totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n\n💡 This represents your net financial position based on all recorded transactions.`;
  }
  
  private getSpendingResponse(financialData: any): string {
    const topCategories = Object.entries(financialData.expensesByCategory)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([cat, amt], index) => {
        const emoji = this.getCategoryEmoji(index);
        return `${emoji} ${cat}: ${(amt as number).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
      })
      .join('\n');
    
    const monthlyPercent = financialData.monthlyIncome > 0 ? (financialData.monthlyExpenses / financialData.monthlyIncome * 100) : 0;
    
    return `📊 **Your Spending Breakdown**\n\n**This Month:** ${financialData.monthlyExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} (${monthlyPercent.toFixed(1)}% of income)\n**All Time:** ${financialData.totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n\n**Where your money goes:**\n${topCategories}\n\n💡 Your biggest expense category is where you might find savings opportunities!`;
  }
  
  private getIncomeResponse(financialData: any): string {
    const monthlyRate = financialData.savingsRate;
    const status = this.getSavingsRateStatus(monthlyRate);
    const encouragement = monthlyRate > 0 ? 'Great job saving money!' : 'Consider reviewing your expenses to improve your savings rate.';
    
    return `💵 **Income Analysis**\n\n**This Month:** ${financialData.monthlyIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n**All Time:** ${financialData.totalIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n**Savings Rate:** ${financialData.savingsRate.toFixed(1)}% (${status})\n\n💡 ${encouragement}`;
  }
  
  private getBudgetResponse(financialData: any, budgets: any[]): string {
    if (budgets.length === 0) {
      return "📋 **No Budgets Found**\n\nYou don't have any budgets set up yet. Creating budgets helps you:\n• Control your spending\n• Reach your financial goals\n• Identify overspending areas\n\n💡 Start by setting budgets for your top expense categories!";
    }
    
    const overBudget = financialData.budgetAnalysis.filter((b: any) => b.percentUsed > 100);
    const nearLimit = financialData.budgetAnalysis.filter((b: any) => b.percentUsed > 80 && b.percentUsed <= 100);
    
    const budgetStatus = financialData.budgetAnalysis
      .map((b: any) => {
        const emoji = this.getBudgetEmoji(b.percentUsed);
        return `${emoji} ${b.category}: ${b.spent.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}/${b.budgeted.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} (${b.percentUsed.toFixed(1)}%)`;
      })
      .join('\n');
    
    const summary = this.getBudgetSummary(overBudget.length, nearLimit.length);
    
    return `📋 **Budget Status**\n\n${summary}\n\n${budgetStatus}`;
  }
  
  private getComprehensiveOverview(financialData: any, budgets: any[]): string {
    const healthScore = this.getHealthScore(financialData.savingsRate);
    
    return `📈 **Your Complete Financial Picture**\n\n**Current Balance:** ${financialData.currentBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n**Financial Health:** ${healthScore}\n\n**This Month:**\n• Income: ${financialData.monthlyIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n• Expenses: ${financialData.monthlyExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n• Net: ${financialData.monthlyNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n• Savings Rate: ${financialData.savingsRate.toFixed(1)}%\n\n**Quick Stats:**\n• Total Transactions: ${financialData.totalTransactions}\n• Active Budgets: ${budgets.length}\n\n💬 **I can answer any question about your finances! Try asking me things like:**\n• "What did I spend on groceries last month?"\n• "Am I saving enough money?"\n• "What's my biggest expense?"\n• "Can I afford to spend $500 on something?"`;
  }
  
  private getCategoryEmoji(index: number): string {
    if (index === 0) return '🔥';
    if (index < 3) return '📈';
    return '💵';
  }
  
  private getSavingsRateStatus(rate: number): string {
    if (rate > 20) return 'excellent';
    if (rate > 10) return 'good';
    if (rate > 0) return 'okay';
    return 'concerning';
  }
  
  private getBudgetEmoji(percentUsed: number): string {
    if (percentUsed > 100) return '🚨';
    if (percentUsed > 80) return '⚠️';
    return '✅';
  }
  
  private getBudgetSummary(overBudgetCount: number, nearLimitCount: number): string {
    if (overBudgetCount > 0) {
      return `🚨 You're over budget in ${overBudgetCount} categories!`;
    }
    if (nearLimitCount > 0) {
      return `⚠️ You're close to the limit in ${nearLimitCount} categories.`;
    }
    return '✅ All budgets are on track - great job!';
  }
  
  private getHealthScore(savingsRate: number): string {
    if (savingsRate > 20) return 'Excellent';
    if (savingsRate > 10) return 'Good';
    if (savingsRate > 0) return 'Fair';
    return 'Needs Improvement';
  }

  private isNewsQuery(query: string): boolean {
    const newsKeywords = [
      'news', 'market', 'stock', 'economy', 'finance news',
      'latest news', 'business news', 'financial updates'
    ];
    return newsKeywords.some(keyword => query.includes(keyword));
  }

  private async handleNewsQuery(query: string): Promise<string> {
    try {
      const articles = await clientFinanceNewsService.getFinanceNews();

      if (articles.length === 0) {
        return "I'm currently unable to fetch the latest financial news. Please try again later.";
      }

      // Search for specific topics if mentioned in query
      let relevantArticles = articles;
      
      if (query.includes('stock')) {
        relevantArticles = articles.filter(a => 
          a.title.toLowerCase().includes('stock') || 
          a.summary.toLowerCase().includes('stock')
        );
      } else if (query.includes('market')) {
        relevantArticles = articles.filter(a => 
          a.title.toLowerCase().includes('market') || 
          a.summary.toLowerCase().includes('market')
        );
      }

      if (relevantArticles.length === 0) {
        relevantArticles = articles.slice(0, 3); // Fallback to top 3 articles
      }

      const newsResponse = relevantArticles.slice(0, 3).map(article => 
        `📰 **${article.title}**\n${article.summary}\n*Source: ${article.source}*`
      ).join('\n\n');

      return `Here are the latest financial news updates:\n\n${newsResponse}`;

    } catch (error) {
      console.error('News query error:', error);
      return "I'm having trouble fetching the latest news right now. Please try again later.";
    }
  }
}

// Export singleton instance
export const clientEnhancedAICommands = ClientEnhancedAICommands.getInstance();