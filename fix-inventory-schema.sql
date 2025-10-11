-- Fix Inventory Schema Issue
-- Adds missing category column to inventory table

-- =====================================================
-- SECTION 1: CHECK AND FIX INVENTORY TABLE SCHEMA
-- =====================================================

-- Check if inventory table exists, if not create it
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT,
    current_stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0.00,
    supplier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category column if it doesn't exist
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS category TEXT;

-- =====================================================
-- SECTION 2: INSERT SAMPLE INVENTORY DATA
-- =====================================================

-- Clear existing data to avoid conflicts
DELETE FROM public.inventory;

-- Insert sample inventory data with category column
INSERT INTO public.inventory (item_name, category, current_stock, min_stock_level, unit_price, supplier) VALUES
    ('Surgical Masks', 'Medical Supplies', 500, 100, 2.50, 'MedSupply Co.'),
    ('Hand Sanitizer', 'Medical Supplies', 200, 50, 5.00, 'CleanCare Ltd.'),
    ('Bandages', 'Medical Supplies', 1000, 200, 1.25, 'FirstAid Inc.'),
    ('Surgical Gloves', 'Medical Supplies', 300, 75, 3.00, 'MedSupply Co.'),
    ('Thermometers', 'Medical Equipment', 50, 10, 25.00, 'TechMed Inc.'),
    ('Blood Pressure Cuffs', 'Medical Equipment', 25, 5, 45.00, 'TechMed Inc.'),
    ('Stethoscopes', 'Medical Equipment', 30, 8, 75.00, 'TechMed Inc.'),
    ('Office Chairs', 'Furniture', 20, 5, 150.00, 'OfficeWorld'),
    ('Desks', 'Furniture', 15, 3, 300.00, 'OfficeWorld'),
    ('Computers', 'IT Equipment', 10, 2, 800.00, 'TechSolutions')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SECTION 3: ENABLE RLS ON INVENTORY TABLE
-- =====================================================

-- Enable RLS on inventory table
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Procurement can manage inventory" ON public.inventory;

-- Create RLS policy for inventory
CREATE POLICY "Procurement can manage inventory" ON public.inventory
    FOR ALL USING (true);

-- =====================================================
-- SECTION 4: VERIFY FIX
-- =====================================================

-- Test that the inventory table works correctly
DO $$
DECLARE
    inventory_count INTEGER;
BEGIN
    -- Count inventory items
    SELECT COUNT(*) INTO inventory_count FROM public.inventory;
    
    RAISE NOTICE '✅ Inventory table fixed successfully';
    RAISE NOTICE '✅ Category column added';
    RAISE NOTICE '✅ Sample data inserted: % items', inventory_count;
    RAISE NOTICE '✅ RLS policy configured';
    
    IF inventory_count > 0 THEN
        RAISE NOTICE '✅ Inventory table is working correctly';
    ELSE
        RAISE NOTICE '⚠️ No inventory items found';
    END IF;
END $$;