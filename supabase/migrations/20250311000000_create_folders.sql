-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own folders"
    ON public.folders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders"
    ON public.folders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
    ON public.folders FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
    ON public.folders FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to get user's folders
CREATE OR REPLACE FUNCTION get_user_folders(user_id uuid)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        f.description,
        f.created_at,
        f.updated_at
    FROM folders f
    WHERE f.user_id = get_user_folders.user_id
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create a new folder
CREATE OR REPLACE FUNCTION create_folder(
    user_id uuid,
    folder_name text,
    folder_description text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    new_folder_id uuid;
BEGIN
    INSERT INTO folders (user_id, name, description)
    VALUES (user_id, folder_name, folder_description)
    RETURNING id INTO new_folder_id;
    
    RETURN new_folder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update a folder
CREATE OR REPLACE FUNCTION update_folder(
    folder_id uuid,
    folder_name text DEFAULT NULL,
    folder_description text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    UPDATE folders
    SET 
        name = COALESCE(update_folder.folder_name, folders.name),
        description = COALESCE(update_folder.folder_description, folders.description),
        updated_at = NOW()
    WHERE id = folder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to delete a folder
CREATE OR REPLACE FUNCTION delete_folder(folder_id uuid)
RETURNS void AS $$
BEGIN
    DELETE FROM folders WHERE id = folder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 