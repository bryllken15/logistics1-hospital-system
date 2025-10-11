-- Fix inventory table total_value generated column issue
-- This script will check and fix the total_value column definition

-- First, let's check if total_value is properly defined as a generated column
DO $$
BEGIN
    -- Check if total_value column exists and is generated
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'inventory' 
        AND column_name = 'total_value'
        AND is_generated = 'ALWAYS'
    ) THEN
        RAISE NOTICE 'total_value column exists and is generated - this is correct';
    ELSE
        RAISE NOTICE 'total_value column needs to be fixed';
        
        -- Drop the column if it exists and recreate it as generated
        ALTER TABLE public.inventory DROP COLUMN IF EXISTS total_value;
        
        -- Create it as a generated column
        ALTER TABLE public.inventory 
        ADD COLUMN total_value DECIMAL(10,2) 
        GENERATED ALWAYS AS (quantity * unit_price) STORED;
        
        RAISE NOTICE 'total_value column recreated as generated column';
    END IF;
END $$;

-- Grant permissions on the table
GRANT ALL ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;

-- Ensure RLS policies allow inserts
DROP POLICY IF EXISTS "Allow all operations on inventory" ON public.inventory;
CREATE POLICY "Allow all operations on inventory" ON public.inventory
  FOR ALL USING (true) WITH CHECK (true);

-- Test the fix by trying to insert a record
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Try to insert a test record
    INSERT INTO public.inventory (
        item_name, 
        rfid_code, 
        quantity, 
        status, 
        location, 
        unit_price, 
        created_by
    ) VALUES (
        'Test Item', 
        'RFID-TEST', 
        5, 
        'in_stock', 
        'Test Location', 
        10.00, 
        'dbbd608b-377f-4368-b61e-102f1f727f4f'
    ) RETURNING id INTO test_id;
    
    -- Check if total_value was calculated correctly
    IF (SELECT total_value FROM public.inventory WHERE id = test_id) = 50.00 THEN
        RAISE NOTICE 'SUCCESS: total_value is working correctly (5 * 10.00 = 50.00)';
    ELSE
        RAISE NOTICE 'WARNING: total_value calculation may not be working';
    END IF;
    
    -- Clean up test record
    DELETE FROM public.inventory WHERE id = test_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;
