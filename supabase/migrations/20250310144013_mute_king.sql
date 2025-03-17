/*
  # Add title to notes table

  1. Schema Changes
    - Add `title` column to `notes` table with default value
  2. Data Migration
    - Auto-generate titles for existing notes
*/

-- First add title column to notes table
ALTER TABLE IF EXISTS notes 
ADD COLUMN IF NOT EXISTS title text DEFAULT 'Untitled Note';

-- Ensure the column is not null after migration
DO $$ 
BEGIN
  -- Update existing notes to have a title
  UPDATE notes
  SET title = 'Note from ' || to_char(created_at, 'Mon DD, YYYY')
  WHERE title IS NULL OR title = 'Untitled Note';
END $$;

-- Now make the title column required
ALTER TABLE notes
ALTER COLUMN title SET NOT NULL;