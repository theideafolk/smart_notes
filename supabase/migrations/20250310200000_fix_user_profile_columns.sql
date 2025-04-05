-- Drop existing columns if they exist
ALTER TABLE users DROP COLUMN IF EXISTS mobile_number;
ALTER TABLE users DROP COLUMN IF EXISTS date_of_birth;

-- Add columns with proper types
ALTER TABLE users ADD COLUMN mobile_number text;
ALTER TABLE users ADD COLUMN date_of_birth date;

-- Drop existing function
DROP FUNCTION IF EXISTS public.update_user_profile(uuid, text, text, text, date);

-- Create new function with proper parameter types
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
    mobile_number = update_user_profile.mobile_number,
    date_of_birth = update_user_profile.date_of_birth,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 