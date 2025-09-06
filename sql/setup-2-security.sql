-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" 
  ON transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
  ON transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON transactions FOR DELETE 
  USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view their own budgets" 
  ON budgets FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" 
  ON budgets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
  ON budgets FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
  ON budgets FOR DELETE 
  USING (auth.uid() = user_id);