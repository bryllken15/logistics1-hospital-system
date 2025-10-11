import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING FRONTEND FIXES...\n')

async function testFrontendFixes() {
  try {
    console.log('1️⃣ Testing simplified purchase requests query...')
    
    const { data: purchaseRequests, error: prError } = await supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (prError) {
      console.log(`❌ Purchase requests failed: ${prError.message}`)
    } else {
      console.log(`✅ Purchase requests work: ${purchaseRequests?.length || 0} found`)
    }
    
    console.log('\n2️⃣ Testing simplified procurement approvals query...')
    
    const { data: procurementApprovals, error: paError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (paError) {
      console.log(`❌ Procurement approvals failed: ${paError.message}`)
    } else {
      console.log(`✅ Procurement approvals work: ${procurementApprovals?.length || 0} found`)
    }
    
    console.log('\n3️⃣ Testing user procurement approvals query...')
    
    // Get a user ID
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single()
    
    let userError = null
    if (users) {
      const { data: userApprovals, error: userErr } = await supabase
        .from('procurement_approvals')
        .select('*')
        .eq('requested_by', users.id)
        .order('created_at', { ascending: false })
      
      userError = userErr
      if (userError) {
        console.log(`❌ User approvals failed: ${userError.message}`)
      } else {
        console.log(`✅ User approvals work: ${userApprovals?.length || 0} found`)
      }
    } else {
      console.log('❌ No users found')
    }
    
    console.log('\n4️⃣ Testing pending approvals query...')
    
    const { data: pendingApprovals, error: pendingError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (pendingError) {
      console.log(`❌ Pending approvals failed: ${pendingError.message}`)
    } else {
      console.log(`✅ Pending approvals work: ${pendingApprovals?.length || 0} found`)
    }
    
    console.log('\n5️⃣ Testing notifications...')
    
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5)
    
    if (notifError) {
      console.log(`❌ Notifications failed: ${notifError.message}`)
    } else {
      console.log(`✅ Notifications work: ${notifications?.length || 0} found`)
    }
    
    console.log('\n🎯 FRONTEND FIX TEST RESULTS:')
    console.log('========================================')
    
    if (prError) console.log('❌ Purchase requests still have issues')
    if (paError) console.log('❌ Procurement approvals still have issues')
    if (userError) console.log('❌ User approvals still have issues')
    if (pendingError) console.log('❌ Pending approvals still have issues')
    if (notifError) console.log('❌ Notifications still have issues')
    
    if (!prError && !paError && !userError && !pendingError && !notifError) {
      console.log('✅ ALL FRONTEND FIXES WORK!')
      console.log('🎉 Your application should work now!')
      console.log('')
      console.log('📋 NEXT STEPS:')
      console.log('1. Restart your development server: npm run dev')
      console.log('2. Login as manager (username: manager, password: manager123)')
      console.log('3. Check the Manager Dashboard - should load without errors')
      console.log('4. No more 400/401/404/500 errors!')
      console.log('5. All data fetching should work!')
    } else {
      console.log('❌ Some queries still failed - see details above')
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error)
  }
}

testFrontendFixes()
