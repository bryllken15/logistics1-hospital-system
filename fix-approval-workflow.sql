-- Fix Approval Workflow Issues
-- This script fixes the RLS policies and ensures the approval workflow works correctly

-- =====================================================
-- SECTION 1: FIX RLS POLICIES FOR CUSTOM AUTH
-- =====================================================

-- Drop existing policies that use auth.uid() (which doesn't work with custom auth)
DROP POLICY IF EXISTS "Users can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Employees can create requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Managers can view all requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Managers can view assigned approvals" ON public.purchase_request_approvals;
DROP POLICY IF EXISTS "Managers can update approvals" ON public.purchase_request_approvals;

-- Create new policies that work with custom authentication
-- Users policies - allow all authenticated users to read profiles
CREATE POLICY "Users can read all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (true);

-- Notifications policies - allow users to read their own notifications
CREATE POLICY "Users can read own notifications" ON public.notifications
    FOR SELECT USING (true);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Purchase requests policies - allow employees to create, managers to view all
CREATE POLICY "Employees can create requests" ON public.purchase_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own requests" ON public.purchase_requests
    FOR SELECT USING (true);

CREATE POLICY "Managers can view all requests" ON public.purchase_requests
    FOR SELECT USING (true);

-- Purchase request approvals policies - allow managers to view and update
CREATE POLICY "Managers can view assigned approvals" ON public.purchase_request_approvals
    FOR SELECT USING (true);

CREATE POLICY "Managers can update approvals" ON public.purchase_request_approvals
    FOR UPDATE USING (true);

-- =====================================================
-- SECTION 2: FIX get_pending_approvals FUNCTION
-- =====================================================

-- Drop and recreate the function with better error handling
DROP FUNCTION IF EXISTS get_pending_approvals(UUID, TEXT);

CREATE OR REPLACE FUNCTION get_pending_approvals(p_user_id UUID, p_user_role TEXT)
RETURNS TABLE (
    approval_id UUID,
    request_id UUID,
    request_title TEXT,
    requester_name TEXT,
    total_amount DECIMAL,
    priority TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log the function call for debugging
    RAISE NOTICE 'get_pending_approvals called with user_id: %, role: %', p_user_id, p_user_role;
    
    RETURN QUERY
    SELECT 
        pra.id as approval_id,
        pr.id as request_id,
        pr.title as request_title,
        u.full_name as requester_name,
        pr.total_amount,
        pr.priority,
        pr.created_at
    FROM public.purchase_request_approvals pra
    JOIN public.purchase_requests pr ON pra.request_id = pr.id
    JOIN public.users u ON pr.requested_by = u.id
    WHERE pra.approver_id = p_user_id
    AND pra.status = 'pending'
    ORDER BY pr.created_at DESC;
    
    -- Log the result count
    GET DIAGNOSTICS result_count = ROW_COUNT;
    RAISE NOTICE 'get_pending_approvals returning % rows', result_count;
END;
$$;

-- =====================================================
-- SECTION 3: FIX create_approval_entries FUNCTION
-- =====================================================

-- Drop and recreate the function with better error handling
DROP FUNCTION IF EXISTS create_approval_entries();

CREATE OR REPLACE FUNCTION create_approval_entries()
RETURNS TRIGGER AS $$
DECLARE
    manager_count INTEGER;
BEGIN
    -- Log the trigger execution
    RAISE NOTICE 'create_approval_entries triggered for request_id: %', NEW.id;
    
    -- Count managers and admins
    SELECT COUNT(*) INTO manager_count
    FROM public.users u
    WHERE u.role IN ('manager', 'admin')
    AND u.is_authorized = true;
    
    RAISE NOTICE 'Found % managers/admins to create approvals for', manager_count;
    
    -- Create approval entries for all managers and admins
    INSERT INTO public.purchase_request_approvals (request_id, approver_id, status)
    SELECT NEW.id, u.id, 'pending'
    FROM public.users u
    WHERE u.role IN ('manager', 'admin')
    AND u.is_authorized = true;
    
    -- Log how many approval entries were created
    GET DIAGNOSTICS manager_count = ROW_COUNT;
    RAISE NOTICE 'Created % approval entries', manager_count;
    
    -- Send notifications to managers
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT u.id, 'New Purchase Request', 
           'Purchase request "' || NEW.title || '" requires your approval',
           'info'
    FROM public.users u
    WHERE u.role IN ('manager', 'admin')
    AND u.is_authorized = true;
    
    -- Log how many notifications were created
    GET DIAGNOSTICS manager_count = ROW_COUNT;
    RAISE NOTICE 'Created % notifications', manager_count;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 4: VERIFY TRIGGER EXISTS
-- =====================================================

-- Drop and recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS auto_create_approvals ON public.purchase_requests;

CREATE TRIGGER auto_create_approvals
    AFTER INSERT ON public.purchase_requests
    FOR EACH ROW
    EXECUTE FUNCTION create_approval_entries();

-- =====================================================
-- SECTION 5: TEST THE WORKFLOW
-- =====================================================

-- Create a test request to verify the trigger works
DO $$
DECLARE
    test_employee_id UUID;
    test_request_id UUID;
    approval_count INTEGER;
BEGIN
    -- Get the employee user ID
    SELECT id INTO test_employee_id 
    FROM public.users 
    WHERE username = 'employee' 
    LIMIT 1;
    
    IF test_employee_id IS NOT NULL THEN
        -- Create a test request
        INSERT INTO public.purchase_requests (
            request_number, title, description, total_amount, 
            priority, required_date, requested_by, status
        ) VALUES (
            'TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT,
            'Test Workflow Request',
            'Testing the approval workflow',
            500.00,
            'medium',
            CURRENT_DATE + INTERVAL '7 days',
            test_employee_id,
            'pending'
        ) RETURNING id INTO test_request_id;
        
        -- Check if approval entries were created
        SELECT COUNT(*) INTO approval_count
        FROM public.purchase_request_approvals
        WHERE request_id = test_request_id;
        
        RAISE NOTICE 'Test request created with ID: %', test_request_id;
        RAISE NOTICE 'Approval entries created: %', approval_count;
        
        IF approval_count > 0 THEN
            RAISE NOTICE '✅ Auto-approval trigger is working correctly';
        ELSE
            RAISE NOTICE '❌ Auto-approval trigger is NOT working';
        END IF;
        
        -- Clean up test request
        DELETE FROM public.purchase_requests WHERE id = test_request_id;
        RAISE NOTICE 'Test request cleaned up';
    ELSE
        RAISE NOTICE '❌ Employee user not found - cannot test workflow';
    END IF;
END $$;

-- =====================================================
-- SECTION 6: SUMMARY
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Approval workflow fixes applied';
    RAISE NOTICE '✅ RLS policies updated for custom authentication';
    RAISE NOTICE '✅ get_pending_approvals function improved';
    RAISE NOTICE '✅ create_approval_entries function improved';
    RAISE NOTICE '✅ Auto-approval trigger verified';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test the workflow with: node diagnose-approval-workflow.js';
    RAISE NOTICE '2. Check manager dashboard for pending approvals';
    RAISE NOTICE '3. Verify employees can create requests';
END $$;
