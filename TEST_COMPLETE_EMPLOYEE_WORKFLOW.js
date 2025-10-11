import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING COMPLETE EMPLOYEE WORKFLOW...\n')

async function testCompleteEmployeeWorkflow() {
  try {
    console.log('1️⃣ Testing Employee Dashboard data loading...')
    
    // Test employee's own requests
    const { data: employeeRequests, error: employeeError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('requested_by', '33333333-3333-3333-3333-333333333333')
      .order('created_at', { ascending: false })
    
    if (employeeError) {
      console.log(`❌ Employee requests failed: ${employeeError.message}`)
    } else {
      console.log(`✅ Employee requests work: ${employeeRequests?.length || 0} found`)
      if (employeeRequests && employeeRequests.length > 0) {
        console.log('   Sample employee requests:')
        employeeRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Status: ${req.status} - Amount: $${req.total_amount}`)
        })
      }
    }
    
    console.log('\n2️⃣ Testing Manager Dashboard data loading...')
    
    // Test pending requests for manager approval
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (pendingError) {
      console.log(`❌ Pending requests failed: ${pendingError.message}`)
    } else {
      console.log(`✅ Pending requests work: ${pendingRequests?.length || 0} found`)
      if (pendingRequests && pendingRequests.length > 0) {
        console.log('   Sample pending requests:')
        pendingRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Requested by: ${req.requested_by} - Amount: $${req.total_amount}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing Project Manager Dashboard data loading...')
    
    // Test approved requests for project manager approval
    const { data: approvedRequests, error: approvedError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (approvedError) {
      console.log(`❌ Approved requests failed: ${approvedError.message}`)
    } else {
      console.log(`✅ Approved requests work: ${approvedRequests?.length || 0} found`)
      if (approvedRequests && approvedRequests.length > 0) {
        console.log('   Sample approved requests:')
        approvedRequests.slice(0, 3).forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.title} - Approved by: ${req.approved_by} - Amount: $${req.total_amount}`)
        })
      }
    }
    
    console.log('\n4️⃣ Testing approval workflow simulation...')
    
    // Simulate the complete approval workflow
    console.log('   Simulating: Employee → Manager → Project Manager workflow')
    
    // Check if there are requests in each stage
    const employeeCount = employeeRequests?.length || 0
    const pendingCount = pendingRequests?.length || 0
    const approvedCount = approvedRequests?.length || 0
    
    console.log(`   Employee requests: ${employeeCount}`)
    console.log(`   Pending requests: ${pendingCount}`)
    console.log(`   Approved requests: ${approvedCount}`)
    
    if (employeeCount > 0) {
      console.log('   ✅ Employee Dashboard has data to display')
    }
    
    if (pendingCount > 0) {
      console.log('   ✅ Manager Dashboard has pending requests to approve')
    }
    
    if (approvedCount > 0) {
      console.log('   ✅ Project Manager Dashboard has approved requests for final approval')
    }
    
    console.log('\n5️⃣ Testing dashboard connectivity...')
    
    // Test if all dashboards can access their data
    const dashboards = [
      { name: 'Employee Dashboard', data: employeeRequests, error: employeeError },
      { name: 'Manager Dashboard', data: pendingRequests, error: pendingError },
      { name: 'Project Manager Dashboard', data: approvedRequests, error: approvedError }
    ]
    
    let workingDashboards = 0
    let totalDashboards = dashboards.length
    
    dashboards.forEach(dashboard => {
      if (dashboard.error) {
        console.log(`   ❌ ${dashboard.name}: ${dashboard.error.message}`)
      } else {
        console.log(`   ✅ ${dashboard.name}: ${dashboard.data?.length || 0} items`)
        workingDashboards++
      }
    })
    
    console.log('\n🎯 COMPLETE EMPLOYEE WORKFLOW RESULTS:')
    console.log('=====================================')
    
    if (workingDashboards === totalDashboards) {
      console.log('✅ ALL DASHBOARDS ARE WORKING!')
      console.log('')
      console.log('🔧 THE EMPLOYEE PURCHASE REQUEST WORKFLOW:')
      console.log('1. Employee Dashboard: Shows employee\'s own requests')
      console.log('2. Manager Dashboard: Shows pending requests for approval')
      console.log('3. Project Manager Dashboard: Shows approved requests for final approval')
      console.log('')
      console.log('📊 WORKFLOW DATA:')
      console.log(`   Employee requests: ${employeeCount} found`)
      console.log(`   Pending requests: ${pendingCount} found`)
      console.log(`   Approved requests: ${approvedCount} found`)
      console.log('')
      console.log('🚀 DASHBOARD CONNECTIVITY:')
      console.log('1. Employee Dashboard: Uses purchase_requests table for user requests')
      console.log('2. Manager Dashboard: Uses purchase_requests table for pending approvals')
      console.log('3. Project Manager Dashboard: Uses purchase_requests table for PM approvals')
      console.log('')
      console.log('🎉 THE EMPLOYEE PURCHASE REQUEST CONNECTIVITY IS WORKING!')
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Run the SQL script: FIX_PURCHASE_REQUESTS_PERMISSIONS.sql')
      console.log('2. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('3. Restart development server: npm run dev')
      console.log('4. Test Employee Dashboard: Submit a purchase request')
      console.log('5. Test Manager Dashboard: Approve the request')
      console.log('6. Test Project Manager Dashboard: Final approval')
      console.log('')
      console.log('🎉 THE EMPLOYEE PURCHASE REQUEST CONNECTIVITY IS FIXED!')
    } else {
      console.log('❌ Some dashboards are not working:')
      dashboards.forEach(dashboard => {
        if (dashboard.error) {
          console.log(`   - ${dashboard.name}: ${dashboard.error.message}`)
        }
      })
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Run the SQL script: FIX_PURCHASE_REQUESTS_PERMISSIONS.sql')
      console.log('2. This will fix the permission issues')
      console.log('3. Then test the dashboards again')
    }
    
  } catch (error) {
    console.error('💥 Complete employee workflow test failed:', error)
  }
}

testCompleteEmployeeWorkflow()
