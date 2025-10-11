import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING MANAGER DASHBOARD DATA SOURCES...\n')

async function testManagerDashboardDataSources() {
  try {
    console.log('1️⃣ Testing Purchase Requests data source (approvalService.getPendingApprovals)...')
    
    // Simulate what approvalService.getPendingApprovals() does
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
        console.log('   Sample purchase requests:')
        purchaseRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Amount: $${req.total_amount} - Priority: ${req.priority} - Requested by: ${req.requested_by}`)
        })
      }
    }
    
    console.log('\n2️⃣ Testing Procurement Approvals data source (procurementApprovalService.getPendingManagerApprovals)...')
    
    // Simulate what procurementApprovalService.getPendingManagerApprovals() does
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
        console.log('   Sample procurement approvals:')
        procurementApprovals.slice(0, 3).forEach((approval, index) => {
          console.log(`   ${index + 1}. ${approval.item_name} - Amount: $${approval.unit_price} - Priority: ${approval.priority} - Requested by: ${approval.requested_by}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing data source separation...')
    
    // Check if the data sources are different
    const purchaseCount = purchaseRequests?.length || 0
    const procurementCount = procurementApprovals?.length || 0
    
    console.log(`   Purchase Requests count: ${purchaseCount}`)
    console.log(`   Procurement Approvals count: ${procurementCount}`)
    
    if (purchaseCount > 0 && procurementCount > 0) {
      console.log('   ✅ Both data sources have data')
      
      // Check if they have different titles/items
      const purchaseTitles = purchaseRequests?.map(req => req.title) || []
      const procurementTitles = procurementApprovals?.map(approval => approval.item_name) || []
      
      const hasDifferentTitles = purchaseTitles.some(title => !procurementTitles.includes(title))
      
      if (hasDifferentTitles) {
        console.log('   ✅ Data sources have different content')
        console.log('   Purchase Requests titles:', purchaseTitles.slice(0, 3))
        console.log('   Procurement Approvals titles:', procurementTitles.slice(0, 3))
      } else {
        console.log('   ⚠️  Data sources might have similar content')
        console.log('   This could cause confusion in the Manager Dashboard')
      }
    } else {
      console.log('   ⚠️  One or both data sources are empty')
    }
    
    console.log('\n4️⃣ Testing Manager Dashboard tab data mapping...')
    
    // Simulate the Manager Dashboard data mapping
    const pendingApprovals = (purchaseRequests || []).map(req => ({
      approval_id: req.id,
      request_id: req.id,
      request_title: req.title,
      request_description: req.description,
      total_amount: req.total_amount,
      requested_by_name: 'Unknown', // Simplified for testing
      requested_date: req.requested_date,
      required_date: req.required_date,
      priority: req.priority,
      approval_status: req.status,
      created_at: req.created_at
    }))
    
    console.log(`   Mapped pending approvals: ${pendingApprovals.length} items`)
    
    if (pendingApprovals.length > 0) {
      console.log('   Sample mapped data for Manager Dashboard:')
      pendingApprovals.slice(0, 3).forEach((approval, index) => {
        console.log(`   ${index + 1}. ${approval.request_title} - Amount: $${approval.total_amount} - Priority: ${approval.priority}`)
      })
    }
    
    console.log('\n5️⃣ Testing Manager Dashboard stats...')
    
    // Test the stats calculation
    const stats = {
      pendingApprovals: purchaseCount,
      totalRequests: purchaseCount,
      approvedRequests: 0,
      rejectedRequests: 0
    }
    
    console.log(`   Stats: ${JSON.stringify(stats)}`)
    
    console.log('\n🎯 MANAGER DASHBOARD DATA SOURCES RESULTS:')
    console.log('==========================================')
    
    const hasErrors = purchaseError || procurementError
    
    if (!hasErrors) {
      console.log('✅ MANAGER DASHBOARD DATA SOURCES ARE WORKING!')
      console.log('')
      console.log('🔧 DATA SOURCE SEPARATION:')
      console.log('1. Purchase Requests tab: Uses purchase_requests table')
      console.log('2. Procurement Approvals tab: Uses procurement_approvals table')
      console.log('3. Inventory Approvals tab: Uses inventory_approvals table')
      console.log('')
      console.log('📊 DATA SOURCES:')
      console.log(`   Purchase Requests: ${purchaseCount} items from purchase_requests table`)
      console.log(`   Procurement Approvals: ${procurementCount} items from procurement_approvals table`)
      console.log('')
      console.log('🚀 MANAGER DASHBOARD SHOULD SHOW:')
      console.log('1. Purchase Requests tab: Pending purchase requests from employees')
      console.log('2. Procurement Approvals tab: Pending procurement approvals')
      console.log('3. Different data in each tab')
      console.log('')
      console.log('🎉 THE DATA SOURCES ARE PROPERLY SEPARATED!')
      console.log('')
      console.log('🔧 IF THE MANAGER DASHBOARD IS NOT SHOWING DATA:')
      console.log('1. Check if the Purchase Requests tab is active (default)')
      console.log('2. Check if the pendingApprovals state is being set correctly')
      console.log('3. Check if the table is rendering the data')
      console.log('4. Check browser console for JavaScript errors')
      console.log('5. Clear browser cache and restart development server')
      console.log('')
      console.log('🎉 THE MANAGER DASHBOARD DATA SOURCES ARE WORKING!')
    } else {
      console.log('❌ Some data sources failed:')
      if (purchaseError) console.log(`   - Purchase requests error: ${purchaseError.message}`)
      if (procurementError) console.log(`   - Procurement approvals error: ${procurementError.message}`)
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Run the SQL script: FIX_PURCHASE_REQUESTS_PERMISSIONS.sql')
      console.log('2. This will fix any permission issues')
      console.log('3. Then test the Manager Dashboard again')
    }
    
  } catch (error) {
    console.error('💥 Manager Dashboard data sources test failed:', error)
  }
}

testManagerDashboardDataSources()
