// Check inventory table schema to see what columns exist
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkInventorySchema() {
  console.log('🔍 Checking inventory table schema...\n')

  try {
    // Try to get table info by doing a simple select
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error accessing inventory table:', error.message)
      console.error('Full error:', error)
    } else {
      console.log('✅ Inventory table accessible')
      if (data && data.length > 0) {
        console.log('📋 Available columns:')
        Object.keys(data[0]).forEach(column => {
          console.log(`   - ${column}: ${typeof data[0][column]}`)
        })
      } else {
        console.log('📋 Table is empty, but accessible')
      }
    }

    // Try to create a test record to see what columns are required
    console.log('\n🧪 Testing column requirements...')
    const testData = {
      item_name: 'Schema Test Item',
      rfid_code: `RFID-SCHEMA-${Date.now()}`,
      quantity: 0,
      status: 'pending_approval',
      location: 'Test Location',
      unit_price: 10.00,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    const { data: testResult, error: testError } = await supabase
      .from('inventory')
      .insert(testData)
      .select()

    if (testError) {
      console.error('❌ Test insert error:', testError.message)
      console.error('This tells us which columns are problematic')
    } else {
      console.log('✅ Test insert successful!')
      console.log('📋 Inserted data:', testResult[0])
      
      // Clean up test data
      await supabase.from('inventory').delete().eq('id', testResult[0].id)
      console.log('✅ Test data cleaned up')
    }

  } catch (error) {
    console.error('💥 Check error:', error.message)
  }
}

checkInventorySchema()
  .then(() => {
    console.log('\n✨ Schema check complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
