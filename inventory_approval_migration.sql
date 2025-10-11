-- Inventory Approval Workflow Migration
-- This script adds the necessary tables and fields for inventory approval workflow

-- Add unit_price column to inventory table if it doesn't exist
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0;

-- Add created_by column to inventory table if it doesn't exist
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Create inventory_approvals table
CREATE TABLE IF NOT EXISTS public.inventory_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) DEFAULT 0,
  total_value DECIMAL(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  manager_approved BOOLEAN DEFAULT false,
  manager_approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  manager_approved_at TIMESTAMP WITH TIME ZONE,
  project_manager_approved BOOLEAN DEFAULT false,
  project_manager_approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  project_manager_approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_status ON public.inventory_approvals(status);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_inventory_id ON public.inventory_approvals(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_requested_by ON public.inventory_approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_created_at ON public.inventory_approvals(created_at);

-- Add updated_at trigger for inventory_approvals
CREATE TRIGGER IF NOT EXISTS update_inventory_approvals_updated_at 
  BEFORE UPDATE ON public.inventory_approvals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for inventory_approvals table
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_approvals;

-- Insert sample inventory approval data
INSERT INTO public.inventory_approvals (
  inventory_id,
  item_name,
  quantity,
  unit_price,
  total_value,
  status,
  requested_by
) VALUES (
  (SELECT id FROM public.inventory LIMIT 1),
  'Sample Medical Supply',
  100,
  25.50,
  2550.00,
  'pending',
  (SELECT id FROM public.users WHERE role = 'employee' LIMIT 1)
);

-- Update inventory table to include unit_price in existing records
UPDATE public.inventory 
SET unit_price = CASE 
  WHEN item_name LIKE '%Mask%' THEN 50.00
  WHEN item_name LIKE '%Glove%' THEN 25.00
  WHEN item_name LIKE '%Solution%' THEN 30.00
  WHEN item_name LIKE '%Bandage%' THEN 15.00
  WHEN item_name LIKE '%Syringe%' THEN 20.00
  WHEN item_name LIKE '%Thermometer%' THEN 150.00
  ELSE 0.00
END
WHERE unit_price = 0 OR unit_price IS NULL;
