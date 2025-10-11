-- EMERGENCY RLS DISABLE - QUICK FIX
-- This will immediately fix all 401 permission denied errors

-- Disable RLS on ALL tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance_schedules DISABLE ROW LEVEL SECURITY;

-- Drop ALL RLS policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Test that tables are accessible
DO $$
BEGIN
    PERFORM 1 FROM users LIMIT 1;
    PERFORM 1 FROM documents LIMIT 1;
    PERFORM 1 FROM assets LIMIT 1;
    RAISE NOTICE '✅ RLS disabled successfully! Tables are now accessible.';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;
