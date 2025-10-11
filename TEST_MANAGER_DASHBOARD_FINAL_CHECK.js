import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 FINAL CHECK: MANAGER DASHBOARD STATUS...\n')

async function testManagerDashboardFinalCheck() {
  try {
    console.log('1️⃣ Checking current database status...')
    
    // Check current pending approvals
    const { data: currentApprovals, error: currentError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (currentError) {
      console.log(`❌ Current approvals failed: ${currentError.message}`)
    } else {
      console.log(`✅ Current approvals: ${currentApprovals?.length || 0} found`)
      
      if (currentApprovals && currentApprovals.length > 0) {
        console.log('   Current pending approvals:')
        currentApprovals.slice(0, 5).forEach((approval, index) => {
          console.log(`   ${index + 1}. ${approval.item_name} - $${approval.unit_price} - ${approval.priority}`)
        })
      }
    }
    
    console.log('\n2️⃣ Checking if React component should be working...')
    
    // Simulate the exact React component state
    const mockState = {
      loading: false,
      procurementApprovals: currentApprovals || [],
      activeTab: 'procurement'
    }
    
    console.log('   Mock React state:')
    console.log('   - Loading:', mockState.loading)
    console.log('   - Procurement approvals length:', mockState.procurementApprovals.length)
    console.log('   - Active tab:', mockState.activeTab)
    
    if (mockState.procurementApprovals.length > 0) {
      console.log('   ✅ Table should show', mockState.procurementApprovals.length, 'rows')
      console.log('   ✅ Each row should display:')
      mockState.procurementApprovals.slice(0, 3).forEach((approval, index) => {
        console.log(`     Row ${index + 1}: ${approval.item_name} - $${approval.unit_price} - ${approval.priority}`)
      })
    } else {
      console.log('   ❌ Table would show "No pending procurement approvals"')
    }
    
    console.log('\n3️⃣ Expected browser console messages...')
    console.log('   You should see these messages in your browser console:')
    console.log('   🔍 MANAGER DASHBOARD: useEffect called - loading dashboard data')
    console.log('   🔍 MANAGER DASHBOARD: loadDashboardData called')
    console.log('   🔍 MANAGER DASHBOARD: Loading procurement approvals...')
    console.log('   🔍 MANAGER DASHBOARD DEBUG:')
    console.log('   Procurement approvals received:', currentApprovals?.length || 0)
    console.log('   🔍 MANAGER DASHBOARD: Component rendering')
    console.log('   Procurement approvals length:', currentApprovals?.length || 0)
    console.log('   🔍 RENDERING TABLE: procurementApprovals length =', currentApprovals?.length || 0)
    
    console.log('\n🎯 FINAL CHECK RESULTS:')
    console.log('========================')
    
    if (!currentError && currentApprovals && currentApprovals.length > 0) {
      console.log('✅ MANAGER DASHBOARD SHOULD BE WORKING!')
      console.log('✅ DATABASE HAS', currentApprovals.length, 'PENDING APPROVALS!')
      console.log('✅ REACT COMPONENT SHOULD DISPLAY THEM!')
      console.log('')
      console.log('🔧 IF YOU STILL SEE "NO PENDING APPROVALS":')
      console.log('1. Check browser console for the debug messages above')
      console.log('2. Look for "Procurement approvals received: X" message')
      console.log('3. Look for "RENDERING TABLE: procurementApprovals length = X" message')
      console.log('4. If you see these messages with correct numbers, the table should work')
      console.log('5. If you don\'t see these messages, there\'s a React component issue')
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Open browser dev tools (F12)')
      console.log('2. Go to Console tab')
      console.log('3. Look for the debug messages I added')
      console.log('4. Tell me what debug messages you see')
      console.log('5. Check if the table is actually showing data now')
      console.log('')
      console.log('🎉 THE DATA IS DEFINITELY THERE - CHECK BROWSER CONSOLE!')
    } else {
      console.log('❌ Final check failed:')
      if (currentError) console.log(`   - Database error: ${currentError.message}`)
      if (!currentApprovals || currentApprovals.length === 0) {
        console.log('   - No pending approvals found in database')
      }
    }
    
  } catch (error) {
    console.error('💥 Final check failed:', error)
  }
}

testManagerDashboardFinalCheck()
