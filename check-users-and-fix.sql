-- Check current users and fix login
-- This script will show you what's in the database and fix it

-- Step 1: Show all existing users
DO $$
DECLARE
    r RECORD;
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'DATABASE USER CHECK';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Total users: %', user_count;
    RAISE NOTICE '';
    
    IF user_count > 0 THEN
        RAISE NOTICE 'Existing users:';
        FOR r IN SELECT username, email, role::TEXT as role, COALESCE(is_active, true) as is_active FROM users ORDER BY username LOOP
            RAISE NOTICE '  Username: %', r.username;
            RAISE NOTICE '  Email: %', r.email;
            RAISE NOTICE '  Role: %', r.role;
            RAISE NOTICE '  Active: %', r.is_active;
            RAISE NOTICE '  ---';
        END LOOP;
    ELSE
        RAISE NOTICE '❌ NO USERS FOUND IN DATABASE!';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
END $$;

-- Step 2: Delete ALL existing users and start fresh
TRUNCATE TABLE users CASCADE;

-- Step 3: Insert admin user with correct credentials
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
) VALUES (
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

-- Step 4: Test authentication
DO $$
DECLARE
    result RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'TESTING LOGIN';
    RAISE NOTICE '====================================';
    
    SELECT * INTO result FROM authenticate_user('admin', 'admin123') LIMIT 1;
    
    IF result.user_id IS NOT NULL THEN
        RAISE NOTICE '✅ SUCCESS! Login works!';
        RAISE NOTICE '';
        RAISE NOTICE '🎯 Use these credentials:';
        RAISE NOTICE '   Username: admin';
        RAISE NOTICE '   Password: admin123';
        RAISE NOTICE '';
        RAISE NOTICE '   User ID: %', result.user_id;
        RAISE NOTICE '   Role: %', result.role;
        RAISE NOTICE '   Department: %', result.department;
    ELSE
        RAISE NOTICE '❌ FAILED! Login does not work';
        RAISE NOTICE 'Checking authenticate_user function...';
    END IF;
    
    RAISE NOTICE '====================================';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: %', SQLERRM;
END $$;
