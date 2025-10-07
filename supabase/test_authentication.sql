-- Test Authentication Script
-- This script tests the authentication function with the correct credentials

-- Test authentication for each user
DO $$
DECLARE
  auth_result RECORD;
  test_users TEXT[] := ARRAY['admin', 'manager1', 'employee1', 'procurement1', 'project1', 'maintenance1', 'document1'];
  username TEXT;
BEGIN
  RAISE NOTICE 'Testing authentication for all users...';
  RAISE NOTICE '';
  
  FOREACH username IN ARRAY test_users LOOP
    SELECT * INTO auth_result 
    FROM authenticate_user(username, 'password123');
    
    IF auth_result.id IS NOT NULL THEN
      RAISE NOTICE '✓ % - Authentication SUCCESS (Role: %, Name: %)', 
        username, auth_result.role, auth_result.full_name;
    ELSE
      RAISE NOTICE '✗ % - Authentication FAILED', username;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Authentication test completed!';
END $$;
