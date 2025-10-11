// Test final approach
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testFinalApproach() {
  console.log('🔧 Testing final approach...\n')

  try {
    // Try to insert with different data structure
    const { data: result, error } = await supabase
      .from('inventory')
      .insert({
        item_name: 'Final Approach Test',
        rfid_code: `RFID-FINAL-${Date.now()}`,
        quantity: 3,
        status: 'pending_approval',
        location: 'Test Location',
        unit_price: 20.00,
        created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
      })
      .select('id, item_name, quantity, unit_price')

    if (error) {
      console.log('❌ Insert failed:', error.message)
    } else {
      console.log('✅ Insert successful!')
      console.log('📋 Result:', result[0])
      
      // Clean up
      await supabase.from('inventory').delete().eq('id', result[0].id)
      console.log('✅ Test data cleaned up')
    }

  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

testFinalApproach()
  .then(() => {
    console.log('\n✨ Final approach test complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
