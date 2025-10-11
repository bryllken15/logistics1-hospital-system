# 🗄️ Database Setup Guide

## 🚨 **Current Issue**
The "Failed to create inventory request" error occurs because the database tables for the approval workflow don't exist yet.

## 🔧 **Solution Steps**

### **Step 1: Set up Supabase Database Schema**

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Run the following SQL script** (copy and paste the entire script):

```sql
-- Complete Database Setup for SWS Inventory Approval System
-- Run this script in your Supabase SQL Editor

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

-- Create admin_pending_requests table for final admin approval
CREATE TABLE admin_pending_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('inventory_approval', 'inventory_change', 'user_authorization')),
    related_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Request details
    requested_by UUID NOT NULL REFERENCES users(id),
    admin_approved_by UUID REFERENCES users(id),
    admin_approved_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create approval_notifications table for real-time notifications
CREATE TABLE approval_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    related_id UUID,
    related_type VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_inventory_approvals_updated_at
    BEFORE UPDATE ON inventory_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_change_requests_updated_at
    BEFORE UPDATE ON inventory_change_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_pending_requests_updated_at
    BEFORE UPDATE ON admin_pending_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample users if they don't exist
INSERT INTO users (id, username, full_name, email, role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'Admin User', 'admin@hospital.com', 'admin'),
('22222222-2222-2222-2222-222222222222', 'manager', 'Manager User', 'manager@hospital.com', 'manager'),
('33333333-3333-3333-3333-333333333333', 'employee', 'Employee User', 'employee@hospital.com', 'employee'),
('44444444-4444-4444-4444-444444444444', 'pm', 'Project Manager', 'pm@hospital.com', 'project_manager'),
('55555555-5555-5555-5555-555555555555', 'procurement', 'Procurement Manager', 'procurement@hospital.com', 'procurement')
ON CONFLICT (id) DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory (id, item_name, rfid_code, quantity, status, location, unit_price, created_by) VALUES
('00000000-0000-0000-0000-000000000001', 'Surgical Masks', 'RFID001', 100, 'in_stock', 'A-1-01', 2.50, '33333333-3333-3333-3333-333333333333'),
('00000000-0000-0000-0000-000000000002', 'Gloves', 'RFID002', 50, 'low_stock', 'A-1-02', 1.25, '33333333-3333-3333-3333-333333333333'),
('00000000-0000-0000-0000-000000000003', 'Syringes', 'RFID003', 200, 'in_stock', 'A-2-01', 0.75, '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

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
    FOR SELECT USING (requested_by = auth.uid());

CREATE POLICY "Users can view their own change requests" ON inventory_change_requests
    FOR SELECT USING (requested_by = auth.uid());

CREATE POLICY "Managers can view all requests" ON inventory_approvals
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('manager', 'admin')
    ));

CREATE POLICY "Managers can view all change requests" ON inventory_change_requests
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('manager', 'admin')
    ));

-- Success message
SELECT 'Database setup completed successfully!' as message;
```

### **Step 2: Test the Setup**

After running the SQL script, test the inventory request creation:

1. **Open the application** in your browser
2. **Login as Employee** (use the sample credentials)
3. **Try to create a new inventory request**
4. **Check if the request appears in Manager/Project Manager dashboards**

### **Step 3: Verify Tables Created**

You can verify the tables were created by running this query in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('inventory_approvals', 'inventory_change_requests', 'admin_pending_requests', 'approval_notifications');
```

## 🔍 **Troubleshooting**

### **If you still get "Failed to create inventory request":**

1. **Check browser console** for detailed error messages
2. **Verify Supabase connection** in your environment variables
3. **Check if the tables exist** using the verification query above
4. **Ensure RLS policies are working** by checking Supabase logs

### **Common Issues:**

- **Missing environment variables**: Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- **RLS blocking requests**: Check if Row Level Security policies are too restrictive
- **Missing user records**: Ensure the sample users exist in the database

## 🎯 **Expected Result**

After running the SQL script:
- ✅ Inventory request creation should work
- ✅ Requests should appear in Manager dashboard
- ✅ Requests should appear in Project Manager dashboard
- ✅ Real-time updates should work
- ✅ Approval workflow should function correctly

## 📞 **Need Help?**

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify your Supabase project settings
3. Ensure all environment variables are correctly set
4. Check the Supabase logs for any database errors
