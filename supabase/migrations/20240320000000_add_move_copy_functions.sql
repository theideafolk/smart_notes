-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS move_note(UUID, UUID);
DROP FUNCTION IF EXISTS copy_note(UUID, UUID);
DROP FUNCTION IF EXISTS move_folder(UUID, UUID);
DROP FUNCTION IF EXISTS copy_folder(UUID, UUID);

-- Function to move a note to a different folder
CREATE OR REPLACE FUNCTION move_note(
  note_id UUID,
  target_folder_id UUID
) RETURNS void AS $$
BEGIN
  UPDATE notes
  SET folder_id = target_folder_id,
      updated_at = NOW()
  WHERE id = note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to copy a note to a different folder
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

-- Function to move a folder to a different parent
CREATE OR REPLACE FUNCTION move_folder(
  folder_id UUID,
  target_parent_id UUID
) RETURNS void AS $$
BEGIN
  -- Check if moving would create a circular reference
  IF EXISTS (
    WITH RECURSIVE folder_tree AS (
      SELECT id, parent_id FROM folders WHERE id = target_parent_id
      UNION ALL
      SELECT f.id, f.parent_id FROM folders f
      INNER JOIN folder_tree ft ON f.parent_id = ft.id
    )
    SELECT 1 FROM folder_tree WHERE id = folder_id
  ) THEN
    RAISE EXCEPTION 'Cannot move folder into its own subfolder';
  END IF;

  UPDATE folders
  SET parent_id = target_parent_id,
      updated_at = NOW()
  WHERE id = folder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to copy a folder and its contents to a different parent
CREATE OR REPLACE FUNCTION copy_folder(
  folder_id UUID,
  target_parent_id UUID
) RETURNS UUID AS $$
DECLARE
  new_folder_id UUID;
  original_folder RECORD;
BEGIN
  -- Get the original folder
  SELECT * INTO original_folder FROM folders WHERE id = folder_id;

  -- Create a new folder
  INSERT INTO folders (
    name,
    description,
    parent_id,
    user_id,
    created_at,
    updated_at
  ) VALUES (
    original_folder.name || ' (Copy)',
    original_folder.description,
    target_parent_id,
    original_folder.user_id,
    NOW(),
    NOW()
  ) RETURNING id INTO new_folder_id;

  -- Copy all notes from the original folder to the new folder
  INSERT INTO notes (
    title,
    content,
    folder_id,
    user_id,
    created_at,
    updated_at
  )
  SELECT 
    title,
    content,
    new_folder_id,
    user_id,
    NOW(),
    NOW()
  FROM notes
  WHERE folder_id = folder_id;

  -- Recursively copy all subfolders
  WITH RECURSIVE copy_subfolders AS (
    INSERT INTO folders (
      name,
      description,
      parent_id,
      user_id,
      created_at,
      updated_at
    )
    SELECT 
      name,
      description,
      new_folder_id,
      user_id,
      NOW(),
      NOW()
    FROM folders
    WHERE parent_id = folder_id
    RETURNING id, parent_id
  )
  SELECT id FROM copy_subfolders;

  RETURN new_folder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 