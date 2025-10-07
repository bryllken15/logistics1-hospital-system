-- LOGISTICS 1 Database Schema
-- Hospital Supply Chain & Procurement Management System

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
  'delivered'
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

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
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

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_authorized ON public.users(is_authorized);
CREATE INDEX idx_inventory_rfid ON public.inventory(rfid_code);
CREATE INDEX idx_inventory_status ON public.inventory(status);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_purchase_orders_created_by ON public.purchase_orders(created_by);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_assets_rfid ON public.assets(rfid_code);
CREATE INDEX idx_assets_condition ON public.assets(condition);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_type ON public.documents(file_type);
CREATE INDEX idx_system_logs_user ON public.system_logs(user_id);
CREATE INDEX idx_system_logs_created ON public.system_logs(created_at);

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
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_receipts_updated_at BEFORE UPDATE ON public.delivery_receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all user data
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Inventory policies
CREATE POLICY "All authenticated users can read inventory" ON public.inventory
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authorized users can modify inventory" ON public.inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_authorized = true
    )
  );

-- Purchase orders policies
CREATE POLICY "Users can read purchase orders" ON public.purchase_orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Procurement users can manage purchase orders" ON public.purchase_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND (role = 'procurement' OR role = 'admin')
    )
  );

-- Projects policies
CREATE POLICY "Users can read projects" ON public.projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Project managers can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND (role = 'project_manager' OR role = 'admin')
    )
  );

-- Assets policies
CREATE POLICY "Users can read assets" ON public.assets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Maintenance users can manage assets" ON public.assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND (role = 'maintenance' OR role = 'admin')
    )
  );

-- Documents policies
CREATE POLICY "Users can read documents" ON public.documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Document analysts can manage documents" ON public.documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND (role = 'document_analyst' OR role = 'admin')
    )
  );

-- System logs policies
CREATE POLICY "Users can read system logs" ON public.system_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert logs" ON public.system_logs
  FOR INSERT WITH CHECK (true);

-- Delivery receipts policies
CREATE POLICY "Users can read delivery receipts" ON public.delivery_receipts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authorized users can manage delivery receipts" ON public.delivery_receipts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_authorized = true
    )
  );

-- Maintenance logs policies
CREATE POLICY "Users can read maintenance logs" ON public.maintenance_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Maintenance users can manage maintenance logs" ON public.maintenance_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND (role = 'maintenance' OR role = 'admin')
    )
  );

-- Insert sample data
INSERT INTO public.users (id, email, full_name, role, is_authorized) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@logistics1.com', 'System Administrator', 'admin', true),
  ('00000000-0000-0000-0000-000000000002', 'manager@logistics1.com', 'Operations Manager', 'manager', true),
  ('00000000-0000-0000-0000-000000000003', 'employee@logistics1.com', 'Warehouse Employee', 'employee', true),
  ('00000000-0000-0000-0000-000000000004', 'procurement@logistics1.com', 'Procurement Specialist', 'procurement', true),
  ('00000000-0000-0000-0000-000000000005', 'project@logistics1.com', 'Project Manager', 'project_manager', true),
  ('00000000-0000-0000-0000-000000000006', 'maintenance@logistics1.com', 'Maintenance Technician', 'maintenance', true),
  ('00000000-0000-0000-0000-000000000007', 'document@logistics1.com', 'Document Analyst', 'document_analyst', true);

-- Insert sample inventory data
INSERT INTO public.inventory (item_name, rfid_code, quantity, status, location) VALUES
  ('Surgical Masks', 'RFID001', 150, 'in_stock', 'A-1-01'),
  ('Disposable Gloves', 'RFID002', 45, 'low_stock', 'A-1-02'),
  ('Antiseptic Solution', 'RFID003', 200, 'in_stock', 'A-2-01'),
  ('Bandages', 'RFID004', 12, 'critical', 'A-2-02'),
  ('Syringes', 'RFID005', 300, 'in_stock', 'B-1-01'),
  ('Thermometers', 'RFID006', 8, 'low_stock', 'B-1-02');

-- Insert sample purchase orders
INSERT INTO public.purchase_orders (supplier, items, amount, status, rfid_code, created_by) VALUES
  ('MedSupply Co.', 15, 45000.00, 'pending', 'RFID001', '00000000-0000-0000-0000-000000000004'),
  ('HealthTech Ltd.', 8, 32500.00, 'approved', 'RFID002', '00000000-0000-0000-0000-000000000004'),
  ('MedEquip Inc.', 12, 78000.00, 'delivered', 'RFID003', '00000000-0000-0000-0000-000000000004'),
  ('PharmaCorp', 6, 23000.00, 'in_transit', 'RFID004', '00000000-0000-0000-0000-000000000004');

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
  ('Delivery_Receipt_001.pdf', 'delivery_receipt', 2400000, 'verified', '00000000-0000-0000-0000-000000000003'),
  ('Purchase_Order_045.pdf', 'purchase_order', 1800000, 'pending_verification', '00000000-0000-0000-0000-000000000004'),
  ('Invoice_MedSupply_123.pdf', 'invoice', 3100000, 'verified', '00000000-0000-0000-0000-000000000004'),
  ('Contract_HealthTech_2025.pdf', 'contract', 5200000, 'archived', '00000000-0000-0000-0000-000000000001');

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

-- Insert sample system logs
INSERT INTO public.system_logs (action, user_id, details) VALUES
  ('User Login', '00000000-0000-0000-0000-000000000001', 'Admin logged in successfully'),
  ('RFID Scan', '00000000-0000-0000-0000-000000000003', 'Scanned RFID001 - Surgical Masks'),
  ('Purchase Order Created', '00000000-0000-0000-0000-000000000004', 'Created PO for MedSupply Co.'),
  ('Asset Maintenance', '00000000-0000-0000-0000-000000000006', 'Scheduled maintenance for MRI Machine'),
  ('Document Upload', '00000000-0000-0000-0000-000000000007', 'Uploaded delivery receipt DR-2025-001');
