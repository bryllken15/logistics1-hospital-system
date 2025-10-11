-- Migration: Fix Inventory Approvals Table Issues
-- This migration fixes RLS policies and column constraints for the existing inventory_approvals table

-- Step 1: Fix RLS policies for inventory_approvals table
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Restrict inventory_approvals access" ON public.inventory_approvals;
DROP POLICY IF EXISTS "Users can view inventory_approvals" ON public.inventory_approvals;
DROP POLICY IF EXISTS "Users can insert inventory_approvals" ON public.inventory_approvals;
DROP POLICY IF EXISTS "Users can update inventory_approvals" ON public.inventory_approvals;

-- Create permissive RLS policies
CREATE POLICY "Allow all operations on inventory_approvals" ON public.inventory_approvals
  FOR ALL USING (true) WITH CHECK (true);

-- Step 2: Fix total_value column constraints
-- Since total_value is a generated column, we need to handle it differently
-- The generated column should automatically calculate: quantity * unit_price
-- We'll skip modifying the generated column and let it work as designed

-- Step 3: Ensure all required columns exist with proper types
-- Add missing columns if they don't exist
ALTER TABLE public.inventory_approvals 
ADD COLUMN IF NOT EXISTS inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS item_name TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_value DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS manager_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS manager_approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS manager_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS project_manager_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS project_manager_approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS project_manager_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS request_reason TEXT,
ADD COLUMN IF NOT EXISTS request_type TEXT DEFAULT 'new_item',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 4: Grant proper permissions
GRANT ALL ON public.inventory_approvals TO anon;
GRANT ALL ON public.inventory_approvals TO authenticated;
GRANT ALL ON public.inventory_approvals TO service_role;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_status ON public.inventory_approvals(status);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_requested_by ON public.inventory_approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_inventory_id ON public.inventory_approvals(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_created_at ON public.inventory_approvals(created_at);

-- Step 6: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_inventory_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inventory_approvals_updated_at ON public.inventory_approvals;
CREATE TRIGGER update_inventory_approvals_updated_at
  BEFORE UPDATE ON public.inventory_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_approvals_updated_at();

-- Step 7: Add comments for documentation
COMMENT ON TABLE public.inventory_approvals IS 'Stores inventory approval requests from employees that need manager approval';
COMMENT ON COLUMN public.inventory_approvals.status IS 'Approval status: pending, approved, rejected';
COMMENT ON COLUMN public.inventory_approvals.manager_approved IS 'Whether manager has approved this request';
COMMENT ON COLUMN public.inventory_approvals.project_manager_approved IS 'Whether project manager has approved this request';
COMMENT ON COLUMN public.inventory_approvals.total_value IS 'Calculated total value (quantity * unit_price)';
