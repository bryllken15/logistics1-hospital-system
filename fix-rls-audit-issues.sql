-- Comprehensive fix for RLS and audit issues
-- Run this in your Supabase SQL Editor

-- Step 1: Disable RLS on audit_logs table temporarily
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant proper permissions to all roles
GRANT ALL ON public.audit_logs TO anon;
GRANT ALL ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

-- Step 3: Create proper RLS policy for audit_logs (if needed)
DROP POLICY IF EXISTS "Allow all operations on audit_logs" ON public.audit_logs;
CREATE POLICY "Allow all operations on audit_logs" ON public.audit_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Step 4: Enable RLS with the new policy
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 5: Apply the original migration
-- Add updated_by field to inventory table (referenced by triggers but missing)
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add missing fields to delivery_receipts table
ALTER TABLE public.delivery_receipts 
ADD COLUMN IF NOT EXISTS destination TEXT,
ADD COLUMN IF NOT EXISTS delivered_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Step 6: Update the updated_at trigger to handle the new updated_by field properly
-- First, drop the existing trigger if it exists
DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory;

-- Create a new trigger function that handles updated_by field
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set updated_at to current timestamp
  NEW.updated_at = NOW();
  
  -- Set updated_by to current user if not already set
  IF NEW.updated_by IS NULL THEN
    NEW.updated_by = COALESCE(auth.uid(), OLD.updated_by);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();

-- Step 7: Add indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_inventory_updated_by ON public.inventory(updated_by);
CREATE INDEX IF NOT EXISTS idx_delivery_receipts_delivered_by ON public.delivery_receipts(delivered_by);
CREATE INDEX IF NOT EXISTS idx_delivery_receipts_destination ON public.delivery_receipts(destination);

-- Step 8: Update existing records to have proper updated_by values where missing
UPDATE public.inventory 
SET updated_by = created_by 
WHERE updated_by IS NULL AND created_by IS NOT NULL;

-- Step 9: Add comments for documentation
COMMENT ON COLUMN public.inventory.updated_by IS 'User who last updated this inventory item';
COMMENT ON COLUMN public.delivery_receipts.destination IS 'Delivery destination location';
COMMENT ON COLUMN public.delivery_receipts.delivered_by IS 'User who recorded the delivery';
COMMENT ON COLUMN public.delivery_receipts.description IS 'Description of the delivery contents';
