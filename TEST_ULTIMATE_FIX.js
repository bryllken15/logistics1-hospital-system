import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING ULTIMATE FRONTEND FIX...\n')

async function testUltimateFix() {
  try {
    console.log('1️⃣ Testing RPC function (should work now)...')
    
    // Get a manager user ID
    const { data: managerUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'manager')
      .limit(1)
      .single()
    
    if (managerUser) {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_pending_approvals', {
        p_user_id: managerUser.id,
        p_user_role: 'manager'
      })
      
      if (rpcError) {
        console.log(`❌ RPC function failed: ${rpcError.message}`)
      } else {
        console.log(`✅ RPC function works: ${rpcData?.length || 0} pending approvals`)
        if (rpcData && rpcData.length > 0) {
          console.log('Sample pending approval:', {
            request_title: rpcData[0].request_title,
            requested_by_name: rpcData[0].requested_by_name,
            approval_status: rpcData[0].approval_status
          })
        }
      }
    } else {
      console.log('❌ No manager user found')
    }
    
    console.log('\n2️⃣ Testing user procurement approvals function...')
    
    // Get an employee user ID
    const { data: employeeUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'employee')
      .limit(1)
      .single()
    
    if (employeeUser) {
      const { data: userApprovals, error: userError } = await supabase.rpc('get_user_procurement_approvals', {
        p_user_id: employeeUser.id
      })
      
      if (userError) {
        console.log(`❌ User approvals function failed: ${userError.message}`)
      } else {
        console.log(`✅ User approvals function works: ${userApprovals?.length || 0} approvals`)
        if (userApprovals && userApprovals.length > 0) {
          console.log('Sample user approval:', {
            item_name: userApprovals[0].item_name,
            requested_by_name: userApprovals[0].requested_by_name,
            status: userApprovals[0].status
          })
        }
      }
    } else {
      console.log('❌ No employee user found')
    }
    
    console.log('\n3️⃣ Testing purchase requests function...')
    
    const { data: purchaseRequests, error: prError } = await supabase.rpc('get_purchase_requests_with_users')
    
    if (prError) {
      console.log(`❌ Purchase requests function failed: ${prError.message}`)
    } else {
      console.log(`✅ Purchase requests function works: ${purchaseRequests?.length || 0} requests`)
      if (purchaseRequests && purchaseRequests.length > 0) {
        console.log('Sample purchase request:', {
          title: purchaseRequests[0].title,
          requested_by_name: purchaseRequests[0].requested_by_name,
          status: purchaseRequests[0].status
        })
      }
    }
    
    console.log('\n4️⃣ Testing direct table queries (should work with RLS disabled)...')
    
    // Test direct procurement approvals query
    const { data: directApprovals, error: directError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .limit(5)
    
    if (directError) {
      console.log(`❌ Direct approvals query failed: ${directError.message}`)
    } else {
      console.log(`✅ Direct approvals query works: ${directApprovals?.length || 0} approvals`)
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
    
    console.log('\n🎯 ULTIMATE FIX TEST RESULTS:')
    console.log('========================================')
    
    if (rpcError) console.log('❌ RPC function still has issues')
    if (userError) console.log('❌ User approvals function has issues')
    if (prError) console.log('❌ Purchase requests function has issues')
    if (directError) console.log('❌ Direct queries have issues')
    if (notifError) console.log('❌ Notifications have issues')
    
    if (!rpcError && !userError && !prError && !directError && !notifError) {
      console.log('✅ ALL ULTIMATE FIX TESTS PASSED!')
      console.log('🎉 Your frontend should work now!')
      console.log('')
      console.log('📋 NEXT STEPS:')
      console.log('1. Restart your development server: npm run dev')
      console.log('2. Login as manager (username: manager, password: manager123)')
      console.log('3. Check the Manager Dashboard - should load without errors')
      console.log('4. No more 400/401/404/500 errors!')
      console.log('5. All data fetching should work!')
    } else {
      console.log('❌ Some tests still failed - see details above')
      console.log('🔧 Run the ULTIMATE_FRONTEND_FIX.sql script to fix remaining issues')
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error)
  }
}

testUltimateFix()
