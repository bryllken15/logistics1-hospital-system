-- Fix Critical Project Manager Dashboard Issues
-- Migration: 019_fix_enum_and_rls.sql

-- Since we changed the frontend to use 'in_progress' instead of 'planning',
-- we don't need to modify the enum. Just fix the RLS policies.

-- First, check what enum values exist for project_status
SELECT unnest(enum_range(NULL::project_status))::text as status_values;

-- Update the default status for projects table to use a valid enum value
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'in_progress';

-- Fix RLS policies for project_manager_reports table
-- First ensure RLS is enabled
ALTER TABLE project_manager_reports ENABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Project managers can view their own reports" ON project_manager_reports;
DROP POLICY IF EXISTS "Allow all for project_manager_reports" ON project_manager_reports;

-- Create permissive policy for project_manager_reports
CREATE POLICY "Allow all for project_manager_reports" ON project_manager_reports 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Grant all necessary permissions
GRANT ALL ON project_manager_reports TO authenticated;

-- Ensure all other tables have proper permissive policies
-- Projects table
DROP POLICY IF EXISTS "Allow all for projects" ON projects;
CREATE POLICY "Allow all for projects" ON projects 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Project deliveries table
DROP POLICY IF EXISTS "Allow all for project_deliveries" ON project_deliveries;
CREATE POLICY "Allow all for project_deliveries" ON project_deliveries 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Staff assignments table
DROP POLICY IF EXISTS "Allow all for staff_assignments" ON staff_assignments;
CREATE POLICY "Allow all for staff_assignments" ON staff_assignments 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Staff performance table
DROP POLICY IF EXISTS "Allow all for staff_performance" ON staff_performance;
CREATE POLICY "Allow all for staff_performance" ON staff_performance 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Grant all permissions to authenticated users
GRANT ALL ON projects TO authenticated;
GRANT ALL ON project_deliveries TO authenticated;
GRANT ALL ON staff_assignments TO authenticated;
GRANT ALL ON staff_performance TO authenticated;
GRANT ALL ON project_manager_reports TO authenticated;

-- Verify the enum values after update
SELECT unnest(enum_range(NULL::project_status))::text as status_values;

-- Test query to verify tables are accessible
SELECT 'projects' as table_name, COUNT(*) as row_count FROM projects
UNION ALL
SELECT 'project_deliveries', COUNT(*) FROM project_deliveries
UNION ALL
SELECT 'staff_assignments', COUNT(*) FROM staff_assignments
UNION ALL
SELECT 'staff_performance', COUNT(*) FROM staff_performance
UNION ALL
SELECT 'project_manager_reports', COUNT(*) FROM project_manager_reports;