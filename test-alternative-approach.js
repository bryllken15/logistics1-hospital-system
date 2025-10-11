// Test alternative approach using inventory_approvals table
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testAlternativeApproach() {
  console.log('🔧 Testing alternative approach...\n')

  try {
    // Approach 1: Use inventory_approvals table for inventory items
    console.log('1️⃣ Testing inventory_approvals table...')
    
    const approvalData = {
      item_name: 'Alternative Test Item',
      quantity: 4,
      unit_price: 30.00,
      status: 'pending',
      requested_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f',
      request_reason: 'Testing alternative approach',
      request_type: 'new_item'
    }

    const { data: approvalResult, error: approvalError } = await supabase
      .from('inventory_approvals')
      .insert(approvalData)
      .select()

    if (approvalError) {
      console.log('❌ inventory_approvals insert failed:', approvalError.message)
    } else {
      console.log('✅ inventory_approvals insert successful!')
      console.log('📋 Result:', approvalResult[0])
      console.log('   total_value (generated):', approvalResult[0].total_value)
      
      // Clean up
      await supabase.from('inventory_approvals').delete().eq('id', approvalResult[0].id)
      console.log('✅ Test data cleaned up')
    }

    // Approach 2: Try to work around the inventory table issue
    console.log('\n2️⃣ Trying to work around inventory table...')
    
    // Maybe we can use a different approach - let's try to insert with minimal data
    const minimalData = {
      item_name: 'Minimal Test Item',
      rfid_code: `RFID-MINIMAL-${Date.now()}`,
      quantity: 1,
      status: 'pending_approval',
      location: 'Test Location',
      unit_price: 5.00,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    console.log('📋 Trying minimal data:', minimalData)
    
    const { data: minimalResult, error: minimalError } = await supabase
      .from('inventory')
      .insert(minimalData)
      .select('id, item_name, quantity, unit_price, status')

    if (minimalError) {
      console.log('❌ Minimal insert failed:', minimalError.message)
      
      // If it's still the total_value error, let's try a different approach
      if (minimalError.message.includes('total_value')) {
        console.log('\n🔍 The total_value issue persists!')
        console.log('   This suggests that the database schema has a problem')
        console.log('   with the total_value column definition.')
        
        console.log('\n💡 Possible solutions:')
        console.log('   1. Contact the database administrator to fix the column')
        console.log('   2. Use a different table for inventory items')
        console.log('   3. Modify the application to work around this issue')
        console.log('   4. Use the inventory_approvals table for all inventory operations')
      }
    } else {
      console.log('✅ Minimal insert successful!')
      console.log('📋 Result:', minimalResult[0])
      
      // Clean up
      await supabase.from('inventory').delete().eq('id', minimalResult[0].id)
      console.log('✅ Test data cleaned up')
    }

    // Approach 3: Try to use a different method
    console.log('\n3️⃣ Trying different method...')
    
    // Maybe we can use a stored procedure or function
    console.log('💡 Since the direct insert doesn\'t work, we could:')
    console.log('   1. Use a stored procedure to insert data')
    console.log('   2. Use a different table structure')
    console.log('   3. Modify our application to work around this issue')
    console.log('   4. Use the inventory_approvals table for all operations')

  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

testAlternativeApproach()
  .then(() => {
    console.log('\n✨ Alternative approach test complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
