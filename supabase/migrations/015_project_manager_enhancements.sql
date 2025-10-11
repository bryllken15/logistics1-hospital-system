-- Project Manager Dashboard Enhancement Tables
-- Migration: 015_project_manager_enhancements.sql

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS project_manager_reports CASCADE;

-- Project Manager Reports Table
CREATE TABLE project_manager_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL,
  report_data JSONB NOT NULL,
  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMP DEFAULT NOW(),
  report_period_start DATE,
  report_period_end DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Check and enhance delivery_receipts table if needed
DO $$
BEGIN
  -- Add missing columns to delivery_receipts if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_receipts' AND column_name = 'project_id') THEN
    ALTER TABLE delivery_receipts ADD COLUMN project_id UUID REFERENCES projects(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_receipts' AND column_name = 'supplier_name') THEN
    ALTER TABLE delivery_receipts ADD COLUMN supplier_name VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_receipts' AND column_name = 'status') THEN
    ALTER TABLE delivery_receipts ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_receipts' AND column_name = 'notes') THEN
    ALTER TABLE delivery_receipts ADD COLUMN notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_receipts' AND column_name = 'created_by') THEN
    ALTER TABLE delivery_receipts ADD COLUMN created_by UUID REFERENCES users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_receipts' AND column_name = 'updated_at') THEN
    ALTER TABLE delivery_receipts ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
  END IF;
END $$;

-- Check and enhance staff_assignments table if needed
DO $$
BEGIN
  -- Add missing columns to staff_assignments if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_assignments' AND column_name = 'role') THEN
    ALTER TABLE staff_assignments ADD COLUMN role VARCHAR(100) DEFAULT 'team_member';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_assignments' AND column_name = 'assigned_date') THEN
    ALTER TABLE staff_assignments ADD COLUMN assigned_date TIMESTAMP DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_assignments' AND column_name = 'assigned_by') THEN
    ALTER TABLE staff_assignments ADD COLUMN assigned_by UUID REFERENCES users(id);
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_manager_reports_generated_by ON project_manager_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_project_manager_reports_type ON project_manager_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_delivery_receipts_project_id ON delivery_receipts(project_id);
CREATE INDEX IF NOT EXISTS idx_delivery_receipts_status ON delivery_receipts(status);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_project_id ON staff_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_user_id ON staff_assignments(user_id);

-- Enable RLS
ALTER TABLE project_manager_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Project managers can view their own reports" ON project_manager_reports;

-- Project Manager Reports RLS
CREATE POLICY "Project managers can view their own reports" ON project_manager_reports
  FOR ALL USING (generated_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('project_manager', 'admin')));

-- Grant permissions
GRANT ALL ON project_manager_reports TO authenticated;
GRANT ALL ON project_manager_reports TO anon;

-- Verify tables exist
SELECT 'project_manager_reports' as table_name, COUNT(*) as exists 
FROM information_schema.tables 
WHERE table_name = 'project_manager_reports'
UNION ALL
SELECT 'delivery_receipts', COUNT(*) 
FROM information_schema.tables 
WHERE table_name = 'delivery_receipts'
UNION ALL
SELECT 'staff_assignments', COUNT(*) 
FROM information_schema.tables 
WHERE table_name = 'staff_assignments';
