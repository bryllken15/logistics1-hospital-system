-- FINAL AUTH FIX - Complete Authentication Setup
-- This script creates the authenticate_user function and ensures all users exist

-- =====================================================
-- STEP 1: CREATE AUTHENTICATE_USER FUNCTION
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

-- Create the authenticate_user function
CREATE OR REPLACE FUNCTION authenticate_user(
    user_username TEXT,
    user_password TEXT
)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    email TEXT,
    full_name TEXT,
    role TEXT,
    department TEXT,
    is_authorized BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user exists and password matches
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username,
        u.email,
        u.full_name,
        u.role::TEXT,
        COALESCE(u.department, 'General') as department,
        u.is_authorized
    FROM public.users u
    WHERE u.username = user_username 
    AND u.password_hash = crypt(user_password, u.password_hash)
    AND u.is_authorized = true;
END;
$$;

-- =====================================================
-- STEP 2: ENSURE USERS TABLE EXISTS WITH CORRECT SCHEMA
-- =====================================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    is_authorized BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add department column if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'General';

-- =====================================================
-- STEP 3: CREATE USER_ROLE TYPE IF NOT EXISTS
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'admin', 
            'manager', 
            'employee', 
            'procurement', 
            'project_manager', 
            'maintenance', 
            'document_analyst'
        );
    END IF;
END $$;

-- =====================================================
-- STEP 4: INSERT/UPDATE ALL TEST USERS
-- =====================================================

-- Insert or update admin user
INSERT INTO public.users (username, password_hash, full_name, email, role, department, is_authorized)
VALUES (
    'admin', 
    crypt('admin123', gen_salt('bf')), 
    'System Administrator', 
    'admin@hospital.com', 
    'admin', 
    'Administration', 
    true
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = crypt('admin123', gen_salt('bf')),
    full_name = 'System Administrator',
    email = 'admin@hospital.com',
    role = 'admin',
    department = 'Administration',
    is_authorized = true,
    updated_at = NOW();

-- Insert or update manager user
INSERT INTO public.users (username, password_hash, full_name, email, role, department, is_authorized)
VALUES (
    'manager', 
    crypt('manager123', gen_salt('bf')), 
    'Department Manager', 
    'manager@hospital.com', 
    'manager', 
    'Management', 
    true
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = crypt('manager123', gen_salt('bf')),
    full_name = 'Department Manager',
    email = 'manager@hospital.com',
    role = 'manager',
    department = 'Management',
    is_authorized = true,
    updated_at = NOW();

-- Insert or update employee user
INSERT INTO public.users (username, password_hash, full_name, email, role, department, is_authorized)
VALUES (
    'employee', 
    crypt('employee123', gen_salt('bf')), 
    'Hospital Employee', 
    'employee@hospital.com', 
    'employee', 
    'General', 
    true
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = crypt('employee123', gen_salt('bf')),
    full_name = 'Hospital Employee',
    email = 'employee@hospital.com',
    role = 'employee',
    department = 'General',
    is_authorized = true,
    updated_at = NOW();

-- Insert or update procurement user
INSERT INTO public.users (username, password_hash, full_name, email, role, department, is_authorized)
VALUES (
    'procurement', 
    crypt('procurement123', gen_salt('bf')), 
    'Procurement Officer', 
    'procurement@hospital.com', 
    'procurement', 
    'Procurement', 
    true
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = crypt('procurement123', gen_salt('bf')),
    full_name = 'Procurement Officer',
    email = 'procurement@hospital.com',
    role = 'procurement',
    department = 'Procurement',
    is_authorized = true,
    updated_at = NOW();

-- Insert or update project_manager user
INSERT INTO public.users (username, password_hash, full_name, email, role, department, is_authorized)
VALUES (
    'project_manager', 
    crypt('pm123', gen_salt('bf')), 
    'Project Manager', 
    'project_manager@hospital.com', 
    'project_manager', 
    'Project Management', 
    true
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = crypt('pm123', gen_salt('bf')),
    full_name = 'Project Manager',
    email = 'project_manager@hospital.com',
    role = 'project_manager',
    department = 'Project Management',
    is_authorized = true,
    updated_at = NOW();

-- Insert or update maintenance user
INSERT INTO public.users (username, password_hash, full_name, email, role, department, is_authorized)
VALUES (
    'maintenance', 
    crypt('maintenance123', gen_salt('bf')), 
    'Maintenance Technician', 
    'maintenance@hospital.com', 
    'maintenance', 
    'Maintenance', 
    true
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = crypt('maintenance123', gen_salt('bf')),
    full_name = 'Maintenance Technician',
    email = 'maintenance@hospital.com',
    role = 'maintenance',
    department = 'Maintenance',
    is_authorized = true,
    updated_at = NOW();

-- Insert or update document_analyst user
INSERT INTO public.users (username, password_hash, full_name, email, role, department, is_authorized)
VALUES (
    'document_analyst', 
    crypt('analyst123', gen_salt('bf')), 
    'Document Analyst', 
    'document_analyst@hospital.com', 
    'document_analyst', 
    'Document Management', 
    true
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = crypt('analyst123', gen_salt('bf')),
    full_name = 'Document Analyst',
    email = 'document_analyst@hospital.com',
    role = 'document_analyst',
    department = 'Document Management',
    is_authorized = true,
    updated_at = NOW();

-- =====================================================
-- STEP 5: TEST THE AUTHENTICATION FUNCTION
-- =====================================================

-- Test authentication for each user
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- Test admin login
    SELECT * INTO test_result FROM authenticate_user('admin', 'admin123');
    IF test_result.user_id IS NOT NULL THEN
        RAISE NOTICE '✅ Admin authentication working';
    ELSE
        RAISE NOTICE '❌ Admin authentication failed';
    END IF;
    
    -- Test manager login
    SELECT * INTO test_result FROM authenticate_user('manager', 'manager123');
    IF test_result.user_id IS NOT NULL THEN
        RAISE NOTICE '✅ Manager authentication working';
    ELSE
        RAISE NOTICE '❌ Manager authentication failed';
    END IF;
    
    -- Test employee login
    SELECT * INTO test_result FROM authenticate_user('employee', 'employee123');
    IF test_result.user_id IS NOT NULL THEN
        RAISE NOTICE '✅ Employee authentication working';
    ELSE
        RAISE NOTICE '❌ Employee authentication failed';
    END IF;
END $$;

-- =====================================================
-- STEP 6: VERIFY ALL USERS EXIST
-- =====================================================

-- Show all users
SELECT 
    username, 
    full_name, 
    role, 
    department, 
    is_authorized,
    created_at
FROM public.users 
ORDER BY role, username;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 AUTHENTICATION SETUP COMPLETE!';
    RAISE NOTICE 'You can now login with:';
    RAISE NOTICE 'Username: admin, Password: admin123';
    RAISE NOTICE 'Username: manager, Password: manager123';
    RAISE NOTICE 'Username: employee, Password: employee123';
    RAISE NOTICE 'Username: procurement, Password: procurement123';
    RAISE NOTICE 'Username: project_manager, Password: pm123';
    RAISE NOTICE 'Username: maintenance, Password: maintenance123';
    RAISE NOTICE 'Username: document_analyst, Password: analyst123';
END $$;
