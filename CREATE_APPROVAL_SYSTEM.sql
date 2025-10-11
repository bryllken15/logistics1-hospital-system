-- CREATE COMPLETE APPROVAL SYSTEM
-- This script creates all approval workflow tables and functions

-- =============================================
-- STEP 1: CREATE SEQUENCES AND APPROVAL WORKFLOW TABLES
-- =============================================

-- Create sequence for purchase request numbers
DROP SEQUENCE IF EXISTS public.purchase_request_seq CASCADE;
CREATE SEQUENCE public.purchase_request_seq START 1;

-- Purchase request approvals table
DROP TABLE IF EXISTS public.purchase_request_approvals CASCADE;
CREATE TABLE public.purchase_request_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory change approvals table
DROP TABLE IF EXISTS public.inventory_change_approvals CASCADE;
CREATE TABLE public.inventory_change_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_id UUID REFERENCES public.inventory_changes(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document approvals table (enhance existing)
ALTER TABLE public.document_approvals ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.document_approvals ADD COLUMN IF NOT EXISTS comments TEXT;
ALTER TABLE public.document_approvals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Approval workflows table
DROP TABLE IF EXISTS public.approval_workflows CASCADE;
CREATE TABLE public.approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name VARCHAR(255) NOT NULL,
    workflow_type VARCHAR(100) NOT NULL CHECK (workflow_type IN ('purchase_request', 'inventory_change', 'document', 'project')),
    approver_roles TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 2: CREATE APPROVAL RPC FUNCTIONS
-- =============================================

-- Submit purchase request function
CREATE OR REPLACE FUNCTION submit_purchase_request(
    p_title VARCHAR(255),
    p_description TEXT,
    p_total_amount DECIMAL(15,2),
    p_priority VARCHAR(20),
    p_required_date DATE,
    p_requested_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_id UUID;
    request_number VARCHAR(50);
BEGIN
    -- Generate request number
    request_number := 'PR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('purchase_request_seq')::text, 4, '0');
    
    -- Create purchase request
    INSERT INTO public.purchase_requests (
        request_number, title, description, status, priority, 
        total_amount, requested_by, required_date
    ) VALUES (
        request_number, p_title, p_description, 'pending', p_priority,
        p_total_amount, p_requested_by, p_required_date
    ) RETURNING id INTO request_id;
    
    -- Create approval workflow entry
    INSERT INTO public.purchase_request_approvals (request_id, approver_id, status)
    SELECT request_id, u.id, 'pending'
    FROM public.users u
    WHERE u.role IN ('manager', 'admin')
    AND u.is_authorized = true;
    
    -- Create notification
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT u.id, 'New Purchase Request', 
           'A new purchase request "' || p_title || '" requires your approval.',
           'info'
    FROM public.users u
    WHERE u.role IN ('manager', 'admin')
    AND u.is_authorized = true;
    
    RETURN request_id;
END;
$$;

-- Approve purchase request function
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
    request_exists BOOLEAN;
    all_approved BOOLEAN;
BEGIN
    -- Check if request exists
    SELECT EXISTS(SELECT 1 FROM public.purchase_requests WHERE id = p_request_id) INTO request_exists;
    
    IF NOT request_exists THEN
        RAISE EXCEPTION 'Purchase request not found';
    END IF;
    
    -- Update approval status
    UPDATE public.purchase_request_approvals 
    SET status = 'approved', 
        comments = p_comments,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE request_id = p_request_id 
    AND approver_id = p_approver_id;
    
    -- Check if all approvals are complete
    SELECT NOT EXISTS(
        SELECT 1 FROM public.purchase_request_approvals 
        WHERE request_id = p_request_id AND status = 'pending'
    ) INTO all_approved;
    
    -- Update request status if all approved
    IF all_approved THEN
        UPDATE public.purchase_requests 
        SET status = 'approved', updated_at = NOW()
        WHERE id = p_request_id;
        
        -- Notify procurement team
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT u.id, 'Purchase Request Approved', 
               'Purchase request has been approved and is ready for processing.',
               'success'
        FROM public.users u
        WHERE u.role = 'procurement'
        AND u.is_authorized = true;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Reject purchase request function
CREATE OR REPLACE FUNCTION reject_purchase_request(
    p_request_id UUID,
    p_approver_id UUID,
    p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update approval status
    UPDATE public.purchase_request_approvals 
    SET status = 'rejected', 
        comments = p_reason,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE request_id = p_request_id 
    AND approver_id = p_approver_id;
    
    -- Update request status
    UPDATE public.purchase_requests 
    SET status = 'rejected', updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Notify requester
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT pr.requested_by, 'Purchase Request Rejected', 
           'Your purchase request has been rejected. Reason: ' || p_reason,
           'error'
    FROM public.purchase_requests pr
    WHERE pr.id = p_request_id;
    
    RETURN TRUE;
END;
$$;

-- Get pending approvals function
CREATE OR REPLACE FUNCTION get_pending_approvals(
    p_user_id UUID,
    p_user_role VARCHAR(50)
)
RETURNS TABLE(
    approval_id UUID,
    request_id UUID,
    request_title VARCHAR(255),
    request_description TEXT,
    total_amount DECIMAL(15,2),
    requested_by_name VARCHAR(255),
    requested_date DATE,
    required_date DATE,
    priority VARCHAR(20),
    approval_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Return pending approvals based on user role
    IF p_user_role IN ('manager', 'admin') THEN
        RETURN QUERY
        SELECT 
            pra.id as approval_id,
            pr.id as request_id,
            pr.title as request_title,
            pr.description as request_description,
            pr.total_amount,
            u.full_name as requested_by_name,
            pr.requested_date,
            pr.required_date,
            pr.priority,
            pra.status as approval_status,
            pra.created_at
        FROM public.purchase_request_approvals pra
        JOIN public.purchase_requests pr ON pra.request_id = pr.id
        JOIN public.users u ON pr.requested_by = u.id
        WHERE pra.approver_id = p_user_id
        AND pra.status = 'pending'
        ORDER BY pra.created_at DESC;
    ELSE
        -- Return empty result for non-manager roles
        RETURN;
    END IF;
END;
$$;

-- Get user requests function
CREATE OR REPLACE FUNCTION get_user_requests(p_user_id UUID)
RETURNS TABLE(
    request_id UUID,
    request_number VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    priority VARCHAR(20),
    total_amount DECIMAL(15,2),
    requested_date DATE,
    required_date DATE,
    approval_count INTEGER,
    approved_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.id as request_id,
        pr.request_number,
        pr.title,
        pr.description,
        pr.status,
        pr.priority,
        pr.total_amount,
        pr.requested_date,
        pr.required_date,
        COUNT(pra.id)::INTEGER as approval_count,
        COUNT(CASE WHEN pra.status = 'approved' THEN 1 END)::INTEGER as approved_count,
        pr.created_at
    FROM public.purchase_requests pr
    LEFT JOIN public.purchase_request_approvals pra ON pr.id = pra.request_id
    WHERE pr.requested_by = p_user_id
    GROUP BY pr.id, pr.request_number, pr.title, pr.description, pr.status, 
             pr.priority, pr.total_amount, pr.requested_date, pr.required_date, pr.created_at
    ORDER BY pr.created_at DESC;
END;
$$;

-- =============================================
-- STEP 3: CREATE REAL-TIME TRIGGERS
-- =============================================

-- Function to notify on purchase request changes
CREATE OR REPLACE FUNCTION notify_purchase_request_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Notify all managers when status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT u.id, 'Purchase Request Status Changed', 
               'Purchase request "' || NEW.title || '" status changed to ' || NEW.status,
               CASE 
                   WHEN NEW.status = 'approved' THEN 'success'
                   WHEN NEW.status = 'rejected' THEN 'error'
                   ELSE 'info'
               END
        FROM public.users u
        WHERE u.role IN ('manager', 'admin', 'procurement')
        AND u.is_authorized = true;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for purchase request changes
DROP TRIGGER IF EXISTS purchase_request_change_trigger ON public.purchase_requests;
CREATE TRIGGER purchase_request_change_trigger
    AFTER UPDATE ON public.purchase_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_purchase_request_change();

-- =============================================
-- STEP 4: INSERT SAMPLE APPROVAL WORKFLOWS
-- =============================================

-- Insert default approval workflows (using existing admin user or NULL)
INSERT INTO public.approval_workflows (workflow_name, workflow_type, approver_roles, created_by) VALUES
('Purchase Request Approval', 'purchase_request', ARRAY['manager', 'admin'], (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)),
('Inventory Change Approval', 'inventory_change', ARRAY['manager', 'admin'], (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)),
('Document Approval', 'document', ARRAY['manager', 'admin'], (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)),
('Project Approval', 'project', ARRAY['admin'], (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1));

-- =============================================
-- STEP 5: GRANT PERMISSIONS
-- =============================================

-- Grant permissions on new tables
GRANT ALL ON public.purchase_request_approvals TO anon, authenticated, service_role;
GRANT ALL ON public.inventory_change_approvals TO anon, authenticated, service_role;
GRANT ALL ON public.approval_workflows TO anon, authenticated, service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION submit_purchase_request(VARCHAR, TEXT, DECIMAL, VARCHAR, DATE, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION approve_purchase_request(UUID, UUID, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION reject_purchase_request(UUID, UUID, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_pending_approvals(UUID, VARCHAR) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_requests(UUID) TO anon, authenticated, service_role;

-- =============================================
-- STEP 6: INSERT SAMPLE DATA
-- =============================================

-- Insert sample purchase request (only if it doesn't exist)
INSERT INTO public.purchase_requests (
    request_number, title, description, status, priority, 
    total_amount, requested_by, requested_date, required_date
) VALUES (
    'PR-20241010-0001', 'Office Supplies Request', 'Need office supplies for Q4', 'pending', 'medium',
    500.00, (SELECT id FROM public.users WHERE role = 'employee' LIMIT 1), CURRENT_DATE, '2024-10-15'
) ON CONFLICT (request_number) DO NOTHING;

-- Get the request ID for approval
DO $$
DECLARE
    sample_request_id UUID;
BEGIN
    SELECT id INTO sample_request_id FROM public.purchase_requests WHERE request_number = 'PR-20241010-0001';
    
    -- Create approval entries for managers (only if they don't exist)
    INSERT INTO public.purchase_request_approvals (request_id, approver_id, status)
    SELECT sample_request_id, u.id, 'pending'
    FROM public.users u
    WHERE u.role IN ('manager', 'admin')
    AND u.is_authorized = true
    AND NOT EXISTS (
        SELECT 1 FROM public.purchase_request_approvals pra 
        WHERE pra.request_id = sample_request_id 
        AND pra.approver_id = u.id
    );
END $$;

-- =============================================
-- STEP 7: TEST THE SYSTEM
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'APPROVAL SYSTEM CREATED SUCCESSFULLY!';
    RAISE NOTICE 'All tables and functions are ready for use';
    RAISE NOTICE 'Sample data has been inserted';
    RAISE NOTICE 'Real-time triggers are enabled';
END $$;

-- Show final status
SELECT 'purchase_request_approvals' as table_name, COUNT(*) as record_count FROM public.purchase_request_approvals
UNION ALL
SELECT 'inventory_change_approvals', COUNT(*) FROM public.inventory_change_approvals
UNION ALL
SELECT 'approval_workflows', COUNT(*) FROM public.approval_workflows
UNION ALL
SELECT 'purchase_requests', COUNT(*) FROM public.purchase_requests
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications;

-- Final completion message
DO $$
BEGIN
    RAISE NOTICE 'APPROVAL SYSTEM COMPLETE!';
    RAISE NOTICE 'All approval workflow tables created';
    RAISE NOTICE 'All RPC functions created';
    RAISE NOTICE 'Real-time triggers enabled';
    RAISE NOTICE 'Sample data inserted';
    RAISE NOTICE 'Ready for frontend integration!';
END $$;
