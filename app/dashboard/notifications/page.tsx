'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Settings,
  Trash2,
  CheckCheck,
  Filter,
  Calendar,
  AlertTriangle,
  Trophy,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NotificationService } from '@/lib/notification-service';
import { Notification, NotificationSettings } from '@/lib/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationsPageSkeleton } from '@/components/ui/page-skeletons';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'unread' | 'bill_reminder' | 'budget_warning' | 'goal_achievement' | 'system_update'
  >('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  // Load notifications and settings
  const loadData = async () => {
    try {
      setLoading(true);
      const [notificationData, settingsData] = await Promise.all([
        NotificationService.getNotifications(100),
        NotificationService.getNotificationSettings(),
      ]);
      setNotifications(notificationData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update notification settings
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = await NotificationService.updateNotificationSettings(newSettings);
      setSettings(updatedSettings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'bill_reminder':
        return <Calendar className="h-5 w-5" />;
      case 'budget_warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'goal_achievement':
        return <Trophy className="h-5 w-5" />;
      case 'system_update':
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Get notification color
  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'urgent') return 'text-red-500 bg-red-50 dark:bg-red-950/20';
    if (priority === 'high') return 'text-orange-500 bg-orange-50 dark:bg-orange-950/20';

    switch (type) {
      case 'bill_reminder':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'budget_warning':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'goal_achievement':
        return 'text-green-500 bg-green-50 dark:bg-green-950/20';
      case 'system_update':
        return 'text-gray-500 bg-gray-50 dark:bg-gray-950/20';
      default:
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  // Filter and sort notifications
  const filteredAndSortedNotifications = notifications
    .filter((notification) => {
      if (filter === 'unread') return !notification.is_read;
      if (filter !== 'all') return notification.type === filter;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'priority':
          const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          const aPriority = a.priority || 'low';
          const bPriority = b.priority || 'low';
          return priorityOrder[bPriority] - priorityOrder[aPriority];
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return <NotificationsPageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-6 lg:px-8 lg:py-8 max-w-screen-xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold md:text-4xl bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
          Notifications
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Manage your notifications and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All ({notifications.length})</SelectItem>
                        <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
                        <SelectItem value="bill_reminder">Bill Reminders</SelectItem>
                        <SelectItem value="budget_warning">Budget Warnings</SelectItem>
                        <SelectItem value="goal_achievement">Goal Achievements</SelectItem>
                        <SelectItem value="system_update">System Updates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {unreadCount > 0 && (
                  <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          {filteredAndSortedNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Bell className="h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-sm text-center">
                    {filter === 'unread'
                      ? "You're all caught up! No unread notifications."
                      : "You don't have any notifications yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredAndSortedNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={cn(
                        'hover:shadow-md transition-shadow cursor-pointer group',
                        !notification.is_read && 'ring-2 ring-blue-200 dark:ring-blue-800'
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'flex-shrink-0 p-3 rounded-full',
                              getNotificationColor(notification.type, notification.priority)
                            )}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3
                                className={cn(
                                  'text-base font-medium',
                                  !notification.is_read && 'font-semibold'
                                )}
                              >
                                {notification.title}
                              </h3>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {notification.priority === 'urgent' && (
                                  <Badge variant="destructive">Urgent</Badge>
                                )}
                                {notification.priority === 'high' && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-orange-100 text-orange-800"
                                  >
                                    High
                                  </Badge>
                                )}
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mt-1 mb-3">
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                })}
                              </span>

                              <div className="flex items-center gap-2">
                                {notification.action_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      (window.location.href = notification.action_url!)
                                    }
                                  >
                                    {notification.action_label || 'View'}
                                  </Button>
                                )}
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    Mark as Read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bill-reminders">Bill Reminders</Label>
                      <Switch
                        id="bill-reminders"
                        checked={settings?.bill_reminders || false}
                        onCheckedChange={(checked) => updateSettings({ bill_reminders: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="budget-warnings">Budget Warnings</Label>
                      <Switch
                        id="budget-warnings"
                        checked={settings?.budget_warnings || false}
                        onCheckedChange={(checked) => updateSettings({ budget_warnings: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="goal-achievements">Goal Achievements</Label>
                      <Switch
                        id="goal-achievements"
                        checked={settings?.goal_achievements || false}
                        onCheckedChange={(checked) =>
                          updateSettings({ goal_achievements: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="system-updates">System Updates</Label>
                      <Switch
                        id="system-updates"
                        checked={settings?.system_updates || false}
                        onCheckedChange={(checked) => updateSettings({ system_updates: checked })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Delivery Methods</h4>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <Switch
                        id="email-notifications"
                        checked={settings?.email_notifications || false}
                        onCheckedChange={(checked) =>
                          updateSettings({ email_notifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <Switch
                        id="push-notifications"
                        checked={settings?.push_notifications || false}
                        onCheckedChange={(checked) =>
                          updateSettings({ push_notifications: checked })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Timing</h4>

                    <div className="space-y-2">
                      <Label htmlFor="reminder-days">Bill Reminder Days</Label>
                      <Select
                        value={settings?.reminder_days_before?.toString() || '3'}
                        onValueChange={(value) =>
                          updateSettings({ reminder_days_before: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day before</SelectItem>
                          <SelectItem value="3">3 days before</SelectItem>
                          <SelectItem value="5">5 days before</SelectItem>
                          <SelectItem value="7">1 week before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget-threshold">Budget Warning Threshold</Label>
                      <Select
                        value={settings?.budget_warning_threshold?.toString() || '80'}
                        onValueChange={(value) =>
                          updateSettings({ budget_warning_threshold: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50% of budget</SelectItem>
                          <SelectItem value="70">70% of budget</SelectItem>
                          <SelectItem value="80">80% of budget</SelectItem>
                          <SelectItem value="90">90% of budget</SelectItem>
                          <SelectItem value="100">100% of budget</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
