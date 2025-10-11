-- Quick fix for authenticate_user function conflict
-- Drop the existing function first, then recreate it

-- Drop the existing function
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

-- Recreate the function with correct return type
CREATE OR REPLACE FUNCTION authenticate_user(user_username TEXT, user_password TEXT)
RETURNS TABLE(
    user_id UUID,
    username VARCHAR(50),
    email VARCHAR(100),
    full_name VARCHAR(100),
    role VARCHAR(20),
    department VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.email, u.full_name, u.role, u.department
    FROM users u
    WHERE u.username = user_username 
    AND u.password_hash = user_password
    AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
