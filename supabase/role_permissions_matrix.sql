-- ROLE PERMISSIONS MATRIX
-- Hospital Supply Chain & Procurement Management System
-- Comprehensive permission definitions for all 7 roles
-- Version: 2.0 - Enhanced RBAC

-- =============================================
-- PERMISSION DEFINITIONS
-- =============================================

-- Permission Types:
-- 'read' - Can view/select data
-- 'write' - Can insert new data
-- 'update' - Can modify existing data
-- 'delete' - Can remove data
-- 'approve' - Can approve/reject requests
-- 'manage' - Full CRUD operations
-- 'audit' - Can view audit logs
-- 'admin' - Full system access

-- =============================================
-- ADMIN ROLE PERMISSIONS
-- =============================================

-- Admin has full access to all tables and functions
INSERT INTO public.role_permissions (role, table_name, permission, conditions) VALUES
  -- User Management
  ('admin', 'users', 'read', '{"scope": "all"}'),
  ('admin', 'users', 'write', '{"scope": "all"}'),
  ('admin', 'users', 'update', '{"scope": "all"}'),
  ('admin', 'users', 'delete', '{"scope": "all"}'),
  ('admin', 'user_role_history', 'read', '{"scope": "all"}'),
  ('admin', 'user_role_history', 'write', '{"scope": "all"}'),
  ('admin', 'temporary_role_assignments', 'read', '{"scope": "all"}'),
  ('admin', 'temporary_role_assignments', 'write', '{"scope": "all"}'),
  ('admin', 'temporary_role_assignments', 'update', '{"scope": "all"}'),
  ('admin', 'temporary_role_assignments', 'delete', '{"scope": "all"}'),
  
  -- Inventory Management
  ('admin', 'inventory', 'read', '{"scope": "all"}'),
  ('admin', 'inventory', 'write', '{"scope": "all"}'),
  ('admin', 'inventory', 'update', '{"scope": "all"}'),
  ('admin', 'inventory', 'delete', '{"scope": "all"}'),
  ('admin', 'inventory_changes', 'read', '{"scope": "all"}'),
  ('admin', 'inventory_changes', 'write', '{"scope": "all"}'),
  ('admin', 'inventory_changes', 'update', '{"scope": "all"}'),
  ('admin', 'inventory_changes', 'delete', '{"scope": "all"}'),
  
  -- Purchase Management
  ('admin', 'purchase_orders', 'read', '{"scope": "all"}'),
  ('admin', 'purchase_orders', 'write', '{"scope": "all"}'),
  ('admin', 'purchase_orders', 'update', '{"scope": "all"}'),
  ('admin', 'purchase_orders', 'delete', '{"scope": "all"}'),
  ('admin', 'purchase_requests', 'read', '{"scope": "all"}'),
  ('admin', 'purchase_requests', 'write', '{"scope": "all"}'),
  ('admin', 'purchase_requests', 'update', '{"scope": "all"}'),
  ('admin', 'purchase_requests', 'delete', '{"scope": "all"}'),
  ('admin', 'purchase_requests', 'approve', '{"scope": "all"}'),
  
  -- Project Management
  ('admin', 'projects', 'read', '{"scope": "all"}'),
  ('admin', 'projects', 'write', '{"scope": "all"}'),
  ('admin', 'projects', 'update', '{"scope": "all"}'),
  ('admin', 'projects', 'delete', '{"scope": "all"}'),
  ('admin', 'staff_assignments', 'read', '{"scope": "all"}'),
  ('admin', 'staff_assignments', 'write', '{"scope": "all"}'),
  ('admin', 'staff_assignments', 'update', '{"scope": "all"}'),
  ('admin', 'staff_assignments', 'delete', '{"scope": "all"}'),
  
  -- Asset Management
  ('admin', 'assets', 'read', '{"scope": "all"}'),
  ('admin', 'assets', 'write', '{"scope": "all"}'),
  ('admin', 'assets', 'update', '{"scope": "all"}'),
  ('admin', 'assets', 'delete', '{"scope": "all"}'),
  ('admin', 'maintenance_logs', 'read', '{"scope": "all"}'),
  ('admin', 'maintenance_logs', 'write', '{"scope": "all"}'),
  ('admin', 'maintenance_logs', 'update', '{"scope": "all"}'),
  ('admin', 'maintenance_logs', 'delete', '{"scope": "all"}'),
  ('admin', 'maintenance_schedule', 'read', '{"scope": "all"}'),
  ('admin', 'maintenance_schedule', 'write', '{"scope": "all"}'),
  ('admin', 'maintenance_schedule', 'update', '{"scope": "all"}'),
  ('admin', 'maintenance_schedule', 'delete', '{"scope": "all"}'),
  
  -- Document Management
  ('admin', 'documents', 'read', '{"scope": "all"}'),
  ('admin', 'documents', 'write', '{"scope": "all"}'),
  ('admin', 'documents', 'update', '{"scope": "all"}'),
  ('admin', 'documents', 'delete', '{"scope": "all"}'),
  ('admin', 'delivery_receipts', 'read', '{"scope": "all"}'),
  ('admin', 'delivery_receipts', 'write', '{"scope": "all"}'),
  ('admin', 'delivery_receipts', 'update', '{"scope": "all"}'),
  ('admin', 'delivery_receipts', 'delete', '{"scope": "all"}'),
  
  -- Supplier Management
  ('admin', 'suppliers', 'read', '{"scope": "all"}'),
  ('admin', 'suppliers', 'write', '{"scope": "all"}'),
  ('admin', 'suppliers', 'update', '{"scope": "all"}'),
  ('admin', 'suppliers', 'delete', '{"scope": "all"}'),
  
  -- System Management
  ('admin', 'system_logs', 'read', '{"scope": "all"}'),
  ('admin', 'system_logs', 'write', '{"scope": "all"}'),
  ('admin', 'audit_logs', 'read', '{"scope": "all"}'),
  ('admin', 'user_activity_logs', 'read', '{"scope": "all"}'),
  ('admin', 'security_events', 'read', '{"scope": "all"}'),
  ('admin', 'security_events', 'write', '{"scope": "all"}'),
  ('admin', 'security_events', 'update', '{"scope": "all"}'),
  
  -- Approval Management
  ('admin', 'approval_chains', 'read', '{"scope": "all"}'),
  ('admin', 'approval_chains', 'write', '{"scope": "all"}'),
  ('admin', 'approval_chains', 'update', '{"scope": "all"}'),
  ('admin', 'approval_chains', 'delete', '{"scope": "all"}'),
  ('admin', 'approval_delegates', 'read', '{"scope": "all"}'),
  ('admin', 'approval_delegates', 'write', '{"scope": "all"}'),
  ('admin', 'approval_delegates', 'update', '{"scope": "all"}'),
  ('admin', 'approval_delegates', 'delete', '{"scope": "all"}'),
  ('admin', 'approval_history', 'read', '{"scope": "all"}'),
  ('admin', 'approval_audit_trail', 'read', '{"scope": "all"}'),
  ('admin', 'approval_audit_trail', 'write', '{"scope": "all"}'),
  
  -- Role Management
  ('admin', 'role_permissions', 'read', '{"scope": "all"}'),
  ('admin', 'role_permissions', 'write', '{"scope": "all"}'),
  ('admin', 'role_permissions', 'update', '{"scope": "all"}'),
  ('admin', 'role_permissions', 'delete', '{"scope": "all"}'),
  ('admin', 'role_hierarchies', 'read', '{"scope": "all"}'),
  ('admin', 'role_hierarchies', 'write', '{"scope": "all"}'),
  ('admin', 'role_hierarchies', 'update', '{"scope": "all"}'),
  ('admin', 'role_hierarchies', 'delete', '{"scope": "all"}'),
  
  -- Notification Management
  ('admin', 'notifications', 'read', '{"scope": "all"}'),
  ('admin', 'notifications', 'write', '{"scope": "all"}'),
  ('admin', 'notifications', 'update', '{"scope": "all"}'),
  ('admin', 'notifications', 'delete', '{"scope": "all"}'),
  ('admin', 'notification_preferences', 'read', '{"scope": "all"}'),
  ('admin', 'notification_preferences', 'write', '{"scope": "all"}'),
  ('admin', 'notification_preferences', 'update', '{"scope": "all"}'),
  ('admin', 'notification_preferences', 'delete', '{"scope": "all"}'),
  ('admin', 'notification_templates', 'read', '{"scope": "all"}'),
  ('admin', 'notification_templates', 'write', '{"scope": "all"}'),
  ('admin', 'notification_templates', 'update', '{"scope": "all"}'),
  ('admin', 'notification_templates', 'delete', '{"scope": "all"}'),
  ('admin', 'escalation_rules', 'read', '{"scope": "all"}'),
  ('admin', 'escalation_rules', 'write', '{"scope": "all"}'),
  ('admin', 'escalation_rules', 'update', '{"scope": "all"}'),
  ('admin', 'escalation_rules', 'delete', '{"scope": "all"}'),
  
  -- Analytics & Reporting
  ('admin', 'dashboard_metrics', 'read', '{"scope": "all"}'),
  ('admin', 'dashboard_metrics', 'write', '{"scope": "all"}'),
  ('admin', 'performance_metrics', 'read', '{"scope": "all"}'),
  ('admin', 'performance_metrics', 'write', '{"scope": "all"}'),
  ('admin', 'compliance_reports', 'read', '{"scope": "all"}'),
  ('admin', 'compliance_reports', 'write', '{"scope": "all"}'),
  ('admin', 'reports', 'read', '{"scope": "all"}'),
  ('admin', 'reports', 'write', '{"scope": "all"}'),
  ('admin', 'reports', 'update', '{"scope": "all"}'),
  ('admin', 'reports', 'delete', '{"scope": "all"}');

-- =============================================
-- MANAGER ROLE PERMISSIONS
-- =============================================

-- Manager has department-level oversight and approval authority
INSERT INTO public.role_permissions (role, table_name, permission, conditions) VALUES
  -- User Management (Department level)
  ('manager', 'users', 'read', '{"scope": "department", "department_field": "department"}'),
  ('manager', 'users', 'update', '{"scope": "department", "department_field": "department", "fields": ["is_authorized", "department"]}'),
  
  -- Inventory Management
  ('manager', 'inventory', 'read', '{"scope": "all"}'),
  ('manager', 'inventory', 'write', '{"scope": "all"}'),
  ('manager', 'inventory', 'update', '{"scope": "all"}'),
  ('manager', 'inventory_changes', 'read', '{"scope": "all"}'),
  ('manager', 'inventory_changes', 'write', '{"scope": "all"}'),
  ('manager', 'inventory_changes', 'update', '{"scope": "all"}'),
  ('manager', 'inventory_changes', 'approve', '{"scope": "all"}'),
  
  -- Purchase Management
  ('manager', 'purchase_orders', 'read', '{"scope": "all"}'),
  ('manager', 'purchase_orders', 'write', '{"scope": "all"}'),
  ('manager', 'purchase_orders', 'update', '{"scope": "all"}'),
  ('manager', 'purchase_requests', 'read', '{"scope": "all"}'),
  ('manager', 'purchase_requests', 'write', '{"scope": "all"}'),
  ('manager', 'purchase_requests', 'update', '{"scope": "all"}'),
  ('manager', 'purchase_requests', 'approve', '{"scope": "all"}'),
  
  -- Project Management (Read-only)
  ('manager', 'projects', 'read', '{"scope": "all"}'),
  ('manager', 'staff_assignments', 'read', '{"scope": "all"}'),
  
  -- Asset Management (Read-only)
  ('manager', 'assets', 'read', '{"scope": "all"}'),
  ('manager', 'maintenance_logs', 'read', '{"scope": "all"}'),
  ('manager', 'maintenance_schedule', 'read', '{"scope": "all"}'),
  
  -- Document Management (Read-only)
  ('manager', 'documents', 'read', '{"scope": "all"}'),
  ('manager', 'delivery_receipts', 'read', '{"scope": "all"}'),
  
  -- Supplier Management (Read-only)
  ('manager', 'suppliers', 'read', '{"scope": "all"}'),
  
  -- System Management (Limited)
  ('manager', 'system_logs', 'read', '{"scope": "department", "department_field": "department"}'),
  
  -- Approval Management
  ('manager', 'approval_chains', 'read', '{"scope": "all"}'),
  ('manager', 'approval_delegates', 'read', '{"scope": "all"}'),
  ('manager', 'approval_delegates', 'write', '{"scope": "own_delegation"}'),
  ('manager', 'approval_history', 'read', '{"scope": "all"}'),
  ('manager', 'approval_audit_trail', 'read', '{"scope": "all"}'),
  ('manager', 'approval_audit_trail', 'write', '{"scope": "own_actions"}'),
  
  -- Notification Management
  ('manager', 'notifications', 'read', '{"scope": "all"}'),
  ('manager', 'notifications', 'write', '{"scope": "all"}'),
  ('manager', 'notifications', 'update', '{"scope": "all"}'),
  ('manager', 'notification_preferences', 'read', '{"scope": "own"}'),
  ('manager', 'notification_preferences', 'write', '{"scope": "own"}'),
  ('manager', 'notification_preferences', 'update', '{"scope": "own"}'),
  ('manager', 'notification_templates', 'read', '{"scope": "all"}'),
  ('manager', 'escalation_rules', 'read', '{"scope": "all"}'),
  
  -- Analytics & Reporting
  ('manager', 'dashboard_metrics', 'read', '{"scope": "all"}'),
  ('manager', 'performance_metrics', 'read', '{"scope": "department", "department_field": "department"}'),
  ('manager', 'compliance_reports', 'read', '{"scope": "all"}'),
  ('manager', 'reports', 'read', '{"scope": "all"}'),
  ('manager', 'reports', 'write', '{"scope": "all"}');

-- =============================================
-- EMPLOYEE ROLE PERMISSIONS
-- =============================================

-- Employee has basic access with request/change capabilities
INSERT INTO public.role_permissions (role, table_name, permission, conditions) VALUES
  -- User Management (Own data only)
  ('employee', 'users', 'read', '{"scope": "own"}'),
  ('employee', 'users', 'update', '{"scope": "own", "fields": ["full_name", "email"]}'),
  
  -- Inventory Management (Read and request changes)
  ('employee', 'inventory', 'read', '{"scope": "all"}'),
  ('employee', 'inventory_changes', 'read', '{"scope": "own_requests"}'),
  ('employee', 'inventory_changes', 'write', '{"scope": "own_requests"}'),
  
  -- Purchase Management (Request only)
  ('employee', 'purchase_orders', 'read', '{"scope": "all"}'),
  ('employee', 'purchase_requests', 'read', '{"scope": "own_requests"}'),
  ('employee', 'purchase_requests', 'write', '{"scope": "own_requests"}'),
  
  -- Project Management (Read-only)
  ('employee', 'projects', 'read', '{"scope": "all"}'),
  ('employee', 'staff_assignments', 'read', '{"scope": "own_assignments"}'),
  
  -- Asset Management (Read-only)
  ('employee', 'assets', 'read', '{"scope": "all"}'),
  ('employee', 'maintenance_logs', 'read', '{"scope": "all"}'),
  ('employee', 'maintenance_schedule', 'read', '{"scope": "all"}'),
  
  -- Document Management (Read-only)
  ('employee', 'documents', 'read', '{"scope": "all"}'),
  ('employee', 'delivery_receipts', 'read', '{"scope": "all"}'),
  
  -- Supplier Management (Read-only)
  ('employee', 'suppliers', 'read', '{"scope": "all"}'),
  
  -- System Management (Own activity only)
  ('employee', 'system_logs', 'read', '{"scope": "own_activity"}'),
  
  -- Approval Management (Own requests only)
  ('employee', 'approval_history', 'read', '{"scope": "own_requests"}'),
  ('employee', 'approval_audit_trail', 'read', '{"scope": "own_requests"}'),
  
  -- Notification Management
  ('employee', 'notifications', 'read', '{"scope": "own"}'),
  ('employee', 'notifications', 'update', '{"scope": "own"}'),
  ('employee', 'notification_preferences', 'read', '{"scope": "own"}'),
  ('employee', 'notification_preferences', 'write', '{"scope": "own"}'),
  ('employee', 'notification_preferences', 'update', '{"scope": "own"}'),
  
  -- Analytics & Reporting (Limited)
  ('employee', 'dashboard_metrics', 'read', '{"scope": "basic_metrics"}'),
  ('employee', 'performance_metrics', 'read', '{"scope": "own"}'),
  ('employee', 'reports', 'read', '{"scope": "public_reports"}');

-- =============================================
-- PROCUREMENT ROLE PERMISSIONS
-- =============================================

-- Procurement has supplier and purchase order management
INSERT INTO public.role_permissions (role, table_name, permission, conditions) VALUES
  -- User Management (Read-only)
  ('procurement', 'users', 'read', '{"scope": "all"}'),
  
  -- Inventory Management (Read and update for procurement)
  ('procurement', 'inventory', 'read', '{"scope": "all"}'),
  ('procurement', 'inventory', 'update', '{"scope": "all", "fields": ["quantity", "status", "location"]}'),
  ('procurement', 'inventory_changes', 'read', '{"scope": "all"}'),
  ('procurement', 'inventory_changes', 'write', '{"scope": "all"}'),
  ('procurement', 'inventory_changes', 'update', '{"scope": "all"}'),
  ('procurement', 'inventory_changes', 'approve', '{"scope": "all"}'),
  
  -- Purchase Management (Full access)
  ('procurement', 'purchase_orders', 'read', '{"scope": "all"}'),
  ('procurement', 'purchase_orders', 'write', '{"scope": "all"}'),
  ('procurement', 'purchase_orders', 'update', '{"scope": "all"}'),
  ('procurement', 'purchase_orders', 'delete', '{"scope": "all"}'),
  ('procurement', 'purchase_requests', 'read', '{"scope": "all"}'),
  ('procurement', 'purchase_requests', 'write', '{"scope": "all"}'),
  ('procurement', 'purchase_requests', 'update', '{"scope": "all"}'),
  ('procurement', 'purchase_requests', 'approve', '{"scope": "all"}'),
  
  -- Project Management (Read-only)
  ('procurement', 'projects', 'read', '{"scope": "all"}'),
  ('procurement', 'staff_assignments', 'read', '{"scope": "all"}'),
  
  -- Asset Management (Read-only)
  ('procurement', 'assets', 'read', '{"scope": "all"}'),
  ('procurement', 'maintenance_logs', 'read', '{"scope": "all"}'),
  ('procurement', 'maintenance_schedule', 'read', '{"scope": "all"}'),
  
  -- Document Management (Full access for procurement documents)
  ('procurement', 'documents', 'read', '{"scope": "all"}'),
  ('procurement', 'documents', 'write', '{"scope": "all"}'),
  ('procurement', 'documents', 'update', '{"scope": "all"}'),
  ('procurement', 'delivery_receipts', 'read', '{"scope": "all"}'),
  ('procurement', 'delivery_receipts', 'write', '{"scope": "all"}'),
  ('procurement', 'delivery_receipts', 'update', '{"scope": "all"}'),
  ('procurement', 'delivery_receipts', 'delete', '{"scope": "all"}'),
  
  -- Supplier Management (Full access)
  ('procurement', 'suppliers', 'read', '{"scope": "all"}'),
  ('procurement', 'suppliers', 'write', '{"scope": "all"}'),
  ('procurement', 'suppliers', 'update', '{"scope": "all"}'),
  ('procurement', 'suppliers', 'delete', '{"scope": "all"}'),
  
  -- System Management (Limited)
  ('procurement', 'system_logs', 'read', '{"scope": "procurement_related"}'),
  
  -- Approval Management
  ('procurement', 'approval_chains', 'read', '{"scope": "all"}'),
  ('procurement', 'approval_delegates', 'read', '{"scope": "all"}'),
  ('procurement', 'approval_history', 'read', '{"scope": "all"}'),
  ('procurement', 'approval_audit_trail', 'read', '{"scope": "all"}'),
  ('procurement', 'approval_audit_trail', 'write', '{"scope": "own_actions"}'),
  
  -- Notification Management
  ('procurement', 'notifications', 'read', '{"scope": "all"}'),
  ('procurement', 'notifications', 'write', '{"scope": "all"}'),
  ('procurement', 'notifications', 'update', '{"scope": "all"}'),
  ('procurement', 'notification_preferences', 'read', '{"scope": "own"}'),
  ('procurement', 'notification_preferences', 'write', '{"scope": "own"}'),
  ('procurement', 'notification_preferences', 'update', '{"scope": "own"}'),
  ('procurement', 'notification_templates', 'read', '{"scope": "all"}'),
  ('procurement', 'escalation_rules', 'read', '{"scope": "all"}'),
  
  -- Analytics & Reporting
  ('procurement', 'dashboard_metrics', 'read', '{"scope": "all"}'),
  ('procurement', 'performance_metrics', 'read', '{"scope": "own"}'),
  ('procurement', 'compliance_reports', 'read', '{"scope": "all"}'),
  ('procurement', 'reports', 'read', '{"scope": "all"}'),
  ('procurement', 'reports', 'write', '{"scope": "all"}');

-- =============================================
-- PROJECT_MANAGER ROLE PERMISSIONS
-- =============================================

-- Project Manager has project-specific access and logistics approval
INSERT INTO public.role_permissions (role, table_name, permission, conditions) VALUES
  -- User Management (Read-only)
  ('project_manager', 'users', 'read', '{"scope": "all"}'),
  
  -- Inventory Management (Read and approve for projects)
  ('project_manager', 'inventory', 'read', '{"scope": "all"}'),
  ('project_manager', 'inventory_changes', 'read', '{"scope": "all"}'),
  ('project_manager', 'inventory_changes', 'approve', '{"scope": "project_related"}'),
  
  -- Purchase Management (Read and approve for projects)
  ('project_manager', 'purchase_orders', 'read', '{"scope": "all"}'),
  ('project_manager', 'purchase_requests', 'read', '{"scope": "all"}'),
  ('project_manager', 'purchase_requests', 'approve', '{"scope": "project_related"}'),
  
  -- Project Management (Full access)
  ('project_manager', 'projects', 'read', '{"scope": "all"}'),
  ('project_manager', 'projects', 'write', '{"scope": "all"}'),
  ('project_manager', 'projects', 'update', '{"scope": "all"}'),
  ('project_manager', 'projects', 'delete', '{"scope": "all"}'),
  ('project_manager', 'staff_assignments', 'read', '{"scope": "all"}'),
  ('project_manager', 'staff_assignments', 'write', '{"scope": "all"}'),
  ('project_manager', 'staff_assignments', 'update', '{"scope": "all"}'),
  ('project_manager', 'staff_assignments', 'delete', '{"scope": "all"}'),
  
  -- Asset Management (Read-only)
  ('project_manager', 'assets', 'read', '{"scope": "all"}'),
  ('project_manager', 'maintenance_logs', 'read', '{"scope": "all"}'),
  ('project_manager', 'maintenance_schedule', 'read', '{"scope": "all"}'),
  
  -- Document Management (Read-only)
  ('project_manager', 'documents', 'read', '{"scope": "all"}'),
  ('project_manager', 'delivery_receipts', 'read', '{"scope": "all"}'),
  
  -- Supplier Management (Read-only)
  ('project_manager', 'suppliers', 'read', '{"scope": "all"}'),
  
  -- System Management (Limited)
  ('project_manager', 'system_logs', 'read', '{"scope": "project_related"}'),
  
  -- Approval Management
  ('project_manager', 'approval_chains', 'read', '{"scope": "all"}'),
  ('project_manager', 'approval_delegates', 'read', '{"scope": "all"}'),
  ('project_manager', 'approval_history', 'read', '{"scope": "all"}'),
  ('project_manager', 'approval_audit_trail', 'read', '{"scope": "all"}'),
  ('project_manager', 'approval_audit_trail', 'write', '{"scope": "own_actions"}'),
  
  -- Notification Management
  ('project_manager', 'notifications', 'read', '{"scope": "all"}'),
  ('project_manager', 'notifications', 'write', '{"scope": "all"}'),
  ('project_manager', 'notifications', 'update', '{"scope": "all"}'),
  ('project_manager', 'notification_preferences', 'read', '{"scope": "own"}'),
  ('project_manager', 'notification_preferences', 'write', '{"scope": "own"}'),
  ('project_manager', 'notification_preferences', 'update', '{"scope": "own"}'),
  ('project_manager', 'notification_templates', 'read', '{"scope": "all"}'),
  ('project_manager', 'escalation_rules', 'read', '{"scope": "all"}'),
  
  -- Analytics & Reporting
  ('project_manager', 'dashboard_metrics', 'read', '{"scope": "all"}'),
  ('project_manager', 'performance_metrics', 'read', '{"scope": "own"}'),
  ('project_manager', 'compliance_reports', 'read', '{"scope": "all"}'),
  ('project_manager', 'reports', 'read', '{"scope": "all"}'),
  ('project_manager', 'reports', 'write', '{"scope": "all"}');

-- =============================================
-- MAINTENANCE ROLE PERMISSIONS
-- =============================================

-- Maintenance has asset lifecycle and maintenance scheduling
INSERT INTO public.role_permissions (role, table_name, permission, conditions) VALUES
  -- User Management (Read-only)
  ('maintenance', 'users', 'read', '{"scope": "all"}'),
  
  -- Inventory Management (Read-only)
  ('maintenance', 'inventory', 'read', '{"scope": "all"}'),
  ('maintenance', 'inventory_changes', 'read', '{"scope": "all"}'),
  
  -- Purchase Management (Read-only)
  ('maintenance', 'purchase_orders', 'read', '{"scope": "all"}'),
  ('maintenance', 'purchase_requests', 'read', '{"scope": "all"}'),
  
  -- Project Management (Read-only)
  ('maintenance', 'projects', 'read', '{"scope": "all"}'),
  ('maintenance', 'staff_assignments', 'read', '{"scope": "all"}'),
  
  -- Asset Management (Full access)
  ('maintenance', 'assets', 'read', '{"scope": "all"}'),
  ('maintenance', 'assets', 'write', '{"scope": "all"}'),
  ('maintenance', 'assets', 'update', '{"scope": "all"}'),
  ('maintenance', 'assets', 'delete', '{"scope": "all"}'),
  ('maintenance', 'maintenance_logs', 'read', '{"scope": "all"}'),
  ('maintenance', 'maintenance_logs', 'write', '{"scope": "all"}'),
  ('maintenance', 'maintenance_logs', 'update', '{"scope": "all"}'),
  ('maintenance', 'maintenance_logs', 'delete', '{"scope": "all"}'),
  ('maintenance', 'maintenance_schedule', 'read', '{"scope": "all"}'),
  ('maintenance', 'maintenance_schedule', 'write', '{"scope": "all"}'),
  ('maintenance', 'maintenance_schedule', 'update', '{"scope": "all"}'),
  ('maintenance', 'maintenance_schedule', 'delete', '{"scope": "all"}'),
  
  -- Document Management (Maintenance documents only)
  ('maintenance', 'documents', 'read', '{"scope": "maintenance_related"}'),
  ('maintenance', 'documents', 'write', '{"scope": "maintenance_related"}'),
  ('maintenance', 'documents', 'update', '{"scope": "maintenance_related"}'),
  ('maintenance', 'delivery_receipts', 'read', '{"scope": "all"}'),
  
  -- Supplier Management (Read-only)
  ('maintenance', 'suppliers', 'read', '{"scope": "all"}'),
  
  -- System Management (Limited)
  ('maintenance', 'system_logs', 'read', '{"scope": "maintenance_related"}'),
  
  -- Approval Management
  ('maintenance', 'approval_chains', 'read', '{"scope": "all"}'),
  ('maintenance', 'approval_delegates', 'read', '{"scope": "all"}'),
  ('maintenance', 'approval_history', 'read', '{"scope": "all"}'),
  ('maintenance', 'approval_audit_trail', 'read', '{"scope": "all"}'),
  ('maintenance', 'approval_audit_trail', 'write', '{"scope": "own_actions"}'),
  
  -- Notification Management
  ('maintenance', 'notifications', 'read', '{"scope": "all"}'),
  ('maintenance', 'notifications', 'write', '{"scope": "all"}'),
  ('maintenance', 'notifications', 'update', '{"scope": "all"}'),
  ('maintenance', 'notification_preferences', 'read', '{"scope": "own"}'),
  ('maintenance', 'notification_preferences', 'write', '{"scope": "own"}'),
  ('maintenance', 'notification_preferences', 'update', '{"scope": "own"}'),
  ('maintenance', 'notification_templates', 'read', '{"scope": "all"}'),
  ('maintenance', 'escalation_rules', 'read', '{"scope": "all"}'),
  
  -- Analytics & Reporting
  ('maintenance', 'dashboard_metrics', 'read', '{"scope": "all"}'),
  ('maintenance', 'performance_metrics', 'read', '{"scope": "own"}'),
  ('maintenance', 'compliance_reports', 'read', '{"scope": "all"}'),
  ('maintenance', 'reports', 'read', '{"scope": "all"}'),
  ('maintenance', 'reports', 'write', '{"scope": "all"}');

-- =============================================
-- DOCUMENT_ANALYST ROLE PERMISSIONS
-- =============================================

-- Document Analyst has document verification and archival
INSERT INTO public.role_permissions (role, table_name, permission, conditions) VALUES
  -- User Management (Read-only)
  ('document_analyst', 'users', 'read', '{"scope": "all"}'),
  
  -- Inventory Management (Read-only)
  ('document_analyst', 'inventory', 'read', '{"scope": "all"}'),
  ('document_analyst', 'inventory_changes', 'read', '{"scope": "all"}'),
  
  -- Purchase Management (Read-only)
  ('document_analyst', 'purchase_orders', 'read', '{"scope": "all"}'),
  ('document_analyst', 'purchase_requests', 'read', '{"scope": "all"}'),
  
  -- Project Management (Read-only)
  ('document_analyst', 'projects', 'read', '{"scope": "all"}'),
  ('document_analyst', 'staff_assignments', 'read', '{"scope": "all"}'),
  
  -- Asset Management (Read-only)
  ('document_analyst', 'assets', 'read', '{"scope": "all"}'),
  ('document_analyst', 'maintenance_logs', 'read', '{"scope": "all"}'),
  ('document_analyst', 'maintenance_schedule', 'read', '{"scope": "all"}'),
  
  -- Document Management (Full access)
  ('document_analyst', 'documents', 'read', '{"scope": "all"}'),
  ('document_analyst', 'documents', 'write', '{"scope": "all"}'),
  ('document_analyst', 'documents', 'update', '{"scope": "all"}'),
  ('document_analyst', 'documents', 'delete', '{"scope": "all"}'),
  ('document_analyst', 'delivery_receipts', 'read', '{"scope": "all"}'),
  ('document_analyst', 'delivery_receipts', 'write', '{"scope": "all"}'),
  ('document_analyst', 'delivery_receipts', 'update', '{"scope": "all"}'),
  ('document_analyst', 'delivery_receipts', 'delete', '{"scope": "all"}'),
  
  -- Supplier Management (Read-only)
  ('document_analyst', 'suppliers', 'read', '{"scope": "all"}'),
  
  -- System Management (Limited)
  ('document_analyst', 'system_logs', 'read', '{"scope": "document_related"}'),
  
  -- Approval Management
  ('document_analyst', 'approval_chains', 'read', '{"scope": "all"}'),
  ('document_analyst', 'approval_delegates', 'read', '{"scope": "all"}'),
  ('document_analyst', 'approval_history', 'read', '{"scope": "all"}'),
  ('document_analyst', 'approval_audit_trail', 'read', '{"scope": "all"}'),
  ('document_analyst', 'approval_audit_trail', 'write', '{"scope": "own_actions"}'),
  
  -- Notification Management
  ('document_analyst', 'notifications', 'read', '{"scope": "all"}'),
  ('document_analyst', 'notifications', 'write', '{"scope": "all"}'),
  ('document_analyst', 'notifications', 'update', '{"scope": "all"}'),
  ('document_analyst', 'notification_preferences', 'read', '{"scope": "own"}'),
  ('document_analyst', 'notification_preferences', 'write', '{"scope": "own"}'),
  ('document_analyst', 'notification_preferences', 'update', '{"scope": "own"}'),
  ('document_analyst', 'notification_templates', 'read', '{"scope": "all"}'),
  ('document_analyst', 'escalation_rules', 'read', '{"scope": "all"}'),
  
  -- Analytics & Reporting
  ('document_analyst', 'dashboard_metrics', 'read', '{"scope": "all"}'),
  ('document_analyst', 'performance_metrics', 'read', '{"scope": "own"}'),
  ('document_analyst', 'compliance_reports', 'read', '{"scope": "all"}'),
  ('document_analyst', 'compliance_reports', 'write', '{"scope": "all"}'),
  ('document_analyst', 'reports', 'read', '{"scope": "all"}'),
  ('document_analyst', 'reports', 'write', '{"scope": "all"}');

-- =============================================
-- ROLE HIERARCHY DEFINITIONS
-- =============================================

-- Define role hierarchies for delegation and escalation
INSERT INTO public.role_hierarchies (parent_role, child_role, can_delegate) VALUES
  ('admin', 'manager', true),
  ('admin', 'project_manager', true),
  ('admin', 'procurement', true),
  ('admin', 'maintenance', true),
  ('admin', 'document_analyst', true),
  ('admin', 'employee', true),
  ('manager', 'employee', true),
  ('project_manager', 'employee', true),
  ('procurement', 'employee', true),
  ('maintenance', 'employee', true),
  ('document_analyst', 'employee', true);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT 'Role permissions matrix created successfully!' as message,
       'All 7 roles have been configured with appropriate permissions.' as details,
       'Permission matrix includes granular access control and delegation capabilities.' as status;
