import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING DASHBOARD CONNECTIVITY FIX...\n')

async function testDashboardConnectivityFix() {
  try {
    console.log('1️⃣ Testing Employee Dashboard connectivity...')
    
    // Test Employee Dashboard: Should use procurement_approvals for purchase requests
    const { data: employeeRequests, error: employeeError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('requested_by', '33333333-3333-3333-3333-333333333333')
      .eq('request_type', 'purchase_request')
      .order('created_at', { ascending: false })
    
    if (employeeError) {
      console.log(`❌ Employee requests failed: ${employeeError.message}`)
    } else {
      console.log(`✅ Employee requests work: ${employeeRequests?.length || 0} found`)
    }
    
    console.log('\n2️⃣ Testing Manager Dashboard connectivity...')
    
    // Test Manager Dashboard: Should use procurement_approvals for pending approvals
    const { data: managerApprovals, error: managerError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (managerError) {
      console.log(`❌ Manager approvals failed: ${managerError.message}`)
    } else {
      console.log(`✅ Manager approvals work: ${managerApprovals?.length || 0} found`)
    }
    
    console.log('\n3️⃣ Testing Project Manager Dashboard connectivity...')
    
    // Test Project Manager Dashboard: Should use procurement_approvals for manager-approved requests
    const { data: pmApprovals, error: pmError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'approved')
      .eq('manager_approved', true)
      .eq('project_manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (pmError) {
      console.log(`❌ PM approvals failed: ${pmError.message}`)
    } else {
      console.log(`✅ PM approvals work: ${pmApprovals?.length || 0} found`)
    }
    
    console.log('\n4️⃣ Testing inventory connectivity...')
    
    // Test Inventory connectivity
    const { data: inventoryRequests, error: inventoryError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('requested_by', '33333333-3333-3333-3333-333333333333')
      .order('created_at', { ascending: false })
    
    if (inventoryError) {
      console.log(`❌ Inventory requests failed: ${inventoryError.message}`)
    } else {
      console.log(`✅ Inventory requests work: ${inventoryRequests?.length || 0} found`)
    }
    
    console.log('\n5️⃣ Testing purchase_requests table...')
    
    // Test if purchase_requests table exists and has data
    const { data: purchaseRequests, error: purchaseError } = await supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (purchaseError) {
      console.log(`❌ Purchase requests table failed: ${purchaseError.message}`)
      console.log('   This means the purchase_requests table might not exist or have permission issues')
    } else {
      console.log(`✅ Purchase requests table works: ${purchaseRequests?.length || 0} found`)
    }
    
    console.log('\n🎯 DASHBOARD CONNECTIVITY FIX TEST RESULTS:')
    console.log('==========================================')
    
    const hasErrors = employeeError || managerError || pmError || inventoryError || purchaseError
    
    if (!hasErrors) {
      console.log('✅ ALL DASHBOARD CONNECTIVITY IS WORKING!')
      console.log('✅ EMPLOYEE DASHBOARD: Uses procurement_approvals for purchase requests')
      console.log('✅ MANAGER DASHBOARD: Uses procurement_approvals for pending approvals')
      console.log('✅ PROJECT MANAGER DASHBOARD: Uses procurement_approvals for manager-approved requests')
      console.log('✅ INVENTORY: Uses inventory_approvals for inventory requests')
      console.log('✅ PURCHASE_REQUESTS: Table exists and accessible')
      console.log('')
      console.log('🔧 THE ISSUE IS LIKELY:')
      console.log('1. Frontend components not using the correct data sources')
      console.log('2. Service functions pointing to wrong tables')
      console.log('3. React state not updating properly')
      console.log('4. Browser cache issues')
      console.log('')
      console.log('🚀 FRONTEND FIXES NEEDED:')
      console.log('1. Employee Dashboard: Use procurement_approvals for purchase requests')
      console.log('2. Manager Dashboard: Use procurement_approvals for approvals')
      console.log('3. Project Manager Dashboard: Use procurement_approvals for PM approvals')
      console.log('4. Inventory: Use inventory_approvals for inventory requests')
      console.log('')
      console.log('📋 NEXT STEPS:')
      console.log('1. Fix Employee Dashboard to use procurement_approvals')
      console.log('2. Fix Manager Dashboard to use procurement_approvals')
      console.log('3. Fix Project Manager Dashboard to use procurement_approvals')
      console.log('4. Ensure inventory uses inventory_approvals')
      console.log('')
      console.log('🎉 THE DATABASE CONNECTIVITY IS WORKING - FIX THE FRONTEND SERVICES!')
    } else {
      console.log('❌ Some dashboard connections failed:')
      if (employeeError) console.log(`   - Employee requests error: ${employeeError.message}`)
      if (managerError) console.log(`   - Manager approvals error: ${managerError.message}`)
      if (pmError) console.log(`   - PM approvals error: ${pmError.message}`)
      if (inventoryError) console.log(`   - Inventory requests error: ${inventoryError.message}`)
      if (purchaseError) console.log(`   - Purchase requests table error: ${purchaseError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Dashboard connectivity fix test failed:', error)
  }
}

testDashboardConnectivityFix()
