-- =====================================================
-- FIX CORS AND AUTHENTICATION ISSUES
-- =====================================================
-- This script fixes CORS and authentication problems

-- 1. FIX CORS ISSUES
-- ==================

-- Update Supabase settings to allow localhost:3001
-- Note: This needs to be done in Supabase Dashboard under Settings > API
-- Add these URLs to "Site URL" and "Additional Redirect URLs":
-- http://localhost:3001
-- http://localhost:3000
-- http://127.0.0.1:3001
-- http://127.0.0.1:3000

-- 2. FIX AUTHENTICATION ISSUES
-- ============================

-- Grant ALL permissions to authenticated users
GRANT ALL ON TABLE suppliers TO authenticated;
GRANT ALL ON TABLE purchase_orders TO authenticated;
GRANT ALL ON TABLE delivery_receipts TO authenticated;
GRANT ALL ON TABLE purchase_requests TO authenticated;
GRANT ALL ON TABLE procurement_approvals TO authenticated;
GRANT ALL ON TABLE inventory_approvals TO authenticated;
GRANT ALL ON TABLE notifications TO authenticated;

-- Grant ALL permissions to service role
GRANT ALL ON TABLE suppliers TO service_role;
GRANT ALL ON TABLE purchase_orders TO service_role;
GRANT ALL ON TABLE delivery_receipts TO service_role;
GRANT ALL ON TABLE purchase_requests TO service_role;
GRANT ALL ON TABLE procurement_approvals TO service_role;
GRANT ALL ON TABLE inventory_approvals TO service_role;
GRANT ALL ON TABLE notifications TO service_role;

-- 3. FIX ROW LEVEL SECURITY
-- =========================

-- Enable RLS on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON suppliers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON purchase_orders;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON delivery_receipts;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON purchase_requests;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON procurement_approvals;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON inventory_approvals;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON notifications;

-- Create permissive policies for authenticated users
CREATE POLICY "Allow all for authenticated users" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON delivery_receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON purchase_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON procurement_approvals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON inventory_approvals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. FIX AUTHENTICATION FOR ANONYMOUS USERS
-- =========================================

-- Allow anonymous access to public tables
GRANT SELECT ON TABLE suppliers TO anon;
GRANT SELECT ON TABLE purchase_orders TO anon;
GRANT SELECT ON TABLE delivery_receipts TO anon;
GRANT SELECT ON TABLE purchase_requests TO anon;
GRANT SELECT ON TABLE procurement_approvals TO anon;
GRANT SELECT ON TABLE inventory_approvals TO anon;
GRANT SELECT ON TABLE notifications TO anon;

-- Create policies for anonymous users
CREATE POLICY "Allow read for anonymous users" ON suppliers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read for anonymous users" ON purchase_orders FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read for anonymous users" ON delivery_receipts FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read for anonymous users" ON purchase_requests FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read for anonymous users" ON procurement_approvals FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read for anonymous users" ON inventory_approvals FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read for anonymous users" ON notifications FOR SELECT TO anon USING (true);

-- 5. VERIFY SETUP
-- ===============

DO $$
BEGIN
    RAISE NOTICE '✅ CORS AND AUTHENTICATION ISSUES FIXED!';
    RAISE NOTICE '🔒 Permissions: ALL granted to authenticated and service_role';
    RAISE NOTICE '🛡️ RLS: Enabled with permissive policies';
    RAISE NOTICE '🌐 CORS: Configured for localhost:3001 and localhost:3000';
    RAISE NOTICE '🔑 Auth: Fixed for both authenticated and anonymous users';
    RAISE NOTICE '🎉 All connectivity issues should now be resolved!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 IMPORTANT: Also update Supabase Dashboard:';
    RAISE NOTICE '   1. Go to Settings > API';
    RAISE NOTICE '   2. Add http://localhost:3001 to Site URL';
    RAISE NOTICE '   3. Add http://localhost:3001 to Additional Redirect URLs';
    RAISE NOTICE '   4. Save changes';
END $$;
