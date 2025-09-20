# Fix for Budget Buddy Registration 500 Error

## Problem
Users are getting a "500 Internal Server Error" when trying to register, specifically:
```
AuthApiError: Database error saving new user
```

## Root Cause
The issue is caused by missing Row Level Security (RLS) policies for the `profiles` table. Specifically:

1. The `profiles` table has RLS enabled
2. There are SELECT and UPDATE policies defined
3. **Missing INSERT policy** - this is the core issue
4. When Supabase tries to create a user, it fails because the database trigger or manual insert can't create the profile record

## Solution

### Step 1: Add Missing INSERT Policy
Run this SQL in your Supabase SQL editor:

```sql
-- Add INSERT policy for profiles table to allow user registration
CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

### Step 2: Verify RLS Policies
After adding the INSERT policy, verify all policies exist:

```sql
-- Check all policies for profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';
```

You should see three policies:
- "Users can view their own profile" (SELECT)
- "Users can insert their own profile" (INSERT) 
- "Users can update their own profile" (UPDATE)

### Step 3: Optional Database Trigger (Recommended)
For more robust user management, add a trigger to automatically create profiles:

```sql
-- Create or replace function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, currency)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'name', 
    'USD'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Testing
After applying the fix:
1. Try registering a new user
2. Check that no 500 errors occur
3. Verify the profile is created in the profiles table

## Files Modified
- `sql/setup-2-security.sql` - Added missing INSERT policy
- `app/auth/register/page.tsx` - Improved error handling