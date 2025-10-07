-- Seed data for LOGISTICS 1
-- Run this after the initial schema migration

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_authorized ON public.users(is_authorized);
CREATE INDEX IF NOT EXISTS idx_inventory_rfid ON public.inventory(rfid_code);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON public.purchase_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_assets_rfid ON public.assets(rfid_code);
CREATE INDEX IF NOT EXISTS idx_assets_condition ON public.assets(condition);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(file_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON public.system_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users policies
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

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
