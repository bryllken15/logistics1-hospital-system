-- Update existing maintenance tables with missing columns
-- This migration adds missing columns to existing tables

-- 1. Add missing columns to assets table
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

-- 2. Add missing columns to maintenance_logs table
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS scheduled_date DATE;
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS completed_date DATE;
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS performed_by UUID REFERENCES users(id);
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Add missing columns to maintenance_work_orders table (if any are missing)
-- Note: This table seems to have most columns already

-- 4. Add missing columns to spare_parts table (if any are missing)
-- Note: This table seems to have most columns already

-- 5. Add missing columns to maintenance_schedule table
ALTER TABLE maintenance_schedule ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(id) ON DELETE CASCADE;
ALTER TABLE maintenance_schedule ADD COLUMN IF NOT EXISTS schedule_type TEXT NOT NULL;
ALTER TABLE maintenance_schedule ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL;
ALTER TABLE maintenance_schedule ADD COLUMN IF NOT EXISTS last_maintenance_date DATE;
ALTER TABLE maintenance_schedule ADD COLUMN IF NOT EXISTS next_maintenance_date DATE;
ALTER TABLE maintenance_schedule ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);
ALTER TABLE maintenance_schedule ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE maintenance_schedule ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE maintenance_schedule ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);
ALTER TABLE maintenance_schedule ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE maintenance_schedule ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security (if not already enabled)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedule ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Assets (only if they don't exist)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON assets;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON assets;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON assets;
    DROP POLICY IF EXISTS "Enable delete for authenticated users" ON assets;
    
    -- Create new policies
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
END $$;

-- Create RLS Policies for Maintenance Logs
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_logs;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON maintenance_logs;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON maintenance_logs;
    DROP POLICY IF EXISTS "Enable delete for authenticated users" ON maintenance_logs;
    
    CREATE POLICY "Enable read access for authenticated users" 
      ON maintenance_logs FOR SELECT 
      TO authenticated 
      USING (true);

    CREATE POLICY "Enable insert for authenticated users" 
      ON maintenance_logs FOR INSERT 
      TO authenticated 
      WITH CHECK (true);

    CREATE POLICY "Enable update for authenticated users" 
      ON maintenance_logs FOR UPDATE 
      TO authenticated 
      USING (true);

    CREATE POLICY "Enable delete for authenticated users" 
      ON maintenance_logs FOR DELETE 
      TO authenticated 
      USING (true);
END $$;

-- Create RLS Policies for Work Orders
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_work_orders;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON maintenance_work_orders;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON maintenance_work_orders;
    DROP POLICY IF EXISTS "Enable delete for authenticated users" ON maintenance_work_orders;
    
    CREATE POLICY "Enable read access for authenticated users" 
      ON maintenance_work_orders FOR SELECT 
      TO authenticated 
      USING (true);

    CREATE POLICY "Enable insert for authenticated users" 
      ON maintenance_work_orders FOR INSERT 
      TO authenticated 
      WITH CHECK (true);

    CREATE POLICY "Enable update for authenticated users" 
      ON maintenance_work_orders FOR UPDATE 
      TO authenticated 
      USING (true);

    CREATE POLICY "Enable delete for authenticated users" 
      ON maintenance_work_orders FOR DELETE 
      TO authenticated 
      USING (true);
END $$;

-- Create RLS Policies for Spare Parts
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON spare_parts;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON spare_parts;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON spare_parts;
    DROP POLICY IF EXISTS "Enable delete for authenticated users" ON spare_parts;
    
    CREATE POLICY "Enable read access for authenticated users" 
      ON spare_parts FOR SELECT 
      TO authenticated 
      USING (true);

    CREATE POLICY "Enable insert for authenticated users" 
      ON spare_parts FOR INSERT 
      TO authenticated 
      WITH CHECK (true);

    CREATE POLICY "Enable update for authenticated users" 
      ON spare_parts FOR UPDATE 
      TO authenticated 
      USING (true);

    CREATE POLICY "Enable delete for authenticated users" 
      ON spare_parts FOR DELETE 
      TO authenticated 
      USING (true);
END $$;

-- Create RLS Policies for Maintenance Schedule
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_schedule;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON maintenance_schedule;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON maintenance_schedule;
    DROP POLICY IF EXISTS "Enable delete for authenticated users" ON maintenance_schedule;
    
    CREATE POLICY "Enable read access for authenticated users" 
      ON maintenance_schedule FOR SELECT 
      TO authenticated 
      USING (true);

    CREATE POLICY "Enable insert for authenticated users" 
      ON maintenance_schedule FOR INSERT 
      TO authenticated 
      WITH CHECK (true);

    CREATE POLICY "Enable update for authenticated users" 
      ON maintenance_schedule FOR UPDATE 
      TO authenticated 
      USING (true);

    CREATE POLICY "Enable delete for authenticated users" 
      ON maintenance_schedule FOR DELETE 
      TO authenticated 
      USING (true);
END $$;

-- Enable Realtime for all tables (only if not already added)
DO $$
BEGIN
    -- Add to realtime publication only if not already added
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE assets;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already in publication, continue
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_logs;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already in publication, continue
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_work_orders;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already in publication, continue
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE spare_parts;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already in publication, continue
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_schedule;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already in publication, continue
    END;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_rfid_code ON assets(rfid_code);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_asset_id ON maintenance_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_status ON maintenance_logs(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_asset_id ON maintenance_work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON maintenance_work_orders(status);
CREATE INDEX IF NOT EXISTS idx_spare_parts_part_name ON spare_parts(part_name);
CREATE INDEX IF NOT EXISTS idx_spare_parts_category ON spare_parts(category);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_asset_id ON maintenance_schedule(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_next_date ON maintenance_schedule(next_maintenance_date);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables (only if they don't exist)
DO $$
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
    DROP TRIGGER IF EXISTS update_maintenance_logs_updated_at ON maintenance_logs;
    DROP TRIGGER IF EXISTS update_work_orders_updated_at ON maintenance_work_orders;
    DROP TRIGGER IF EXISTS update_spare_parts_updated_at ON spare_parts;
    DROP TRIGGER IF EXISTS update_maintenance_schedule_updated_at ON maintenance_schedule;
    
    -- Create new triggers
    CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_maintenance_logs_updated_at BEFORE UPDATE ON maintenance_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON maintenance_work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_spare_parts_updated_at BEFORE UPDATE ON spare_parts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_maintenance_schedule_updated_at BEFORE UPDATE ON maintenance_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;
