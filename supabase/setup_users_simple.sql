-- Simple setup for predefined users
-- This version avoids foreign key constraint issues by using a different approach

-- First, check if users already exist and delete them if they do
DELETE FROM public.users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777'
);

-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS get_user_by_role(user_role);
DROP FUNCTION IF EXISTS toggle_user_status(UUID);

-- Insert predefined users one by one to avoid constraint issues
INSERT INTO public.users (id, email, full_name, role, is_authorized, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@hospital.com', 'System Administrator', 'admin', true, NOW(), NOW());

INSERT INTO public.users (id, email, full_name, role, is_authorized, created_at, updated_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'manager1@hospital.com', 'Hospital Manager', 'manager', true, NOW(), NOW());

INSERT INTO public.users (id, email, full_name, role, is_authorized, created_at, updated_at) VALUES
  ('33333333-3333-3333-3333-333333333333', 'employee1@hospital.com', 'Warehouse Employee', 'employee', true, NOW(), NOW());

INSERT INTO public.users (id, email, full_name, role, is_authorized, created_at, updated_at) VALUES
  ('44444444-4444-4444-4444-444444444444', 'procurement1@hospital.com', 'Procurement Staff', 'procurement', true, NOW(), NOW());

INSERT INTO public.users (id, email, full_name, role, is_authorized, created_at, updated_at) VALUES
  ('55555555-5555-5555-5555-555555555555', 'project1@hospital.com', 'Project Manager', 'project_manager', true, NOW(), NOW());

INSERT INTO public.users (id, email, full_name, role, is_authorized, created_at, updated_at) VALUES
  ('66666666-6666-6666-6666-666666666666', 'maintenance1@hospital.com', 'Maintenance Staff', 'maintenance', true, NOW(), NOW());

INSERT INTO public.users (id, email, full_name, role, is_authorized, created_at, updated_at) VALUES
  ('77777777-7777-7777-7777-777777777777', 'document1@hospital.com', 'Document Analyst', 'document_analyst', true, NOW(), NOW());

-- Create helper functions
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_by_role(user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_user_status(UUID) TO authenticated;
