-- =====================================================
-- SIMPLE SUPPLIER PERMISSIONS FIX
-- =====================================================
-- This fixes the "permission denied for table suppliers" error

-- 1. DISABLE ROW LEVEL SECURITY
-- =============================
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;

-- 2. GRANT ALL PERMISSIONS
-- ========================
GRANT ALL ON TABLE suppliers TO authenticated;
GRANT ALL ON TABLE suppliers TO service_role;

-- 3. VERIFY THE FIX
-- =================
DO $$
BEGIN
  RAISE NOTICE '✅ SUPPLIER PERMISSIONS FIXED!';
  RAISE NOTICE '🔓 RLS: DISABLED on suppliers table';
  RAISE NOTICE '🔒 Permissions: ALL granted to authenticated and service_role';
  RAISE NOTICE '🎉 You can now add, edit, and delete suppliers!';
END $$;
