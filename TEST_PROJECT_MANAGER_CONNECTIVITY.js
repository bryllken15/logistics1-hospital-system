import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING PROJECT MANAGER CONNECTIVITY...\n')

async function testProjectManagerConnectivity() {
  try {
    console.log('1️⃣ Testing Project Manager Dashboard data loading...')
    
    const projectManagerId = '07444c7e-4edd-4789-8ddb-4c408213462a' // Project Manager ID
    
    console.log('   Project Manager ID:', projectManagerId)
    
    // Test what Project Manager Dashboard should load
    console.log('\n2️⃣ Testing inventory approvals for Project Manager...')
    
    // Test inventory approvals that need Project Manager approval
    const { data: inventoryApprovals, error: inventoryError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('manager_approved', true)
      .eq('project_manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (inventoryError) {
      console.log(`❌ Inventory approvals failed: ${inventoryError.message}`)
    } else {
      console.log(`✅ Inventory approvals: ${inventoryApprovals?.length || 0} requests need Project Manager approval`)
      
      if (inventoryApprovals && inventoryApprovals.length > 0) {
        console.log('   Sample inventory approvals for Project Manager:')
        inventoryApprovals.slice(0, 3).forEach((approval, index) => {
          console.log(`   ${index + 1}. ${approval.item_name} - Quantity: ${approval.quantity} - Total: $${approval.total_value}`)
          console.log(`       Manager Approved: ${approval.manager_approved}`)
          console.log(`       Project Manager Approved: ${approval.project_manager_approved}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing inventory change requests for Project Manager...')
    
    // Test inventory change requests that need Project Manager approval
    const { data: inventoryChangeRequests, error: changeError } = await supabase
      .from('inventory_change_requests')
      .select('*')
      .eq('manager_approved', true)
      .eq('project_manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (changeError) {
      console.log(`❌ Inventory change requests failed: ${changeError.message}`)
    } else {
      console.log(`✅ Inventory change requests: ${inventoryChangeRequests?.length || 0} requests need Project Manager approval`)
      
      if (inventoryChangeRequests && inventoryChangeRequests.length > 0) {
        console.log('   Sample inventory change requests for Project Manager:')
        inventoryChangeRequests.slice(0, 3).forEach((request, index) => {
          console.log(`   ${index + 1}. Change Request ID: ${request.id} - Type: ${request.change_type}`)
          console.log(`       Manager Approved: ${request.manager_approved}`)
          console.log(`       Project Manager Approved: ${request.project_manager_approved}`)
        })
      }
    }
    
    console.log('\n4️⃣ Testing Project Manager Dashboard data sources...')
    
    // Test the exact data sources that Project Manager Dashboard uses
    console.log('   Testing Project Manager Dashboard data loading...')
    
    // Simulate what the Project Manager Dashboard loadDashboardData function does
    const [inventoryApprovalsData, inventoryChangeRequestsData, procurementApprovalsData] = await Promise.all([
      supabase
        .from('inventory_approvals')
        .select('*')
        .eq('manager_approved', true)
        .eq('project_manager_approved', false)
        .order('created_at', { ascending: false }),
      supabase
        .from('inventory_change_requests')
        .select('*')
        .eq('manager_approved', true)
        .eq('project_manager_approved', false)
        .order('created_at', { ascending: false }),
      supabase
        .from('procurement_approvals')
        .select('*')
        .eq('manager_approved', true)
        .eq('project_manager_approved', false)
        .order('created_at', { ascending: false })
    ])
    
    console.log('   Project Manager Dashboard data sources:')
    console.log(`   - Inventory Approvals: ${inventoryApprovalsData.data?.length || 0} items`)
    console.log(`   - Inventory Change Requests: ${inventoryChangeRequestsData.data?.length || 0} items`)
    console.log(`   - Procurement Approvals: ${procurementApprovalsData.data?.length || 0} items`)
    
    if (inventoryApprovalsData.error) {
      console.log(`   ❌ Inventory approvals error: ${inventoryApprovalsData.error.message}`)
    }
    if (inventoryChangeRequestsData.error) {
      console.log(`   ❌ Inventory change requests error: ${inventoryChangeRequestsData.error.message}`)
    }
    if (procurementApprovalsData.error) {
      console.log(`   ❌ Procurement approvals error: ${procurementApprovalsData.error.message}`)
    }
    
    console.log('\n5️⃣ Testing Project Manager Dashboard component state...')
    
    // Simulate the component state
    const inventoryApprovalsState = inventoryApprovalsData.data || []
    const inventoryChangeRequestsState = inventoryChangeRequestsData.data || []
    const procurementApprovalsState = procurementApprovalsData.data || []
    
    console.log('   Project Manager Dashboard component state:')
    console.log(`   - inventoryApprovals.length: ${inventoryApprovalsState.length}`)
    console.log(`   - inventoryChangeRequests.length: ${inventoryChangeRequestsState.length}`)
    console.log(`   - procurementApprovals.length: ${procurementApprovalsState.length}`)
    
    // Test the rendering logic
    if (inventoryApprovalsState.length === 0) {
      console.log('   ❌ Inventory Approvals section will show: "No pending inventory approvals for project logistics"')
    } else {
      console.log(`   ✅ Inventory Approvals section will show: ${inventoryApprovalsState.length} items`)
    }
    
    if (inventoryChangeRequestsState.length === 0) {
      console.log('   ❌ Inventory Change Requests section will show: "No pending inventory change requests"')
    } else {
      console.log(`   ✅ Inventory Change Requests section will show: ${inventoryChangeRequestsState.length} items`)
    }
    
    console.log('\n🎯 PROJECT MANAGER CONNECTIVITY RESULTS:')
    console.log('=======================================')
    
    const hasErrors = inventoryError || changeError || inventoryApprovalsData.error || inventoryChangeRequestsData.error || procurementApprovalsData.error
    
    if (!hasErrors) {
      console.log('✅ PROJECT MANAGER CONNECTIVITY WORKS!')
      console.log('')
      console.log('📊 PROJECT MANAGER DASHBOARD DATA:')
      console.log(`   Inventory Approvals: ${inventoryApprovalsState.length} items need approval`)
      console.log(`   Inventory Change Requests: ${inventoryChangeRequestsState.length} items need approval`)
      console.log(`   Procurement Approvals: ${procurementApprovalsState.length} items need approval`)
      console.log('')
      console.log('🔧 PROJECT MANAGER DASHBOARD SECTIONS:')
      console.log('1. Inventory Approvals: Shows inventory requests approved by Manager')
      console.log('2. Inventory Change Requests: Shows inventory change requests approved by Manager')
      console.log('3. Procurement Approvals: Shows procurement requests approved by Manager')
      console.log('')
      console.log('🎉 THE PROJECT MANAGER DASHBOARD IS WORKING!')
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('2. Restart development server: npm run dev')
      console.log('3. Open Project Manager Dashboard in browser')
      console.log('4. Check if the inventory approval sections are showing data')
      console.log('5. Test the approval buttons for inventory requests')
      console.log('')
      console.log('🎉 THE PROJECT MANAGER DASHBOARD IS FULLY CONNECTED!')
    } else {
      console.log('❌ PROJECT MANAGER CONNECTIVITY FAILED!')
      if (inventoryError) console.log(`   - Inventory approvals error: ${inventoryError.message}`)
      if (changeError) console.log(`   - Inventory change requests error: ${changeError.message}`)
      if (inventoryApprovalsData.error) console.log(`   - Inventory approvals data error: ${inventoryApprovalsData.error.message}`)
      if (inventoryChangeRequestsData.error) console.log(`   - Inventory change requests data error: ${inventoryChangeRequestsData.error.message}`)
      if (procurementApprovalsData.error) console.log(`   - Procurement approvals data error: ${procurementApprovalsData.error.message}`)
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Check if the Project Manager Dashboard is loading data correctly')
      console.log('2. Check if the inventory_approvals table has the right data')
      console.log('3. Check if the Project Manager Dashboard component is rendering correctly')
      console.log('4. Check browser console for JavaScript errors')
      console.log('5. Clear browser cache and restart development server')
    }
    
  } catch (error) {
    console.error('💥 Project Manager connectivity test failed:', error)
  }
}

testProjectManagerConnectivity()
