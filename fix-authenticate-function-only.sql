-- Fix authenticate_user function to use password_hash column
-- This script only updates the function, doesn't touch users table

-- Drop and recreate authenticate_user function with correct column name
DROP FUNCTION IF EXISTS authenticate_user(text, text);

CREATE OR REPLACE FUNCTION authenticate_user(user_username text, user_password text)
RETURNS TABLE(
  user_id uuid,
  username text,
  email text,
  full_name text,
  role text,
  department text,
  is_authorized boolean,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.username,
    u.email,
    u.full_name,
    u.role::text,
    u.department,
    u.is_authorized,
    u.is_active,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.username = user_username 
    AND u.password_hash = user_password 
    AND u.is_active = true;
END;
$$;

-- Test the function
DO $$
DECLARE
    test_result RECORD;
BEGIN
    RAISE NOTICE 'Testing authenticate_user function with admin...';
    
    BEGIN
        PERFORM authenticate_user('admin', 'admin123');
        RAISE NOTICE 'SUCCESS: admin login works!';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'FAILED: admin login failed - %', SQLERRM;
    END;
END $$;
