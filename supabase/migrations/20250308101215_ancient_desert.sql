/*
  # Create notes table with vector search support

  1. New Tables
    - `notes`
      - `id` (uuid, primary key)
      - `content` (text)
      - `content_vector` (vector(1536)) - for semantic search
      - `client_id` (uuid, foreign key, optional)
      - `project_id` (uuid, foreign key, optional)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `notes` table
    - Add policies for users to:
      - Read their own notes
      - Create new notes
      - Update their own notes
*/

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  content_vector vector(1536), -- OpenAI embeddings dimension
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notes_vector_idx ON notes USING ivfflat (content_vector vector_cosine_ops);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);