-- Setup AI tables and columns for Budget Buddy
-- Run this script in your Supabase SQL editor

-- Add ai_settings column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{
  "google_api_key": "",
  "mistral_api_key": "",
  "anthropic_api_key": "",
  "groq_api_key": "",
  "deepseek_api_key": "",
  "llama_api_key": "",
  "cohere_api_key": "",
  "gemini_api_key": "",
  "qwen_api_key": "",
  "openrouter_api_key": "",
  "cerebras_api_key": "",
  "xai_api_key": "",
  "unbound_api_key": "",
  "openai_api_key": "",
  "ollama_api_key": "",
  "lmstudio_api_key": "",
  "enabled": false
}'::jsonb;

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

-- Enable row level security
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON ai_conversations;

-- Create row level security policies
CREATE POLICY "Users can view their own conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON ai_conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON ai_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Verify the table was created successfully
SELECT 'ai_conversations table created successfully' as status;