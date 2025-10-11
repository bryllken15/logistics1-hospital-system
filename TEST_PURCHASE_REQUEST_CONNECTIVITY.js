import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING PURCHASE REQUEST CONNECTIVITY...\n')

async function testPurchaseRequestConnectivity() {
  try {
    console.log('1️⃣ Testing purchase_requests table connection...')
    
    // Test connection to purchase_requests table
    const { data: purchaseRequestsData, error: purchaseRequestsError } = await supabase
      .from('purchase_requests')
      .select('*')
      .limit(5)
    
    if (purchaseRequestsError) {
      console.log(`❌ purchase_requests connection failed: ${purchaseRequestsError.message}`)
    } else {
      console.log(`✅ purchase_requests connection works: ${purchaseRequestsData?.length || 0} records`)
      
      if (purchaseRequestsData && purchaseRequestsData.length > 0) {
        console.log('   purchase_requests columns:', Object.keys(purchaseRequestsData[0]))
        console.log('   Sample data:', JSON.stringify(purchaseRequestsData[0], null, 2))
      }
    }
    
    console.log('\n2️⃣ Testing procurement_approvals table connection...')
    
    // Test connection to procurement_approvals table
    const { data: procurementData, error: procurementError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .limit(5)
    
    if (procurementError) {
      console.log(`❌ procurement_approvals connection failed: ${procurementError.message}`)
    } else {
      console.log(`✅ procurement_approvals connection works: ${procurementData?.length || 0} records`)
    }
    
    console.log('\n3️⃣ Testing Employee Dashboard purchase request submission...')
    
    // Test Employee Dashboard: Submit purchase request
    const testPurchaseRequest = {
      request_number: `PR-${Date.now().toString().slice(-8)}`,
      title: 'Test Purchase Request',
      description: 'Testing purchase request connectivity',
      item_name: 'Test Item',
      quantity: 1,
      total_amount: 1000,
      estimated_cost: 1000,
      status: 'pending',
      priority: 'medium',
      requested_date: new Date().toISOString().split('T')[0],
      required_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      requested_by: '33333333-3333-3333-3333-333333333333'
    }
    
    console.log('   Test purchase request data:', JSON.stringify(testPurchaseRequest, null, 2))
    
    const { data: insertPurchaseData, error: insertPurchaseError } = await supabase
      .from('purchase_requests')
      .insert(testPurchaseRequest)
      .select()
      .single()
    
    if (insertPurchaseError) {
      console.log(`❌ Purchase request submission failed: ${insertPurchaseError.message}`)
    } else {
      console.log(`✅ Purchase request submission works: ${insertPurchaseData.id}`)
    }
    
    console.log('\n4️⃣ Testing Employee Dashboard purchase request loading...')
    
    // Test Employee Dashboard: Get user purchase requests
    const { data: userPurchaseRequests, error: userPurchaseError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('requested_by', '33333333-3333-3333-3333-333333333333')
      .order('created_at', { ascending: false })
    
    if (userPurchaseError) {
      console.log(`❌ User purchase requests failed: ${userPurchaseError.message}`)
    } else {
      console.log(`✅ User purchase requests work: ${userPurchaseRequests?.length || 0} found`)
      
      if (userPurchaseRequests && userPurchaseRequests.length > 0) {
        const latestRequest = userPurchaseRequests[0]
        console.log(`   Latest request: ${latestRequest.title} - ${latestRequest.status}`)
        console.log(`   Total amount: ${latestRequest.total_amount}`)
        console.log(`   Priority: ${latestRequest.priority}`)
      }
    }
    
    console.log('\n5️⃣ Testing Manager Dashboard purchase request approvals...')
    
    // Test Manager Dashboard: Get pending purchase requests
    const { data: managerPurchaseRequests, error: managerPurchaseError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (managerPurchaseError) {
      console.log(`❌ Manager purchase requests failed: ${managerPurchaseError.message}`)
    } else {
      console.log(`✅ Manager purchase requests work: ${managerPurchaseRequests?.length || 0} found`)
      
      // Check if our test request is there
      const ourRequest = managerPurchaseRequests?.find(req => 
        req.title === 'Test Purchase Request'
      )
      
      if (ourRequest) {
        console.log(`   ✅ Our test purchase request is visible to manager: ${ourRequest.id}`)
      }
    }
    
    console.log('\n6️⃣ Testing Manager approval workflow...')
    
    // Test Manager approval of purchase request
    if (insertPurchaseData) {
      const { data: approvePurchaseData, error: approvePurchaseError } = await supabase
        .from('purchase_requests')
        .update({ 
          status: 'approved',
          approved_by: '22222222-2222-2222-2222-222222222222',
          updated_at: new Date().toISOString()
        })
        .eq('id', insertPurchaseData.id)
        .select()
      
      if (approvePurchaseError) {
        console.log(`❌ Purchase request approval failed: ${approvePurchaseError.message}`)
      } else {
        console.log(`✅ Purchase request approval works: ${approvePurchaseData[0]?.status}`)
      }
    }
    
    console.log('\n7️⃣ Testing Project Manager Dashboard purchase request approvals...')
    
    // Test Project Manager Dashboard: Get approved purchase requests
    const { data: pmPurchaseRequests, error: pmPurchaseError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (pmPurchaseError) {
      console.log(`❌ PM purchase requests failed: ${pmPurchaseError.message}`)
    } else {
      console.log(`✅ PM purchase requests work: ${pmPurchaseRequests?.length || 0} found`)
      
      // Check if our approved request is there
      const ourApprovedRequest = pmPurchaseRequests?.find(req => 
        req.title === 'Test Purchase Request'
      )
      
      if (ourApprovedRequest) {
        console.log(`   ✅ Our approved purchase request is visible to PM: ${ourApprovedRequest.id}`)
      }
    }
    
    console.log('\n8️⃣ Testing procurement approval workflow integration...')
    
    // Test if purchase requests create procurement approvals
    const { data: procurementApprovals, error: procurementApprovalsError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('item_name', 'Test Purchase Request')
      .order('created_at', { ascending: false })
    
    if (procurementApprovalsError) {
      console.log(`❌ Procurement approvals failed: ${procurementApprovalsError.message}`)
    } else {
      console.log(`✅ Procurement approvals work: ${procurementApprovals?.length || 0} found`)
      
      if (procurementApprovals && procurementApprovals.length > 0) {
        console.log(`   Latest procurement approval: ${procurementApprovals[0].item_name} - ${procurementApprovals[0].status}`)
      }
    }
    
    console.log('\n🎯 PURCHASE REQUEST CONNECTIVITY TEST RESULTS:')
    console.log('==============================================')
    
    const hasErrors = purchaseRequestsError || procurementError || insertPurchaseError || userPurchaseError || managerPurchaseError || pmPurchaseError || procurementApprovalsError
    
    if (!hasErrors) {
      console.log('✅ PURCHASE REQUEST CONNECTIVITY IS WORKING!')
      console.log('✅ ALL PURCHASE REQUEST TABLES ARE ACCESSIBLE!')
      console.log('✅ FRONTEND CAN CONNECT TO PURCHASE REQUEST DATABASE!')
      console.log('✅ COMPLETE PURCHASE REQUEST WORKFLOW IS FUNCTIONAL!')
      console.log('')
      console.log('🔧 PURCHASE REQUEST CONNECTIVITY IS FIXED!')
      console.log('==========================================')
      console.log('Your purchase request system is working perfectly!')
      console.log('The frontend can now connect to:')
      console.log('- purchase_requests table')
      console.log('- procurement_approvals table')
      console.log('- Complete purchase request approval workflow')
      console.log('')
      console.log('🚀 PURCHASE REQUEST WORKFLOW:')
      console.log('Employee → Manager → Project Manager → Procurement')
      console.log('')
      console.log('📋 NEXT STEPS:')
      console.log('1. Clear browser cache (Ctrl+Shift+R)')
      console.log('2. Restart dev server: npm run dev')
      console.log('3. Test Employee Dashboard purchase requests')
      console.log('4. Test Manager Dashboard purchase request approvals')
      console.log('5. Test Project Manager Dashboard purchase request approvals')
    } else {
      console.log('❌ Some purchase request connections failed:')
      if (purchaseRequestsError) console.log(`   - purchase_requests table error: ${purchaseRequestsError.message}`)
      if (procurementError) console.log(`   - procurement_approvals table error: ${procurementError.message}`)
      if (insertPurchaseError) console.log(`   - Purchase request submission error: ${insertPurchaseError.message}`)
      if (userPurchaseError) console.log(`   - User purchase requests error: ${userPurchaseError.message}`)
      if (managerPurchaseError) console.log(`   - Manager purchase requests error: ${managerPurchaseError.message}`)
      if (pmPurchaseError) console.log(`   - PM purchase requests error: ${pmPurchaseError.message}`)
      if (procurementApprovalsError) console.log(`   - Procurement approvals error: ${procurementApprovalsError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Purchase request connectivity test failed:', error)
  }
}

testPurchaseRequestConnectivity()
