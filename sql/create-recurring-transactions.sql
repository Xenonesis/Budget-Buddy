-- Create recurring_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
  start_date DATE NOT NULL,
  end_date DATE,
  last_generated TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create row-level security policies for recurring transactions
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for recurring transactions
CREATE POLICY "Users can view their own recurring transactions" 
  ON recurring_transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring transactions" 
  ON recurring_transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions" 
  ON recurring_transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions" 
  ON recurring_transactions FOR DELETE 
  USING (auth.uid() = user_id);

-- Add recurring_id column to transactions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'transactions' 
    AND column_name = 'recurring_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN recurring_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added recurring_id column to transactions table';
  END IF;
END $$; 