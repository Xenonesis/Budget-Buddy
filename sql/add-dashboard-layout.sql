-- Add dashboard_layout column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dashboard_layout JSONB DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN profiles.dashboard_layout IS 'Stores user customized dashboard widget layout and preferences';

-- Create an index for better performance when querying dashboard layouts
CREATE INDEX IF NOT EXISTS idx_profiles_dashboard_layout 
ON profiles USING GIN (dashboard_layout);