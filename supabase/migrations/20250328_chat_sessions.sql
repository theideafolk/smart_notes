/*
  # Create chat_sessions table and modify chat_history

  1. New Tables
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `title` (text) - First few words of initial message
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)

  2. Changes to chat_history
    - Add `session_id` column referencing chat_sessions
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add session_id to chat_history
ALTER TABLE chat_history
ADD COLUMN session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX chat_sessions_user_id_created_at_idx ON chat_sessions(user_id, created_at DESC);
CREATE INDEX chat_history_session_id_idx ON chat_history(session_id); 