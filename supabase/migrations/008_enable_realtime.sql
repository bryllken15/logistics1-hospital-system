-- Enable real-time for all tables
-- This migration ensures all tables are properly configured for real-time subscriptions

-- Enable real-time for users table
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Enable real-time for inventory table
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;

-- Enable real-time for purchase_orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;

-- Enable real-time for projects table
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Enable real-time for assets table
ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;

-- Enable real-time for documents table
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;

-- Enable real-time for purchase_requests table
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_requests;

-- Enable real-time for maintenance_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_logs;

-- Enable real-time for delivery_receipts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_receipts;

-- Enable real-time for system_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;

-- Enable real-time for inventory_changes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_changes;

-- Enable real-time for maintenance_schedule table
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_schedule;

-- Enable real-time for staff_assignments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_assignments;

-- Enable real-time for suppliers table
ALTER PUBLICATION supabase_realtime ADD TABLE public.suppliers;

-- Enable real-time for reports table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
