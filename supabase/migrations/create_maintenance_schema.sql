-- Create Maintenance Database Schema
-- This migration creates all necessary tables for the maintenance system

-- 1. Assets Table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  asset_type TEXT,
  rfid_code TEXT UNIQUE,
  serial_number TEXT,
  manufacturer TEXT,
  model TEXT,
  purchase_date DATE,
  purchase_cost DECIMAL(10,2),
  location TEXT,
  department TEXT,
  condition TEXT DEFAULT 'good',
  criticality TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  notes TEXT,
  qr_code_data TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Maintenance Logs Table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  scheduled_date DATE,
  completed_date DATE,
  cost DECIMAL(10,2),
  performed_by UUID REFERENCES users(id),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Maintenance Work Orders Table
CREATE TABLE IF NOT EXISTS maintenance_work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_number TEXT UNIQUE NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID REFERENCES users(id),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  scheduled_date DATE,
  completed_date DATE,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Spare Parts Table
CREATE TABLE IF NOT EXISTS spare_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name TEXT NOT NULL,
  part_number TEXT,
  description TEXT,
  category TEXT,
  manufacturer TEXT,
  supplier_id UUID REFERENCES suppliers(id),
  unit_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Maintenance Schedule Table
CREATE TABLE IF NOT EXISTS maintenance_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  assigned_to UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
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

-- Add updated_at triggers to all tables
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_logs_updated_at BEFORE UPDATE ON maintenance_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON maintenance_work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spare_parts_updated_at BEFORE UPDATE ON spare_parts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_schedule_updated_at BEFORE UPDATE ON maintenance_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
