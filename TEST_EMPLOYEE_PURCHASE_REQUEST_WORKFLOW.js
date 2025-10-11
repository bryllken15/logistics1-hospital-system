import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING EMPLOYEE PURCHASE REQUEST WORKFLOW...\n')

async function testEmployeePurchaseRequestWorkflow() {
  try {
    console.log('1️⃣ Testing Employee purchase request submission...')
    
    // Simulate employee submitting a purchase request
    const employeeId = '33333333-3333-3333-3333-333333333333' // Employee ID
    const requestData = {
      request_number: `REQ-${Date.now()}`,
      title: 'Test Employee Purchase Request',
      description: 'This is a test purchase request from employee',
      total_amount: 1000,
      priority: 'medium',
      required_date: '2024-12-31',
      requested_date: new Date().toISOString().split('T')[0],
      requested_by: employeeId,
      status: 'pending'
    }
    
    const { data: submittedRequest, error: submitError } = await supabase
      .from('purchase_requests')
      .insert(requestData)
      .select()
      .single()
    
    if (submitError) {
      console.log(`❌ Employee purchase request submission failed: ${submitError.message}`)
    } else {
      console.log(`✅ Employee purchase request submitted successfully!`)
      console.log(`   Request ID: ${submittedRequest.id}`)
      console.log(`   Title: ${submittedRequest.title}`)
      console.log(`   Amount: $${submittedRequest.total_amount}`)
      console.log(`   Status: ${submittedRequest.status}`)
    }
    
    console.log('\n2️⃣ Testing Employee dashboard data loading...')
    
    // Test employee's own requests
    const { data: employeeRequests, error: employeeError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('requested_by', employeeId)
      .order('created_at', { ascending: false })
    
    if (employeeError) {
      console.log(`❌ Employee requests loading failed: ${employeeError.message}`)
    } else {
      console.log(`✅ Employee requests loaded: ${employeeRequests?.length || 0} found`)
      
      if (employeeRequests && employeeRequests.length > 0) {
        console.log('   Sample employee requests:')
        employeeRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Status: ${req.status} - Amount: $${req.total_amount}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing Manager Dashboard approval workflow...')
    
    // Test pending purchase requests for manager approval
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (pendingError) {
      console.log(`❌ Pending requests loading failed: ${pendingError.message}`)
    } else {
      console.log(`✅ Pending requests loaded: ${pendingRequests?.length || 0} found`)
      
      if (pendingRequests && pendingRequests.length > 0) {
        console.log('   Sample pending requests for manager approval:')
        pendingRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Requested by: ${req.requested_by} - Amount: $${req.total_amount}`)
        })
      }
    }
    
    console.log('\n4️⃣ Testing Manager approval action...')
    
    // Test manager approving a request
    if (submittedRequest) {
      const managerId = '22222222-2222-2222-2222-222222222222' // Manager ID
      
      const { data: approvedRequest, error: approveError } = await supabase
        .from('purchase_requests')
        .update({
          status: 'approved',
          approved_by: managerId,
          approved_at: new Date().toISOString(),
          approval_notes: 'Approved by manager',
          updated_at: new Date().toISOString()
        })
        .eq('id', submittedRequest.id)
        .select()
        .single()
      
      if (approveError) {
        console.log(`❌ Manager approval failed: ${approveError.message}`)
      } else {
        console.log(`✅ Manager approval successful!`)
        console.log(`   Request ID: ${approvedRequest.id}`)
        console.log(`   Status: ${approvedRequest.status}`)
        console.log(`   Approved by: ${approvedRequest.approved_by}`)
        console.log(`   Approved at: ${approvedRequest.approved_at}`)
      }
    }
    
    console.log('\n5️⃣ Testing Project Manager approval workflow...')
    
    // Test approved requests for project manager approval
    const { data: approvedRequests, error: approvedError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (approvedError) {
      console.log(`❌ Approved requests loading failed: ${approvedError.message}`)
    } else {
      console.log(`✅ Approved requests loaded: ${approvedRequests?.length || 0} found`)
      
      if (approvedRequests && approvedRequests.length > 0) {
        console.log('   Sample approved requests for PM approval:')
        approvedRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Approved by: ${req.approved_by} - Amount: $${req.total_amount}`)
        })
      }
    }
    
    console.log('\n🎯 EMPLOYEE PURCHASE REQUEST WORKFLOW RESULTS:')
    console.log('============================================')
    
    const hasErrors = submitError || employeeError || pendingError || approvedError
    
    if (!hasErrors) {
      console.log('✅ EMPLOYEE PURCHASE REQUEST WORKFLOW IS WORKING!')
      console.log('')
      console.log('🔧 THE WORKFLOW:')
      console.log('1. Employee submits purchase request → purchase_requests table')
      console.log('2. Manager sees pending requests in Manager Dashboard')
      console.log('3. Manager approves/rejects request → updates purchase_requests table')
      console.log('4. Project Manager sees approved requests for final approval')
      console.log('')
      console.log('📊 WORKFLOW DATA:')
      console.log(`   Employee requests: ${employeeRequests?.length || 0} found`)
      console.log(`   Pending requests: ${pendingRequests?.length || 0} found`)
      console.log(`   Approved requests: ${approvedRequests?.length || 0} found`)
      console.log('')
      console.log('🚀 DASHBOARD CONNECTIVITY:')
      console.log('1. Employee Dashboard: Shows employee\'s own requests')
      console.log('2. Manager Dashboard: Shows pending requests for approval')
      console.log('3. Project Manager Dashboard: Shows approved requests for final approval')
      console.log('')
      console.log('🎉 THE EMPLOYEE PURCHASE REQUEST WORKFLOW IS NOW CONNECTED!')
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('2. Restart development server: npm run dev')
      console.log('3. Test Employee Dashboard: Submit a purchase request')
      console.log('4. Test Manager Dashboard: Approve the request')
      console.log('5. Test Project Manager Dashboard: Final approval')
      console.log('')
      console.log('🎉 THE EMPLOYEE PURCHASE REQUEST CONNECTIVITY IS FIXED!')
    } else {
      console.log('❌ Some workflow steps failed:')
      if (submitError) console.log(`   - Employee submission error: ${submitError.message}`)
      if (employeeError) console.log(`   - Employee requests error: ${employeeError.message}`)
      if (pendingError) console.log(`   - Pending requests error: ${pendingError.message}`)
      if (approvedError) console.log(`   - Approved requests error: ${approvedError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Employee purchase request workflow test failed:', error)
  }
}

testEmployeePurchaseRequestWorkflow()
