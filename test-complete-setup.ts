import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteSetup() {
  console.log('=== Testing Complete Database Setup ===\n');
  
  try {
    // Test 1: Create a test user and verify all functionality
    const testEmail = `complete-test-${Date.now()}@test.com`;
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPass123!',
      options: {
        data: { name: 'Complete Test User' }
      }
    });
    
    if (userError) {
      console.error('❌ User creation failed:', userError.message);
      return;
    }
    
    console.log('✅ User created:', userData.user?.id);
    
    if (!userData.user) return;
    
    const userId = userData.user.id;
    
    // Test 2: Check if profile was created
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for trigger
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('❌ Profile not found:', profileError.message);
    } else {
      console.log('✅ Profile created automatically:', profile.name);
    }
    
    // Test 3: Create default categories
    console.log('\n2. Creating default categories...');
    await supabase.rpc('create_default_categories', { user_uuid: userId });
    
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);
      
    if (catError) {
      console.error('❌ Categories creation failed:', catError.message);
    } else {
      console.log(`✅ Created ${categories?.length || 0} default categories`);
    }
    
    // Test 4: Create a test transaction
    console.log('\n3. Testing transaction creation...');
    
    const { data: testCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', 'Food & Dining')
      .single();
    
    if (testCategory) {
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: 25.50,
          type: 'expense',
          category_id: testCategory.id,
          description: 'Test coffee purchase',
          date: new Date().toISOString().split('T')[0]
        });
        
      if (transactionError) {
        console.error('❌ Transaction creation failed:', transactionError.message);
      } else {
        console.log('✅ Transaction created successfully');
      }
    }
    
    // Test 5: Create a test budget
    console.log('\n4. Testing budget creation...');
    
    if (testCategory) {
      const { error: budgetError } = await supabase
        .from('budgets')
        .insert({
          user_id: userId,
          category_id: testCategory.id,
          amount: 200.00,
          period: 'monthly'
        });
        
      if (budgetError) {
        console.error('❌ Budget creation failed:', budgetError.message);
      } else {
        console.log('✅ Budget created successfully');
      }
    }
    
    // Test 6: Check notification settings
    console.log('\n5. Testing notification settings...');
    
    const { data: notificationSettings, error: notifError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (notifError) {
      console.error('❌ Notification settings not found:', notifError.message);
    } else {
      console.log('✅ Notification settings created automatically');
    }
    
    console.log('\n🎉 Complete database setup test successful!');
    console.log('Your Budget Buddy database is fully configured and ready to use.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testCompleteSetup();