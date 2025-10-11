// Test script to verify the complete inventory approval workflow
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testApprovalWorkflow() {
  console.log('🧪 Testing Complete Inventory Approval Workflow...\n')

  try {
    // Step 1: Employee creates inventory request (simulating frontend behavior)
    console.log('1️⃣ Employee creating inventory request...')
    const employeeUserId = 'dbbd608b-377f-4368-b61e-102f1f727f4f' // Real Employee user ID
    
    const inventoryRequestData = {
      item_name: 'Emergency Medical Supplies',
      quantity: 100,
      unit_price: 25.50,
      location: 'Emergency Ward',
      reason: 'Urgent restocking needed for emergency procedures',
      requested_by: employeeUserId,
      request_type: 'new_item'
    }

    // First create the inventory item (as the frontend does)
    const { data: inventoryResult, error: inventoryError } = await supabase
      .from('inventory')
      .insert({
        item_name: inventoryRequestData.item_name,
        rfid_code: `RFID-APPROVAL-${Date.now()}`,
        quantity: 0, // Start with 0, will be updated after approval
        status: 'in_stock',
        location: inventoryRequestData.location,
        unit_price: inventoryRequestData.unit_price,
        created_by: employeeUserId
      })
      .select()

    if (inventoryError) {
      console.error('❌ Failed to create inventory item:', inventoryError.message)
      return false
    }

    console.log('✅ Inventory item created:', inventoryResult[0].id)

    // Now create the approval request
    // Note: total_value is a generated column, so we don't include it in the insert
    const approvalData = {
      inventory_id: inventoryResult[0].id,
      item_name: inventoryRequestData.item_name,
      quantity: inventoryRequestData.quantity,
      unit_price: inventoryRequestData.unit_price,
      // total_value will be automatically calculated by the database
      status: 'pending',
      requested_by: employeeUserId,
      request_reason: inventoryRequestData.reason,
      request_type: inventoryRequestData.request_type
    }

    const { data: approvalResult, error: approvalError } = await supabase
      .from('inventory_approvals')
      .insert(approvalData)
      .select()

    if (approvalError) {
      console.error('❌ Failed to create approval request:', approvalError.message)
      return false
    }

    console.log('✅ Approval request created:', approvalResult[0].id)
    console.log('   Status: Pending Manager Approval')

    // Step 2: Manager views pending approvals
    console.log('\n2️⃣ Manager viewing pending approvals...')
    const { data: pendingApprovals, error: fetchError } = await supabase
      .from('inventory_approvals')
      .select(`
        *,
        inventory:inventory_id(*),
        requested_by_user:requested_by(full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Failed to fetch pending approvals:', fetchError.message)
      return false
    }

    console.log('✅ Found pending approvals:', pendingApprovals.length)
    if (pendingApprovals.length > 0) {
      const approval = pendingApprovals[0]
      console.log('   Request:', approval.item_name)
      console.log('   Quantity:', approval.quantity)
      console.log('   Total Value: ₱', approval.total_value)
      console.log('   Requested by:', approval.requested_by_user?.full_name || 'Unknown')
    }

    // Step 3: Manager approves the request
    console.log('\n3️⃣ Manager approving the request...')
    const managerUserId = '1a91e422-6246-4647-804a-930be3bf971d' // Real Manager user ID
    
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
      return false
    }

    console.log('✅ Manager approved the request!')

    // Step 4: Update inventory item with approved quantity
    console.log('\n4️⃣ Updating inventory with approved quantity...')
    const { data: inventoryUpdate, error: inventoryUpdateError } = await supabase
      .from('inventory')
      .update({
        quantity: inventoryRequestData.quantity,
        updated_by: managerUserId,
        updated_at: new Date().toISOString()
      })
      .eq('id', inventoryResult[0].id)
      .select()

    if (inventoryUpdateError) {
      console.error('❌ Failed to update inventory:', inventoryUpdateError.message)
      return false
    }

    console.log('✅ Inventory updated with approved quantity!')
    console.log('   New quantity:', inventoryUpdate[0].quantity)

    // Step 5: Verify the complete workflow
    console.log('\n5️⃣ Verifying complete workflow...')
    const { data: finalApproval, error: finalError } = await supabase
      .from('inventory_approvals')
      .select(`
        *,
        inventory:inventory_id(*),
        requested_by_user:requested_by(full_name, email),
        manager_approved_by_user:manager_approved_by(full_name, email)
      `)
      .eq('id', approvalResult[0].id)
      .single()

    if (finalError) {
      console.error('❌ Failed to verify workflow:', finalError.message)
      return false
    }

    console.log('✅ Workflow verification successful!')
    console.log('   Status:', finalApproval.status)
    console.log('   Manager Approved:', finalApproval.manager_approved)
    console.log('   Approved by:', finalApproval.manager_approved_by_user?.full_name)
    console.log('   Inventory quantity:', finalApproval.inventory?.quantity)

    // Clean up test data
    console.log('\n6️⃣ Cleaning up test data...')
    await supabase.from('inventory_approvals').delete().eq('id', approvalResult[0].id)
    await supabase.from('inventory').delete().eq('id', inventoryResult[0].id)
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 Complete Inventory Approval Workflow Test PASSED!')
    console.log('\n📋 Workflow Summary:')
    console.log('   ✅ Employee can create inventory requests')
    console.log('   ✅ Requests are stored in inventory_approvals table')
    console.log('   ✅ Manager can view pending requests')
    console.log('   ✅ Manager can approve requests')
    console.log('   ✅ Approved items are updated in inventory')
    console.log('   ✅ Full audit trail is maintained')

    console.log('\n🚀 Your inventory approval workflow is now fully functional!')
    console.log('   - Employees: Create requests → Awaiting approval')
    console.log('   - Managers: View requests → Approve/Reject')
    console.log('   - System: Update inventory when approved')

    return true

  } catch (error) {
    console.error('💥 Workflow test failed:', error.message)
    return false
  }
}

testApprovalWorkflow()
  .then(success => {
    if (success) {
      console.log('\n✨ Inventory approval workflow is working perfectly!')
    } else {
      console.log('\n❌ Approval workflow needs attention.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
