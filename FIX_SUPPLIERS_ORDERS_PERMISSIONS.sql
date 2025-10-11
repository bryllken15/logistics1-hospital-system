-- =====================================================
-- FIX SUPPLIERS AND ORDERS PERMISSIONS
-- =====================================================
-- This script fixes permissions for the suppliers and orders tables

-- Grant permissions to authenticated users
GRANT ALL ON TABLE suppliers TO authenticated;
GRANT ALL ON TABLE purchase_orders TO authenticated;
GRANT ALL ON TABLE delivery_receipts TO authenticated;

-- Grant permissions to service role
GRANT ALL ON TABLE suppliers TO service_role;
GRANT ALL ON TABLE purchase_orders TO service_role;
GRANT ALL ON TABLE delivery_receipts TO service_role;

-- Enable RLS on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_receipts ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
DROP POLICY IF EXISTS "Allow all for authenticated users" ON suppliers;
CREATE POLICY "Allow all for authenticated users" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON purchase_orders;
CREATE POLICY "Allow all for authenticated users" ON purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON delivery_receipts;
CREATE POLICY "Allow all for authenticated users" ON delivery_receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant permissions on sequences if they exist
DO $$
BEGIN
    -- Grant permissions on sequences
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

-- Insert sample suppliers
INSERT INTO suppliers (id, name, contact, email, phone, address, rating, status, notes) VALUES
('11111111-1111-1111-1111-111111111111', 'MedSupply Co.', 'John Smith', 'john@medsupply.com', '+1-555-0101', '123 Medical St, Health City, HC 12345', 5, 'active', 'Primary medical supplies supplier')
ON CONFLICT (id) DO NOTHING;

INSERT INTO suppliers (id, name, contact, email, phone, address, rating, status, notes) VALUES
('22222222-2222-2222-2222-222222222222', 'HealthTech Ltd.', 'Sarah Johnson', 'sarah@healthtech.com', '+1-555-0102', '456 Tech Ave, Innovation City, IC 67890', 4, 'active', 'Advanced medical technology supplier')
ON CONFLICT (id) DO NOTHING;

INSERT INTO suppliers (id, name, contact, email, phone, address, rating, status, notes) VALUES
('33333333-3333-3333-3333-333333333333', 'MedEquip Inc.', 'Mike Wilson', 'mike@medequip.com', '+1-555-0103', '789 Equipment Blvd, Industrial City, IC 13579', 4, 'active', 'Medical equipment and devices')
ON CONFLICT (id) DO NOTHING;

INSERT INTO suppliers (id, name, contact, email, phone, address, rating, status, notes) VALUES
('44444444-4444-4444-4444-444444444444', 'PharmaCorp', 'Lisa Brown', 'lisa@pharmacorp.com', '+1-555-0104', '321 Pharma Way, Research City, RC 24680', 3, 'active', 'Pharmaceutical supplies and medications')
ON CONFLICT (id) DO NOTHING;

INSERT INTO suppliers (id, name, contact, email, phone, address, rating, status, notes) VALUES
('55555555-5555-5555-5555-555555555555', 'Equipment Solutions', 'David Lee', 'david@equipsol.com', '+1-555-0105', '654 Solution St, Service City, SC 97531', 4, 'active', 'Comprehensive equipment solutions')
ON CONFLICT (id) DO NOTHING;

INSERT INTO suppliers (id, name, contact, email, phone, address, rating, status, notes) VALUES
('66666666-6666-6666-6666-666666666666', 'Medical Supply Co', 'Emma Davis', 'emma@medsupplyco.com', '+1-555-0106', '987 Supply Lane, Distribution City, DC 86420', 5, 'active', 'Full-service medical supply company')
ON CONFLICT (id) DO NOTHING;

-- Insert sample purchase orders
INSERT INTO purchase_orders (id, order_number, supplier_id, supplier_name, items, amount, description, priority, status, expected_delivery, actual_delivery, rfid_code, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PO-2024-001', '11111111-1111-1111-1111-111111111111', 'MedSupply Co.', 15, 45000.00, 'Emergency medical supplies for ICU ward', 'high', 'delivered', '2024-01-15', '2024-01-15', 'RFID-001-2024', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_orders (id, order_number, supplier_id, supplier_name, items, amount, description, priority, status, expected_delivery, rfid_code, created_by) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PO-2024-002', '22222222-2222-2222-2222-222222222222', 'HealthTech Ltd.', 8, 32500.00, 'Advanced monitoring equipment for surgery', 'medium', 'in_transit', '2024-01-20', 'RFID-002-2024', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_orders (id, order_number, supplier_id, supplier_name, items, amount, description, priority, status, expected_delivery, actual_delivery, rfid_code, created_by) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'PO-2024-003', '33333333-3333-3333-3333-333333333333', 'MedEquip Inc.', 25, 78000.00, 'Surgical instruments and equipment', 'urgent', 'delivered', '2024-01-10', '2024-01-10', 'RFID-003-2024', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_orders (id, order_number, supplier_id, supplier_name, items, amount, description, priority, status, expected_delivery, rfid_code, created_by) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'PO-2024-004', '44444444-4444-4444-4444-444444444444', 'PharmaCorp', 12, 23000.00, 'Essential medications and vaccines', 'medium', 'pending', '2024-01-25', 'RFID-004-2024', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_orders (id, order_number, supplier_id, supplier_name, items, amount, description, priority, status, expected_delivery, rfid_code, created_by) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'PO-2024-005', '55555555-5555-5555-5555-555555555555', 'Equipment Solutions', 6, 15000.00, 'Maintenance tools and spare parts', 'low', 'approved', '2024-01-30', 'RFID-005-2024', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_orders (id, order_number, supplier_id, supplier_name, items, amount, description, priority, status, expected_delivery, rfid_code, created_by) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'PO-2024-006', '66666666-6666-6666-6666-666666666666', 'Medical Supply Co', 20, 55000.00, 'General medical supplies and consumables', 'high', 'in_transit', '2024-02-05', 'RFID-006-2024', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

-- Insert sample delivery receipts
INSERT INTO delivery_receipts (id, order_id, supplier_name, items_received, delivery_date, status, rfid_code, notes) VALUES
('77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MedSupply Co.', 15, '2024-01-15', 'completed', 'RFID-001-2024', 'All items received in good condition')
ON CONFLICT (id) DO NOTHING;

INSERT INTO delivery_receipts (id, order_id, supplier_name, items_received, delivery_date, status, rfid_code, notes) VALUES
('88888888-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'MedEquip Inc.', 25, '2024-01-10', 'completed', 'RFID-003-2024', 'Surgical equipment delivered successfully')
ON CONFLICT (id) DO NOTHING;

INSERT INTO delivery_receipts (id, order_id, supplier_name, items_received, delivery_date, status, rfid_code, notes) VALUES
('99999999-9999-9999-9999-999999999999', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HealthTech Ltd.', 8, '2024-01-20', 'pending', 'RFID-002-2024', 'Equipment in transit, expected delivery soon')
ON CONFLICT (id) DO NOTHING;

INSERT INTO delivery_receipts (id, order_id, supplier_name, items_received, delivery_date, status, rfid_code, notes) VALUES
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Medical Supply Co', 20, '2024-02-05', 'pending', 'RFID-006-2024', 'General supplies en route')
ON CONFLICT (id) DO NOTHING;

-- Verify the setup
DO $$
BEGIN
    RAISE NOTICE '✅ Permissions fixed and sample data inserted successfully!';
    RAISE NOTICE '📊 Tables: suppliers, purchase_orders, delivery_receipts';
    RAISE NOTICE '📝 Sample data: 6 suppliers, 6 orders, 4 delivery receipts';
    RAISE NOTICE '🔒 RLS enabled with permissive policies';
    RAISE NOTICE '🎉 Database is ready for Procurement Dashboard!';
END $$;
