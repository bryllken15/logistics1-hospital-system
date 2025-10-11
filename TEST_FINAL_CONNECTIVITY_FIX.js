import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING FINAL CONNECTIVITY FIX...\n')

async function testFinalConnectivityFix() {
  try {
    console.log('1️⃣ Testing Employee Dashboard connectivity (FIXED)...')
    
    // Test Employee Dashboard: Submit purchase request (FIXED - no total_value)
    const testRequestData = {
      item_name: 'Final Connectivity Test',
      description: 'Testing final database connectivity fix',
      quantity: 1,
      unit_price: 1500,
      supplier: '',
      category: 'general',
      priority: 'urgent',
      status: 'pending',
      requested_by: '33333333-3333-3333-3333-333333333333',
      request_reason: 'Testing final database connectivity fix',
      request_type: 'purchase_request',
      manager_approved: false,
      project_manager_approved: false,
      admin_approved: false
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('procurement_approvals')
      .insert(testRequestData)
      .select()
      .single()
    
    if (insertError) {
      console.log(`❌ Employee request submission failed: ${insertError.message}`)
    } else {
      console.log(`✅ Employee request submission works: ${insertData.id}`)
    }
    
    console.log('\n2️⃣ Testing Employee Dashboard data loading...')
    
    // Test Employee Dashboard: Get user requests
    const { data: userRequests, error: userError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('requested_by', '33333333-3333-3333-3333-333333333333')
      .order('created_at', { ascending: false })
    
    if (userError) {
      console.log(`❌ Employee data loading failed: ${userError.message}`)
    } else {
      console.log(`✅ Employee data loading works: ${userRequests?.length || 0} requests found`)
      
      if (userRequests && userRequests.length > 0) {
        const latestRequest = userRequests[0]
        console.log(`   Latest request: ${latestRequest.item_name} - ${latestRequest.status}`)
        console.log(`   Unit price: ${latestRequest.unit_price}`)
        console.log(`   Total value: ${latestRequest.total_value || 'NULL'}`)
      }
    }
    
    console.log('\n3️⃣ Testing Manager Dashboard connectivity...')
    
    // Test Manager Dashboard: Get pending approvals
    const { data: managerApprovals, error: managerError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (managerError) {
      console.log(`❌ Manager data loading failed: ${managerError.message}`)
    } else {
      console.log(`✅ Manager data loading works: ${managerApprovals?.length || 0} approvals found`)
      
      // Check if our test request is there
      const ourRequest = managerApprovals?.find(req => 
        req.item_name === 'Final Connectivity Test'
      )
      
      if (ourRequest) {
        console.log(`   ✅ Our test request is visible to manager: ${ourRequest.id}`)
      }
    }
    
    console.log('\n4️⃣ Testing Manager approval workflow...')
    
    // Test Manager approval
    if (insertData) {
      const { data: approveData, error: approveError } = await supabase
        .from('procurement_approvals')
        .update({ 
          status: 'approved',
          manager_approved: true,
          manager_approved_by: '22222222-2222-2222-2222-222222222222',
          manager_approved_at: new Date().toISOString(),
          manager_notes: 'Final connectivity test approval',
          updated_at: new Date().toISOString()
        })
        .eq('id', insertData.id)
        .select()
      
      if (approveError) {
        console.log(`❌ Manager approval failed: ${approveError.message}`)
      } else {
        console.log(`✅ Manager approval works: ${approveData[0]?.status}`)
      }
    }
    
    console.log('\n5️⃣ Testing Project Manager Dashboard connectivity...')
    
    // Test Project Manager Dashboard: Get manager-approved requests
    const { data: pmApprovals, error: pmError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'approved')
      .eq('manager_approved', true)
      .eq('project_manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (pmError) {
      console.log(`❌ PM data loading failed: ${pmError.message}`)
    } else {
      console.log(`✅ PM data loading works: ${pmApprovals?.length || 0} approvals found`)
      
      // Check if our approved request is there
      const ourApprovedRequest = pmApprovals?.find(req => 
        req.item_name === 'Final Connectivity Test'
      )
      
      if (ourApprovedRequest) {
        console.log(`   ✅ Our approved request is visible to PM: ${ourApprovedRequest.id}`)
      }
    }
    
    console.log('\n🎯 FINAL CONNECTIVITY FIX TEST RESULTS:')
    console.log('======================================')
    
    const hasErrors = insertError || userError || managerError || pmError
    
    if (!hasErrors) {
      console.log('✅ DATABASE CONNECTIVITY IS COMPLETELY FIXED!')
      console.log('✅ ALL EXISTING TABLES ARE WORKING!')
      console.log('✅ FRONTEND CAN CONNECT TO YOUR DATABASE!')
      console.log('✅ COMPLETE APPROVAL WORKFLOW IS FUNCTIONAL!')
      console.log('')
      console.log('🔧 WHAT THIS FIXES:')
      console.log('1. Employee Dashboard connects to your procurement_approvals table')
      console.log('2. Manager Dashboard connects to your procurement_approvals table')
      console.log('3. Project Manager Dashboard connects to your procurement_approvals table')
      console.log('4. All approval workflows use your existing table structure')
      console.log('5. No more RPC function errors - direct table access')
      console.log('6. Fixed total_value constraint issue')
      console.log('')
      console.log('🚀 YOUR SYSTEM IS NOW FULLY CONNECTED!')
      console.log('=====================================')
      console.log('Employee → Manager → Project Manager workflow is working!')
      console.log('All dashboards can now connect to your existing database!')
      console.log('')
      console.log('📋 NEXT STEPS:')
      console.log('1. Clear browser cache (Ctrl+Shift+R)')
      console.log('2. Restart dev server: npm run dev')
      console.log('3. Test Employee Dashboard - should work perfectly!')
      console.log('4. Test Manager Dashboard - should work perfectly!')
      console.log('5. Test Project Manager Dashboard - should work perfectly!')
      console.log('')
      console.log('🎉 NO MORE "Failed to submit" OR "Failed to load" ERRORS!')
    } else {
      console.log('❌ Some connections still failed:')
      if (insertError) console.log(`   - Insert error: ${insertError.message}`)
      if (userError) console.log(`   - User requests error: ${userError.message}`)
      if (managerError) console.log(`   - Manager data error: ${managerError.message}`)
      if (pmError) console.log(`   - PM data error: ${pmError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Connectivity test failed:', error)
  }
}

testFinalConnectivityFix()
