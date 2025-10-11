-- Fix Assets Table Permissions
-- This script specifically addresses the permission denied error for the assets table

-- 1. Enable Row Level Security on assets table
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON assets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON assets;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON assets;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON assets;

-- 3. Create comprehensive RLS policies for assets table
CREATE POLICY "Enable read access for authenticated users" 
  ON assets FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable insert for authenticated users" 
  ON assets FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
  ON assets FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable delete for authenticated users" 
  ON assets FOR DELETE 
  TO authenticated 
  USING (true);

-- 4. Enable realtime for assets table
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE assets;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already in publication, continue
    END;
END $$;

-- 5. Add missing columns to assets table (if they don't exist)
ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_type TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS purchase_cost DECIMAL(10,2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS criticality TEXT DEFAULT 'medium';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS qr_code_data TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_rfid_code ON assets(rfid_code);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);

-- 7. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Add updated_at trigger to assets table
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at 
  BEFORE UPDATE ON assets 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Verify the setup
SELECT 
  'Assets table permissions configured successfully' as status,
  COUNT(*) as existing_assets
FROM assets;
