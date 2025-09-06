-- Add phone column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
    RAISE NOTICE 'Added phone column to profiles table';
  ELSE
    RAISE NOTICE 'phone column already exists in profiles table';
  END IF;
END
$$; 