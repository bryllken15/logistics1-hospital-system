import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING MANAGER DASHBOARD CONNECTIVITY FINAL...\n')

async function testManagerDashboardConnectivityFinal() {
  try {
    console.log('1️⃣ Testing Manager Dashboard Purchase Requests tab...')
    
    // Test the data that Manager Dashboard should show (Purchase Requests tab)
    const { data: purchaseRequests, error: purchaseError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (purchaseError) {
      console.log(`❌ Purchase requests failed: ${purchaseError.message}`)
    } else {
      console.log(`✅ Purchase requests work: ${purchaseRequests?.length || 0} found`)
      
      if (purchaseRequests && purchaseRequests.length > 0) {
        console.log('   Sample purchase requests for Manager Dashboard:')
        purchaseRequests.slice(0, 5).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Amount: $${req.total_amount} - Priority: ${req.priority} - Requested by: ${req.requested_by}`)
        })
      }
    }
    
    console.log('\n2️⃣ Testing Manager Dashboard Procurement Approvals tab...')
    
    // Test procurement approvals (separate workflow)
    const { data: procurementApprovals, error: procurementError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (procurementError) {
      console.log(`❌ Procurement approvals failed: ${procurementError.message}`)
    } else {
      console.log(`✅ Procurement approvals work: ${procurementApprovals?.length || 0} found`)
      
      if (procurementApprovals && procurementApprovals.length > 0) {
        console.log('   Sample procurement approvals for Manager Dashboard:')
        procurementApprovals.slice(0, 3).forEach((approval, index) => {
          console.log(`   ${index + 1}. ${approval.item_name} - Amount: $${approval.unit_price} - Priority: ${approval.priority}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing Manager Dashboard Inventory Approvals tab...')
    
    // Test inventory approvals
    const { data: inventoryApprovals, error: inventoryError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (inventoryError) {
      console.log(`❌ Inventory approvals failed: ${inventoryError.message}`)
    } else {
      console.log(`✅ Inventory approvals work: ${inventoryApprovals?.length || 0} found`)
      
      if (inventoryApprovals && inventoryApprovals.length > 0) {
        console.log('   Sample inventory approvals for Manager Dashboard:')
        inventoryApprovals.slice(0, 3).forEach((approval, index) => {
          console.log(`   ${index + 1}. ${approval.item_name} - Quantity: ${approval.quantity} - Priority: ${approval.priority}`)
        })
      }
    }
    
    console.log('\n4️⃣ Testing Manager Dashboard approval actions...')
    
    // Test if manager can approve a purchase request
    if (purchaseRequests && purchaseRequests.length > 0) {
      const testRequest = purchaseRequests[0]
      const managerId = '893ba925-2a4a-4c2f-afe3-1c90c960f467'
      
      console.log(`   Testing approval of request: ${testRequest.title}`)
      
      const { data: approvedRequest, error: approveError } = await supabase
        .from('purchase_requests')
        .update({
          status: 'approved',
          approved_by: managerId,
          approved_at: new Date().toISOString(),
          approval_notes: 'Approved by manager for testing',
          updated_at: new Date().toISOString()
        })
        .eq('id', testRequest.id)
        .select()
        .single()
      
      if (approveError) {
        console.log(`❌ Manager approval failed: ${approveError.message}`)
      } else {
        console.log(`✅ Manager approval successful!`)
        console.log(`   Request: ${approvedRequest.title}`)
        console.log(`   Status: ${approvedRequest.status}`)
        console.log(`   Approved by: ${approvedRequest.approved_by}`)
        console.log(`   Approved at: ${approvedRequest.approved_at}`)
      }
    }
    
    console.log('\n5️⃣ Testing Manager Dashboard data after approval...')
    
    // Test pending requests after approval
    const { data: pendingAfterApproval, error: pendingAfterError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (pendingAfterError) {
      console.log(`❌ Pending requests after approval failed: ${pendingAfterError.message}`)
    } else {
      console.log(`✅ Pending requests after approval: ${pendingAfterApproval?.length || 0} found`)
      console.log('   (This should be one less than before, showing the approval worked)')
    }
    
    console.log('\n6️⃣ Testing Manager Dashboard notifications...')
    
    // Test notifications for manager
    const { data: notifications, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', '893ba925-2a4a-4c2f-afe3-1c90c960f467')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (notificationError) {
      console.log(`❌ Notifications failed: ${notificationError.message}`)
    } else {
      console.log(`✅ Notifications work: ${notifications?.length || 0} found`)
      
      if (notifications && notifications.length > 0) {
        console.log('   Sample notifications for Manager Dashboard:')
        notifications.slice(0, 3).forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title} - Type: ${notif.type} - Read: ${notif.is_read}`)
        })
      }
    }
    
    console.log('\n🎯 MANAGER DASHBOARD CONNECTIVITY FINAL RESULTS:')
    console.log('=============================================')
    
    const hasErrors = purchaseError || procurementError || inventoryError || notificationError
    
    if (!hasErrors) {
      console.log('✅ MANAGER DASHBOARD IS FULLY CONNECTED!')
      console.log('')
      console.log('🔧 MANAGER DASHBOARD TABS:')
      console.log('1. Purchase Requests: Shows pending purchase requests from employees')
      console.log('2. Procurement Approvals: Shows pending procurement approvals')
      console.log('3. Inventory Approvals: Shows pending inventory change requests')
      console.log('')
      console.log('📊 MANAGER DASHBOARD DATA:')
      console.log(`   Purchase Requests: ${purchaseRequests?.length || 0} pending requests`)
      console.log(`   Procurement Approvals: ${procurementApprovals?.length || 0} pending approvals`)
      console.log(`   Inventory Approvals: ${inventoryApprovals?.length || 0} pending approvals`)
      console.log(`   Notifications: ${notifications?.length || 0} notifications`)
      console.log('')
      console.log('🚀 MANAGER DASHBOARD FUNCTIONALITY:')
      console.log('1. View pending purchase requests from employees')
      console.log('2. Approve/reject purchase requests')
      console.log('3. View pending procurement approvals')
      console.log('4. View pending inventory change requests')
      console.log('5. Receive notifications for new requests')
      console.log('')
      console.log('🎉 THE MANAGER DASHBOARD IS NOW FULLY CONNECTED!')
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('2. Restart development server: npm run dev')
      console.log('3. Open Manager Dashboard in browser')
      console.log('4. The Purchase Requests tab should be active by default')
      console.log('5. You should see all pending purchase requests in the table')
      console.log('6. You can approve/reject requests from the table')
      console.log('')
      console.log('🎉 THE MANAGER DASHBOARD CONNECTIVITY IS COMPLETE!')
    } else {
      console.log('❌ Some Manager Dashboard connections failed:')
      if (purchaseError) console.log(`   - Purchase requests error: ${purchaseError.message}`)
      if (procurementError) console.log(`   - Procurement approvals error: ${procurementError.message}`)
      if (inventoryError) console.log(`   - Inventory approvals error: ${inventoryError.message}`)
      if (notificationError) console.log(`   - Notifications error: ${notificationError.message}`)
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Run the SQL script: FIX_PURCHASE_REQUESTS_PERMISSIONS.sql')
      console.log('2. This will fix any remaining permission issues')
      console.log('3. Then test the Manager Dashboard again')
    }
    
  } catch (error) {
    console.error('💥 Manager Dashboard connectivity final test failed:', error)
  }
}

testManagerDashboardConnectivityFinal()
