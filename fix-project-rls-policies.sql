
-- Fix RLS policies for project creation
-- This allows authenticated users to perform all operations on projects table

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read projects" ON public.projects;
DROP POLICY IF EXISTS "Project managers can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all for projects" ON public.projects;

-- Create permissive policy for all authenticated users
CREATE POLICY "Allow all for projects" ON public.projects 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.projects TO authenticated;

-- Also fix related tables
DROP POLICY IF EXISTS "Allow all for project_deliveries" ON public.project_deliveries;
CREATE POLICY "Allow all for project_deliveries" ON public.project_deliveries 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for staff_assignments" ON public.staff_assignments;
CREATE POLICY "Allow all for staff_assignments" ON public.staff_assignments 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for staff_performance" ON public.staff_performance;
CREATE POLICY "Allow all for staff_performance" ON public.staff_performance 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.project_deliveries TO authenticated;
GRANT ALL ON public.staff_assignments TO authenticated;
GRANT ALL ON public.staff_performance TO authenticated;
