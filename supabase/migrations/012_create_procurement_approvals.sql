-- Create procurement_approvals table for multi-level approval workflow
-- This table will handle purchase request approvals requiring manager and project manager approval

CREATE TABLE IF NOT EXISTS procurement_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_request_id UUID REFERENCES purchase_requests(id),
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  supplier TEXT,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by UUID REFERENCES users(id) NOT NULL,
  request_reason TEXT,
  request_type TEXT DEFAULT 'purchase_request',
  
  -- Manager approval fields
  manager_approved BOOLEAN DEFAULT FALSE,
  manager_approved_by UUID REFERENCES users(id),
  manager_approved_at TIMESTAMP,
  manager_notes TEXT,
  
  -- Project Manager approval fields
  project_manager_approved BOOLEAN DEFAULT FALSE,
  project_manager_approved_by UUID REFERENCES users(id),
  project_manager_approved_at TIMESTAMP,
  project_manager_notes TEXT,
  
  -- Admin approval fields (for high-value items)
  admin_approved BOOLEAN DEFAULT FALSE,
  admin_approved_by UUID REFERENCES users(id),
  admin_approved_at TIMESTAMP,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_procurement_approvals_status ON procurement_approvals(status);
CREATE INDEX IF NOT EXISTS idx_procurement_approvals_requested_by ON procurement_approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_procurement_approvals_created_at ON procurement_approvals(created_at);
CREATE INDEX IF NOT EXISTS idx_procurement_approvals_manager_approved ON procurement_approvals(manager_approved);
CREATE INDEX IF NOT EXISTS idx_procurement_approvals_project_manager_approved ON procurement_approvals(project_manager_approved);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_procurement_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_procurement_approvals_updated_at
  BEFORE UPDATE ON procurement_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_procurement_approvals_updated_at();

-- Enable RLS
ALTER TABLE procurement_approvals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to read their own requests
CREATE POLICY "Users can read their own procurement approval requests" ON procurement_approvals
  FOR SELECT USING (auth.uid() = requested_by);

-- Allow managers to read all requests
CREATE POLICY "Managers can read all procurement approval requests" ON procurement_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('manager', 'project_manager', 'admin')
    )
  );

-- Allow users to insert their own requests
CREATE POLICY "Users can create procurement approval requests" ON procurement_approvals
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

-- Allow managers to update approval status
CREATE POLICY "Managers can update procurement approval status" ON procurement_approvals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('manager', 'project_manager', 'admin')
    )
  );

-- Grant permissions to all roles
GRANT ALL ON procurement_approvals TO authenticated;
GRANT ALL ON procurement_approvals TO service_role;

-- Add comments for documentation
COMMENT ON TABLE procurement_approvals IS 'Multi-level approval workflow for procurement purchase requests';
COMMENT ON COLUMN procurement_approvals.status IS 'Current status: pending, approved, rejected';
COMMENT ON COLUMN procurement_approvals.manager_approved IS 'Whether manager has approved the request';
COMMENT ON COLUMN procurement_approvals.project_manager_approved IS 'Whether project manager has approved the request';
COMMENT ON COLUMN procurement_approvals.total_value IS 'Automatically calculated as quantity * unit_price';
