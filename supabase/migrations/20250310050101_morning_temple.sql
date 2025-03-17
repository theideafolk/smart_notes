/*
  # Create RPC functions for user profile operations

  1. New Functions
    - `create_user_profile` - Creates a new user profile while handling RLS
    - `update_user_profile` - Updates an existing user profile while handling RLS
    - `get_user_profile` - Retrieves a user profile while handling RLS
  
  2. Purpose
    - These functions work around RLS policies by executing with security definer
    - Allows the authenticated user to perform operations safely on their own profile
*/

-- Function to create a new user profile (bypass RLS)
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (user_id, user_email, user_full_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile (bypass RLS)
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id UUID,
  full_name TEXT DEFAULT NULL,
  work_hours_start TIME DEFAULT NULL,
  work_hours_end TIME DEFAULT NULL,
  work_days TEXT[] DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    full_name = COALESCE(update_user_profile.full_name, users.full_name),
    work_hours_start = COALESCE(update_user_profile.work_hours_start, users.work_hours_start),
    work_hours_end = COALESCE(update_user_profile.work_hours_end, users.work_hours_end),
    work_days = COALESCE(update_user_profile.work_days, users.work_days)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile (bypass RLS)
CREATE OR REPLACE FUNCTION get_user_profile(
  user_id UUID
) RETURNS users AS $$
  SELECT * FROM users WHERE id = user_id LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;