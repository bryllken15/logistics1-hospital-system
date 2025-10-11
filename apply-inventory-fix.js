// Apply Inventory Schema Fix
// This script provides the SQL commands to fix the inventory schema

console.log('🔧 INVENTORY SCHEMA FIX WITH REAL-TIME APPROVAL WORKFLOW')
console.log('========================================================')
console.log('')
console.log('📋 COPY THIS SCRIPT TO SUPABASE SQL EDITOR:')
console.log('============================================')
console.log('')

const sqlScript = `-- Fix Inventory Schema - Add Missing Columns
-- This script adds the unit_price and created_by columns to the inventory table
-- and creates the inventory_approvals table for the approval workflow

-- Add unit_price column to inventory table
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0;

-- Add created_by column to inventory table
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Create inventory_approvals table for approval workflow
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

-- Create trigger function to automatically create approval requests
CREATE OR REPLACE FUNCTION create_inventory_approval_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create approval request if the inventory item is in pending_approval status
  IF NEW.status = 'pending_approval' THEN
    INSERT INTO public.inventory_approvals (
      inventory_id,
      item_name,
      quantity,
      unit_price,
      total_value,
      status,
      requested_by
    ) VALUES (
      NEW.id,
      NEW.item_name,
      NEW.quantity,
      NEW.unit_price,
      NEW.quantity * NEW.unit_price,
      'pending',
      NEW.created_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create approval requests when inventory items are inserted
DROP TRIGGER IF EXISTS trigger_create_inventory_approval ON public.inventory;
CREATE TRIGGER trigger_create_inventory_approval
  AFTER INSERT ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION create_inventory_approval_request();

-- Add updated_at trigger for inventory_approvals
-- Drop trigger if it exists first, then create it
DROP TRIGGER IF EXISTS update_inventory_approvals_updated_at ON public.inventory_approvals;
CREATE TRIGGER update_inventory_approvals_updated_at 
  BEFORE UPDATE ON public.inventory_approvals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for inventory_approvals table
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_approvals;

-- Update existing inventory records with unit_price values
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

-- Grant permissions for inventory_approvals table
GRANT ALL ON public.inventory_approvals TO authenticated;
GRANT ALL ON public.inventory_approvals TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;`

console.log(sqlScript)
console.log('')
console.log('============================================')
console.log('')
console.log('📝 STEPS TO FIX THE ERROR:')
console.log('1. Open: https://supabase.com/dashboard')
console.log('2. Select your project')
console.log('3. Click "SQL Editor" in the left sidebar')
console.log('4. Copy the script above')
console.log('5. Paste it into the SQL Editor')
console.log('6. Click "Run" button')
console.log('7. Go back to your app')
console.log('8. Try creating an inventory item again')
console.log('')
console.log('✅ This will fix the "unit_price column not found" error!')
console.log('✅ Real-time inventory approval workflow will work!')
console.log('✅ Manager and Project Manager dashboards will show approvals!')
console.log('✅ Automatic approval requests when inventory items are created!')
console.log('✅ Real-time synchronization between inventory and approvals tables!')
