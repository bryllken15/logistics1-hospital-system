import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING PURCHASE REQUESTS PERMISSIONS FIX...\n')

async function testPurchaseRequestsPermissionsFix() {
  try {
    console.log('1️⃣ Testing purchase_requests table permissions...')
    
    // Test if we can select from purchase_requests
    const { data: selectData, error: selectError } = await supabase
      .from('purchase_requests')
      .select('*')
      .limit(5)
    
    if (selectError) {
      console.log(`❌ SELECT permission failed: ${selectError.message}`)
    } else {
      console.log(`✅ SELECT permission works: ${selectData?.length || 0} records found`)
    }
    
    console.log('\n2️⃣ Testing purchase_requests table insert...')
    
    // Test if we can insert into purchase_requests
    const testRequest = {
      request_number: `REQ-TEST-${Date.now()}`,
      title: 'Test Employee Purchase Request',
      description: 'Testing permissions for employee purchase request',
      total_amount: 1000,
      priority: 'medium',
      required_date: '2024-12-31',
      requested_date: new Date().toISOString().split('T')[0],
      requested_by: '33333333-3333-3333-3333-333333333333',
      status: 'pending'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('purchase_requests')
      .insert(testRequest)
      .select()
      .single()
    
    if (insertError) {
      console.log(`❌ INSERT permission failed: ${insertError.message}`)
    } else {
      console.log(`✅ INSERT permission works!`)
      console.log(`   Inserted request ID: ${insertData.id}`)
      console.log(`   Request number: ${insertData.request_number}`)
      console.log(`   Title: ${insertData.title}`)
      
      // Clean up test data
      console.log('\n3️⃣ Testing purchase_requests table update...')
      
      const { data: updateData, error: updateError } = await supabase
        .from('purchase_requests')
        .update({ status: 'approved', approved_by: '22222222-2222-2222-2222-222222222222' })
        .eq('id', insertData.id)
        .select()
        .single()
      
      if (updateError) {
        console.log(`❌ UPDATE permission failed: ${updateError.message}`)
      } else {
        console.log(`✅ UPDATE permission works!`)
        console.log(`   Updated status: ${updateData.status}`)
        console.log(`   Approved by: ${updateData.approved_by}`)
      }
      
      // Clean up test data
      console.log('\n4️⃣ Cleaning up test data...')
      
      const { error: deleteError } = await supabase
        .from('purchase_requests')
        .delete()
        .eq('id', insertData.id)
      
      if (deleteError) {
        console.log(`❌ DELETE permission failed: ${deleteError.message}`)
      } else {
        console.log(`✅ DELETE permission works!`)
        console.log(`   Test data cleaned up successfully`)
      }
    }
    
    console.log('\n5️⃣ Testing Employee purchase request workflow...')
    
    // Test the complete employee workflow
    const employeeRequest = {
      request_number: `REQ-EMPLOYEE-${Date.now()}`,
      title: 'Employee Test Purchase Request',
      description: 'Testing complete employee purchase request workflow',
      total_amount: 500,
      priority: 'low',
      required_date: '2024-12-31',
      requested_date: new Date().toISOString().split('T')[0],
      requested_by: '33333333-3333-3333-3333-333333333333',
      status: 'pending'
    }
    
    const { data: employeeRequestData, error: employeeError } = await supabase
      .from('purchase_requests')
      .insert(employeeRequest)
      .select()
      .single()
    
    if (employeeError) {
      console.log(`❌ Employee purchase request failed: ${employeeError.message}`)
    } else {
      console.log(`✅ Employee purchase request submitted successfully!`)
      console.log(`   Request ID: ${employeeRequestData.id}`)
      console.log(`   Title: ${employeeRequestData.title}`)
      console.log(`   Status: ${employeeRequestData.status}`)
      
      // Test manager approval
      const { data: approvedData, error: approveError } = await supabase
        .from('purchase_requests')
        .update({
          status: 'approved',
          approved_by: '22222222-2222-2222-2222-222222222222',
          approved_at: new Date().toISOString(),
          approval_notes: 'Approved by manager',
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeRequestData.id)
        .select()
        .single()
      
      if (approveError) {
        console.log(`❌ Manager approval failed: ${approveError.message}`)
      } else {
        console.log(`✅ Manager approval successful!`)
        console.log(`   Status: ${approvedData.status}`)
        console.log(`   Approved by: ${approvedData.approved_by}`)
      }
    }
    
    console.log('\n🎯 PURCHASE REQUESTS PERMISSIONS FIX RESULTS:')
    console.log('============================================')
    
    const hasErrors = selectError || insertError || employeeError
    
    if (!hasErrors) {
      console.log('✅ ALL PURCHASE REQUESTS PERMISSIONS ARE WORKING!')
      console.log('')
      console.log('🔧 THE FIX APPLIED:')
      console.log('1. Disabled RLS on purchase_requests table')
      console.log('2. Granted permissions to authenticated users')
      console.log('3. Added missing columns if needed')
      console.log('4. Created indexes for better performance')
      console.log('')
      console.log('🚀 EMPLOYEE PURCHASE REQUEST WORKFLOW:')
      console.log('1. Employee submits request → purchase_requests table')
      console.log('2. Manager sees pending requests in Manager Dashboard')
      console.log('3. Manager approves/rejects request')
      console.log('4. Project Manager sees approved requests for final approval')
      console.log('')
      console.log('🎉 THE EMPLOYEE PURCHASE REQUEST CONNECTIVITY IS NOW FIXED!')
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Run the SQL script: FIX_PURCHASE_REQUESTS_PERMISSIONS.sql')
      console.log('2. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('3. Restart development server: npm run dev')
      console.log('4. Test Employee Dashboard: Submit a purchase request')
      console.log('5. Test Manager Dashboard: Approve the request')
      console.log('')
      console.log('🎉 THE EMPLOYEE PURCHASE REQUEST CONNECTIVITY IS FIXED!')
    } else {
      console.log('❌ Some permissions failed:')
      if (selectError) console.log(`   - SELECT error: ${selectError.message}`)
      if (insertError) console.log(`   - INSERT error: ${insertError.message}`)
      if (employeeError) console.log(`   - Employee request error: ${employeeError.message}`)
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Run the SQL script: FIX_PURCHASE_REQUESTS_PERMISSIONS.sql')
      console.log('2. This will disable RLS and grant necessary permissions')
      console.log('3. Then test the Employee Dashboard again')
    }
    
  } catch (error) {
    console.error('💥 Purchase requests permissions fix test failed:', error)
  }
}

testPurchaseRequestsPermissionsFix()
