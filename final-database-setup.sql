-- Final Database Setup for SWS Inventory Approval System
-- This script ONLY creates the approval tables - no sample data insertion
-- Use this to avoid all constraint and duplicate key issues

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
SELECT 'Approval tables created successfully! You can now create inventory requests.' as message;
