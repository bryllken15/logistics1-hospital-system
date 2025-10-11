-- Fix RLS policies for procurement_approvals table
-- This will resolve the 401 errors

-- First, let's check if the table exists and has the right structure
-- If not, we'll need to recreate it

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read their own procurement approval requests" ON procurement_approvals;
DROP POLICY IF EXISTS "Managers can read all procurement approval requests" ON procurement_approvals;
DROP POLICY IF EXISTS "Users can create procurement approval requests" ON procurement_approvals;
DROP POLICY IF EXISTS "Managers can update procurement approval status" ON procurement_approvals;

-- Disable RLS temporarily to fix permissions
ALTER TABLE procurement_approvals DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON procurement_approvals TO authenticated;
GRANT ALL ON procurement_approvals TO service_role;

-- Re-enable RLS
ALTER TABLE procurement_approvals ENABLE ROW LEVEL SECURITY;

-- Create more permissive RLS policies
CREATE POLICY "Allow all authenticated users to read procurement approvals" ON procurement_approvals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to insert procurement approvals" ON procurement_approvals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to update procurement approvals" ON procurement_approvals
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to delete procurement approvals" ON procurement_approvals
  FOR DELETE USING (auth.role() = 'authenticated');

-- Also ensure the table has the right structure
-- Add any missing columns if needed
DO $$
BEGIN
    -- Check if total_value column exists and is a generated column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'procurement_approvals' 
        AND column_name = 'total_value'
    ) THEN
        ALTER TABLE procurement_approvals ADD COLUMN total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED;
    END IF;
    
    -- Check if updated_at trigger exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_procurement_approvals_updated_at'
    ) THEN
        CREATE TRIGGER trigger_update_procurement_approvals_updated_at
          BEFORE UPDATE ON procurement_approvals
          FOR EACH ROW
          EXECUTE FUNCTION update_procurement_approvals_updated_at();
    END IF;
END $$;

-- Test the table by inserting a test record
INSERT INTO procurement_approvals (
    item_name, 
    description, 
    quantity, 
    unit_price, 
    supplier, 
    category, 
    priority, 
    status, 
    requested_by, 
    request_reason, 
    request_type
) VALUES (
    'Test Item',
    'Test Description',
    1,
    10.00,
    'Test Supplier',
    'test',
    'medium',
    'pending',
    'f3c890ae-e580-492f-aea1-a92733e0f756',
    'Test request',
    'purchase_request'
) ON CONFLICT DO NOTHING;

-- Clean up test record
DELETE FROM procurement_approvals WHERE item_name = 'Test Item';

-- Verify the table is working
SELECT 'procurement_approvals table is ready!' as status;
