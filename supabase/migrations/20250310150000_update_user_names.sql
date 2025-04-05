-- Add new columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name text;

-- Create function to split full name
CREATE OR REPLACE FUNCTION split_full_name() RETURNS void AS $$
BEGIN
  -- Update first_name and last_name from full_name
  UPDATE users 
  SET 
    first_name = COALESCE(SPLIT_PART(full_name, ' ', 1), ''),
    last_name = COALESCE(NULLIF(SUBSTRING(full_name FROM POSITION(' ' IN full_name)), ''), '')
  WHERE full_name IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT split_full_name();

-- Drop the function as it's no longer needed
DROP FUNCTION split_full_name();

-- Drop the full_name column
ALTER TABLE users DROP COLUMN IF EXISTS full_name;

-- Update the RPC functions
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_email text,
  user_first_name text,
  user_last_name text
) RETURNS void AS $$
BEGIN
  INSERT INTO users (id, email, first_name, last_name)
  VALUES (user_id, user_email, user_first_name, user_last_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_profile(
  user_id uuid,
  first_name text,
  last_name text,
  work_hours_start text DEFAULT NULL,
  work_hours_end text DEFAULT NULL,
  work_days text[] DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    first_name = COALESCE(update_user_profile.first_name, users.first_name),
    last_name = COALESCE(update_user_profile.last_name, users.last_name),
    work_hours_start = COALESCE(update_user_profile.work_hours_start, users.work_hours_start),
    work_hours_end = COALESCE(update_user_profile.work_hours_end, users.work_hours_end),
    work_days = COALESCE(update_user_profile.work_days, users.work_days),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 