import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING PURCHASE REQUESTS DATA...\n')

async function testPurchaseRequestsData() {
  try {
    console.log('1️⃣ Testing all purchase requests...')
    
    // Test all purchase requests
    const { data: allRequests, error: allError } = await supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.log(`❌ All purchase requests failed: ${allError.message}`)
    } else {
      console.log(`✅ All purchase requests work: ${allRequests?.length || 0} found`)
      if (allRequests && allRequests.length > 0) {
        console.log('   Sample requests:')
        allRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Status: ${req.status} - Requested by: ${req.requested_by}`)
        })
      }
    }
    
    console.log('\n2️⃣ Testing pending purchase requests...')
    
    // Test pending purchase requests
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (pendingError) {
      console.log(`❌ Pending purchase requests failed: ${pendingError.message}`)
    } else {
      console.log(`✅ Pending purchase requests work: ${pendingRequests?.length || 0} found`)
      if (pendingRequests && pendingRequests.length > 0) {
        console.log('   Sample pending requests:')
        pendingRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Status: ${req.status} - Requested by: ${req.requested_by}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing approved purchase requests...')
    
    // Test approved purchase requests
    const { data: approvedRequests, error: approvedError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (approvedError) {
      console.log(`❌ Approved purchase requests failed: ${approvedError.message}`)
    } else {
      console.log(`✅ Approved purchase requests work: ${approvedRequests?.length || 0} found`)
      if (approvedRequests && approvedRequests.length > 0) {
        console.log('   Sample approved requests:')
        approvedRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Status: ${req.status} - Approved by: ${req.approved_by}`)
        })
      }
    }
    
    console.log('\n4️⃣ Testing rejected purchase requests...')
    
    // Test rejected purchase requests
    const { data: rejectedRequests, error: rejectedError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'rejected')
      .order('created_at', { ascending: false })
    
    if (rejectedError) {
      console.log(`❌ Rejected purchase requests failed: ${rejectedError.message}`)
    } else {
      console.log(`✅ Rejected purchase requests work: ${rejectedRequests?.length || 0} found`)
      if (rejectedRequests && rejectedRequests.length > 0) {
        console.log('   Sample rejected requests:')
        rejectedRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Status: ${req.status} - Approved by: ${req.approved_by}`)
        })
      }
    }
    
    console.log('\n🎯 PURCHASE REQUESTS DATA RESULTS:')
    console.log('==================================')
    
    const hasErrors = allError || pendingError || approvedError || rejectedError
    
    if (!hasErrors) {
      console.log('✅ ALL PURCHASE REQUESTS DATA IS ACCESSIBLE!')
      console.log('')
      console.log('📊 DATA SUMMARY:')
      console.log(`   Total requests: ${allRequests?.length || 0}`)
      console.log(`   Pending requests: ${pendingRequests?.length || 0}`)
      console.log(`   Approved requests: ${approvedRequests?.length || 0}`)
      console.log(`   Rejected requests: ${rejectedRequests?.length || 0}`)
      console.log('')
      console.log('🔧 MANAGER DASHBOARD SHOULD SHOW:')
      console.log('   - Pending purchase requests (status = "pending")')
      console.log('   - These are the requests that need manager approval')
      console.log('')
      if (pendingRequests && pendingRequests.length > 0) {
        console.log('✅ MANAGER DASHBOARD SHOULD HAVE DATA TO DISPLAY!')
        console.log('   The issue might be in the frontend display or data mapping')
      } else {
        console.log('⚠️  NO PENDING REQUESTS FOUND')
        console.log('   This means there are no purchase requests waiting for manager approval')
        console.log('   The Manager Dashboard will show "No pending purchase requests"')
      }
    } else {
      console.log('❌ Some purchase requests queries failed:')
      if (allError) console.log(`   - All requests error: ${allError.message}`)
      if (pendingError) console.log(`   - Pending requests error: ${pendingError.message}`)
      if (approvedError) console.log(`   - Approved requests error: ${approvedError.message}`)
      if (rejectedError) console.log(`   - Rejected requests error: ${rejectedError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Purchase requests data test failed:', error)
  }
}

testPurchaseRequestsData()
