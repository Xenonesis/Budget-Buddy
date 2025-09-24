import { supabase } from './supabase';
import { 
  getUserFinancialProfile, 
  type UserFinancialProfile,
  calculateFinancialHealth 
} from './ai-financial-context';
import { type AIMessage } from './ai';

/**
 * Advanced AI Intelligence Features for Enhanced Personalization
 */

export interface UserPersonalityProfile {
  userId: string;
  spendingPersonality: 'saver' | 'spender' | 'balanced' | 'impulsive' | 'cautious';
  communicationStyle: 'detailed' | 'concise' | 'visual' | 'conversational';
  financialGoalsType: 'short-term' | 'long-term' | 'mixed' | 'none';
  riskTolerance: 'low' | 'medium' | 'high' | 'unknown';
  preferredAdviceType: 'actionable' | 'educational' | 'motivational' | 'analytical';
  interactionHistory: {
    totalInteractions: number;
    commonQuestions: string[];
    preferredTopics: string[];
    responseRatings: number[];
    lastInteractionDate: string;
  };
  learningPreferences: {
    prefersExamples: boolean;
    likesComparisons: boolean;
    wantsStepByStep: boolean;
    prefersVisualData: boolean;
  };
}

export interface ContextualMemory {
  conversationId: string;
  userId: string;
  topics: string[];
  keyPoints: string[];
  actionItemsDiscussed: string[];
  followUpNeeded: string[];
  userConcerns: string[];
  adviceGiven: string[];
  createdAt: string;
  lastUpdated: string;
}

export interface PredictiveInsight {
  type: 'spending_forecast' | 'budget_risk' | 'goal_timeline' | 'opportunity' | 'warning';
  title: string;
  description: string;
  confidence: number;
  timeframe: '1_week' | '1_month' | '3_months' | '6_months' | '1_year';
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedActions: string[];
  dataPoints: any[];
}

/**
 * Analyzes user's interaction patterns to build personality profile
 */
export async function buildUserPersonalityProfile(userId: string): Promise<UserPersonalityProfile> {
  try {
    // Fetch user's financial profile and interaction history
    const financialProfile = await getUserFinancialProfile(userId);
    
    // Get conversation history
    const { data: conversations } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false })
      .limit(50);

    // Get messages from recent conversations
    const { data: messages } = await supabase
      .from('ai_messages')
      .select('*')
      .in('conversation_id', (conversations || []).map(c => c.id))
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200);

    const profile = analyzePersonalityFromData(userId, financialProfile, conversations || [], messages || []);
    
    // Store the profile
    await supabase
      .from('user_personality_profiles')
      .upsert(profile, { onConflict: 'user_id' });

    return profile;
  } catch (error) {
    console.error('Error building personality profile:', error);
    return getDefaultPersonalityProfile(userId);
  }
}

/**
 * Analyzes user data to determine personality traits
 */
function analyzePersonalityFromData(
  userId: string, 
  financialProfile: UserFinancialProfile | null,
  conversations: any[],
  messages: any[]
): UserPersonalityProfile {
  const userMessages = messages.filter(m => m.role === 'user');
  
  // Analyze spending personality
  let spendingPersonality: UserPersonalityProfile['spendingPersonality'] = 'balanced';
  if (financialProfile) {
    const savingsRate = financialProfile.savingsRate;
    const budgetAdherence = financialProfile.budgets.filter(b => b.status === 'under').length / Math.max(financialProfile.budgets.length, 1);
    
    if (savingsRate > 25 && budgetAdherence > 0.8) spendingPersonality = 'saver';
    else if (savingsRate < 5 && budgetAdherence < 0.5) spendingPersonality = 'spender';
    else if (financialProfile.insights.unusualSpending.length > 2) spendingPersonality = 'impulsive';
    else if (financialProfile.budgets.length > 5 && budgetAdherence > 0.7) spendingPersonality = 'cautious';
  }

  // Analyze communication style from message patterns
  let communicationStyle: UserPersonalityProfile['communicationStyle'] = 'conversational';
  if (userMessages.length > 0) {
    const avgMessageLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
    const hasDataRequests = userMessages.some(m => /show|display|chart|graph|numbers/.test(m.content.toLowerCase()));
    
    if (avgMessageLength < 50) communicationStyle = 'concise';
    else if (avgMessageLength > 150) communicationStyle = 'detailed';
    else if (hasDataRequests) communicationStyle = 'visual';
  }

  // Analyze financial goals type
  let financialGoalsType: UserPersonalityProfile['financialGoalsType'] = 'mixed';
  if (financialProfile?.goals) {
    const goals = financialProfile.goals;
    const shortTermGoals = goals.filter(g => new Date(g.deadline) < new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
    const longTermGoals = goals.filter(g => new Date(g.deadline) >= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
    
    if (shortTermGoals.length > longTermGoals.length * 2) financialGoalsType = 'short-term';
    else if (longTermGoals.length > shortTermGoals.length * 2) financialGoalsType = 'long-term';
    else if (goals.length === 0) financialGoalsType = 'none';
  }

  // Determine risk tolerance from financial behavior
  let riskTolerance: UserPersonalityProfile['riskTolerance'] = 'medium';
  if (financialProfile) {
    const healthScore = calculateFinancialHealth(financialProfile);
    const hasEmergencyFund = financialProfile.netWorth > (financialProfile.totalExpenses / 3) * 3;
    const budgetBuffer = financialProfile.budgets.filter(b => b.percentage < 80).length / Math.max(financialProfile.budgets.length, 1);
    
    if (healthScore.score > 80 && hasEmergencyFund && budgetBuffer > 0.7) riskTolerance = 'high';
    else if (healthScore.score < 60 || !hasEmergencyFund) riskTolerance = 'low';
  }

  // Analyze preferred advice type from interaction patterns
  let preferredAdviceType: UserPersonalityProfile['preferredAdviceType'] = 'actionable';
  const actionWords = userMessages.filter(m => /help|how to|should i|what can|steps|plan/.test(m.content.toLowerCase()));
  const educationalWords = userMessages.filter(m => /explain|understand|learn|why|what is/.test(m.content.toLowerCase()));
  const analyticalWords = userMessages.filter(m => /analyze|compare|calculate|data|statistics/.test(m.content.toLowerCase()));
  
  if (educationalWords.length > actionWords.length && educationalWords.length > analyticalWords.length) {
    preferredAdviceType = 'educational';
  } else if (analyticalWords.length > actionWords.length) {
    preferredAdviceType = 'analytical';
  }

  // Common questions and topics
  const commonQuestions = extractCommonQuestions(userMessages);
  const preferredTopics = extractPreferredTopics(userMessages);

  return {
    userId,
    spendingPersonality,
    communicationStyle,
    financialGoalsType,
    riskTolerance,
    preferredAdviceType,
    interactionHistory: {
      totalInteractions: messages.length,
      commonQuestions,
      preferredTopics,
      responseRatings: [], // Would need rating system
      lastInteractionDate: messages[0]?.created_at || new Date().toISOString()
    },
    learningPreferences: {
      prefersExamples: userMessages.some(m => /example|show me|for instance/.test(m.content.toLowerCase())),
      likesComparisons: userMessages.some(m => /compare|versus|vs|better than/.test(m.content.toLowerCase())),
      wantsStepByStep: userMessages.some(m => /step|guide|process|how to/.test(m.content.toLowerCase())),
      prefersVisualData: userMessages.some(m => /chart|graph|visual|show|display/.test(m.content.toLowerCase()))
    }
  };
}

/**
 * Extracts common question patterns
 */
function extractCommonQuestions(messages: any[]): string[] {
  const questions = messages
    .map(m => m.content.toLowerCase())
    .filter(content => content.includes('?') || /^(how|what|why|when|where|should|can|will)/.test(content));
  
  // Group similar questions
  const questionPatterns: Record<string, number> = {};
  questions.forEach(q => {
    const pattern = q.replace(/\d+/g, 'X').replace(/[a-z]+ \w+/g, 'category').substring(0, 50);
    questionPatterns[pattern] = (questionPatterns[pattern] || 0) + 1;
  });

  return Object.entries(questionPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pattern]) => pattern);
}

/**
 * Extracts preferred topics from messages
 */
function extractPreferredTopics(messages: any[]): string[] {
  const topics = ['budget', 'saving', 'investment', 'debt', 'goal', 'spending', 'income', 'expense'];
  const topicCounts: Record<string, number> = {};
  
  messages.forEach(message => {
    const content = message.content.toLowerCase();
    topics.forEach(topic => {
      if (content.includes(topic)) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    });
  });

  return Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);
}

/**
 * Generates predictive financial insights based on historical patterns
 */
export async function generatePredictiveInsights(userId: string): Promise<PredictiveInsight[]> {
  try {
    const financialProfile = await getUserFinancialProfile(userId);
    if (!financialProfile) return [];

    const insights: PredictiveInsight[] = [];

    // Spending forecast based on trends
    const spendingForecast = generateSpendingForecast(financialProfile);
    if (spendingForecast) insights.push(spendingForecast);

    // Budget risk assessment
    const budgetRisks = generateBudgetRiskInsights(financialProfile);
    insights.push(...budgetRisks);

    // Goal timeline predictions
    const goalInsights = generateGoalTimelineInsights(financialProfile);
    insights.push(...goalInsights);

    // Opportunity detection
    const opportunities = detectFinancialOpportunities(financialProfile);
    insights.push(...opportunities);

    return insights.slice(0, 8); // Limit to top 8 insights
  } catch (error) {
    console.error('Error generating predictive insights:', error);
    return [];
  }
}

/**
 * Generates spending forecast based on historical trends
 */
function generateSpendingForecast(profile: UserFinancialProfile): PredictiveInsight | null {
  const trendingUp = profile.spendingByCategory.filter(cat => cat.trend === 'increasing');
  if (trendingUp.length === 0) return null;

  const totalIncrease = trendingUp.reduce((sum, cat) => sum + cat.amount * 0.1, 0); // 10% increase assumption
  
  return {
    type: 'spending_forecast',
    title: 'Spending Increase Predicted',
    description: `Based on current trends, your spending may increase by ${profile.currency}${totalIncrease.toLocaleString()} next month. Categories trending up: ${trendingUp.map(c => c.category).join(', ')}.`,
    confidence: 0.75,
    timeframe: '1_month',
    impact: totalIncrease > profile.totalExpenses * 0.1 ? 'high' : 'medium',
    actionable: true,
    suggestedActions: [
      `Review ${trendingUp[0].category} spending patterns`,
      'Set stricter budgets for trending categories',
      'Consider automatic spending alerts'
    ],
    dataPoints: trendingUp
  };
}

/**
 * Generates budget risk insights
 */
function generateBudgetRiskInsights(profile: UserFinancialProfile): PredictiveInsight[] {
  const insights: PredictiveInsight[] = [];
  
  profile.budgets.forEach(budget => {
    if (budget.percentage > 85 && budget.percentage < 100) {
      insights.push({
        type: 'budget_risk',
        title: `${budget.category} Budget Risk`,
        description: `You've used ${budget.percentage.toFixed(1)}% of your ${budget.category} budget. At current pace, you'll exceed it by month-end.`,
        confidence: 0.85,
        timeframe: '1_week',
        impact: 'medium',
        actionable: true,
        suggestedActions: [
          `Reduce ${budget.category} spending by ${profile.currency}${Math.round((budget.spentAmount - budget.budgetAmount * 0.8))}`,
          'Track daily spending in this category',
          'Consider finding alternatives'
        ],
        dataPoints: [budget]
      });
    }
  });

  return insights;
}

/**
 * Generates goal timeline insights
 */
function generateGoalTimelineInsights(profile: UserFinancialProfile): PredictiveInsight[] {
  return profile.goals.map(goal => {
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const monthlySavings = (profile.totalIncome - profile.totalExpenses) / 3;
    const monthsNeeded = Math.ceil(remainingAmount / Math.max(monthlySavings, 1));
    const goalDate = new Date(goal.deadline);
    const monthsAvailable = Math.ceil((goalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
    
    const onTrack = monthsNeeded <= monthsAvailable;
    
    return {
      type: 'goal_timeline',
      title: `${goal.title} Timeline ${onTrack ? 'On Track' : 'Behind'}`,
      description: onTrack 
        ? `You're on track to reach ${goal.title} by ${goal.deadline}. Continue saving ${profile.currency}${monthlySavings.toLocaleString()}/month.`
        : `${goal.title} needs ${profile.currency}${Math.round((remainingAmount / monthsAvailable) - monthlySavings)} more per month to reach on time.`,
      confidence: 0.9,
      timeframe: monthsAvailable > 6 ? '6_months' : '3_months',
      impact: onTrack ? 'low' : 'high',
      actionable: !onTrack,
      suggestedActions: onTrack ? [] : [
        `Increase monthly savings by ${profile.currency}${Math.round((remainingAmount / monthsAvailable) - monthlySavings)}`,
        'Review and adjust other spending categories',
        'Consider extending the timeline or reducing the target'
      ],
      dataPoints: [goal]
    };
  });
}

/**
 * Detects financial opportunities
 */
function detectFinancialOpportunities(profile: UserFinancialProfile): PredictiveInsight[] {
  const opportunities: PredictiveInsight[] = [];
  
  // High savings rate opportunity
  if (profile.savingsRate > 30) {
    opportunities.push({
      type: 'opportunity',
      title: 'Investment Opportunity',
      description: `With a ${profile.savingsRate.toFixed(1)}% savings rate, you have ${profile.currency}${Math.round((profile.totalIncome - profile.totalExpenses) / 3)} monthly surplus that could be invested for long-term growth.`,
      confidence: 0.8,
      timeframe: '3_months',
      impact: 'high',
      actionable: true,
      suggestedActions: [
        'Consider opening an investment account',
        'Research low-cost index funds',
        'Automate monthly investments'
      ],
      dataPoints: []
    });
  }

  // Category optimization opportunity
  const optimizableCategory = profile.spendingByCategory.find(cat => cat.percentage > 20 && !['Housing', 'Rent'].includes(cat.category));
  if (optimizableCategory) {
    opportunities.push({
      type: 'opportunity',
      title: `${optimizableCategory.category} Optimization`,
      description: `${optimizableCategory.category} represents ${optimizableCategory.percentage.toFixed(1)}% of your expenses. Even a 15% reduction could save ${profile.currency}${Math.round(optimizableCategory.amount * 0.15)} over 3 months.`,
      confidence: 0.7,
      timeframe: '1_month',
      impact: 'medium',
      actionable: true,
      suggestedActions: [
        `Track ${optimizableCategory.category} spending daily`,
        'Find cost-effective alternatives',
        'Set a reduction target'
      ],
      dataPoints: [optimizableCategory]
    });
  }

  return opportunities;
}

/**
 * Creates contextual memory for conversations
 */
export async function createContextualMemory(
  conversationId: string,
  userId: string,
  messages: AIMessage[]
): Promise<void> {
  try {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    const topics = extractTopicsFromMessages(messages);
    const keyPoints = extractKeyPoints(assistantMessages);
    const actionItems = extractActionItems(assistantMessages);
    const concerns = extractUserConcerns(userMessages);
    const adviceGiven = extractAdviceGiven(assistantMessages);
    
    const memory: ContextualMemory = {
      conversationId,
      userId,
      topics,
      keyPoints,
      actionItemsDiscussed: actionItems,
      followUpNeeded: generateFollowUpItems(topics, actionItems),
      userConcerns: concerns,
      adviceGiven,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    await supabase
      .from('contextual_memory')
      .upsert(memory, { onConflict: 'conversation_id' });
      
  } catch (error) {
    console.error('Error creating contextual memory:', error);
  }
}

/**
 * Helper functions for context extraction
 */
function extractTopicsFromMessages(messages: AIMessage[]): string[] {
  const topicKeywords = ['budget', 'savings', 'investment', 'debt', 'goal', 'spending', 'income', 'expense', 'emergency fund'];
  const topics = new Set<string>();
  
  messages.forEach(message => {
    topicKeywords.forEach(keyword => {
      if (message.content.toLowerCase().includes(keyword)) {
        topics.add(keyword);
      }
    });
  });
  
  return Array.from(topics);
}

function extractKeyPoints(messages: AIMessage[]): string[] {
  return messages.flatMap(message => {
    const sentences = message.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.filter(s => 
      /save|reduce|increase|improve|recommend|suggest|consider/.test(s.toLowerCase())
    ).slice(0, 2);
  }).slice(0, 5);
}

function extractActionItems(messages: AIMessage[]): string[] {
  return messages.flatMap(message => {
    const actionWords = message.content.match(/(?:should|could|try to|consider|recommend|suggest)[^.!?]*/gi) || [];
    return actionWords.map(action => action.trim()).slice(0, 2);
  }).slice(0, 5);
}

function extractUserConcerns(messages: AIMessage[]): string[] {
  return messages.flatMap(message => {
    const concerns = message.content.match(/(?:worried|concerned|afraid|struggling|difficult|problem)[^.!?]*/gi) || [];
    return concerns.map(concern => concern.trim());
  }).slice(0, 3);
}

function extractAdviceGiven(messages: AIMessage[]): string[] {
  return messages.map(message => {
    const firstSentence = message.content.split(/[.!?]/)[0];
    return firstSentence.trim();
  }).filter(advice => advice.length > 10 && advice.length < 100).slice(0, 3);
}

function generateFollowUpItems(topics: string[], actionItems: string[]): string[] {
  const followUps: string[] = [];
  
  if (topics.includes('budget')) {
    followUps.push('Check budget adherence next week');
  }
  if (topics.includes('goal')) {
    followUps.push('Review goal progress in 30 days');
  }
  if (actionItems.length > 0) {
    followUps.push('Follow up on suggested action items');
  }
  
  return followUps;
}

function getDefaultPersonalityProfile(userId: string): UserPersonalityProfile {
  return {
    userId,
    spendingPersonality: 'balanced',
    communicationStyle: 'conversational',
    financialGoalsType: 'mixed',
    riskTolerance: 'medium',
    preferredAdviceType: 'actionable',
    interactionHistory: {
      totalInteractions: 0,
      commonQuestions: [],
      preferredTopics: [],
      responseRatings: [],
      lastInteractionDate: new Date().toISOString()
    },
    learningPreferences: {
      prefersExamples: true,
      likesComparisons: false,
      wantsStepByStep: true,
      prefersVisualData: false
    }
  };
}

/**
 * Personalizes AI response based on user personality profile
 */
export async function personalizeAIResponse(
  userId: string,
  response: string,
  context: { topic?: string; questionType?: string }
): Promise<string> {
  try {
    const profile = await buildUserPersonalityProfile(userId);
    
    // Modify response based on communication style
    let personalizedResponse = response;
    
    switch (profile.communicationStyle) {
      case 'concise':
        personalizedResponse = makeConcise(response);
        break;
      case 'detailed':
        personalizedResponse = addMoreDetail(response, profile);
        break;
      case 'visual':
        personalizedResponse = addVisualElements(response);
        break;
    }
    
    // Add personalization based on learning preferences
    if (profile.learningPreferences.prefersExamples) {
      personalizedResponse = addExamples(personalizedResponse, context);
    }
    
    if (profile.learningPreferences.wantsStepByStep) {
      personalizedResponse = addStepByStep(personalizedResponse);
    }
    
    // Adjust tone based on preferred advice type
    personalizedResponse = adjustTone(personalizedResponse, profile.preferredAdviceType);
    
    return personalizedResponse;
    
  } catch (error) {
    console.error('Error personalizing response:', error);
    return response;
  }
}

function makeConcise(response: string): string {
  const sentences = response.split(/[.!?]+/).filter(s => s.trim());
  const keySentences = sentences.slice(0, Math.ceil(sentences.length / 2));
  return keySentences.join('. ') + '.';
}

function addMoreDetail(response: string, profile: UserPersonalityProfile): string {
  let detailed = response;
  
  // Add context based on user's financial situation
  if (profile.spendingPersonality === 'saver') {
    detailed += "\n\nGiven your excellent saving habits, you're well-positioned to implement these recommendations.";
  } else if (profile.spendingPersonality === 'spender') {
    detailed += "\n\nI understand changing spending habits can be challenging. Start with small, manageable changes.";
  }
  
  return detailed;
}

function addVisualElements(response: string): string {
  let visual = response;
  
  // Add emoji and visual indicators
  visual = visual.replace(/save/gi, '💰 save');
  visual = visual.replace(/budget/gi, '📊 budget');
  visual = visual.replace(/goal/gi, '🎯 goal');
  visual = visual.replace(/invest/gi, '📈 invest');
  
  return visual;
}

function addExamples(response: string, context: any): string {
  if (context.topic === 'budget') {
    return response + "\n\n**Example:** If you spend $500 on groceries monthly, try reducing it to $450 by meal planning and using store brands.";
  }
  return response;
}

function addStepByStep(response: string): string {
  if (response.includes('recommend') || response.includes('suggest')) {
    const steps = response.split(/[.!]/).filter(s => s.trim());
    if (steps.length >= 2) {
      let stepByStep = "\n\n**Step-by-step approach:**\n";
      steps.slice(0, 3).forEach((step, index) => {
        stepByStep += `${index + 1}. ${step.trim()}\n`;
      });
      return response + stepByStep;
    }
  }
  return response;
}

function adjustTone(response: string, adviceType: UserPersonalityProfile['preferredAdviceType']): string {
  switch (adviceType) {
    case 'motivational':
      return "🌟 " + response + " You've got this! Every small step counts toward your financial goals.";
    case 'analytical':
      return response + "\n\n*Analysis based on your spending patterns and financial metrics.*";
    case 'educational':
      return "💡 " + response + "\n\nThis approach is based on proven financial principles.";
    default:
      return response;
  }
}