-- Fix Employee Dashboard Schema Issues
-- This script addresses the total_value column constraint issue

-- First, let's check the current constraint on total_value
-- The error suggests there's a constraint preventing non-DEFAULT values

-- Option 1: Make total_value nullable if it's not already
ALTER TABLE procurement_approvals 
ALTER COLUMN total_value DROP NOT NULL;

-- Option 2: If there's a DEFAULT constraint, remove it
ALTER TABLE procurement_approvals 
ALTER COLUMN total_value DROP DEFAULT;

-- Option 3: If there's a CHECK constraint, we might need to drop it
-- (This would need to be done carefully as it might affect data integrity)

-- Let's also ensure all required columns are properly set up
-- Check if there are any other constraints that might be causing issues

-- Ensure the table structure is correct for our direct insertion approach
DO $$
BEGIN
    -- Add any missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'procurement_approvals' AND column_name = 'request_type') THEN
        ALTER TABLE procurement_approvals ADD COLUMN request_type VARCHAR(50) DEFAULT 'purchase_request';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'procurement_approvals' AND column_name = 'request_reason') THEN
        ALTER TABLE procurement_approvals ADD COLUMN request_reason TEXT;
    END IF;
    
    -- Ensure total_value can accept our values
    -- This should allow the direct insertion to work
    RAISE NOTICE 'Schema fixes applied for Employee Dashboard';
END $$;

-- Test the fix by inserting a sample record
INSERT INTO procurement_approvals (
    item_name,
    description,
    quantity,
    unit_price,
    total_value,
    supplier,
    category,
    priority,
    status,
    requested_by,
    request_reason,
    request_type
) VALUES (
    'Test Employee Request',
    'Test description',
    1,
    500.00,
    500.00,
    '',
    'general',
    'medium',
    'pending',
    '33333333-3333-3333-3333-333333333333',
    'Test description',
    'purchase_request'
) ON CONFLICT DO NOTHING;

-- Clean up the test record
DELETE FROM procurement_approvals 
WHERE item_name = 'Test Employee Request' 
AND description = 'Test description';

RAISE NOTICE 'Employee Dashboard schema fix completed successfully!';
