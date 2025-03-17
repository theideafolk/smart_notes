/*
  # Utility Function for Checking Existing Functions
  
  1. Purpose
    - Provides a way to check if a specific function exists in the database
    - Useful for defensive programming when calling functions that may not exist yet
  
  2. Usage
    - Call with `SELECT * FROM get_function_list()` to get all function names
    - Use in application code to check if functions exist before calling them
*/

-- Function to get a list of all stored procedures/functions in the database
CREATE OR REPLACE FUNCTION get_function_list()
RETURNS TABLE (function_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT p.proname::text
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;