-- MASTER DATABASE RESET - Complete Rebuild
-- This script will completely rebuild the database with all functionality

-- =============================================
-- STEP 1: DISABLE ALL RLS POLICIES
-- =============================================

-- Disable RLS on ALL tables
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.maintenance_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.maintenance_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.purchase_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.delivery_receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.spare_parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.maintenance_work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.document_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.document_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.asset_maintenance_schedules DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- =============================================
-- STEP 2: CREATE CORE TABLES
-- =============================================

-- Users table
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee', 'procurement', 'project_manager', 'maintenance', 'document_analyst')),
    department VARCHAR(100),
    is_authorized BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
DROP TABLE IF EXISTS public.projects CASCADE;
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    project_manager_id UUID REFERENCES public.users(id),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
DROP TABLE IF EXISTS public.documents CASCADE;
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'archived')),
    version VARCHAR(20) DEFAULT '1.0',
    uploaded_by UUID REFERENCES public.users(id),
    approved_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    expiration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
DROP TABLE IF EXISTS public.assets CASCADE;
CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    rfid_code VARCHAR(100) UNIQUE,
    serial_number VARCHAR(100),
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'retired')),
    location VARCHAR(255),
    assigned_to UUID REFERENCES public.users(id),
    purchase_date DATE,
    warranty_expiry DATE,
    last_service_date DATE,
    service_interval_days INTEGER DEFAULT 30,
    operating_hours DECIMAL(10,2) DEFAULT 0,
    criticality VARCHAR(20) DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
    cost DECIMAL(15,2),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance logs table
DROP TABLE IF EXISTS public.maintenance_logs CASCADE;
CREATE TABLE public.maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES public.users(id),
    cost DECIMAL(10,2) DEFAULT 0,
    downtime_hours DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance schedule table
DROP TABLE IF EXISTS public.maintenance_schedule CASCADE;
CREATE TABLE public.maintenance_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL,
    frequency_days INTEGER NOT NULL,
    last_maintenance_date DATE,
    next_maintenance_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System logs table
DROP TABLE IF EXISTS public.system_logs CASCADE;
CREATE TABLE public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
DROP TABLE IF EXISTS public.inventory CASCADE;
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2),
    total_value DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    location VARCHAR(255),
    supplier_id UUID,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase requests table
DROP TABLE IF EXISTS public.purchase_requests CASCADE;
CREATE TABLE public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered', 'received')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    requested_by UUID REFERENCES public.users(id),
    approved_by UUID REFERENCES public.users(id),
    total_amount DECIMAL(15,2),
    requested_date DATE DEFAULT CURRENT_DATE,
    required_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase orders table
DROP TABLE IF EXISTS public.purchase_orders CASCADE;
CREATE TABLE public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'received', 'cancelled')),
    total_amount DECIMAL(15,2),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
DROP TABLE IF EXISTS public.suppliers CASCADE;
CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery receipts table
DROP TABLE IF EXISTS public.delivery_receipts CASCADE;
CREATE TABLE public.delivery_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    po_id UUID REFERENCES public.purchase_orders(id),
    supplier_id UUID REFERENCES public.suppliers(id),
    delivery_date DATE DEFAULT CURRENT_DATE,
    received_by UUID REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'received' CHECK (status IN ('received', 'verified', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory changes table
DROP TABLE IF EXISTS public.inventory_changes CASCADE;
CREATE TABLE public.inventory_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES public.inventory(id),
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('in', 'out', 'adjustment', 'transfer')),
    quantity_change INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_number VARCHAR(100),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff assignments table
DROP TABLE IF EXISTS public.staff_assignments CASCADE;
CREATE TABLE public.staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    project_id UUID REFERENCES public.projects(id),
    role VARCHAR(100),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
DROP TABLE IF EXISTS public.notifications CASCADE;
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
DROP TABLE IF EXISTS public.reports CASCADE;
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(100) NOT NULL,
    parameters JSONB,
    generated_by UUID REFERENCES public.users(id),
    file_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 3: CREATE ENHANCED TABLES
-- =============================================

-- Spare parts table
DROP TABLE IF EXISTS public.spare_parts CASCADE;
CREATE TABLE public.spare_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    manufacturer VARCHAR(100),
    supplier_id UUID REFERENCES public.suppliers(id),
    unit_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance work orders table
DROP TABLE IF EXISTS public.maintenance_work_orders CASCADE;
CREATE TABLE public.maintenance_work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_number VARCHAR(50) UNIQUE NOT NULL,
    asset_id UUID REFERENCES public.assets(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES public.users(id),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document versions table
DROP TABLE IF EXISTS public.document_versions CASCADE;
CREATE TABLE public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    change_summary TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document approvals table
DROP TABLE IF EXISTS public.document_approvals CASCADE;
CREATE TABLE public.document_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset maintenance schedules table
DROP TABLE IF EXISTS public.asset_maintenance_schedules CASCADE;
CREATE TABLE public.asset_maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL,
    frequency_days INTEGER NOT NULL,
    last_maintenance_date DATE,
    next_maintenance_date DATE NOT NULL,
    assigned_technician UUID REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 4: CREATE AUTHENTICATION FUNCTION
-- =============================================

DROP FUNCTION IF EXISTS authenticate_user(text, text);

CREATE OR REPLACE FUNCTION authenticate_user(user_username text, user_password text)
RETURNS TABLE(
  user_id uuid,
  username text,
  email text,
  full_name text,
  role text,
  department text,
  is_authorized boolean,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.username::text,
    u.email::text,
    u.full_name::text,
    u.role::text,
    u.department::text,
    u.is_authorized,
    u.is_active,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.username = user_username 
    AND u.password_hash = user_password 
    AND u.is_active = true;
END;
$$;

-- =============================================
-- STEP 5: INSERT ALL USERS
-- =============================================

-- Clear existing users
DELETE FROM public.users;

-- Insert all 7 users
INSERT INTO public.users (id, username, email, full_name, password_hash, role, department, is_authorized, is_active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@logistics.com', 'System Administrator', 'admin123', 'admin', 'IT', true, true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'manager', 'manager@logistics.com', 'Operations Manager', 'manager123', 'manager', 'Operations', true, true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'employee', 'employee@logistics.com', 'General Employee', 'employee123', 'employee', 'General', true, true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'procurement', 'procurement@logistics.com', 'Procurement Specialist', 'procurement123', 'procurement', 'Procurement', true, true, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'project_manager', 'pm@logistics.com', 'Project Manager', 'pm123', 'project_manager', 'Project Management', true, true, NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'maintenance', 'maintenance@logistics.com', 'Maintenance Technician', 'maintenance123', 'maintenance', 'Maintenance', true, true, NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'document_analyst', 'analyst@logistics.com', 'Document Analyst', 'analyst123', 'manager', 'Documentation', true, true, NOW(), NOW());

-- =============================================
-- STEP 6: INSERT SAMPLE DATA
-- =============================================

-- Insert sample projects
INSERT INTO public.projects (id, name, description, status, priority, start_date, end_date, budget, project_manager_id, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Warehouse Optimization', 'Improve warehouse efficiency and inventory management', 'active', 'high', '2024-01-01', '2024-12-31', 50000.00, '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Equipment Maintenance', 'Regular maintenance of all equipment', 'active', 'medium', '2024-01-01', '2024-12-31', 25000.00, '66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111');

-- Insert sample assets
INSERT INTO public.assets (id, name, asset_type, rfid_code, serial_number, status, location, assigned_to, criticality, cost, created_by) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Forklift #001', 'Equipment', 'RFID001', 'FL001', 'active', 'Warehouse A', '66666666-6666-6666-6666-666666666666', 'high', 25000.00, '11111111-1111-1111-1111-111111111111'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Conveyor Belt #001', 'Equipment', 'RFID002', 'CB001', 'active', 'Warehouse A', '66666666-6666-6666-6666-666666666666', 'medium', 15000.00, '11111111-1111-1111-1111-111111111111');

-- Insert sample inventory
INSERT INTO public.inventory (id, item_name, description, category, sku, quantity, unit_price, min_stock_level, location, created_by) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Safety Helmet', 'Industrial safety helmet', 'Safety Equipment', 'HELMET001', 50, 25.00, 10, 'Storage Room A', '11111111-1111-1111-1111-111111111111'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Work Gloves', 'Heavy duty work gloves', 'Safety Equipment', 'GLOVES001', 100, 15.00, 20, 'Storage Room A', '11111111-1111-1111-1111-111111111111');

-- =============================================
-- STEP 7: TEST ALL FUNCTIONALITY
-- =============================================

DO $$
DECLARE
    test_result RECORD;
    success_count INTEGER := 0;
    total_tests INTEGER := 7;
    auth_result RECORD;
BEGIN
    RAISE NOTICE 'Testing authenticate_user function...';
    
    -- Test each user
    FOR test_result IN 
        SELECT username, password FROM (VALUES 
            ('admin', 'admin123'),
            ('manager', 'manager123'),
            ('employee', 'employee123'),
            ('procurement', 'procurement123'),
            ('project_manager', 'pm123'),
            ('maintenance', 'maintenance123'),
            ('document_analyst', 'analyst123')
        ) AS t(username, password)
    LOOP
        BEGIN
            -- Test the function and capture result
            SELECT * INTO auth_result FROM authenticate_user(test_result.username, test_result.password) LIMIT 1;
            
            IF auth_result.user_id IS NOT NULL THEN
                success_count := success_count + 1;
                RAISE NOTICE 'SUCCESS: % login works! (ID: %)', test_result.username, auth_result.user_id;
            ELSE
                RAISE NOTICE 'FAILED: % login returned no data', test_result.username;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'FAILED: % login failed - %', test_result.username, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'RESULT: % of % logins work!', success_count, total_tests;
    
    IF success_count = total_tests THEN
        RAISE NOTICE 'SUCCESS: All users can login!';
    ELSE
        RAISE NOTICE 'WARNING: Some users cannot login. Check the errors above.';
    END IF;
END $$;

-- =============================================
-- STEP 8: VERIFY ALL TABLES
-- =============================================

-- Show table counts
SELECT 'users' as table_name, COUNT(*) as record_count FROM public.users
UNION ALL
SELECT 'projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'documents', COUNT(*) FROM public.documents
UNION ALL
SELECT 'assets', COUNT(*) FROM public.assets
UNION ALL
SELECT 'maintenance_logs', COUNT(*) FROM public.maintenance_logs
UNION ALL
SELECT 'maintenance_schedule', COUNT(*) FROM public.maintenance_schedule
UNION ALL
SELECT 'system_logs', COUNT(*) FROM public.system_logs
UNION ALL
SELECT 'inventory', COUNT(*) FROM public.inventory
UNION ALL
SELECT 'purchase_requests', COUNT(*) FROM public.purchase_requests
UNION ALL
SELECT 'purchase_orders', COUNT(*) FROM public.purchase_orders
UNION ALL
SELECT 'suppliers', COUNT(*) FROM public.suppliers
UNION ALL
SELECT 'delivery_receipts', COUNT(*) FROM public.delivery_receipts
UNION ALL
SELECT 'inventory_changes', COUNT(*) FROM public.inventory_changes
UNION ALL
SELECT 'staff_assignments', COUNT(*) FROM public.staff_assignments
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'reports', COUNT(*) FROM public.reports
UNION ALL
SELECT 'spare_parts', COUNT(*) FROM public.spare_parts
UNION ALL
SELECT 'maintenance_work_orders', COUNT(*) FROM public.maintenance_work_orders
UNION ALL
SELECT 'document_versions', COUNT(*) FROM public.document_versions
UNION ALL
SELECT 'document_approvals', COUNT(*) FROM public.document_approvals
UNION ALL
SELECT 'asset_maintenance_schedules', COUNT(*) FROM public.asset_maintenance_schedules;

-- Show users
SELECT username, full_name, role, department, is_authorized FROM public.users ORDER BY username;

-- Final completion message
DO $$
BEGIN
    RAISE NOTICE 'DATABASE REBUILD COMPLETE!';
    RAISE NOTICE 'All tables created with RLS disabled';
    RAISE NOTICE 'All 7 users created and tested';
    RAISE NOTICE 'Sample data inserted';
    RAISE NOTICE 'Ready for frontend integration!';
END $$;
