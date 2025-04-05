-- Add parent_id column to folders table
ALTER TABLE public.folders
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.folders(id) ON DELETE CASCADE;

-- Drop existing function first
DROP FUNCTION IF EXISTS get_user_folders(uuid);

-- Update get_user_folders function to include parent_id
CREATE OR REPLACE FUNCTION get_user_folders(user_id uuid)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent_id uuid
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        f.description,
        f.created_at,
        f.updated_at,
        f.parent_id
    FROM folders f
    WHERE f.user_id = get_user_folders.user_id
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing create_folder function
DROP FUNCTION IF EXISTS create_folder(uuid, text, text);

-- Update create_folder function to accept parent_id
CREATE OR REPLACE FUNCTION create_folder(
    user_id uuid,
    folder_name text,
    folder_description text DEFAULT NULL,
    parent_folder_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    new_folder_id uuid;
BEGIN
    INSERT INTO folders (user_id, name, description, parent_id)
    VALUES (user_id, folder_name, folder_description, parent_folder_id)
    RETURNING id INTO new_folder_id;
    
    RETURN new_folder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 