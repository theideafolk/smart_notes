/*
  # Add folder_id to notes table

  1. Schema Changes
    - Add `folder_id` column to `notes` table
    - Add foreign key constraint to `folders` table
  2. Function Updates
    - Update `create_note` function to handle folder_id
*/

-- Add folder_id column to notes table
ALTER TABLE notes
ADD COLUMN folder_id uuid REFERENCES folders(id) ON DELETE SET NULL;

-- Update create_note function to handle folder_id
CREATE OR REPLACE FUNCTION create_note(
  note_content TEXT,
  note_content_vector VECTOR(1536),
  note_user_id UUID,
  note_project_id UUID DEFAULT NULL,
  note_client_id UUID DEFAULT NULL,
  note_folder_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_note_id UUID;
BEGIN
  -- Verify the user is the currently authenticated user
  IF auth.uid() != note_user_id THEN
    RAISE EXCEPTION 'You can only create notes for yourself';
  END IF;

  -- If folder_id is provided, verify the folder belongs to the user
  IF note_folder_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM folders 
      WHERE id = note_folder_id 
      AND user_id = note_user_id
    ) THEN
      RAISE EXCEPTION 'Folder not found or access denied';
    END IF;
  END IF;

  -- Insert the note
  INSERT INTO notes (
    content, 
    content_vector,
    user_id,
    project_id,
    client_id,
    folder_id
  ) VALUES (
    note_content,
    note_content_vector,
    note_user_id,
    note_project_id,
    note_client_id,
    note_folder_id
  ) RETURNING id INTO new_note_id;
  
  RETURN new_note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 