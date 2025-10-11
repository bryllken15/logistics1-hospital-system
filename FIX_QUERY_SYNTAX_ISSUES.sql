-- =====================================================
-- FIX QUERY SYNTAX ISSUES
-- Addresses 400 Bad Request errors from malformed queries
-- =====================================================

-- =====================================================
-- 1. FIX FOREIGN KEY RELATIONSHIPS
-- =====================================================

-- Ensure all foreign key columns exist with proper types
ALTER TABLE purchase_requests 
ADD COLUMN IF NOT EXISTS requested_by UUID,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_manager_id UUID,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_by UUID,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 2. CREATE PROPER FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key constraints to fix join syntax
ALTER TABLE purchase_requests 
ADD CONSTRAINT IF NOT EXISTS fk_purchase_requests_requested_by 
FOREIGN KEY (requested_by) REFERENCES users(id);

ALTER TABLE purchase_requests 
ADD CONSTRAINT IF NOT EXISTS fk_purchase_requests_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id);

ALTER TABLE projects 
ADD CONSTRAINT IF NOT EXISTS fk_projects_project_manager_id 
FOREIGN KEY (project_manager_id) REFERENCES users(id);

ALTER TABLE projects 
ADD CONSTRAINT IF NOT EXISTS fk_projects_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE inventory 
ADD CONSTRAINT IF NOT EXISTS fk_inventory_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE inventory 
ADD CONSTRAINT IF NOT EXISTS fk_inventory_updated_by 
FOREIGN KEY (updated_by) REFERENCES users(id);

-- =====================================================
-- 3. CREATE MISSING TABLES FOR COMPLEX JOINS
-- =====================================================

-- Create purchase_request_approvals table for complex approval queries
CREATE TABLE IF NOT EXISTS purchase_request_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  approver_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_purchase_request_approvals_request_id 
  FOREIGN KEY (request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
  
  CONSTRAINT fk_purchase_request_approvals_approver_id 
  FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- =====================================================
-- 4. CREATE VIEWS FOR COMPLEX QUERIES
-- =====================================================

-- Create view for purchase requests with user details
CREATE OR REPLACE VIEW purchase_requests_with_users AS
SELECT 
  pr.*,
  requester.full_name as requested_by_name,
  requester.email as requested_by_email,
  approver.full_name as approved_by_name,
  approver.email as approved_by_email
FROM purchase_requests pr
LEFT JOIN users requester ON pr.requested_by = requester.id
LEFT JOIN users approver ON pr.approved_by = approver.id;

-- Create view for projects with manager details
CREATE OR REPLACE VIEW projects_with_managers AS
SELECT 
  p.*,
  pm.full_name as project_manager_name,
  pm.email as project_manager_email,
  creator.full_name as created_by_name,
  creator.email as created_by_email
FROM projects p
LEFT JOIN users pm ON p.project_manager_id = pm.id
LEFT JOIN users creator ON p.created_by = creator.id;

-- Create view for inventory with user details
CREATE OR REPLACE VIEW inventory_with_users AS
SELECT 
  i.*,
  creator.full_name as created_by_name,
  creator.email as created_by_email,
  updater.full_name as updated_by_name,
  updater.email as updated_by_email
FROM inventory i
LEFT JOIN users creator ON i.created_by = creator.id
LEFT JOIN users updater ON i.updated_by = updater.id;

-- =====================================================
-- 5. CREATE FUNCTIONS FOR COMPLEX QUERIES
-- =====================================================

-- Function to get purchase requests with all related data
CREATE OR REPLACE FUNCTION get_purchase_requests_with_details()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  total_amount DECIMAL,
  status VARCHAR(20),
  priority VARCHAR(20),
  requested_date TIMESTAMP WITH TIME ZONE,
  required_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  requested_by_name TEXT,
  requested_by_email TEXT,
  approved_by_name TEXT,
  approved_by_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.title,
    pr.description,
    pr.total_amount,
    pr.status,
    pr.priority,
    pr.requested_date,
    pr.required_date,
    pr.created_at,
    requester.full_name as requested_by_name,
    requester.email as requested_by_email,
    approver.full_name as approved_by_name,
    approver.email as approved_by_email
  FROM purchase_requests pr
  LEFT JOIN users requester ON pr.requested_by = requester.id
  LEFT JOIN users approver ON pr.approved_by = approver.id
  ORDER BY pr.created_at DESC;
END;
$$;

-- Function to get projects with all related data
CREATE OR REPLACE FUNCTION get_projects_with_details()
RETURNS TABLE (
  id UUID,
  name TEXT,
  status VARCHAR(20),
  progress INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  budget DECIMAL,
  spent DECIMAL,
  staff_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  project_manager_name TEXT,
  project_manager_email TEXT,
  created_by_name TEXT,
  created_by_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.status,
    p.progress,
    p.start_date,
    p.end_date,
    p.budget,
    p.spent,
    p.staff_count,
    p.created_at,
    pm.full_name as project_manager_name,
    pm.email as project_manager_email,
    creator.full_name as created_by_name,
    creator.email as created_by_email
  FROM projects p
  LEFT JOIN users pm ON p.project_manager_id = pm.id
  LEFT JOIN users creator ON p.created_by = creator.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to get inventory with all related data
CREATE OR REPLACE FUNCTION get_inventory_with_details()
RETURNS TABLE (
  id UUID,
  item_name TEXT,
  rfid_code TEXT,
  quantity INTEGER,
  status VARCHAR(20),
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by_name TEXT,
  created_by_email TEXT,
  updated_by_name TEXT,
  updated_by_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.item_name,
    i.rfid_code,
    i.quantity,
    i.status,
    i.location,
    i.created_at,
    i.updated_at,
    creator.full_name as created_by_name,
    creator.email as created_by_email,
    updater.full_name as updated_by_name,
    updater.email as updated_by_email
  FROM inventory i
  LEFT JOIN users creator ON i.created_by = creator.id
  LEFT JOIN users updater ON i.updated_by = updater.id
  ORDER BY i.created_at DESC;
END;
$$;

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for foreign key columns to improve join performance
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requested_by ON purchase_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_approved_by ON purchase_requests(approved_by);
CREATE INDEX IF NOT EXISTS idx_projects_project_manager_id ON projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_inventory_created_by ON inventory(created_by);
CREATE INDEX IF NOT EXISTS idx_inventory_updated_by ON inventory(updated_by);
CREATE INDEX IF NOT EXISTS idx_purchase_request_approvals_request_id ON purchase_request_approvals(request_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_approvals_approver_id ON purchase_request_approvals(approver_id);

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for views and functions
GRANT SELECT ON purchase_requests_with_users TO authenticated, anon;
GRANT SELECT ON projects_with_managers TO authenticated, anon;
GRANT SELECT ON inventory_with_users TO authenticated, anon;

GRANT EXECUTE ON FUNCTION get_purchase_requests_with_details() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_projects_with_details() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_inventory_with_details() TO authenticated, anon;

-- =====================================================
-- 8. VERIFICATION
-- =====================================================

-- Verify all foreign key relationships exist
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('purchase_requests', 'projects', 'inventory', 'purchase_request_approvals');

-- Verify views exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'VIEW'
AND table_name IN ('purchase_requests_with_users', 'projects_with_managers', 'inventory_with_users');

-- Verify functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_purchase_requests_with_details', 'get_projects_with_details', 'get_inventory_with_details');

-- Final success message
DO $$
BEGIN
  RAISE NOTICE 'QUERY SYNTAX FIXES COMPLETED SUCCESSFULLY!';
  RAISE NOTICE 'All foreign key relationships, views, and functions have been created.';
  RAISE NOTICE 'Complex join queries should now work properly.';
END $$;
