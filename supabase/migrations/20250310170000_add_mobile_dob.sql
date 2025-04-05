-- Add new columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Update the RPC function to include new parameters
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id uuid,
  first_name text,
  last_name text,
  mobile_number text DEFAULT NULL,
  date_of_birth date DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    first_name = COALESCE(update_user_profile.first_name, users.first_name),
    last_name = COALESCE(update_user_profile.last_name, users.last_name),
    mobile_number = COALESCE(update_user_profile.mobile_number, users.mobile_number),
    date_of_birth = COALESCE(update_user_profile.date_of_birth, users.date_of_birth),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 