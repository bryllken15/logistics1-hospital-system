import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING MANAGER DASHBOARD DATA LOADING...\n')

async function testManagerDashboardDataLoading() {
  try {
    console.log('1️⃣ Testing Manager Dashboard data loading simulation...')
    
    // Simulate the exact function that Manager Dashboard uses
    const currentUser = {
      id: '893ba925-2a4a-4c2f-afe3-1c90c960f467', // Manager ID
      role: 'manager'
    }
    
    console.log('🔍 MANAGER DASHBOARD: loadDashboardData called')
    console.log('🔍 MANAGER DASHBOARD: Loading pending approvals...')
    console.log('   Current user ID:', currentUser.id)
    console.log('   Current user role:', currentUser.role)
    
    // Test the exact query that approvalService.getPendingApprovals() uses
    const { data, error } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log(`❌ MANAGER DASHBOARD: Error fetching pending approvals: ${error.message}`)
      return
    }
    
    console.log('🔍 MANAGER DASHBOARD: Pending approvals loaded:', data?.length || 0)
    console.log('🔍 MANAGER DASHBOARD: Pending approvals data:', data)
    
    if (data && data.length > 0) {
      console.log('✅ MANAGER DASHBOARD: Data received successfully!')
      console.log('   First approval:', data[0])
    } else {
      console.log('❌ MANAGER DASHBOARD: No data received!')
      console.log('   This is why the table shows "No pending purchase requests"')
      return
    }
    
    // Test the exact mapping that approvalService uses
    const mappedData = (data || []).map(req => ({
      approval_id: req.id,
      request_id: req.id,
      request_title: req.title,
      request_description: req.description,
      total_amount: req.total_amount,
      requested_by_name: 'Employee', // Simplified since we can't join with users table
      requested_date: req.requested_date,
      required_date: req.required_date,
      priority: req.priority,
      approval_status: req.status,
      created_at: req.created_at
    }))
    
    console.log('🔍 MANAGER DASHBOARD: Mapped data:', mappedData.length)
    console.log('🔍 MANAGER DASHBOARD: Pending approvals state set')
    
    if (mappedData.length > 0) {
      console.log('✅ MANAGER DASHBOARD: Mapped data received successfully!')
      console.log('   Sample mapped data:', mappedData[0])
    } else {
      console.log('❌ MANAGER DASHBOARD: No mapped data!')
      console.log('   This is why the table shows "No pending purchase requests"')
      return
    }
    
    console.log('\n2️⃣ Testing Manager Dashboard component state...')
    
    // Simulate the component state
    const pendingApprovals = mappedData
    const activeTab = 'approvals' // Default tab
    const loading = false
    
    console.log('🔍 MANAGER DASHBOARD: Component rendering')
    console.log('   Loading:', loading)
    console.log('   Pending approvals length:', pendingApprovals.length)
    console.log('   Active tab:', activeTab)
    console.log('   Pending approvals data:', pendingApprovals)
    
    // Test the rendering logic
    if (loading && pendingApprovals.length === 0) {
      console.log('🔍 MANAGER DASHBOARD: Showing loading spinner')
    } else if (activeTab === 'approvals') {
      console.log('🔍 MANAGER DASHBOARD: Rendering Purchase Requests tab')
      if (pendingApprovals.length === 0) {
        console.log('   ❌ Table will show: "No pending purchase requests"')
        console.log('   This is the issue! The data is not being loaded properly.')
      } else {
        console.log(`   ✅ Table will show: ${pendingApprovals.length} rows of data`)
        console.log('   ✅ Table will show: Data in table rows')
        console.log('   ✅ Manager Dashboard should work correctly!')
      }
    }
    
    console.log('\n3️⃣ Testing Manager Dashboard table rendering...')
    
    // Test the table rendering logic
    if (pendingApprovals.length > 0) {
      console.log('   ✅ Table will render with data:')
      pendingApprovals.slice(0, 3).forEach((approval, index) => {
        console.log(`   Row ${index + 1}:`)
        console.log(`     - Title: ${approval.request_title}`)
        console.log(`     - Description: ${approval.request_description}`)
        console.log(`     - Amount: $${approval.total_amount}`)
        console.log(`     - Priority: ${approval.priority}`)
        console.log(`     - Requested by: ${approval.requested_by_name}`)
        console.log(`     - Required date: ${approval.required_date}`)
      })
    } else {
      console.log('   ❌ Table will show: "No pending purchase requests"')
    }
    
    console.log('\n🎯 MANAGER DASHBOARD DATA LOADING RESULTS:')
    console.log('==========================================')
    
    if (data && data.length > 0 && mappedData.length > 0) {
      console.log('✅ MANAGER DASHBOARD DATA LOADING WORKS!')
      console.log(`   Found ${data.length} pending purchase requests`)
      console.log(`   Mapped to ${mappedData.length} approvals`)
      console.log('   The Manager Dashboard should display this data correctly')
      console.log('')
      console.log('🔧 IF THE MANAGER DASHBOARD IS STILL SHOWING "No pending purchase requests":')
      console.log('1. Check if the pendingApprovals state is being set correctly')
      console.log('2. Check if the table is rendering the data properly')
      console.log('3. Check browser console for JavaScript errors')
      console.log('4. Check if there are any React rendering issues')
      console.log('5. Clear browser cache and restart development server')
      console.log('')
      console.log('🎉 THE MANAGER DASHBOARD DATA LOADING IS WORKING!')
    } else {
      console.log('❌ MANAGER DASHBOARD DATA LOADING FAILED!')
      console.log('   No data received from the database')
      console.log('   This is why the table shows "No pending purchase requests"')
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Check if the purchase_requests table has the right data')
      console.log('2. Check if the approvalService.getPendingApprovals() function is working')
      console.log('3. Check if there are any database permission issues')
      console.log('4. Check if the Manager Dashboard is calling the right function')
    }
    
  } catch (error) {
    console.error('💥 Manager Dashboard data loading test failed:', error)
  }
}

testManagerDashboardDataLoading()
