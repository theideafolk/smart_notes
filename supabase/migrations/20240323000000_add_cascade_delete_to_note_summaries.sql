-- Add cascade delete constraint to note_summaries table
ALTER TABLE note_summaries
DROP CONSTRAINT IF EXISTS note_summaries_note_id_fkey,
ADD CONSTRAINT note_summaries_note_id_fkey
  FOREIGN KEY (note_id)
  REFERENCES notes(id)
  ON DELETE CASCADE; 