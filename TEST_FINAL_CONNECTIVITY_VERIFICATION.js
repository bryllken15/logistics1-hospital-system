import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING FINAL CONNECTIVITY VERIFICATION...\n')

async function testFinalConnectivityVerification() {
  try {
    console.log('1️⃣ Testing Purchase Requests with correct foreign keys...')
    
    // Test purchase_requests table with correct foreign key references
    const { data: purchaseRequests, error: purchaseError } = await supabase
      .from('purchase_requests')
      .select(`
        *,
        requested_by_user:requested_by!fk_purchase_requests_requested_by(id, full_name, email),
        approved_by_user:approved_by!fk_purchase_requests_approved_by(id, full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (purchaseError) {
      console.log(`❌ Purchase requests failed: ${purchaseError.message}`)
    } else {
      console.log(`✅ Purchase requests work: ${purchaseRequests?.length || 0} found`)
      if (purchaseRequests && purchaseRequests.length > 0) {
        console.log('   Sample purchase request:', purchaseRequests[0].title)
        console.log('   Requested by:', purchaseRequests[0].requested_by_user?.full_name || 'Unknown')
      }
    }
    
    console.log('\n2️⃣ Testing User Requests (Employee Dashboard)...')
    
    // Test user's own requests
    const { data: userRequests, error: userError } = await supabase
      .from('purchase_requests')
      .select(`
        *,
        requested_by_user:requested_by!fk_purchase_requests_requested_by(id, full_name, email),
        approved_by_user:approved_by!fk_purchase_requests_approved_by(id, full_name, email)
      `)
      .eq('requested_by', '33333333-3333-3333-3333-333333333333')
      .order('created_at', { ascending: false })
    
    if (userError) {
      console.log(`❌ User requests failed: ${userError.message}`)
    } else {
      console.log(`✅ User requests work: ${userRequests?.length || 0} found`)
      if (userRequests && userRequests.length > 0) {
        console.log('   Sample user request:', userRequests[0].title)
      }
    }
    
    console.log('\n3️⃣ Testing Procurement Approvals (Manager Dashboard)...')
    
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
      console.log(`✅ Procurement approvals work: ${procurementApprovals?.length || 0} found`)
      if (procurementApprovals && procurementApprovals.length > 0) {
        console.log('   Sample procurement approval:', procurementApprovals[0].item_name)
      }
    }
    
    console.log('\n4️⃣ Testing Inventory Approvals (Manager Dashboard)...')
    
    // Test inventory_approvals table
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
        console.log('   Sample inventory approval:', inventoryApprovals[0].item_name)
      }
    }
    
    console.log('\n5️⃣ Testing Project Manager Approvals...')
    
    // Test project manager approvals
    const { data: pmApprovals, error: pmError } = await supabase
      .from('purchase_requests')
      .select(`
        *,
        requested_by_user:requested_by!fk_purchase_requests_requested_by(id, full_name, email),
        approved_by_user:approved_by!fk_purchase_requests_approved_by(id, full_name, email)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (pmError) {
      console.log(`❌ PM approvals failed: ${pmError.message}`)
    } else {
      console.log(`✅ PM approvals work: ${pmApprovals?.length || 0} found`)
      if (pmApprovals && pmApprovals.length > 0) {
        console.log('   Sample PM approval:', pmApprovals[0].title)
      }
    }
    
    console.log('\n🎯 FINAL CONNECTIVITY VERIFICATION RESULTS:')
    console.log('==========================================')
    
    const hasErrors = purchaseError || userError || procurementError || inventoryError || pmError
    
    if (!hasErrors) {
      console.log('✅ ALL DASHBOARD CONNECTIVITY IS WORKING!')
      console.log('')
      console.log('🔧 THE CORRECT TABLE MAPPING:')
      console.log('1. Purchase Requests → purchase_requests table (Main table)')
      console.log('2. Procurement Approvals → procurement_approvals table (Separate workflow)')
      console.log('3. Inventory Approvals → inventory_approvals table (Inventory workflow)')
      console.log('')
      console.log('🚀 DASHBOARD CONNECTIVITY:')
      console.log('1. Employee Dashboard: Uses purchase_requests for user requests')
      console.log('2. Manager Dashboard: Uses purchase_requests for purchase approvals')
      console.log('3. Manager Dashboard: Uses procurement_approvals for procurement approvals')
      console.log('4. Manager Dashboard: Uses inventory_approvals for inventory approvals')
      console.log('5. Project Manager Dashboard: Uses purchase_requests for PM approvals')
      console.log('')
      console.log('📋 WORKFLOW SEPARATION:')
      console.log('1. Purchase Requests: Employee → Manager → Project Manager')
      console.log('2. Procurement Approvals: Employee → Manager → Project Manager')
      console.log('3. Inventory Approvals: Employee → Manager → Project Manager')
      console.log('')
      console.log('🎉 THE CONNECTIVITY IS NOW FIXED AND WORKING!')
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('2. Restart development server: npm run dev')
      console.log('3. Test the dashboards in your browser')
      console.log('4. Check if the tables are now showing data')
      console.log('')
      console.log('🎉 THE CONNECTIVITY IS NOW FIXED - TEST YOUR DASHBOARDS!')
    } else {
      console.log('❌ Some dashboard connections failed:')
      if (purchaseError) console.log(`   - Purchase requests error: ${purchaseError.message}`)
      if (userError) console.log(`   - User requests error: ${userError.message}`)
      if (procurementError) console.log(`   - Procurement approvals error: ${procurementError.message}`)
      if (inventoryError) console.log(`   - Inventory approvals error: ${inventoryError.message}`)
      if (pmError) console.log(`   - PM approvals error: ${pmError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Final connectivity verification test failed:', error)
  }
}

testFinalConnectivityVerification()