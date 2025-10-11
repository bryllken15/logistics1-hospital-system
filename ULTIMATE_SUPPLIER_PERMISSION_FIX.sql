-- =====================================================
-- ULTIMATE SUPPLIER PERMISSION FIX
-- =====================================================
-- This completely fixes the "permission denied for table suppliers" error

-- 1. FIRST, CHECK IF TABLE EXISTS
-- ===============================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        RAISE NOTICE '❌ Table "suppliers" does not exist! Creating it...';
        
        -- Create the suppliers table
        CREATE TABLE suppliers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            contact VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone VARCHAR(50),
            address TEXT,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID,
            notes TEXT
        );
        
        RAISE NOTICE '✅ Table "suppliers" created successfully!';
    ELSE
        RAISE NOTICE '✅ Table "suppliers" already exists!';
    END IF;
END $$;

-- 2. DISABLE ROW LEVEL SECURITY
-- =============================
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;

-- 3. DROP ALL EXISTING POLICIES
-- =============================
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON suppliers;
DROP POLICY IF EXISTS "Enable all operations for service role" ON suppliers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON suppliers;
DROP POLICY IF EXISTS "Allow all for service role" ON suppliers;

-- 4. GRANT ALL PERMISSIONS TO AUTHENTICATED
-- =========================================
GRANT ALL ON TABLE suppliers TO authenticated;
GRANT ALL ON TABLE suppliers TO anon;
GRANT ALL ON TABLE suppliers TO service_role;

-- 5. GRANT PERMISSIONS ON SEQUENCE
-- ================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'suppliers_id_seq') THEN
        GRANT ALL ON SEQUENCE suppliers_id_seq TO authenticated;
        GRANT ALL ON SEQUENCE suppliers_id_seq TO anon;
        GRANT ALL ON SEQUENCE suppliers_id_seq TO service_role;
        RAISE NOTICE '✅ Sequence permissions granted!';
    END IF;
END $$;

-- 6. CREATE PERMISSIVE POLICIES (JUST IN CASE)
-- ============================================
CREATE POLICY "Allow all operations for authenticated users" ON suppliers
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for service role" ON suppliers
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. VERIFY THE FIX
-- =================
DO $$
DECLARE
    table_exists BOOLEAN;
    rls_enabled BOOLEAN;
    has_permissions BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'suppliers'
    ) INTO table_exists;
    
    -- Check if RLS is disabled
    SELECT NOT relrowsecurity 
    FROM pg_class 
    WHERE relname = 'suppliers' 
    INTO rls_enabled;
    
    -- Check if we have permissions
    SELECT has_table_privilege('authenticated', 'suppliers', 'INSERT')
    INTO has_permissions;
    
    RAISE NOTICE '🔍 DIAGNOSTIC RESULTS:';
    RAISE NOTICE '   Table exists: %', table_exists;
    RAISE NOTICE '   RLS disabled: %', rls_enabled;
    RAISE NOTICE '   Has INSERT permission: %', has_permissions;
    
    IF table_exists AND rls_enabled AND has_permissions THEN
        RAISE NOTICE '✅ ALL CHECKS PASSED! SUPPLIER PERMISSIONS FIXED!';
        RAISE NOTICE '🎉 You can now add, edit, and delete suppliers!';
    ELSE
        RAISE NOTICE '❌ SOME CHECKS FAILED!';
        IF NOT table_exists THEN
            RAISE NOTICE '   - Table does not exist';
        END IF;
        IF NOT rls_enabled THEN
            RAISE NOTICE '   - RLS is still enabled';
        END IF;
        IF NOT has_permissions THEN
            RAISE NOTICE '   - No INSERT permissions';
        END IF;
    END IF;
END $$;
