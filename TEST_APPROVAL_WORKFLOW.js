// =====================================================
// TEST APPROVAL WORKFLOW
// This script tests the complete approval workflow
// =====================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNDQ4NDAsImV4cCI6MjA0NjgyMDg0MH0.otjdtdnuowhlqriidgfg.supabase.co'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testApprovalWorkflow() {
  console.log('🧪 Testing Approval Workflow...')
  
  try {
    // 1. Test users exist
    console.log('\n1. Checking users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, role')
      .in('role', ['manager', 'project_manager', 'admin', 'employee'])
    
    if (usersError) throw usersError
    console.log(`✅ Found ${users.length} users with required roles`)
    
    // 2. Test purchase requests exist
    console.log('\n2. Checking purchase requests...')
    const { data: purchaseRequests, error: prError } = await supabase
      .from('purchase_requests')
      .select('id, title, status')
      .eq('status', 'pending')
    
    if (prError) throw prError
    console.log(`✅ Found ${purchaseRequests.length} pending purchase requests`)
    
    // 3. Test procurement approvals exist
    console.log('\n3. Checking procurement approvals...')
    const { data: procurementApprovals, error: paError } = await supabase
      .from('procurement_approvals')
      .select(`
        *,
        requested_by_user:requested_by(id, full_name, username, email),
        manager_approved_by_user:manager_approved_by(id, full_name, email),
        project_manager_approved_by_user:project_manager_approved_by(id, full_name, email),
        purchase_request:purchase_request_id(*)
      `)
      .eq('status', 'pending')
    
    if (paError) {
      console.error('❌ Error fetching procurement approvals:', paError)
    } else {
      console.log(`✅ Found ${procurementApprovals.length} pending procurement approvals`)
    }
    
    // 4. Test inventory approvals exist
    console.log('\n4. Checking inventory approvals...')
    const { data: inventoryApprovals, error: iaError } = await supabase
      .from('inventory_approvals')
      .select(`
        *,
        inventory:inventory_id(*),
        requested_by_user:requested_by(full_name, email),
        manager_approved_by_user:manager_approved_by(full_name, email),
        project_manager_approved_by_user:project_manager_approved_by(full_name, email)
      `)
      .eq('status', 'pending')
    
    if (iaError) {
      console.error('❌ Error fetching inventory approvals:', iaError)
    } else {
      console.log(`✅ Found ${inventoryApprovals.length} pending inventory approvals`)
    }
    
    // 5. Test RPC function
    console.log('\n5. Testing RPC function...')
    const managerUser = users.find(u => u.role === 'manager')
    if (managerUser) {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_pending_approvals', {
          p_user_id: managerUser.id,
          p_user_role: 'manager'
        })
      
      if (rpcError) {
        console.error('❌ Error calling RPC function:', rpcError)
      } else {
        console.log(`✅ RPC function returned ${rpcData.length} pending approvals`)
      }
    }
    
    // 6. Test notifications
    console.log('\n6. Checking notifications...')
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('title', 'New Purchase Request Pending Approval')
    
    if (notifError) {
      console.error('❌ Error fetching notifications:', notifError)
    } else {
      console.log(`✅ Found ${notifications.length} approval notifications`)
    }
    
    console.log('\n🎉 Approval workflow test completed!')
    console.log('\n📊 Summary:')
    console.log(`- Users: ${users.length}`)
    console.log(`- Purchase Requests: ${purchaseRequests.length}`)
    console.log(`- Procurement Approvals: ${procurementApprovals?.length || 0}`)
    console.log(`- Inventory Approvals: ${inventoryApprovals?.length || 0}`)
    console.log(`- Notifications: ${notifications?.length || 0}`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testApprovalWorkflow()
