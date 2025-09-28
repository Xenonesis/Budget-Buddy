import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const results = [];
    
    // Create goals table
    const goalsSQL = `
      CREATE TABLE IF NOT EXISTS goals (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          target_amount DECIMAL(15,2),
          current_amount DECIMAL(15,2) DEFAULT 0,
          deadline DATE,
          category VARCHAR(100),
          priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
      ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Users can view their own goals" ON goals
          FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own goals" ON goals
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own goals" ON goals
          FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete their own goals" ON goals
          FOR DELETE USING (auth.uid() = user_id);
    `;
    
    // Create smart_alerts table
    const smartAlertsSQL = `
      CREATE TABLE IF NOT EXISTS smart_alerts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('opportunity', 'prediction', 'warning', 'insight', 'recommendation')),
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
          priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          category VARCHAR(100),
          amount DECIMAL(15,2),
          metadata JSONB DEFAULT '{}',
          acknowledged BOOLEAN DEFAULT FALSE,
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_smart_alerts_user_id ON smart_alerts(user_id);
      ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Users can view their own smart alerts" ON smart_alerts
          FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own smart alerts" ON smart_alerts
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own smart alerts" ON smart_alerts
          FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete their own smart alerts" ON smart_alerts
          FOR DELETE USING (auth.uid() = user_id);
    `;
    
    // Execute goals table creation
    try {
      const { error: goalsError } = await supabase.rpc('exec_sql', { sql: goalsSQL });
      if (goalsError) {
        results.push({ table: 'goals', success: false, error: goalsError.message });
      } else {
        results.push({ table: 'goals', success: true });
      }
    } catch (e) {
      results.push({ table: 'goals', success: false, error: 'Failed to execute SQL' });
    }
    
    // Execute smart_alerts table creation
    try {
      const { error: alertsError } = await supabase.rpc('exec_sql', { sql: smartAlertsSQL });
      if (alertsError) {
        results.push({ table: 'smart_alerts', success: false, error: alertsError.message });
      } else {
        results.push({ table: 'smart_alerts', success: true });
      }
    } catch (e) {
      results.push({ table: 'smart_alerts', success: false, error: 'Failed to execute SQL' });
    }
    
    // Test the tables
    const tests = [];
    
    // Test goals table
    const { error: goalsTestError } = await supabase.from('goals').select('count').limit(0);
    tests.push({ table: 'goals', accessible: !goalsTestError, error: goalsTestError?.message });
    
    // Test smart_alerts table
    const { error: alertsTestError } = await supabase.from('smart_alerts').select('count').limit(0);
    tests.push({ table: 'smart_alerts', accessible: !alertsTestError, error: alertsTestError?.message });
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      results,
      tests
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}