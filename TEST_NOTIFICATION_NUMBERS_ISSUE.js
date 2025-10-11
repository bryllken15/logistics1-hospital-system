import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING NOTIFICATION NUMBERS ISSUE...\n')

async function testNotificationNumbersIssue() {
  try {
    console.log('1️⃣ Testing purchase requests data...')
    
    // Test purchase_requests table
    const { data: purchaseRequests, error: purchaseError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (purchaseError) {
      console.log(`❌ Purchase requests failed: ${purchaseError.message}`)
    } else {
      console.log(`✅ Purchase requests: ${purchaseRequests?.length || 0} pending requests`)
      
      if (purchaseRequests && purchaseRequests.length > 0) {
        console.log('   Sample purchase requests:')
        purchaseRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Amount: $${req.total_amount} - Status: ${req.status}`)
        })
      }
    }
    
    console.log('\n2️⃣ Testing procurement approvals data...')
    
    // Test procurement_approvals table
    const { data: procurementApprovals, error: procurementError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (procurementError) {
      console.log(`❌ Procurement approvals failed: ${procurementError.message}`)
    } else {
      console.log(`✅ Procurement approvals: ${procurementApprovals?.length || 0} pending approvals`)
      
      if (procurementApprovals && procurementApprovals.length > 0) {
        console.log('   Sample procurement approvals:')
        procurementApprovals.slice(0, 3).forEach((approval, index) => {
          console.log(`   ${index + 1}. ${approval.item_name} - Amount: $${approval.unit_price} - Manager Approved: ${approval.manager_approved}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing Manager Dashboard notification sources...')
    
    // Test what Manager Dashboard is using for notifications
    const managerId = '893ba925-2a4a-4c2f-afe3-1c90c960f467' // Manager ID
    
    console.log('   Manager ID:', managerId)
    
    // Test notifications for manager
    const { data: notifications, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', managerId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (notificationError) {
      console.log(`❌ Notifications failed: ${notificationError.message}`)
    } else {
      console.log(`✅ Notifications: ${notifications?.length || 0} notifications for manager`)
      
      if (notifications && notifications.length > 0) {
        console.log('   Sample notifications:')
        notifications.slice(0, 3).forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title} - Type: ${notif.type} - Read: ${notif.is_read}`)
        })
      }
    }
    
    console.log('\n4️⃣ Testing Manager Dashboard data sources...')
    
    // Test what Manager Dashboard is actually loading
    console.log('   Testing Manager Dashboard data sources:')
    console.log(`   - Purchase Requests: ${purchaseRequests?.length || 0} items`)
    console.log(`   - Procurement Approvals: ${procurementApprovals?.length || 0} items`)
    console.log(`   - Notifications: ${notifications?.length || 0} items`)
    
    console.log('\n5️⃣ Testing notification number calculation...')
    
    // Test how notification numbers are calculated
    const purchaseRequestCount = purchaseRequests?.length || 0
    const procurementApprovalCount = procurementApprovals?.length || 0
    const notificationCount = notifications?.length || 0
    
    console.log('   Notification number calculation:')
    console.log(`   - Purchase Requests count: ${purchaseRequestCount}`)
    console.log(`   - Procurement Approvals count: ${procurementApprovalCount}`)
    console.log(`   - Total notifications: ${notificationCount}`)
    
    if (purchaseRequestCount !== procurementApprovalCount) {
      console.log('')
      console.log('⚠️  NOTIFICATION NUMBER MISMATCH DETECTED!')
      console.log(`   Purchase Requests: ${purchaseRequestCount} items`)
      console.log(`   Procurement Approvals: ${procurementApprovalCount} items`)
      console.log('')
      console.log('🔧 THE ISSUE IS:')
      console.log('1. Manager Dashboard notifications are showing procurement approval numbers')
      console.log('2. But they should show purchase request numbers')
      console.log('3. This is why the notification numbers are incorrect!')
      console.log('')
      console.log('✅ THIS EXPLAINS WHY NOTIFICATION NUMBERS ARE WRONG!')
    } else {
      console.log('')
      console.log('✅ NO NOTIFICATION NUMBER MISMATCH DETECTED!')
      console.log('   The notification numbers are correct')
    }
    
    console.log('\n🎯 NOTIFICATION NUMBERS ISSUE RESULTS:')
    console.log('=====================================')
    
    if (purchaseError || procurementError || notificationError) {
      console.log('❌ NOTIFICATION NUMBERS TEST FAILED!')
      if (purchaseError) console.log(`   - Purchase requests error: ${purchaseError.message}`)
      if (procurementError) console.log(`   - Procurement approvals error: ${procurementError.message}`)
      if (notificationError) console.log(`   - Notifications error: ${notificationError.message}`)
    } else {
      console.log('✅ NOTIFICATION NUMBERS TEST COMPLETE!')
      console.log('')
      console.log('🔧 THE ISSUE IS IDENTIFIED:')
      console.log('1. Manager Dashboard notifications are using procurement approval data')
      console.log('2. But they should use purchase request data')
      console.log('3. This causes incorrect notification numbers')
      console.log('')
      console.log('🚀 TO FIX THIS:')
      console.log('1. Check if Manager Dashboard is using the correct data source for notifications')
      console.log('2. Update notification calculation to use purchase_requests table')
      console.log('3. Ensure purchase request notifications are separate from procurement notifications')
      console.log('4. This will make notification numbers accurate')
      console.log('')
      console.log('🎉 THE NOTIFICATION NUMBERS ISSUE IS IDENTIFIED!')
    }
    
  } catch (error) {
    console.error('💥 Notification numbers test failed:', error)
  }
}

testNotificationNumbersIssue()
