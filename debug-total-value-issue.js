// Debug total_value issue
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugTotalValueIssue() {
  console.log('🔍 Debugging total_value issue...\n')

  try {
    // Step 1: Check what columns are actually being sent
    console.log('1️⃣ Checking what columns are being sent...')
    
    const testData = {
      item_name: 'Debug Test Item',
      rfid_code: `RFID-DEBUG-${Date.now()}`,
      quantity: 1,
      status: 'pending_approval',
      location: 'Test Location',
      unit_price: 10.00,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    console.log('📋 Data being sent:', testData)
    console.log('📋 Keys in data:', Object.keys(testData))
    console.log('📋 Does data include total_value?', 'total_value' in testData)

    // Step 2: Try to insert with explicit column selection
    console.log('\n2️⃣ Trying insert with explicit column selection...')
    const { data: result, error } = await supabase
      .from('inventory')
      .insert(testData)
      .select('id, item_name, quantity, unit_price, status, location, created_by')

    if (error) {
      console.log('❌ Insert failed:', error.message)
      console.log('📋 Full error:', error)
      
      // Check if it's specifically the total_value error
      if (error.message.includes('total_value')) {
        console.log('\n🔍 The issue is still with total_value!')
        console.log('   This suggests that Supabase is automatically trying to insert')
        console.log('   into the total_value column even when we don\'t specify it.')
        console.log('   This could be due to:')
        console.log('   1. A trigger on the table')
        console.log('   2. The column definition is not properly set as generated')
        console.log('   3. Supabase is automatically including all columns')
      }
    } else {
      console.log('✅ Insert successful!')
      console.log('📋 Result:', result[0])
      
      // Clean up
      await supabase.from('inventory').delete().eq('id', result[0].id)
      console.log('✅ Test data cleaned up')
    }

    // Step 3: Try to check the table structure
    console.log('\n3️⃣ Checking table structure...')
    const { data: tableInfo, error: tableInfoError } = await supabase
      .from('inventory')
      .select('*')
      .limit(0)

    if (tableInfoError) {
      console.log('❌ Cannot get table info:', tableInfoError.message)
    } else {
      console.log('✅ Table is accessible')
    }

  } catch (error) {
    console.error('💥 Debug error:', error.message)
  }
}

debugTotalValueIssue()
  .then(() => {
    console.log('\n✨ Debug complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })

