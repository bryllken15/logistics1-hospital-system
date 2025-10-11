-- =====================================================
-- COMPLETE DATABASE SETUP - Hospital Logistics System
-- Single comprehensive script that sets up everything
-- =====================================================

-- =====================================================
-- SECTION 1: EXTENSIONS AND TYPES
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user role enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'admin', 
            'manager', 
            'employee', 
            'procurement', 
            'project_manager', 
            'maintenance', 
            'document_analyst'
        );
    END IF;
END $$;

-- Create request status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM (
            'pending', 
            'approved', 
            'rejected', 
            'in_progress', 
            'completed'
        );
    END IF;
END $$;

-- =====================================================
-- SECTION 2: USERS TABLE AND AUTHENTICATION
-- =====================================================

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    is_authorized BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create authenticate_user function
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

CREATE OR REPLACE FUNCTION authenticate_user(
    user_username TEXT,
    user_password TEXT
)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    email TEXT,
    full_name TEXT,
    role TEXT,
    is_authorized BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username,
        u.email,
        u.full_name,
        u.role::TEXT,
        u.is_authorized
    FROM public.users u
    WHERE u.username = user_username 
    AND u.password_hash = crypt(user_password, u.password_hash)
    AND u.is_authorized = true;
END;
$$;

-- Insert all test users
INSERT INTO public.users (username, password_hash, full_name, email, role, is_authorized)
VALUES 
    ('admin', crypt('admin123', gen_salt('bf')), 'System Administrator', 'admin@hospital.com', 'admin', true),
    ('manager', crypt('manager123', gen_salt('bf')), 'Department Manager', 'manager@hospital.com', 'manager', true),
    ('employee', crypt('employee123', gen_salt('bf')), 'Hospital Employee', 'employee@hospital.com', 'employee', true),
    ('procurement', crypt('procurement123', gen_salt('bf')), 'Procurement Officer', 'procurement@hospital.com', 'procurement', true),
    ('project_manager', crypt('pm123', gen_salt('bf')), 'Project Manager', 'project_manager@hospital.com', 'project_manager', true),
    ('maintenance', crypt('maintenance123', gen_salt('bf')), 'Maintenance Technician', 'maintenance@hospital.com', 'maintenance', true),
    ('document_analyst', crypt('analyst123', gen_salt('bf')), 'Document Analyst', 'document_analyst@hospital.com', 'document_analyst', true)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    is_authorized = EXCLUDED.is_authorized,
    updated_at = NOW();

-- =====================================================
-- SECTION 3: CORE TABLES
-- =====================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase requests table (enhanced schema)
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    item_name TEXT, -- Keep for backward compatibility
    quantity INTEGER, -- Keep for backward compatibility
    total_amount DECIMAL(15,2) NOT NULL,
    estimated_cost DECIMAL(10,2), -- Keep for backward compatibility
    status request_status NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    requested_date DATE DEFAULT CURRENT_DATE,
    required_date DATE NOT NULL,
    requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    request_id UUID REFERENCES public.purchase_requests(id) ON DELETE SET NULL,
    supplier_id UUID,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'delivered', 'cancelled')),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    current_stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    unit_price DECIMAL(10,2),
    supplier TEXT,
    location TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_name TEXT NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    project_manager UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT,
    document_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'archived')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    asset_name TEXT NOT NULL,
    asset_type TEXT,
    serial_number TEXT UNIQUE,
    location TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired', 'disposed')),
    purchase_date DATE,
    warranty_expiry DATE,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance logs table
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50),
    description TEXT,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    maintenance_date DATE DEFAULT CURRENT_DATE,
    next_maintenance DATE,
    cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery receipts table
CREATE TABLE IF NOT EXISTS public.delivery_receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    delivery_date DATE DEFAULT CURRENT_DATE,
    received_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECTION 4: APPROVAL SYSTEM TABLES
-- =====================================================

-- Approval workflows table
CREATE TABLE IF NOT EXISTS public.approval_workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_name TEXT NOT NULL,
    workflow_type VARCHAR(50) NOT NULL,
    approver_roles TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase request approvals table
CREATE TABLE IF NOT EXISTS public.purchase_request_approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(request_id, approver_id)
);

-- Inventory change approvals table
CREATE TABLE IF NOT EXISTS public.inventory_change_approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    change_id UUID,
    approver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECTION 5: APPROVAL SYSTEM FUNCTIONS
-- =====================================================

-- Function to create approval entries for managers
CREATE OR REPLACE FUNCTION create_approval_entries()
RETURNS TRIGGER AS $$
BEGIN
    -- Create approval entries for all managers and admins
    INSERT INTO public.purchase_request_approvals (request_id, approver_id, status)
    SELECT NEW.id, u.id, 'pending'
    FROM public.users u
    WHERE u.role IN ('manager', 'admin')
    AND u.is_authorized = true;
    
    -- Send notifications to managers
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT u.id, 'New Purchase Request', 
           'Purchase request "' || NEW.title || '" requires your approval',
           'info'
    FROM public.users u
    WHERE u.role IN ('manager', 'admin')
    AND u.is_authorized = true;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to submit purchase request
DROP FUNCTION IF EXISTS submit_purchase_request(TEXT, TEXT, DECIMAL, TEXT, DATE, UUID);

CREATE OR REPLACE FUNCTION submit_purchase_request(
    p_title TEXT,
    p_description TEXT,
    p_total_amount DECIMAL,
    p_priority TEXT,
    p_required_date DATE,
    p_requested_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_request_id UUID;
    request_number TEXT;
BEGIN
    -- Generate request number
    request_number := 'PR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('request_sequence')::TEXT, 4, '0');
    
    -- Create sequence if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'request_sequence') THEN
        CREATE SEQUENCE request_sequence START 1;
    END IF;
    
    -- Insert purchase request
    INSERT INTO public.purchase_requests (
        request_number, title, description, total_amount, priority, 
        required_date, requested_by, status
    ) VALUES (
        request_number, p_title, p_description, p_total_amount, p_priority,
        p_required_date, p_requested_by, 'pending'
    ) RETURNING id INTO new_request_id;
    
    RETURN new_request_id;
END;
$$;

-- Function to approve purchase request
DROP FUNCTION IF EXISTS approve_purchase_request(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION approve_purchase_request(
    p_request_id UUID,
    p_approver_id UUID,
    p_comments TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update approval status
    UPDATE public.purchase_request_approvals 
    SET status = 'approved', 
        comments = p_comments,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE request_id = p_request_id 
    AND approver_id = p_approver_id;
    
    -- Check if all approvals are complete
    IF NOT EXISTS (
        SELECT 1 FROM public.purchase_request_approvals 
        WHERE request_id = p_request_id 
        AND status = 'pending'
    ) THEN
        -- Update request status to approved
        UPDATE public.purchase_requests 
        SET status = 'approved', 
            approved_by = p_approver_id,
            updated_at = NOW()
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

-- Function to reject purchase request
DROP FUNCTION IF EXISTS reject_purchase_request(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS reject_purchase_request(UUID, UUID, TEXT, TEXT);

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
    -- Update approval status
    UPDATE public.purchase_request_approvals 
    SET status = 'rejected', 
        comments = p_comments,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE request_id = p_request_id 
    AND approver_id = p_approver_id;
    
    -- Update request status to rejected
    UPDATE public.purchase_requests 
    SET status = 'rejected', 
        approved_by = p_approver_id,
        updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Notify requester
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT requested_by, 'Purchase Request Rejected', 
           'Your purchase request has been rejected.',
           'error'
    FROM public.purchase_requests
    WHERE id = p_request_id;
    
    RETURN TRUE;
END;
$$;

-- Function to get pending approvals
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
END;
$$;

-- =====================================================
-- SECTION 6: RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_change_approvals ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can read all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

-- Notifications policies
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Users can read own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Purchase requests policies
DROP POLICY IF EXISTS "Employees can create requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Managers can view all requests" ON public.purchase_requests;

CREATE POLICY "Employees can create requests" ON public.purchase_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('employee', 'admin')
        )
    );

CREATE POLICY "Users can view own requests" ON public.purchase_requests
    FOR SELECT USING (requested_by = auth.uid());

CREATE POLICY "Managers can view all requests" ON public.purchase_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('manager', 'admin')
        )
    );

-- Purchase request approvals policies
DROP POLICY IF EXISTS "Managers can view assigned approvals" ON public.purchase_request_approvals;
DROP POLICY IF EXISTS "Managers can update approvals" ON public.purchase_request_approvals;

CREATE POLICY "Managers can view assigned approvals" ON public.purchase_request_approvals
    FOR SELECT USING (
        approver_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('manager', 'admin')
        )
    );

CREATE POLICY "Managers can update approvals" ON public.purchase_request_approvals
    FOR UPDATE USING (approver_id = auth.uid());

-- Projects policies
DROP POLICY IF EXISTS "Project managers can manage projects" ON public.projects;

CREATE POLICY "Project managers can manage projects" ON public.projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('project_manager', 'admin')
        )
    );

-- Documents policies
DROP POLICY IF EXISTS "Document analysts can manage documents" ON public.documents;

CREATE POLICY "Document analysts can manage documents" ON public.documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('document_analyst', 'admin')
        )
    );

-- Assets and maintenance policies
DROP POLICY IF EXISTS "Maintenance can manage assets" ON public.assets;
DROP POLICY IF EXISTS "Maintenance can manage logs" ON public.maintenance_logs;

CREATE POLICY "Maintenance can manage assets" ON public.assets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('maintenance', 'admin')
        )
    );

CREATE POLICY "Maintenance can manage logs" ON public.maintenance_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('maintenance', 'admin')
        )
    );

-- Inventory policies
DROP POLICY IF EXISTS "Procurement can manage inventory" ON public.inventory;

CREATE POLICY "Procurement can manage inventory" ON public.inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('procurement', 'admin')
        )
    );

-- =====================================================
-- SECTION 7: TRIGGERS
-- =====================================================

-- Create trigger to auto-create approval entries
DROP TRIGGER IF EXISTS auto_create_approvals ON public.purchase_requests;
CREATE TRIGGER auto_create_approvals
    AFTER INSERT ON public.purchase_requests
    FOR EACH ROW
    EXECUTE FUNCTION create_approval_entries();

-- =====================================================
-- SECTION 8: SAMPLE DATA
-- =====================================================

-- Insert sample approval workflows
INSERT INTO public.approval_workflows (workflow_name, workflow_type, approver_roles, created_by) VALUES
    ('Purchase Request Approval', 'purchase_request', ARRAY['manager', 'admin'], (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)),
    ('Inventory Change Approval', 'inventory_change', ARRAY['manager', 'admin'], (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)),
    ('Document Approval', 'document', ARRAY['manager', 'admin'], (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)),
    ('Project Approval', 'project', ARRAY['admin'], (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type) VALUES
    ((SELECT id FROM public.users WHERE username = 'manager'), 'Welcome to Hospital Logistics System', 'Your account has been set up successfully', 'info'),
    ((SELECT id FROM public.users WHERE username = 'employee'), 'System Update', 'New features have been added to the system', 'info'),
    ((SELECT id FROM public.users WHERE username = 'procurement'), 'Inventory Alert', 'Some items are running low on stock', 'warning')
ON CONFLICT DO NOTHING;

-- Insert sample purchase requests
INSERT INTO public.purchase_requests (
    request_number, title, description, total_amount, priority, 
    required_date, requested_by, status
) VALUES 
    ('PR-20241201-0001', 'Medical Supplies Request', 'Need medical supplies for emergency ward', 15000.00, 'high', '2024-12-15', (SELECT id FROM public.users WHERE username = 'employee'), 'pending'),
    ('PR-20241201-0002', 'Equipment Parts Order', 'Replacement parts for MRI machine', 25000.00, 'medium', '2024-12-20', (SELECT id FROM public.users WHERE username = 'employee'), 'pending'),
    ('PR-20241201-0003', 'Safety Equipment Purchase', 'Safety equipment for all departments', 8000.00, 'medium', '2024-12-25', (SELECT id FROM public.users WHERE username = 'employee'), 'pending')
ON CONFLICT (request_number) DO NOTHING;

-- Insert sample inventory
INSERT INTO public.inventory (item_name, category, current_stock, min_stock_level, unit_price, supplier) VALUES
    ('Surgical Masks', 'Medical Supplies', 500, 100, 2.50, 'MedSupply Co.'),
    ('Hand Sanitizer', 'Medical Supplies', 200, 50, 5.00, 'CleanCare Ltd.'),
    ('Bandages', 'Medical Supplies', 1000, 200, 1.25, 'FirstAid Inc.')
ON CONFLICT DO NOTHING;

-- Insert sample projects
INSERT INTO public.projects (project_name, description, status, start_date, end_date, budget, project_manager) VALUES
    ('Hospital Renovation', 'Renovation of patient wards', 'active', '2024-01-01', '2024-12-31', 500000.00, (SELECT id FROM public.users WHERE username = 'project_manager')),
    ('Equipment Upgrade', 'Upgrading medical equipment', 'planning', '2024-02-01', '2024-06-30', 200000.00, (SELECT id FROM public.users WHERE username = 'project_manager'))
ON CONFLICT DO NOTHING;

-- Insert sample suppliers
INSERT INTO public.suppliers (supplier_name, contact_person, email, phone, address) VALUES
    ('MedSupply Co.', 'John Smith', 'john@medsupply.com', '+1-555-0101', '123 Medical St, City'),
    ('CleanCare Ltd.', 'Jane Doe', 'jane@cleancare.com', '+1-555-0102', '456 Clean Ave, City'),
    ('FirstAid Inc.', 'Bob Johnson', 'bob@firstaid.com', '+1-555-0103', '789 Health Blvd, City')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SECTION 9: REAL-TIME SUBSCRIPTIONS
-- =====================================================

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_request_approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_logs;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 COMPLETE DATABASE SETUP FINISHED!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All tables created successfully';
    RAISE NOTICE '✅ All 7 users created with authentication';
    RAISE NOTICE '✅ Approval system configured';
    RAISE NOTICE '✅ RLS policies enabled';
    RAISE NOTICE '✅ Real-time subscriptions enabled';
    RAISE NOTICE '✅ Sample data inserted';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now login with:';
    RAISE NOTICE '  Username: admin, Password: admin123';
    RAISE NOTICE '  Username: manager, Password: manager123';
    RAISE NOTICE '  Username: employee, Password: employee123';
    RAISE NOTICE '  Username: procurement, Password: procurement123';
    RAISE NOTICE '  Username: project_manager, Password: pm123';
    RAISE NOTICE '  Username: maintenance, Password: maintenance123';
    RAISE NOTICE '  Username: document_analyst, Password: analyst123';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your Hospital Logistics System is ready!';
END $$;
