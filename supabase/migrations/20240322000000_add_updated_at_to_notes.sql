-- Add updated_at column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Drop the existing copy_note function
DROP FUNCTION IF EXISTS copy_note(UUID, UUID);

-- Create the fixed copy_note function
CREATE OR REPLACE FUNCTION copy_note(
  note_id UUID,
  target_folder_id UUID
) RETURNS UUID AS $$
DECLARE
  new_note_id UUID;
  original_note RECORD;
BEGIN
  -- Get the original note
  SELECT * INTO original_note FROM notes WHERE id = note_id;

  -- Create a new note with the same content
  INSERT INTO notes (
    title,
    content,
    folder_id,
    user_id,
    created_at,
    updated_at
  ) VALUES (
    original_note.title || ' (Copy)',
    original_note.content,
    target_folder_id,
    original_note.user_id,
    NOW(),
    NOW()
  ) RETURNING id INTO new_note_id;

  RETURN new_note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the update_note function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_note(
  note_id UUID,
  note_title TEXT,
  note_content TEXT
) RETURNS void AS $$
BEGIN
  UPDATE notes
  SET 
    title = note_title,
    content = note_content,
    updated_at = NOW()
  WHERE id = note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 