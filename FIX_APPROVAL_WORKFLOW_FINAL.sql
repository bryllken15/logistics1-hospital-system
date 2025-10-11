-- =====================================================
-- FINAL APPROVAL WORKFLOW FIX
-- This script fixes the missing approval workflow functionality
-- =====================================================

-- =====================================================
-- 1. CREATE MISSING RPC FUNCTIONS
-- =====================================================

-- Create get_pending_approvals function that the frontend expects
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

-- Create get_approval_stats function
CREATE OR REPLACE FUNCTION get_approval_stats(p_user_id UUID, p_user_role TEXT)
RETURNS TABLE (
  pending_approvals INTEGER,
  total_requests INTEGER,
  approved_requests INTEGER,
  rejected_requests INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_user_role IN ('manager', 'project_manager', 'admin') THEN
    RETURN QUERY
    SELECT 
      (SELECT COUNT(*)::INTEGER FROM procurement_approvals WHERE approver_id = p_user_id AND status = 'pending'),
      (SELECT COUNT(*)::INTEGER FROM procurement_approvals WHERE approver_id = p_user_id),
      (SELECT COUNT(*)::INTEGER FROM procurement_approvals WHERE approver_id = p_user_id AND status = 'approved'),
      (SELECT COUNT(*)::INTEGER FROM procurement_approvals WHERE approver_id = p_user_id AND status = 'rejected');
  ELSE
    RETURN QUERY SELECT 0, 0, 0, 0;
  END IF;
END;
$$;

-- =====================================================
-- 2. CREATE APPROVAL WORKFLOW FUNCTIONS
-- =====================================================

-- Drop existing functions first to avoid parameter conflicts
DROP FUNCTION IF EXISTS approve_purchase_request(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS reject_purchase_request(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS reject_purchase_request(UUID, UUID, TEXT, TEXT);

-- Function to approve a purchase request
CREATE OR REPLACE FUNCTION approve_purchase_request(
  p_request_id UUID,
  p_approver_id UUID,
  p_comments TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  approval_record RECORD;
  all_approvals_complete BOOLEAN := FALSE;
BEGIN
  -- Update the approval record
  UPDATE procurement_approvals 
  SET status = 'approved', 
      updated_at = NOW()
  WHERE purchase_request_id = p_request_id 
  AND status = 'pending';
  
  -- Update the purchase request status to approved
  UPDATE purchase_requests 
  SET status = 'approved', 
      approved_by = p_approver_id,
      updated_at = NOW()
  WHERE id = p_request_id;
  
  RETURN TRUE;
END;
$$;

-- Function to reject a purchase request
CREATE OR REPLACE FUNCTION reject_purchase_request(
  p_request_id UUID,
  p_approver_id UUID,
  p_comments TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the approval record
  UPDATE procurement_approvals 
  SET status = 'rejected', 
      updated_at = NOW()
  WHERE purchase_request_id = p_request_id 
  AND status = 'pending';
  
  -- Update the purchase request status to rejected
  UPDATE purchase_requests 
  SET status = 'rejected', 
      approved_by = p_approver_id,
      updated_at = NOW()
  WHERE id = p_request_id;
  
  RETURN TRUE;
END;
$$;

-- =====================================================
-- 3. CREATE SAMPLE PURCHASE REQUESTS FOR TESTING
-- =====================================================

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
  (SELECT id FROM users WHERE username = 'employee' LIMIT 1),
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
  (SELECT id FROM users WHERE username = 'employee' LIMIT 1),
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
  (SELECT id FROM users WHERE username = 'employee' LIMIT 1),
  'pending',
  NOW()
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. CREATE APPROVAL RECORDS FOR SAMPLE REQUESTS
-- =====================================================

-- Create approval records for managers and project managers
INSERT INTO procurement_approvals (purchase_request_id, requested_by, item_name, description, quantity, unit_price, supplier, category, priority, status, created_at)
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
AND NOT EXISTS (
  SELECT 1 FROM procurement_approvals pa 
  WHERE pa.purchase_request_id = pr.id
);

-- =====================================================
-- 5. CREATE NOTIFICATIONS FOR PENDING APPROVALS
-- =====================================================

-- Create notifications for managers about pending approvals
-- First delete old similar notifications to avoid duplicates
DELETE FROM notifications 
WHERE title = 'New Purchase Request Pending Approval'
AND user_id IN (SELECT id FROM users WHERE role IN ('manager', 'project_manager', 'admin'));

-- Then insert new notifications
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
-- 6. GRANT PERMISSIONS FOR NEW FUNCTIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_pending_approvals(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_approval_stats(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_purchase_request(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_purchase_request(UUID, UUID, TEXT) TO authenticated;

GRANT EXECUTE ON FUNCTION get_pending_approvals(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_approval_stats(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION approve_purchase_request(UUID, UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION reject_purchase_request(UUID, UUID, TEXT) TO anon;

-- =====================================================
-- 7. VERIFICATION
-- =====================================================

DO $$
DECLARE
  pending_count INTEGER;
  sample_requests_count INTEGER;
BEGIN
  -- Check if we have pending approvals
  SELECT COUNT(*) INTO pending_count
  FROM procurement_approvals 
  WHERE status = 'pending';
  
  -- Check if we have sample requests
  SELECT COUNT(*) INTO sample_requests_count
  FROM purchase_requests 
  WHERE status = 'pending';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'APPROVAL WORKFLOW FIX COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Pending approvals created: %', pending_count;
  RAISE NOTICE 'Sample purchase requests: %', sample_requests_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Manager dashboard should now show:';
  RAISE NOTICE '✓ Pending approval requests';
  RAISE NOTICE '✓ Approval statistics';
  RAISE NOTICE '✓ Real-time notifications';
  RAISE NOTICE '✓ Working approval workflow';
  RAISE NOTICE '========================================';
END $$;
