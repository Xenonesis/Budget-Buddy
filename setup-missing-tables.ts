import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMissingTables() {
  console.log('🔧 Creating missing database tables...\n');
  
  try {
    // Read the SQL file
    const sqlFilePath = join(process.cwd(), 'sql', 'create-missing-tables.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try alternative approach - execute each statement separately
      console.log('🔄 Trying to execute statements separately...\n');
      
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            if (stmtError) {
              console.log(`❌ Error executing statement: ${statement.substring(0, 50)}...`);
              console.log(`   Error: ${stmtError.message}`);
            } else {
              console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
            }
          } catch (e) {
            console.log(`❌ Exception executing: ${statement.substring(0, 50)}...`);
          }
        }
      }
    } else {
      console.log('✅ SQL executed successfully');
    }
    
    // Test the created tables
    console.log('\n🧪 Testing created tables...\n');
    
    // Test goals table
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('count')
      .limit(0);
      
    if (goalsError) {
      console.log('❌ Goals table test failed:', goalsError.message);
    } else {
      console.log('✅ Goals table is accessible');
    }
    
    // Test smart_alerts table
    const { data: alerts, error: alertsError } = await supabase
      .from('smart_alerts')
      .select('count')
      .limit(0);
      
    if (alertsError) {
      console.log('❌ Smart alerts table test failed:', alertsError.message);
    } else {
      console.log('✅ Smart alerts table is accessible');
    }
    
    // Test recurring_transactions with categories join
    const { data: recurring, error: recurringError } = await supabase
      .from('recurring_transactions')
      .select(`
        id,
        type,
        amount,
        categories!category_id (name)
      `)
      .limit(0);
      
    if (recurringError) {
      console.log('❌ Recurring transactions join test failed:', recurringError.message);
    } else {
      console.log('✅ Recurring transactions with categories join works');
    }
    
    console.log('\n✨ Database setup completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createMissingTables();