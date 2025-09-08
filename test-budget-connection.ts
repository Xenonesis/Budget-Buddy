import { supabase } from './lib/supabase';

async function testBudgetConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('Authentication error:', authError);
      return;
    }
    
    console.log('Authenticated user:', user?.id || 'No user');
    
    // Test fetching budgets (this will fail if not authenticated, but that's expected)
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('Error fetching budgets:', error);
      // This is expected if not authenticated
      console.log('This error is expected if not authenticated');
    } else {
      console.log('Successfully fetched budgets:', data);
    }
    
    // Test fetching categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
      
    if (categoriesError) {
      console.log('Error fetching categories:', categoriesError);
      // This is expected if not authenticated
      console.log('This error is expected if not authenticated');
    } else {
      console.log('Successfully fetched categories:', categories);
    }
    
    console.log('Test completed');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testBudgetConnection();