/*
  # Project File Database Functions
  
  1. Purpose
    - Creates stored procedures for managing project files
    - Ensures proper access control through database functions
  
  2. Functions
    - create_project_file: Securely creates a new project file record
    - delete_project_file: Securely deletes a project file record
*/

-- Function to create a project file
CREATE OR REPLACE FUNCTION create_project_file(
  file_name TEXT,
  file_path TEXT,
  file_size INTEGER,
  file_type TEXT,
  project_id UUID,
  file_user_id UUID
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Verify the user has access to the project
  IF NOT EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_id AND user_id = file_user_id
  ) THEN
    RAISE EXCEPTION 'Project not found or you do not have access to it';
  END IF;

  -- Insert the file record
  INSERT INTO project_files (
    name, 
    file_path, 
    file_size, 
    file_type, 
    project_id, 
    user_id
  ) 
  VALUES (
    file_name, 
    file_path, 
    file_size, 
    file_type, 
    project_id, 
    file_user_id
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a project file
CREATE OR REPLACE FUNCTION delete_project_file(
  file_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Delete the file record if the user has access to it
  DELETE FROM project_files
  WHERE 
    id = file_id 
    AND user_id = auth.uid();
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'File not found or you do not have access to it';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;