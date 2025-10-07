-- Fixed User Setup for Hospital Supply Chain Management System
-- Username/Password authentication with predefined accounts

-- Clear existing users with our specific IDs
DELETE FROM public.users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777'
);

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS get_user_by_role(user_role);
DROP FUNCTION IF EXISTS toggle_user_status(UUID);
DROP FUNCTION IF EXISTS get_all_users_with_status();
DROP FUNCTION IF EXISTS get_user_statistics();

-- Insert predefined users with username/password authentication
-- Password for all users is "password123" (hashed with bcrypt)
INSERT INTO public.users (id, username, password_hash, full_name, role, is_authorized, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', true, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'manager1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hospital Manager', 'manager', true, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'employee1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Warehouse Employee', 'employee', true, NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'procurement1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Procurement Staff', 'procurement', true, NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'project1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Project Manager', 'project_manager', true, NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', 'maintenance1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maintenance Staff', 'maintenance', true, NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', 'document1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Document Analyst', 'document_analyst', true, NOW(), NOW());

-- Create helper functions
CREATE OR REPLACE FUNCTION get_user_by_role(user_role_name user_role)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  role user_role,
  is_authorized BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, u.full_name, u.role, u.is_authorized
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

CREATE OR REPLACE FUNCTION get_all_users_with_status()
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  role user_role,
  is_authorized BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, u.full_name, u.role, u.is_authorized, u.created_at, u.updated_at
  FROM public.users u
  ORDER BY u.role, u.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Create authentication function
CREATE OR REPLACE FUNCTION authenticate_user(user_username TEXT, user_password TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  role user_role,
  is_authorized BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, u.full_name, u.role, u.is_authorized
  FROM public.users u
  WHERE u.username = user_username 
    AND u.password_hash = crypt(user_password, u.password_hash)
    AND u.is_authorized = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_by_role(user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_user_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users_with_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO authenticated;

-- Create user dashboard view
CREATE OR REPLACE VIEW user_dashboard_data AS
SELECT 
  u.id,
  u.username,
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

-- Verify setup
DO $$
BEGIN
  RAISE NOTICE 'Fixed user setup completed successfully!';
  RAISE NOTICE 'Created % users', (SELECT COUNT(*) FROM public.users);
  RAISE NOTICE 'Users by role:';
  FOR rec IN SELECT role, COUNT(*) as count FROM public.users GROUP BY role ORDER BY role LOOP
    RAISE NOTICE '  %: % users', rec.role, rec.count;
  END LOOP;
  RAISE NOTICE '';
  RAISE NOTICE 'Login Credentials:';
  RAISE NOTICE 'Username: admin, Password: password123';
  RAISE NOTICE 'Username: manager1, Password: password123';
  RAISE NOTICE 'Username: employee1, Password: password123';
  RAISE NOTICE 'Username: procurement1, Password: password123';
  RAISE NOTICE 'Username: project1, Password: password123';
  RAISE NOTICE 'Username: maintenance1, Password: password123';
  RAISE NOTICE 'Username: document1, Password: password123';
END $$;
