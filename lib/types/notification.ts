export interface Notification {
  id: string;
  user_id: string;
  type: 'bill_reminder' | 'budget_warning' | 'goal_achievement' | 'system_update';
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  scheduled_for?: string;
  expires_at?: string;
  action_url?: string;
  action_label?: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  bill_reminders: boolean;
  budget_warnings: boolean;
  goal_achievements: boolean;
  system_updates: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  reminder_days_before: number;
  budget_warning_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  type: Notification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: Notification['priority'];
  scheduled_for?: string;
  expires_at?: string;
  action_url?: string;
  action_label?: string;
}

export interface NotificationCenterProps {
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}