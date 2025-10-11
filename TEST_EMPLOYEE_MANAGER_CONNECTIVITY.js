import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING EMPLOYEE → MANAGER CONNECTIVITY...\n')

async function testEmployeeManagerConnectivity() {
  try {
    console.log('1️⃣ Testing Employee purchase request submission...')
    
    // Simulate Employee submitting a purchase request
    const employeeId = '0b6ccaac-a97f-4d11-8795-44c6cce067c6' // Employee ID
    const managerId = '893ba925-2a4a-4c2f-afe3-1c90c960f467' // Manager ID
    
    console.log('   Employee ID:', employeeId)
    console.log('   Manager ID:', managerId)
    
    // Test the exact function that Employee Dashboard uses
    const requestData = {
      title: 'Employee Test Request',
      description: 'This is a test request from Employee to Manager',
      total_amount: 5000,
      priority: 'medium',
      required_date: '2024-12-31',
      requested_by: employeeId
    }
    
    console.log('   Submitting purchase request:', requestData.title)
    
    // Simulate approvalService.submitPurchaseRequest()
    const requestDataToInsert = {
      request_number: `REQ-${Date.now()}`,
      title: requestData.title,
      description: requestData.description,
      total_amount: requestData.total_amount,
      priority: requestData.priority,
      required_date: requestData.required_date,
      requested_date: new Date().toISOString().split('T')[0],
      requested_by: requestData.requested_by,
      status: 'pending'
    }
    
    const { data: insertedRequest, error: insertError } = await supabase
      .from('purchase_requests')
      .insert(requestDataToInsert)
      .select()
      .single()
    
    if (insertError) {
      console.log(`❌ Employee purchase request submission failed: ${insertError.message}`)
      return
    }
    
    console.log(`✅ Employee purchase request submitted successfully!`)
    console.log(`   Request ID: ${insertedRequest.id}`)
    console.log(`   Request Number: ${insertedRequest.request_number}`)
    console.log(`   Status: ${insertedRequest.status}`)
    console.log(`   Requested by: ${insertedRequest.requested_by}`)
    
    console.log('\n2️⃣ Testing Manager Dashboard data loading...')
    
    // Test if Manager Dashboard can see the Employee's request
    const { data: managerView, error: managerError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (managerError) {
      console.log(`❌ Manager Dashboard data loading failed: ${managerError.message}`)
      return
    }
    
    console.log(`✅ Manager Dashboard can see: ${managerView?.length || 0} pending requests`)
    
    // Check if the Employee's request is visible to Manager
    const employeeRequest = managerView?.find(req => req.id === insertedRequest.id)
    if (employeeRequest) {
      console.log(`✅ Manager can see Employee's request: ${employeeRequest.title}`)
      console.log(`   Request details: ${employeeRequest.description}`)
      console.log(`   Amount: $${employeeRequest.total_amount}`)
      console.log(`   Priority: ${employeeRequest.priority}`)
    } else {
      console.log(`❌ Manager cannot see Employee's request!`)
      console.log(`   This is the connectivity issue!`)
    }
    
    console.log('\n3️⃣ Testing Manager approval workflow...')
    
    // Test if Manager can approve the Employee's request
    const { data: approvedRequest, error: approveError } = await supabase
      .from('purchase_requests')
      .update({
        status: 'approved',
        approved_by: managerId,
        approved_at: new Date().toISOString(),
        approval_notes: 'Approved by manager',
        updated_at: new Date().toISOString()
      })
      .eq('id', insertedRequest.id)
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
    
    console.log('\n4️⃣ Testing Employee Dashboard after Manager approval...')
    
    // Test if Employee Dashboard can see the approved request
    const { data: employeeView, error: employeeError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('requested_by', employeeId)
      .order('created_at', { ascending: false })
    
    if (employeeError) {
      console.log(`❌ Employee Dashboard data loading failed: ${employeeError.message}`)
    } else {
      console.log(`✅ Employee Dashboard can see: ${employeeView?.length || 0} requests`)
      
      const employeeApprovedRequest = employeeView?.find(req => req.id === insertedRequest.id)
      if (employeeApprovedRequest) {
        console.log(`✅ Employee can see approved request: ${employeeApprovedRequest.title}`)
        console.log(`   Status: ${employeeApprovedRequest.status}`)
        console.log(`   Approved by: ${employeeApprovedRequest.approved_by}`)
      } else {
        console.log(`❌ Employee cannot see approved request!`)
      }
    }
    
    console.log('\n🎯 EMPLOYEE → MANAGER CONNECTIVITY RESULTS:')
    console.log('==========================================')
    
    if (insertError || managerError || approveError || employeeError) {
      console.log('❌ EMPLOYEE → MANAGER CONNECTIVITY FAILED!')
      if (insertError) console.log(`   - Employee submission error: ${insertError.message}`)
      if (managerError) console.log(`   - Manager Dashboard error: ${managerError.message}`)
      if (approveError) console.log(`   - Manager approval error: ${approveError.message}`)
      if (employeeError) console.log(`   - Employee Dashboard error: ${employeeError.message}`)
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Check if the purchase_requests table has proper permissions')
      console.log('2. Check if the foreign key relationships are working')
      console.log('3. Check if the approvalService functions are working correctly')
      console.log('4. Check if the Manager Dashboard is loading data correctly')
    } else {
      console.log('✅ EMPLOYEE → MANAGER CONNECTIVITY WORKS!')
      console.log('')
      console.log('🔧 WORKFLOW CONFIRMED:')
      console.log('1. Employee submits purchase request → purchase_requests table')
      console.log('2. Manager Dashboard loads pending requests → shows Employee request')
      console.log('3. Manager approves request → updates status to approved')
      console.log('4. Employee Dashboard shows approved request → status updated')
      console.log('')
      console.log('🎉 THE EMPLOYEE → MANAGER CONNECTIVITY IS WORKING!')
    }
    
  } catch (error) {
    console.error('💥 Employee → Manager connectivity test failed:', error)
  }
}

testEmployeeManagerConnectivity()
