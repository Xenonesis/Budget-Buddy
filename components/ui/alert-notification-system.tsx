"use client";

import React, { useEffect, useState } from 'react';
import { useUserPreferences, AlertThreshold } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export interface AlertNotification {
  id: string;
  type: 'budget' | 'spending' | 'balance' | 'category';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  threshold: AlertThreshold;
  triggeredAt: Date;
  read: boolean;
}

interface FinancialData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categorySpending: Record<string, number>;
}

export function AlertNotificationSystem() {
  const { alertThresholds, timeRange, customDateRange } = useUserPreferences();
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real financial data
  const fetchFinancialData = async (): Promise<FinancialData | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      // Calculate date range based on selected time range
      const now = new Date();
      let startDate: Date;
      let endDate: Date = new Date(now);

      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
          break;
        case 'this-week': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
          break;
        }
        case 'last-week': {
          const lastWeekStart = new Date(now);
          lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
          const lastWeekEnd = new Date(now);
          lastWeekEnd.setDate(now.getDate() - now.getDay() - 1);
          startDate = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate());
          endDate = new Date(lastWeekEnd.getFullYear(), lastWeekEnd.getMonth(), lastWeekEnd.getDate(), 23, 59, 59);
          break;
        }
        case 'this-month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'last-month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          break;
        case 'this-year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'last-year':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
          break;
        case 'custom':
          if (customDateRange) {
            startDate = customDateRange.from;
            endDate = customDateRange.to;
          } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          }
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Fetch transactions with date filtering
      const { data: transactions } = await supabase
        .from("transactions")
        .select(`
          *,
          categories:category_id (
            name,
            type
          )
        `)
        .eq("user_id", userData.user.id)
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0]);

      if (!transactions) return null;

      // Calculate financial data
      let totalIncome = 0;
      let totalExpense = 0;
      const categorySpending: Record<string, number> = {};

      transactions.forEach(t => {
        const amount = Number(t.amount) || 0;
        const category = t.categories?.name || 'Uncategorized';

        if (t.type === 'income') {
          totalIncome += amount;
        } else if (t.type === 'expense') {
          totalExpense += amount;
          categorySpending[category] = (categorySpending[category] || 0) + amount;
        }
      });

      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categorySpending
      };
    } catch (error) {
      console.error("Error fetching financial data for alerts:", error);
      return null;
    }
  };

  // Load financial data on mount and when time range changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchFinancialData();
      setFinancialData(data);
      setLoading(false);
    };

    loadData();
  }, [timeRange, customDateRange]);

  // Check thresholds and generate notifications
  useEffect(() => {
    const checkThresholds = async () => {
      if (!financialData || loading) return;

      const newNotifications: AlertNotification[] = [];

      alertThresholds.forEach(threshold => {
        if (!threshold.enabled) return;

        const notification = generateNotification(threshold, financialData);
        if (notification) {
          newNotifications.push(notification);
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
      }
    };

    checkThresholds();
    // Check every 5 minutes
    const interval = setInterval(checkThresholds, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [alertThresholds, financialData, loading]);

  const generateNotification = (
    threshold: AlertThreshold,
    data: FinancialData
  ): AlertNotification | null => {
    const checkCondition = (value: number, thresholdValue: number, condition: string) => {
      if (condition === 'above') return value > thresholdValue;
      if (condition === 'below') return value < thresholdValue;
      if (condition === 'equals') return value === thresholdValue;
      return false;
    };

    let triggered = false;
    let title = '';
    let message = '';
    let severity: 'info' | 'warning' | 'error' = 'info';

    if (threshold.type === 'budget' && checkCondition(data.totalExpense, threshold.threshold, threshold.condition)) {
      triggered = true;
      title = 'Budget Alert';
      message = `Your expenses (${data.totalExpense}) have exceeded your budget threshold of ${threshold.threshold}`;
      severity = 'error';
    } else if (threshold.type === 'spending' && checkCondition(data.totalExpense, threshold.threshold, threshold.condition)) {
      triggered = true;
      title = 'Spending Alert';
      message = `Your total spending has reached ${data.totalExpense}, above your threshold of ${threshold.threshold}`;
      severity = 'warning';
    } else if (threshold.type === 'balance' && checkCondition(data.balance, threshold.threshold, threshold.condition)) {
      triggered = true;
      title = 'Balance Alert';
      message = `Your balance (${data.balance}) is below your threshold of ${threshold.threshold}`;
      severity = 'error';
    } else if (threshold.type === 'category' && threshold.category && data.categorySpending[threshold.category]) {
      const categorySpend = data.categorySpending[threshold.category];
      if (checkCondition(categorySpend, threshold.threshold, threshold.condition)) {
        triggered = true;
        title = 'Category Spending Alert';
        message = `Your ${threshold.category} spending (${categorySpend}) has exceeded the threshold of ${threshold.threshold}`;
        severity = 'warning';
      }
    }

    if (!triggered) return null;

    // Check if notification already exists
    const existingNotification = notifications.find(n =>
      n.threshold.id === threshold.id &&
      new Date().getTime() - n.triggeredAt.getTime() < 24 * 60 * 60 * 1000
    );

    if (existingNotification) return null;

    return {
      id: `alert-${Date.now()}-${threshold.id}`,
      type: threshold.type,
      title,
      message,
      severity,
      threshold,
      triggeredAt: new Date(),
      read: false,
    };
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-500 border-4 border-foreground text-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]';
      case 'warning': return 'bg-[#DFFF00] border-4 border-foreground text-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]';
      default: return 'bg-blue-400 border-4 border-foreground text-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="h-5 w-5 stroke-[3]" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 stroke-[3]" />;
      default: return <Bell className="h-5 w-5 stroke-[3]" />;
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="relative mb-2 h-14 w-14 rounded-none border-4 border-foreground bg-background hover:bg-foreground hover:text-background shadow-[4px_4px_0px_hsl(var(--foreground))] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
      >
        <Bell className="h-7 w-7 stroke-[3]" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-3 -right-3 h-7 w-7 p-0 flex items-center justify-center text-xs font-mono font-black border-2 border-foreground rounded-none bg-[#DFFF00] text-foreground"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {showPanel && (
        <Card className="w-80 max-h-96 overflow-y-auto rounded-none border-4 border-foreground shadow-[8px_8px_0px_hsl(var(--foreground))] mb-4 bg-paper">
          <CardHeader className="pb-3 border-b-4 border-foreground bg-foreground/5 p-4">
            <CardTitle className="text-lg font-mono font-black uppercase tracking-widest flex items-center justify-between text-foreground">
              <span className="flex items-center gap-2">
                <Bell className="h-5 w-5 stroke-[3]" />
                Alerts
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPanel(false)}
                className="rounded-none border-2 border-transparent hover:border-foreground"
              >
                <X className="h-5 w-5 stroke-[3]" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {notifications.length === 0 ? (
              <div className="text-center text-foreground py-6 border-4 border-foreground border-dashed bg-foreground/5">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 stroke-[3]" />
                <p className="font-mono font-bold uppercase tracking-widest text-xs">No alerts at this time</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-0 rounded-none text-sm mb-4 last:mb-0 transition-all",
                    getSeverityColor(notification.severity),
                    !notification.read && "outline outline-4 outline-foreground outline-offset-2"
                  )}
                >
                  <div className="flex items-start justify-between border-b-4 border-foreground bg-background/20 p-2">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(notification.severity)}
                      <span className="font-mono font-black uppercase tracking-widest text-xs">{notification.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-6 w-6 p-0 rounded-none border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-background"
                    >
                      <X className="h-4 w-4 stroke-[3]" />
                    </Button>
                  </div>
                  <div className="p-3 bg-background">
                    <p className="font-mono text-xs font-bold mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between border-t-2 border-foreground pt-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                        {notification.triggeredAt.toLocaleTimeString()}
                      </span>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 px-2 text-[10px] font-mono font-bold uppercase tracking-widest border-2 border-foreground rounded-none hover:bg-foreground hover:text-background transition-colors"
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}