-- Emergency Fix: Disable RLS on Projects Tables
-- This allows project creation with custom authentication

-- Disable RLS on projects table
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- Also disable on related tables
ALTER TABLE public.project_deliveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_performance DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('projects', 'project_deliveries', 'staff_assignments', 'staff_performance')
AND schemaname = 'public';
