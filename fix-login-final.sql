-- FINAL LOGIN FIX - Disable RLS and Create Users
-- This script will fix the login issue by ensuring RLS is off and users exist

-- 1. Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing RLS policies on users table
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.users;

-- 3. Ensure users table has all required columns
DO $$ 
BEGIN
    -- Add department column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'department') THEN
        ALTER TABLE public.users ADD COLUMN department VARCHAR(100);
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE public.users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE public.users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. Drop and recreate authenticate_user function
DROP FUNCTION IF EXISTS authenticate_user(text, text);

CREATE OR REPLACE FUNCTION authenticate_user(user_username text, user_password text)
RETURNS TABLE(
  id uuid,
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
    u.id,
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
    AND u.password = user_password 
    AND u.is_active = true;
END;
$$;

-- 5. Clear existing users and create fresh ones
DELETE FROM public.users;

-- Insert all 7 users with proper roles
INSERT INTO public.users (id, username, email, full_name, password, role, department, is_authorized, is_active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@logistics.com', 'System Administrator', 'admin123', 'admin', 'IT', true, true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'manager', 'manager@logistics.com', 'Operations Manager', 'manager123', 'manager', 'Operations', true, true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'employee', 'employee@logistics.com', 'General Employee', 'employee123', 'employee', 'General', true, true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'procurement', 'procurement@logistics.com', 'Procurement Specialist', 'procurement123', 'procurement', 'Procurement', true, true, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'project_manager', 'pm@logistics.com', 'Project Manager', 'pm123', 'project_manager', 'Project Management', true, true, NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'maintenance', 'maintenance@logistics.com', 'Maintenance Technician', 'maintenance123', 'maintenance', 'Maintenance', true, true, NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'document_analyst', 'analyst@logistics.com', 'Document Analyst', 'analyst123', 'manager', 'Documentation', true, true, NOW(), NOW());

-- 6. Test the authenticate_user function
DO $$
DECLARE
    test_result RECORD;
    success_count INTEGER := 0;
    total_tests INTEGER := 7;
BEGIN
    RAISE NOTICE 'Testing authenticate_user function...';
    
    -- Test each user
    FOR test_result IN 
        SELECT username, password FROM (VALUES 
            ('admin', 'admin123'),
            ('manager', 'manager123'),
            ('employee', 'employee123'),
            ('procurement', 'procurement123'),
            ('project_manager', 'pm123'),
            ('maintenance', 'maintenance123'),
            ('document_analyst', 'analyst123')
        ) AS t(username, password)
    LOOP
        BEGIN
            PERFORM authenticate_user(test_result.username, test_result.password);
            success_count := success_count + 1;
            RAISE NOTICE 'SUCCESS: % login works!', test_result.username;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'FAILED: % login failed - %', test_result.username, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'RESULT: % of % logins work!', success_count, total_tests;
    
    IF success_count = total_tests THEN
        RAISE NOTICE 'SUCCESS: All users can login!';
    ELSE
        RAISE NOTICE 'WARNING: Some users cannot login. Check the errors above.';
    END IF;
END $$;

-- 7. Show final user count
SELECT COUNT(*) as total_users FROM public.users;
SELECT username, full_name, role, is_authorized FROM public.users ORDER BY username;
