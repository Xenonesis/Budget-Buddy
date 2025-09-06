-- Reset tables (if they exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP VIEW IF EXISTS monthly_spending;
DROP VIEW IF EXISTS budget_vs_actual;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS profiles;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE budgets (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  period TEXT CHECK (period IN ('weekly', 'monthly', 'yearly')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, period)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own transactions" ON transactions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON transactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions 
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own budgets" ON budgets 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets" ON budgets 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" ON budgets 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" ON budgets 
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views
CREATE OR REPLACE VIEW monthly_spending AS
SELECT 
    user_id,
    date_trunc('month', date) as month,
    category,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income
FROM transactions
GROUP BY user_id, date_trunc('month', date), category;

CREATE OR REPLACE VIEW budget_vs_actual AS
SELECT 
    b.user_id,
    b.category,
    b.amount as budget_amount,
    b.period,
    COALESCE(SUM(t.amount), 0) as actual_amount,
    b.amount - COALESCE(SUM(t.amount), 0) as difference
FROM budgets b
LEFT JOIN transactions t ON 
    b.user_id = t.user_id AND 
    b.category = t.category AND 
    t.type = 'expense' AND
    CASE 
        WHEN b.period = 'weekly' THEN t.date >= date_trunc('week', CURRENT_DATE)
        WHEN b.period = 'monthly' THEN t.date >= date_trunc('month', CURRENT_DATE)
        WHEN b.period = 'yearly' THEN t.date >= date_trunc('year', CURRENT_DATE)
    END
GROUP BY b.user_id, b.category, b.amount, b.period;

-- Create indexes
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);
CREATE INDEX IF NOT EXISTS transactions_category_idx ON transactions(category);
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON budgets(user_id);
CREATE INDEX IF NOT EXISTS budgets_category_idx ON budgets(category);
CREATE INDEX IF NOT EXISTS budgets_period_idx ON budgets(period);

-- Add comments
COMMENT ON TABLE profiles IS 'User profiles containing personal information and preferences';
COMMENT ON TABLE transactions IS 'All financial transactions (income and expenses) for users';
COMMENT ON TABLE budgets IS 'Budget limits for different categories and periods';
COMMENT ON VIEW monthly_spending IS 'Monthly aggregated spending and income by category';
COMMENT ON VIEW budget_vs_actual IS 'Comparison between budget limits and actual spending';