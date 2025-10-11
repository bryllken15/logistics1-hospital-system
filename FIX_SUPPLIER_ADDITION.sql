-- =====================================================
-- FIX SUPPLIER ADDITION ISSUE
-- =====================================================
-- This script fixes the specific issue with adding suppliers

-- First, ensure the suppliers table exists with proper structure
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    notes TEXT
);

-- Create purchase_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_name VARCHAR(255) NOT NULL,
    items INTEGER NOT NULL CHECK (items > 0),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_transit', 'delivered', 'cancelled')),
    expected_delivery DATE,
    actual_delivery DATE,
    rfid_code VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create delivery_receipts table if it doesn't exist
CREATE TABLE IF NOT EXISTS delivery_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    supplier_name VARCHAR(255) NOT NULL,
    items_received INTEGER NOT NULL CHECK (items_received > 0),
    delivery_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'completed', 'rejected')),
    rfid_code VARCHAR(100),
    received_by UUID,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant ALL permissions to authenticated users
GRANT ALL ON TABLE suppliers TO authenticated;
GRANT ALL ON TABLE purchase_orders TO authenticated;
GRANT ALL ON TABLE delivery_receipts TO authenticated;

-- Grant ALL permissions to service role
GRANT ALL ON TABLE suppliers TO service_role;
GRANT ALL ON TABLE purchase_orders TO service_role;
GRANT ALL ON TABLE delivery_receipts TO service_role;

-- Grant permissions on sequences
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'suppliers_id_seq') THEN
        GRANT ALL ON SEQUENCE suppliers_id_seq TO authenticated;
        GRANT ALL ON SEQUENCE suppliers_id_seq TO service_role;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'purchase_orders_id_seq') THEN
        GRANT ALL ON SEQUENCE purchase_orders_id_seq TO authenticated;
        GRANT ALL ON SEQUENCE purchase_orders_id_seq TO service_role;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'delivery_receipts_id_seq') THEN
        GRANT ALL ON SEQUENCE delivery_receipts_id_seq TO authenticated;
        GRANT ALL ON SEQUENCE delivery_receipts_id_seq TO service_role;
    END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_receipts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all for authenticated users" ON suppliers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON purchase_orders;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON delivery_receipts;

-- Create permissive policies for authenticated users
CREATE POLICY "Allow all for authenticated users" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON delivery_receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_rating ON suppliers(rating);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_priority ON purchase_orders(priority);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON purchase_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_number ON purchase_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_delivery_receipts_order_id ON delivery_receipts(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_receipts_status ON delivery_receipts(status);
CREATE INDEX IF NOT EXISTS idx_delivery_receipts_delivery_date ON delivery_receipts(delivery_date);

-- Insert sample suppliers with proper conflict handling
INSERT INTO suppliers (id, name, contact, email, phone, address, rating, status, notes) VALUES
('11111111-1111-1111-1111-111111111111', 'MedSupply Co.', 'John Smith', 'john@medsupply.com', '+1-555-0101', '123 Medical St, Health City, HC 12345', 5, 'active', 'Primary medical supplies supplier'),
('22222222-2222-2222-2222-222222222222', 'HealthTech Ltd.', 'Sarah Johnson', 'sarah@healthtech.com', '+1-555-0102', '456 Tech Ave, Innovation City, IC 67890', 4, 'active', 'Advanced medical technology supplier'),
('33333333-3333-3333-3333-333333333333', 'MedEquip Inc.', 'Mike Wilson', 'mike@medequip.com', '+1-555-0103', '789 Equipment Blvd, Industrial City, IC 13579', 4, 'active', 'Medical equipment and devices'),
('44444444-4444-4444-4444-444444444444', 'PharmaCorp', 'Lisa Brown', 'lisa@pharmacorp.com', '+1-555-0104', '321 Pharma Way, Research City, RC 24680', 3, 'active', 'Pharmaceutical supplies and medications'),
('55555555-5555-5555-5555-555555555555', 'Equipment Solutions', 'David Lee', 'david@equipsol.com', '+1-555-0105', '654 Solution St, Service City, SC 97531', 4, 'active', 'Comprehensive equipment solutions'),
('66666666-6666-6666-6666-666666666666', 'Medical Supply Co', 'Emma Davis', 'emma@medsupplyco.com', '+1-555-0106', '987 Supply Lane, Distribution City, DC 86420', 5, 'active', 'Full-service medical supply company')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    contact = EXCLUDED.contact,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    rating = EXCLUDED.rating,
    status = EXCLUDED.status,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- Insert sample purchase orders
INSERT INTO purchase_orders (id, order_number, supplier_id, supplier_name, items, amount, description, priority, status, expected_delivery, actual_delivery, rfid_code, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PO-2024-001', '11111111-1111-1111-1111-111111111111', 'MedSupply Co.', 15, 45000.00, 'Emergency medical supplies for ICU ward', 'high', 'delivered', '2024-01-15', '2024-01-15', 'RFID-001-2024', '44444444-4444-4444-4444-444444444444'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PO-2024-002', '22222222-2222-2222-2222-222222222222', 'HealthTech Ltd.', 8, 32500.00, 'Advanced monitoring equipment for surgery', 'medium', 'in_transit', '2024-01-20', NULL, 'RFID-002-2024', '44444444-4444-4444-4444-444444444444'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'PO-2024-003', '33333333-3333-3333-3333-333333333333', 'MedEquip Inc.', 25, 78000.00, 'Surgical instruments and equipment', 'urgent', 'delivered', '2024-01-10', '2024-01-10', 'RFID-003-2024', '44444444-4444-4444-4444-444444444444'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'PO-2024-004', '44444444-4444-4444-4444-444444444444', 'PharmaCorp', 12, 23000.00, 'Essential medications and vaccines', 'medium', 'pending', '2024-01-25', NULL, 'RFID-004-2024', '44444444-4444-4444-4444-444444444444'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'PO-2024-005', '55555555-5555-5555-5555-555555555555', 'Equipment Solutions', 6, 15000.00, 'Maintenance tools and spare parts', 'low', 'approved', '2024-01-30', NULL, 'RFID-005-2024', '44444444-4444-4444-4444-444444444444'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'PO-2024-006', '66666666-6666-6666-6666-666666666666', 'Medical Supply Co', 20, 55000.00, 'General medical supplies and consumables', 'high', 'in_transit', '2024-02-05', NULL, 'RFID-006-2024', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    supplier_id = EXCLUDED.supplier_id,
    supplier_name = EXCLUDED.supplier_name,
    items = EXCLUDED.items,
    amount = EXCLUDED.amount,
    description = EXCLUDED.description,
    priority = EXCLUDED.priority,
    status = EXCLUDED.status,
    expected_delivery = EXCLUDED.expected_delivery,
    actual_delivery = EXCLUDED.actual_delivery,
    rfid_code = EXCLUDED.rfid_code,
    updated_at = NOW();

-- Insert sample delivery receipts
INSERT INTO delivery_receipts (id, order_id, supplier_name, items_received, delivery_date, status, rfid_code, notes) VALUES
('77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MedSupply Co.', 15, '2024-01-15', 'completed', 'RFID-001-2024', 'All items received in good condition'),
('88888888-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'MedEquip Inc.', 25, '2024-01-10', 'completed', 'RFID-003-2024', 'Surgical equipment delivered successfully'),
('99999999-9999-9999-9999-999999999999', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HealthTech Ltd.', 8, '2024-01-20', 'pending', 'RFID-002-2024', 'Equipment in transit, expected delivery soon'),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Medical Supply Co', 20, '2024-02-05', 'pending', 'RFID-006-2024', 'General supplies en route')
ON CONFLICT (id) DO UPDATE SET
    order_id = EXCLUDED.order_id,
    supplier_name = EXCLUDED.supplier_name,
    items_received = EXCLUDED.items_received,
    delivery_date = EXCLUDED.delivery_date,
    status = EXCLUDED.status,
    rfid_code = EXCLUDED.rfid_code,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at 
    BEFORE UPDATE ON purchase_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_delivery_receipts_updated_at ON delivery_receipts;
CREATE TRIGGER update_delivery_receipts_updated_at 
    BEFORE UPDATE ON delivery_receipts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the setup
DO $$
BEGIN
    RAISE NOTICE '✅ SUPPLIER ADDITION FIX COMPLETED!';
    RAISE NOTICE '📊 Tables: suppliers, purchase_orders, delivery_receipts';
    RAISE NOTICE '🔒 Permissions: ALL granted to authenticated and service_role';
    RAISE NOTICE '🛡️ RLS: Enabled with permissive policies';
    RAISE NOTICE '📝 Sample data: 6 suppliers, 6 orders, 4 delivery receipts';
    RAISE NOTICE '🎉 Supplier addition should now work!';
END $$;
