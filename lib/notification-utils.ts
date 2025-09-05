import { NotificationService } from './notification-service';

// Utility functions for creating different types of notifications

export async function checkAndCreateBudgetWarnings() {
  try {
    // This would typically be called by a cron job or background process
    // For demo purposes, we can call this manually
    
    // Get user's budgets and spending data
    // Calculate if any budgets are approaching their limits
    // Create notifications as needed
    
    console.log('Budget warning check completed');
  } catch (error) {
    console.error('Error checking budget warnings:', error);
  }
}

export async function createSampleNotifications() {
  try {
    // Create sample notifications for demonstration
    await NotificationService.createBillReminder(
      'Netflix Subscription',
      15.99,
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
    );

    await NotificationService.createBudgetWarning(
      'sample-category-id',
      500,
      425
    );

    await NotificationService.createGoalAchievement(
      'Emergency Fund',
      1000
    );

    await NotificationService.createSystemUpdate(
      'New Feature: AI Insights',
      'We\'ve added AI-powered financial insights to help you make better decisions. Check out the new AI Insights page!',
      '/dashboard/ai-insights'
    );

    console.log('Sample notifications created');
  } catch (error) {
    console.error('Error creating sample notifications:', error);
  }
}

export function getNotificationTypeLabel(type: string): string {
  switch (type) {
    case 'bill_reminder':
      return 'Bill Reminder';
    case 'budget_warning':
      return 'Budget Warning';
    case 'goal_achievement':
      return 'Goal Achievement';
    case 'system_update':
      return 'System Update';
    default:
      return 'Notification';
  }
}

export function getNotificationPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-50 dark:bg-red-950/20';
    case 'high':
      return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
    case 'medium':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
    case 'low':
      return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
    default:
      return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
  }
}

export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}