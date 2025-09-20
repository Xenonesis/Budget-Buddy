import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRegistration() {
  console.log('Testing user registration process...');
  
  try {
    // Test signup with a fake email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testName = 'Test User';
    
    console.log(`Attempting to register: ${testEmail}`);
    
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
          preferred_currency: 'USD',
        },
        emailRedirectTo: `http://localhost:3001/auth/login?message=Account confirmed! Please sign in.`
      }
    });

    if (signUpError) {
      console.error('Signup error:', signUpError);
      return;
    }

    console.log('Signup successful!', data.user?.id);

    if (data.user) {
      console.log('Attempting to create profile...');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: testEmail,
          name: testName,
          currency: 'USD'
        });
        
      if (profileError) {
        console.error("Profile creation error:", profileError);
        console.error("Error code:", profileError.code);
        console.error("Error message:", profileError.message);
        console.error("Error details:", profileError.details);
        console.error("Error hint:", profileError.hint);
      } else {
        console.log('Profile created successfully!');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testRegistration();