/**
 * Contextual AI Assistant - AI coach that learns habits and prevents overspending
 * USP: "AI coach that learns your habits and prevents overspending before it happens"
 */

import { ExtractedTransactionData } from './ocr-processor';

interface AICoachingConfig {
  enableRealTimeAlerts: boolean;
  enableSpendingPrediction: boolean;
  enableBudgetOptimization: boolean;
  enableFraudDetection: boolean;
  alertThresholds: AlertThresholds;
  learningMode: 'aggressive' | 'moderate' | 'conservative';
}

interface AlertThresholds {
  budgetExcess: number; // Percentage
  unusualSpending: number; // Multiple of average
  frequencyAlert: number; // Transactions per day
  amountAlert: number; // Absolute amount
}

interface SpendingBehaviorProfile {
  userId: string;
  averageSpending: Map<string, number>; // Category -> average amount
  spendingFrequency: Map<string, number>; // Category -> frequency per month
  preferredMerchants: Map<string, MerchantPreference>;
  spendingPatterns: {
    timeOfDay: number[];
    dayOfWeek: number[];
    monthlyTrend: number[];
    seasonalPatterns: Map<string, number>;
  };
  budgetAdherence: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  lastUpdated: Date;
}

interface MerchantPreference {
  name: string;
  frequency: number;
  averageAmount: number;
  category: string;
  loyaltyLevel: 'low' | 'medium' | 'high';
  lastVisit: Date;
}

interface CoachingInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'achievement' | 'prediction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actions?: CoachingAction[];
  confidence: number;
  urgency: 'immediate' | 'soon' | 'whenever';
  category?: string;
}

interface CoachingAction {
  id: string;
  title: string;
  description: string;
  type: 'budget_adjustment' | 'merchant_switch' | 'spending_limit' | 'category_optimization';
  estimatedSavings?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface AnomalyAlert {
  id: string;
  transaction: ExtractedTransactionData;
  anomalyType: 'amount' | 'frequency' | 'merchant' | 'location' | 'time';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedAction: string;
  confidence: number;
  autoBlock: boolean;
}

interface SpendingPrediction {
  category: string;
  predictedAmount: number;
  timeframe: 'week' | 'month' | 'quarter';
  confidence: number;
  factors: PredictionFactor[];
  recommendations: string[];
}

interface PredictionFactor {
  factor: string;
  weight: number;
  description: string;
}

export class ContextualAIAssistant {
  private config: AICoachingConfig;
  private userProfiles: Map<string, SpendingBehaviorProfile>;
  private insightHistory: Map<string, CoachingInsight[]>;
  private predictionModels: Map<string, any>;
  
  constructor(config?: Partial<AICoachingConfig>) {
    this.config = {
      enableRealTimeAlerts: true,
      enableSpendingPrediction: true,
      enableBudgetOptimization: true,
      enableFraudDetection: true,
      alertThresholds: {
        budgetExcess: 90, // 90% of budget
        unusualSpending: 3, // 3x average
        frequencyAlert: 10, // 10+ transactions per day
        amountAlert: 10000 // ₹10,000+
      },
      learningMode: 'moderate',
      ...config
    };
    
    this.userProfiles = new Map();
    this.insightHistory = new Map();
    this.predictionModels = new Map();
    
    this.initializeAIModels();
  }

  /**
   * Analyze spending behavior and provide real-time coaching
   */
  async analyzeSpendingBehavior(
    userId: string,
    transaction: ExtractedTransactionData,
    context: {
      recentTransactions: ExtractedTransactionData[];
      budgets: Map<string, number>;
      goals: any[];
    }
  ): Promise<{
    insights: CoachingInsight[];
    alerts: AnomalyAlert[];
    predictions: SpendingPrediction[];
    recommendations: CoachingAction[];
  }> {
    const profile = await this.getUserProfile(userId);
    
    // Update profile with new transaction
    await this.updateSpendingProfile(profile, transaction);
    
    // Generate insights
    const insights = await this.generateCoachingInsights(profile, transaction, context);
    
    // Detect anomalies
    const alerts = await this.detectSpendingAnomalies(profile, transaction, context);
    
    // Generate predictions
    const predictions = await this.generateSpendingPredictions(profile, context);
    
    // Create actionable recommendations
    const recommendations = await this.generateRecommendations(profile, insights, context);
    
    // Store insights for learning
    this.storeInsightsForLearning(userId, insights);
    
    return {
      insights,
      alerts,
      predictions,
      recommendations
    };
  }

  /**
   * Generate coaching insights based on spending patterns
   */
  private async generateCoachingInsights(
    profile: SpendingBehaviorProfile,
    transaction: ExtractedTransactionData,
    context: any
  ): Promise<CoachingInsight[]> {
    const insights: CoachingInsight[] = [];
    
    // Budget impact insight
    if (transaction.category && context.budgets.has(transaction.category)) {
      const budgetInsight = await this.generateBudgetImpactInsight(
        transaction, 
        context.budgets.get(transaction.category),
        profile
      );
      if (budgetInsight) insights.push(budgetInsight);
    }
    
    // Spending pattern insights
    const patternInsights = await this.generatePatternInsights(profile, transaction);
    insights.push(...patternInsights);
    
    // Merchant loyalty insights
    const loyaltyInsights = await this.generateLoyaltyInsights(profile, transaction);
    insights.push(...loyaltyInsights);
    
    // Savings opportunity insights
    const savingsInsights = await this.generateSavingsInsights(profile, transaction);
    insights.push(...savingsInsights);
    
    // Achievement insights
    const achievementInsights = await this.generateAchievementInsights(profile, context);
    insights.push(...achievementInsights);
    
    return insights.sort((a, b) => {
      // Sort by urgency and impact
      const urgencyWeight = { immediate: 3, soon: 2, whenever: 1 };
      const impactWeight = { high: 3, medium: 2, low: 1 };
      
      const scoreA = urgencyWeight[a.urgency] * impactWeight[a.impact];
      const scoreB = urgencyWeight[b.urgency] * impactWeight[b.impact];
      
      return scoreB - scoreA;
    });
  }

  /**
   * Generate budget impact insight
   */
  private async generateBudgetImpactInsight(
    transaction: ExtractedTransactionData,
    categoryBudget: number,
    profile: SpendingBehaviorProfile
  ): Promise<CoachingInsight | null> {
    if (!transaction.amount || !transaction.category) return null;
    
    const categorySpending = profile.averageSpending.get(transaction.category) || 0;
    const projectedSpending = categorySpending + transaction.amount;
    const budgetUsage = (projectedSpending / categoryBudget) * 100;
    
    if (budgetUsage > this.config.alertThresholds.budgetExcess) {
      return {
        id: `budget_impact_${Date.now()}`,
        type: 'warning',
        title: `⚠️ Budget Alert: ${transaction.category}`,
        description: `This transaction puts you at ${budgetUsage.toFixed(1)}% of your ${transaction.category} budget (₹${categoryBudget.toLocaleString()})`,
        impact: budgetUsage > 100 ? 'high' : 'medium',
        actionable: true,
        actions: [
          {
            id: 'adjust_budget',
            title: 'Increase Budget',
            description: `Consider increasing your ${transaction.category} budget by ₹${Math.ceil((projectedSpending - categoryBudget) / 1000) * 1000}`,
            type: 'budget_adjustment',
            estimatedSavings: 0,
            difficulty: 'easy'
          },
          {
            id: 'reduce_spending',
            title: 'Reduce Spending',
            description: `Find alternatives to save ₹${Math.ceil(projectedSpending - categoryBudget)} this month`,
            type: 'spending_limit',
            estimatedSavings: projectedSpending - categoryBudget,
            difficulty: 'medium'
          }
        ],
        confidence: 0.95,
        urgency: budgetUsage > 100 ? 'immediate' : 'soon',
        category: transaction.category
      };
    }
    
    return null;
  }

  /**
   * Generate spending pattern insights
   */
  private async generatePatternInsights(
    profile: SpendingBehaviorProfile,
    transaction: ExtractedTransactionData
  ): Promise<CoachingInsight[]> {
    const insights: CoachingInsight[] = [];
    const now = new Date();
    
    // Time-based insights
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Unusual time spending
    const typicalHours = profile.spendingPatterns.timeOfDay;
    if (typicalHours.length > 10) {
      const averageHour = typicalHours.reduce((a, b) => a + b, 0) / typicalHours.length;
      const hourDeviation = Math.abs(hour - averageHour);
      
      if (hourDeviation > 6) {
        insights.push({
          id: `time_pattern_${Date.now()}`,
          type: 'suggestion',
          title: '🕐 Unusual Spending Time',
          description: `You typically spend around ${Math.round(averageHour)}:00. Late-night purchases are often impulse buys.`,
          impact: 'low',
          actionable: true,
          actions: [
            {
              id: 'delay_purchase',
              title: 'Sleep On It',
              description: 'Consider waiting until tomorrow to make this purchase',
              type: 'spending_limit',
              difficulty: 'easy'
            }
          ],
          confidence: 0.7,
          urgency: 'whenever'
        });
      }
    }
    
    // Frequency insights
    if (transaction.category) {
      const categoryFreq = profile.spendingFrequency.get(transaction.category) || 0;
      const monthlyFreq = categoryFreq / 30; // Convert to daily average
      
      if (monthlyFreq > 1) {
        insights.push({
          id: `frequency_${Date.now()}`,
          type: 'suggestion',
          title: `🔄 Frequent ${transaction.category} Spending`,
          description: `You spend on ${transaction.category} ${categoryFreq} times per month. Consider bulk buying or subscriptions to save.`,
          impact: 'medium',
          actionable: true,
          confidence: 0.8,
          urgency: 'whenever',
          category: transaction.category
        });
      }
    }
    
    return insights;
  }

  /**
   * Generate merchant loyalty insights
   */
  private async generateLoyaltyInsights(
    profile: SpendingBehaviorProfile,
    transaction: ExtractedTransactionData
  ): Promise<CoachingInsight[]> {
    const insights: CoachingInsight[] = [];
    
    if (!transaction.merchant) return insights;
    
    const merchantPref = profile.preferredMerchants.get(transaction.merchant);
    if (merchantPref && merchantPref.frequency > 5) {
      insights.push({
        id: `loyalty_${Date.now()}`,
        type: 'suggestion',
        title: `🏪 Loyalty Opportunity at ${transaction.merchant}`,
        description: `You visit ${transaction.merchant} ${merchantPref.frequency} times per month. Check for loyalty programs or bulk discounts.`,
        impact: 'low',
        actionable: true,
        actions: [
          {
            id: 'check_loyalty',
            title: 'Check Loyalty Programs',
            description: `Look for ${transaction.merchant} loyalty programs or membership benefits`,
            type: 'merchant_switch',
            estimatedSavings: merchantPref.averageAmount * 0.1, // Assume 10% savings
            difficulty: 'easy'
          }
        ],
        confidence: 0.85,
        urgency: 'whenever'
      });
    }
    
    return insights;
  }

  /**
   * Generate savings opportunity insights
   */
  private async generateSavingsInsights(
    profile: SpendingBehaviorProfile,
    transaction: ExtractedTransactionData
  ): Promise<CoachingInsight[]> {
    const insights: CoachingInsight[] = [];
    
    // Alternative merchant suggestions
    if (transaction.category && transaction.amount) {
      const categoryAvg = profile.averageSpending.get(transaction.category) || 0;
      
      if (transaction.amount > categoryAvg * 1.5) {
        insights.push({
          id: `savings_${Date.now()}`,
          type: 'suggestion',
          title: `💰 Potential Savings in ${transaction.category}`,
          description: `This ₹${transaction.amount} expense is ${((transaction.amount / categoryAvg - 1) * 100).toFixed(1)}% higher than your usual ${transaction.category} spending.`,
          impact: 'medium',
          actionable: true,
          actions: [
            {
              id: 'find_alternatives',
              title: 'Find Cheaper Alternatives',
              description: 'Compare prices with other vendors for similar products/services',
              type: 'merchant_switch',
              estimatedSavings: transaction.amount - categoryAvg,
              difficulty: 'medium'
            }
          ],
          confidence: 0.75,
          urgency: 'soon',
          category: transaction.category
        });
      }
    }
    
    return insights;
  }

  /**
   * Generate achievement insights
   */
  private async generateAchievementInsights(
    profile: SpendingBehaviorProfile,
    context: any
  ): Promise<CoachingInsight[]> {
    const insights: CoachingInsight[] = [];
    
    // Budget adherence achievement
    if (profile.budgetAdherence > 0.9) {
      insights.push({
        id: `achievement_budget_${Date.now()}`,
        type: 'achievement',
        title: '🎉 Great Budget Management!',
        description: `You're staying within budget ${(profile.budgetAdherence * 100).toFixed(1)}% of the time. Keep it up!`,
        impact: 'low',
        actionable: false,
        confidence: 1.0,
        urgency: 'whenever'
      });
    }
    
    return insights;
  }

  /**
   * Detect spending anomalies and fraud
   */
  private async detectSpendingAnomalies(
    profile: SpendingBehaviorProfile,
    transaction: ExtractedTransactionData,
    context: any
  ): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];
    
    // Unusual amount detection
    if (transaction.amount && transaction.category) {
      const categoryAvg = profile.averageSpending.get(transaction.category) || 0;
      
      if (categoryAvg > 0 && transaction.amount > categoryAvg * this.config.alertThresholds.unusualSpending) {
        alerts.push({
          id: `anomaly_amount_${Date.now()}`,
          transaction,
          anomalyType: 'amount',
          severity: transaction.amount > categoryAvg * 5 ? 'high' : 'medium',
          description: `Amount ₹${transaction.amount} is ${(transaction.amount / categoryAvg).toFixed(1)}x your average ${transaction.category} spending`,
          suggestedAction: 'Verify this transaction is legitimate',
          confidence: 0.8,
          autoBlock: false
        });
      }
    }
    
    // Unusual merchant detection
    if (transaction.merchant && !profile.preferredMerchants.has(transaction.merchant)) {
      const merchantCount = profile.preferredMerchants.size;
      
      if (merchantCount > 10) { // Only alert for established users
        alerts.push({
          id: `anomaly_merchant_${Date.now()}`,
          transaction,
          anomalyType: 'merchant',
          severity: 'low',
          description: `First time spending at ${transaction.merchant}`,
          suggestedAction: 'Confirm this is a legitimate new merchant',
          confidence: 0.6,
          autoBlock: false
        });
      }
    }
    
    // High-frequency detection
    const todayTransactions = context.recentTransactions.filter((t: ExtractedTransactionData) => {
      const today = new Date().toDateString();
      return new Date(t.date || '').toDateString() === today;
    });
    
    if (todayTransactions.length > this.config.alertThresholds.frequencyAlert) {
      alerts.push({
        id: `anomaly_frequency_${Date.now()}`,
        transaction,
        anomalyType: 'frequency',
        severity: 'medium',
        description: `${todayTransactions.length} transactions today - unusually high activity`,
        suggestedAction: 'Review all transactions for unauthorized activity',
        confidence: 0.9,
        autoBlock: false
      });
    }
    
    return alerts;
  }

  /**
   * Generate spending predictions
   */
  private async generateSpendingPredictions(
    profile: SpendingBehaviorProfile,
    context: any
  ): Promise<SpendingPrediction[]> {
    const predictions: SpendingPrediction[] = [];
    
    for (const [category, avgSpending] of profile.averageSpending) {
      if (avgSpending > 100) { // Only predict for significant categories
        const prediction = await this.predictCategorySpending(category, avgSpending, profile);
        predictions.push(prediction);
      }
    }
    
    return predictions.sort((a, b) => b.predictedAmount - a.predictedAmount);
  }

  /**
   * Predict category spending
   */
  private async predictCategorySpending(
    category: string,
    avgSpending: number,
    profile: SpendingBehaviorProfile
  ): Promise<SpendingPrediction> {
    const now = new Date();
    const month = now.getMonth();
    const dayOfWeek = now.getDay();
    
    // Seasonal adjustment
    const seasonalMultiplier = this.getSeasonalMultiplier(category, month);
    
    // Day of week adjustment
    const dayMultiplier = this.getDayOfWeekMultiplier(category, dayOfWeek, profile);
    
    // Base prediction
    let predictedAmount = avgSpending * seasonalMultiplier * dayMultiplier;
    
    // Trend adjustment based on recent behavior
    const recentTrend = this.calculateRecentTrend(category, profile);
    predictedAmount *= (1 + recentTrend);
    
    return {
      category,
      predictedAmount: Math.round(predictedAmount),
      timeframe: 'month',
      confidence: 0.75,
      factors: [
        {
          factor: 'Historical Average',
          weight: 0.4,
          description: `Based on ₹${avgSpending.toFixed(0)} monthly average`
        },
        {
          factor: 'Seasonal Pattern',
          weight: 0.3,
          description: `${((seasonalMultiplier - 1) * 100).toFixed(1)}% seasonal adjustment`
        },
        {
          factor: 'Recent Trend',
          weight: 0.3,
          description: `${(recentTrend * 100).toFixed(1)}% trend adjustment`
        }
      ],
      recommendations: this.generatePredictionRecommendations(category, predictedAmount, avgSpending)
    };
  }

  /**
   * Generate actionable recommendations
   */
  private async generateRecommendations(
    profile: SpendingBehaviorProfile,
    insights: CoachingInsight[],
    context: any
  ): Promise<CoachingAction[]> {
    const recommendations: CoachingAction[] = [];
    
    // Extract actions from insights
    for (const insight of insights) {
      if (insight.actions) {
        recommendations.push(...insight.actions);
      }
    }
    
    // Add general optimization recommendations
    const optimizationRecs = await this.generateOptimizationRecommendations(profile, context);
    recommendations.push(...optimizationRecs);
    
    // Remove duplicates and sort by estimated savings
    const uniqueRecs = recommendations.filter((rec, index, arr) => 
      arr.findIndex(r => r.type === rec.type && r.title === rec.title) === index
    );
    
    return uniqueRecs.sort((a, b) => (b.estimatedSavings || 0) - (a.estimatedSavings || 0));
  }

  // Helper methods
  private async getUserProfile(userId: string): Promise<SpendingBehaviorProfile> {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        averageSpending: new Map(),
        spendingFrequency: new Map(),
        preferredMerchants: new Map(),
        spendingPatterns: {
          timeOfDay: [],
          dayOfWeek: [],
          monthlyTrend: [],
          seasonalPatterns: new Map()
        },
        budgetAdherence: 0.85,
        riskProfile: 'moderate',
        lastUpdated: new Date()
      });
    }
    return this.userProfiles.get(userId)!;
  }

  private async updateSpendingProfile(
    profile: SpendingBehaviorProfile,
    transaction: ExtractedTransactionData
  ): Promise<void> {
    if (!transaction.amount || !transaction.category) return;
    
    // Update average spending
    const currentAvg = profile.averageSpending.get(transaction.category) || 0;
    const newAvg = (currentAvg + transaction.amount) / 2;
    profile.averageSpending.set(transaction.category, newAvg);
    
    // Update frequency
    const currentFreq = profile.spendingFrequency.get(transaction.category) || 0;
    profile.spendingFrequency.set(transaction.category, currentFreq + 1);
    
    // Update merchant preferences
    if (transaction.merchant) {
      let merchantPref = profile.preferredMerchants.get(transaction.merchant);
      if (!merchantPref) {
        merchantPref = {
          name: transaction.merchant,
          frequency: 0,
          averageAmount: 0,
          category: transaction.category,
          loyaltyLevel: 'low',
          lastVisit: new Date()
        };
      }
      
      merchantPref.frequency++;
      merchantPref.averageAmount = (merchantPref.averageAmount + transaction.amount) / 2;
      merchantPref.lastVisit = new Date();
      merchantPref.loyaltyLevel = merchantPref.frequency > 10 ? 'high' : 
                                  merchantPref.frequency > 5 ? 'medium' : 'low';
      
      profile.preferredMerchants.set(transaction.merchant, merchantPref);
    }
    
    // Update time patterns
    const now = new Date();
    profile.spendingPatterns.timeOfDay.push(now.getHours());
    profile.spendingPatterns.dayOfWeek.push(now.getDay());
    
    profile.lastUpdated = new Date();
  }

  private storeInsightsForLearning(userId: string, insights: CoachingInsight[]): void {
    if (!this.insightHistory.has(userId)) {
      this.insightHistory.set(userId, []);
    }
    
    const history = this.insightHistory.get(userId)!;
    history.push(...insights);
    
    // Keep only last 100 insights
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  private getSeasonalMultiplier(category: string, month: number): number {
    // Simple seasonal adjustments
    const seasonalPatterns = {
      'food': [1.0, 1.0, 1.1, 1.0, 1.0, 1.1, 1.0, 1.0, 1.0, 1.2, 1.3, 1.4], // Higher in holidays
      'shopping': [0.9, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.2, 1.3, 1.5], // Peak in Nov-Dec
      'transport': [1.0, 1.0, 1.0, 1.0, 1.1, 1.2, 1.2, 1.1, 1.0, 1.0, 1.0, 1.1] // Higher in summer
    };
    
    return (seasonalPatterns as any)[category]?.[month] || 1.0;
  }

  private getDayOfWeekMultiplier(category: string, dayOfWeek: number, profile: SpendingBehaviorProfile): number {
    // Analyze user's day-of-week patterns
    const dayPatterns = profile.spendingPatterns.dayOfWeek;
    if (dayPatterns.length < 10) return 1.0; // Not enough data
    
    const dayCount = dayPatterns.filter(d => d === dayOfWeek).length;
    const avgDayCount = dayPatterns.length / 7;
    
    return dayCount / avgDayCount;
  }

  private calculateRecentTrend(category: string, profile: SpendingBehaviorProfile): number {
    // Calculate trend based on recent spending vs historical average
    // This is simplified - in production, use more sophisticated trend analysis
    return 0; // Placeholder
  }

  private generatePredictionRecommendations(
    category: string,
    predicted: number,
    historical: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (predicted > historical * 1.2) {
      recommendations.push(`Consider setting a spending limit for ${category} this month`);
      recommendations.push(`Look for deals and discounts in ${category}`);
    }
    
    if (predicted > historical * 1.5) {
      recommendations.push(`Your ${category} spending may exceed budget - review upcoming expenses`);
    }
    
    return recommendations;
  }

  private async generateOptimizationRecommendations(
    profile: SpendingBehaviorProfile,
    context: any
  ): Promise<CoachingAction[]> {
    // Generate general optimization recommendations
    return [];
  }

  private initializeAIModels(): void {
    // Initialize ML models for prediction and anomaly detection
    // This would include loading pre-trained models or initializing training data
  }
}

export default ContextualAIAssistant;