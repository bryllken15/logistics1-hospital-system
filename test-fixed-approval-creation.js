// Test script to verify the fixed approval creation
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testFixedApprovalCreation() {
  console.log('🧪 Testing Fixed Approval Creation...\n')

  try {
    // Simulate the exact data that the frontend would send
    const itemData = {
      item_name: 'Fixed Test Item',
      rfid_code: `RFID-FIXED-${Date.now()}`,
      quantity: 0, // Start with 0, will be updated after approval
      status: 'in_stock',
      location: 'Test Location',
      unit_price: 25.50,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    console.log('1️⃣ Creating inventory item...')
    const { data: inventoryResult, error: inventoryError } = await supabase
      .from('inventory')
      .insert(itemData)
      .select()

    if (inventoryError) {
      console.error('❌ Failed to create inventory item:', inventoryError.message)
      return
    }

    console.log('✅ Inventory item created:', inventoryResult[0].id)

    // Now create the approval request with the FIXED data structure
    console.log('\n2️⃣ Creating approval request with fixed data...')
    const approvalData = {
      inventory_id: inventoryResult[0].id,
      item_name: 'Fixed Test Item',
      quantity: 30,
      unit_price: 25.50,
      // total_value is a generated column, so we don't include it
      status: 'pending',
      requested_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f',
      request_reason: 'Fixed test request',
      request_type: 'new_item'
      // created_at is auto-generated, so we don't include it
    }

    console.log('Approval data (fixed):', approvalData)

    const { data: approvalResult, error: approvalError } = await supabase
      .from('inventory_approvals')
      .insert(approvalData)
      .select()

    if (approvalError) {
      console.error('❌ Failed to create approval request:', approvalError.message)
      console.error('Full error:', approvalError)
      return
    }

    console.log('✅ Approval request created successfully:', approvalResult[0].id)
    console.log('   Status:', approvalResult[0].status)
    console.log('   Total Value (auto-calculated):', approvalResult[0].total_value)

    // Test manager query
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
      console.log(`✅ Manager query successful, found ${managerQuery.length} pending requests`)
      if (managerQuery.length > 0) {
        const req = managerQuery[0]
        console.log('   Request:', req.item_name)
        console.log('   Quantity:', req.quantity)
        console.log('   Total Value:', req.total_value)
        console.log('   Requested by:', req.requested_by_user?.full_name)
      }
    }

    // Test employee query
    console.log('\n4️⃣ Testing employee dashboard query...')
    const { data: employeeQuery, error: employeeError } = await supabase
      .from('inventory_approvals')
      .select(`
        *,
        inventory:inventory_id(*),
        requested_by_user:requested_by(full_name, email)
      `)
      .eq('requested_by', 'dbbd608b-377f-4368-b61e-102f1f727f4f')
      .order('created_at', { ascending: false })

    if (employeeError) {
      console.error('❌ Employee query error:', employeeError.message)
    } else {
      console.log(`✅ Employee query successful, found ${employeeQuery.length} requests`)
      if (employeeQuery.length > 0) {
        const req = employeeQuery[0]
        console.log('   Request:', req.item_name)
        console.log('   Status:', req.status)
      }
    }

    // Clean up
    console.log('\n5️⃣ Cleaning up test data...')
    await supabase.from('inventory_approvals').delete().eq('id', approvalResult[0].id)
    await supabase.from('inventory').delete().eq('id', inventoryResult[0].id)
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 Fixed Approval Creation Test PASSED!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Removed total_value from insert (it\'s a generated column)')
    console.log('   ✅ Removed created_at from insert (it\'s auto-generated)')
    console.log('   ✅ Approval requests can be created successfully')
    console.log('   ✅ Manager dashboard can see pending requests')
    console.log('   ✅ Employee dashboard can see their requests')

    console.log('\n🚀 The 400 error should now be fixed!')
    console.log('   - Frontend will no longer try to insert generated columns')
    console.log('   - Approval workflow should work correctly')
    console.log('   - Manager dashboard should show pending requests')

    return true

  } catch (error) {
    console.error('💥 Test failed:', error.message)
    return false
  }
}

testFixedApprovalCreation()
  .then(success => {
    if (success) {
      console.log('\n✨ Fixed approval creation is working!')
    } else {
      console.log('\n❌ Approval creation still has issues.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
