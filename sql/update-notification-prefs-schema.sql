-- Add notification_preferences column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "push": false, "sms": false}';
    RAISE NOTICE 'Added notification_preferences column to profiles table';
  ELSE
    RAISE NOTICE 'notification_preferences column already exists in profiles table';
  END IF;
END
$$; 