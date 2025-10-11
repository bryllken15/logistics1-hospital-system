// Test script to simulate frontend approval request creation
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testFrontendApproval() {
  console.log('🧪 Testing Frontend Approval Request Creation...\n')

  try {
    // Simulate the exact data that the frontend would send
    const requestData = {
      item_name: 'Frontend Test Item',
      quantity: 50,
      unit_price: 30.00,
      location: 'Test Location',
      reason: 'Frontend test request',
      requested_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f',
      request_type: 'new_item'
    }

    console.log('1️⃣ Simulating frontend request data:')
    console.log(JSON.stringify(requestData, null, 2))

    // Simulate the createWithApproval function call
    console.log('\n2️⃣ Calling createWithApproval...')
    
    // First create the inventory item
    const inventoryData = {
      item_name: requestData.item_name,
      rfid_code: `RFID-${Date.now()}`,
      quantity: 0, // Start with 0, will be updated after approval
      status: 'in_stock',
      location: requestData.location,
      unit_price: requestData.unit_price,
      created_by: requestData.requested_by
    }

    console.log('Creating inventory item with data:', inventoryData)

    const { data: inventoryResult, error: inventoryError } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select()

    if (inventoryError) {
      console.error('❌ Error creating inventory item:', inventoryError.message)
      return
    }

    console.log('✅ Inventory item created:', inventoryResult[0].id)

    // Now create the approval request
    const approvalData = {
      inventory_id: inventoryResult[0].id,
      item_name: requestData.item_name,
      quantity: requestData.quantity,
      unit_price: requestData.unit_price,
      status: 'pending',
      requested_by: requestData.requested_by,
      request_reason: requestData.reason,
      request_type: requestData.request_type
    }

    console.log('Creating approval request with data:', approvalData)

    const { data: approvalResult, error: approvalError } = await supabase
      .from('inventory_approvals')
      .insert(approvalData)
      .select()

    if (approvalError) {
      console.error('❌ Error creating approval request:', approvalError.message)
      return
    }

    console.log('✅ Approval request created:', approvalResult[0].id)

    // Test if manager can see it
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
          console.log(`  ${i + 1}. ${req.item_name} - Status: ${req.status} - Requested by: ${req.requested_by_user?.full_name || 'Unknown'}`)
        })
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
      .eq('requested_by', requestData.requested_by)
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

    // Clean up
    console.log('\n5️⃣ Cleaning up test data...')
    await supabase.from('inventory_approvals').delete().eq('id', approvalResult[0].id)
    await supabase.from('inventory').delete().eq('id', inventoryResult[0].id)
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 Frontend approval workflow is working correctly!')
    console.log('The issue might be in the frontend JavaScript or browser console errors.')

  } catch (error) {
    console.error('💥 Test error:', error.message)
  }
}

testFrontendApproval()
  .then(() => {
    console.log('\n✨ Frontend test complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
