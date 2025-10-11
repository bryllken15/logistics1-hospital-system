#!/usr/bin/env node

/**
 * Setup script for inventory approval tables
 * This script creates the necessary database tables for the approval workflow
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

if (!supabaseUrl.includes('your-project') && !supabaseKey.includes('your-anon-key')) {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  async function setupApprovalTables() {
    console.log('🔧 Setting up inventory approval tables...\n')
    
    try {
      // Check if tables already exist
      console.log('1️⃣ Checking existing tables...')
      
      const { data: existingApprovals, error: approvalsError } = await supabase
        .from('inventory_approvals')
        .select('*')
        .limit(1)
      
      const { data: existingChanges, error: changesError } = await supabase
        .from('inventory_change_requests')
        .select('*')
        .limit(1)
      
      if (!approvalsError && !changesError) {
        console.log('✅ Approval tables already exist')
        return
      }
      
      console.log('📋 Creating approval tables...')
      
      // Create inventory_approvals table
      const createApprovalsTable = `
        CREATE TABLE IF NOT EXISTS inventory_approvals (
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
      `
      
      // Create inventory_change_requests table
      const createChangesTable = `
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
      `
      
      // Execute table creation
      const { error: approvalsTableError } = await supabase.rpc('exec_sql', { sql: createApprovalsTable })
      const { error: changesTableError } = await supabase.rpc('exec_sql', { sql: createChangesTable })
      
      if (approvalsTableError) {
        console.log('⚠️  inventory_approvals table creation failed:', approvalsTableError.message)
      } else {
        console.log('✅ inventory_approvals table created')
      }
      
      if (changesTableError) {
        console.log('⚠️  inventory_change_requests table creation failed:', changesTableError.message)
      } else {
        console.log('✅ inventory_change_requests table created')
      }
      
      console.log('\n🎉 Database setup completed!')
      console.log('\n📋 Next steps:')
      console.log('   1. Test the inventory request creation in the Employee Dashboard')
      console.log('   2. Check if requests appear in Manager and Project Manager dashboards')
      console.log('   3. Run the full SQL script if you need triggers and functions')
      
    } catch (error) {
      console.error('❌ Setup failed:', error)
      console.log('\n💡 Manual setup required:')
      console.log('   Run the SQL script: inventory_approval_workflow_fixed.sql')
      console.log('   in your Supabase database SQL editor')
    }
  }
  
  // Run the setup
  setupApprovalTables()
} else {
  console.log('⚠️  Supabase configuration not found.')
  console.log('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
  console.log('   Or update the script with your Supabase credentials.')
  console.log('\n💡 Manual setup:')
  console.log('   Run the SQL script: inventory_approval_workflow_fixed.sql')
  console.log('   in your Supabase database SQL editor')
}
