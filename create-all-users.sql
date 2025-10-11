-- =====================================================
-- CREATE ALL USERS FOR THE SYSTEM
-- Smart Supply Chain & Procurement Management System
-- =====================================================

-- Step 1: Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', r.policyname);
    END LOOP;
END $$;

-- Step 3: Add required columns if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 4: Clear all existing users
TRUNCATE TABLE users CASCADE;

-- Step 5: Create authenticate_user function
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

-- Step 6: Insert all users
INSERT INTO users (id, username, email, full_name, password_hash, role, department, is_active) VALUES
-- Admin
('55555555-5555-5555-5555-555555555555', 'admin', 'admin@logistics.com', 'System Administrator', 'admin123', 'admin', 'IT', true),

-- Manager
('11111111-1111-1111-1111-111111111111', 'manager', 'manager@logistics.com', 'Operations Manager', 'manager123', 'manager', 'Operations', true),

-- Employee
('22222222-2222-2222-2222-222222222222', 'employee', 'employee@logistics.com', 'General Employee', 'employee123', 'manager', 'Operations', true),

-- Procurement
('33333333-3333-3333-3333-333333333333', 'procurement', 'procurement@logistics.com', 'Procurement Officer', 'procurement123', 'manager', 'Procurement', true),

-- Project Manager
('44444444-4444-4444-4444-444444444444', 'project_manager', 'pm@logistics.com', 'Project Manager', 'pm123', 'manager', 'Projects', true),

-- Maintenance
('66666666-6666-6666-6666-666666666666', 'maintenance', 'maintenance@logistics.com', 'Maintenance Technician', 'maintenance123', 'manager', 'Maintenance', true),

-- Document Analyst
('77777777-7777-7777-7777-777777777777', 'document_analyst', 'analyst@logistics.com', 'Document Analyst', 'analyst123', 'analyst', 'Documentation', true);

-- Step 7: Test all logins
DO $$
DECLARE
    result RECORD;
    success_count INTEGER := 0;
    test_users TEXT[] := ARRAY['admin', 'manager', 'employee', 'procurement', 'project_manager', 'maintenance', 'document_analyst'];
    test_passwords TEXT[] := ARRAY['admin123', 'manager123', 'employee123', 'procurement123', 'pm123', 'maintenance123', 'analyst123'];
    i INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'TESTING ALL USER LOGINS';
    RAISE NOTICE '====================================';
    RAISE NOTICE '';
    
    FOR i IN 1..array_length(test_users, 1) LOOP
        SELECT * INTO result FROM authenticate_user(test_users[i], test_passwords[i]) LIMIT 1;
        
        IF result.user_id IS NOT NULL THEN
            success_count := success_count + 1;
            RAISE NOTICE '✅ %: Login successful', test_users[i];
            RAISE NOTICE '   Username: %', result.username;
            RAISE NOTICE '   Role: %', result.role;
            RAISE NOTICE '   Department: %', result.department;
            RAISE NOTICE '';
        ELSE
            RAISE NOTICE '❌ %: Login FAILED', test_users[i];
            RAISE NOTICE '';
        END IF;
    END LOOP;
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'SUMMARY: % of % logins successful', success_count, array_length(test_users, 1);
    RAISE NOTICE '====================================';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 LOGIN CREDENTIALS:';
    RAISE NOTICE '';
    RAISE NOTICE 'Admin:';
    RAISE NOTICE '  username=admin, password=admin123';
    RAISE NOTICE '';
    RAISE NOTICE 'Manager:';
    RAISE NOTICE '  username=manager, password=manager123';
    RAISE NOTICE '';
    RAISE NOTICE 'Employee:';
    RAISE NOTICE '  username=employee, password=employee123';
    RAISE NOTICE '';
    RAISE NOTICE 'Procurement:';
    RAISE NOTICE '  username=procurement, password=procurement123';
    RAISE NOTICE '';
    RAISE NOTICE 'Project Manager:';
    RAISE NOTICE '  username=project_manager, password=pm123';
    RAISE NOTICE '';
    RAISE NOTICE 'Maintenance:';
    RAISE NOTICE '  username=maintenance, password=maintenance123';
    RAISE NOTICE '';
    RAISE NOTICE 'Document Analyst:';
    RAISE NOTICE '  username=document_analyst, password=analyst123';
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    
END $$;

-- =====================================================
-- ALL USERS CREATED!
-- Try logging in with any of the credentials above
-- =====================================================
