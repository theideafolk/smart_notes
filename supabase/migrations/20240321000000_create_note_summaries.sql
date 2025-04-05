-- Create note_summaries table
CREATE TABLE IF NOT EXISTS note_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(note_id)
);

-- Create an index on note_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_note_summaries_note_id ON note_summaries(note_id);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_note_summaries_updated_at
    BEFORE UPDATE ON note_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE note_summaries ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view summaries of their own notes
CREATE POLICY "Users can view their own note summaries"
    ON note_summaries FOR SELECT
    USING (
        note_id IN (
            SELECT id FROM notes WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to insert summaries for their own notes
CREATE POLICY "Users can insert summaries for their own notes"
    ON note_summaries FOR INSERT
    WITH CHECK (
        note_id IN (
            SELECT id FROM notes WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to update summaries of their own notes
CREATE POLICY "Users can update their own note summaries"
    ON note_summaries FOR UPDATE
    USING (
        note_id IN (
            SELECT id FROM notes WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to delete summaries of their own notes
CREATE POLICY "Users can delete their own note summaries"
    ON note_summaries FOR DELETE
    USING (
        note_id IN (
            SELECT id FROM notes WHERE user_id = auth.uid()
        )
    ); 