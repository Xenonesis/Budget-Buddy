import { 
  getUserFinancialProfile, 
  analyzeSpendingPatterns,
  calculateFinancialHealth,
  generateBudgetRecommendations
} from './ai-financial-context';
import { chatWithAI, type AIMessage } from './ai';

/**
 * Specialized AI financial commands for different scenarios
 */

export interface FinancialCommand {
  name: string;
  description: string;
  keywords: string[];
  handler: (userId: string, userMessage: string) => Promise<string>;
}

/**
 * Analyzes user's spending patterns and provides detailed insights
 */
async function analyzeSpendingCommand(userId: string, userMessage: string): Promise<string> {
  const profile = await getUserFinancialProfile(userId);
  if (!profile) {
    return "I couldn't access your financial data to analyze your spending patterns. Please ensure you have transactions recorded in your account.";
  }

  const analysis = analyzeSpendingPatterns(profile);
  
  const prompt = `Based on my spending analysis, provide detailed insights and actionable recommendations:

${analysis.analysis}

Key Recommendations Needed:
${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

Risk Factors Identified:
${analysis.riskFactors.map(risk => `- ${risk}`).join('\n')}

User's Question: ${userMessage}

Please provide a comprehensive but easy-to-understand response with specific action items.`;

  const messages: AIMessage[] = [
    { role: 'user', content: prompt }
  ];

  return await chatWithAI(userId, messages) || "I couldn't generate spending analysis at this time.";
}

/**
 * Creates a personalized budget plan based on user's financial situation
 */
async function createBudgetPlanCommand(userId: string, userMessage: string): Promise<string> {
  const profile = await getUserFinancialProfile(userId);
  if (!profile) {
    return "I need access to your financial data to create a budget plan. Please add some transactions first.";
  }

  const budgetRecommendations = generateBudgetRecommendations(profile);
  
  const prompt = `Create a personalized budget plan based on my financial data:

CURRENT FINANCIAL SITUATION:
- Monthly Income: ~${profile.currency}${(profile.totalIncome / 3).toLocaleString()}
- Monthly Expenses: ~${profile.currency}${(profile.totalExpenses / 3).toLocaleString()}
- Current Savings Rate: ${profile.savingsRate.toFixed(1)}%

RECOMMENDED BUDGET ALLOCATIONS:
${budgetRecommendations.recommendedBudgets.map(budget => 
  `- ${budget.category}: ${profile.currency}${budget.recommendedBudget} (currently ${profile.currency}${budget.currentSpending.toFixed(0)}) - ${budget.reasoning}`
).join('\n')}

PROJECTED SAVINGS: ${profile.currency}${budgetRecommendations.projectedSavings.toFixed(0)}/month

User's Specific Request: ${userMessage}

Please create a detailed, actionable budget plan with specific steps for implementation.`;

  const messages: AIMessage[] = [
    { role: 'user', content: prompt }
  ];

  return await chatWithAI(userId, messages) || "I couldn't generate a budget plan at this time.";
}

/**
 * Provides investment advice based on user's financial health and goals
 */
async function investmentAdviceCommand(userId: string, userMessage: string): Promise<string> {
  const profile = await getUserFinancialProfile(userId);
  if (!profile) {
    return "I need to understand your financial situation before providing investment advice. Please add your financial data first.";
  }

  const healthScore = calculateFinancialHealth(profile);
  
  const prompt = `Provide investment advice based on my financial profile:

FINANCIAL HEALTH SCORE: ${healthScore.score}/100 (Grade: ${healthScore.grade})

FINANCIAL FACTORS:
- Savings Rate: ${healthScore.factors.savingsRate.score}/100 (${healthScore.factors.savingsRate.status})
- Budget Management: ${healthScore.factors.budgetAdherence.score}/100 (${healthScore.factors.budgetAdherence.status})
- Debt Management: ${healthScore.factors.debtManagement.score}/100 (${healthScore.factors.debtManagement.status})
- Goal Progress: ${healthScore.factors.goalProgress.score}/100 (${healthScore.factors.goalProgress.status})

CURRENT SITUATION:
- Net Worth: ${profile.currency}${profile.netWorth.toLocaleString()}
- Monthly Savings: ${profile.currency}${((profile.totalIncome - profile.totalExpenses) / 3).toLocaleString()}
- Current Goals: ${profile.goals.length > 0 ? profile.goals.map(g => `${g.title} (${g.progress.toFixed(1)}% complete)`).join(', ') : 'No goals set'}

User's Investment Question: ${userMessage}

Provide personalized investment advice considering my financial health, risk tolerance, and current situation. Include specific recommendations for investment allocation and next steps.`;

  const messages: AIMessage[] = [
    { role: 'user', content: prompt }
  ];

  return await chatWithAI(userId, messages) || "I couldn't provide investment advice at this time.";
}

/**
 * Provides debt management and repayment strategies
 */
async function debtManagementCommand(userId: string, userMessage: string): Promise<string> {
  const profile = await getUserFinancialProfile(userId);
  if (!profile) {
    return "I need to see your financial information to help with debt management strategies.";
  }

  const prompt = `Help me with debt management strategies based on my financial situation:

FINANCIAL OVERVIEW:
- Net Worth: ${profile.currency}${profile.netWorth.toLocaleString()} ${profile.netWorth < 0 ? '(indicating debt)' : '(positive net worth)'}
- Monthly Income: ${profile.currency}${(profile.totalIncome / 3).toLocaleString()}
- Monthly Expenses: ${profile.currency}${(profile.totalExpenses / 3).toLocaleString()}
- Available for Debt Payment: ${profile.currency}${((profile.totalIncome - profile.totalExpenses) / 3).toLocaleString()}

TOP EXPENSE CATEGORIES (potential areas to reduce for debt payment):
${profile.spendingByCategory.slice(0, 5).map(cat => 
  `- ${cat.category}: ${profile.currency}${(cat.amount / 3).toLocaleString()}/month (${cat.percentage.toFixed(1)}% of expenses)`
).join('\n')}

User's Debt Question: ${userMessage}

Provide a comprehensive debt management strategy including:
1. Debt prioritization methods
2. Budget adjustments to free up money for debt payments
3. Specific action steps
4. Timeline considerations

Base your advice on my actual financial data and spending patterns.`;

  const messages: AIMessage[] = [
    { role: 'user', content: prompt }
  ];

  return await chatWithAI(userId, messages) || "I couldn't provide debt management advice at this time.";
}

/**
 * Helps set and track financial goals
 */
async function goalPlanningCommand(userId: string, userMessage: string): Promise<string> {
  const profile = await getUserFinancialProfile(userId);
  if (!profile) {
    return "I need to understand your financial situation to help with goal planning.";
  }

  const prompt = `Help me plan and achieve my financial goals based on my current situation:

CURRENT FINANCIAL CAPACITY:
- Monthly Savings Potential: ${profile.currency}${((profile.totalIncome - profile.totalExpenses) / 3).toLocaleString()}
- Current Savings Rate: ${profile.savingsRate.toFixed(1)}%

EXISTING GOALS:
${profile.goals.length > 0 
  ? profile.goals.map(goal => 
      `- ${goal.title}: ${profile.currency}${goal.currentAmount.toLocaleString()}/${profile.currency}${goal.targetAmount.toLocaleString()} (${goal.progress.toFixed(1)}% complete, due ${goal.deadline})`
    ).join('\n')
  : 'No goals currently set'
}

MONTHLY SPENDING PATTERN (areas where savings could be redirected):
${profile.spendingByCategory.slice(0, 5).map(cat => 
  `- ${cat.category}: ${profile.currency}${(cat.amount / 3).toLocaleString()}/month`
).join('\n')}

User's Goal Question: ${userMessage}

Please provide:
1. Realistic goal-setting advice based on my financial capacity
2. Specific savings strategies to reach goals faster
3. Timeline recommendations
4. Progress tracking suggestions

Make recommendations specific to my actual income and expense patterns.`;

  const messages: AIMessage[] = [
    { role: 'user', content: prompt }
  ];

  return await chatWithAI(userId, messages) || "I couldn't provide goal planning advice at this time.";
}

/**
 * Provides emergency fund guidance
 */
async function emergencyFundCommand(userId: string, userMessage: string): Promise<string> {
  const profile = await getUserFinancialProfile(userId);
  if (!profile) {
    return "I need to see your financial information to provide emergency fund guidance.";
  }

  const monthlyExpenses = profile.totalExpenses / 3;
  const recommendedEmergencyFund = monthlyExpenses * 6; // 6 months of expenses
  
  const prompt = `Provide emergency fund guidance based on my financial situation:

CURRENT FINANCIAL SITUATION:
- Monthly Expenses: ${profile.currency}${monthlyExpenses.toLocaleString()}
- Recommended Emergency Fund: ${profile.currency}${recommendedEmergencyFund.toLocaleString()} (6 months of expenses)
- Current Savings Rate: ${profile.savingsRate.toFixed(1)}%
- Monthly Savings Capacity: ${profile.currency}${((profile.totalIncome - profile.totalExpenses) / 3).toLocaleString()}

EXPENSE BREAKDOWN (what the emergency fund should cover):
${profile.spendingByCategory.filter(cat => ['Housing', 'Groceries', 'Utilities', 'Transportation', 'Healthcare', 'Insurance'].includes(cat.category))
  .map(cat => `- ${cat.category}: ${profile.currency}${(cat.amount / 3).toLocaleString()}/month`)
  .join('\n')}

User's Emergency Fund Question: ${userMessage}

Please provide:
1. Emergency fund size recommendation specific to my situation
2. Step-by-step plan to build the emergency fund
3. Best places to keep emergency funds
4. Timeline to reach the goal
5. How to balance emergency fund building with other financial priorities`;

  const messages: AIMessage[] = [
    { role: 'user', content: prompt }
  ];

  return await chatWithAI(userId, messages) || "I couldn't provide emergency fund guidance at this time.";
}

/**
 * Available financial commands
 */
export const FINANCIAL_COMMANDS: FinancialCommand[] = [
  {
    name: 'analyze_spending',
    description: 'Analyzes your spending patterns and provides detailed insights',
    keywords: ['analyze spending', 'spending analysis', 'spending patterns', 'where does my money go', 'expense analysis', 'spending habits'],
    handler: analyzeSpendingCommand
  },
  {
    name: 'create_budget',
    description: 'Creates a personalized budget plan based on your financial situation',
    keywords: ['create budget', 'budget plan', 'budgeting help', 'make a budget', 'budget recommendations', 'spending plan'],
    handler: createBudgetPlanCommand
  },
  {
    name: 'investment_advice',
    description: 'Provides investment guidance based on your financial health and goals',
    keywords: ['investment advice', 'investing', 'invest money', 'investment strategy', 'portfolio advice', 'stocks', 'bonds'],
    handler: investmentAdviceCommand
  },
  {
    name: 'debt_management',
    description: 'Offers debt repayment strategies and debt management advice',
    keywords: ['debt management', 'pay off debt', 'debt strategy', 'debt repayment', 'reduce debt', 'debt help'],
    handler: debtManagementCommand
  },
  {
    name: 'goal_planning',
    description: 'Helps set and achieve financial goals',
    keywords: ['financial goals', 'goal planning', 'savings goals', 'achieve goals', 'goal setting', 'financial planning'],
    handler: goalPlanningCommand
  },
  {
    name: 'emergency_fund',
    description: 'Provides emergency fund planning and guidance',
    keywords: ['emergency fund', 'emergency savings', 'rainy day fund', 'emergency money', 'financial security'],
    handler: emergencyFundCommand
  }
];

/**
 * Detects and handles specialized financial commands
 */
export async function handleFinancialCommand(userId: string, message: string): Promise<string | null> {
  const lowerMessage = message.toLowerCase();
  
  // Find matching command
  const matchedCommand = FINANCIAL_COMMANDS.find(command => 
    command.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))
  );
  
  if (matchedCommand) {
    console.log(`Detected financial command: ${matchedCommand.name}`);
    try {
      return await matchedCommand.handler(userId, message);
    } catch (error) {
      console.error(`Error executing financial command ${matchedCommand.name}:`, error);
      return `I encountered an error while processing your ${matchedCommand.description.toLowerCase()}. Please try again.`;
    }
  }
  
  return null; // No command matched
}

/**
 * Lists available financial commands
 */
export function getAvailableFinancialCommands(): string {
  return `I can help you with these specialized financial topics:

${FINANCIAL_COMMANDS.map(cmd => `💡 **${cmd.description}**
   Try saying: "${cmd.keywords[0]}"`).join('\n\n')}

Just ask me about any of these topics, and I'll provide personalized advice based on your actual financial data!`;
}