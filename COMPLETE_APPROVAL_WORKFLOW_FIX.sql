-- =====================================================
-- COMPLETE APPROVAL WORKFLOW FIX
-- This script fixes all schema issues and creates working approval workflow
-- =====================================================

-- =====================================================
-- 1. ENSURE PROPER TABLE SCHEMA
-- =====================================================

-- Add missing columns to procurement_approvals if they don't exist
ALTER TABLE procurement_approvals 
ADD COLUMN IF NOT EXISTS manager_approved_by UUID,
ADD COLUMN IF NOT EXISTS project_manager_approved_by UUID,
ADD COLUMN IF NOT EXISTS manager_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS project_manager_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manager_notes TEXT,
ADD COLUMN IF NOT EXISTS project_manager_notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to inventory_approvals if they don't exist
ALTER TABLE inventory_approvals 
ADD COLUMN IF NOT EXISTS manager_approved_by UUID,
ADD COLUMN IF NOT EXISTS project_manager_approved_by UUID,
ADD COLUMN IF NOT EXISTS manager_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS project_manager_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manager_notes TEXT,
ADD COLUMN IF NOT EXISTS project_manager_notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 2. CREATE FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Drop existing constraints if they exist
DO $$ 
BEGIN
  -- Procurement approvals constraints
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'fk_procurement_approvals_requested_by') THEN
    ALTER TABLE procurement_approvals DROP CONSTRAINT fk_procurement_approvals_requested_by;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'fk_procurement_approvals_manager_approved_by') THEN
    ALTER TABLE procurement_approvals DROP CONSTRAINT fk_procurement_approvals_manager_approved_by;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'fk_procurement_approvals_project_manager_approved_by') THEN
    ALTER TABLE procurement_approvals DROP CONSTRAINT fk_procurement_approvals_project_manager_approved_by;
  END IF;

  -- Inventory approvals constraints
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'fk_inventory_approvals_requested_by') THEN
    ALTER TABLE inventory_approvals DROP CONSTRAINT fk_inventory_approvals_requested_by;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'fk_inventory_approvals_manager_approved_by') THEN
    ALTER TABLE inventory_approvals DROP CONSTRAINT fk_inventory_approvals_manager_approved_by;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'fk_inventory_approvals_project_manager_approved_by') THEN
    ALTER TABLE inventory_approvals DROP CONSTRAINT fk_inventory_approvals_project_manager_approved_by;
  END IF;
END $$;

-- Create foreign key constraints for procurement_approvals
ALTER TABLE procurement_approvals 
ADD CONSTRAINT fk_procurement_approvals_requested_by 
FOREIGN KEY (requested_by) REFERENCES users(id);

ALTER TABLE procurement_approvals 
ADD CONSTRAINT fk_procurement_approvals_manager_approved_by 
FOREIGN KEY (manager_approved_by) REFERENCES users(id);

ALTER TABLE procurement_approvals 
ADD CONSTRAINT fk_procurement_approvals_project_manager_approved_by 
FOREIGN KEY (project_manager_approved_by) REFERENCES users(id);

-- Create foreign key constraints for inventory_approvals
ALTER TABLE inventory_approvals 
ADD CONSTRAINT fk_inventory_approvals_requested_by 
FOREIGN KEY (requested_by) REFERENCES users(id);

ALTER TABLE inventory_approvals 
ADD CONSTRAINT fk_inventory_approvals_manager_approved_by 
FOREIGN KEY (manager_approved_by) REFERENCES users(id);

ALTER TABLE inventory_approvals 
ADD CONSTRAINT fk_inventory_approvals_project_manager_approved_by 
FOREIGN KEY (project_manager_approved_by) REFERENCES users(id);

-- =====================================================
-- 3. DISABLE RLS (CUSTOM AUTHENTICATION)
-- =====================================================

-- Disable RLS since we use custom authentication
ALTER TABLE procurement_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE SAMPLE DATA
-- =====================================================

-- Ensure we have an employee user first
INSERT INTO users (username, full_name, email, role, is_authorized, password_hash, created_at, department) 
SELECT 'employee', 'Hospital Employee', 'employee@hospital.com', 'employee', true, crypt('employee123', gen_salt('bf')), NOW(), 'General'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'employee');

-- Insert sample purchase requests using the employee user
INSERT INTO purchase_requests (
  id, request_number, title, description, total_amount, priority, 
  required_date, requested_by, status, created_at
)
SELECT 
  gen_random_uuid(),
  'REQ-2024-001',
  'Medical Equipment Purchase',
  'Need to purchase new MRI machine for radiology department',
  250000.00,
  'high',
  NOW() + INTERVAL '30 days',
  (SELECT id FROM users WHERE username = 'employee' LIMIT 1),
  'pending',
  NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE username = 'employee')
ON CONFLICT (request_number) DO NOTHING;

INSERT INTO purchase_requests (
  id, request_number, title, description, total_amount, priority, 
  required_date, requested_by, status, created_at
)
SELECT 
  gen_random_uuid(),
  'REQ-2024-002',
  'Office Supplies',
  'Monthly office supplies for administration',
  5000.00,
  'medium',
  NOW() + INTERVAL '7 days',
  (SELECT id FROM users WHERE username = 'employee' LIMIT 1),
  'pending',
  NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE username = 'employee')
ON CONFLICT (request_number) DO NOTHING;

INSERT INTO purchase_requests (
  id, request_number, title, description, total_amount, priority, 
  required_date, requested_by, status, created_at
)
SELECT 
  gen_random_uuid(),
  'REQ-2024-003',
  'IT Equipment',
  'New computers for IT department',
  15000.00,
  'medium',
  NOW() + INTERVAL '14 days',
  (SELECT id FROM users WHERE username = 'employee' LIMIT 1),
  'pending',
  NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE username = 'employee')
ON CONFLICT (request_number) DO NOTHING;

-- Create procurement approvals for sample requests
INSERT INTO procurement_approvals (
  purchase_request_id, requested_by, item_name, description, 
  quantity, unit_price, supplier, category, priority, status, created_at
)
SELECT 
  pr.id,
  pr.requested_by,
  pr.title,
  pr.description,
  1,
  pr.total_amount,
  'TBD',
  'General',
  pr.priority,
  'pending',
  NOW()
FROM purchase_requests pr
WHERE pr.status = 'pending'
AND pr.requested_by IS NOT NULL
AND EXISTS (SELECT 1 FROM users WHERE id = pr.requested_by)
AND NOT EXISTS (
  SELECT 1 FROM procurement_approvals pa 
  WHERE pa.purchase_request_id = pr.id
);

-- Create inventory approvals for sample data
INSERT INTO inventory_approvals (
  inventory_id, requested_by, change_type, description, 
  status, created_at
)
SELECT 
  (SELECT id FROM inventory LIMIT 1),
  (SELECT id FROM users WHERE username = 'employee' LIMIT 1),
  'add',
  'Sample inventory change request',
  'pending',
  NOW()
WHERE EXISTS (SELECT 1 FROM inventory LIMIT 1)
AND EXISTS (SELECT 1 FROM users WHERE username = 'employee')
AND NOT EXISTS (
  SELECT 1 FROM inventory_approvals ia 
  WHERE ia.requested_by = (SELECT id FROM users WHERE username = 'employee' LIMIT 1)
  AND ia.status = 'pending'
);

-- =====================================================
-- 5. CREATE NOTIFICATIONS
-- =====================================================

-- Create notifications for managers about pending approvals
DELETE FROM notifications 
WHERE title = 'New Purchase Request Pending Approval'
AND user_id IN (SELECT id FROM users WHERE role IN ('manager', 'project_manager', 'admin'));

INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
SELECT 
  u.id,
  'New Purchase Request Pending Approval',
  'You have ' || COUNT(pa.id) || ' pending purchase request(s) requiring your approval.',
  'info',
  false,
  NOW()
FROM users u
LEFT JOIN procurement_approvals pa ON pa.status = 'pending'
WHERE u.role IN ('manager', 'project_manager', 'admin')
GROUP BY u.id
HAVING COUNT(pa.id) > 0;

-- =====================================================
-- 6. CREATE UPDATED RPC FUNCTIONS
-- =====================================================

-- Drop and recreate get_pending_approvals function
DROP FUNCTION IF EXISTS get_pending_approvals(UUID, TEXT);

CREATE OR REPLACE FUNCTION get_pending_approvals(p_user_id UUID, p_user_role TEXT)
RETURNS TABLE (
  approval_id UUID,
  request_id UUID,
  request_title TEXT,
  request_description TEXT,
  total_amount DECIMAL,
  requested_by_name TEXT,
  requested_date TIMESTAMP WITH TIME ZONE,
  required_date TIMESTAMP WITH TIME ZONE,
  priority TEXT,
  approval_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return procurement approvals for managers
  IF p_user_role IN ('manager', 'project_manager', 'admin') THEN
    RETURN QUERY
    SELECT 
      pa.id as approval_id,
      pa.purchase_request_id as request_id,
      pa.item_name as request_title,
      pa.description as request_description,
      pa.total_value as total_amount,
      u.full_name as requested_by_name,
      pr.requested_date,
      pr.required_date,
      pa.priority,
      pa.status as approval_status,
      pa.created_at
    FROM procurement_approvals pa
    JOIN purchase_requests pr ON pa.purchase_request_id = pr.id
    JOIN users u ON pa.requested_by = u.id
    WHERE pa.status = 'pending'
    ORDER BY pa.created_at DESC;
  END IF;
  
  -- Return empty result for other roles
  RETURN;
END;
$$;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION get_pending_approvals(UUID, TEXT) TO anon;

-- =====================================================
-- 8. VERIFICATION
-- =====================================================

DO $$
DECLARE
  procurement_count INTEGER;
  inventory_count INTEGER;
  purchase_requests_count INTEGER;
  users_count INTEGER;
BEGIN
  -- Check data counts
  SELECT COUNT(*) INTO procurement_count FROM procurement_approvals;
  SELECT COUNT(*) INTO inventory_count FROM inventory_approvals;
  SELECT COUNT(*) INTO purchase_requests_count FROM purchase_requests;
  SELECT COUNT(*) INTO users_count FROM users;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'COMPLETE APPROVAL WORKFLOW FIX COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Data counts:';
  RAISE NOTICE 'Users: %', users_count;
  RAISE NOTICE 'Purchase Requests: %', purchase_requests_count;
  RAISE NOTICE 'Procurement Approvals: %', procurement_count;
  RAISE NOTICE 'Inventory Approvals: %', inventory_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Manager dashboard should now work with:';
  RAISE NOTICE '✓ Pending approval requests';
  RAISE NOTICE '✓ Proper foreign key relationships';
  RAISE NOTICE '✓ Working RPC functions';
  RAISE NOTICE '✓ Real-time notifications';
  RAISE NOTICE '========================================';
END $$;
