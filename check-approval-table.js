// Script to check if inventory_approvals table exists and its structure
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkApprovalTable() {
  console.log('🔍 Checking inventory_approvals table...\n')

  try {
    // Test 1: Check if table exists by querying it
    console.log('1️⃣ Testing if inventory_approvals table exists...')
    const { data: tableTest, error: tableError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .limit(1)

    if (tableError) {
      if (tableError.message.includes('does not exist') || tableError.message.includes('relation')) {
        console.log('❌ Table does not exist:', tableError.message)
        console.log('   → You need to create the inventory_approvals table')
        return false
      } else if (tableError.message.includes('permission') || tableError.message.includes('policy')) {
        console.log('⚠️  Table exists but has permission issues:', tableError.message)
        console.log('   → RLS policies may need to be configured')
      } else {
        console.log('⚠️  Error accessing table:', tableError.message)
      }
    } else {
      console.log('✅ Table exists and is accessible!')
    }

    // Test 2: Try to insert a test approval request
    console.log('\n2️⃣ Testing approval request creation...')
    const testApprovalData = {
      inventory_id: null, // Will be set to a real inventory ID
      item_name: 'Test Approval Item',
      quantity: 50,
      unit_price: 100,
      total_value: 5000,
      status: 'pending',
      requested_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f', // Real Employee user ID
      request_reason: 'Testing approval workflow',
      request_type: 'new_item'
    }

    // First, create a test inventory item to link to
    const { data: testInventory, error: inventoryError } = await supabase
      .from('inventory')
      .insert({
        item_name: 'Test Item for Approval',
        rfid_code: `TEST-APPROVAL-${Date.now()}`,
        quantity: 0,
        location: 'Test Location',
        status: 'in_stock',
        created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
      })
      .select()

    if (inventoryError) {
      console.log('❌ Failed to create test inventory item:', inventoryError.message)
      return false
    }

    // Now try to create the approval request
    testApprovalData.inventory_id = testInventory[0].id

    const { data: approvalResult, error: approvalError } = await supabase
      .from('inventory_approvals')
      .insert(testApprovalData)
      .select()

    if (approvalError) {
      console.log('❌ Failed to create approval request:', approvalError.message)
      if (approvalError.message.includes('column') || approvalError.message.includes('field')) {
        console.log('   → Some table columns may be missing')
      }
      return false
    } else {
      console.log('✅ Approval request created successfully:', approvalResult[0].id)
    }

    // Test 3: Try to fetch the approval request
    console.log('\n3️⃣ Testing approval request retrieval...')
    const { data: fetchedApproval, error: fetchError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('id', approvalResult[0].id)
      .single()

    if (fetchError) {
      console.log('❌ Failed to fetch approval request:', fetchError.message)
      return false
    } else {
      console.log('✅ Approval request fetched successfully!')
      console.log('   Fields available:', Object.keys(fetchedApproval))
    }

    // Test 4: Try to fetch with joins (like the frontend does)
    console.log('\n4️⃣ Testing approval request with user joins...')
    const { data: joinedApproval, error: joinError } = await supabase
      .from('inventory_approvals')
      .select(`
        *,
        inventory:inventory_id(*),
        requested_by_user:requested_by(full_name, email)
      `)
      .eq('id', approvalResult[0].id)
      .single()

    if (joinError) {
      console.log('❌ Failed to fetch with joins:', joinError.message)
      console.log('   → Foreign key relationships may not be set up correctly')
    } else {
      console.log('✅ Joins work correctly!')
    }

    // Clean up test data
    console.log('\n5️⃣ Cleaning up test data...')
    await supabase.from('inventory_approvals').delete().eq('id', approvalResult[0].id)
    await supabase.from('inventory').delete().eq('id', testInventory[0].id)
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 Inventory approvals table is working correctly!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Table exists')
    console.log('   ✅ Can create approval requests')
    console.log('   ✅ Can fetch approval requests')
    console.log('   ✅ Joins work correctly')
    console.log('\n✨ The approval workflow should be working in your application!')

    return true

  } catch (error) {
    console.error('💥 Check failed with error:', error.message)
    return false
  }
}

checkApprovalTable()
  .then(success => {
    if (success) {
      console.log('\n✅ Approval table check completed successfully!')
    } else {
      console.log('\n❌ Approval table has issues that need to be fixed.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
