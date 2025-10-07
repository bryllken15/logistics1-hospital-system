-- Setup predefined users for the Hospital Supply Chain Management System
-- This script creates the fixed users as specified in the requirements

-- First, let's create the auth users (this would normally be done through Supabase Auth)
-- For development, we'll create them with specific UUIDs for consistency

-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS get_user_by_role(user_role);
DROP FUNCTION IF EXISTS toggle_user_status(UUID);
DROP FUNCTION IF EXISTS get_all_users_with_status();
DROP FUNCTION IF EXISTS get_user_statistics();

-- Temporarily disable foreign key constraints to avoid circular dependency issues
SET session_replication_role = replica;

-- Insert predefined users into the users table
-- Note: In production, these would be created through Supabase Auth first

INSERT INTO public.users (id, email, full_name, role, is_authorized) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@hospital.com', 'System Administrator', 'admin', true),
  ('22222222-2222-2222-2222-222222222222', 'manager1@hospital.com', 'Hospital Manager', 'manager', true),
  ('33333333-3333-3333-3333-333333333333', 'employee1@hospital.com', 'Warehouse Employee', 'employee', true),
  ('44444444-4444-4444-4444-444444444444', 'procurement1@hospital.com', 'Procurement Staff', 'procurement', true),
  ('55555555-5555-5555-5555-555555555555', 'project1@hospital.com', 'Project Manager', 'project_manager', true),
  ('66666666-6666-6666-6666-666666666666', 'maintenance1@hospital.com', 'Maintenance Staff', 'maintenance', true),
  ('77777777-7777-7777-7777-777777777777', 'document1@hospital.com', 'Document Analyst', 'document_analyst', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_authorized = EXCLUDED.is_authorized;

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- Create a function to get user by role
CREATE OR REPLACE FUNCTION get_user_by_role(user_role_name user_role)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role user_role,
  is_authorized BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.role, u.is_authorized
  FROM public.users u
  WHERE u.role = user_role_name
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to activate/deactivate users
CREATE OR REPLACE FUNCTION toggle_user_status(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_status BOOLEAN;
BEGIN
  SELECT is_authorized INTO current_status
  FROM public.users
  WHERE id = user_id;
  
  UPDATE public.users
  SET is_authorized = NOT current_status,
      updated_at = NOW()
  WHERE id = user_id;
  
  RETURN NOT current_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get all users with their status
CREATE OR REPLACE FUNCTION get_all_users_with_status()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role user_role,
  is_authorized BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.role, u.is_authorized, u.created_at, u.updated_at
  FROM public.users u
  ORDER BY u.role, u.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user statistics by role
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS TABLE (
  role user_role,
  total_count BIGINT,
  active_count BIGINT,
  inactive_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.role,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE u.is_authorized = true) as active_count,
    COUNT(*) FILTER (WHERE u.is_authorized = false) as inactive_count
  FROM public.users u
  GROUP BY u.role
  ORDER BY u.role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_by_role(user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_user_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users_with_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_statistics() TO authenticated;

-- Create a view for user dashboard data
CREATE OR REPLACE VIEW user_dashboard_data AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_authorized,
  u.created_at,
  u.updated_at,
  CASE 
    WHEN u.role = 'admin' THEN 'Full system access'
    WHEN u.role = 'manager' THEN 'Management functions'
    WHEN u.role = 'employee' THEN 'Basic warehouse access'
    WHEN u.role = 'procurement' THEN 'Procurement management'
    WHEN u.role = 'project_manager' THEN 'Project tracking'
    WHEN u.role = 'maintenance' THEN 'Asset management'
    WHEN u.role = 'document_analyst' THEN 'Document management'
    ELSE 'Unknown access level'
  END as access_level
FROM public.users u
ORDER BY u.role, u.full_name;

-- Grant access to the view
GRANT SELECT ON user_dashboard_data TO authenticated;
