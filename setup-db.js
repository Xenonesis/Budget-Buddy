const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Database Setup Tool\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Present' : 'Missing', '\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(sql, description) {
  console.log(`📝 ${description}...`);
  try {
    // Try using the RPC method if available
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.log(`❌ RPC method failed: ${error.message}`);
      
      // Try executing individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          // For CREATE TABLE statements, try using raw SQL execution
          if (statement.toUpperCase().includes('CREATE TABLE')) {
            try {
              const { error: createError } = await supabase
                .from('_supabase_schema')
                .select('*')
                .limit(0); // This is just to test connection
                
              console.log(`⚠️  Cannot execute DDL directly via REST API`);
              console.log(`   Statement: ${statement.substring(0, 50)}...`);
            } catch (e) {
              console.log(`❌ Connection test failed`);
            }
          }
        }
      }
      return false;
    } else {
      console.log(`✅ ${description} completed successfully`);
      return true;
    }
  } catch (e) {
    console.log(`❌ Exception: ${e.message}`);
    return false;
  }
}

async function testTables() {
  console.log('\n🧪 Testing table accessibility...\n');
  
  // Test goals table
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('count')
      .limit(0);
      
    if (error) {
      console.log('❌ Goals table:', error.message);
    } else {
      console.log('✅ Goals table is accessible');
    }
  } catch (e) {
    console.log('❌ Goals table error:', e.message);
  }
  
  // Test smart_alerts table
  try {
    const { data, error } = await supabase
      .from('smart_alerts')
      .select('count')
      .limit(0);
      
    if (error) {
      console.log('❌ Smart alerts table:', error.message);
    } else {
      console.log('✅ Smart alerts table is accessible');
    }
  } catch (e) {
    console.log('❌ Smart alerts table error:', e.message);
  }
  
  // Test recurring_transactions with join
  try {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        id,
        type,
        amount,
        categories!category_id (name)
      `)
      .limit(1);
      
    if (error) {
      console.log('❌ Recurring transactions join:', error.message);
    } else {
      console.log('✅ Recurring transactions join works');
    }
  } catch (e) {
    console.log('❌ Recurring transactions join error:', e.message);
  }
}

async function main() {
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./sql/create-missing-tables.sql', 'utf8');
    
    // Try to execute the SQL
    const success = await executeSQL(sqlContent, 'Creating missing tables');
    
    if (!success) {
      console.log('\n⚠️  Direct SQL execution failed.');
      console.log('📋 Please run the following SQL manually in Supabase Dashboard:\n');
      console.log('========================================');
      console.log(sqlContent);
      console.log('========================================\n');
    }
    
    // Test the tables regardless
    await testTables();
    
    console.log('\n🎉 Setup process completed!');
    console.log('\nNext steps:');
    console.log('1. If tables were not created automatically, copy the SQL above');
    console.log('2. Go to your Supabase Dashboard > SQL Editor');
    console.log('3. Paste and run the SQL');
    console.log('4. Refresh your Budget Buddy app');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

main();