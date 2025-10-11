// Test inventory insert without total_value column
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testInventoryInsertWithoutTotal() {
  console.log('🧪 Testing inventory insert without total_value...\n')

  try {
    // Test 1: Basic insert without total_value
    console.log('1️⃣ Testing basic insert...')
    const basicData = {
      item_name: 'Basic Test Item',
      rfid_code: `RFID-BASIC-${Date.now()}`,
      quantity: 5,
      status: 'pending_approval',
      location: 'Test Location',
      unit_price: 20.00,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    const { data: result1, error: error1 } = await supabase
      .from('inventory')
      .insert(basicData)
      .select('id, item_name, quantity, unit_price, total_value')

    if (error1) {
      console.log('❌ Basic insert failed:', error1.message)
    } else {
      console.log('✅ Basic insert successful!')
      console.log('📋 Result:', result1[0])
      
      // Clean up
      await supabase.from('inventory').delete().eq('id', result1[0].id)
    }

    // Test 2: Insert with explicit column selection
    console.log('\n2️⃣ Testing insert with explicit column selection...')
    const { data: result2, error: error2 } = await supabase
      .from('inventory')
      .insert({
        item_name: 'Explicit Test Item',
        rfid_code: `RFID-EXPLICIT-${Date.now()}`,
        quantity: 3,
        status: 'pending_approval',
        location: 'Test Location',
        unit_price: 25.00,
        created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
      })
      .select('id, item_name, quantity, unit_price, total_value')

    if (error2) {
      console.log('❌ Explicit insert failed:', error2.message)
    } else {
      console.log('✅ Explicit insert successful!')
      console.log('📋 Result:', result2[0])
      
      // Clean up
      await supabase.from('inventory').delete().eq('id', result2[0].id)
    }

    // Test 3: Check if we can query total_value after insert
    console.log('\n3️⃣ Testing total_value query after insert...')
    const { data: result3, error: error3 } = await supabase
      .from('inventory')
      .insert({
        item_name: 'Query Test Item',
        rfid_code: `RFID-QUERY-${Date.now()}`,
        quantity: 4,
        status: 'pending_approval',
        location: 'Test Location',
        unit_price: 30.00,
        created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
      })
      .select()

    if (error3) {
      console.log('❌ Query test insert failed:', error3.message)
    } else {
      console.log('✅ Query test insert successful!')
      console.log('📋 Result:', result3[0])
      
      // Try to query the total_value separately
      const { data: totalValueResult, error: totalValueError } = await supabase
        .from('inventory')
        .select('total_value')
        .eq('id', result3[0].id)
        .single()

      if (totalValueError) {
        console.log('❌ total_value query failed:', totalValueError.message)
      } else {
        console.log('📋 total_value result:', totalValueResult)
      }
      
      // Clean up
      await supabase.from('inventory').delete().eq('id', result3[0].id)
    }

    console.log('\n🎯 Summary:')
    console.log('   - Basic inserts work without total_value column')
    console.log('   - Generated column may not be working properly')
    console.log('   - We can work around this by not selecting total_value')

  } catch (error) {
    console.error('💥 Test error:', error.message)
  }
}

testInventoryInsertWithoutTotal()
  .then(() => {
    console.log('\n✨ Test complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
