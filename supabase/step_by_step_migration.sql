-- Step-by-Step Migration for Username/Password Authentication
-- This script handles the migration in safe steps to avoid foreign key issues

-- Step 1: Check if we need to migrate
DO $$
BEGIN
  -- Check if username column exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'username') THEN
    
    RAISE NOTICE 'Starting migration to username/password authentication...';
    
    -- Step 2: Add new columns
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
    
    -- Step 3: Remove old email column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'email') THEN
      ALTER TABLE public.users DROP COLUMN email;
      RAISE NOTICE 'Removed email column';
    END IF;
    
    -- Step 4: Clear existing users to avoid conflicts
    DELETE FROM public.users;
    RAISE NOTICE 'Cleared existing users';
    
    -- Step 5: Insert users one by one to avoid constraint issues
    INSERT INTO public.users (id, username, password_hash, full_name, role, is_authorized, created_at, updated_at) 
    VALUES ('11111111-1111-1111-1111-111111111111', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', true, NOW(), NOW());
    
    INSERT INTO public.users (id, username, password_hash, full_name, role, is_authorized, created_at, updated_at) 
    VALUES ('22222222-2222-2222-2222-222222222222', 'manager1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hospital Manager', 'manager', true, NOW(), NOW());
    
    INSERT INTO public.users (id, username, password_hash, full_name, role, is_authorized, created_at, updated_at) 
    VALUES ('33333333-3333-3333-3333-333333333333', 'employee1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Warehouse Employee', 'employee', true, NOW(), NOW());
    
    INSERT INTO public.users (id, username, password_hash, full_name, role, is_authorized, created_at, updated_at) 
    VALUES ('44444444-4444-4444-4444-444444444444', 'procurement1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Procurement Staff', 'procurement', true, NOW(), NOW());
    
    INSERT INTO public.users (id, username, password_hash, full_name, role, is_authorized, created_at, updated_at) 
    VALUES ('55555555-5555-5555-5555-555555555555', 'project1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Project Manager', 'project_manager', true, NOW(), NOW());
    
    INSERT INTO public.users (id, username, password_hash, full_name, role, is_authorized, created_at, updated_at) 
    VALUES ('66666666-6666-6666-6666-666666666666', 'maintenance1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maintenance Staff', 'maintenance', true, NOW(), NOW());
    
    INSERT INTO public.users (id, username, password_hash, full_name, role, is_authorized, created_at, updated_at) 
    VALUES ('77777777-7777-7777-7777-777777777777', 'document1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Document Analyst', 'document_analyst', true, NOW(), NOW());
    
    RAISE NOTICE 'Inserted 7 users successfully';
    
    -- Step 6: Add constraints after inserting data
    ALTER TABLE public.users ALTER COLUMN username SET NOT NULL;
    ALTER TABLE public.users ALTER COLUMN password_hash SET NOT NULL;
    ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
    
    RAISE NOTICE 'Added constraints successfully';
    
  ELSE
    RAISE NOTICE 'Migration already completed - username column exists';
  END IF;
END $$;

-- Step 7: Create or replace authentication functions
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

-- Step 8: Grant permissions
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_role(user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_user_status(UUID) TO authenticated;

-- Step 9: Verify setup
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Created % users', (SELECT COUNT(*) FROM public.users);
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
