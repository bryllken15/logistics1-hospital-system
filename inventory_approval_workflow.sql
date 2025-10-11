-- Inventory Approval Workflow Database Schema
-- This script creates the necessary tables for the SWS inventory approval system

-- Create inventory_approvals table for tracking approval requests
CREATE TABLE IF NOT EXISTS inventory_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS inventory_change_requests (
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
CREATE TABLE IF NOT EXISTS admin_pending_requests (
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
CREATE TABLE IF NOT EXISTS approval_notifications (
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
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_status ON inventory_approvals(status);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_requested_by ON inventory_approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_inventory_id ON inventory_approvals(inventory_id);

CREATE INDEX IF NOT EXISTS idx_inventory_change_requests_status ON inventory_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_inventory_change_requests_requested_by ON inventory_change_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_inventory_change_requests_inventory_id ON inventory_change_requests(inventory_id);

CREATE INDEX IF NOT EXISTS idx_admin_pending_requests_status ON admin_pending_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_pending_requests_priority ON admin_pending_requests(priority);

CREATE INDEX IF NOT EXISTS idx_approval_notifications_user_id ON approval_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_is_read ON approval_notifications(is_read);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_inventory_approvals_updated_at ON inventory_approvals;
DROP TRIGGER IF EXISTS update_inventory_change_requests_updated_at ON inventory_change_requests;
DROP TRIGGER IF EXISTS update_admin_pending_requests_updated_at ON admin_pending_requests;

CREATE TRIGGER update_inventory_approvals_updated_at 
    BEFORE UPDATE ON inventory_approvals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_change_requests_updated_at 
    BEFORE UPDATE ON inventory_change_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_pending_requests_updated_at 
    BEFORE UPDATE ON admin_pending_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create admin pending requests
CREATE OR REPLACE FUNCTION create_admin_pending_request()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create admin pending request if both manager and project manager have approved
    IF NEW.manager_approved = TRUE AND NEW.project_manager_approved = TRUE AND NEW.admin_approved = FALSE THEN
        INSERT INTO admin_pending_requests (
            request_type,
            request_id,
            item_name,
            requested_by,
            manager_approved,
            project_manager_approved,
            priority
        ) VALUES (
            'inventory_approval',
            NEW.id,
            NEW.item_name,
            NEW.requested_by,
            NEW.manager_approved,
            NEW.project_manager_approved,
            CASE 
                WHEN NEW.total_value > 10000 THEN 'high'
                WHEN NEW.total_value > 5000 THEN 'normal'
                ELSE 'low'
            END
        );
        
        -- Create notification for admin
        INSERT INTO approval_notifications (
            user_id,
            notification_type,
            title,
            message,
            related_request_id
        ) 
        SELECT 
            u.id,
            'admin_approval_needed',
            'New Inventory Approval Request',
            'A new inventory item "' || NEW.item_name || '" requires admin approval.',
            NEW.id
        FROM users u 
        WHERE u.role = 'admin';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_admin_pending_request ON inventory_approvals;

-- Create trigger for inventory approvals
CREATE TRIGGER trigger_create_admin_pending_request
    AFTER UPDATE ON inventory_approvals
    FOR EACH ROW EXECUTE FUNCTION create_admin_pending_request();

-- Create function to automatically create admin pending requests for change requests
CREATE OR REPLACE FUNCTION create_admin_pending_change_request()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create admin pending request if both manager and project manager have approved
    IF NEW.manager_approved = TRUE AND NEW.project_manager_approved = TRUE AND NEW.admin_approved = FALSE THEN
        INSERT INTO admin_pending_requests (
            request_type,
            request_id,
            item_name,
            requested_by,
            manager_approved,
            project_manager_approved,
            priority
        ) VALUES (
            'inventory_change',
            NEW.id,
            (SELECT item_name FROM inventory WHERE id = NEW.inventory_id),
            NEW.requested_by,
            NEW.manager_approved,
            NEW.project_manager_approved,
            'normal'
        );
        
        -- Create notification for admin
        INSERT INTO approval_notifications (
            user_id,
            notification_type,
            title,
            message,
            related_request_id
        ) 
        SELECT 
            u.id,
            'admin_approval_needed',
            'New Inventory Change Request',
            'A new inventory change request requires admin approval.',
            NEW.id
        FROM users u 
        WHERE u.role = 'admin';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_admin_pending_change_request ON inventory_change_requests;

-- Create trigger for inventory change requests
CREATE TRIGGER trigger_create_admin_pending_change_request
    AFTER UPDATE ON inventory_change_requests
    FOR EACH ROW EXECUTE FUNCTION create_admin_pending_change_request();

-- Create function to send notifications when requests are created
CREATE OR REPLACE FUNCTION send_approval_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Send notification to managers
    INSERT INTO approval_notifications (
        user_id,
        notification_type,
        title,
        message,
        related_request_id
    ) 
    SELECT 
        u.id,
        'approval_request',
        'New Inventory Approval Request',
        'A new inventory item "' || NEW.item_name || '" requires your approval.',
        NEW.id
    FROM users u 
    WHERE u.role IN ('manager', 'project_manager');
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_send_approval_notifications ON inventory_approvals;

-- Create trigger for new approval requests
CREATE TRIGGER trigger_send_approval_notifications
    AFTER INSERT ON inventory_approvals
    FOR EACH ROW EXECUTE FUNCTION send_approval_notifications();

-- Create function to send notifications for change requests
CREATE OR REPLACE FUNCTION send_change_request_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Send notification to managers
    INSERT INTO approval_notifications (
        user_id,
        notification_type,
        title,
        message,
        related_request_id
    ) 
    SELECT 
        u.id,
        'change_request',
        'New Inventory Change Request',
        'A new inventory change request requires your approval.',
        NEW.id
    FROM users u 
    WHERE u.role IN ('manager', 'project_manager');
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_send_change_request_notifications ON inventory_change_requests;

-- Create trigger for new change requests
CREATE TRIGGER trigger_send_change_request_notifications
    AFTER INSERT ON inventory_change_requests
    FOR EACH ROW EXECUTE FUNCTION send_change_request_notifications();

-- Insert sample data for testing
INSERT INTO inventory_approvals (
    inventory_id,
    item_name,
    quantity,
    unit_price,
    requested_by,
    request_reason,
    request_type
) VALUES (
    (SELECT id FROM inventory LIMIT 1),
    'Sample Medical Supply',
    100,
    25.50,
    (SELECT id FROM users WHERE role = 'employee' LIMIT 1),
    'Emergency restocking needed',
    'new_item'
) ON CONFLICT DO NOTHING;

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
