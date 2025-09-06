-- Update profiles table to include AI settings
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT jsonb_build_object(
  'google_api_key', '',
  'mistral_api_key', '',
  'enabled', false
);

-- Create AI conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id); 