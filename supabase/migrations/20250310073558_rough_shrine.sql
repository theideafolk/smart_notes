/*
  # Create RPC functions for project operations

  1. New Functions
    - `create_project` - Creates a new project while handling RLS
    - `update_project` - Updates an existing project while handling RLS
    - `update_project_status` - Updates just the status of a project
    - `delete_project` - Deletes a project while handling RLS
  
  2. Purpose
    - These functions work around RLS policies by executing with security definer
    - Ensures proper user-based access control
    - Avoids RLS violations during project operations
*/

-- Function to create a new project (bypass RLS)
CREATE OR REPLACE FUNCTION create_project(
  project_name TEXT,
  project_description TEXT,
  project_client_id UUID,
  project_user_id UUID
) RETURNS UUID AS $$
DECLARE
  new_project_id UUID;
BEGIN
  -- Verify the user is the currently authenticated user
  IF auth.uid() != project_user_id THEN
    RAISE EXCEPTION 'You can only create projects for yourself';
  END IF;

  -- Insert the project
  INSERT INTO projects (
    name, 
    description,
    status,
    client_id,
    user_id
  ) VALUES (
    project_name,
    project_description,
    'not_started',
    project_client_id,
    project_user_id
  ) RETURNING id INTO new_project_id;
  
  RETURN new_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update an existing project (bypass RLS)
CREATE OR REPLACE FUNCTION update_project(
  project_id UUID,
  project_name TEXT,
  project_description TEXT,
  project_status TEXT DEFAULT NULL,
  project_client_id UUID DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  project_user_id UUID;
BEGIN
  -- Get the user_id of the project
  SELECT user_id INTO project_user_id FROM projects WHERE id = project_id;
  
  -- Verify the user owns the project
  IF auth.uid() != project_user_id THEN
    RAISE EXCEPTION 'You can only update your own projects';
  END IF;
  
  -- Update the project
  UPDATE projects
  SET 
    name = project_name,
    description = project_description,
    status = COALESCE(project_status, status),
    client_id = project_client_id
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update just the status of a project (bypass RLS)
CREATE OR REPLACE FUNCTION update_project_status(
  project_id UUID,
  project_status TEXT
) RETURNS VOID AS $$
DECLARE
  project_user_id UUID;
BEGIN
  -- Get the user_id of the project
  SELECT user_id INTO project_user_id FROM projects WHERE id = project_id;
  
  -- Verify the user owns the project
  IF auth.uid() != project_user_id THEN
    RAISE EXCEPTION 'You can only update your own projects';
  END IF;
  
  -- Validate status value
  IF project_status NOT IN ('not_started', 'in_progress', 'on_hold', 'completed') THEN
    RAISE EXCEPTION 'Invalid status value. Must be one of: not_started, in_progress, on_hold, completed';
  END IF;
  
  -- Update the project status
  UPDATE projects
  SET status = project_status
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a project (bypass RLS)
CREATE OR REPLACE FUNCTION delete_project(
  project_id UUID
) RETURNS VOID AS $$
DECLARE
  project_user_id UUID;
BEGIN
  -- Get the user_id of the project
  SELECT user_id INTO project_user_id FROM projects WHERE id = project_id;
  
  -- Verify the user owns the project
  IF auth.uid() != project_user_id THEN
    RAISE EXCEPTION 'You can only delete your own projects';
  END IF;
  
  -- Delete the project
  DELETE FROM projects WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;