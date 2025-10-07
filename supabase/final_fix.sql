-- Final Fix for Permission Issues
-- This script removes all RLS policies and grants proper permissions

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "All authenticated users can read inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authorized users can modify inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can read purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Procurement users can manage purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Users can read purchase requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Users can create purchase requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Managers can approve purchase requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Users can read projects" ON public.projects;
DROP POLICY IF EXISTS "Project managers can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Users can read assets" ON public.assets;
DROP POLICY IF EXISTS "Maintenance users can manage assets" ON public.assets;
DROP POLICY IF EXISTS "Users can read documents" ON public.documents;
DROP POLICY IF EXISTS "Document analysts can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Users can read system logs" ON public.system_logs;
DROP POLICY IF EXISTS "System can insert logs" ON public.system_logs;
DROP POLICY IF EXISTS "Users can read delivery receipts" ON public.delivery_receipts;
DROP POLICY IF EXISTS "Authorized users can manage delivery receipts" ON public.delivery_receipts;
DROP POLICY IF EXISTS "Users can read maintenance logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Maintenance users can manage maintenance logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Users can read suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Procurement users can manage suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Disable RLS on all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.inventory TO authenticated;
GRANT ALL ON public.purchase_orders TO authenticated;
GRANT ALL ON public.purchase_requests TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.assets TO authenticated;
GRANT ALL ON public.documents TO authenticated;
GRANT ALL ON public.system_logs TO authenticated;
GRANT ALL ON public.delivery_receipts TO authenticated;
GRANT ALL ON public.maintenance_logs TO authenticated;
GRANT ALL ON public.suppliers TO authenticated;
GRANT ALL ON public.staff_assignments TO authenticated;
GRANT ALL ON public.inventory_changes TO authenticated;
GRANT ALL ON public.maintenance_schedule TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.reports TO authenticated;

-- Grant permissions to anon users (for public access)
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.inventory TO anon;
GRANT ALL ON public.purchase_orders TO anon;
GRANT ALL ON public.purchase_requests TO anon;
GRANT ALL ON public.projects TO anon;
GRANT ALL ON public.assets TO anon;
GRANT ALL ON public.documents TO anon;
GRANT ALL ON public.system_logs TO anon;
GRANT ALL ON public.delivery_receipts TO anon;
GRANT ALL ON public.maintenance_logs TO anon;
GRANT ALL ON public.suppliers TO anon;
GRANT ALL ON public.staff_assignments TO anon;
GRANT ALL ON public.inventory_changes TO anon;
GRANT ALL ON public.maintenance_schedule TO anon;
GRANT ALL ON public.notifications TO anon;
GRANT ALL ON public.reports TO anon;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO anon;
