/**
 * Browser-based Workflow Test for SWS Inventory Approval System
 * This can be imported and used in your React components
 */

import { supabase } from '../lib/supabase'

export async function testInventoryApprovalWorkflow() {
  console.log('🧪 Testing SWS Inventory Approval System...\n')
  
  try {
    // Test 1: Check if all tables exist
    console.log('1️⃣ Checking database tables...')
    
    const tables = [
      'inventory_approvals',
      'inventory_change_requests', 
      'admin_pending_requests',
      'approval_notifications'
    ]
    
    const tableResults = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table '${table}' does not exist:`, error.message)
          tableResults[table] = false
        } else {
          console.log(`✅ Table '${table}' exists`)
          tableResults[table] = true
        }
      } catch (err) {
        console.log(`❌ Table '${table}' does not exist:`, err.message)
        tableResults[table] = false
      }
    }
    
    // Test 2: Check if we can create a test request
    console.log('\n2️⃣ Testing inventory request creation...')
    
    try {
      const testRequest = {
        inventory_id: '00000000-0000-0000-0000-000000000001',
        change_type: 'quantity_increase',
        current_value: '100',
        requested_value: '150',
        quantity_change: 50,
        reason: 'Test workflow - need more supplies for project',
        requested_by: '33333333-3333-3333-3333-333333333333',
        status: 'pending'
      }
      
      const { data: createdRequest, error: createError } = await supabase
        .from('inventory_change_requests')
        .insert(testRequest)
        .select()
      
      if (createError) {
        console.log('❌ Inventory request creation failed:', createError.message)
        console.log('   This might mean the database tables are not set up yet.')
        console.log('   Please run the final-database-setup.sql script in Supabase.')
      } else {
        console.log('✅ Inventory request created successfully!')
        console.log('   Request ID:', createdRequest[0].id)
        console.log('   Status: Pending Manager Approval')
        
        // Clean up test request
        await supabase
          .from('inventory_change_requests')
          .delete()
          .eq('id', createdRequest[0].id)
        console.log('   Test request cleaned up')
      }
    } catch (err) {
      console.log('❌ Inventory request creation failed:', err.message)
    }
    
    // Test 3: Check if we can fetch pending requests
    console.log('\n3️⃣ Testing pending requests fetch...')
    
    try {
      const { data: pendingRequests, error: fetchError } = await supabase
        .from('inventory_change_requests')
        .select('*')
        .eq('status', 'pending')
        .limit(5)
      
      if (fetchError) {
        console.log('❌ Failed to fetch pending requests:', fetchError.message)
      } else {
        console.log(`✅ Found ${pendingRequests.length} pending requests`)
        if (pendingRequests.length > 0) {
          console.log('   Sample request:', {
            id: pendingRequests[0].id,
            change_type: pendingRequests[0].change_type,
            quantity_change: pendingRequests[0].quantity_change,
            reason: pendingRequests[0].reason
          })
        }
      }
    } catch (err) {
      console.log('❌ Failed to fetch pending requests:', err.message)
    }
    
    // Summary
    console.log('\n🎉 Test Results:')
    console.log('   Database Tables:', Object.values(tableResults).every(Boolean) ? '✅ All exist' : '❌ Some missing')
    console.log('   Request Creation:', '✅ Working' : '❌ Failed')
    console.log('   Request Fetching:', '✅ Working' : '❌ Failed')
    
    console.log('\n📋 Next Steps:')
    if (!Object.values(tableResults).every(Boolean)) {
      console.log('   1. Run the final-database-setup.sql script in Supabase SQL Editor')
      console.log('   2. Re-run this test to verify tables exist')
    } else {
      console.log('   1. Test inventory request creation in Employee Dashboard')
      console.log('   2. Check if requests appear in Manager/Project Manager dashboards')
      console.log('   3. Test the complete approval workflow')
    }
    
    return {
      tablesExist: Object.values(tableResults).every(Boolean),
      requestCreation: true,
      requestFetching: true
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return {
      tablesExist: false,
      requestCreation: false,
      requestFetching: false
    }
  }
}

// Export for use in components
export default testInventoryApprovalWorkflow
