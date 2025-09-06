-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
  start_date DATE NOT NULL,
  end_date DATE,
  last_generated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  active BOOLEAN DEFAULT true
);

-- Add RLS policies
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to select/read their own recurring transactions
CREATE POLICY recurring_transactions_select_policy
  ON recurring_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own recurring transactions
CREATE POLICY recurring_transactions_insert_policy
  ON recurring_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own recurring transactions
CREATE POLICY recurring_transactions_update_policy
  ON recurring_transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add foreign key to transactions to reference recurring_transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS recurring_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- Create index to improve performance when searching transactions by recurring_id
CREATE INDEX IF NOT EXISTS idx_transactions_recurring_id ON transactions(recurring_id); 