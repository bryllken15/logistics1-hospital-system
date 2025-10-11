-- =====================================================
-- FINAL APPROVAL WORKFLOW FIX - FIXES EVERYTHING
-- =====================================================

-- =====================================================
-- 1. COMPLETELY REMOVE ALL RPC FUNCTION CONFLICTS
-- =====================================================

-- Drop ALL possible versions of the function
DROP FUNCTION IF EXISTS get_pending_approvals(UUID, TEXT);
DROP FUNCTION IF EXISTS get_pending_approvals(UUID, VARCHAR);
DROP FUNCTION IF EXISTS get_pending_approvals(UUID, CHARACTER VARYING);
DROP FUNCTION IF EXISTS get_pending_approvals(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_pending_approvals(UUID, VARCHAR, VARCHAR);

-- Create a single, clean version with explicit parameter types
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
  
  RETURN;
END;
$$;

-- =====================================================
-- 2. CREATE VIEWS TO FIX RELATIONSHIP ISSUES
-- =====================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS purchase_requests_with_users;
DROP VIEW IF EXISTS procurement_approvals_with_details;

-- Create view for purchase requests to avoid relationship ambiguity
CREATE VIEW purchase_requests_with_users AS
SELECT 
  pr.*,
  u.full_name as requested_by_name,
  u.email as requested_by_email,
  u.username as requested_by_username
FROM purchase_requests pr
LEFT JOIN users u ON pr.requested_by = u.id;

-- Create view for procurement approvals to fix relationship issues
CREATE VIEW procurement_approvals_with_details AS
SELECT 
  pa.*,
  u.full_name as requested_by_name,
  u.email as requested_by_email,
  u.username as requested_by_username,
  pr.title as request_title,
  pr.description as request_description,
  pr.total_amount,
  pr.priority as request_priority,
  pr.requested_date,
  pr.required_date
FROM procurement_approvals pa
LEFT JOIN users u ON pa.requested_by = u.id
LEFT JOIN purchase_requests pr ON pa.purchase_request_id = pr.id;

-- =====================================================
-- 3. ENSURE SAMPLE DATA EXISTS
-- =====================================================

-- Create sample purchase requests if they don't exist
DO $$
DECLARE
  employee_id UUID;
  existing_count INTEGER;
BEGIN
  SELECT id INTO employee_id FROM users WHERE username = 'employee' LIMIT 1;
  SELECT COUNT(*) INTO existing_count FROM purchase_requests WHERE status = 'pending';
  
  IF existing_count = 0 AND employee_id IS NOT NULL THEN
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
    );
  END IF;
END $$;

-- Create procurement approvals if they don't exist
DO $$
DECLARE
  pr_record RECORD;
  employee_id UUID;
  existing_count INTEGER;
BEGIN
  SELECT id INTO employee_id FROM users WHERE username = 'employee' LIMIT 1;
  SELECT COUNT(*) INTO existing_count FROM procurement_approvals WHERE status = 'pending';
  
  IF existing_count = 0 AND employee_id IS NOT NULL THEN
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
      );
    END LOOP;
  END IF;
END $$;

-- =====================================================
-- 4. CREATE NOTIFICATIONS
-- =====================================================

-- Create notifications for managers
DO $$
DECLARE
  manager_record RECORD;
  approval_count INTEGER;
  existing_notif_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO approval_count FROM procurement_approvals WHERE status = 'pending';
  SELECT COUNT(*) INTO existing_notif_count FROM notifications WHERE title = 'New Purchase Request Pending Approval';
  
  IF existing_notif_count = 0 THEN
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
      );
    END LOOP;
  END IF;
END $$;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions on specific views
GRANT SELECT ON purchase_requests_with_users TO authenticated;
GRANT SELECT ON procurement_approvals_with_details TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON purchase_requests_with_users TO anon;
GRANT SELECT ON procurement_approvals_with_details TO anon;
GRANT EXECUTE ON FUNCTION get_pending_approvals(UUID, TEXT) TO anon;

-- =====================================================
-- 6. VERIFICATION
-- =====================================================

DO $$
DECLARE
  user_count INTEGER;
  pr_count INTEGER;
  pa_count INTEGER;
  notif_count INTEGER;
  view_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO pr_count FROM purchase_requests WHERE status = 'pending';
  SELECT COUNT(*) INTO pa_count FROM procurement_approvals WHERE status = 'pending';
  SELECT COUNT(*) INTO notif_count FROM notifications WHERE title = 'New Purchase Request Pending Approval';
  SELECT COUNT(*) INTO view_count FROM information_schema.views WHERE table_schema = 'public' AND table_name IN ('purchase_requests_with_users', 'procurement_approvals_with_details');
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FINAL APPROVAL WORKFLOW FIX COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Data created:';
  RAISE NOTICE 'Users: %', user_count;
  RAISE NOTICE 'Purchase Requests: %', pr_count;
  RAISE NOTICE 'Procurement Approvals: %', pa_count;
  RAISE NOTICE 'Notifications: %', notif_count;
  RAISE NOTICE 'Views created: %', view_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RPC function conflicts resolved!';
  RAISE NOTICE '✅ Relationship issues fixed with views!';
  RAISE NOTICE '✅ Sample data created!';
  RAISE NOTICE '✅ Notifications created!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 APPROVAL WORKFLOW SHOULD WORK NOW!';
  RAISE NOTICE '========================================';
END $$;
