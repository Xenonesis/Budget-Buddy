-- Add gender and timezone columns to profiles table
ALTER TABLE profiles 
ADD COLUMN gender TEXT,
ADD COLUMN timezone TEXT;

-- Comment on columns
COMMENT ON COLUMN profiles.gender IS 'User''s gender preference';
COMMENT ON COLUMN profiles.timezone IS 'User''s timezone preference'; 