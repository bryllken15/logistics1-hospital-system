-- =====================================================
-- DIAGNOSE ACTUAL TABLE SCHEMA
-- This script checks the actual structure of approval tables
-- =====================================================

-- Check procurement_approvals table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'procurement_approvals' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check inventory_approvals table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'inventory_approvals' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check foreign key constraints
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
AND tc.table_name IN ('procurement_approvals', 'inventory_approvals')
AND tc.table_schema = 'public';

-- Check if tables exist and have data
SELECT 
  'procurement_approvals' as table_name,
  COUNT(*) as row_count
FROM procurement_approvals
UNION ALL
SELECT 
  'inventory_approvals' as table_name,
  COUNT(*) as row_count
FROM inventory_approvals
UNION ALL
SELECT 
  'purchase_requests' as table_name,
  COUNT(*) as row_count
FROM purchase_requests
UNION ALL
SELECT 
  'users' as table_name,
  COUNT(*) as row_count
FROM users;
