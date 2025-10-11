import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING TABLE MISMATCH INVESTIGATION...\n')

async function testTableMismatchInvestigation() {
  try {
    console.log('1️⃣ Testing purchase_requests table...')
    
    const { data: purchaseRequests, error: purchaseError } = await supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (purchaseError) {
      console.log(`❌ purchase_requests table failed: ${purchaseError.message}`)
    } else {
      console.log(`✅ purchase_requests table: ${purchaseRequests?.length || 0} total records`)
      
      const pendingRequests = purchaseRequests?.filter(req => req.status === 'pending') || []
      console.log(`   Pending requests: ${pendingRequests.length}`)
      
      if (pendingRequests.length > 0) {
        console.log('   Sample pending requests:')
        pendingRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Status: ${req.status} - Requested by: ${req.requested_by}`)
        })
      }
    }
    
    console.log('\n2️⃣ Testing purchase_request_approvals table...')
    
    const { data: purchaseRequestApprovals, error: approvalError } = await supabase
      .from('purchase_request_approvals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (approvalError) {
      console.log(`❌ purchase_request_approvals table failed: ${approvalError.message}`)
    } else {
      console.log(`✅ purchase_request_approvals table: ${purchaseRequestApprovals?.length || 0} total records`)
      
      const pendingApprovals = purchaseRequestApprovals?.filter(approval => approval.status === 'pending') || []
      console.log(`   Pending approvals: ${pendingApprovals.length}`)
      
      if (pendingApprovals.length > 0) {
        console.log('   Sample pending approvals:')
        pendingApprovals.slice(0, 3).forEach((approval, index) => {
          console.log(`   ${index + 1}. Approval ID: ${approval.id} - Status: ${approval.status}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing Manager Dashboard data source...')
    
    // Test what Manager Dashboard is actually using
    const { data: managerData, error: managerError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (managerError) {
      console.log(`❌ Manager Dashboard data failed: ${managerError.message}`)
    } else {
      console.log(`✅ Manager Dashboard data: ${managerData?.length || 0} pending requests`)
      console.log('   This is what Manager Dashboard should show in the table')
      
      if (managerData && managerData.length > 0) {
        console.log('   Sample Manager Dashboard data:')
        managerData.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Amount: $${req.total_amount} - Priority: ${req.priority}`)
        })
      }
    }
    
    console.log('\n4️⃣ Testing Employee Dashboard data source...')
    
    // Test what Employee Dashboard is actually using
    const employeeId = '0b6ccaac-a97f-4d11-8795-44c6cce067c6'
    const { data: employeeData, error: employeeError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('requested_by', employeeId)
      .order('created_at', { ascending: false })
    
    if (employeeError) {
      console.log(`❌ Employee Dashboard data failed: ${employeeError.message}`)
    } else {
      console.log(`✅ Employee Dashboard data: ${employeeData?.length || 0} requests`)
      console.log('   This is what Employee Dashboard should show')
      
      if (employeeData && employeeData.length > 0) {
        console.log('   Sample Employee Dashboard data:')
        employeeData.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Status: ${req.status} - Amount: $${req.total_amount}`)
        })
      }
    }
    
    console.log('\n5️⃣ Testing table relationship...')
    
    // Check if there's a relationship between the tables
    console.log('   Checking table relationships:')
    console.log('   - purchase_requests: Main table for purchase requests')
    console.log('   - purchase_request_approvals: Approval workflow table')
    console.log('   - procurement_approvals: Procurement workflow table')
    
    // Test if there are any records in purchase_request_approvals that reference purchase_requests
    const { data: relatedApprovals, error: relatedError } = await supabase
      .from('purchase_request_approvals')
      .select(`
        *,
        request:purchase_requests(*)
      `)
      .limit(5)
    
    if (relatedError) {
      console.log(`❌ Related approvals failed: ${relatedError.message}`)
    } else {
      console.log(`✅ Related approvals: ${relatedApprovals?.length || 0} records`)
      if (relatedApprovals && relatedApprovals.length > 0) {
        console.log('   Sample related approvals:')
        relatedApprovals.slice(0, 3).forEach((approval, index) => {
          console.log(`   ${index + 1}. Approval ID: ${approval.id} - Request: ${approval.request?.title || 'No request'}`)
        })
      }
    }
    
    console.log('\n🎯 TABLE MISMATCH INVESTIGATION RESULTS:')
    console.log('=========================================')
    
    const purchaseCount = purchaseRequests?.length || 0
    const approvalCount = purchaseRequestApprovals?.length || 0
    const managerCount = managerData?.length || 0
    const employeeCount = employeeData?.length || 0
    
    console.log('📊 TABLE COUNTS:')
    console.log(`   purchase_requests: ${purchaseCount} total records`)
    console.log(`   purchase_request_approvals: ${approvalCount} total records`)
    console.log(`   Manager Dashboard: ${managerCount} pending requests`)
    console.log(`   Employee Dashboard: ${employeeCount} requests`)
    
    if (managerCount !== employeeCount) {
      console.log('')
      console.log('⚠️  MISMATCH DETECTED!')
      console.log(`   Manager Dashboard shows: ${managerCount} pending requests`)
      console.log(`   Employee Dashboard shows: ${employeeCount} requests`)
      console.log('')
      console.log('🔧 THE ISSUE IS:')
      console.log('1. Manager Dashboard shows ALL pending requests from ALL employees')
      console.log('2. Employee Dashboard shows ONLY requests from that specific employee')
      console.log('3. This is why the numbers are different!')
      console.log('')
      console.log('✅ THIS IS ACTUALLY CORRECT BEHAVIOR!')
      console.log('   - Manager should see all pending requests from all employees')
      console.log('   - Employee should only see their own requests')
    } else {
      console.log('')
      console.log('✅ NO MISMATCH DETECTED!')
      console.log('   The counts are the same, which means there might be a display issue')
    }
    
    console.log('')
    console.log('🔧 TO FIX THE "No pending purchase requests" ISSUE:')
    console.log('1. Check if the Manager Dashboard is using the correct data source')
    console.log('2. Check if the pendingApprovals state is being set correctly')
    console.log('3. Check if the table is rendering the data properly')
    console.log('4. Check browser console for JavaScript errors')
    console.log('5. Clear browser cache and restart development server')
    
  } catch (error) {
    console.error('💥 Table mismatch investigation failed:', error)
  }
}

testTableMismatchInvestigation()
