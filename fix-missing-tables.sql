-- Fix Missing Tables and Schema Conflicts
-- Smart Supply Chain & Procurement Management System

-- =============================================
-- CREATE MISSING MAINTENANCE_SCHEDULE TABLE
-- =============================================

-- Create maintenance_schedule table (referenced by old dashboard code)
CREATE TABLE IF NOT EXISTS public.maintenance_schedule (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  technician TEXT,
  status TEXT DEFAULT 'scheduled',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE public.maintenance_schedule DISABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_asset ON public.maintenance_schedule(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_date ON public.maintenance_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_status ON public.maintenance_schedule(status);

-- =============================================
-- FIX SYSTEM_LOGS TABLE SCHEMA
-- =============================================

-- Fix system_logs table schema conflicts
ALTER TABLE public.system_logs 
ADD COLUMN IF NOT EXISTS action TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS details TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Disable RLS
ALTER TABLE public.system_logs DISABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON public.system_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON public.system_logs(created_at);

-- =============================================
-- ENSURE DOCUMENTS TABLE HAS ALL REQUIRED COLUMNS
-- =============================================

-- Add any missing columns to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS expiration_date DATE,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS related_entity_type TEXT,
ADD COLUMN IF NOT EXISTS related_entity_id UUID,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_hash TEXT;

-- =============================================
-- ENSURE ASSETS TABLE HAS ALL REQUIRED COLUMNS
-- =============================================

-- Add any missing columns to assets table
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS asset_type TEXT,
ADD COLUMN IF NOT EXISTS serial_number TEXT,
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS purchase_cost DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS warranty_expiry DATE,
ADD COLUMN IF NOT EXISTS depreciation_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS current_value DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS criticality TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS operating_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_service_date DATE,
ADD COLUMN IF NOT EXISTS service_interval_days INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- =============================================
-- ENSURE MAINTENANCE_LOGS TABLE HAS ALL REQUIRED COLUMNS
-- =============================================

-- Add any missing columns to maintenance_logs table
ALTER TABLE public.maintenance_logs
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS completed_date DATE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS parts_used TEXT[],
ADD COLUMN IF NOT EXISTS labor_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS work_order_number TEXT,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS attachments TEXT[],
ADD COLUMN IF NOT EXISTS downtime_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- =============================================
-- UPDATE EXISTING RECORDS WITH DEFAULT VALUES
-- =============================================

-- Update existing documents with default values
UPDATE public.documents 
SET updated_by = (
  SELECT id FROM public.users 
  WHERE role = 'document_analyst' 
  LIMIT 1
)
WHERE updated_by IS NULL;

-- Update existing assets with default values
UPDATE public.assets 
SET updated_by = (
  SELECT id FROM public.users 
  WHERE role = 'maintenance' 
  LIMIT 1
),
created_by = (
  SELECT id FROM public.users 
  WHERE role = 'maintenance' 
  LIMIT 1
)
WHERE updated_by IS NULL OR created_by IS NULL;

-- Update existing maintenance logs with default values
UPDATE public.maintenance_logs 
SET updated_by = (
  SELECT id FROM public.users 
  WHERE role = 'maintenance' 
  LIMIT 1
),
created_by = (
  SELECT id FROM public.users 
  WHERE role = 'maintenance' 
  LIMIT 1
)
WHERE updated_by IS NULL OR created_by IS NULL;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify all tables exist and have correct structure
SELECT 'maintenance_schedule' as table_name, COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'maintenance_schedule' AND table_schema = 'public'

UNION ALL

SELECT 'system_logs', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'system_logs' AND table_schema = 'public'

UNION ALL

SELECT 'documents', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'documents' AND table_schema = 'public'

UNION ALL

SELECT 'assets', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'assets' AND table_schema = 'public'

UNION ALL

SELECT 'maintenance_logs', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'maintenance_logs' AND table_schema = 'public';
