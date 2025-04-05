-- Add avatar column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar text;

-- Update the update_user_profile function to include avatar
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id uuid,
  first_name text,
  last_name text,
  mobile_number text DEFAULT NULL,
  date_of_birth date DEFAULT NULL,
  avatar text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    first_name = COALESCE(update_user_profile.first_name, users.first_name),
    last_name = COALESCE(update_user_profile.last_name, users.last_name),
    mobile_number = update_user_profile.mobile_number,
    date_of_birth = update_user_profile.date_of_birth,
    avatar = update_user_profile.avatar,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 