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

export async function createRealTimeNotifications(userId: string) {
  try {
    // Create real-time notifications based on user's actual data
    const { supabase } = await import('./supabase');
    const { RealBudgetService } = await import('./real-budget-service');
    
    // Check budget usage and create warnings if needed
    const budgetUsage = await RealBudgetService.calculateBudgetUsage(userId);
    
    for (const usage of budgetUsage) {
      if (usage.percentageUsed > 80) {
        await NotificationService.createBudgetWarning(
          usage.category,
          usage.budgetAmount,
          usage.spentAmount
        );
      }
    }

    // Check for upcoming recurring transactions
    const { data: recurringTransactions } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('next_occurrence', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    for (const recurring of recurringTransactions || []) {
      await NotificationService.createBillReminder(
        recurring.description || 'Recurring Transaction',
        recurring.amount,
        new Date(recurring.next_occurrence).toISOString()
      );
    }

    // Check for financial goals achievements
    const { data: goals } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    for (const goal of goals || []) {
      if (goal.current_amount >= goal.target_amount) {
        await NotificationService.createGoalAchievement(
          goal.name,
          goal.target_amount
        );
      }
    }

    console.log('Real-time notifications created based on user data');
  } catch (error) {
    console.error('Error creating real-time notifications:', error);
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