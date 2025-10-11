-- Complete Database Schema Enhancement for Documents & Maintenance
-- Smart Supply Chain & Procurement Management System

-- =============================================
-- DOCUMENTS TABLE ENHANCEMENTS
-- =============================================

-- Add missing fields to documents table
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
-- ASSETS TABLE ENHANCEMENTS
-- =============================================

-- Add missing fields to assets table
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS asset_type TEXT,
ADD COLUMN IF NOT EXISTS serial_number TEXT UNIQUE,
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
-- MAINTENANCE_LOGS TABLE ENHANCEMENTS
-- =============================================

-- Add missing fields to maintenance_logs table
ALTER TABLE public.maintenance_logs
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS completed_date DATE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS parts_used TEXT[],
ADD COLUMN IF NOT EXISTS labor_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS work_order_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS attachments TEXT[],
ADD COLUMN IF NOT EXISTS downtime_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- =============================================
-- NEW TABLES FOR ENHANCED FUNCTIONALITY
-- =============================================

-- Create spare parts inventory table
CREATE TABLE IF NOT EXISTS public.spare_parts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  part_name TEXT NOT NULL,
  part_number TEXT UNIQUE NOT NULL,
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  minimum_quantity INTEGER DEFAULT 5,
  unit_cost DECIMAL(10,2),
  supplier TEXT,
  location TEXT,
  compatible_assets UUID[],
  last_ordered DATE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance work orders table  
CREATE TABLE IF NOT EXISTS public.maintenance_work_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_number TEXT UNIQUE NOT NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  scheduled_date DATE,
  completed_date DATE,
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  parts_used JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document versions table for version control
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT,
  file_hash TEXT,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  change_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document approvals table for workflow
CREATE TABLE IF NOT EXISTS public.document_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approval_level INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create asset maintenance schedules table
CREATE TABLE IF NOT EXISTS public.asset_maintenance_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  frequency_days INTEGER NOT NULL,
  last_performed DATE,
  next_due DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DISABLE ROW LEVEL SECURITY
-- =============================================

-- Disable RLS on all tables for immediate functionality
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance_schedules DISABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_expiration ON public.documents(expiration_date);
CREATE INDEX IF NOT EXISTS idx_documents_related_entity ON public.documents(related_entity_type, related_entity_id);

-- Assets indexes
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_criticality ON public.assets(criticality);
CREATE INDEX IF NOT EXISTS idx_assets_next_maintenance ON public.assets(next_maintenance);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON public.assets(assigned_to);

-- Maintenance logs indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_asset ON public.maintenance_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_status ON public.maintenance_logs(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_priority ON public.maintenance_logs(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_scheduled ON public.maintenance_logs(scheduled_date);

-- Work orders indexes
CREATE INDEX IF NOT EXISTS idx_work_orders_asset ON public.maintenance_work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.maintenance_work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_priority ON public.maintenance_work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned ON public.maintenance_work_orders(assigned_to);

-- Spare parts indexes
CREATE INDEX IF NOT EXISTS idx_spare_parts_category ON public.spare_parts(category);
CREATE INDEX IF NOT EXISTS idx_spare_parts_quantity ON public.spare_parts(quantity);
CREATE INDEX IF NOT EXISTS idx_spare_parts_minimum ON public.spare_parts(minimum_quantity);

-- =============================================
-- UPDATE EXISTING RECORDS
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
SELECT 'documents' as table_name, COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'documents' AND table_schema = 'public'

UNION ALL

SELECT 'assets', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'assets' AND table_schema = 'public'

UNION ALL

SELECT 'maintenance_logs', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'maintenance_logs' AND table_schema = 'public'

UNION ALL

SELECT 'spare_parts', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'spare_parts' AND table_schema = 'public'

UNION ALL

SELECT 'maintenance_work_orders', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'maintenance_work_orders' AND table_schema = 'public'

UNION ALL

SELECT 'document_versions', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'document_versions' AND table_schema = 'public'

UNION ALL

SELECT 'document_approvals', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'document_approvals' AND table_schema = 'public'

UNION ALL

SELECT 'asset_maintenance_schedules', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'asset_maintenance_schedules' AND table_schema = 'public';
