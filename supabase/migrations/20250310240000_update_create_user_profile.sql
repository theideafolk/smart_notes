-- Drop existing function
DROP FUNCTION IF EXISTS public.create_user_profile(uuid, text, text, text);

-- Create new function with additional fields
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_first_name TEXT,
  user_last_name TEXT,
  user_mobile_number TEXT DEFAULT NULL,
  user_date_of_birth TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  user_avatar TEXT DEFAULT NULL
) RETURNS VOID AS $$
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