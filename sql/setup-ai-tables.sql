-- Add ai_settings column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{"google_api_key":"", "mistral_api_key":"", "enabled":false}'::jsonb;

-- Create ai_conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, 
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);

-- Create row level security policies
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policy to only allow users to see their own conversations
CREATE POLICY "Users can view their own conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

-- Policy to only allow users to insert their own conversations
CREATE POLICY "Users can insert their own conversations" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to only allow users to update their own conversations
CREATE POLICY "Users can update their own conversations" ON ai_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy to only allow users to delete their own conversations
CREATE POLICY "Users can delete their own conversations" ON ai_conversations
    FOR DELETE USING (auth.uid() = user_id); 