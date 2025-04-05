-- Drop existing function
DROP FUNCTION IF EXISTS public.update_user_profile(uuid, text, text, text, date, text);

-- Create new function that handles partial updates
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id uuid,
  first_name text DEFAULT NULL,
  last_name text DEFAULT NULL,
  mobile_number text DEFAULT NULL,
  date_of_birth date DEFAULT NULL,
  avatar text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    first_name = COALESCE(update_user_profile.first_name, users.first_name),
    last_name = COALESCE(update_user_profile.last_name, users.last_name),
    mobile_number = COALESCE(update_user_profile.mobile_number, users.mobile_number),
    date_of_birth = COALESCE(update_user_profile.date_of_birth, users.date_of_birth),
    avatar = COALESCE(update_user_profile.avatar, users.avatar),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 