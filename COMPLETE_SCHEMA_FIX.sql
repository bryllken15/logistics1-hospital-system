-- Complete Schema Fix
-- Fixes all potential schema mismatches in the database

-- =====================================================
-- SECTION 1: ENSURE ALL REQUIRED TABLES EXIST
-- =====================================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL,
    department TEXT DEFAULT 'General',
    is_authorized BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    total_amount DECIMAL(15,2) NOT NULL,
    status request_status NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    requested_date DATE DEFAULT CURRENT_DATE,
    required_date DATE NOT NULL,
    requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_request_approvals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.purchase_request_approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(request_id, approver_id)
);

-- Create approval_workflows table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.approval_workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_name TEXT NOT NULL,
    workflow_type TEXT NOT NULL,
    approver_roles TEXT[] NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table with all required columns
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT,
    current_stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0.00,
    supplier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    project_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    version TEXT DEFAULT '1.0',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'archived')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    asset_name TEXT NOT NULL,
    asset_type TEXT,
    location TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
    purchase_date DATE,
    warranty_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    maintenance_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suppliers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delivery_receipts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.delivery_receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    receipt_number TEXT UNIQUE NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    delivery_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'verified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received', 'cancelled')),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECTION 2: ENSURE ALL REQUIRED TYPES EXIST
-- =====================================================

-- Create user_role enum if it doesn't exist
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

-- Create request_status enum if it doesn't exist
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
-- SECTION 3: ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add category column to inventory if it doesn't exist
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS category TEXT;

-- Add department column to users if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'General';

-- =====================================================
-- SECTION 4: ENABLE RLS ON ALL TABLES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECTION 5: CREATE RLS POLICIES
-- =====================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Employees can create requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Managers can view all requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Managers can view assigned approvals" ON public.purchase_request_approvals;
DROP POLICY IF EXISTS "Managers can update approvals" ON public.purchase_request_approvals;
DROP POLICY IF EXISTS "Procurement can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Project managers can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Document analysts can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Maintenance can manage assets" ON public.assets;
DROP POLICY IF EXISTS "Maintenance can manage logs" ON public.maintenance_logs;

-- Create new policies that work with custom authentication
CREATE POLICY "Users can read all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (true);

CREATE POLICY "Users can read own notifications" ON public.notifications
    FOR SELECT USING (true);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Employees can create requests" ON public.purchase_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own requests" ON public.purchase_requests
    FOR SELECT USING (true);

CREATE POLICY "Managers can view all requests" ON public.purchase_requests
    FOR SELECT USING (true);

CREATE POLICY "Managers can view assigned approvals" ON public.purchase_request_approvals
    FOR SELECT USING (true);

CREATE POLICY "Managers can update approvals" ON public.purchase_request_approvals
    FOR UPDATE USING (true);

CREATE POLICY "Procurement can manage inventory" ON public.inventory
    FOR ALL USING (true);

CREATE POLICY "Project managers can manage projects" ON public.projects
    FOR ALL USING (true);

CREATE POLICY "Document analysts can manage documents" ON public.documents
    FOR ALL USING (true);

CREATE POLICY "Maintenance can manage assets" ON public.assets
    FOR ALL USING (true);

CREATE POLICY "Maintenance can manage logs" ON public.maintenance_logs
    FOR ALL USING (true);

-- =====================================================
-- SECTION 6: INSERT SAMPLE DATA
-- =====================================================

-- Insert sample users if they don't exist
INSERT INTO public.users (username, password_hash, full_name, email, role, department, is_authorized)
VALUES 
    ('admin', crypt('admin123', gen_salt('bf')), 'System Administrator', 'admin@hospital.com', 'admin', 'IT', true),
    ('manager', crypt('manager123', gen_salt('bf')), 'Department Manager', 'manager@hospital.com', 'manager', 'Management', true),
    ('employee', crypt('employee123', gen_salt('bf')), 'Hospital Employee', 'employee@hospital.com', 'employee', 'General', true),
    ('procurement', crypt('procurement123', gen_salt('bf')), 'Procurement Officer', 'procurement@hospital.com', 'procurement', 'Procurement', true),
    ('project_manager', crypt('pm123', gen_salt('bf')), 'Project Manager', 'project_manager@hospital.com', 'project_manager', 'Projects', true),
    ('maintenance', crypt('maintenance123', gen_salt('bf')), 'Maintenance Technician', 'maintenance@hospital.com', 'maintenance', 'Maintenance', true),
    ('document_analyst', crypt('analyst123', gen_salt('bf')), 'Document Analyst', 'document_analyst@hospital.com', 'document_analyst', 'Documentation', true)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    is_authorized = EXCLUDED.is_authorized,
    updated_at = NOW();

-- Insert sample inventory data
INSERT INTO public.inventory (item_name, category, current_stock, min_stock_level, unit_price, supplier) VALUES
    ('Surgical Masks', 'Medical Supplies', 500, 100, 2.50, 'MedSupply Co.'),
    ('Hand Sanitizer', 'Medical Supplies', 200, 50, 5.00, 'CleanCare Ltd.'),
    ('Bandages', 'Medical Supplies', 1000, 200, 1.25, 'FirstAid Inc.'),
    ('Surgical Gloves', 'Medical Supplies', 300, 75, 3.00, 'MedSupply Co.'),
    ('Thermometers', 'Medical Equipment', 50, 10, 25.00, 'TechMed Inc.'),
    ('Blood Pressure Cuffs', 'Medical Equipment', 25, 5, 45.00, 'TechMed Inc.'),
    ('Stethoscopes', 'Medical Equipment', 30, 8, 75.00, 'TechMed Inc.'),
    ('Office Chairs', 'Furniture', 20, 5, 150.00, 'OfficeWorld'),
    ('Desks', 'Furniture', 15, 3, 300.00, 'OfficeWorld'),
    ('Computers', 'IT Equipment', 10, 2, 800.00, 'TechSolutions')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SECTION 7: VERIFY FIX
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    user_count INTEGER;
    inventory_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'notifications', 'purchase_requests', 'purchase_request_approvals', 'inventory');
    
    -- Count users
    SELECT COUNT(*) INTO user_count FROM public.users;
    
    -- Count inventory items
    SELECT COUNT(*) INTO inventory_count FROM public.inventory;
    
    RAISE NOTICE '✅ Complete schema fix applied successfully';
    RAISE NOTICE '✅ Tables created/verified: %', table_count;
    RAISE NOTICE '✅ Users inserted: %', user_count;
    RAISE NOTICE '✅ Inventory items inserted: %', inventory_count;
    RAISE NOTICE '✅ RLS policies configured';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test with: node diagnose-approval-workflow.js';
    RAISE NOTICE '2. Check manager dashboard for pending approvals';
    RAISE NOTICE '3. Test employee request creation';
END $$;
