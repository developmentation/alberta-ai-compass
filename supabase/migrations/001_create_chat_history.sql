-- Create chat_history table for storing chat messages
CREATE TABLE IF NOT EXISTS chat_history (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  images JSONB,
  files JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying by user_email and created_at
CREATE INDEX IF NOT EXISTS idx_chat_history_user_email_created_at 
ON chat_history (user_email, created_at);

-- Create index for efficient querying by user_email
CREATE INDEX IF NOT EXISTS idx_chat_history_user_email 
ON chat_history (user_email);

-- Enable Row Level Security
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own chat history
CREATE POLICY "Users can only access their own chat history" ON chat_history
  FOR ALL USING (auth.jwt() ->> 'email' = user_email);

-- Create policy to allow users to insert their own chat messages
CREATE POLICY "Users can insert their own chat messages" ON chat_history
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

