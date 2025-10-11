import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING MANAGER DASHBOARD DEBUG...\n')

async function testManagerDashboardDebug() {
  try {
    console.log('1️⃣ Testing Manager Dashboard data loading simulation...')
    
    // Simulate the Manager Dashboard loadDashboardData function
    const currentUser = {
      id: '893ba925-2a4a-4c2f-afe3-1c90c960f467', // Manager ID
      role: 'manager'
    }
    
    console.log('🔍 MANAGER DASHBOARD: loadDashboardData called')
    console.log('🔍 MANAGER DASHBOARD: Loading pending approvals...')
    
    // Test approvalService.getPendingApprovals()
    const { data: approvals, error: approvalsError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (approvalsError) {
      console.log(`❌ Pending approvals failed: ${approvalsError.message}`)
    } else {
      console.log(`✅ Pending approvals loaded: ${approvals?.length || 0}`)
      console.log('🔍 MANAGER DASHBOARD: Pending approvals data:', approvals)
      
      // Map to expected format (like approvalService does)
      const mappedApprovals = (approvals || []).map(req => ({
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
      
      console.log('🔍 MANAGER DASHBOARD: Mapped approvals:', mappedApprovals.length)
      console.log('🔍 MANAGER DASHBOARD: Pending approvals state set')
      
      if (mappedApprovals.length > 0) {
        console.log('   Sample mapped approvals:')
        mappedApprovals.slice(0, 3).forEach((approval, index) => {
          console.log(`   ${index + 1}. ${approval.request_title} - Amount: $${approval.total_amount} - Priority: ${approval.priority}`)
        })
      }
    }
    
    console.log('\n2️⃣ Testing Manager Dashboard component rendering...')
    
    // Simulate the component rendering logic
    const pendingApprovals = approvals || []
    const activeTab = 'approvals' // Default tab
    const loading = false
    
    console.log('🔍 MANAGER DASHBOARD: Component rendering')
    console.log('   Loading:', loading)
    console.log('   Pending approvals length:', pendingApprovals.length)
    console.log('   Active tab:', activeTab)
    console.log('   Pending approvals data:', pendingApprovals)
    
    if (loading && pendingApprovals.length === 0) {
      console.log('🔍 MANAGER DASHBOARD: Showing loading spinner')
    } else if (activeTab === 'approvals') {
      console.log('🔍 MANAGER DASHBOARD: Rendering Purchase Requests tab')
      console.log(`   Table should show ${pendingApprovals.length} rows`)
      
      if (pendingApprovals.length === 0) {
        console.log('   ❌ Table will show: "No pending purchase requests"')
        console.log('   This is the issue! The data is not being loaded properly.')
      } else {
        console.log('   ✅ Table should show data with rows:')
        pendingApprovals.slice(0, 3).forEach((approval, index) => {
          console.log(`      Row ${index + 1}: ${approval.title} - $${approval.total_amount}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing Manager Dashboard tab switching...')
    
    // Test different tabs
    const tabs = ['approvals', 'procurement', 'inventory']
    
    tabs.forEach(tab => {
      console.log(`   Testing ${tab} tab:`)
      
      if (tab === 'approvals') {
        console.log(`     - Purchase Requests: ${pendingApprovals.length} items`)
        console.log(`     - Should show: ${pendingApprovals.length > 0 ? 'Data in table' : 'No pending purchase requests'}`)
      } else if (tab === 'procurement') {
        console.log(`     - Procurement Approvals: Different data source`)
        console.log(`     - Should show: Procurement approvals from procurement_approvals table`)
      } else if (tab === 'inventory') {
        console.log(`     - Inventory Approvals: Different data source`)
        console.log(`     - Should show: Inventory approvals from inventory_approvals table`)
      }
    })
    
    console.log('\n🎯 MANAGER DASHBOARD DEBUG RESULTS:')
    console.log('==================================')
    
    if (approvalsError) {
      console.log('❌ MANAGER DASHBOARD DATA LOADING FAILED!')
      console.log(`   Error: ${approvalsError.message}`)
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Run the SQL script: FIX_PURCHASE_REQUESTS_PERMISSIONS.sql')
      console.log('2. This will fix any permission issues')
      console.log('3. Then test the Manager Dashboard again')
    } else if (pendingApprovals.length === 0) {
      console.log('⚠️  NO PENDING PURCHASE REQUESTS FOUND!')
      console.log('   This means there are no purchase requests with status="pending"')
      console.log('   The Manager Dashboard will correctly show "No pending purchase requests"')
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Create some test purchase requests with status="pending"')
      console.log('2. Check if the purchase_requests table has the right data')
      console.log('3. Verify the status values are correct')
    } else {
      console.log('✅ MANAGER DASHBOARD DATA LOADING WORKS!')
      console.log(`   Found ${pendingApprovals.length} pending purchase requests`)
      console.log('')
      console.log('🔧 THE ISSUE MIGHT BE:')
      console.log('1. Frontend state not updating properly')
      console.log('2. React component not re-rendering')
      console.log('3. Data mapping issue in the component')
      console.log('4. Browser cache issues')
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('2. Check browser console for JavaScript errors')
      console.log('3. Check if the Manager Dashboard component is receiving the data')
      console.log('4. Check if the pendingApprovals state is being set correctly')
      console.log('5. Restart development server: npm run dev')
      console.log('')
      console.log('🎉 THE MANAGER DASHBOARD DATA LOADING IS WORKING!')
    }
    
  } catch (error) {
    console.error('💥 Manager Dashboard debug test failed:', error)
  }
}

testManagerDashboardDebug()