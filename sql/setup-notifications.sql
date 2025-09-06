-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bill_reminder', 'budget_warning', 'goal_achievement', 'system_update')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  action_url VARCHAR(500),
  action_label VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Create notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bill_reminders BOOLEAN DEFAULT TRUE,
  budget_warnings BOOLEAN DEFAULT TRUE,
  goal_achievements BOOLEAN DEFAULT TRUE,
  system_updates BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT FALSE,
  reminder_days_before INTEGER DEFAULT 3,
  budget_warning_threshold INTEGER DEFAULT 80, -- percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notification settings
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notification settings
CREATE POLICY "Users can view their own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" ON notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create notification settings for new users
CREATE OR REPLACE FUNCTION create_notification_settings_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification settings when a user is created
CREATE TRIGGER on_auth_user_created_notification_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_notification_settings_for_user();

-- Function to create budget warning notifications
CREATE OR REPLACE FUNCTION check_budget_warnings()
RETURNS void AS $$
DECLARE
  budget_record RECORD;
  spending_amount NUMERIC;
  warning_threshold INTEGER;
  user_settings RECORD;
BEGIN
  -- Loop through all active budgets
  FOR budget_record IN 
    SELECT b.*, p.currency, ns.budget_warning_threshold, ns.budget_warnings
    FROM budgets b
    JOIN profiles p ON b.user_id = p.id
    JOIN notification_settings ns ON b.user_id = ns.user_id
    WHERE ns.budget_warnings = TRUE
  LOOP
    -- Calculate current month spending for this budget category
    SELECT COALESCE(SUM(amount), 0) INTO spending_amount
    FROM transactions
    WHERE user_id = budget_record.user_id
      AND category_id = budget_record.category_id
      AND type = 'expense'
      AND DATE_TRUNC('month', date::date) = DATE_TRUNC('month', CURRENT_DATE);
    
    -- Check if spending exceeds warning threshold
    IF spending_amount >= (budget_record.amount * budget_record.budget_warning_threshold / 100.0) THEN
      -- Check if we haven't already sent a warning this month
      IF NOT EXISTS (
        SELECT 1 FROM notifications
        WHERE user_id = budget_record.user_id
          AND type = 'budget_warning'
          AND data->>'category_id' = budget_record.category_id::text
          AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
      ) THEN
        -- Create budget warning notification
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          data,
          priority,
          action_url,
          action_label
        ) VALUES (
          budget_record.user_id,
          'budget_warning',
          'Budget Alert: ' || (SELECT name FROM categories WHERE id = budget_record.category_id),
          'You have spent ' || spending_amount || ' out of your ' || budget_record.amount || ' budget for ' || (SELECT name FROM categories WHERE id = budget_record.category_id) || ' this month.',
          jsonb_build_object(
            'category_id', budget_record.category_id,
            'budget_amount', budget_record.amount,
            'spent_amount', spending_amount,
            'percentage', ROUND((spending_amount / budget_record.amount * 100)::numeric, 1)
          ),
          CASE 
            WHEN spending_amount >= budget_record.amount THEN 'urgent'
            WHEN spending_amount >= (budget_record.amount * 0.9) THEN 'high'
            ELSE 'medium'
          END,
          '/dashboard/budget',
          'View Budget'
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create bill reminder notifications
CREATE OR REPLACE FUNCTION create_bill_reminders()
RETURNS void AS $$
DECLARE
  transaction_record RECORD;
  reminder_date DATE;
  user_settings RECORD;
BEGIN
  -- Loop through recurring transactions that could be bills
  FOR transaction_record IN
    SELECT t.*, ns.reminder_days_before, ns.bill_reminders
    FROM transactions t
    JOIN notification_settings ns ON t.user_id = ns.user_id
    WHERE t.type = 'expense'
      AND ns.bill_reminders = TRUE
      AND t.description ILIKE ANY(ARRAY['%bill%', '%subscription%', '%rent%', '%mortgage%', '%insurance%', '%utility%'])
  LOOP
    -- Calculate next reminder date (assuming monthly bills)
    reminder_date := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' * transaction_record.reminder_days_before)::date;
    
    -- Check if we should create a reminder for this month
    IF reminder_date = CURRENT_DATE THEN
      -- Check if we haven't already sent a reminder this month
      IF NOT EXISTS (
        SELECT 1 FROM notifications
        WHERE user_id = transaction_record.user_id
          AND type = 'bill_reminder'
          AND data->>'transaction_id' = transaction_record.id::text
          AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
      ) THEN
        -- Create bill reminder notification
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          data,
          priority,
          action_url,
          action_label
        ) VALUES (
          transaction_record.user_id,
          'bill_reminder',
          'Bill Reminder: ' || COALESCE(transaction_record.description, 'Upcoming Payment'),
          'Don''t forget about your upcoming payment of ' || transaction_record.amount || ' due soon.',
          jsonb_build_object(
            'transaction_id', transaction_record.id,
            'amount', transaction_record.amount,
            'category', transaction_record.category,
            'due_date', (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::date
          ),
          'medium',
          '/dashboard/transactions',
          'View Transactions'
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;