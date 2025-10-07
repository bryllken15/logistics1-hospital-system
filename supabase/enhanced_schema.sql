-- Enhanced Database Schema for Hospital Supply Chain Management System
-- This file contains additional tables and fixes for the existing schema

-- Add missing tables and enhance existing ones

-- Suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Requests table (for employee requests that need manager approval)
CREATE TABLE IF NOT EXISTS public.purchase_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Assignments table (for project manager to assign staff to projects)
CREATE TABLE IF NOT EXISTS public.staff_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Inventory Changes table (for tracking all inventory modifications)
CREATE TABLE IF NOT EXISTS public.inventory_changes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('add', 'remove', 'update', 'transfer')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Schedule table
CREATE TABLE IF NOT EXISTS public.maintenance_schedule (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  technician TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Files table (for actual file storage references)
CREATE TABLE IF NOT EXISTS public.document_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table (for real-time notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table (for generated reports)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  generated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  file_path TEXT,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON public.purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requested_by ON public.purchase_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_project ON public.staff_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_user ON public.staff_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_changes_inventory ON public.inventory_changes(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_changes_status ON public.inventory_changes(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_asset ON public.maintenance_schedule(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_date ON public.maintenance_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(report_type);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON public.purchase_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_schedule_updated_at BEFORE UPDATE ON public.maintenance_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Users can read suppliers" ON public.suppliers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Procurement users can manage suppliers" ON public.suppliers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'procurement' OR role = 'admin')
  )
);

CREATE POLICY "Users can read purchase requests" ON public.purchase_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create purchase requests" ON public.purchase_requests FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_authorized = true
  )
);
CREATE POLICY "Managers can approve purchase requests" ON public.purchase_requests FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'manager' OR role = 'admin')
  )
);

CREATE POLICY "Users can read staff assignments" ON public.staff_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Project managers can manage staff assignments" ON public.staff_assignments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'project_manager' OR role = 'admin')
  )
);

CREATE POLICY "Users can read inventory changes" ON public.inventory_changes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authorized users can create inventory changes" ON public.inventory_changes FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_authorized = true
  )
);
CREATE POLICY "Managers can approve inventory changes" ON public.inventory_changes FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'manager' OR role = 'admin')
  )
);

CREATE POLICY "Users can read maintenance schedule" ON public.maintenance_schedule FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Maintenance users can manage schedule" ON public.maintenance_schedule FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'maintenance' OR role = 'admin')
  )
);

CREATE POLICY "Users can read document files" ON public.document_files FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Document analysts can manage files" ON public.document_files FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'document_analyst' OR role = 'admin')
  )
);

CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read reports" ON public.reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authorized users can create reports" ON public.reports FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_authorized = true
  )
);

-- Insert sample suppliers
INSERT INTO public.suppliers (name, contact_person, email, phone, address) VALUES
  ('MedSupply Co.', 'John Smith', 'john@medsupply.com', '+1-555-0101', '123 Medical St, City'),
  ('HealthTech Ltd.', 'Sarah Johnson', 'sarah@healthtech.com', '+1-555-0102', '456 Health Ave, City'),
  ('MedEquip Inc.', 'Mike Davis', 'mike@medequip.com', '+1-555-0103', '789 Equipment Blvd, City'),
  ('PharmaCorp', 'Lisa Wilson', 'lisa@pharmacorp.com', '+1-555-0104', '321 Pharma St, City');

-- Insert sample purchase requests
INSERT INTO public.purchase_requests (request_number, item_name, quantity, unit_price, total_amount, reason, status) VALUES
  ('PR-2025-001', 'Surgical Masks', 100, 2.50, 250.00, 'Low stock in emergency ward', 'pending'),
  ('PR-2025-002', 'Disposable Gloves', 50, 1.20, 60.00, 'Regular restocking', 'approved'),
  ('PR-2025-003', 'Antiseptic Solution', 25, 15.00, 375.00, 'ICU requirements', 'pending');

-- Insert sample staff assignments
INSERT INTO public.staff_assignments (project_id, user_id, role, assigned_by) VALUES
  ((SELECT id FROM public.projects WHERE name = 'Emergency Ward Renovation' LIMIT 1), 
   (SELECT id FROM public.users WHERE role = 'employee' LIMIT 1), 'Site Worker', 
   (SELECT id FROM public.users WHERE role = 'project_manager' LIMIT 1)),
  ((SELECT id FROM public.projects WHERE name = 'New Equipment Installation' LIMIT 1), 
   (SELECT id FROM public.users WHERE role = 'maintenance' LIMIT 1), 'Technical Lead', 
   (SELECT id FROM public.users WHERE role = 'project_manager' LIMIT 1));

-- Insert sample maintenance schedule
INSERT INTO public.maintenance_schedule (asset_id, maintenance_type, scheduled_date, technician, status, created_by) VALUES
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID001'), 'Preventive', '2025-02-15', 'John Smith', 'scheduled', 
   (SELECT id FROM public.users WHERE role = 'maintenance' LIMIT 1)),
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID002'), 'Emergency', '2025-01-20', 'Sarah Johnson', 'scheduled', 
   (SELECT id FROM public.users WHERE role = 'maintenance' LIMIT 1));

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type) VALUES
  ((SELECT id FROM public.users WHERE role = 'admin' LIMIT 1), 'New Purchase Request', 'Employee requested 100 surgical masks', 'purchase_request'),
  ((SELECT id FROM public.users WHERE role = 'manager' LIMIT 1), 'Inventory Alert', 'Bandages are critically low', 'inventory_alert'),
  ((SELECT id FROM public.users WHERE role = 'project_manager' LIMIT 1), 'Project Update', 'Emergency Ward Renovation is 75% complete', 'project_update');
