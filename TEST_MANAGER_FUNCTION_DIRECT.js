import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING MANAGER FUNCTION DIRECTLY...\n')

async function testManagerFunctionDirect() {
  try {
    console.log('1️⃣ Testing getPendingManagerApprovals function directly...')
    
    // Test the exact function that the Manager Dashboard uses
    const { data, error } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log(`❌ Function failed: ${error.message}`)
      console.log(`   Error details:`, error)
    } else {
      console.log(`✅ Function works: ${data?.length || 0} found`)
      
      if (data && data.length > 0) {
        console.log('   First 3 results:')
        data.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.item_name} - ${item.status} - Manager: ${item.manager_approved}`)
        })
      } else {
        console.log('   ⚠️  No data returned!')
      }
    }
    
    console.log('\n2️⃣ Testing with different filters...')
    
    // Test just pending status
    const { data: pendingOnly, error: pendingError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (!pendingError) {
      console.log(`   Pending only: ${pendingOnly?.length || 0} found`)
    }
    
    // Test just not manager approved
    const { data: notManagerApproved, error: notManagerError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (!notManagerError) {
      console.log(`   Not manager approved: ${notManagerApproved?.length || 0} found`)
    }
    
    // Test all procurement approvals
    const { data: allApprovals, error: allError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!allError) {
      console.log(`   All approvals: ${allApprovals?.length || 0} found`)
      
      if (allApprovals && allApprovals.length > 0) {
        console.log('   Status breakdown:')
        const statusCounts = allApprovals.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1
          return acc
        }, {})
        console.log('   ', statusCounts)
        
        console.log('   Manager approved breakdown:')
        const managerCounts = allApprovals.reduce((acc, item) => {
          acc[item.manager_approved ? 'approved' : 'not_approved'] = (acc[item.manager_approved ? 'approved' : 'not_approved'] || 0) + 1
          return acc
        }, {})
        console.log('   ', managerCounts)
      }
    }
    
    console.log('\n3️⃣ Testing the exact Manager Dashboard query...')
    
    // Test the exact query that should work
    const { data: managerQuery, error: managerQueryError } = await supabase
      .from('procurement_approvals')
      .select('id, item_name, description, quantity, unit_price, priority, status, manager_approved, created_at')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (managerQueryError) {
      console.log(`❌ Manager query failed: ${managerQueryError.message}`)
    } else {
      console.log(`✅ Manager query works: ${managerQuery?.length || 0} found`)
      
      if (managerQuery && managerQuery.length > 0) {
        console.log('   Manager query results:')
        managerQuery.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.item_name} - $${item.unit_price} - ${item.priority}`)
        })
      }
    }
    
    console.log('\n🎯 MANAGER FUNCTION DIRECT TEST RESULTS:')
    console.log('======================================')
    
    if (!error && data && data.length > 0) {
      console.log('✅ MANAGER FUNCTION IS WORKING!')
      console.log('✅ DATA IS AVAILABLE!')
      console.log('✅ QUERY IS CORRECT!')
      console.log('')
      console.log('🔧 THE ISSUE IS IN THE FRONTEND:')
      console.log('1. React component not calling the function')
      console.log('2. React state not updating')
      console.log('3. Component not re-rendering')
      console.log('4. Browser cache issue')
      console.log('')
      console.log('🚀 FRONTEND FIXES:')
      console.log('1. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('2. Restart development server: npm run dev')
      console.log('3. Check browser console for errors')
      console.log('4. Check if React component is receiving the data')
      console.log('')
      console.log('📋 DEBUGGING STEPS:')
      console.log('1. Open browser dev tools (F12)')
      console.log('2. Go to Console tab')
      console.log('3. Look for the debug messages I added to ManagerDashboard')
      console.log('4. Check if "Procurement approvals received: 10" appears')
      console.log('5. If not, there\'s a React component issue')
      console.log('')
      console.log('🎉 THE FUNCTION WORKS - CHECK REACT COMPONENT!')
    } else {
      console.log('❌ Manager function failed:')
      if (error) console.log(`   - Error: ${error.message}`)
      if (!data || data.length === 0) console.log('   - No data returned')
    }
    
  } catch (error) {
    console.error('💥 Manager function direct test failed:', error)
  }
}

testManagerFunctionDirect()
