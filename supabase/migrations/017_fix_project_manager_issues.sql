-- Fix Project Manager Database and Frontend Issues
-- Migration: 017_fix_project_manager_issues.sql

-- Ensure projects table has all required columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS spent DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS staff_count INTEGER DEFAULT 0;

-- Ensure staff_assignments table has all required columns
ALTER TABLE staff_assignments ADD COLUMN IF NOT EXISTS assigned_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE staff_assignments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE staff_assignments ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'team_member';

-- Update RLS policies to be more permissive for project_manager role
-- Drop all existing policies (both old and new names) for project_deliveries
DROP POLICY IF EXISTS "Users can view project deliveries" ON project_deliveries;
DROP POLICY IF EXISTS "Project managers can manage deliveries" ON project_deliveries;
DROP POLICY IF EXISTS "Authenticated users can view project deliveries" ON project_deliveries;
DROP POLICY IF EXISTS "Project managers and admins can manage project deliveries" ON project_deliveries;

-- Drop all existing policies for staff_performance
DROP POLICY IF EXISTS "Users can view staff performance" ON staff_performance;
DROP POLICY IF EXISTS "Project managers can manage staff performance" ON staff_performance;
DROP POLICY IF EXISTS "Authenticated users can view staff performance" ON staff_performance;
DROP POLICY IF EXISTS "Project managers and admins can manage staff performance" ON staff_performance;

-- Drop all existing policies for staff_assignments
DROP POLICY IF EXISTS "Users can view staff assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Project managers can manage staff assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Authenticated users can view staff assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Project managers and admins can manage staff assignments" ON staff_assignments;

-- Drop all existing policies for projects
DROP POLICY IF EXISTS "Users can view projects" ON projects;
DROP POLICY IF EXISTS "Project managers can manage projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can view projects" ON projects;
DROP POLICY IF EXISTS "Project managers and admins can manage projects" ON projects;

-- Now create all policies (will only succeed if they don't exist)
DO $$ 
BEGIN
  -- Project deliveries policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_deliveries' AND policyname = 'Authenticated users can view project deliveries') THEN
    CREATE POLICY "Authenticated users can view project deliveries" ON project_deliveries
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_deliveries' AND policyname = 'Project managers and admins can manage project deliveries') THEN
    CREATE POLICY "Project managers and admins can manage project deliveries" ON project_deliveries
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND role IN ('project_manager', 'admin')
        )
      );
  END IF;

  -- Staff performance policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_performance' AND policyname = 'Authenticated users can view staff performance') THEN
    CREATE POLICY "Authenticated users can view staff performance" ON staff_performance
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_performance' AND policyname = 'Project managers and admins can manage staff performance') THEN
    CREATE POLICY "Project managers and admins can manage staff performance" ON staff_performance
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND role IN ('project_manager', 'admin')
        )
      );
  END IF;

  -- Staff assignments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_assignments' AND policyname = 'Authenticated users can view staff assignments') THEN
    CREATE POLICY "Authenticated users can view staff assignments" ON staff_assignments
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_assignments' AND policyname = 'Project managers and admins can manage staff assignments') THEN
    CREATE POLICY "Project managers and admins can manage staff assignments" ON staff_assignments
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND role IN ('project_manager', 'admin')
        )
      );
  END IF;

  -- Projects policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Authenticated users can view projects') THEN
    CREATE POLICY "Authenticated users can view projects" ON projects
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Project managers and admins can manage projects') THEN
    CREATE POLICY "Project managers and admins can manage projects" ON projects
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND role IN ('project_manager', 'admin')
        )
      );
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_budget ON projects(budget);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_user_id ON staff_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_project_id ON staff_assignments(project_id);

-- Verify all required columns exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('projects', 'staff_assignments', 'project_deliveries', 'staff_performance')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Test queries to ensure tables are accessible
SELECT COUNT(*) as projects_count FROM projects;
SELECT COUNT(*) as staff_assignments_count FROM staff_assignments;
SELECT COUNT(*) as project_deliveries_count FROM project_deliveries;
SELECT COUNT(*) as staff_performance_count FROM staff_performance;
