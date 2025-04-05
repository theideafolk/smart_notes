-- Add updated_at column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT NOW();

-- Drop the old functions
DROP FUNCTION IF EXISTS public.update_user_profile(uuid, text, text, text, text, text[]);
DROP FUNCTION IF EXISTS public.update_user_profile(uuid, text, text);

-- Create the new function with the correct parameters
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