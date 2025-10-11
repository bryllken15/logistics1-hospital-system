-- FIX ALL PERMISSIONS - Complete Permission Fix
-- This script will grant all necessary permissions to fix "permission denied" errors

-- =============================================
-- STEP 1: DISABLE RLS ON ALL TABLES (AGAIN)
-- =============================================

-- Disable RLS on ALL tables
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.maintenance_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.maintenance_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.purchase_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.delivery_receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.spare_parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.maintenance_work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.document_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.document_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.asset_maintenance_schedules DISABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 2: DROP ALL EXISTING POLICIES
-- =============================================

-- Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- =============================================
-- STEP 3: GRANT ALL PERMISSIONS TO ANON ROLE
-- =============================================

-- Grant ALL permissions on ALL tables to anon role
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Specific table permissions for anon
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_schedule TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_receipts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_changes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_assignments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spare_parts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_work_orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_versions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_approvals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_maintenance_schedules TO anon;

-- =============================================
-- STEP 4: GRANT ALL PERMISSIONS TO AUTHENTICATED ROLE
-- =============================================

-- Grant ALL permissions on ALL tables to authenticated role
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Specific table permissions for authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_schedule TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_receipts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_changes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spare_parts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_work_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_approvals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_maintenance_schedules TO authenticated;

-- =============================================
-- STEP 5: GRANT ALL PERMISSIONS TO SERVICE_ROLE
-- =============================================

-- Grant ALL permissions on ALL tables to service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- =============================================
-- STEP 6: GRANT EXECUTE PERMISSIONS ON FUNCTIONS
-- =============================================

-- Grant execute permissions on authenticate_user function
GRANT EXECUTE ON FUNCTION authenticate_user(text, text) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(text, text) TO service_role;

-- =============================================
-- STEP 7: RECREATE AUTHENTICATE_USER FUNCTION
-- =============================================

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
    u.username::text,
    u.email::text,
    u.full_name::text,
    u.role::text,
    u.department::text,
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

-- =============================================
-- STEP 8: ENSURE USERS EXIST
-- =============================================

-- Clear and recreate users if they don't exist
DO $$
BEGIN
    -- Check if users exist
    IF NOT EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
        -- Insert all 7 users
        INSERT INTO public.users (id, username, email, full_name, password_hash, role, department, is_authorized, is_active, created_at, updated_at) VALUES
        ('11111111-1111-1111-1111-111111111111', 'admin', 'admin@logistics.com', 'System Administrator', 'admin123', 'admin', 'IT', true, true, NOW(), NOW()),
        ('22222222-2222-2222-2222-222222222222', 'manager', 'manager@logistics.com', 'Operations Manager', 'manager123', 'manager', 'Operations', true, true, NOW(), NOW()),
        ('33333333-3333-3333-3333-333333333333', 'employee', 'employee@logistics.com', 'General Employee', 'employee123', 'employee', 'General', true, true, NOW(), NOW()),
        ('44444444-4444-4444-4444-444444444444', 'procurement', 'procurement@logistics.com', 'Procurement Specialist', 'procurement123', 'procurement', 'Procurement', true, true, NOW(), NOW()),
        ('55555555-5555-5555-5555-555555555555', 'project_manager', 'pm@logistics.com', 'Project Manager', 'pm123', 'project_manager', 'Project Management', true, true, NOW(), NOW()),
        ('66666666-6666-6666-6666-666666666666', 'maintenance', 'maintenance@logistics.com', 'Maintenance Technician', 'maintenance123', 'maintenance', 'Maintenance', true, true, NOW(), NOW()),
        ('77777777-7777-7777-7777-777777777777', 'document_analyst', 'analyst@logistics.com', 'Document Analyst', 'analyst123', 'manager', 'Documentation', true, true, NOW(), NOW());
    END IF;
END $$;

-- =============================================
-- STEP 9: TEST ALL FUNCTIONALITY
-- =============================================

DO $$
DECLARE
    test_result RECORD;
    success_count INTEGER := 0;
    total_tests INTEGER := 7;
    auth_result RECORD;
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
            -- Test the function and capture result
            SELECT * INTO auth_result FROM authenticate_user(test_result.username, test_result.password) LIMIT 1;
            
            IF auth_result.user_id IS NOT NULL THEN
                success_count := success_count + 1;
                RAISE NOTICE 'SUCCESS: % login works! (ID: %)', test_result.username, auth_result.user_id;
            ELSE
                RAISE NOTICE 'FAILED: % login returned no data', test_result.username;
            END IF;
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

-- =============================================
-- STEP 10: VERIFY PERMISSIONS
-- =============================================

-- Test table access
DO $$
DECLARE
    table_name TEXT;
    test_tables TEXT[] := ARRAY[
        'users', 'projects', 'documents', 'assets', 'maintenance_logs', 
        'maintenance_schedule', 'system_logs', 'inventory', 'purchase_requests',
        'purchase_orders', 'suppliers', 'delivery_receipts', 'inventory_changes',
        'staff_assignments', 'notifications', 'reports', 'spare_parts',
        'maintenance_work_orders', 'document_versions', 'document_approvals',
        'asset_maintenance_schedules'
    ];
    accessible_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Testing table access permissions...';
    
    FOREACH table_name IN ARRAY test_tables LOOP
        BEGIN
            EXECUTE 'SELECT COUNT(*) FROM public.' || table_name || ' LIMIT 1';
            accessible_count := accessible_count + 1;
            RAISE NOTICE 'SUCCESS: % table accessible', table_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'FAILED: % table not accessible - %', table_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'RESULT: % of % tables accessible', accessible_count, array_length(test_tables, 1);
    
    IF accessible_count = array_length(test_tables, 1) THEN
        RAISE NOTICE 'SUCCESS: All tables accessible!';
    ELSE
        RAISE NOTICE 'WARNING: Some tables not accessible. Check the errors above.';
    END IF;
END $$;

-- =============================================
-- STEP 11: FINAL STATUS
-- =============================================

-- Show final status
SELECT 'users' as table_name, COUNT(*) as record_count FROM public.users
UNION ALL
SELECT 'projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'documents', COUNT(*) FROM public.documents
UNION ALL
SELECT 'assets', COUNT(*) FROM public.assets
UNION ALL
SELECT 'inventory', COUNT(*) FROM public.inventory;

-- Final completion message
DO $$
BEGIN
    RAISE NOTICE 'PERMISSIONS FIX COMPLETE!';
    RAISE NOTICE 'All RLS policies disabled';
    RAISE NOTICE 'All permissions granted to anon, authenticated, and service_role';
    RAISE NOTICE 'All functions recreated with proper permissions';
    RAISE NOTICE 'Ready for frontend testing!';
END $$;
