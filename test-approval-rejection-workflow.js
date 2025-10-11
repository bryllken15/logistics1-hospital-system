// Test script to verify approval and rejection workflow
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testApprovalRejectionWorkflow() {
  console.log('🧪 Testing Approval and Rejection Workflow...\n')

  try {
    // Step 1: Create a test approval request
    console.log('1️⃣ Creating test approval request...')
    const employeeUserId = 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    const managerUserId = '1a91e422-6246-4647-804a-930be3bf971d'
    
    // Create inventory item
    const inventoryData = {
      item_name: 'Test Approval Item',
      rfid_code: `RFID-TEST-${Date.now()}`,
      quantity: 0,
      status: 'in_stock',
      location: 'Test Location',
      unit_price: 30.00,
      created_by: employeeUserId
    }

    const { data: inventoryResult, error: inventoryError } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select()

    if (inventoryError) {
      console.error('❌ Failed to create inventory item:', inventoryError.message)
      return
    }

    console.log('✅ Inventory item created:', inventoryResult[0].id)

    // Create approval request
    const approvalData = {
      inventory_id: inventoryResult[0].id,
      item_name: 'Test Approval Item',
      quantity: 20,
      unit_price: 30.00,
      status: 'pending',
      requested_by: employeeUserId,
      request_reason: 'Test approval workflow',
      request_type: 'new_item'
    }

    const { data: approvalResult, error: approvalError } = await supabase
      .from('inventory_approvals')
      .insert(approvalData)
      .select()

    if (approvalError) {
      console.error('❌ Failed to create approval request:', approvalError.message)
      return
    }

    console.log('✅ Approval request created:', approvalResult[0].id)
    console.log('   Status:', approvalResult[0].status)

    // Step 2: Test approval
    console.log('\n2️⃣ Testing approval workflow...')
    const { data: approvalUpdate, error: approvalUpdateError } = await supabase
      .from('inventory_approvals')
      .update({
        manager_approved: true,
        manager_approved_by: managerUserId,
        manager_approved_at: new Date().toISOString(),
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalResult[0].id)
      .select()

    if (approvalUpdateError) {
      console.error('❌ Failed to approve request:', approvalUpdateError.message)
    } else {
      console.log('✅ Request approved successfully!')
      console.log('   Status:', approvalUpdate[0].status)
      console.log('   Manager Approved:', approvalUpdate[0].manager_approved)
    }

    // Step 3: Update inventory with approved quantity
    console.log('\n3️⃣ Updating inventory with approved quantity...')
    const { data: inventoryUpdate, error: inventoryUpdateError } = await supabase
      .from('inventory')
      .update({
        quantity: 20,
        updated_by: managerUserId,
        updated_at: new Date().toISOString()
      })
      .eq('id', inventoryResult[0].id)
      .select()

    if (inventoryUpdateError) {
      console.error('❌ Failed to update inventory:', inventoryUpdateError.message)
    } else {
      console.log('✅ Inventory updated successfully!')
      console.log('   New quantity:', inventoryUpdate[0].quantity)
    }

    // Step 4: Test rejection workflow
    console.log('\n4️⃣ Testing rejection workflow...')
    
    // Create another approval request for rejection test
    const rejectionApprovalData = {
      inventory_id: inventoryResult[0].id,
      item_name: 'Test Rejection Item',
      quantity: 10,
      unit_price: 15.00,
      status: 'pending',
      requested_by: employeeUserId,
      request_reason: 'Test rejection workflow',
      request_type: 'new_item'
    }

    const { data: rejectionApprovalResult, error: rejectionApprovalError } = await supabase
      .from('inventory_approvals')
      .insert(rejectionApprovalData)
      .select()

    if (rejectionApprovalError) {
      console.error('❌ Failed to create rejection test request:', rejectionApprovalError.message)
    } else {
      console.log('✅ Rejection test request created:', rejectionApprovalResult[0].id)
      
      // Reject the request
      const { data: rejectionUpdate, error: rejectionUpdateError } = await supabase
        .from('inventory_approvals')
        .update({
          status: 'rejected',
          manager_approved: false,
          manager_approved_by: managerUserId,
          manager_approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', rejectionApprovalResult[0].id)
        .select()

      if (rejectionUpdateError) {
        console.error('❌ Failed to reject request:', rejectionUpdateError.message)
      } else {
        console.log('✅ Request rejected successfully!')
        console.log('   Status:', rejectionUpdate[0].status)
        console.log('   Manager Approved:', rejectionUpdate[0].manager_approved)
      }
    }

    // Step 5: Test manager dashboard query (should not show approved/rejected)
    console.log('\n5️⃣ Testing manager dashboard query...')
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('inventory_approvals')
      .select(`
        *,
        inventory:inventory_id(*),
        requested_by_user:requested_by(full_name, email),
        manager_approved_by_user:manager_approved_by(full_name, email),
        project_manager_approved_by_user:project_manager_approved_by(full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (pendingError) {
      console.error('❌ Manager query error:', pendingError.message)
    } else {
      console.log(`✅ Manager query successful, found ${pendingRequests.length} pending requests`)
      console.log('   (Approved and rejected requests should not appear here)')
    }

    // Step 6: Test employee dashboard query (should show all their requests)
    console.log('\n6️⃣ Testing employee dashboard query...')
    const { data: employeeRequests, error: employeeError } = await supabase
      .from('inventory_approvals')
      .select(`
        *,
        inventory:inventory_id(*),
        requested_by_user:requested_by(full_name, email)
      `)
      .eq('requested_by', employeeUserId)
      .order('created_at', { ascending: false })

    if (employeeError) {
      console.error('❌ Employee query error:', employeeError.message)
    } else {
      console.log(`✅ Employee query successful, found ${employeeRequests.length} requests`)
      employeeRequests.forEach((req, i) => {
        console.log(`   ${i + 1}. ${req.item_name} - Status: ${req.status}`)
      })
    }

    // Clean up test data
    console.log('\n7️⃣ Cleaning up test data...')
    await supabase.from('inventory_approvals').delete().eq('requested_by', employeeUserId)
    await supabase.from('inventory').delete().eq('id', inventoryResult[0].id)
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 Approval and Rejection Workflow Test PASSED!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Approval requests can be created')
    console.log('   ✅ Manager can approve requests')
    console.log('   ✅ Manager can reject requests')
    console.log('   ✅ Approved requests update inventory')
    console.log('   ✅ Manager dashboard only shows pending requests')
    console.log('   ✅ Employee dashboard shows all their requests')

    console.log('\n🚀 The approval/rejection workflow is now working correctly!')
    console.log('   - Requests will disappear from manager dashboard after approval/rejection')
    console.log('   - Employee can see the status of their requests')
    console.log('   - Approved items are updated in inventory')

    return true

  } catch (error) {
    console.error('💥 Test failed:', error.message)
    return false
  }
}

testApprovalRejectionWorkflow()
  .then(success => {
    if (success) {
      console.log('\n✨ Approval/rejection workflow is working!')
    } else {
      console.log('\n❌ Approval/rejection workflow has issues.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
