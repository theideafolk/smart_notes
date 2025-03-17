/*
  # Create RPC functions for client operations

  1. New Functions
    - `create_client` - Creates a new client while handling RLS
    - `update_client` - Updates an existing client while handling RLS
    - `delete_client` - Deletes a client while handling RLS
  
  2. Purpose
    - These functions work around RLS policies by executing with security definer
    - Ensures proper user-based access control
    - Avoids RLS violations during client operations
*/

-- Function to create a new client (bypass RLS)
CREATE OR REPLACE FUNCTION create_client(
  client_name TEXT,
  client_company TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_user_id UUID
) RETURNS UUID AS $$
DECLARE
  new_client_id UUID;
BEGIN
  -- Verify the user is the currently authenticated user
  IF auth.uid() != client_user_id THEN
    RAISE EXCEPTION 'You can only create clients for yourself';
  END IF;

  -- Insert the client
  INSERT INTO clients (
    name, 
    company,
    email,
    phone,
    user_id
  ) VALUES (
    client_name,
    client_company,
    client_email,
    client_phone,
    client_user_id
  ) RETURNING id INTO new_client_id;
  
  RETURN new_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update an existing client (bypass RLS)
CREATE OR REPLACE FUNCTION update_client(
  client_id UUID,
  client_name TEXT,
  client_company TEXT,
  client_email TEXT,
  client_phone TEXT
) RETURNS VOID AS $$
DECLARE
  client_user_id UUID;
BEGIN
  -- Get the user_id of the client
  SELECT user_id INTO client_user_id FROM clients WHERE id = client_id;
  
  -- Verify the user owns the client
  IF auth.uid() != client_user_id THEN
    RAISE EXCEPTION 'You can only update your own clients';
  END IF;
  
  -- Update the client
  UPDATE clients
  SET 
    name = client_name,
    company = client_company,
    email = client_email,
    phone = client_phone
  WHERE id = client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a client (bypass RLS)
CREATE OR REPLACE FUNCTION delete_client(
  client_id UUID
) RETURNS VOID AS $$
DECLARE
  client_user_id UUID;
BEGIN
  -- Get the user_id of the client
  SELECT user_id INTO client_user_id FROM clients WHERE id = client_id;
  
  -- Verify the user owns the client
  IF auth.uid() != client_user_id THEN
    RAISE EXCEPTION 'You can only delete your own clients';
  END IF;
  
  -- Delete the client
  DELETE FROM clients WHERE id = client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;