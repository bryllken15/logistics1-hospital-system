// Test workaround approach for total_value column issue
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testWorkaroundApproach() {
  console.log('🔧 Testing workaround approach...\n')

  try {
    // Approach 1: Try to insert with explicit column exclusion
    console.log('1️⃣ Testing explicit column exclusion...')
    
    // First, let's see what columns are actually available
    const { data: sampleData, error: sampleError } = await supabase
      .from('inventory')
      .select('*')
      .limit(1)

    if (sampleError) {
      console.log('❌ Cannot get sample data:', sampleError.message)
      return
    }

    console.log('📋 Available columns:', Object.keys(sampleData[0] || {}))
    
    // Try to insert with only the columns we know work
    const workingColumns = {
      item_name: 'Workaround Test Item',
      rfid_code: `RFID-WORKAROUND-${Date.now()}`,
      quantity: 3,
      status: 'pending_approval',
      location: 'Test Location',
      unit_price: 20.00,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    console.log('\n2️⃣ Testing insert with working columns only...')
    const { data: insertResult, error: insertError } = await supabase
      .from('inventory')
      .insert(workingColumns)
      .select('id, item_name, quantity, unit_price, status, location, created_by')

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message)
      
      // If it's still the total_value error, let's try a different approach
      if (insertError.message.includes('total_value')) {
        console.log('\n🔍 The total_value column is still causing issues.')
        console.log('   This suggests that Supabase is automatically trying to insert')
        console.log('   into the total_value column even when we don\'t specify it.')
        
        console.log('\n💡 Let\'s try a different approach - using raw SQL...')
        
        // Try using the rpc function to execute raw SQL
        const { data: sqlResult, error: sqlError } = await supabase
          .rpc('exec_sql', {
            sql: `
              INSERT INTO public.inventory (
                item_name, 
                rfid_code, 
                quantity, 
                status, 
                location, 
                unit_price, 
                created_by
              ) VALUES (
                'SQL Test Item', 
                'RFID-SQL-${Date.now()}', 
                2, 
                'pending_approval', 
                'Test Location', 
                25.00, 
                'dbbd608b-377f-4368-b61e-102f1f727f4f'
              ) RETURNING id, item_name, quantity, unit_price;
            `
          })
        
        if (sqlError) {
          console.log('❌ SQL insert failed:', sqlError.message)
        } else {
          console.log('✅ SQL insert successful!')
          console.log('📋 Result:', sqlResult)
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

testWorkaroundApproach()
  .then(() => {
    console.log('\n✨ Workaround test complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
