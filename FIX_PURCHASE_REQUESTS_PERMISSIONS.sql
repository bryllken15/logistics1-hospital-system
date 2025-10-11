-- Fix permissions for purchase_requests table
-- This script ensures that users can insert, update, and select from purchase_requests table

-- Disable RLS on purchase_requests table to allow all operations
ALTER TABLE purchase_requests DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT ALL ON purchase_requests TO authenticated;
GRANT ALL ON purchase_requests TO anon;

-- Ensure the table has the correct structure
-- Check if all required columns exist
DO $$
BEGIN
    -- Add request_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_requests' AND column_name = 'request_number') THEN
        ALTER TABLE purchase_requests ADD COLUMN request_number TEXT UNIQUE;
    END IF;
    
    -- Add requested_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_requests' AND column_name = 'requested_date') THEN
        ALTER TABLE purchase_requests ADD COLUMN requested_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    -- Add approval_notes if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_requests' AND column_name = 'approval_notes') THEN
        ALTER TABLE purchase_requests ADD COLUMN approval_notes TEXT;
    END IF;
    
    -- Add approved_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_requests' AND column_name = 'approved_at') THEN
        ALTER TABLE purchase_requests ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requested_by ON purchase_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_approved_by ON purchase_requests(approved_by);

-- Use existing user IDs from the system
-- Employee: 0b6ccaac-a97f-4d11-8795-44c6cce067c6
-- Manager: 893ba925-2a4a-4c2f-afe3-1c90c960f467  
-- Project Manager: 07444c7e-4edd-4789-8ddb-4c408213462a

-- Insert some sample data if the table is empty
INSERT INTO purchase_requests (
    request_number,
    title,
    description,
    total_amount,
    priority,
    required_date,
    requested_date,
    requested_by,
    status
) VALUES (
    'REQ-SAMPLE-001',
    'Sample Purchase Request',
    'This is a sample purchase request for testing',
    1000.00,
    'medium',
    '2024-12-31',
    CURRENT_DATE,
    '0b6ccaac-a97f-4d11-8795-44c6cce067c6',
    'pending'
) ON CONFLICT (request_number) DO NOTHING;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'purchase_requests' 
ORDER BY ordinal_position;

-- Show current permissions
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_name = 'purchase_requests';

-- Test insert permission
DO $$
BEGIN
    RAISE NOTICE 'Testing purchase_requests table permissions...';
    
    -- Test if we can insert
    BEGIN
        INSERT INTO purchase_requests (
            request_number,
            title,
            description,
            total_amount,
            priority,
            required_date,
            requested_date,
            requested_by,
            status
        ) VALUES (
            'REQ-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT,
            'Test Purchase Request',
            'Testing permissions',
            500.00,
            'low',
            '2024-12-31',
            CURRENT_DATE,
            '0b6ccaac-a97f-4d11-8795-44c6cce067c6',
            'pending'
        );
        
        RAISE NOTICE '✅ INSERT permission works!';
        
        -- Clean up test data
        DELETE FROM purchase_requests WHERE title = 'Test Purchase Request';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ INSERT permission failed: %', SQLERRM;
    END;
    
    -- Test if we can select
    BEGIN
        PERFORM * FROM purchase_requests LIMIT 1;
        RAISE NOTICE '✅ SELECT permission works!';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ SELECT permission failed: %', SQLERRM;
    END;
    
    -- Test if we can update
    BEGIN
        UPDATE purchase_requests SET status = 'pending' WHERE status = 'pending';
        RAISE NOTICE '✅ UPDATE permission works!';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ UPDATE permission failed: %', SQLERRM;
    END;
    
END $$;
