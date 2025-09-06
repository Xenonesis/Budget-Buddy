-- Add address column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address TEXT;
    RAISE NOTICE 'Added address column to profiles table';
  ELSE
    RAISE NOTICE 'Address column already exists in profiles table';
  END IF;
END
$$; 