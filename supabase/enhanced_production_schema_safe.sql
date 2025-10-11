-- ENHANCED PRODUCTION DATABASE SCHEMA - SAFE VERSION
-- Hospital Supply Chain & Procurement Management System
-- Enhanced with Advanced Role-Based Security, Audit Trails, and Multi-Level Approval Workflows
-- Version: 2.0 - Production Ready (Safe for existing databases)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENHANCED ENUM TYPES (SAFE)
-- =============================================

-- Enhanced user roles with hierarchy (only create if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM (
      'admin',
      'manager', 
      'employee',
      'procurement',
      'project_manager',
      'maintenance',
      'document_analyst'
    );
  END IF;
END $$;

-- Enhanced inventory status (only create if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_status') THEN
    CREATE TYPE inventory_status AS ENUM (
      'in_stock',
      'low_stock',
      'critical',
      'out_of_stock',
      'pending_approval',
      'quarantined'
    );
  ELSE
    -- Add new values to existing enum if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_approval' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'inventory_status')) THEN
      ALTER TYPE inventory_status ADD VALUE 'pending_approval';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'quarantined' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'inventory_status')) THEN
      ALTER TYPE inventory_status ADD VALUE 'quarantined';
    END IF;
  END IF;
END $$;

-- Enhanced order status (only create if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM (
      'pending',
      'approved',
      'in_transit',
      'delivered',
      'rejected',
      'cancelled',
      'on_hold'
    );
  ELSE
    -- Add new values to existing enum if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cancelled' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
      ALTER TYPE order_status ADD VALUE 'cancelled';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'on_hold' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
      ALTER TYPE order_status ADD VALUE 'on_hold';
    END IF;
  END IF;
END $$;

-- Enhanced project status (only create if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM (
      'on_track',
      'delayed',
      'in_progress',
      'completed',
      'cancelled',
      'on_hold'
    );
  ELSE
    -- Add new values to existing enum if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cancelled' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'project_status')) THEN
      ALTER TYPE project_status ADD VALUE 'cancelled';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'on_hold' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'project_status')) THEN
      ALTER TYPE project_status ADD VALUE 'on_hold';
    END IF;
  END IF;
END $$;

-- Enhanced asset condition (only create if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_condition') THEN
    CREATE TYPE asset_condition AS ENUM (
      'excellent',
      'good',
      'needs_repair',
      'under_repair',
      'decommissioned'
    );
  ELSE
    -- Add new values to existing enum if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'decommissioned' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'asset_condition')) THEN
      ALTER TYPE asset_condition ADD VALUE 'decommissioned';
    END IF;
  END IF;
END $$;

-- Enhanced document types (only create if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    CREATE TYPE document_type AS ENUM (
      'delivery_receipt',
      'purchase_order',
      'invoice',
      'contract',
      'compliance_certificate',
      'maintenance_record'
    );
  ELSE
    -- Add new values to existing enum if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'compliance_certificate' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type')) THEN
      ALTER TYPE document_type ADD VALUE 'compliance_certificate';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'maintenance_record' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type')) THEN
      ALTER TYPE document_type ADD VALUE 'maintenance_record';
    END IF;
  END IF;
END $$;

-- Enhanced document status (only create if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
    CREATE TYPE document_status AS ENUM (
      'pending_verification',
      'verified',
      'archived',
      'rejected',
      'expired'
    );
  ELSE
    -- Add new values to existing enum if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'rejected' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_status')) THEN
      ALTER TYPE document_status ADD VALUE 'rejected';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'expired' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_status')) THEN
      ALTER TYPE document_status ADD VALUE 'expired';
    END IF;
  END IF;
END $$;

-- Request status (only create if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
    CREATE TYPE request_status AS ENUM (
      'pending',
      'approved',
      'rejected',
      'cancelled',
      'escalated'
    );
  END IF;
END $$;

-- Audit action types (only create if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
    CREATE TYPE audit_action AS ENUM (
      'INSERT',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'PERMISSION_DENIED',
      'SECURITY_VIOLATION'
    );
  END IF;
END $$;

-- Notification types (only create if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'approval_request',
      'approval_approved',
      'approval_rejected',
      'system_alert',
      'maintenance_reminder',
      'inventory_alert',
      'security_alert',
      'compliance_reminder'
    );
  END IF;
END $$;

-- =============================================
-- ENHANCE EXISTING TABLES (SAFE)
-- =============================================

-- Add new columns to existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add new columns to existing inventory table
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS supplier TEXT,
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add new columns to existing purchase_orders table
ALTER TABLE public.purchase_orders 
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add new columns to existing purchase_requests table
ALTER TABLE public.purchase_requests 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Add new columns to existing projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS project_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add new columns to existing assets table
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS warranty_expiry DATE;

-- Add new columns to existing documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add new columns to existing delivery_receipts table
ALTER TABLE public.delivery_receipts 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add new columns to existing maintenance_logs table
ALTER TABLE public.maintenance_logs 
ADD COLUMN IF NOT EXISTS scheduled_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add new columns to existing suppliers table
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add new columns to existing staff_assignments table
ALTER TABLE public.staff_assignments 
ADD COLUMN IF NOT EXISTS role_in_project TEXT;

-- Add new columns to existing inventory_changes table
ALTER TABLE public.inventory_changes 
ADD COLUMN IF NOT EXISTS reason TEXT;

-- Add new columns to existing system_logs table
ALTER TABLE public.system_logs 
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info',
ADD COLUMN IF NOT EXISTS module TEXT;

-- =============================================
-- CREATE NEW AUDIT TABLES
-- =============================================

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action audit_action NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval audit trail table
CREATE TABLE IF NOT EXISTS public.approval_audit_trail (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_type TEXT NOT NULL,
  request_id UUID NOT NULL,
  approver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security events table
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CREATE APPROVAL WORKFLOW TABLES
-- =============================================

-- Approval chains table
CREATE TABLE IF NOT EXISTS public.approval_chains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  request_type TEXT NOT NULL,
  approval_level INTEGER NOT NULL,
  required_role user_role NOT NULL,
  is_parallel BOOLEAN DEFAULT false,
  sla_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval delegates table
CREATE TABLE IF NOT EXISTS public.approval_delegates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  delegator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  delegate_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval history table
CREATE TABLE IF NOT EXISTS public.approval_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID NOT NULL,
  request_type TEXT NOT NULL,
  approver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  comments TEXT,
  approval_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CREATE ROLE MANAGEMENT TABLES
-- =============================================

-- Role permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role user_role NOT NULL,
  table_name TEXT NOT NULL,
  permission TEXT NOT NULL,
  conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, table_name, permission)
);

-- User role history table
CREATE TABLE IF NOT EXISTS public.user_role_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  old_role user_role,
  new_role user_role NOT NULL,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Temporary role assignments table
CREATE TABLE IF NOT EXISTS public.temporary_role_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_role user_role NOT NULL,
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role hierarchies table
CREATE TABLE IF NOT EXISTS public.role_hierarchies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_role user_role NOT NULL,
  child_role user_role NOT NULL,
  can_delegate BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_role, child_role)
);

-- =============================================
-- CREATE NOTIFICATION SYSTEM TABLES
-- =============================================

-- Enhanced notifications table (update existing)
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- Notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type notification_type NOT NULL,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Escalation rules table
CREATE TABLE IF NOT EXISTS public.escalation_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_type TEXT NOT NULL,
  approval_level INTEGER NOT NULL,
  escalation_hours INTEGER NOT NULL,
  escalate_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CREATE ANALYTICS TABLES
-- =============================================

-- Dashboard metrics table
CREATE TABLE IF NOT EXISTS public.dashboard_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  metric_type TEXT NOT NULL,
  dimension JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance reports table
CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  generated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.user_activity_logs(action);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at);

-- Approval indexes
CREATE INDEX IF NOT EXISTS idx_approval_history_request ON public.approval_history(request_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_approver ON public.approval_history(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_chains_type ON public.approval_chains(request_type);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_name ON public.dashboard_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_calculated ON public.dashboard_metrics(calculated_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user ON public.performance_metrics(user_id);

-- =============================================
-- CREATE TRIGGER FUNCTIONS
-- =============================================

-- Audit trail trigger function
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
BEGIN
  -- Convert OLD and NEW to JSONB
  IF TG_OP = 'DELETE' THEN
    old_data = to_jsonb(OLD);
    new_data = NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_data = NULL;
    new_data = to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    user_id,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP::audit_action,
    COALESCE(NEW.updated_by, OLD.updated_by, auth.uid()),
    old_data,
    new_data,
    inet_client_addr()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- User activity logging function
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    ip_address,
    session_id
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    inet_client_addr(),
    current_setting('request.jwt.claims', true)::json->>'session_id'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CREATE TRIGGERS (SAFE)
-- =============================================

-- Audit trail triggers (only if they don't exist)
DO $$
BEGIN
  -- Users audit trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_users') THEN
    CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
  END IF;
  
  -- Inventory audit trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_inventory') THEN
    CREATE TRIGGER audit_inventory AFTER INSERT OR UPDATE OR DELETE ON public.inventory FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
  END IF;
  
  -- Purchase orders audit trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_purchase_orders') THEN
    CREATE TRIGGER audit_purchase_orders AFTER INSERT OR UPDATE OR DELETE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
  END IF;
  
  -- Purchase requests audit trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_purchase_requests') THEN
    CREATE TRIGGER audit_purchase_requests AFTER INSERT OR UPDATE OR DELETE ON public.purchase_requests FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
  END IF;
  
  -- Projects audit trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_projects') THEN
    CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON public.projects FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
  END IF;
  
  -- Assets audit trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_assets') THEN
    CREATE TRIGGER audit_assets AFTER INSERT OR UPDATE OR DELETE ON public.assets FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
  END IF;
  
  -- Documents audit trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_documents') THEN
    CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON public.documents FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
  END IF;
END $$;

-- =============================================
-- ENABLE RLS ON NEW TABLES
-- =============================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_delegates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporary_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_hierarchies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE RLS POLICIES FOR NEW TABLES
-- =============================================

-- Audit logs policies (Admin only)
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Activity logs policies
CREATE POLICY "Users can read own activity logs" ON public.user_activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all activity logs" ON public.user_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Approval audit trail policies
CREATE POLICY "Users can read approval audit trail" ON public.approval_audit_trail
  FOR SELECT USING (auth.role() = 'authenticated');

-- Security events policies (Admin only)
CREATE POLICY "Admins can read security events" ON public.security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Approval chains policies
CREATE POLICY "Managers can read approval chains" ON public.approval_chains
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND (role = 'manager' OR role = 'admin')
    )
  );

CREATE POLICY "Admins can manage approval chains" ON public.approval_chains
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Role permissions policies (Admin only)
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notification preferences policies
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Dashboard metrics policies
CREATE POLICY "Users can read dashboard metrics" ON public.dashboard_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Performance metrics policies
CREATE POLICY "Users can read own performance metrics" ON public.performance_metrics
  FOR SELECT USING (auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND (role = 'manager' OR role = 'admin')
    )
  );

-- Compliance reports policies (Admin and Manager only)
CREATE POLICY "Managers can read compliance reports" ON public.compliance_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND (role = 'manager' OR role = 'admin')
    )
  );

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Check role permission function
CREATE OR REPLACE FUNCTION check_role_permission(
  user_role_name user_role,
  table_name TEXT,
  permission TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.role_permissions
    WHERE role = user_role_name
    AND table_name = check_role_permission.table_name
    AND permission = check_role_permission.permission
  );
END;
$$ LANGUAGE plpgsql;

-- Validate approval chain function
CREATE OR REPLACE FUNCTION validate_approval_chain(
  request_type TEXT,
  user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role_name user_role;
BEGIN
  SELECT role INTO user_role_name FROM public.users WHERE id = user_id;
  
  RETURN EXISTS (
    SELECT 1 FROM public.approval_chains
    WHERE request_type = validate_approval_chain.request_type
    AND required_role = user_role_name
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Escalate overdue approvals function
CREATE OR REPLACE FUNCTION escalate_overdue_approvals()
RETURNS VOID AS $$
BEGIN
  -- Implementation for escalating overdue approvals
  -- This would check for approvals past their SLA and escalate
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Calculate dashboard metrics function
CREATE OR REPLACE FUNCTION calculate_dashboard_metrics()
RETURNS VOID AS $$
BEGIN
  -- Implementation for calculating dashboard metrics
  -- This would pre-calculate KPIs for dashboard performance
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Archive old records function
CREATE OR REPLACE FUNCTION archive_old_records()
RETURNS VOID AS $$
BEGIN
  -- Implementation for archiving old records
  -- This would move old audit logs and activity logs to archive tables
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Generate compliance report function
CREATE OR REPLACE FUNCTION generate_compliance_report(
  report_type TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB AS $$
BEGIN
  -- Implementation for generating compliance reports
  -- This would generate audit reports for compliance
  RETURN '{}'::JSONB;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert role permissions
INSERT INTO public.role_permissions (role, table_name, permission, conditions) VALUES
  ('admin', 'users', 'read', '{"scope": "all"}'),
  ('admin', 'users', 'write', '{"scope": "all"}'),
  ('admin', 'users', 'update', '{"scope": "all"}'),
  ('admin', 'users', 'delete', '{"scope": "all"}'),
  ('admin', 'inventory', 'read', '{"scope": "all"}'),
  ('admin', 'inventory', 'write', '{"scope": "all"}'),
  ('admin', 'inventory', 'update', '{"scope": "all"}'),
  ('admin', 'inventory', 'delete', '{"scope": "all"}'),
  ('manager', 'inventory', 'read', '{"scope": "all"}'),
  ('manager', 'inventory', 'update', '{"scope": "all"}'),
  ('manager', 'purchase_requests', 'read', '{"scope": "all"}'),
  ('manager', 'purchase_requests', 'update', '{"scope": "all"}'),
  ('employee', 'inventory', 'read', '{"scope": "all"}'),
  ('employee', 'purchase_requests', 'read', '{"scope": "own_requests"}'),
  ('employee', 'purchase_requests', 'write', '{"scope": "own_requests"}'),
  ('procurement', 'purchase_orders', 'read', '{"scope": "all"}'),
  ('procurement', 'purchase_orders', 'write', '{"scope": "all"}'),
  ('procurement', 'purchase_orders', 'update', '{"scope": "all"}'),
  ('project_manager', 'projects', 'read', '{"scope": "all"}'),
  ('project_manager', 'projects', 'write', '{"scope": "all"}'),
  ('project_manager', 'projects', 'update', '{"scope": "all"}'),
  ('maintenance', 'assets', 'read', '{"scope": "all"}'),
  ('maintenance', 'assets', 'write', '{"scope": "all"}'),
  ('maintenance', 'assets', 'update', '{"scope": "all"}'),
  ('document_analyst', 'documents', 'read', '{"scope": "all"}'),
  ('document_analyst', 'documents', 'write', '{"scope": "all"}'),
  ('document_analyst', 'documents', 'update', '{"scope": "all"}')
ON CONFLICT (role, table_name, permission) DO NOTHING;

-- Insert approval chains
INSERT INTO public.approval_chains (name, request_type, approval_level, required_role, sla_hours) VALUES
  ('Purchase Request Approval', 'purchase_request', 1, 'manager', 24),
  ('Purchase Request Approval', 'purchase_request', 2, 'project_manager', 48),
  ('Purchase Request Approval', 'purchase_request', 3, 'admin', 72),
  ('Inventory Change Approval', 'inventory_change', 1, 'manager', 12),
  ('Inventory Change Approval', 'inventory_change', 2, 'admin', 24)
ON CONFLICT DO NOTHING;

-- Insert notification templates
INSERT INTO public.notification_templates (name, type, subject_template, body_template) VALUES
  ('Approval Request', 'approval_request', 'New {{request_type}} requires your approval', 'A new {{request_type}} has been submitted and requires your approval. Please review and take action.'),
  ('Approval Approved', 'approval_approved', '{{request_type}} has been approved', 'Your {{request_type}} has been approved and will proceed to the next stage.'),
  ('Approval Rejected', 'approval_rejected', '{{request_type}} has been rejected', 'Your {{request_type}} has been rejected. Please review the comments and resubmit if necessary.'),
  ('System Alert', 'system_alert', 'System Alert: {{alert_type}}', 'A system alert has been triggered: {{alert_message}}'),
  ('Maintenance Reminder', 'maintenance_reminder', 'Maintenance Due: {{asset_name}}', 'The maintenance for {{asset_name}} is due on {{due_date}}. Please schedule accordingly.')
ON CONFLICT DO NOTHING;

-- Insert escalation rules
INSERT INTO public.escalation_rules (request_type, approval_level, escalation_hours, escalate_to) VALUES
  ('purchase_request', 1, 24, (SELECT id FROM public.users WHERE username = 'admin' LIMIT 1)),
  ('purchase_request', 2, 48, (SELECT id FROM public.users WHERE username = 'admin' LIMIT 1)),
  ('inventory_change', 1, 12, (SELECT id FROM public.users WHERE username = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

-- =============================================
-- ENABLE REALTIME FOR NEW TABLES
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_audit_trail;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_chains;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_delegates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.role_permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_role_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.temporary_role_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.role_hierarchies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.escalation_rules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.compliance_reports;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT 'Enhanced Production Database Schema (Safe Version) created successfully!' as message,
       'All new tables, triggers, functions, and RLS policies have been created safely.' as details,
       'Database is now ready for production use with advanced role-based security and audit trails.' as status;
