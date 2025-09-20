import { supabase } from './supabase';
import { Notification, NotificationSettings, CreateNotificationData } from './types/notification';

export class NotificationService {
  // Get all notifications for the current user
  static async getNotifications(limit = 50, offset = 0): Promise<Notification[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  // Get unread notification count
  static async getUnreadCount(): Promise<number> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.user.id)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userData.user.id)
      .eq('is_read', false);

    if (error) throw error;
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Create a new notification
  static async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userData.user.id,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return notification;
  }

  // Get notification settings
  static async getNotificationSettings(): Promise<NotificationSettings | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Update notification settings
  static async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: userData.user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Create budget warning notification
  static async createBudgetWarning(categoryId: string, budgetAmount: number, spentAmount: number): Promise<void> {
    const percentage = Math.round((spentAmount / budgetAmount) * 100);
    const priority = spentAmount >= budgetAmount ? 'urgent' : spentAmount >= budgetAmount * 0.9 ? 'high' : 'medium';

    await this.createNotification({
      type: 'budget_warning',
      title: `Budget Alert: ${percentage}% spent`,
      message: `You've spent $${spentAmount.toFixed(2)} of your $${budgetAmount.toFixed(2)} budget this month.`,
      data: {
        category_id: categoryId,
        budget_amount: budgetAmount,
        spent_amount: spentAmount,
        percentage,
      },
      priority,
      action_url: '/dashboard/budget',
      action_label: 'View Budget',
    });
  }

  // Create bill reminder notification
  static async createBillReminder(description: string, amount: number, dueDate: string): Promise<void> {
    await this.createNotification({
      type: 'bill_reminder',
      title: `Bill Reminder: ${description}`,
      message: `Don't forget about your upcoming payment of $${amount.toFixed(2)} due on ${new Date(dueDate).toLocaleDateString()}.`,
      data: {
        amount,
        due_date: dueDate,
        description,
      },
      priority: 'medium',
      action_url: '/dashboard/transactions',
      action_label: 'View Transactions',
    });
  }

  // Create goal achievement notification
  static async createGoalAchievement(goalName: string, targetAmount: number): Promise<void> {
    await this.createNotification({
      type: 'goal_achievement',
      title: `🎉 Goal Achieved: ${goalName}`,
      message: `Congratulations! You've reached your savings goal of $${targetAmount.toFixed(2)}.`,
      data: {
        goal_name: goalName,
        target_amount: targetAmount,
      },
      priority: 'high',
      action_url: '/dashboard/budget',
      action_label: 'View Goals',
    });
  }

  // Create system update notification
  static async createSystemUpdate(title: string, message: string, actionUrl?: string): Promise<void> {
    await this.createNotification({
      type: 'system_update',
      title,
      message,
      data: {},
      priority: 'low',
      action_url: actionUrl,
      action_label: actionUrl ? 'Learn More' : undefined,
    });
  }

  // Subscribe to real-time notifications
  static subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
  }
}