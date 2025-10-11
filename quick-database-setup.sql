    -- Quick Database Setup for SWS Inventory Approval System
    -- Copy and paste this entire script into your Supabase SQL Editor

    -- Drop existing tables if they exist
    DROP TABLE IF EXISTS approval_notifications CASCADE;
    DROP TABLE IF EXISTS admin_pending_requests CASCADE;
    DROP TABLE IF EXISTS inventory_change_requests CASCADE;
    DROP TABLE IF EXISTS inventory_approvals CASCADE;

    -- Create inventory_approvals table
    CREATE TABLE inventory_approvals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        unit_price DECIMAL(10,2) DEFAULT 0,
        total_value DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
        status VARCHAR(50) DEFAULT 'pending',
        requested_by UUID NOT NULL REFERENCES users(id),
        request_reason TEXT,
        request_type VARCHAR(50) DEFAULT 'new_item',
        manager_approved BOOLEAN DEFAULT FALSE,
        manager_approved_by UUID REFERENCES users(id),
        manager_approved_at TIMESTAMP WITH TIME ZONE,
        project_manager_approved BOOLEAN DEFAULT FALSE,
        project_manager_approved_by UUID REFERENCES users(id),
        project_manager_approved_at TIMESTAMP WITH TIME ZONE,
        admin_approved BOOLEAN DEFAULT FALSE,
        admin_approved_by UUID REFERENCES users(id),
        admin_approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create inventory_change_requests table
    CREATE TABLE inventory_change_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
        change_type VARCHAR(50) NOT NULL,
        current_value VARCHAR(255),
        requested_value VARCHAR(255) NOT NULL,
        quantity_change INTEGER DEFAULT 0,
        reason TEXT NOT NULL,
        requested_by UUID NOT NULL REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'pending',
        manager_approved BOOLEAN DEFAULT FALSE,
        manager_approved_by UUID REFERENCES users(id),
        manager_approved_at TIMESTAMP WITH TIME ZONE,
        project_manager_approved BOOLEAN DEFAULT FALSE,
        project_manager_approved_by UUID REFERENCES users(id),
        project_manager_approved_at TIMESTAMP WITH TIME ZONE,
        admin_approved BOOLEAN DEFAULT FALSE,
        admin_approved_by UUID REFERENCES users(id),
        admin_approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create admin_pending_requests table
    CREATE TABLE admin_pending_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_type VARCHAR(50) NOT NULL,
        related_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        requested_by UUID NOT NULL REFERENCES users(id),
        admin_approved_by UUID REFERENCES users(id),
        admin_approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create approval_notifications table
    CREATE TABLE approval_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        related_id UUID,
        related_type VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

-- Insert sample users (with username and password_hash fields) - only if they don't exist
INSERT INTO users (id, username, password_hash, full_name, email, role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', '$2a$10$rQZ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Admin User', 'admin@hospital.com', 'admin'),
('22222222-2222-2222-2222-222222222222', 'manager', '$2a$10$rQZ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Manager User', 'manager@hospital.com', 'manager'),
('33333333-3333-3333-3333-333333333333', 'employee', '$2a$10$rQZ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Employee User', 'employee@hospital.com', 'employee'),
('44444444-4444-4444-4444-444444444444', 'pm', '$2a$10$rQZ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Project Manager', 'pm@hospital.com', 'project_manager'),
('55555555-5555-5555-5555-555555555555', 'procurement', '$2a$10$rQZ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Procurement Manager', 'procurement@hospital.com', 'procurement')
ON CONFLICT (username) DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory (id, item_name, rfid_code, quantity, status, location, unit_price, created_by) VALUES
('00000000-0000-0000-0000-000000000001', 'Surgical Masks', 'RFID001', 100, 'in_stock', 'A-1-01', 2.50, '33333333-3333-3333-3333-333333333333'),
('00000000-0000-0000-0000-000000000002', 'Gloves', 'RFID002', 50, 'low_stock', 'A-1-02', 1.25, '33333333-3333-3333-3333-333333333333'),
('00000000-0000-0000-0000-000000000003', 'Syringes', 'RFID003', 200, 'in_stock', 'A-2-01', 0.75, '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT ALL ON inventory_approvals TO authenticated;
GRANT ALL ON inventory_change_requests TO authenticated;
GRANT ALL ON admin_pending_requests TO authenticated;
GRANT ALL ON approval_notifications TO authenticated;

-- Enable RLS
ALTER TABLE inventory_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_pending_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_notifications ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Allow all for authenticated users" ON inventory_approvals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON inventory_change_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON admin_pending_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON approval_notifications FOR ALL USING (auth.role() = 'authenticated');

-- Success message
SELECT 'Database setup completed! You can now create inventory requests.' as message;
