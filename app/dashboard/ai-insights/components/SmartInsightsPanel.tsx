import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Lightbulb, 
  CheckCircle,
  X,
  Info,
  Zap,
  Brain,
  BarChart3
} from 'lucide-react';
import { generateProactiveAlerts, acknowledgeAlert, type SmartAlert } from '@/lib/ai-smart-alerts';
import { generatePredictiveInsights } from '@/lib/ai-intelligence-engine';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { toast } from 'sonner';

interface SmartInsightsPanelProps {
  onSendMessage?: (message: string) => void;
  className?: string;
}

export function SmartInsightsPanel({ onSendMessage, className = "" }: SmartInsightsPanelProps) {
  const { userId } = useUserPreferences();
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      loadSmartInsights();
    }
  }, [userId]);

  const loadSmartInsights = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Generate new proactive alerts
      const newAlerts = await generateProactiveAlerts(userId);
      
      // Load predictive insights
      const predictions = await generatePredictiveInsights(userId);
      
      setAlerts(newAlerts);
      setPredictiveInsights(predictions);
      
      if (newAlerts.length > 0) {
        toast.success(`Found ${newAlerts.length} new insights for you!`);
      }
    } catch (error) {
      console.error('Error loading smart insights:', error);
      toast.error('Failed to load smart insights');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSmartInsights();
    setRefreshing(false);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success('Alert acknowledged');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleTakeAction = (alert: SmartAlert) => {
    if (onSendMessage && alert.suggestedActions.length > 0) {
      const action = alert.suggestedActions[0];
      onSendMessage(`Help me with: ${action}`);
    }
  };

  const getSeverityIcon = (severity: SmartAlert['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: SmartAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: SmartAlert['type']) => {
    switch (type) {
      case 'budget_warning': return <AlertTriangle className="h-4 w-4" />;
      case 'spending_anomaly': return <TrendingUp className="h-4 w-4" />;
      case 'goal_milestone': return <Target className="h-4 w-4" />;
      case 'opportunity': return <Lightbulb className="h-4 w-4" />;
      case 'prediction': return <Brain className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Analyzing your financial data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Smart Insights
            {alerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <TrendingUp className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Critical and High Priority Alerts */}
        {alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').map(alert => (
          <Alert key={alert.id} variant={getSeverityColor(alert.severity) as any} className="border-l-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(alert.type)}
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                  </div>
                  <AlertDescription className="text-xs mb-3">
                    {alert.message}
                  </AlertDescription>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {alert.actionRequired && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTakeAction(alert)}
                        className="h-7 text-xs"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Take Action
                      </Button>
                    )}
                    
                    {alert.dismissible && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="h-7 text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Got it
                      </Button>
                    )}
                  </div>

                  {/* Suggested Actions */}
                  {alert.suggestedActions.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Suggestions:</strong>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        {alert.suggestedActions.slice(0, 2).map((action, index) => (
                          <li key={`action-${alert.id}-${index}`} className="truncate">{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {alert.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAcknowledgeAlert(alert.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </Alert>
        ))}

        {/* Medium and Low Priority Insights */}
        <div className="space-y-2">
          {alerts.filter(alert => alert.severity === 'medium' || alert.severity === 'low').map(alert => (
            <div key={alert.id} className="p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  {getTypeIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm">{alert.title}</h5>
                      <Badge variant="outline" className="text-xs">
                        {alert.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {alert.message}
                    </p>
                    
                    {alert.actionRequired && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTakeAction(alert)}
                        className="h-6 text-xs"
                      >
                        Learn More
                      </Button>
                    )}
                  </div>
                </div>
                
                {alert.dismissible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Predictive Insights */}
        {predictiveInsights.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Predictions
            </h4>
            <div className="space-y-2">
              {predictiveInsights.slice(0, 3).map((insight, index) => (
                <div key={`insight-${insight.id || index}`} className="p-3 bg-gradient-to-r from-primary/5 to-blue-50/50 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-2">
                    <BarChart3 className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-medium text-sm mb-1">{insight.title}</h5>
                      <p className="text-xs text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.timeframe.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {alerts.length === 0 && predictiveInsights.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="font-semibold text-sm mb-2">All Good! 🎉</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Your finances are looking healthy. No urgent alerts or recommendations at this time.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Check for Updates
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        {alerts.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSendMessage?.('Analyze my spending patterns')}
                className="h-7 text-xs"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Analyze Spending
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSendMessage?.('Help me create a budget plan')}
                className="h-7 text-xs"
              >
                <Target className="h-3 w-3 mr-1" />
                Budget Help
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSendMessage?.('Show me savings opportunities')}
                className="h-7 text-xs"
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                Find Savings
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}