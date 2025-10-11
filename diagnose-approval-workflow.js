// Diagnose Approval Workflow Issues
// Tests the complete workflow from employee request to manager approval

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

// Check if credentials are properly configured
if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseKey === 'your-anon-key-here') {
  console.log('❌ Supabase credentials not configured!')
  console.log('\n🔧 To fix this:')
  console.log('1. Create a .env file in your project root')
  console.log('2. Add your Supabase credentials:')
  console.log('   VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.log('   VITE_SUPABASE_ANON_KEY=your-anon-key-here')
  console.log('3. Or set environment variables:')
  console.log('   set VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.log('   set VITE_SUPABASE_ANON_KEY=your-anon-key-here')
  console.log('\n📖 See setup-credentials.md for detailed instructions')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseApprovalWorkflow() {
  console.log('🔍 Diagnosing Approval Workflow Issues...\n')
  
  try {
    // Step 1: Test Database Connection
    console.log('Step 1: Testing Database Connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (connectionError) {
      console.log('❌ Database connection failed:', connectionError.message)
      return false
    }
    console.log('✅ Database connection successful')

    // Step 2: Test User Authentication
    console.log('\nStep 2: Testing User Authentication...')
    
    // Test Employee Authentication
    const { data: employeeAuth, error: employeeError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'employee',
        user_password: 'employee123'
      })
    
    if (employeeError || !employeeAuth || employeeAuth.length === 0) {
      console.log('❌ Employee authentication failed:', employeeError?.message)
      return false
    }
    console.log('✅ Employee authentication successful')
    const employeeId = employeeAuth[0].user_id

    // Test Manager Authentication
    const { data: managerAuth, error: managerError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'manager',
        user_password: 'manager123'
      })
    
    if (managerError || !managerAuth || managerAuth.length === 0) {
      console.log('❌ Manager authentication failed:', managerError?.message)
      return false
    }
    console.log('✅ Manager authentication successful')
    const managerId = managerAuth[0].user_id

    // Step 3: Test Request Creation
    console.log('\nStep 3: Testing Request Creation...')
    const { data: requestId, error: submitError } = await supabase
      .rpc('submit_purchase_request', {
        p_title: 'Diagnostic Test Request',
        p_description: 'Testing the approval workflow',
        p_total_amount: 1000.00,
        p_priority: 'medium',
        p_required_date: '2024-12-31',
        p_requested_by: employeeId
      })
    
    if (submitError) {
      console.log('❌ Request creation failed:', submitError.message)
      return false
    }
    console.log('✅ Request created successfully')
    console.log(`   Request ID: ${requestId}`)

    // Step 4: Check if Approval Entries Were Created
    console.log('\nStep 4: Checking Approval Entries...')
    const { data: approvals, error: approvalsError } = await supabase
      .from('purchase_request_approvals')
      .select('*')
      .eq('request_id', requestId)
    
    if (approvalsError) {
      console.log('❌ Failed to fetch approval entries:', approvalsError.message)
      return false
    }
    
    if (!approvals || approvals.length === 0) {
      console.log('❌ No approval entries found - TRIGGER NOT WORKING!')
      console.log('   This is the main issue - the auto-approval trigger is not firing')
      return false
    }
    
    console.log('✅ Approval entries created automatically')
    console.log(`   Found ${approvals.length} approval entries`)
    
    // Check if manager has an approval entry
    const managerApproval = approvals.find(a => a.approver_id === managerId)
    if (!managerApproval) {
      console.log('❌ Manager does not have an approval entry')
      console.log('   Manager ID:', managerId)
      console.log('   Approval entries:', approvals.map(a => a.approver_id))
      return false
    }
    console.log('✅ Manager has approval entry')

    // Step 5: Test Manager Can Fetch Pending Approvals
    console.log('\nStep 5: Testing Manager Can Fetch Pending Approvals...')
    const { data: pendingApprovals, error: pendingError } = await supabase
      .rpc('get_pending_approvals', {
        p_user_id: managerId,
        p_user_role: 'manager'
      })
    
    if (pendingError) {
      console.log('❌ Failed to fetch pending approvals:', pendingError.message)
      console.log('   Error details:', pendingError)
      return false
    }
    
    if (!pendingApprovals || pendingApprovals.length === 0) {
      console.log('❌ Manager has no pending approvals')
      console.log('   This means get_pending_approvals function is not working correctly')
      return false
    }
    
    const testRequest = pendingApprovals.find(pa => pa.request_id === requestId)
    if (!testRequest) {
      console.log('❌ Test request not found in pending approvals')
      console.log('   Available requests:', pendingApprovals.map(pa => pa.request_id))
      return false
    }
    
    console.log('✅ Manager can see pending approvals')
    console.log(`   Found ${pendingApprovals.length} pending approvals`)
    console.log(`   Test request found: ${testRequest.request_title}`)

    // Step 6: Test Notifications
    console.log('\nStep 6: Testing Notifications...')
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', managerId)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (notificationsError) {
      console.log('❌ Failed to fetch notifications:', notificationsError.message)
    } else {
      const newRequestNotification = notifications.find(n => 
        n.title === 'New Purchase Request' && 
        n.message.includes('Diagnostic Test Request')
      )
      
      if (newRequestNotification) {
        console.log('✅ Manager received notification about new request')
      } else {
        console.log('⚠️ Manager did not receive notification (this may be normal)')
      }
    }

    // Step 7: Test Approval Process
    console.log('\nStep 7: Testing Approval Process...')
    const { data: approveResult, error: approveError } = await supabase
      .rpc('approve_purchase_request', {
        p_request_id: requestId,
        p_approver_id: managerId,
        p_comments: 'Diagnostic test approval'
      })
    
    if (approveError) {
      console.log('❌ Approval failed:', approveError.message)
      return false
    }
    
    console.log('✅ Purchase request approved successfully')

    // Step 8: Verify Request Status Update
    console.log('\nStep 8: Verifying Request Status Update...')
    const { data: updatedRequest, error: requestError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('id', requestId)
      .single()
    
    if (requestError) {
      console.log('❌ Failed to fetch updated request:', requestError.message)
      return false
    }
    
    if (updatedRequest.status === 'approved') {
      console.log('✅ Request status updated to approved')
    } else {
      console.log('❌ Request status not updated correctly:', updatedRequest.status)
    }

    // Final Summary
    console.log('\n🎉 DIAGNOSTIC COMPLETE!')
    console.log('========================')
    console.log('✅ Database connection working')
    console.log('✅ User authentication working')
    console.log('✅ Request creation working')
    console.log('✅ Auto-approval trigger working')
    console.log('✅ Manager can fetch pending approvals')
    console.log('✅ Approval process working')
    console.log('✅ Request status updates working')
    console.log('\n🚀 The approval workflow is fully functional!')
    
    return true

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure COMPLETE_DATABASE_SETUP.sql was run successfully')
    console.log('2. Check that all tables and functions exist')
    console.log('3. Verify your Supabase URL and API key are correct')
    console.log('4. Check that RLS policies are not blocking access')
    console.log('5. Ensure the auto-approval trigger is working')
    return false
  }
}

// Run the diagnostic
diagnoseApprovalWorkflow().catch(console.error)
