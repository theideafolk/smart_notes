/*
  # Create project files table and supporting functions

  1. New Tables
    - `project_files`
      - `id` (uuid, primary key)
      - `name` (text) - Original filename
      - `file_path` (text) - Path to the file in storage
      - `file_size` (integer) - Size of the file in bytes
      - `file_type` (text) - MIME type of the file
      - `project_id` (uuid) - Reference to projects table
      - `user_id` (uuid) - Reference to users table
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `project_files` table
    - Add policies for authenticated users to manage their own files
  
  3. Functions
    - Functions to create, update, and delete project files with proper security checks
*/

-- Create the project_files table
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create their own project files"
  ON project_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own project files"
  ON project_files FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own project files"
  ON project_files FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project files"
  ON project_files FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to create a project file (bypass RLS)
CREATE OR REPLACE FUNCTION create_project_file(
  file_name TEXT,
  file_path TEXT,
  file_size INTEGER,
  file_type TEXT,
  project_id UUID,
  file_user_id UUID
) RETURNS UUID AS $$
DECLARE
  new_file_id UUID;
  project_user_id UUID;
BEGIN
  -- Verify the user is the currently authenticated user
  IF auth.uid() != file_user_id THEN
    RAISE EXCEPTION 'You can only create files for yourself';
  END IF;

  -- Verify the user owns the project
  SELECT user_id INTO project_user_id FROM projects WHERE id = project_id;
  
  IF project_user_id != file_user_id THEN
    RAISE EXCEPTION 'You can only add files to your own projects';
  END IF;

  -- Insert the file record
  INSERT INTO project_files (
    name,
    file_path,
    file_size,
    file_type,
    project_id,
    user_id
  ) VALUES (
    file_name,
    file_path,
    file_size,
    file_type,
    project_id,
    file_user_id
  ) RETURNING id INTO new_file_id;
  
  RETURN new_file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a project file (bypass RLS)
CREATE OR REPLACE FUNCTION delete_project_file(
  file_id UUID
) RETURNS VOID AS $$
DECLARE
  file_user_id UUID;
BEGIN
  -- Get the user_id of the file
  SELECT user_id INTO file_user_id FROM project_files WHERE id = file_id;
  
  -- Verify the user owns the file
  IF auth.uid() != file_user_id THEN
    RAISE EXCEPTION 'You can only delete your own files';
  END IF;
  
  -- Delete the file record
  DELETE FROM project_files WHERE id = file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;