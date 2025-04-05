-- Add avatar column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar text DEFAULT 'profile.png';

-- Drop existing function
DROP FUNCTION IF EXISTS public.create_user_profile(uuid, text, text, text);

-- Create new function with avatar parameter
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_email text,
  user_first_name text,
  user_last_name text,
  user_mobile_number text DEFAULT NULL,
  user_date_of_birth date DEFAULT NULL,
  user_avatar text DEFAULT 'profile.png'
) RETURNS void AS $$
BEGIN
  INSERT INTO users (
    id, 
    email, 
    first_name, 
    last_name, 
    mobile_number, 
    date_of_birth, 
    avatar,
    created_at,
    updated_at
  )
  VALUES (
    user_id, 
    user_email, 
    user_first_name, 
    user_last_name, 
    user_mobile_number,
    user_date_of_birth,
    user_avatar,
    NOW(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 