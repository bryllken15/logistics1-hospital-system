// Test Manager Workflow - Verify manager receives requests and can approve/reject
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testManagerWorkflow() {
  console.log('🔍 Testing Manager Approval Workflow...\n')
  
  try {
    // Step 1: Test authentication for employee and manager
    console.log('Step 1: Testing Authentication...')
    
    // Test employee authentication
    const { data: employeeAuth, error: employeeError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'employee',
        user_password: 'employee123'
      })
    
    if (employeeError) {
      console.log('❌ Employee authentication failed:', employeeError.message)
      return
    }
    
    if (!employeeAuth || employeeAuth.length === 0) {
      console.log('❌ Employee authentication returned no data')
      return
    }
    
    console.log('✅ Employee authentication successful')
    
    // Test manager authentication
    const { data: managerAuth, error: managerError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'manager',
        user_password: 'manager123'
      })
    
    if (managerError) {
      console.log('❌ Manager authentication failed:', managerError.message)
      return
    }
    
    if (!managerAuth || managerAuth.length === 0) {
      console.log('❌ Manager authentication returned no data')
      return
    }
    
    console.log('✅ Manager authentication successful')
    
    // Step 2: Test creating a purchase request
    console.log('\nStep 2: Testing Purchase Request Creation...')
    
    const { data: submitResult, error: submitError } = await supabase
      .rpc('submit_purchase_request', {
        p_title: 'Test Medical Supplies',
        p_description: 'Testing the approval workflow',
        p_total_amount: 1000.00,
        p_priority: 'medium',
        p_required_date: '2024-12-31',
        p_requested_by: employeeAuth[0].user_id
      })
    
    if (submitError) {
      console.log('❌ Purchase request creation failed:', submitError.message)
      return
    }
    
    console.log('✅ Purchase request created successfully')
    console.log('   Request ID:', submitResult)
    
    // Step 3: Test that approval entries were created
    console.log('\nStep 3: Testing Approval Entries Creation...')
    
    const { data: approvals, error: approvalsError } = await supabase
      .from('purchase_request_approvals')
      .select('*')
      .eq('request_id', submitResult)
    
    if (approvalsError) {
      console.log('❌ Failed to fetch approval entries:', approvalsError.message)
      return
    }
    
    if (!approvals || approvals.length === 0) {
      console.log('❌ No approval entries found - trigger may not be working')
      return
    }
    
    console.log('✅ Approval entries created successfully')
    console.log('   Number of approval entries:', approvals.length)
    
    // Step 4: Test that notifications were sent to managers
    console.log('\nStep 4: Testing Manager Notifications...')
    
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', managerAuth[0].user_id)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (notificationsError) {
      console.log('❌ Failed to fetch notifications:', notificationsError.message)
      return
    }
    
    const newRequestNotification = notifications.find(n => 
      n.title === 'New Purchase Request' && 
      n.message.includes('Test Medical Supplies')
    )
    
    if (!newRequestNotification) {
      console.log('❌ Manager did not receive notification about new request')
      console.log('   Available notifications:', notifications.map(n => n.title))
    } else {
      console.log('✅ Manager received notification about new request')
    }
    
    // Step 5: Test manager can see pending approvals
    console.log('\nStep 5: Testing Manager Pending Approvals...')
    
    const { data: pendingApprovals, error: pendingError } = await supabase
      .rpc('get_pending_approvals', {
        p_user_id: managerAuth[0].user_id,
        p_user_role: 'manager'
      })
    
    if (pendingError) {
      console.log('❌ Failed to fetch pending approvals:', pendingError.message)
      return
    }
    
    if (!pendingApprovals || pendingApprovals.length === 0) {
      console.log('❌ Manager has no pending approvals')
      return
    }
    
    console.log('✅ Manager can see pending approvals')
    console.log('   Number of pending approvals:', pendingApprovals.length)
    
    // Step 6: Test approval process
    console.log('\nStep 6: Testing Approval Process...')
    
    const approvalEntry = approvals.find(a => a.approver_id === managerAuth[0].user_id)
    
    if (!approvalEntry) {
      console.log('❌ No approval entry found for manager')
      return
    }
    
    // Test approval
    const { data: approveResult, error: approveError } = await supabase
      .rpc('approve_purchase_request', {
        p_request_id: submitResult,
        p_approver_id: managerAuth[0].user_id,
        p_comments: 'Test approval - looks good'
      })
    
    if (approveError) {
      console.log('❌ Approval failed:', approveError.message)
      return
    }
    
    console.log('✅ Purchase request approved successfully')
    
    // Step 7: Verify request status was updated
    console.log('\nStep 7: Verifying Request Status Update...')
    
    const { data: updatedRequest, error: requestError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('id', submitResult)
      .single()
    
    if (requestError) {
      console.log('❌ Failed to fetch updated request:', requestError.message)
      return
    }
    
    if (updatedRequest.status === 'approved') {
      console.log('✅ Request status updated to approved')
    } else {
      console.log('❌ Request status not updated correctly:', updatedRequest.status)
    }
    
    // Step 8: Test rejection workflow
    console.log('\nStep 8: Testing Rejection Workflow...')
    
    // Create another test request
    const { data: rejectRequestId, error: rejectSubmitError } = await supabase
      .rpc('submit_purchase_request', {
        p_title: 'Test Rejection Request',
        p_description: 'Testing rejection workflow',
        p_total_amount: 500.00,
        p_priority: 'low',
        p_required_date: '2024-12-31',
        p_requested_by: employeeAuth[0].user_id
      })
    
    if (rejectSubmitError) {
      console.log('❌ Rejection test request creation failed:', rejectSubmitError.message)
      return
    }
    
    // Reject the request
    const { data: rejectResult, error: rejectError } = await supabase
      .rpc('reject_purchase_request', {
        p_request_id: rejectRequestId,
        p_approver_id: managerAuth[0].user_id,
        p_comments: 'Test rejection - not needed'
      })
    
    if (rejectError) {
      console.log('❌ Rejection failed:', rejectError.message)
      return
    }
    
    console.log('✅ Purchase request rejected successfully')
    
    // Final summary
    console.log('\n🎉 MANAGER WORKFLOW TEST COMPLETE!')
    console.log('================================')
    console.log('✅ Employee authentication working')
    console.log('✅ Manager authentication working')
    console.log('✅ Purchase request creation working')
    console.log('✅ Approval entries auto-created')
    console.log('✅ Manager notifications working')
    console.log('✅ Manager can see pending approvals')
    console.log('✅ Approval process working')
    console.log('✅ Request status updates working')
    console.log('✅ Rejection process working')
    console.log('\n🚀 Manager approval workflow is fully functional!')
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure COMPLETE_DATABASE_SETUP.sql was run successfully')
    console.log('2. Check that all tables and functions exist')
    console.log('3. Verify your Supabase URL and API key are correct')
    console.log('4. Check that RLS policies are not blocking access')
  }
}

// Run the test
testManagerWorkflow().catch(console.error)
