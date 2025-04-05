-- Remove work-related columns
ALTER TABLE users DROP COLUMN IF EXISTS work_hours_start;
ALTER TABLE users DROP COLUMN IF EXISTS work_hours_end;
ALTER TABLE users DROP COLUMN IF EXISTS work_days;

-- Update the RPC function to remove work-related parameters
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id uuid,
  first_name text,
  last_name text
) RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    first_name = COALESCE(update_user_profile.first_name, users.first_name),
    last_name = COALESCE(update_user_profile.last_name, users.last_name),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 