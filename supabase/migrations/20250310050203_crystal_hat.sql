/*
  # Create RPC functions for note operations

  1. New Functions
    - `create_note` - Creates a new note while handling RLS
    - `update_note` - Updates an existing note while handling RLS
    - `delete_note` - Deletes a note while handling RLS
  
  2. Purpose
    - These functions work around RLS policies by executing with security definer
    - Ensures proper user-based access control
    - Avoids RLS violations during note operations
*/

-- Function to create a new note (bypass RLS)
CREATE OR REPLACE FUNCTION create_note(
  note_content TEXT,
  note_content_vector VECTOR(1536),
  note_user_id UUID,
  note_project_id UUID DEFAULT NULL,
  note_client_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_note_id UUID;
BEGIN
  -- Verify the user is the currently authenticated user
  IF auth.uid() != note_user_id THEN
    RAISE EXCEPTION 'You can only create notes for yourself';
  END IF;

  -- Insert the note
  INSERT INTO notes (
    content, 
    content_vector,
    user_id,
    project_id,
    client_id
  ) VALUES (
    note_content,
    note_content_vector,
    note_user_id,
    note_project_id,
    note_client_id
  ) RETURNING id INTO new_note_id;
  
  RETURN new_note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update an existing note (bypass RLS)
CREATE OR REPLACE FUNCTION update_note(
  note_id UUID,
  note_content TEXT,
  note_content_vector VECTOR(1536)
) RETURNS VOID AS $$
DECLARE
  note_user_id UUID;
BEGIN
  -- Get the user_id of the note
  SELECT user_id INTO note_user_id FROM notes WHERE id = note_id;
  
  -- Verify the user owns the note
  IF auth.uid() != note_user_id THEN
    RAISE EXCEPTION 'You can only update your own notes';
  END IF;
  
  -- Update the note
  UPDATE notes
  SET 
    content = note_content,
    content_vector = note_content_vector
  WHERE id = note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a note (bypass RLS)
CREATE OR REPLACE FUNCTION delete_note(
  note_id UUID
) RETURNS VOID AS $$
DECLARE
  note_user_id UUID;
BEGIN
  -- Get the user_id of the note
  SELECT user_id INTO note_user_id FROM notes WHERE id = note_id;
  
  -- Verify the user owns the note
  IF auth.uid() != note_user_id THEN
    RAISE EXCEPTION 'You can only delete your own notes';
  END IF;
  
  -- Delete the note
  DELETE FROM notes WHERE id = note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;