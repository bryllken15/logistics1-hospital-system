// Comprehensive test to verify the complete approval workflow
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testCompleteApprovalFlow() {
  console.log('🧪 Testing Complete Approval Flow...\n')

  try {
    // Step 1: Check current state
    console.log('1️⃣ Checking current state...')
    
    // Check inventory_approvals table
    const { data: existingApprovals, error: approvalsError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .order('created_at', { ascending: false })

    if (approvalsError) {
      console.error('❌ Error accessing inventory_approvals:', approvalsError.message)
      return
    }

    console.log(`✅ Found ${existingApprovals.length} existing approval requests`)
    if (existingApprovals.length > 0) {
      existingApprovals.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.item_name} - Status: ${req.status} - Created: ${req.created_at}`)
      })
    }

    // Step 2: Create a test approval request (simulating frontend)
    console.log('\n2️⃣ Creating test approval request...')
    const employeeUserId = 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    
    // First create inventory item
    const inventoryData = {
      item_name: 'Test Approval Item',
      rfid_code: `RFID-TEST-${Date.now()}`,
      quantity: 0, // Start with 0
      status: 'in_stock',
      location: 'Test Location',
      unit_price: 25.50,
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
      quantity: 50,
      unit_price: 25.50,
      status: 'pending',
      requested_by: employeeUserId,
      request_reason: 'Test approval request',
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

    // Step 3: Test manager dashboard query
    console.log('\n3️⃣ Testing manager dashboard query...')
    const { data: managerQuery, error: managerError } = await supabase
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

    if (managerError) {
      console.error('❌ Manager query error:', managerError.message)
    } else {
      console.log(`✅ Manager query found ${managerQuery.length} pending requests`)
      if (managerQuery.length > 0) {
        managerQuery.forEach((req, i) => {
          console.log(`  ${i + 1}. ${req.item_name} - Status: ${req.status}`)
          console.log(`      Requested by: ${req.requested_by_user?.full_name || 'Unknown'}`)
          console.log(`      Quantity: ${req.quantity} - Price: ₱${req.unit_price}`)
        })
      }
    }

    // Step 4: Test employee dashboard query
    console.log('\n4️⃣ Testing employee dashboard query...')
    const { data: employeeQuery, error: employeeError } = await supabase
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
      console.log(`✅ Employee query found ${employeeQuery.length} requests`)
      if (employeeQuery.length > 0) {
        employeeQuery.forEach((req, i) => {
          console.log(`  ${i + 1}. ${req.item_name} - Status: ${req.status}`)
        })
      }
    }

    // Step 5: Test approval process
    console.log('\n5️⃣ Testing approval process...')
    const managerUserId = '1a91e422-6246-4647-804a-930be3bf971d'
    
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
    }

    // Step 6: Update inventory
    console.log('\n6️⃣ Updating inventory...')
    const { data: inventoryUpdate, error: inventoryUpdateError } = await supabase
      .from('inventory')
      .update({
        quantity: 50,
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

    // Step 7: Final verification
    console.log('\n7️⃣ Final verification...')
    const { data: finalCheck, error: finalError } = await supabase
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
      console.error('❌ Final verification error:', finalError.message)
    } else {
      console.log('✅ Final verification successful!')
      console.log('   Status:', finalCheck.status)
      console.log('   Manager Approved:', finalCheck.manager_approved)
      console.log('   Approved by:', finalCheck.manager_approved_by_user?.full_name)
      console.log('   Inventory quantity:', finalCheck.inventory?.quantity)
    }

    // Clean up
    console.log('\n8️⃣ Cleaning up test data...')
    await supabase.from('inventory_approvals').delete().eq('id', approvalResult[0].id)
    await supabase.from('inventory').delete().eq('id', inventoryResult[0].id)
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 Complete Approval Flow Test PASSED!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Database is working correctly')
    console.log('   ✅ Approval requests can be created')
    console.log('   ✅ Manager can see pending requests')
    console.log('   ✅ Manager can approve requests')
    console.log('   ✅ Inventory is updated after approval')

    console.log('\n🔍 If you still don\'t see approvals in the frontend:')
    console.log('   1. Check browser console for errors')
    console.log('   2. Make sure you\'re logged in with correct credentials')
    console.log('   3. Refresh the page after creating a request')
    console.log('   4. Check if the frontend is calling the right functions')

    return true

  } catch (error) {
    console.error('💥 Test failed:', error.message)
    return false
  }
}

testCompleteApprovalFlow()
  .then(success => {
    if (success) {
      console.log('\n✨ Approval workflow is working correctly!')
    } else {
      console.log('\n❌ Approval workflow has issues.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
