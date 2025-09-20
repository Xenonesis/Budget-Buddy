import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTriggerIssue() {
  console.log('=== Fixing Supabase Trigger Issue ===\n');
  
  try {
    console.log('Step 1: Dropping problematic trigger...');
    
    // Drop the trigger that's causing issues
    const dropTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropTriggerSQL 
    });
    
    if (dropError) {
      console.log('Note: Could not drop trigger via RPC (expected - need admin access)');
      console.log('Manual fix required in Supabase dashboard');
    } else {
      console.log('✅ Trigger dropped successfully');
    }
    
    console.log('\nStep 2: Testing registration without trigger...');
    
    // Test registration
    const testEmail = `fix-test-${Date.now()}@test.com`;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPass123!',
      options: {
        data: { name: 'Test User' }
      }
    });
    
    if (signUpError) {
      console.error('❌ Registration still failing:', signUpError.message);
      return;
    }
    
    console.log('✅ User creation successful:', data.user?.id);
    
    // Test manual profile creation
    if (data.user) {
      console.log('Step 3: Testing manual profile creation...');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: testEmail,
          name: 'Test User',
          currency: 'USD'
        });
        
      if (profileError) {
        console.error('❌ Profile creation failed:', profileError.message);
      } else {
        console.log('✅ Profile created successfully!');
        console.log('\n🎉 Fix confirmed! Registration should work now.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during fix:', error);
  }
}

fixTriggerIssue();