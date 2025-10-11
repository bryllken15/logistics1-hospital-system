import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING APPROVAL WORKFLOW AFTER FIX...\n')

async function testApprovalWorkflow() {
  try {
    console.log('1️⃣ Testing purchase requests with fixed relationships...')
    
    // Test using the new view to avoid relationship ambiguity
    const { data: purchaseRequests, error: prError } = await supabase
      .from('purchase_requests_with_users')
      .select('*')
      .limit(5)
    
    if (prError) {
      console.log(`❌ Purchase requests view failed: ${prError.message}`)
    } else {
      console.log(`✅ Purchase requests view works: ${purchaseRequests?.length || 0} found`)
      if (purchaseRequests && purchaseRequests.length > 0) {
        console.log('Sample request:', {
          title: purchaseRequests[0].title,
          requested_by_name: purchaseRequests[0].requested_by_name,
          status: purchaseRequests[0].status
        })
      }
    }
    
    console.log('\n2️⃣ Testing procurement approvals with fixed relationships...')
    
    // Test using the new view to avoid relationship issues
    const { data: procurementApprovals, error: paError } = await supabase
      .from('procurement_approvals_with_details')
      .select('*')
      .limit(5)
    
    if (paError) {
      console.log(`❌ Procurement approvals view failed: ${paError.message}`)
    } else {
      console.log(`✅ Procurement approvals view works: ${procurementApprovals?.length || 0} found`)
      if (procurementApprovals && procurementApprovals.length > 0) {
        console.log('Sample approval:', {
          item_name: procurementApprovals[0].item_name,
          requested_by_name: procurementApprovals[0].requested_by_name,
          status: procurementApprovals[0].status
        })
      }
    }
    
    console.log('\n3️⃣ Testing RPC function (should work now)...')
    
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
    
    console.log('\n4️⃣ Testing notifications...')
    
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5)
    
    if (notifError) {
      console.log(`❌ Notifications failed: ${notifError.message}`)
    } else {
      console.log(`✅ Notifications work: ${notifications?.length || 0} found`)
    }
    
    console.log('\n5️⃣ Testing manager dashboard data...')
    
    // Test the exact queries that the manager dashboard uses
    const { data: managerApprovals, error: managerError } = await supabase
      .from('procurement_approvals')
      .select(`
        *,
        requested_by_user:requested_by(id, full_name, username, email),
        manager_approved_by_user:manager_approved_by(id, full_name, email),
        project_manager_approved_by_user:project_manager_approved_by(id, full_name, email),
        purchase_request:purchase_request_id(*)
      `)
      .eq('status', 'pending')
      .limit(5)
    
    if (managerError) {
      console.log(`❌ Manager dashboard query failed: ${managerError.message}`)
    } else {
      console.log(`✅ Manager dashboard query works: ${managerApprovals?.length || 0} pending approvals`)
    }
    
    console.log('\n🎯 APPROVAL WORKFLOW TEST RESULTS:')
    console.log('========================================')
    
    if (prError) console.log('❌ Purchase requests still have issues')
    if (paError) console.log('❌ Procurement approvals still have issues')
    if (notifError) console.log('❌ Notifications have issues')
    if (managerError) console.log('❌ Manager dashboard queries have issues')
    
    if (!prError && !paError && !notifError && !managerError) {
      console.log('✅ ALL APPROVAL WORKFLOW TESTS PASSED!')
      console.log('🎉 Your approval workflow should work now!')
      console.log('')
      console.log('📋 NEXT STEPS:')
      console.log('1. Restart your development server: npm run dev')
      console.log('2. Login as manager (username: manager, password: manager123)')
      console.log('3. Check the Manager Dashboard - should show pending approvals')
      console.log('4. No more "Error fetching" messages in console!')
    } else {
      console.log('❌ Some tests still failed - see details above')
      console.log('🔧 Run the TARGETED_APPROVAL_FIX.sql script to fix remaining issues')
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error)
  }
}

testApprovalWorkflow()
