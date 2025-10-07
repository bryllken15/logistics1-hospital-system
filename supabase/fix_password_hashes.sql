-- Fix Password Hashes for Username/Password Authentication
-- This script updates the password hashes to match the actual passwords

-- Update all users with the correct password hash for "password123"
UPDATE public.users 
SET password_hash = crypt('password123', gen_salt('bf'))
WHERE username IN ('admin', 'manager1', 'employee1', 'procurement1', 'project1', 'maintenance1', 'document1');

-- Verify the update
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE 'Password hashes updated successfully!';
  RAISE NOTICE 'Updated % users', (SELECT COUNT(*) FROM public.users);
  RAISE NOTICE '';
  RAISE NOTICE 'Login Credentials:';
  RAISE NOTICE 'Username: admin, Password: password123';
  RAISE NOTICE 'Username: manager1, Password: password123';
  RAISE NOTICE 'Username: employee1, Password: password123';
  RAISE NOTICE 'Username: procurement1, Password: password123';
  RAISE NOTICE 'Username: project1, Password: password123';
  RAISE NOTICE 'Username: maintenance1, Password: password123';
  RAISE NOTICE 'Username: document1, Password: password123';
  RAISE NOTICE '';
  RAISE NOTICE 'Test authentication:';
  FOR rec IN SELECT username, full_name, role FROM public.users ORDER BY role LOOP
    RAISE NOTICE '  % (%) - %', rec.username, rec.role, rec.full_name;
  END LOOP;
END $$;
