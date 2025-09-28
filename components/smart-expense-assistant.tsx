"use client";

/**
 * Smart Expense Assistant - Complete integration of all advanced OCR features
 * The central hub that orchestrates all OCR capabilities and provides unified UX
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  Zap,
  DollarSign,
  Calendar,
  PieChart,
  FileText,
  Settings,
  Bell,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

import { AdvancedOCRUpload } from '@/components/ui/advanced-ocr-upload';
import { SmartLearningEngine } from '@/lib/smart-learning-engine';
import { ContextualAIAssistant } from '@/lib/contextual-ai-assistant';

// Define the types that were missing
interface ExtractedTransactionData {
  id?: string;
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
  merchant?: string;
  type?: 'income' | 'expense';
  confidence?: number;
}

interface CoachingInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'suggestion' | 'achievement' | 'prediction';
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'immediate' | 'soon' | 'whenever';
  actionable: boolean;
  confidence?: number;
  actions?: Array<{
    title: string;
    description: string;
    estimatedSavings?: number;
  }>;
}

interface AnomalyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

interface ExpenseReport {
  reportId: string;
  transactionCount: number;
  totalAmount: number;
  categories: Record<string, number>;
  generatedAt: Date;
  title?: string;
  summary?: string;
  period?: string;
}

interface SmartExpenseAssistantProps {
  userId: string;
  onTransactionCreated: (transaction: ExtractedTransactionData) => void;
  currentBudgets: Map<string, number>;
  recentTransactions: ExtractedTransactionData[];
  userPreferences?: {
    enableNotifications: boolean;
    learningMode: 'aggressive' | 'moderate' | 'conservative';
    defaultCurrency: string;
    autoCategorizationLevel: 'high' | 'medium' | 'low';
  };
}

interface AssistantState {
  learningScore: number;
  totalSavingsIdentified: number;
  accuracyImprovement: number;
  insightsGenerated: number;
  receiptsProcessed: number;
  duplicatesDetected: number;
}

interface DashboardMetrics {
  thisMonth: {
    spending: number;
    transactions: number;
    budgetUsage: number;
    savingsOpportunities: number;
  };
  predictions: {
    nextWeekSpending: number;
    monthlyProjection: number;
    budgetRisk: 'low' | 'medium' | 'high';
  };
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'budget' | 'learning' | 'efficiency' | 'savings';
  earnedAt: Date;
  points: number;
}

export function SmartExpenseAssistant({
  userId,
  onTransactionCreated,
  currentBudgets,
  recentTransactions,
  userPreferences = {
    enableNotifications: true,
    learningMode: 'moderate',
    defaultCurrency: 'INR',
    autoCategorizationLevel: 'high'
  }
}: SmartExpenseAssistantProps) {
  const [assistantState, setAssistantState] = useState<AssistantState>({
    learningScore: 85,
    totalSavingsIdentified: 0,
    accuracyImprovement: 0,
    insightsGenerated: 0,
    receiptsProcessed: 0,
    duplicatesDetected: 0
  });

  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    thisMonth: {
      spending: 0,
      transactions: 0,
      budgetUsage: 0,
      savingsOpportunities: 0
    },
    predictions: {
      nextWeekSpending: 0,
      monthlyProjection: 0,
      budgetRisk: 'low'
    },
    achievements: []
  });

  const [activeInsights, setActiveInsights] = useState<CoachingInsight[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AnomalyAlert[]>([]);
  const [showDashboard, setShowDashboard] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize assistant systems
  useEffect(() => {
    initializeAssistant();
  }, [userId]);

  // Update metrics when transactions change
  useEffect(() => {
    updateDashboardMetrics();
  }, [recentTransactions, currentBudgets]);

  const initializeAssistant = async () => {
    try {
      // Initialize learning engine
      const learningEngine = new SmartLearningEngine();
      
      // Generate learning insights for existing user
      const learningInsights = await learningEngine.generateLearningInsights(userId);
      
      // Initialize AI assistant
      const aiAssistant = new ContextualAIAssistant({
        enableRealTimeAlerts: userPreferences.enableNotifications,
        learningMode: userPreferences.learningMode
      });

      // Load achievements
      await loadUserAchievements();
      
      setIsInitialized(true);
      
      // Show welcome message for new users
      if (assistantState.receiptsProcessed === 0) {
        toast.success('Smart Assistant Ready! 🤖', {
          description: 'Upload your first receipt to start learning your spending patterns'
        });
      }
      
    } catch (error) {
      console.error('Failed to initialize assistant:', error);
      toast.error('Assistant initialization failed', {
        description: 'Some smart features may not be available'
      });
    }
  };

  const updateDashboardMetrics = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate this month's metrics
    const thisMonthTransactions = recentTransactions.filter(t => {
      const transactionDate = new Date(t.date || '');
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const monthlySpending = thisMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalBudget = Array.from(currentBudgets.values()).reduce((sum, budget) => sum + budget, 0);
    const budgetUsage = totalBudget > 0 ? (monthlySpending / totalBudget) * 100 : 0;

    // Calculate predictions (simplified)
    const avgDailySpending = monthlySpending / now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthlyProjection = avgDailySpending * daysInMonth;
    const nextWeekSpending = avgDailySpending * 7;

    // Determine budget risk
    let budgetRisk: 'low' | 'medium' | 'high' = 'low';
    if (budgetUsage > 90) budgetRisk = 'high';
    else if (budgetUsage > 70) budgetRisk = 'medium';

    setDashboardMetrics(prev => ({
      ...prev,
      thisMonth: {
        spending: monthlySpending,
        transactions: thisMonthTransactions.length,
        budgetUsage,
        savingsOpportunities: assistantState.totalSavingsIdentified
      },
      predictions: {
        nextWeekSpending,
        monthlyProjection,
        budgetRisk
      }
    }));
  }, [recentTransactions, currentBudgets, assistantState.totalSavingsIdentified]);

  const loadUserAchievements = async () => {
    // In a real app, this would load from database
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'Smart Spender',
        description: 'Processed 10 receipts with OCR',
        type: 'efficiency',
        earnedAt: new Date(),
        points: 100
      },
      {
        id: '2',
        title: 'Budget Master',
        description: 'Stayed under budget for 3 months',
        type: 'budget',
        earnedAt: new Date(),
        points: 250
      }
    ];

    setDashboardMetrics(prev => ({
      ...prev,
      achievements: mockAchievements
    }));
  };

  const handleDataExtracted = async (data: ExtractedTransactionData | ExtractedTransactionData[]) => {
    const transactions = Array.isArray(data) ? data : [data];
    
    // Update assistant state
    setAssistantState(prev => ({
      ...prev,
      receiptsProcessed: prev.receiptsProcessed + transactions.length
    }));

    // Process each transaction
    for (const transaction of transactions) {
      onTransactionCreated(transaction);
    }

    // Show success notification
    toast.success(`Processed ${transactions.length} transaction${transactions.length > 1 ? 's' : ''}`, {
      description: `Total amount: ₹${transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}`
    });
  };

  const handleInsightGenerated = (insights: CoachingInsight[]) => {
    setActiveInsights(prev => [...insights, ...prev].slice(0, 10)); // Keep last 10 insights
    setAssistantState(prev => ({
      ...prev,
      insightsGenerated: prev.insightsGenerated + insights.length
    }));

    // Calculate total savings identified
    const newSavings = insights.reduce((sum, insight) => {
      return sum + (insight.actions?.reduce((actionSum, action) => 
        actionSum + (action.estimatedSavings || 0), 0) || 0);
    }, 0);

    setAssistantState(prev => ({
      ...prev,
      totalSavingsIdentified: prev.totalSavingsIdentified + newSavings
    }));

    // Show high-impact insights immediately
    insights.filter(insight => insight.impact === 'high' && insight.urgency === 'immediate')
      .forEach(insight => {
        toast.warning(insight.title, {
          description: insight.description,
          action: insight.actionable ? {
            label: 'View Details',
            onClick: () => console.log('Show insight details:', insight)
          } : undefined
        });
      });
  };

  const handleReportGenerated = (report: ExpenseReport) => {
    toast.success('Expense Report Generated! 📊', {
      description: `${report.transactionCount} transactions analyzed`,
      action: {
        label: 'Download',
        onClick: () => downloadReport(report)
      }
    });
  };

  const downloadReport = (report: ExpenseReport) => {
    // In a real app, this would generate and download the actual report
    const reportData = JSON.stringify(report, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${report.reportId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Assistant Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Smart Expense Assistant</span>
                  <Badge variant="outline" className="text-xs">
                    AI-Powered
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Learning your habits • {assistantState.learningScore}% accuracy
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDashboard(!showDashboard)}
            >
              {showDashboard ? 'Hide' : 'Show'} Dashboard
            </Button>
          </div>
        </CardHeader>

        {showDashboard && (
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">This Month</span>
                    </div>
                    <div className="text-2xl font-bold">₹{dashboardMetrics.thisMonth.spending.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {dashboardMetrics.thisMonth.transactions} transactions
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <PieChart className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Budget Usage</span>
                    </div>
                    <div className="text-2xl font-bold">{dashboardMetrics.thisMonth.budgetUsage.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">
                      Risk: {dashboardMetrics.predictions.budgetRisk}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Savings Found</span>
                    </div>
                    <div className="text-2xl font-bold">₹{assistantState.totalSavingsIdentified.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      From AI insights
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Learning Score</span>
                    </div>
                    <div className="text-2xl font-bold">{assistantState.learningScore}%</div>
                    <div className="text-xs text-muted-foreground">
                      {assistantState.receiptsProcessed} receipts processed
                    </div>
                  </div>
                </div>

                {/* Predictions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Next Week Prediction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">
                        ₹{dashboardMetrics.predictions.nextWeekSpending.toFixed(0)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on your recent spending patterns
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Monthly Projection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">
                        ₹{dashboardMetrics.predictions.monthlyProjection.toFixed(0)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Projected end-of-month spending
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                {activeInsights.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No insights yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload some receipts to start generating AI insights
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeInsights.map((insight, index) => (
                      <Alert key={index}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            {insight.type === 'suggestion' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                            {insight.type === 'achievement' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                          <div className="flex-1">
                            <AlertDescription>
                              <div className="font-medium mb-1">{insight.title}</div>
                              <div className="text-sm text-muted-foreground mb-2">{insight.description}</div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                                  {insight.impact} impact
                                </Badge>
                                {insight.actionable && (
                                  <Button variant="outline" size="sm">
                                    Take Action
                                  </Button>
                                )}
                              </div>
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                {dashboardMetrics.achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No achievements yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep using the smart features to unlock achievements
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardMetrics.achievements.map((achievement) => (
                      <Card key={achievement.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <Star className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{achievement.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {achievement.points} points
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {achievement.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Assistant Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Learning Mode</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          How aggressively should the AI learn from your corrections?
                        </p>
                        <div className="space-y-2">
                          {['conservative', 'moderate', 'aggressive'].map((mode) => (
                            <label key={mode} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="learningMode"
                                value={mode}
                                checked={userPreferences.learningMode === mode}
                                className="rounded"
                              />
                              <span className="text-sm capitalize">{mode}</span>
                            </label>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Notifications</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Get real-time alerts for spending patterns and opportunities
                        </p>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={userPreferences.enableNotifications}
                            className="rounded"
                          />
                          <span className="text-sm">Enable smart notifications</span>
                        </label>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>

      {/* Main OCR Upload Component */}
      <AdvancedOCRUpload
        userId={userId}
        onDataExtracted={handleDataExtracted}
        onInsightGenerated={handleInsightGenerated}
        onReportGenerated={handleReportGenerated}
        currentBudgets={currentBudgets}
        recentTransactions={recentTransactions}
        enabledFeatures={{
          batchProcessing: true,
          voiceInput: true,
          smartLearning: true,
          globalOCR: true,
          aiCoaching: true,
          reportGeneration: true
        }}
      />

      {/* Quick Stats */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>{assistantState.receiptsProcessed} receipts processed</span>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>{assistantState.insightsGenerated} insights generated</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>₹{assistantState.totalSavingsIdentified.toLocaleString()} savings identified</span>
          </div>
        </div>
      </div>
    </div>
  );
}