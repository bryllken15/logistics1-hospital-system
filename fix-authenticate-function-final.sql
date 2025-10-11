-- Fix authenticate_user function type mismatch
-- This will fix the login 400 error

-- Drop the existing function completely
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

-- Recreate with correct types
CREATE OR REPLACE FUNCTION authenticate_user(user_username TEXT, user_password TEXT)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    email TEXT,
    full_name TEXT,
    role TEXT,
    department TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id::UUID as user_id,
        u.username::TEXT as username,
        u.email::TEXT as email,
        u.full_name::TEXT as full_name,
        u.role::TEXT as role,
        COALESCE(u.department, 'General')::TEXT as department
    FROM users u
    WHERE u.username = user_username 
    AND u.password_hash = user_password
    AND COALESCE(u.is_active, true) = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
DO $$
DECLARE
    result RECORD;
BEGIN
    -- Test with admin user
    SELECT * INTO result FROM authenticate_user('admin', 'admin123') LIMIT 1;
    
    IF result.user_id IS NOT NULL THEN
        RAISE NOTICE '✅ Authentication function working! User: %', result.username;
    ELSE
        RAISE NOTICE '❌ Authentication function not working';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error testing function: %', SQLERRM;
END $$;
