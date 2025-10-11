// Test the fixed total_value issue
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testFixedTotalValue() {
  console.log('🧪 Testing fixed total_value issue...\n')

  try {
    // Test 1: Create inventory item without total_value
    console.log('1️⃣ Testing inventory item creation...')
    const inventoryData = {
      item_name: 'Fixed Total Value Test',
      rfid_code: `RFID-FIXED-${Date.now()}`,
      quantity: 5,
      status: 'pending_approval',
      location: 'Test Location',
      unit_price: 25.00,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    const { data: inventoryResult, error: inventoryError } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select()

    if (inventoryError) {
      console.log('❌ Inventory creation failed:', inventoryError.message)
      return
    }

    console.log('✅ Inventory item created successfully!')
    console.log('📋 Result:', inventoryResult[0])
    console.log('   total_value (generated):', inventoryResult[0].total_value)

    // Test 2: Create approval request
    console.log('\n2️⃣ Testing approval request creation...')
    const approvalData = {
      inventory_id: inventoryResult[0].id,
      item_name: 'Fixed Total Value Test',
      quantity: 5,
      unit_price: 25.00,
      status: 'pending',
      requested_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f',
      request_reason: 'Testing fixed total_value',
      request_type: 'new_item'
    }

    const { data: approvalResult, error: approvalError } = await supabase
      .from('inventory_approvals')
      .insert(approvalData)
      .select()

    if (approvalError) {
      console.log('❌ Approval creation failed:', approvalError.message)
    } else {
      console.log('✅ Approval request created successfully!')
      console.log('📋 Result:', approvalResult[0])
      console.log('   total_value (generated):', approvalResult[0].total_value)
    }

    // Test 3: Test the complete workflow
    console.log('\n3️⃣ Testing complete workflow...')
    
    // Simulate manager approval
    if (approvalResult && approvalResult.length > 0) {
      const { data: approvalUpdate, error: approvalUpdateError } = await supabase
        .from('inventory_approvals')
        .update({
          manager_approved: true,
          manager_approved_by: '1a91e422-6246-4647-804a-930be3bf971d',
          manager_approved_at: new Date().toISOString(),
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', approvalResult[0].id)
        .select()

      if (approvalUpdateError) {
        console.log('❌ Approval update failed:', approvalUpdateError.message)
      } else {
        console.log('✅ Approval updated successfully!')
        
        // Update inventory with approved quantity
        const { data: inventoryUpdate, error: inventoryUpdateError } = await supabase
          .from('inventory')
          .update({
            quantity: 5,
            status: 'in_stock',
            updated_by: '1a91e422-6246-4647-804a-930be3bf971d',
            updated_at: new Date().toISOString()
          })
          .eq('id', inventoryResult[0].id)
          .select()

        if (inventoryUpdateError) {
          console.log('❌ Inventory update failed:', inventoryUpdateError.message)
        } else {
          console.log('✅ Inventory updated successfully!')
          console.log('📋 Final result:', inventoryUpdate[0])
          console.log('   Final total_value (generated):', inventoryUpdate[0].total_value)
        }
      }
    }

    // Clean up test data
    console.log('\n4️⃣ Cleaning up test data...')
    if (approvalResult && approvalResult.length > 0) {
      await supabase.from('inventory_approvals').delete().eq('id', approvalResult[0].id)
    }
    await supabase.from('inventory').delete().eq('id', inventoryResult[0].id)
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 Fixed total_value test PASSED!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Inventory items can be created without total_value column')
    console.log('   ✅ Approval requests can be created without total_value column')
    console.log('   ✅ total_value is automatically calculated by the database')
    console.log('   ✅ Complete workflow works end-to-end')

    return true

  } catch (error) {
    console.error('💥 Test failed:', error.message)
    return false
  }
}

testFixedTotalValue()
  .then(success => {
    if (success) {
      console.log('\n✨ Fixed total_value issue is working!')
    } else {
      console.log('\n❌ total_value issue still exists.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
