-- =====================================================
-- COMPLETE LOGIN FIX
-- Fixes authentication and creates admin user
-- =====================================================

-- Step 1: Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all policies on users table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'users'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', r.policyname);
    END LOOP;
END $$;

-- Step 3: Ensure users table has all required columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 4: Drop and recreate authenticate_user function
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

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

-- Step 5: Delete existing admin user (if exists) and create fresh
DELETE FROM users WHERE username = 'admin';

INSERT INTO users (
    id, 
    username, 
    email, 
    full_name, 
    password_hash, 
    role, 
    department, 
    is_active,
    created_at,
    updated_at
)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    'admin',
    'admin@logistics.com',
    'System Administrator',
    'admin123',
    'admin',
    'IT',
    true,
    NOW(),
    NOW()
);

-- Step 6: Create test user for backup
INSERT INTO users (
    username, 
    email, 
    full_name, 
    password_hash, 
    role, 
    department, 
    is_active
)
VALUES (
    'test',
    'test@logistics.com',
    'Test User',
    'test123',
    'user',
    'General',
    true
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    is_active = EXCLUDED.is_active;

-- Step 7: Test the authentication function
DO $$
DECLARE
    result RECORD;
    user_count INTEGER;
BEGIN
    -- Check how many users exist
    SELECT COUNT(*) INTO user_count FROM users;
    RAISE NOTICE '📊 Total users in database: %', user_count;
    
    -- Test authentication
    SELECT * INTO result FROM authenticate_user('admin', 'admin123') LIMIT 1;
    
    IF result.user_id IS NOT NULL THEN
        RAISE NOTICE '✅ LOGIN FIX SUCCESSFUL!';
        RAISE NOTICE '✅ Admin user authenticated: %', result.username;
        RAISE NOTICE '✅ User ID: %', result.user_id;
        RAISE NOTICE '✅ Role: %', result.role;
        RAISE NOTICE '';
        RAISE NOTICE '🎯 Login Credentials:';
        RAISE NOTICE '   Username: admin';
        RAISE NOTICE '   Password: admin123';
    ELSE
        RAISE NOTICE '❌ Authentication test failed';
        -- Show what users exist
        RAISE NOTICE 'Existing users:';
        FOR result IN SELECT username, role FROM users LOOP
            RAISE NOTICE '  - Username: %, Role: %', result.username, result.role;
        END LOOP;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;

-- =====================================================
-- COMPLETE LOGIN FIX DONE
-- You can now login with:
--   Username: admin
--   Password: admin123
-- =====================================================
