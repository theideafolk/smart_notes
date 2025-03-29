-- Add note_id column to chat_history table
ALTER TABLE chat_history
ADD COLUMN note_id UUID REFERENCES notes(id) ON DELETE SET NULL;

-- Create an index on note_id for better query performance
CREATE INDEX idx_chat_history_note_id ON chat_history(note_id);

-- Update RLS policies to include note_id
CREATE POLICY "Users can view their own chat history with notes"
ON chat_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert chat history with notes"
ON chat_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id); 