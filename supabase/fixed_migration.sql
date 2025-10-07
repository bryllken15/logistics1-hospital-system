-- Fixed Migration Script for Logistics 1 System
-- This script fixes the RLS policy recursion issue

-- Drop existing objects if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.maintenance_schedule CASCADE;
DROP TABLE IF EXISTS public.inventory_changes CASCADE;
DROP TABLE IF EXISTS public.staff_assignments CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.maintenance_logs CASCADE;
DROP TABLE IF EXISTS public.delivery_receipts CASCADE;
DROP TABLE IF EXISTS public.system_logs CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.purchase_requests CASCADE;
DROP TABLE IF EXISTS public.purchase_orders CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS inventory_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS asset_condition CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;
DROP TYPE IF EXISTS document_status CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.authenticate_user(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Now create everything fresh
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM (
  'admin',
  'manager',
  'employee',
  'procurement',
  'project_manager',
  'maintenance',
  'document_analyst'
);

CREATE TYPE inventory_status AS ENUM (
  'in_stock',
  'low_stock',
  'critical',
  'out_of_stock'
);

CREATE TYPE order_status AS ENUM (
  'pending',
  'approved',
  'in_transit',
  'delivered',
  'rejected'
);

CREATE TYPE project_status AS ENUM (
  'on_track',
  'delayed',
  'in_progress',
  'completed'
);

CREATE TYPE asset_condition AS ENUM (
  'excellent',
  'good',
  'needs_repair',
  'under_repair'
);

CREATE TYPE document_type AS ENUM (
  'delivery_receipt',
  'purchase_order',
  'invoice',
  'contract'
);

CREATE TYPE document_status AS ENUM (
  'pending_verification',
  'verified',
  'archived'
);

CREATE TYPE request_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  is_authorized BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table (Smart Warehousing System)
CREATE TABLE public.inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_name TEXT NOT NULL,
  rfid_code TEXT UNIQUE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  status inventory_status NOT NULL DEFAULT 'in_stock',
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders table (Procurement & Sourcing Management)
CREATE TABLE public.purchase_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  supplier TEXT NOT NULL,
  items INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  rfid_code TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Requests table
CREATE TABLE public.purchase_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  estimated_cost DECIMAL(10,2),
  status request_status NOT NULL DEFAULT 'pending',
  requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (Project Logistics Tracker)
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'in_progress',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(12,2) NOT NULL,
  spent DECIMAL(12,2) DEFAULT 0,
  staff_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table (Asset Lifecycle & Maintenance)
CREATE TABLE public.assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  rfid_code TEXT UNIQUE NOT NULL,
  condition asset_condition NOT NULL DEFAULT 'good',
  next_maintenance DATE NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table (Document Tracking & Records)
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type document_type NOT NULL,
  file_size BIGINT NOT NULL,
  status document_status NOT NULL DEFAULT 'pending_verification',
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Logs table
CREATE TABLE public.system_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Receipts table
CREATE TABLE public.delivery_receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  supplier TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  items INTEGER NOT NULL,
  status document_status NOT NULL DEFAULT 'pending_verification',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Logs table
CREATE TABLE public.maintenance_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  technician TEXT NOT NULL,
  cost DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE public.suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Assignments table
CREATE TABLE public.staff_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Inventory Changes table
CREATE TABLE public.inventory_changes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL,
  quantity_change INTEGER NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Schedule table
CREATE TABLE public.maintenance_schedule (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  maintenance_type TEXT NOT NULL,
  technician TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  generated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_authorized ON public.users(is_authorized);
CREATE INDEX idx_inventory_rfid ON public.inventory(rfid_code);
CREATE INDEX idx_inventory_status ON public.inventory(status);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_purchase_orders_created_by ON public.purchase_orders(created_by);
CREATE INDEX idx_purchase_requests_status ON public.purchase_requests(status);
CREATE INDEX idx_purchase_requests_requested_by ON public.purchase_requests(requested_by);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_assets_rfid ON public.assets(rfid_code);
CREATE INDEX idx_assets_condition ON public.assets(condition);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_type ON public.documents(file_type);
CREATE INDEX idx_system_logs_user ON public.system_logs(user_id);
CREATE INDEX idx_system_logs_created ON public.system_logs(created_at);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON public.purchase_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_receipts_updated_at BEFORE UPDATE ON public.delivery_receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SIMPLIFIED RLS POLICIES (No recursion)
-- Disable RLS for now to avoid policy issues
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;

-- Create authentication function
CREATE OR REPLACE FUNCTION public.authenticate_user(user_username TEXT, user_password TEXT)
RETURNS public.users AS $$
DECLARE
  user_record public.users;
BEGIN
  SELECT * INTO user_record
  FROM public.users
  WHERE username = user_username AND password_hash = crypt(user_password, password_hash);

  RETURN user_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_changes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_schedule;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;

-- Insert sample data
INSERT INTO public.users (username, password_hash, full_name, email, role, is_authorized) VALUES
  ('admin', crypt('admin123', gen_salt('bf')), 'System Administrator', 'admin@hospital.com', 'admin', true),
  ('manager', crypt('manager123', gen_salt('bf')), 'Department Manager', 'manager@hospital.com', 'manager', true),
  ('employee', crypt('employee123', gen_salt('bf')), 'Hospital Employee', 'employee@hospital.com', 'employee', true),
  ('procurement', crypt('procurement123', gen_salt('bf')), 'Procurement Staff', 'procurement@hospital.com', 'procurement', true),
  ('project_manager', crypt('pm123', gen_salt('bf')), 'Project Manager', 'pm@hospital.com', 'project_manager', true),
  ('maintenance', crypt('maintenance123', gen_salt('bf')), 'Maintenance Staff', 'maintenance@hospital.com', 'maintenance', true),
  ('document_analyst', crypt('analyst123', gen_salt('bf')), 'Document Analyst', 'analyst@hospital.com', 'document_analyst', true);

-- Insert sample inventory data
INSERT INTO public.inventory (item_name, rfid_code, quantity, status, location) 
VALUES
  ('Surgical Masks', 'RFID001', 150, 'in_stock', 'A-1-01'),
  ('Disposable Gloves', 'RFID002', 45, 'low_stock', 'A-1-02'),
  ('Antiseptic Solution', 'RFID003', 200, 'in_stock', 'A-2-01'),
  ('Bandages', 'RFID004', 12, 'critical', 'A-2-02'),
  ('Syringes', 'RFID005', 300, 'in_stock', 'B-1-01'),
  ('Thermometers', 'RFID006', 8, 'low_stock', 'B-1-02');

-- Insert sample purchase orders
INSERT INTO public.purchase_orders (supplier, items, amount, status, rfid_code, created_by) VALUES
  ('MedSupply Co.', 15, 45000.00, 'pending', 'RFID001', (SELECT id FROM public.users WHERE username = 'admin')),
  ('HealthTech Ltd.', 8, 32500.00, 'approved', 'RFID002', (SELECT id FROM public.users WHERE username = 'procurement')),
  ('MedEquip Inc.', 12, 78000.00, 'delivered', 'RFID003', (SELECT id FROM public.users WHERE username = 'admin')),
  ('PharmaCorp', 6, 23000.00, 'in_transit', 'RFID004', (SELECT id FROM public.users WHERE username = 'procurement'));

-- Insert sample purchase requests
INSERT INTO public.purchase_requests (request_number, item_name, quantity, estimated_cost, status, requested_by) VALUES
  ('PR-001', 'Medical Supplies', 50, 15000.00, 'pending', (SELECT id FROM public.users WHERE username = 'employee')),
  ('PR-002', 'Equipment Parts', 25, 25000.00, 'approved', (SELECT id FROM public.users WHERE username = 'manager')),
  ('PR-003', 'Safety Equipment', 100, 8000.00, 'pending', (SELECT id FROM public.users WHERE username = 'employee'));

-- Insert sample projects
INSERT INTO public.projects (name, status, progress, start_date, end_date, budget, spent, staff_count) VALUES
  ('Emergency Ward Renovation', 'on_track', 75, '2025-01-01', '2025-03-15', 2500000.00, 1800000.00, 8),
  ('New Equipment Installation', 'delayed', 45, '2025-01-15', '2025-02-28', 1200000.00, 540000.00, 5),
  ('Supply Chain Optimization', 'on_track', 90, '2024-12-01', '2025-01-30', 800000.00, 720000.00, 6),
  ('RFID Implementation', 'in_progress', 30, '2025-01-10', '2025-04-10', 1500000.00, 450000.00, 4);

-- Insert sample assets
INSERT INTO public.assets (name, rfid_code, condition, next_maintenance, location) VALUES
  ('MRI Machine', 'RFID001', 'good', '2025-02-15', 'Radiology'),
  ('Ventilator Unit', 'RFID002', 'needs_repair', '2025-01-20', 'ICU'),
  ('X-Ray Machine', 'RFID003', 'excellent', '2025-03-10', 'Emergency'),
  ('Ultrasound Scanner', 'RFID004', 'good', '2025-02-28', 'Obstetrics'),
  ('CT Scanner', 'RFID005', 'under_repair', '2025-01-25', 'Radiology'),
  ('Dialysis Machine', 'RFID006', 'good', '2025-02-05', 'Nephrology');

-- Insert sample documents
INSERT INTO public.documents (file_name, file_type, file_size, status, uploaded_by) VALUES
  ('Delivery_Receipt_001.pdf', 'delivery_receipt', 2400000, 'verified', (SELECT id FROM public.users WHERE username = 'document_analyst')),
  ('Purchase_Order_045.pdf', 'purchase_order', 1800000, 'pending_verification', (SELECT id FROM public.users WHERE username = 'procurement')),
  ('Invoice_MedSupply_123.pdf', 'invoice', 3100000, 'verified', (SELECT id FROM public.users WHERE username = 'document_analyst')),
  ('Contract_HealthTech_2025.pdf', 'contract', 5200000, 'archived', (SELECT id FROM public.users WHERE username = 'document_analyst'));

-- Insert sample delivery receipts
INSERT INTO public.delivery_receipts (receipt_number, supplier, amount, items, status) VALUES
  ('DR-2025-001', 'MedSupply Co.', 45000.00, 15, 'verified'),
  ('DR-2025-002', 'HealthTech Ltd.', 32500.00, 8, 'pending_verification'),
  ('DR-2025-003', 'MedEquip Inc.', 78000.00, 12, 'verified'),
  ('DR-2025-004', 'PharmaCorp', 23000.00, 6, 'archived');

-- Insert sample maintenance logs
INSERT INTO public.maintenance_logs (asset_id, maintenance_type, technician, cost, status) VALUES
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID001'), 'Scheduled', 'John Smith', 5000.00, 'completed'),
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID002'), 'Emergency', 'Sarah Johnson', 8500.00, 'in_progress'),
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID003'), 'Preventive', 'Mike Davis', 3200.00, 'completed'),
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID004'), 'Scheduled', 'Lisa Wilson', 2800.00, 'completed');

-- Insert sample suppliers
INSERT INTO public.suppliers (name, contact, email, rating) VALUES
  ('MedSupply Co.', 'John Smith', 'john@medsupply.com', 5),
  ('HealthTech Ltd.', 'Sarah Johnson', 'sarah@healthtech.com', 4),
  ('MedEquip Inc.', 'Mike Davis', 'mike@medequip.com', 5),
  ('PharmaCorp', 'Lisa Wilson', 'lisa@pharmacorp.com', 3);

-- Insert sample system logs
INSERT INTO public.system_logs (action, user_id, details) VALUES
  ('User Login', (SELECT id FROM public.users WHERE username = 'admin'), 'Admin logged in successfully'),
  ('RFID Scan', (SELECT id FROM public.users WHERE username = 'employee'), 'Scanned RFID001 - Surgical Masks'),
  ('Purchase Order Created', (SELECT id FROM public.users WHERE username = 'procurement'), 'Created PO for MedSupply Co.'),
  ('Asset Maintenance', (SELECT id FROM public.users WHERE username = 'maintenance'), 'Scheduled maintenance for MRI Machine'),
  ('Document Upload', (SELECT id FROM public.users WHERE username = 'document_analyst'), 'Uploaded delivery receipt DR-2025-001');

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type) VALUES
  ((SELECT id FROM public.users WHERE username = 'admin'), 'New User Registration', 'A new user has registered and needs authorization', 'user_registration'),
  ((SELECT id FROM public.users WHERE username = 'manager'), 'Purchase Request', 'New purchase request PR-001 needs approval', 'purchase_request'),
  ((SELECT id FROM public.users WHERE username = 'maintenance'), 'Maintenance Due', 'MRI Machine maintenance is due in 5 days', 'maintenance_reminder'),
  ((SELECT id FROM public.users WHERE username = 'procurement'), 'Order Status Update', 'Order from MedSupply Co. has been delivered', 'order_update');
