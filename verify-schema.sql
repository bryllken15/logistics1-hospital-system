-- Database Schema Verification Script
-- Run this in Supabase SQL Editor to verify the schema was applied correctly

-- Check if all tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'inventory', 'purchase_orders', 'purchase_requests', 
    'projects', 'assets', 'documents', 'system_logs', 
    'delivery_receipts', 'maintenance_logs', 'suppliers', 
    'staff_assignments', 'inventory_changes', 'maintenance_schedule', 
    'notifications', 'reports'
  )
ORDER BY table_name;

-- Check if sample users exist
SELECT 
  username,
  role,
  is_authorized,
  full_name
FROM public.users 
ORDER BY username;

-- Check if sample inventory exists
SELECT 
  item_name,
  rfid_code,
  quantity,
  status,
  location
FROM public.inventory 
ORDER BY item_name;

-- Check if sample purchase orders exist
SELECT 
  supplier,
  items,
  amount,
  status,
  rfid_code
FROM public.purchase_orders 
ORDER BY supplier;

-- Check if sample purchase requests exist
SELECT 
  request_number,
  item_name,
  quantity,
  estimated_cost,
  status
FROM public.purchase_requests 
ORDER BY request_number;

-- Check if sample projects exist
SELECT 
  name,
  status,
  progress,
  budget,
  spent
FROM public.projects 
ORDER BY name;

-- Check if sample assets exist
SELECT 
  name,
  rfid_code,
  condition,
  location
FROM public.assets 
ORDER BY name;

-- Check if sample documents exist
SELECT 
  file_name,
  file_type,
  file_size,
  status
FROM public.documents 
ORDER BY file_name;

-- Check if sample suppliers exist
SELECT 
  name,
  contact,
  email,
  rating
FROM public.suppliers 
ORDER BY name;

-- Check if sample notifications exist
SELECT 
  title,
  message,
  type,
  is_read
FROM public.notifications 
ORDER BY title;

-- Check if authentication function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'authenticate_user';

-- Check if triggers exist
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE 'update_%_updated_at'
ORDER BY trigger_name;

-- Check if indexes exist
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check if realtime is enabled for tables
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Summary count of all data
SELECT 
  'users' as table_name, COUNT(*) as record_count FROM public.users
UNION ALL
SELECT 'inventory', COUNT(*) FROM public.inventory
UNION ALL
SELECT 'purchase_orders', COUNT(*) FROM public.purchase_orders
UNION ALL
SELECT 'purchase_requests', COUNT(*) FROM public.purchase_requests
UNION ALL
SELECT 'projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'assets', COUNT(*) FROM public.assets
UNION ALL
SELECT 'documents', COUNT(*) FROM public.documents
UNION ALL
SELECT 'suppliers', COUNT(*) FROM public.suppliers
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'system_logs', COUNT(*) FROM public.system_logs
ORDER BY table_name;
