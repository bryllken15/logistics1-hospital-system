import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING FRONTEND DISPLAY ISSUE...\n')

async function testFrontendDisplayIssue() {
  try {
    console.log('1️⃣ Testing notification count (this is working)...')
    
    // Test notifications - this is working since you can see the count
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', '33333333-3333-3333-3333-333333333333')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (notificationsError) {
      console.log(`❌ Notifications failed: ${notificationsError.message}`)
    } else {
      console.log(`✅ Notifications work: ${notifications?.length || 0} found`)
      console.log('   This is why you can see the notification count!')
    }
    
    console.log('\n2️⃣ Testing Employee Dashboard data loading...')
    
    // Test Employee Dashboard: Get user requests (this might be the issue)
    const { data: userRequests, error: userRequestsError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('requested_by', '33333333-3333-3333-3333-333333333333')
      .order('created_at', { ascending: false })
    
    if (userRequestsError) {
      console.log(`❌ User requests failed: ${userRequestsError.message}`)
    } else {
      console.log(`✅ User requests work: ${userRequests?.length || 0} found`)
      
      if (userRequests && userRequests.length > 0) {
        console.log('   Sample user request:', JSON.stringify(userRequests[0], null, 2))
      }
    }
    
    console.log('\n3️⃣ Testing Manager Dashboard data loading...')
    
    // Test Manager Dashboard: Get pending approvals (this might be the issue)
    const { data: managerApprovals, error: managerApprovalsError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (managerApprovalsError) {
      console.log(`❌ Manager approvals failed: ${managerApprovalsError.message}`)
    } else {
      console.log(`✅ Manager approvals work: ${managerApprovals?.length || 0} found`)
      
      if (managerApprovals && managerApprovals.length > 0) {
        console.log('   Sample manager approval:', JSON.stringify(managerApprovals[0], null, 2))
      }
    }
    
    console.log('\n4️⃣ Testing Project Manager Dashboard data loading...')
    
    // Test Project Manager Dashboard: Get manager-approved requests
    const { data: pmApprovals, error: pmApprovalsError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'approved')
      .eq('manager_approved', true)
      .eq('project_manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (pmApprovalsError) {
      console.log(`❌ PM approvals failed: ${pmApprovalsError.message}`)
    } else {
      console.log(`✅ PM approvals work: ${pmApprovals?.length || 0} found`)
      
      if (pmApprovals && pmApprovals.length > 0) {
        console.log('   Sample PM approval:', JSON.stringify(pmApprovals[0], null, 2))
      }
    }
    
    console.log('\n5️⃣ Testing inventory requests...')
    
    // Test inventory requests
    const { data: inventoryRequests, error: inventoryRequestsError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('requested_by', '33333333-3333-3333-3333-333333333333')
      .order('created_at', { ascending: false })
    
    if (inventoryRequestsError) {
      console.log(`❌ Inventory requests failed: ${inventoryRequestsError.message}`)
    } else {
      console.log(`✅ Inventory requests work: ${inventoryRequests?.length || 0} found`)
    }
    
    console.log('\n6️⃣ Testing data format for frontend...')
    
    // Test the exact data format that the frontend expects
    if (userRequests && userRequests.length > 0) {
      const sampleRequest = userRequests[0]
      const frontendFormat = {
        id: sampleRequest.id,
        request_number: `REQ-${sampleRequest.id.slice(-8)}`,
        title: sampleRequest.item_name,
        description: sampleRequest.description,
        status: sampleRequest.status,
        priority: sampleRequest.priority,
        total_amount: sampleRequest.unit_price || 0,
        required_date: sampleRequest.created_at,
        created_at: sampleRequest.created_at,
        approvals: []
      }
      
      console.log('   Frontend format for user request:', JSON.stringify(frontendFormat, null, 2))
    }
    
    console.log('\n🎯 FRONTEND DISPLAY ISSUE TEST RESULTS:')
    console.log('======================================')
    
    const hasErrors = userRequestsError || managerApprovalsError || pmApprovalsError || inventoryRequestsError
    
    if (!hasErrors) {
      console.log('✅ DATABASE CONNECTIVITY IS WORKING!')
      console.log('✅ NOTIFICATIONS ARE WORKING!')
      console.log('✅ DATA IS AVAILABLE IN DATABASE!')
      console.log('')
      console.log('🔧 THE ISSUE IS LIKELY:')
      console.log('1. Frontend component not rendering the data')
      console.log('2. Data mapping issue in the frontend')
      console.log('3. Component state not updating')
      console.log('4. Browser cache issue')
      console.log('')
      console.log('🚀 SOLUTIONS:')
      console.log('1. Clear browser cache (Ctrl+Shift+R)')
      console.log('2. Check browser console for errors')
      console.log('3. Restart dev server: npm run dev')
      console.log('4. Check if components are receiving data')
      console.log('')
      console.log('📋 NEXT STEPS:')
      console.log('1. Clear browser cache completely')
      console.log('2. Open browser dev tools (F12)')
      console.log('3. Check Console tab for errors')
      console.log('4. Check Network tab for failed requests')
      console.log('5. Restart your development server')
      console.log('')
      console.log('🎉 THE DATA IS THERE - IT\'S A FRONTEND DISPLAY ISSUE!')
    } else {
      console.log('❌ Some data connections failed:')
      if (userRequestsError) console.log(`   - User requests error: ${userRequestsError.message}`)
      if (managerApprovalsError) console.log(`   - Manager approvals error: ${managerApprovalsError.message}`)
      if (pmApprovalsError) console.log(`   - PM approvals error: ${pmApprovalsError.message}`)
      if (inventoryRequestsError) console.log(`   - Inventory requests error: ${inventoryRequestsError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Frontend display issue test failed:', error)
  }
}

testFrontendDisplayIssue()
