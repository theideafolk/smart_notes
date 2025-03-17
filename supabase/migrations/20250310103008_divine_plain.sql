/*
  # Project File Management Functions
  
  1. New Functions
    - `create_project_file`: Creates a new file record for a project
    - `delete_project_file`: Deletes a file record by ID
  
  2. Purpose
    - These functions provide secure methods to manage project files
    - They ensure proper RLS enforcement while allowing file operations
*/

-- Function to create a new project file record
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
BEGIN
  -- Check if the user owns the project
  PERFORM id FROM projects 
  WHERE id = project_id AND user_id = file_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'You do not have permission to add files to this project';
  END IF;
  
  -- Create the file record
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
  )
  RETURNING id INTO new_file_id;
  
  RETURN new_file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a project file
CREATE OR REPLACE FUNCTION delete_project_file(
  file_id UUID
) RETURNS VOID AS $$
DECLARE
  file_user_id UUID;
  auth_user_id UUID;
BEGIN
  -- Get the authenticated user
  auth_user_id := auth.uid();
  
  -- Check if the user owns the file
  SELECT user_id INTO file_user_id
  FROM project_files
  WHERE id = file_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'File not found';
  END IF;
  
  IF file_user_id != auth_user_id THEN
    RAISE EXCEPTION 'You do not have permission to delete this file';
  END IF;
  
  -- Delete the file
  DELETE FROM project_files
  WHERE id = file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;