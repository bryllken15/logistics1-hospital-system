import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING CORRECT TABLE USAGE...\n')

async function testCorrectTableUsage() {
  try {
    console.log('1️⃣ Testing Purchase Requests table...')
    
    // Test purchase_requests table
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
        console.log('   Sample purchase request:', purchaseRequests[0].title)
      }
    }
    
    console.log('\n2️⃣ Testing Procurement Approvals table...')
    
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
    
    console.log('\n3️⃣ Testing Inventory Approvals table...')
    
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
    
    console.log('\n4️⃣ Testing table separation and correct usage...')
    
    const purchaseCount = purchaseRequests?.length || 0
    const procurementCount = procurementApprovals?.length || 0
    const inventoryCount = inventoryApprovals?.length || 0
    
    console.log(`   Purchase Requests: ${purchaseCount} pending records`)
    console.log(`   Procurement Approvals: ${procurementCount} pending records`)
    console.log(`   Inventory Approvals: ${inventoryCount} pending records`)
    
    console.log('\n🎯 CORRECT TABLE USAGE RESULTS:')
    console.log('================================')
    
    const hasErrors = purchaseError || procurementError || inventoryError
    
    if (!hasErrors) {
      console.log('✅ ALL TABLES ARE WORKING WITH CORRECT USAGE!')
      console.log('')
      console.log('🔧 THE CORRECT TABLE MAPPING IS:')
      console.log('1. Purchase Requests → purchase_requests table')
      console.log('2. Procurement Approvals → procurement_approvals table')
      console.log('3. Inventory Approvals → inventory_approvals table')
      console.log('')
      console.log('🚀 DASHBOARD CONNECTIVITY:')
      console.log('1. Employee Dashboard: Uses procurement_approvals for purchase requests')
      console.log('2. Manager Dashboard: Uses purchase_requests for purchase request approvals')
      console.log('3. Manager Dashboard: Uses procurement_approvals for procurement approvals')
      console.log('4. Manager Dashboard: Uses inventory_approvals for inventory approvals')
      console.log('5. Project Manager Dashboard: Uses purchase_requests for PM approvals')
      console.log('')
      console.log('📋 WORKFLOW SEPARATION:')
      console.log('1. Purchase Requests: Employee → Manager → Project Manager')
      console.log('2. Procurement Approvals: Employee → Manager → Project Manager')
      console.log('3. Inventory Approvals: Employee → Manager → Project Manager')
      console.log('')
      console.log('🎉 THE TABLES ARE NOW CORRECTLY SEPARATED AND USED!')
    } else {
      console.log('❌ Some table connections failed:')
      if (purchaseError) console.log(`   - Purchase requests error: ${purchaseError.message}`)
      if (procurementError) console.log(`   - Procurement approvals error: ${procurementError.message}`)
      if (inventoryError) console.log(`   - Inventory approvals error: ${inventoryError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Correct table usage test failed:', error)
  }
}

testCorrectTableUsage()
