import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDatabaseIssue() {
  console.log('=== Supabase Database Diagnostic ===\n');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...');
    const { data: health, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(0);
    
    if (healthError) {
      console.error('❌ Connection failed:', healthError.message);
      return;
    }
    console.log('✅ Supabase connection successful\n');

    // Test 2: Check profiles table structure
    console.log('2. Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (profilesError) {
      console.log('❌ Profiles table access error:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible\n');
    }

    // Test 3: Test registration process step by step
    console.log('3. Testing registration process...');
    
    const testEmail = `debug-${Date.now()}@test.com`;
    const testPassword = 'TestPass123!';
    const testName = 'Debug User';
    
    console.log(`   Registering: ${testEmail}`);
    
    // Step 3a: Test signup only (without profile creation)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
          preferred_currency: 'USD',
        }
      }
    });

    if (authError) {
      console.error('❌ Auth signup failed:', {
        message: authError.message,
        status: authError.status,
        code: authError.code
      });
      return;
    }
    
    console.log('✅ User created successfully:', authData.user?.id);
    
    // Step 3b: Wait a moment for any triggers to fire
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3c: Check if profile was created by trigger
    if (authData.user) {
      console.log('   Checking if profile was created by trigger...');
      
      const { data: triggerProfile, error: triggerProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (triggerProfileError) {
        console.log('❌ Trigger did not create profile:', triggerProfileError.message);
        
        // Step 3d: Try manual profile creation
        console.log('   Attempting manual profile creation...');
        const { error: manualProfileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: testEmail,
            name: testName,
            currency: 'USD'
          });
          
        if (manualProfileError) {
          console.error('❌ Manual profile creation failed:', {
            message: manualProfileError.message,
            code: manualProfileError.code,
            details: manualProfileError.details,
            hint: manualProfileError.hint
          });
        } else {
          console.log('✅ Manual profile creation successful');
        }
      } else {
        console.log('✅ Profile created successfully by trigger:', triggerProfile.id);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

diagnoseDatabaseIssue();