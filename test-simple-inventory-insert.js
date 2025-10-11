// Simple test to see what's causing the total_value error
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSimpleInventoryInsert() {
  console.log('🧪 Testing simple inventory insert...\n')

  try {
    // Try the most basic insert possible
    const basicData = {
      item_name: 'Basic Test Item',
      rfid_code: `RFID-BASIC-${Date.now()}`,
      quantity: 0,
      status: 'pending_approval',
      location: 'Test Location',
      unit_price: 10.00,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    console.log('📋 Inserting data:', basicData)

    const { data: result, error } = await supabase
      .from('inventory')
      .insert(basicData)
      .select()

    if (error) {
      console.error('❌ Insert error:', error.message)
      console.error('Full error:', error)
      
      // Check if it's specifically the total_value column
      if (error.message.includes('total_value')) {
        console.log('\n🔍 The issue is with the total_value column!')
        console.log('   This suggests there might be a trigger or constraint')
        console.log('   that\'s trying to set total_value automatically.')
      }
    } else {
      console.log('✅ Insert successful!')
      console.log('📋 Result:', result[0])
      
      // Clean up
      await supabase.from('inventory').delete().eq('id', result[0].id)
      console.log('✅ Test data cleaned up')
    }

  } catch (error) {
    console.error('💥 Test error:', error.message)
  }
}

testSimpleInventoryInsert()
  .then(() => {
    console.log('\n✨ Simple test complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
