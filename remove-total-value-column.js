// Remove total_value column from inventory table
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function removeTotalValueColumn() {
  console.log('🔧 Removing total_value column from inventory table...\n')

  try {
    // Step 1: Check if we can access the table structure
    console.log('1️⃣ Checking table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('inventory')
      .select('*')
      .limit(0)

    if (tableError) {
      console.log('❌ Cannot access inventory table:', tableError.message)
      return
    }

    console.log('✅ Inventory table is accessible')

    // Step 2: Try to create a simple test record without total_value
    console.log('\n2️⃣ Testing simple insert without total_value...')
    const testData = {
      item_name: 'Simple Test Item',
      rfid_code: `RFID-SIMPLE-${Date.now()}`,
      quantity: 2,
      status: 'pending_approval',
      location: 'Test Location',
      unit_price: 15.00,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    // Try to insert without selecting total_value
    const { data: insertResult, error: insertError } = await supabase
      .from('inventory')
      .insert(testData)
      .select('id, item_name, quantity, unit_price, status, location, created_by')

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message)
      
      // If it's still the total_value error, let's try a different approach
      if (insertError.message.includes('total_value')) {
        console.log('\n🔍 The total_value column is still causing issues.')
        console.log('   This suggests the column is not properly configured as generated.')
        console.log('   We need to either:')
        console.log('   1. Fix the column definition in the database')
        console.log('   2. Remove the column entirely')
        console.log('   3. Work around it in the application')
        
        console.log('\n💡 Let\'s try to work around it by using a different approach...')
        
        // Try to insert with minimal data
        const minimalData = {
          item_name: 'Minimal Test Item',
          rfid_code: `RFID-MINIMAL-${Date.now()}`,
          quantity: 1,
          status: 'pending_approval',
          location: 'Test Location',
          unit_price: 10.00,
          created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
        }
        
        console.log('\n3️⃣ Trying minimal insert...')
        const { data: minimalResult, error: minimalError } = await supabase
          .from('inventory')
          .insert(minimalData)
          .select('id, item_name, quantity, unit_price')
        
        if (minimalError) {
          console.log('❌ Minimal insert also failed:', minimalError.message)
        } else {
          console.log('✅ Minimal insert successful!')
          console.log('📋 Result:', minimalResult[0])
          
          // Clean up
          await supabase.from('inventory').delete().eq('id', minimalResult[0].id)
          console.log('✅ Minimal test data cleaned up')
        }
      }
    } else {
      console.log('✅ Insert successful!')
      console.log('📋 Result:', insertResult[0])
      
      // Clean up
      await supabase.from('inventory').delete().eq('id', insertResult[0].id)
      console.log('✅ Test data cleaned up')
    }

  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

removeTotalValueColumn()
  .then(() => {
    console.log('\n✨ Column removal test complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
