-- Inventory Approval Workflow Database Schema (Fixed Version)
-- This script creates the necessary tables for the SWS inventory approval system

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS approval_notifications CASCADE;
DROP TABLE IF EXISTS admin_pending_requests CASCADE;
DROP TABLE IF EXISTS inventory_change_requests CASCADE;
DROP TABLE IF EXISTS inventory_approvals CASCADE;

-- Create inventory_approvals table for tracking approval requests
CREATE TABLE inventory_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'manager_approved', 'project_manager_approved', 'admin_approved', 'rejected', 'completed')),
    
    -- Request details
    requested_by UUID NOT NULL REFERENCES users(id),
    request_reason TEXT,
    request_type VARCHAR(50) DEFAULT 'new_item' CHECK (request_type IN ('new_item', 'quantity_change', 'status_change', 'item_removal')),
    
    -- Manager approval
    manager_approved BOOLEAN DEFAULT FALSE,
    manager_approved_by UUID REFERENCES users(id),
    manager_approved_at TIMESTAMP WITH TIME ZONE,
    manager_notes TEXT,
    
    -- Project Manager approval
    project_manager_approved BOOLEAN DEFAULT FALSE,
    project_manager_approved_by UUID REFERENCES users(id),
    project_manager_approved_at TIMESTAMP WITH TIME ZONE,
    project_manager_notes TEXT,
    
    -- Admin approval (final approval)
    admin_approved BOOLEAN DEFAULT FALSE,
    admin_approved_by UUID REFERENCES users(id),
    admin_approved_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_change_requests table for quantity/status changes
CREATE TABLE inventory_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('quantity_increase', 'quantity_decrease', 'status_change', 'location_change')),
    current_value VARCHAR(255),
    requested_value VARCHAR(255) NOT NULL,
    quantity_change INTEGER DEFAULT 0,
    reason TEXT NOT NULL,
    
    -- Request details
    requested_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'manager_approved', 'project_manager_approved', 'admin_approved', 'rejected', 'completed')),
    
    -- Manager approval
    manager_approved BOOLEAN DEFAULT FALSE,
    manager_approved_by UUID REFERENCES users(id),
    manager_approved_at TIMESTAMP WITH TIME ZONE,
    manager_notes TEXT,
    
    -- Project Manager approval
    project_manager_approved BOOLEAN DEFAULT FALSE,
    project_manager_approved_by UUID REFERENCES users(id),
    project_manager_approved_at TIMESTAMP WITH TIME ZONE,
    project_manager_notes TEXT,
    
    -- Admin approval (final approval)
    admin_approved BOOLEAN DEFAULT FALSE,
    admin_approved_by UUID REFERENCES users(id),
    admin_approved_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_pending_requests table for admin approval queue
CREATE TABLE admin_pending_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('inventory_approval', 'inventory_change', 'item_removal')),
    request_id UUID NOT NULL, -- References either inventory_approvals.id or inventory_change_requests.id
    item_name VARCHAR(255) NOT NULL,
    requested_by UUID NOT NULL REFERENCES users(id),
    manager_approved BOOLEAN DEFAULT FALSE,
    project_manager_approved BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Admin approval
    admin_approved BOOLEAN DEFAULT FALSE,
    admin_approved_by UUID REFERENCES users(id),
    admin_approved_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table for approval workflow notifications
CREATE TABLE approval_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('approval_request', 'approval_approved', 'approval_rejected', 'change_request', 'admin_approval_needed')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_request_id UUID, -- References the request that triggered the notification
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_approvals_status ON inventory_approvals(status);
CREATE INDEX idx_inventory_approvals_requested_by ON inventory_approvals(requested_by);
CREATE INDEX idx_inventory_approvals_inventory_id ON inventory_approvals(inventory_id);

CREATE INDEX idx_inventory_change_requests_status ON inventory_change_requests(status);
CREATE INDEX idx_inventory_change_requests_requested_by ON inventory_change_requests(requested_by);
CREATE INDEX idx_inventory_change_requests_inventory_id ON inventory_change_requests(inventory_id);

CREATE INDEX idx_admin_pending_requests_status ON admin_pending_requests(status);
CREATE INDEX idx_admin_pending_requests_priority ON admin_pending_requests(priority);

CREATE INDEX idx_approval_notifications_user_id ON approval_notifications(user_id);
CREATE INDEX idx_approval_notifications_is_read ON approval_notifications(is_read);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_approvals_updated_at 
    BEFORE UPDATE ON inventory_approvals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_change_requests_updated_at 
    BEFORE UPDATE ON inventory_change_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_pending_requests_updated_at 
    BEFORE UPDATE ON admin_pending_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON inventory_approvals TO authenticated;
GRANT ALL ON inventory_change_requests TO authenticated;
GRANT ALL ON admin_pending_requests TO authenticated;
GRANT ALL ON approval_notifications TO authenticated;

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_pending_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own requests" ON inventory_approvals
    FOR SELECT USING (auth.uid() = requested_by);

CREATE POLICY "Managers can view all requests" ON inventory_approvals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'project_manager', 'admin')
        )
    );

CREATE POLICY "Users can create their own requests" ON inventory_approvals
    FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Managers can update requests" ON inventory_approvals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'project_manager', 'admin')
        )
    );

-- Similar policies for other tables
CREATE POLICY "Users can view their own change requests" ON inventory_change_requests
    FOR SELECT USING (auth.uid() = requested_by);

CREATE POLICY "Managers can view all change requests" ON inventory_change_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'project_manager', 'admin')
        )
    );

CREATE POLICY "Users can create their own change requests" ON inventory_change_requests
    FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Managers can update change requests" ON inventory_change_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'project_manager', 'admin')
        )
    );

CREATE POLICY "Admins can view all pending requests" ON admin_pending_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update pending requests" ON admin_pending_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can view their own notifications" ON approval_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON approval_notifications
    FOR UPDATE USING (auth.uid() = user_id);
