-- =====================================================
-- SIMPLE APPROVAL WORKFLOW FIX
-- This script creates a working approval workflow without complex constraints
-- =====================================================

-- =====================================================
-- 1. DISABLE RLS (CUSTOM AUTHENTICATION)
-- =====================================================

-- Disable RLS since we use custom authentication
ALTER TABLE procurement_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. ENSURE USERS EXIST
-- =====================================================

-- Insert all required users if they don't exist
INSERT INTO users (username, full_name, email, role, is_authorized, password_hash, created_at, department) VALUES
('admin', 'System Administrator', 'admin@hospital.com', 'admin', true, crypt('admin123', gen_salt('bf')), NOW(), 'Administration'),
('manager', 'Department Manager', 'manager@hospital.com', 'manager', true, crypt('manager123', gen_salt('bf')), NOW(), 'Management'),
('employee', 'Hospital Employee', 'employee@hospital.com', 'employee', true, crypt('employee123', gen_salt('bf')), NOW(), 'General'),
('procurement', 'Procurement Officer', 'procurement@hospital.com', 'procurement', true, crypt('procurement123', gen_salt('bf')), NOW(), 'Procurement'),
('project_manager', 'Project Manager', 'pm@hospital.com', 'project_manager', true, crypt('pm123', gen_salt('bf')), NOW(), 'Projects'),
('maintenance', 'Maintenance Officer', 'maintenance@hospital.com', 'maintenance', true, crypt('maintenance123', gen_salt('bf')), NOW(), 'Maintenance'),
('document_analyst', 'Document Analyst', 'analyst@hospital.com', 'document_analyst', true, crypt('analyst123', gen_salt('bf')), NOW(), 'Documentation')
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- 3. CREATE SAMPLE PURCHASE REQUESTS
-- =====================================================

-- Get the employee user ID
DO $$
DECLARE
  employee_id UUID;
BEGIN
  SELECT id INTO employee_id FROM users WHERE username = 'employee' LIMIT 1;
  
  -- Insert sample purchase requests
  INSERT INTO purchase_requests (
    id, request_number, title, description, total_amount, priority, 
    required_date, requested_by, status, created_at
  ) VALUES
  (
    gen_random_uuid(),
    'REQ-2024-001',
    'Medical Equipment Purchase',
    'Need to purchase new MRI machine for radiology department',
    250000.00,
    'high',
    NOW() + INTERVAL '30 days',
    employee_id,
    'pending',
    NOW()
  ),
  (
    gen_random_uuid(),
    'REQ-2024-002',
    'Office Supplies',
    'Monthly office supplies for administration',
    5000.00,
    'medium',
    NOW() + INTERVAL '7 days',
    employee_id,
    'pending',
    NOW()
  ),
  (
    gen_random_uuid(),
    'REQ-2024-003',
    'IT Equipment',
    'New computers for IT department',
    15000.00,
    'medium',
    NOW() + INTERVAL '14 days',
    employee_id,
    'pending',
    NOW()
  )
  ON CONFLICT (request_number) DO NOTHING;
END $$;

-- =====================================================
-- 4. CREATE PROCUREMENT APPROVALS
-- =====================================================

-- Create procurement approvals for each purchase request
DO $$
DECLARE
  pr_record RECORD;
  employee_id UUID;
BEGIN
  -- Get employee ID
  SELECT id INTO employee_id FROM users WHERE username = 'employee' LIMIT 1;
  
  -- Create approvals for each pending purchase request
  FOR pr_record IN 
    SELECT id, title, description, total_amount, priority 
    FROM purchase_requests 
    WHERE status = 'pending'
  LOOP
    INSERT INTO procurement_approvals (
      purchase_request_id, requested_by, item_name, description, 
      quantity, unit_price, supplier, category, priority, status, created_at
    ) VALUES (
      pr_record.id,
      employee_id,
      pr_record.title,
      pr_record.description,
      1,
      pr_record.total_amount,
      'TBD',
      'General',
      pr_record.priority,
      'pending',
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- 5. CREATE NOTIFICATIONS
-- =====================================================

-- Create notifications for managers
DO $$
DECLARE
  manager_record RECORD;
  approval_count INTEGER;
BEGIN
  -- Get count of pending approvals
  SELECT COUNT(*) INTO approval_count FROM procurement_approvals WHERE status = 'pending';
  
  -- Create notifications for each manager
  FOR manager_record IN 
    SELECT id FROM users WHERE role IN ('manager', 'project_manager', 'admin')
  LOOP
    INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
    VALUES (
      manager_record.id,
      'New Purchase Request Pending Approval',
      'You have ' || approval_count || ' pending purchase request(s) requiring your approval.',
      'info',
      false,
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- 6. CREATE RPC FUNCTION
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
  user_count INTEGER;
  pr_count INTEGER;
  pa_count INTEGER;
  notif_count INTEGER;
BEGIN
  -- Count data
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO pr_count FROM purchase_requests WHERE status = 'pending';
  SELECT COUNT(*) INTO pa_count FROM procurement_approvals WHERE status = 'pending';
  SELECT COUNT(*) INTO notif_count FROM notifications WHERE title = 'New Purchase Request Pending Approval';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SIMPLE APPROVAL WORKFLOW FIX COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Data created:';
  RAISE NOTICE 'Users: %', user_count;
  RAISE NOTICE 'Purchase Requests: %', pr_count;
  RAISE NOTICE 'Procurement Approvals: %', pa_count;
  RAISE NOTICE 'Notifications: %', notif_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Manager dashboard should now work!';
  RAISE NOTICE '========================================';
END $$;
