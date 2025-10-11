-- =====================================================
-- APPROVAL WORKFLOW MIGRATION SCRIPT
-- Creates all necessary tables for multi-level approval workflows
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PROCUREMENT APPROVALS TABLE
-- =====================================================

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

-- =====================================================
-- INVENTORY APPROVALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'manager_approved', 'project_manager_approved', 'admin_approved', 'rejected', 'completed')),
    
    -- Request details
    requested_by UUID NOT NULL REFERENCES users(id),
    request_reason TEXT,
    request_type VARCHAR(50) DEFAULT 'new_item' CHECK (request_type IN ('new_item', 'quantity_change', 'status_change', 'item_removal')),
    
    -- Manager approval
    manager_approved BOOLEAN DEFAULT FALSE,
    manager_approved_by UUID REFERENCES users(id),
    manager_approved_at TIMESTAMP WITH TIME ZONE,
    manager_notes TEXT,
    
    -- Project Manager approval
    project_manager_approved BOOLEAN DEFAULT FALSE,
    project_manager_approved_by UUID REFERENCES users(id),
    project_manager_approved_at TIMESTAMP WITH TIME ZONE,
    project_manager_notes TEXT,
    
    -- Admin approval (final approval)
    admin_approved BOOLEAN DEFAULT FALSE,
    admin_approved_by UUID REFERENCES users(id),
    admin_approved_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'approval_request', 'approval_approved', 'approval_rejected')),
    is_read BOOLEAN DEFAULT FALSE,
    related_request_id UUID,
    related_request_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Procurement approvals indexes
CREATE INDEX IF NOT EXISTS idx_procurement_approvals_status ON procurement_approvals(status);
CREATE INDEX IF NOT EXISTS idx_procurement_approvals_requested_by ON procurement_approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_procurement_approvals_created_at ON procurement_approvals(created_at);
CREATE INDEX IF NOT EXISTS idx_procurement_approvals_manager_approved ON procurement_approvals(manager_approved);
CREATE INDEX IF NOT EXISTS idx_procurement_approvals_project_manager_approved ON procurement_approvals(project_manager_approved);

-- Inventory approvals indexes
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_status ON inventory_approvals(status);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_requested_by ON inventory_approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_created_at ON inventory_approvals(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_manager_approved ON inventory_approvals(manager_approved);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_project_manager_approved ON inventory_approvals(project_manager_approved);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Procurement approvals trigger
CREATE OR REPLACE FUNCTION update_procurement_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_procurement_approvals_updated_at ON procurement_approvals;
CREATE TRIGGER trigger_update_procurement_approvals_updated_at
  BEFORE UPDATE ON procurement_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_procurement_approvals_updated_at();

-- Inventory approvals trigger
CREATE OR REPLACE FUNCTION update_inventory_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_approvals_updated_at ON inventory_approvals;
CREATE TRIGGER trigger_update_inventory_approvals_updated_at
  BEFORE UPDATE ON inventory_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_approvals_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Create security definer function to check user role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_user_role(user_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = user_id;
  
  RETURN user_role = ANY(allowed_roles);
END;
$$;

-- Disable RLS on approval tables since we use custom authentication
-- Application-level security is enforced through the custom auth system
ALTER TABLE procurement_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- RLS is disabled for approval tables due to custom authentication
-- Application-level security is enforced through the custom auth system
-- No RLS policies needed since tables are not protected by RLS

-- RLS policies are not needed since RLS is disabled on these tables
-- Security is enforced at the application level through custom authentication

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON procurement_approvals TO authenticated;
GRANT ALL ON procurement_approvals TO service_role;
GRANT ALL ON inventory_approvals TO authenticated;
GRANT ALL ON inventory_approvals TO service_role;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE procurement_approvals IS 'Multi-level approval workflow for procurement purchase requests';
COMMENT ON TABLE inventory_approvals IS 'Multi-level approval workflow for inventory item requests';
COMMENT ON TABLE notifications IS 'Real-time notifications for approval workflows';

COMMENT ON COLUMN procurement_approvals.status IS 'Current status: pending, approved, rejected';
COMMENT ON COLUMN procurement_approvals.manager_approved IS 'Whether manager has approved the request';
COMMENT ON COLUMN procurement_approvals.project_manager_approved IS 'Whether project manager has approved the request';
COMMENT ON COLUMN procurement_approvals.total_value IS 'Automatically calculated as quantity * unit_price';

COMMENT ON COLUMN inventory_approvals.status IS 'Current status: pending, manager_approved, project_manager_approved, admin_approved, rejected, completed';
COMMENT ON COLUMN inventory_approvals.manager_approved IS 'Whether manager has approved the request';
COMMENT ON COLUMN inventory_approvals.project_manager_approved IS 'Whether project manager has approved the request';
COMMENT ON COLUMN inventory_approvals.total_value IS 'Automatically calculated as quantity * unit_price';
