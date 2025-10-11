-- =====================================================
-- FINAL LOGIN FIX - Handles ENUM types correctly
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

-- Step 4: Check if role is ENUM or VARCHAR and add 'user' value if needed
DO $$
BEGIN
    -- Try to add 'user' to the enum if it doesn't exist
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Check if 'user' value exists in enum
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'user' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'user';
            RAISE NOTICE '✅ Added "user" to user_role enum';
        END IF;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Note: %', SQLERRM;
END $$;

-- Step 5: Drop and recreate authenticate_user function
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

-- Step 6: Delete existing admin user (if exists) and create fresh
DELETE FROM users WHERE username = 'admin';

-- Insert admin user (using 'admin' role instead of 'user')
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
    'admin',  -- Using 'admin' which should exist in enum
    'IT',
    true,
    NOW(),
    NOW()
);

-- Step 7: Create test user with 'manager' role (safer than 'user')
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
    'Test Manager',
    'test123',
    'manager',  -- Using 'manager' instead of 'user'
    'General',
    true
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    is_active = EXCLUDED.is_active;

-- Step 8: Test the authentication function
DO $$
DECLARE
    result RECORD;
    user_count INTEGER;
    enum_values TEXT;
BEGIN
    -- Show available role values
    SELECT string_agg(enumlabel::TEXT, ', ') INTO enum_values
    FROM pg_enum
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role');
    
    IF enum_values IS NOT NULL THEN
        RAISE NOTICE '📋 Available role values: %', enum_values;
    END IF;
    
    -- Check how many users exist
    SELECT COUNT(*) INTO user_count FROM users;
    RAISE NOTICE '📊 Total users in database: %', user_count;
    
    -- Test authentication
    SELECT * INTO result FROM authenticate_user('admin', 'admin123') LIMIT 1;
    
    IF result.user_id IS NOT NULL THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ LOGIN FIX SUCCESSFUL!';
        RAISE NOTICE '✅ Admin user authenticated: %', result.username;
        RAISE NOTICE '✅ User ID: %', result.user_id;
        RAISE NOTICE '✅ Role: %', result.role;
        RAISE NOTICE '';
        RAISE NOTICE '🎯 Login Credentials:';
        RAISE NOTICE '   Username: admin';
        RAISE NOTICE '   Password: admin123';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '❌ Authentication test failed';
        -- Show what users exist
        RAISE NOTICE 'Existing users:';
        FOR result IN SELECT username, role::TEXT FROM users LOOP
            RAISE NOTICE '  - Username: %, Role: %', result.username, result.role;
        END LOOP;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;

-- =====================================================
-- FINAL LOGIN FIX COMPLETE
-- You can now login with:
--   Username: admin
--   Password: admin123
-- =====================================================
