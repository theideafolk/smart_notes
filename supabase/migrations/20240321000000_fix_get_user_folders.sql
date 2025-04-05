-- Drop the existing function
DROP FUNCTION IF EXISTS get_user_folders();

-- Create the fixed function
CREATE OR REPLACE FUNCTION get_user_folders()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  parent_id UUID,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.description,
    f.parent_id,
    f.user_id,
    f.created_at,
    f.updated_at
  FROM folders f
  WHERE f.user_id = auth.uid()
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 