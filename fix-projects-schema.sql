-- Fix Projects Table Schema
-- Add missing updated_by field that triggers expect

-- Add updated_by field to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add description field if missing
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add project_manager_id field if missing (for better tracking)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS project_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Update any existing records to have a default updated_by
UPDATE public.projects 
SET updated_by = (
  SELECT id FROM public.users 
  WHERE role = 'admin' 
  LIMIT 1
)
WHERE updated_by IS NULL;

-- Verify the schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY ordinal_position;
