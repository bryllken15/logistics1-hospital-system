-- Project Deliveries and Enhanced Project Management
-- Migration: 016_project_deliveries.sql

-- Create project_deliveries table for dedicated project delivery tracking
CREATE TABLE project_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  quantity_delivered INTEGER NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  delivery_date DATE NOT NULL,
  destination VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  tracking_number VARCHAR(100),
  received_by UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create staff_performance table for advanced staff analytics
CREATE TABLE staff_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  tasks_completed INTEGER DEFAULT 0,
  tasks_pending INTEGER DEFAULT 0,
  efficiency_score DECIMAL(5,2),
  last_activity_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhance projects table with missing fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_manager_id UUID REFERENCES users(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX idx_project_deliveries_project_id ON project_deliveries(project_id);
CREATE INDEX idx_project_deliveries_status ON project_deliveries(status);
CREATE INDEX idx_project_deliveries_delivery_date ON project_deliveries(delivery_date);
CREATE INDEX idx_project_deliveries_created_by ON project_deliveries(created_by);

CREATE INDEX idx_staff_performance_user_id ON staff_performance(user_id);
CREATE INDEX idx_staff_performance_project_id ON staff_performance(project_id);
CREATE INDEX idx_staff_performance_efficiency ON staff_performance(efficiency_score);

-- Enable RLS
ALTER TABLE project_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_deliveries
CREATE POLICY "Users can view project deliveries" ON project_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('project_manager', 'admin', 'manager')
    )
  );

CREATE POLICY "Project managers can manage deliveries" ON project_deliveries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('project_manager', 'admin')
    )
  );

-- RLS Policies for staff_performance
CREATE POLICY "Users can view staff performance" ON staff_performance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('project_manager', 'admin', 'manager')
    )
  );

CREATE POLICY "Project managers can manage staff performance" ON staff_performance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('project_manager', 'admin')
    )
  );

-- Grant permissions
GRANT ALL ON project_deliveries TO authenticated;
GRANT ALL ON project_deliveries TO anon;
GRANT ALL ON staff_performance TO authenticated;
GRANT ALL ON staff_performance TO anon;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_deliveries_updated_at 
  BEFORE UPDATE ON project_deliveries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_performance_updated_at 
  BEFORE UPDATE ON staff_performance 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE project_deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE staff_performance;

-- Verify tables created
SELECT 'project_deliveries' as table_name, COUNT(*) as exists 
FROM information_schema.tables 
WHERE table_name = 'project_deliveries'
UNION ALL
SELECT 'staff_performance', COUNT(*) 
FROM information_schema.tables 
WHERE table_name = 'staff_performance';
