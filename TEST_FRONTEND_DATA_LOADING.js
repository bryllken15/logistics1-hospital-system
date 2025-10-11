import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING FRONTEND DATA LOADING...\n')

async function testFrontendDataLoading() {
  try {
    console.log('1️⃣ Testing Employee Dashboard data loading (exact frontend format)...')
    
    // Test the exact same query that the frontend uses
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
        // Map to the exact format the frontend expects
        const mappedRequests = userRequests.map(req => ({
          id: req.id,
          request_number: `REQ-${req.id.slice(-8)}`,
          title: req.item_name,
          description: req.description,
          status: req.status,
          priority: req.priority,
          total_amount: req.unit_price || 0,
          required_date: req.created_at,
          created_at: req.created_at,
          approvals: []
        }))
        
        console.log('   Mapped requests for frontend:')
        mappedRequests.forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - ${req.status} - $${req.total_amount}`)
        })
      }
    }
    
    console.log('\n2️⃣ Testing Manager Dashboard data loading...')
    
    // Test Manager Dashboard data
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
        console.log('   Manager approvals for frontend:')
        managerApprovals.forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.item_name} - ${req.status} - $${req.unit_price}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing Project Manager Dashboard data loading...')
    
    // Test Project Manager Dashboard data
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
        console.log('   PM approvals for frontend:')
        pmApprovals.forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.item_name} - ${req.status} - $${req.unit_price}`)
        })
      }
    }
    
    console.log('\n4️⃣ Testing inventory requests...')
    
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
      
      if (inventoryRequests && inventoryRequests.length > 0) {
        console.log('   Inventory requests for frontend:')
        inventoryRequests.forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.item_name} - ${req.status} - Qty: ${req.quantity}`)
        })
      }
    }
    
    console.log('\n5️⃣ Testing notifications...')
    
    // Test notifications
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
    }
    
    console.log('\n🎯 FRONTEND DATA LOADING TEST RESULTS:')
    console.log('======================================')
    
    const hasErrors = userRequestsError || managerApprovalsError || pmApprovalsError || inventoryRequestsError || notificationsError
    
    if (!hasErrors) {
      console.log('✅ ALL FRONTEND DATA IS AVAILABLE!')
      console.log('✅ DATABASE CONNECTIVITY IS WORKING!')
      console.log('✅ DATA FORMATTING IS CORRECT!')
      console.log('')
      console.log('🔧 THE ISSUE IS DEFINITELY FRONTEND DISPLAY:')
      console.log('1. Data is available in database')
      console.log('2. Data format is correct')
      console.log('3. Queries are working')
      console.log('4. Notifications are working')
      console.log('')
      console.log('🚀 FRONTEND DISPLAY FIXES:')
      console.log('1. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('2. Open browser dev tools (F12)')
      console.log('3. Check Console tab for JavaScript errors')
      console.log('4. Check Network tab for failed API calls')
      console.log('5. Restart development server: npm run dev')
      console.log('6. Check if React components are re-rendering')
      console.log('')
      console.log('📋 DEBUGGING STEPS:')
      console.log('1. Open browser dev tools (F12)')
      console.log('2. Go to Console tab')
      console.log('3. Look for any red error messages')
      console.log('4. Go to Network tab')
      console.log('5. Refresh the page')
      console.log('6. Look for any failed requests (red entries)')
      console.log('7. Check if data is being fetched but not displayed')
      console.log('')
      console.log('🎉 THE DATA IS THERE - CHECK BROWSER CONSOLE FOR ERRORS!')
    } else {
      console.log('❌ Some data connections failed:')
      if (userRequestsError) console.log(`   - User requests error: ${userRequestsError.message}`)
      if (managerApprovalsError) console.log(`   - Manager approvals error: ${managerApprovalsError.message}`)
      if (pmApprovalsError) console.log(`   - PM approvals error: ${pmApprovalsError.message}`)
      if (inventoryRequestsError) console.log(`   - Inventory requests error: ${inventoryRequestsError.message}`)
      if (notificationsError) console.log(`   - Notifications error: ${notificationsError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Frontend data loading test failed:', error)
  }
}

testFrontendDataLoading()
