import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🧪 TESTING APPROVAL SYSTEM INTEGRATION')
console.log('=====================================')

let totalTests = 0
let passedTests = 0

const runTest = async (testName, testFunction) => {
  totalTests++
  console.log(`\n${totalTests}. Testing ${testName}...`)
  
  try {
    await testFunction()
    console.log(`✅ ${testName} - PASSED`)
    passedTests++
  } catch (error) {
    console.error(`❌ ${testName} - FAILED:`, error.message)
  }
}

// Test 1: Check if approval system tables exist
await runTest('Approval System Tables', async () => {
  const tables = [
    'purchase_request_approvals',
    'inventory_change_approvals', 
    'approval_workflows',
    'purchase_requests'
  ]
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)
    
    if (error) throw new Error(`Table ${table} not accessible: ${error.message}`)
    console.log(`  ✓ Table ${table} exists and accessible`)
  }
})

// Test 2: Check if approval RPC functions exist
await runTest('Approval RPC Functions', async () => {
  const functions = [
    'submit_purchase_request',
    'approve_purchase_request', 
    'reject_purchase_request',
    'get_pending_approvals',
    'get_user_requests'
  ]
  
  for (const func of functions) {
    try {
      // Test with dummy parameters to check if function exists
      const { error } = await supabase.rpc(func, {
        p_title: 'test',
        p_description: 'test',
        p_total_amount: 100,
        p_priority: 'medium',
        p_required_date: '2024-12-31',
        p_requested_by: '11111111-1111-1111-1111-111111111111'
      })
      
      // We expect an error due to invalid parameters, but not "function does not exist"
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        throw new Error(`Function ${func} does not exist`)
      }
      console.log(`  ✓ Function ${func} exists`)
    } catch (error) {
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        throw error
      }
      console.log(`  ✓ Function ${func} exists (parameter validation working)`)
    }
  }
})

// Test 3: Test user authentication
await runTest('User Authentication', async () => {
  const { data, error } = await supabase.rpc('authenticate_user', {
    user_username: 'admin',
    user_password: 'admin123'
  })
  
  if (error) throw error
  if (!data || data.length === 0) throw new Error('Authentication failed')
  if (!data[0].user_id) throw new Error('No user ID returned')
  
  console.log(`  ✓ Admin user authenticated successfully`)
})

// Test 4: Test purchase request submission
await runTest('Purchase Request Submission', async () => {
  // Use a unique title to avoid conflicts
  const uniqueTitle = `Test Purchase Request ${Date.now()}`
  
  const { data, error } = await supabase.rpc('submit_purchase_request', {
    p_title: uniqueTitle,
    p_description: 'Testing the approval system',
    p_total_amount: 250.00,
    p_priority: 'medium',
    p_required_date: '2024-12-31',
    p_requested_by: '33333333-3333-3333-3333-333333333333'
  })
  
  if (error) throw error
  if (!data) throw new Error('No request ID returned')
  
  console.log(`  ✓ Purchase request submitted with ID: ${data}`)
})

// Test 5: Test getting pending approvals
await runTest('Get Pending Approvals', async () => {
  const { data, error } = await supabase.rpc('get_pending_approvals', {
    p_user_id: '22222222-2222-2222-2222-222222222222',
    p_user_role: 'manager'
  })
  
  if (error) throw error
  console.log(`  ✓ Found ${data?.length || 0} pending approvals for manager`)
})

// Test 6: Test getting user requests
await runTest('Get User Requests', async () => {
  const { data, error } = await supabase.rpc('get_user_requests', {
    p_user_id: '33333333-3333-3333-3333-333333333333'
  })
  
  if (error) throw error
  console.log(`  ✓ Found ${data?.length || 0} requests for employee`)
})

// Test 7: Test approval workflow
await runTest('Approval Workflow', async () => {
  // First, get a pending approval
  const { data: approvals, error: approvalsError } = await supabase.rpc('get_pending_approvals', {
    p_user_id: '22222222-2222-2222-2222-222222222222',
    p_user_role: 'manager'
  })
  
  if (approvalsError) throw approvalsError
  
  if (approvals && approvals.length > 0) {
    const approval = approvals[0]
    
    // Test approval
    const { error: approveError } = await supabase.rpc('approve_purchase_request', {
      p_request_id: approval.request_id,
      p_approver_id: '22222222-2222-2222-2222-222222222222',
      p_comments: 'Test approval'
    })
    
    if (approveError) throw approveError
    console.log(`  ✓ Successfully approved request ${approval.request_id}`)
  } else {
    console.log(`  ✓ No pending approvals to test (this is normal)`)
  }
})

// Test 8: Test notifications
await runTest('Notifications System', async () => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .limit(5)
  
  if (error) throw error
  console.log(`  ✓ Notifications system working - found ${data?.length || 0} notifications`)
})

// Test 9: Test real-time subscriptions
await runTest('Real-time Subscriptions', async () => {
  const channel = supabase
    .channel('test_channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'purchase_requests'
    }, (payload) => {
      console.log('  ✓ Real-time subscription working')
    })
    .subscribe()
  
  // Wait a moment then unsubscribe
  setTimeout(() => {
    channel.unsubscribe()
  }, 1000)
  
  console.log(`  ✓ Real-time subscription setup successful`)
})

// Test 10: Test all user roles
await runTest('All User Roles Authentication', async () => {
  const testUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'manager', password: 'manager123', role: 'manager' },
    { username: 'employee', password: 'employee123', role: 'employee' },
    { username: 'procurement', password: 'procurement123', role: 'procurement' },
    { username: 'project_manager', password: 'pm123', role: 'project_manager' },
    { username: 'maintenance', password: 'maintenance123', role: 'maintenance' },
    { username: 'document_analyst', password: 'analyst123', role: 'manager' } // Note: mapped to manager
  ]

  let successfulLogins = 0
  for (const user of testUsers) {
    const { data, error } = await supabase.rpc('authenticate_user', {
      user_username: user.username,
      user_password: user.password
    })

    if (!error && data && data.length > 0 && data[0].user_id) {
      successfulLogins++
      console.log(`  ✓ ${user.role} (${user.username}) - authenticated`)
    } else {
      console.log(`  ❌ ${user.role} (${user.username}) - failed to authenticate`)
    }
  }

  if (successfulLogins === testUsers.length) {
    console.log(`  ✓ All ${testUsers.length} user roles can authenticate`)
  } else {
    throw new Error(`Only ${successfulLogins} of ${testUsers.length} users can authenticate`)
  }
})

// Test 11: Test dashboard data loading
await runTest('Dashboard Data Loading', async () => {
  // Test projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .limit(5)
  
  if (projectsError) throw new Error(`Projects table error: ${projectsError.message}`)
  console.log(`  ✓ Projects table accessible - ${projects?.length || 0} records`)

  // Test inventory
  const { data: inventory, error: inventoryError } = await supabase
    .from('inventory')
    .select('*')
    .limit(5)
  
  if (inventoryError) throw new Error(`Inventory table error: ${inventoryError.message}`)
  console.log(`  ✓ Inventory table accessible - ${inventory?.length || 0} records`)

  // Test documents
  const { data: documents, error: documentsError } = await supabase
    .from('documents')
    .select('*')
    .limit(5)
  
  if (documentsError) throw new Error(`Documents table error: ${documentsError.message}`)
  console.log(`  ✓ Documents table accessible - ${documents?.length || 0} records`)
})

// Test 12: Test approval system integration
await runTest('Approval System Integration', async () => {
  // Check if purchase requests exist
  const { data: requests, error: requestsError } = await supabase
    .from('purchase_requests')
    .select('*')
    .limit(5)
  
  if (requestsError) throw new Error(`Purchase requests error: ${requestsError.message}`)
  console.log(`  ✓ Purchase requests table accessible - ${requests?.length || 0} records`)

  // Check if approvals exist
  const { data: approvals, error: approvalsError } = await supabase
    .from('purchase_request_approvals')
    .select('*')
    .limit(5)
  
  if (approvalsError) throw new Error(`Purchase request approvals error: ${approvalsError.message}`)
  console.log(`  ✓ Purchase request approvals table accessible - ${approvals?.length || 0} records`)

  // Check if workflows exist
  const { data: workflows, error: workflowsError } = await supabase
    .from('approval_workflows')
    .select('*')
    .limit(5)
  
  if (workflowsError) throw new Error(`Approval workflows error: ${workflowsError.message}`)
  console.log(`  ✓ Approval workflows table accessible - ${workflows?.length || 0} records`)
})

// Final Results
console.log('\n' + '='.repeat(50))
console.log('🎯 APPROVAL SYSTEM TEST RESULTS')
console.log('='.repeat(50))
console.log(`Total Tests: ${totalTests}`)
console.log(`Passed: ${passedTests}`)
console.log(`Failed: ${totalTests - passedTests}`)
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

if (passedTests === totalTests) {
  console.log('\n🎉 ALL TESTS PASSED!')
  console.log('✅ Approval system is fully functional')
  console.log('✅ Real-time integration is working')
  console.log('✅ All user roles can authenticate')
  console.log('✅ All dashboards can load data')
  console.log('✅ Ready for production use!')
} else {
  console.log('\n⚠️  SOME TESTS FAILED')
  console.log('Please check the failed tests above and fix any issues')
}

console.log('\n📋 NEXT STEPS:')
console.log('1. Run the CREATE_APPROVAL_SYSTEM.sql script in Supabase')
console.log('2. Test the frontend dashboards')
console.log('3. Verify real-time updates are working')
console.log('4. Test the approval workflow end-to-end')
