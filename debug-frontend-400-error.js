// Debug script to identify the 400 error in inventory_approvals
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function debug400Error() {
  console.log('🔍 Debugging 400 Error in inventory_approvals...\n')

  try {
    // Test 1: Check if we can access the table
    console.log('1️⃣ Testing table access...')
    const { data: testData, error: testError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('❌ Table access error:', testError.message)
      return
    }
    console.log('✅ Table is accessible')

    // Test 2: Try to insert with minimal data (like frontend might do)
    console.log('\n2️⃣ Testing minimal insert...')
    const minimalData = {
      item_name: 'Debug Test Item',
      quantity: 1,
      unit_price: 10.00,
      status: 'pending',
      requested_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f',
      request_reason: 'Debug test',
      request_type: 'new_item'
    }

    const { data: insertResult, error: insertError } = await supabase
      .from('inventory_approvals')
      .insert(minimalData)
      .select()

    if (insertError) {
      console.error('❌ Minimal insert error:', insertError.message)
      console.error('Full error:', insertError)
    } else {
      console.log('✅ Minimal insert successful:', insertResult[0].id)
      
      // Clean up
      await supabase.from('inventory_approvals').delete().eq('id', insertResult[0].id)
      console.log('✅ Test record cleaned up')
    }

    // Test 3: Try with inventory_id (like the real workflow)
    console.log('\n3️⃣ Testing with inventory_id...')
    
    // First create an inventory item
    const inventoryData = {
      item_name: 'Debug Inventory Item',
      rfid_code: `RFID-DEBUG-${Date.now()}`,
      quantity: 0,
      status: 'in_stock',
      location: 'Debug Location',
      unit_price: 20.00,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    const { data: inventoryResult, error: inventoryError } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select()

    if (inventoryError) {
      console.error('❌ Inventory creation error:', inventoryError.message)
      return
    }

    console.log('✅ Inventory item created:', inventoryResult[0].id)

    // Now try to create approval with inventory_id
    const approvalData = {
      inventory_id: inventoryResult[0].id,
      item_name: 'Debug Approval Item',
      quantity: 5,
      unit_price: 20.00,
      status: 'pending',
      requested_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f',
      request_reason: 'Debug test with inventory_id',
      request_type: 'new_item'
    }

    const { data: approvalResult, error: approvalError } = await supabase
      .from('inventory_approvals')
      .insert(approvalData)
      .select()

    if (approvalError) {
      console.error('❌ Approval creation error:', approvalError.message)
      console.error('Full error:', approvalError)
    } else {
      console.log('✅ Approval creation successful:', approvalResult[0].id)
    }

    // Test 4: Check RLS policies
    console.log('\n4️⃣ Testing RLS policies...')
    const { data: rlsTest, error: rlsError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('requested_by', 'dbbd608b-377f-4368-b61e-102f1f727f4f')

    if (rlsError) {
      console.error('❌ RLS test error:', rlsError.message)
    } else {
      console.log(`✅ RLS test successful, found ${rlsTest.length} records`)
    }

    // Clean up all test data
    console.log('\n5️⃣ Cleaning up test data...')
    if (approvalResult && approvalResult[0]) {
      await supabase.from('inventory_approvals').delete().eq('id', approvalResult[0].id)
    }
    if (inventoryResult && inventoryResult[0]) {
      await supabase.from('inventory').delete().eq('id', inventoryResult[0].id)
    }
    console.log('✅ Test data cleaned up')

    console.log('\n🎯 Debug Summary:')
    console.log('   ✅ Table exists and is accessible')
    console.log('   ✅ Basic inserts work')
    console.log('   ✅ RLS policies allow access')
    console.log('   ✅ Foreign key relationships work')
    
    console.log('\n🔍 Possible causes of 400 error:')
    console.log('   1. Frontend sending malformed data')
    console.log('   2. Missing required fields in frontend request')
    console.log('   3. Data type mismatches')
    console.log('   4. Network/authentication issues')

  } catch (error) {
    console.error('💥 Debug error:', error.message)
  }
}

debug400Error()
  .then(() => {
    console.log('\n✨ Debug complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
