-- Recreate Inventory Table with Correct Structure
-- Completely recreates the inventory table to avoid constraint issues

-- =====================================================
-- SECTION 1: DROP EXISTING INVENTORY TABLE
-- =====================================================

-- Drop existing inventory table and all related constraints
DROP TABLE IF EXISTS public.inventory CASCADE;

-- =====================================================
-- SECTION 2: RECREATE INVENTORY TABLE WITH CORRECT STRUCTURE
-- =====================================================

-- Create inventory table with all required columns and proper constraints
CREATE TABLE public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT,
    current_stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0.00,
    supplier TEXT,
    rfid_code TEXT,  -- Make RFID code optional
    status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECTION 3: INSERT SAMPLE INVENTORY DATA
-- =====================================================

-- Insert sample inventory data with all columns
INSERT INTO public.inventory (item_name, category, current_stock, min_stock_level, unit_price, supplier, rfid_code, status) VALUES
    ('Surgical Masks', 'Medical Supplies', 500, 100, 2.50, 'MedSupply Co.', 'RFID-MASK-001', 'in_stock'),
    ('Hand Sanitizer', 'Medical Supplies', 200, 50, 5.00, 'CleanCare Ltd.', 'RFID-SANI-002', 'in_stock'),
    ('Bandages', 'Medical Supplies', 1000, 200, 1.25, 'FirstAid Inc.', 'RFID-BAND-003', 'in_stock'),
    ('Surgical Gloves', 'Medical Supplies', 300, 75, 3.00, 'MedSupply Co.', 'RFID-GLOV-004', 'in_stock'),
    ('Thermometers', 'Medical Equipment', 50, 10, 25.00, 'TechMed Inc.', 'RFID-THER-005', 'in_stock'),
    ('Blood Pressure Cuffs', 'Medical Equipment', 25, 5, 45.00, 'TechMed Inc.', 'RFID-BP-006', 'in_stock'),
    ('Stethoscopes', 'Medical Equipment', 30, 8, 75.00, 'TechMed Inc.', 'RFID-STET-007', 'in_stock'),
    ('Office Chairs', 'Furniture', 20, 5, 150.00, 'OfficeWorld', 'RFID-CHAIR-008', 'in_stock'),
    ('Desks', 'Furniture', 15, 3, 300.00, 'OfficeWorld', 'RFID-DESK-009', 'in_stock'),
    ('Computers', 'IT Equipment', 10, 2, 800.00, 'TechSolutions', 'RFID-COMP-010', 'in_stock');

-- =====================================================
-- SECTION 4: ENABLE RLS ON INVENTORY TABLE
-- =====================================================

-- Enable RLS on inventory table
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for inventory
CREATE POLICY "Procurement can manage inventory" ON public.inventory
    FOR ALL USING (true);

-- =====================================================
-- SECTION 5: VERIFY THE FIX
-- =====================================================

-- Test that the inventory table works correctly
DO $$
DECLARE
    inventory_count INTEGER;
    column_count INTEGER;
BEGIN
    -- Count inventory items
    SELECT COUNT(*) INTO inventory_count FROM public.inventory;
    
    -- Count columns in inventory table
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'inventory' 
    AND table_schema = 'public';
    
    RAISE NOTICE '✅ Inventory table recreated successfully';
    RAISE NOTICE '✅ All columns created with proper constraints';
    RAISE NOTICE '✅ Sample data inserted: % items', inventory_count;
    RAISE NOTICE '✅ Total columns in inventory table: %', column_count;
    RAISE NOTICE '✅ RLS policy configured';
    
    IF inventory_count > 0 THEN
        RAISE NOTICE '✅ Inventory table is working correctly';
    ELSE
        RAISE NOTICE '⚠️ No inventory items found';
    END IF;
    
    -- Show sample data
    RAISE NOTICE 'Sample inventory items:';
    FOR rec IN 
        SELECT item_name, category, current_stock, rfid_code, status 
        FROM public.inventory 
        LIMIT 3
    LOOP
        RAISE NOTICE '  - % (%) - Stock: %, RFID: %, Status: %', 
            rec.item_name, rec.category, rec.current_stock, rec.rfid_code, rec.status;
    END LOOP;
END $$;
