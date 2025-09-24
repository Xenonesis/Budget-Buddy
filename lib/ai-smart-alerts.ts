import { supabase } from './supabase';
import { 
  getUserFinancialProfile, 
  type UserFinancialProfile 
} from './ai-financial-context';
import { generatePredictiveInsights } from './ai-intelligence-engine';

/**
 * Proactive AI Financial Alerts and Notifications System
 */

export interface SmartAlert {
  id: string;
  userId: string;
  type: 'budget_warning' | 'spending_anomaly' | 'goal_milestone' | 'opportunity' | 'reminder' | 'prediction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  category?: string;
  amount?: number;
  actionRequired: boolean;
  suggestedActions: string[];
  dismissible: boolean;
  expiresAt?: string;
  metadata: any;
  createdAt: string;
  acknowledged: boolean;
}

export interface AnomalyDetection {
  type: 'spending_spike' | 'unusual_category' | 'frequency_change' | 'pattern_break';
  category: string;
  currentAmount: number;
  expectedRange: { min: number; max: number };
  deviationPercentage: number;
  confidence: number;
  description: string;
}

/**
 * Monitors user financial data and generates proactive alerts
 */
export async function generateProactiveAlerts(userId: string): Promise<SmartAlert[]> {
  try {
    const profile = await getUserFinancialProfile(userId);
    if (!profile) return [];

    const alerts: SmartAlert[] = [];

    // Budget warnings
    const budgetAlerts = await generateBudgetAlerts(userId, profile);
    alerts.push(...budgetAlerts);

    // Spending anomaly detection
    const anomalyAlerts = await detectSpendingAnomalies(userId, profile);
    alerts.push(...anomalyAlerts);

    // Goal progress alerts
    const goalAlerts = await generateGoalProgressAlerts(userId, profile);
    alerts.push(...goalAlerts);

    // Opportunity alerts
    const opportunityAlerts = await generateOpportunityAlerts(userId, profile);
    alerts.push(...opportunityAlerts);

    // Predictive alerts based on AI insights
    const predictiveAlerts = await generatePredictiveAlerts(userId, profile);
    alerts.push(...predictiveAlerts);

    // Save alerts to database
    await saveAlertsToDatabase(alerts);

    return alerts;
  } catch (error) {
    console.error('Error generating proactive alerts:', error);
    return [];
  }
}

/**
 * Generates budget-related alerts
 */
async function generateBudgetAlerts(userId: string, profile: UserFinancialProfile): Promise<SmartAlert[]> {
  const alerts: SmartAlert[] = [];
  
  profile.budgets.forEach(budget => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const currentDay = new Date().getDate();
    const monthProgress = currentDay / daysInMonth;
    
    // Critical: Budget exceeded
    if (budget.status === 'over') {
      alerts.push({
        id: `budget_exceeded_${budget.id}`,
        userId,
        type: 'budget_warning',
        severity: 'critical',
        title: `${budget.category} Budget Exceeded`,
        message: `You've spent ${profile.currency}${budget.spentAmount.toLocaleString()} of your ${profile.currency}${budget.budgetAmount.toLocaleString()} ${budget.category} budget (${budget.percentage.toFixed(1)}% over).`,
        category: budget.category,
        amount: budget.spentAmount - budget.budgetAmount,
        actionRequired: true,
        suggestedActions: [
          `Reduce ${budget.category} spending immediately`,
          'Review recent transactions for unnecessary expenses',
          'Consider adjusting budget allocation',
          'Set up spending alerts for this category'
        ],
        dismissible: false,
        metadata: { budgetId: budget.id, overspent: budget.spentAmount - budget.budgetAmount },
        createdAt: new Date().toISOString(),
        acknowledged: false
      });
    }
    // High: Budget at risk (80-99%)
    else if (budget.percentage >= 80) {
      const projectedOverage = (budget.spentAmount / monthProgress) - budget.budgetAmount;
      
      alerts.push({
        id: `budget_risk_${budget.id}`,
        userId,
        type: 'budget_warning',
        severity: projectedOverage > 0 ? 'high' : 'medium',
        title: `${budget.category} Budget Risk`,
        message: projectedOverage > 0 
          ? `You've used ${budget.percentage.toFixed(1)}% of your ${budget.category} budget. At current pace, you'll overspend by ${profile.currency}${projectedOverage.toFixed(0)}.`
          : `You've used ${budget.percentage.toFixed(1)}% of your ${budget.category} budget. You're on track but close to the limit.`,
        category: budget.category,
        amount: budget.spentAmount,
        actionRequired: projectedOverage > 0,
        suggestedActions: projectedOverage > 0 ? [
          `Reduce daily ${budget.category} spending to ${profile.currency}${((budget.budgetAmount - budget.spentAmount) / (daysInMonth - currentDay)).toFixed(0)}`,
          'Track expenses more closely',
          'Find cost-effective alternatives'
        ] : [
          'Monitor spending closely for rest of month',
          'Consider setting daily spending limits'
        ],
        dismissible: true,
        metadata: { budgetId: budget.id, projectedOverage },
        createdAt: new Date().toISOString(),
        acknowledged: false
      });
    }
  });

  return alerts;
}

/**
 * Detects spending anomalies using statistical analysis
 */
async function detectSpendingAnomalies(userId: string, profile: UserFinancialProfile): Promise<SmartAlert[]> {
  const alerts: SmartAlert[] = [];
  
  // Get historical spending data for comparison
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const { data: historicalTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', threeMonthsAgo.toISOString().split('T')[0])
    .eq('type', 'expense');

  if (!historicalTransactions || historicalTransactions.length < 10) return alerts;

  const anomalies = detectAnomalies(historicalTransactions, profile);
  
  anomalies.forEach(anomaly => {
    let severity: SmartAlert['severity'] = 'low';
    if (anomaly.deviationPercentage > 100) severity = 'high';
    else if (anomaly.deviationPercentage > 50) severity = 'medium';

    alerts.push({
      id: `anomaly_${anomaly.type}_${anomaly.category}`,
      userId,
      type: 'spending_anomaly',
      severity,
      title: `Unusual ${anomaly.category} Spending`,
      message: anomaly.description,
      category: anomaly.category,
      amount: anomaly.currentAmount,
      actionRequired: severity === 'high',
      suggestedActions: [
        'Review recent transactions in this category',
        'Check for unauthorized or duplicate charges',
        'Consider if this was a planned expense',
        'Adjust future spending if necessary'
      ],
      dismissible: true,
      metadata: { 
        anomaly, 
        expectedRange: anomaly.expectedRange,
        deviation: anomaly.deviationPercentage 
      },
      createdAt: new Date().toISOString(),
      acknowledged: false
    });
  });

  return alerts;
}

/**
 * Detects anomalies in spending patterns
 */
function detectAnomalies(transactions: any[], profile: UserFinancialProfile): AnomalyDetection[] {
  const anomalies: AnomalyDetection[] = [];
  const categorySpending = new Map<string, number[]>();
  
  // Group transactions by category and month
  transactions.forEach(transaction => {
    const category = transaction.category_name || 'Other';
    
    if (!categorySpending.has(category)) {
      categorySpending.set(category, []);
    }
    
    const monthlySpending = categorySpending.get(category)!;
    const existingIndex = monthlySpending.findIndex((_, idx) => {
      return idx === 0; // Simplified for this example
    });
    
    if (existingIndex === -1) {
      monthlySpending.push(transaction.amount);
    } else {
      monthlySpending[existingIndex] += transaction.amount;
    }
  });

  // Analyze each category for anomalies
  categorySpending.forEach((amounts, category) => {
    if (amounts.length < 3) return; // Need at least 3 data points
    
    const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length);
    
    const currentAmount = amounts[amounts.length - 1];
    const expectedMin = Math.max(0, mean - (2 * stdDev));
    const expectedMax = mean + (2 * stdDev);
    
    // Check for spending spike (current spending is significantly higher than expected)
    if (currentAmount > expectedMax && stdDev > 0) {
      const deviationPercentage = ((currentAmount - expectedMax) / expectedMax) * 100;
      
      anomalies.push({
        type: 'spending_spike',
        category,
        currentAmount,
        expectedRange: { min: expectedMin, max: expectedMax },
        deviationPercentage,
        confidence: Math.min(0.95, 0.6 + (deviationPercentage / 200)),
        description: `Your ${category} spending of ${profile.currency}${currentAmount.toLocaleString()} is ${deviationPercentage.toFixed(0)}% higher than your typical range of ${profile.currency}${expectedMin.toFixed(0)}-${profile.currency}${expectedMax.toFixed(0)}.`
      });
    }
  });

  return anomalies;
}

/**
 * Generates goal progress alerts and milestones
 */
async function generateGoalProgressAlerts(userId: string, profile: UserFinancialProfile): Promise<SmartAlert[]> {
  const alerts: SmartAlert[] = [];
  
  profile.goals.forEach(goal => {
    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
    const daysToDeadline = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const monthlySavings = (profile.totalIncome - profile.totalExpenses) / 3;
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const monthsNeeded = Math.ceil(remainingAmount / Math.max(monthlySavings, 1));
    
    // Milestone celebrations (25%, 50%, 75%, 90%)
    const milestones = [25, 50, 75, 90];
    milestones.forEach(milestone => {
      if (progressPercentage >= milestone && progressPercentage < milestone + 5) {
        alerts.push({
          id: `goal_milestone_${goal.id}_${milestone}`,
          userId,
          type: 'goal_milestone',
          severity: 'low',
          title: `🎉 ${milestone}% Progress on ${goal.title}!`,
          message: `Congratulations! You've reached ${progressPercentage.toFixed(1)}% of your ${goal.title} goal. You're ${profile.currency}${(goal.targetAmount - goal.currentAmount).toLocaleString()} away from your target.`,
          amount: goal.currentAmount,
          actionRequired: false,
          suggestedActions: [
            'Keep up the great work!',
            'Consider increasing monthly savings if possible',
            'Review your progress and adjust if needed'
          ],
          dismissible: true,
          metadata: { goalId: goal.id, milestone, progress: progressPercentage },
          createdAt: new Date().toISOString(),
          acknowledged: false
        });
      }
    });
    
    // Goal at risk alerts
    if (daysToDeadline > 0 && monthsNeeded * 30 > daysToDeadline) {
      const additionalNeeded = (remainingAmount / (daysToDeadline / 30)) - monthlySavings;
      
      alerts.push({
        id: `goal_risk_${goal.id}`,
        userId,
        type: 'budget_warning',
        severity: additionalNeeded > monthlySavings * 0.5 ? 'high' : 'medium',
        title: `${goal.title} Goal at Risk`,
        message: `To reach your ${goal.title} goal by ${goal.deadline}, you need to save an additional ${profile.currency}${additionalNeeded.toFixed(0)} per month.`,
        amount: remainingAmount,
        actionRequired: true,
        suggestedActions: [
          `Increase monthly savings by ${profile.currency}${additionalNeeded.toFixed(0)}`,
          'Review and reduce expenses in other categories',
          'Consider extending the deadline if realistic',
          'Look for additional income sources'
        ],
        dismissible: false,
        expiresAt: goal.deadline,
        metadata: { goalId: goal.id, additionalNeeded, daysToDeadline },
        createdAt: new Date().toISOString(),
        acknowledged: false
      });
    }
  });

  return alerts;
}

/**
 * Generates opportunity-based alerts
 */
async function generateOpportunityAlerts(userId: string, profile: UserFinancialProfile): Promise<SmartAlert[]> {
  const alerts: SmartAlert[] = [];
  
  // High savings rate opportunity
  if (profile.savingsRate > 30) {
    const monthlyExcess = (profile.totalIncome - profile.totalExpenses) / 3;
    
    alerts.push({
      id: `opportunity_investment_${userId}`,
      userId,
      type: 'opportunity',
      severity: 'low',
      title: '🚀 Investment Opportunity',
      message: `With your excellent ${profile.savingsRate.toFixed(1)}% savings rate, you have ${profile.currency}${monthlyExcess.toFixed(0)} monthly surplus that could be invested for long-term growth.`,
      amount: monthlyExcess,
      actionRequired: false,
      suggestedActions: [
        'Consider opening an investment account',
        'Research low-cost index funds or ETFs',
        'Automate monthly investments',
        'Consult with a financial advisor'
      ],
      dismissible: true,
      metadata: { savingsRate: profile.savingsRate, monthlyExcess },
      createdAt: new Date().toISOString(),
      acknowledged: false
    });
  }

  // Category optimization opportunities
  const largeCategory = profile.spendingByCategory.find(cat => 
    cat.percentage > 25 && !['Housing', 'Rent', 'Mortgage'].includes(cat.category)
  );
  
  if (largeCategory) {
    const potentialSavings = largeCategory.amount * 0.15; // 15% reduction
    
    alerts.push({
      id: `opportunity_optimize_${largeCategory.category}`,
      userId,
      type: 'opportunity',
      severity: 'low',
      title: `💡 ${largeCategory.category} Optimization`,
      message: `${largeCategory.category} represents ${largeCategory.percentage.toFixed(1)}% of your expenses. A 15% reduction could save you ${profile.currency}${potentialSavings.toFixed(0)} over 3 months.`,
      category: largeCategory.category,
      amount: potentialSavings,
      actionRequired: false,
      suggestedActions: [
        `Track ${largeCategory.category} expenses daily`,
        'Research cost-effective alternatives',
        'Set a reduction target and timeline',
        'Use budgeting apps to monitor progress'
      ],
      dismissible: true,
      metadata: { category: largeCategory, potentialSavings },
      createdAt: new Date().toISOString(),
      acknowledged: false
    });
  }

  return alerts;
}

/**
 * Generates predictive alerts based on AI insights
 */
async function generatePredictiveAlerts(userId: string, profile: UserFinancialProfile): Promise<SmartAlert[]> {
  const alerts: SmartAlert[] = [];
  
  try {
    const predictions = await generatePredictiveInsights(userId);
    
    predictions.forEach(prediction => {
      if (prediction.impact === 'high' || prediction.actionable) {
        let severity: SmartAlert['severity'] = 'low';
        if (prediction.impact === 'high') severity = 'high';
        else if (prediction.impact === 'medium') severity = 'medium';
        
        alerts.push({
          id: `prediction_${prediction.type}_${userId}`,
          userId,
          type: 'prediction',
          severity,
          title: `🔮 ${prediction.title}`,
          message: prediction.description,
          actionRequired: prediction.actionable,
          suggestedActions: prediction.suggestedActions,
          dismissible: !prediction.actionable,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          metadata: { 
            prediction,
            confidence: prediction.confidence,
            timeframe: prediction.timeframe
          },
          createdAt: new Date().toISOString(),
          acknowledged: false
        });
      }
    });
  } catch (error) {
    console.error('Error generating predictive alerts:', error);
  }

  return alerts;
}

/**
 * Saves alerts to database for persistence
 */
async function saveAlertsToDatabase(alerts: SmartAlert[]): Promise<void> {
  try {
    if (alerts.length === 0) return;
    
    // Remove existing alerts for the same user that are similar
    const userIds = [...new Set(alerts.map(a => a.userId))];
    
    for (const userId of userIds) {
      await supabase
        .from('smart_alerts')
        .delete()
        .eq('user_id', userId)
        .in('type', alerts.filter(a => a.userId === userId).map(a => a.type));
    }
    
    // Insert new alerts
    await supabase
      .from('smart_alerts')
      .insert(alerts.map(alert => ({
        id: alert.id,
        user_id: alert.userId,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        category: alert.category,
        amount: alert.amount,
        action_required: alert.actionRequired,
        suggested_actions: alert.suggestedActions,
        dismissible: alert.dismissible,
        expires_at: alert.expiresAt,
        metadata: alert.metadata,
        created_at: alert.createdAt,
        acknowledged: alert.acknowledged
      })));
      
  } catch (error) {
    console.error('Error saving alerts to database:', error);
  }
}

/**
 * Retrieves active alerts for a user
 */
export async function getUserActiveAlerts(userId: string): Promise<SmartAlert[]> {
  try {
    const { data, error } = await supabase
      .from('smart_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('acknowledged', false)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(alert => ({
      id: alert.id,
      userId: alert.user_id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      category: alert.category,
      amount: alert.amount,
      actionRequired: alert.action_required,
      suggestedActions: alert.suggested_actions || [],
      dismissible: alert.dismissible,
      expiresAt: alert.expires_at,
      metadata: alert.metadata || {},
      createdAt: alert.created_at,
      acknowledged: alert.acknowledged
    }));
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    return [];
  }
}

/**
 * Acknowledges an alert
 */
export async function acknowledgeAlert(alertId: string): Promise<void> {
  try {
    await supabase
      .from('smart_alerts')
      .update({ acknowledged: true })
      .eq('id', alertId);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
  }
}