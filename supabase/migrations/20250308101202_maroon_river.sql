/*
  # Create users table and profile settings

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text, unique)
      - `full_name` (text)
      - `work_hours_start` (time)
      - `work_hours_end` (time)
      - `work_days` (text[])
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Add policies for users to:
      - Read their own profile
      - Update their own profile
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  work_hours_start time DEFAULT '09:00',
  work_hours_end time DEFAULT '17:00',
  work_days text[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);