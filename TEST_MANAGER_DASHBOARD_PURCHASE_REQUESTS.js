import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING MANAGER DASHBOARD PURCHASE REQUESTS...\n')

async function testManagerDashboardPurchaseRequests() {
  try {
    console.log('1️⃣ Testing approvalService.getPendingApprovals() simulation...')
    
    // Simulate exactly what approvalService.getPendingApprovals() does
    const { data, error } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.log(`❌ Purchase requests query failed: ${error.message}`)
    } else {
      console.log(`✅ Purchase requests query works: ${data?.length || 0} found`)
      
      // Map to expected format (exactly like approvalService does)
      const mappedData = (data || []).map(req => ({
        approval_id: req.id,
        request_id: req.id,
        request_title: req.title,
        request_description: req.description,
        total_amount: req.total_amount,
        requested_by_name: req.requested_by_user?.full_name || 'Unknown',
        requested_date: req.requested_date,
        required_date: req.required_date,
        priority: req.priority,
        approval_status: req.status,
        created_at: req.created_at
      }))
      
      console.log(`✅ Mapped data: ${mappedData.length} items`)
      
      if (mappedData.length > 0) {
        console.log('   Sample mapped data:')
        mappedData.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.request_title} - Amount: $${item.total_amount} - Priority: ${item.priority}`)
        })
      }
    }
    
    console.log('\n2️⃣ Testing Manager Dashboard data loading...')
    
    // Simulate the Manager Dashboard loadDashboardData function
    console.log('   Loading pending purchase request approvals...')
    const approvals = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (approvals.error) {
      console.log(`❌ Manager Dashboard data loading failed: ${approvals.error.message}`)
    } else {
      console.log(`✅ Manager Dashboard data loading works: ${approvals.data?.length || 0} found`)
      
      // Map the data exactly like the Manager Dashboard expects
      const pendingApprovals = (approvals.data || []).map(req => ({
        approval_id: req.id,
        request_id: req.id,
        request_title: req.title,
        request_description: req.description,
        total_amount: req.total_amount,
        requested_by_name: req.requested_by_user?.full_name || 'Unknown',
        requested_date: req.requested_date,
        required_date: req.required_date,
        priority: req.priority,
        approval_status: req.status,
        created_at: req.created_at
      }))
      
      console.log(`✅ Pending approvals mapped: ${pendingApprovals.length} items`)
      
      if (pendingApprovals.length > 0) {
        console.log('   Sample pending approvals for Manager Dashboard:')
        pendingApprovals.slice(0, 3).forEach((approval, index) => {
          console.log(`   ${index + 1}. ${approval.request_title} - Amount: $${approval.total_amount} - Priority: ${approval.priority}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing Manager Dashboard table rendering...')
    
    // Simulate the table rendering logic
    const pendingApprovals = (approvals.data || []).map(req => ({
      approval_id: req.id,
      request_id: req.id,
      request_title: req.title,
      request_description: req.description,
      total_amount: req.total_amount,
      requested_by_name: req.requested_by_user?.full_name || 'Unknown',
      requested_date: req.requested_date,
      required_date: req.required_date,
      priority: req.priority,
      approval_status: req.status,
      created_at: req.created_at
    }))
    
    console.log(`   Table should render ${pendingApprovals.length} rows`)
    
    if (pendingApprovals.length === 0) {
      console.log('   ❌ Table will show: "No pending purchase requests"')
      console.log('   This is the issue! The data is not being loaded properly.')
    } else {
      console.log('   ✅ Table should show data with rows:')
      pendingApprovals.slice(0, 3).forEach((approval, index) => {
        console.log(`      Row ${index + 1}: ${approval.request_title} - $${approval.total_amount}`)
      })
    }
    
    console.log('\n🎯 MANAGER DASHBOARD PURCHASE REQUESTS RESULTS:')
    console.log('==============================================')
    
    if (approvals.error) {
      console.log('❌ MANAGER DASHBOARD DATA LOADING FAILED!')
      console.log(`   Error: ${approvals.error.message}`)
      console.log('')
      console.log('🔧 POSSIBLE FIXES:')
      console.log('1. Check if the purchase_requests table exists')
      console.log('2. Check if the user has permission to access the table')
      console.log('3. Check if the status column exists and has the right values')
    } else if (approvals.data && approvals.data.length > 0) {
      console.log('✅ MANAGER DASHBOARD DATA LOADING WORKS!')
      console.log(`   Found ${approvals.data.length} pending purchase requests`)
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
    } else {
      console.log('⚠️  NO PENDING PURCHASE REQUESTS FOUND!')
      console.log('   This means there are no purchase requests with status="pending"')
      console.log('   The Manager Dashboard will correctly show "No pending purchase requests"')
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Create some test purchase requests with status="pending"')
      console.log('2. Check if the purchase_requests table has the right data')
      console.log('3. Verify the status values are correct')
    }
    
  } catch (error) {
    console.error('💥 Manager Dashboard purchase requests test failed:', error)
  }
}

testManagerDashboardPurchaseRequests()
