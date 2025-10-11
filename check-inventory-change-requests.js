// Check if inventory_change_requests table exists and is causing 400 errors
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkInventoryChangeRequests() {
  console.log('🔍 Checking inventory_change_requests table...\n')

  try {
    // Check if table exists
    console.log('1️⃣ Checking if inventory_change_requests table exists...')
    const { data: testData, error: testError } = await supabase
      .from('inventory_change_requests')
      .select('*')
      .limit(0)

    if (testError) {
      console.error('❌ Table access error:', testError.message)
      
      if (testError.message.includes('relation "inventory_change_requests" does not exist')) {
        console.log('🔧 Table does not exist. This is causing the 400 errors.')
        console.log('   The frontend is trying to query a table that doesn\'t exist.')
        console.log('   This is likely from the Manager Dashboard trying to load inventory change requests.')
        return
      }
    } else {
      console.log('✅ Table exists and is accessible')
    }

    // Test the exact query that's failing
    console.log('\n2️⃣ Testing the failing query...')
    const { data: queryResult, error: queryError } = await supabase
      .from('inventory_change_requests')
      .select(`
        *,
        inventory:inventory_id(id, item_name, rfid_code),
        changed_by_user:requested_by(id, full_name),
        approved_by_user:approved_by(id, full_name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('❌ Query error:', queryError.message)
      console.error('Full error:', queryError)
    } else {
      console.log(`✅ Query successful, found ${queryResult.length} records`)
    }

    console.log('\n🎯 Summary:')
    console.log('The 400 errors are coming from the Manager Dashboard trying to query')
    console.log('the inventory_change_requests table, which either:')
    console.log('1. Does not exist')
    console.log('2. Has incorrect column names')
    console.log('3. Has RLS policy issues')
    
    console.log('\n🔧 Solution:')
    console.log('The Manager Dashboard should only query inventory_approvals table')
    console.log('for the new approval workflow, not inventory_change_requests.')

  } catch (error) {
    console.error('💥 Check error:', error.message)
  }
}

checkInventoryChangeRequests()
  .then(() => {
    console.log('\n✨ Check complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
