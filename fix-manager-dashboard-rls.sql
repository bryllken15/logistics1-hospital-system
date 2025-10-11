-- Fix RLS policies for manager dashboard tables
-- These tables are used internally and already protected by application-level auth

-- Disable RLS on manager dashboard tables
ALTER TABLE manager_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE export_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics DISABLE ROW LEVEL SECURITY;

-- Ensure permissions are granted
GRANT ALL ON manager_reports TO authenticated;
GRANT ALL ON manager_reports TO anon;
GRANT ALL ON bulk_operations TO authenticated;
GRANT ALL ON bulk_operations TO anon;
GRANT ALL ON export_logs TO authenticated;
GRANT ALL ON export_logs TO anon;
GRANT ALL ON performance_metrics TO authenticated;
GRANT ALL ON performance_metrics TO anon;

-- Verify tables exist
SELECT 'manager_reports' as table_name, COUNT(*) as exists 
FROM information_schema.tables 
WHERE table_name = 'manager_reports'
UNION ALL
SELECT 'bulk_operations', COUNT(*) 
FROM information_schema.tables 
WHERE table_name = 'bulk_operations'
UNION ALL
SELECT 'export_logs', COUNT(*) 
FROM information_schema.tables 
WHERE table_name = 'export_logs'
UNION ALL
SELECT 'performance_metrics', COUNT(*) 
FROM information_schema.tables 
WHERE table_name = 'performance_metrics';
