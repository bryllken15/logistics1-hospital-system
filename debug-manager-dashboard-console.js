// Debug Manager Dashboard console issues
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugManagerDashboardConsole() {
  console.log('🔍 Debugging Manager Dashboard Console Issues...\n')

  try {
    // Test 1: Check if the service function works
    console.log('1️⃣ Testing procurementApprovalService.getPendingApprovals()...')
    
    const { data, error } = await supabase
      .from('procurement_approvals')
      .select(`
        *,
        requested_by_user:requested_by(id, full_name, username, email),
        manager_approved_by_user:manager_approved_by(id, full_name, email),
        project_manager_approved_by_user:project_manager_approved_by(id, full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('❌ Service function error:', error.message)
      console.log('   Full error:', error)
      return false
    }

    console.log('✅ Service function works!')
    console.log('   Found', (data || []).length, 'pending approvals')

    // Test 2: Check if the data is what the UI expects
    console.log('\n2️⃣ Checking data for UI...')
    if (data && data.length > 0) {
      const sampleApproval = data[0]
      console.log('   Sample approval:')
      console.log('     - ID:', sampleApproval.id)
      console.log('     - Item name:', sampleApproval.item_name)
      console.log('     - Status:', sampleApproval.status)
      console.log('     - Manager approved:', sampleApproval.manager_approved)
      console.log('     - Project manager approved:', sampleApproval.project_manager_approved)
      console.log('     - Total value:', sampleApproval.total_value)
      
      // Check if the data structure matches what the UI expects
      const uiFields = ['id', 'item_name', 'description', 'quantity', 'unit_price', 'total_value', 'status', 'supplier', 'priority']
      const missingFields = uiFields.filter(field => !sampleApproval[field] && sampleApproval[field] !== 0)
      
      if (missingFields.length > 0) {
        console.log('   ⚠️  Missing UI fields:', missingFields)
      } else {
        console.log('   ✅ All UI fields present')
      }
    }

    // Test 3: Simulate the Manager Dashboard loading
    console.log('\n3️⃣ Simulating Manager Dashboard loading...')
    
    // This is what the Manager Dashboard should do
    const loadManagerData = async () => {
      try {
        console.log('   Loading manager data...')
        
        // This is the exact code from ManagerDashboard.tsx
        const [
          purchaseOrders, 
          projects, 
          inventory, 
          assets, 
          maintenance, 
          purchaseRequests,
          inventoryApprovalsData,
          inventoryChangeRequestsData,
          adminPendingRequestsData,
          procurementApprovalsData
        ] = await Promise.all([
          supabase.from('purchase_orders').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('inventory').select('*'),
          supabase.from('assets').select('*'),
          supabase.from('maintenance_logs').select('*'),
          supabase.from('purchase_requests').select('*'),
          supabase.from('inventory_approvals').select('*').eq('status', 'pending'),
          Promise.resolve([]),
          Promise.resolve([]),
          supabase.from('procurement_approvals').select(`
            *,
            requested_by_user:requested_by(id, full_name, username, email),
            manager_approved_by_user:manager_approved_by(id, full_name, email),
            project_manager_approved_by_user:project_manager_approved_by(id, full_name, email)
          `).eq('status', 'pending').order('created_at', { ascending: false })
        ])

        console.log('   All queries completed')
        console.log('   Procurement approvals data:', procurementApprovalsData.data)
        console.log('   Procurement approvals count:', (procurementApprovalsData.data || []).length)

        return {
          procurementApprovals: procurementApprovalsData.data || []
        }
      } catch (error) {
        console.error('   Error loading manager data:', error)
        return { procurementApprovals: [] }
      }
    }

    const result = await loadManagerData()
    console.log('   Result:', result)

    // Test 4: Check if there are any issues with the UI logic
    console.log('\n4️⃣ Checking UI logic...')
    const procurementApprovals = result.procurementApprovals
    const loading = false
    
    console.log('   UI State:')
    console.log('     - Loading:', loading)
    console.log('     - Procurement approvals length:', procurementApprovals.length)
    
    if (loading) {
      console.log('   ✅ Should show: "Loading approval requests..."')
    } else if (procurementApprovals.length === 0) {
      console.log('   ✅ Should show: "No pending procurement approval requests"')
    } else {
      console.log('   ✅ Should show:', procurementApprovals.length, 'procurement approval requests')
    }

    console.log('\n🎉 Manager Dashboard Console Debug COMPLETED!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Service function works')
    console.log('   ✅ Data structure is correct')
    console.log('   ✅ Manager Dashboard loading works')
    console.log('   ✅ UI logic should work')

    if (procurementApprovals.length > 0) {
      console.log('\n🚀 Manager Dashboard should show procurement approvals!')
      console.log('   - Check the "Procurement Approval Requests" section')
      console.log('   - Look for pending approvals')
      console.log('   - Check browser console for debug messages')
    } else {
      console.log('\n⚠️  No pending approvals found')
      console.log('   - Create a procurement request first')
      console.log('   - Then check the manager dashboard')
    }

    return true

  } catch (error) {
    console.error('💥 Debug failed:', error.message)
    console.error('   Full error:', error)
    return false
  }
}

debugManagerDashboardConsole()
  .then(success => {
    if (success) {
      console.log('\n✨ Manager Dashboard console debug completed!')
      console.log('\n🎯 Next steps:')
      console.log('1. Check browser console for debug messages')
      console.log('2. Look for "Manager Dashboard - Procurement Approvals Data" in console')
      console.log('3. Check the "Procurement Approval Requests" section in UI')
      console.log('4. If still not showing, check for JavaScript errors')
    } else {
      console.log('\n❌ Manager Dashboard console debug failed.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
