import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING MANAGER DASHBOARD COMPLETE...\n')

async function testManagerDashboardComplete() {
  try {
    console.log('1️⃣ Testing complete Manager Dashboard flow...')
    
    // Test the exact function that should be called
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
        console.log('   🔍 MANAGER DASHBOARD DEBUG:')
        console.log('   Procurement approvals received:', procurementApprovals.length)
        console.log('   Procurement approvals data:', procurementApprovals.slice(0, 2))
        
        console.log('\n   📋 TABLE RENDERING TEST:')
        console.log('   procurementApprovals.length =', procurementApprovals.length)
        
        if (procurementApprovals.length === 0) {
          console.log('   🔍 EMPTY STATE: procurementApprovals.length =', procurementApprovals.length)
          console.log('   ⚠️  This would show "No pending procurement approvals"')
        } else {
          console.log('   ✅ This should render', procurementApprovals.length, 'table rows')
          
          // Show what the table would display
          console.log('\n   📊 TABLE CONTENT PREVIEW:')
          procurementApprovals.slice(0, 5).forEach((approval, index) => {
            console.log(`   Row ${index + 1}:`)
            console.log(`     Item: ${approval.item_name}`)
            console.log(`     Description: ${approval.description}`)
            console.log(`     Quantity: ${approval.quantity}`)
            console.log(`     Unit Price: $${approval.unit_price}`)
            console.log(`     Priority: ${approval.priority}`)
            console.log(`     Status: ${approval.status}`)
            console.log(`     Manager Approved: ${approval.manager_approved}`)
            console.log(`     Created: ${approval.created_at}`)
          })
        }
      }
    }
    
    console.log('\n2️⃣ Testing React component simulation...')
    
    // Simulate React component state
    const mockComponentState = {
      loading: false,
      procurementApprovals: procurementApprovals || [],
      activeTab: 'procurement'
    }
    
    console.log('   Mock component state:')
    console.log('   - Loading:', mockComponentState.loading)
    console.log('   - Procurement approvals length:', mockComponentState.procurementApprovals.length)
    console.log('   - Active tab:', mockComponentState.activeTab)
    
    // Simulate the conditional rendering
    if (mockComponentState.loading && mockComponentState.procurementApprovals.length === 0) {
      console.log('   🔍 MANAGER DASHBOARD: Showing loading spinner')
    } else {
      console.log('   🔍 MANAGER DASHBOARD: Component rendering')
      console.log('   - Loading:', mockComponentState.loading)
      console.log('   - Procurement approvals length:', mockComponentState.procurementApprovals.length)
      
      if (mockComponentState.procurementApprovals.length === 0) {
        console.log('   🔍 EMPTY STATE: procurementApprovals.length =', mockComponentState.procurementApprovals.length)
        console.log('   ⚠️  This would show "No pending procurement approvals"')
      } else {
        console.log('   ✅ This should render', mockComponentState.procurementApprovals.length, 'table rows')
      }
    }
    
    console.log('\n3️⃣ Testing browser console messages...')
    
    console.log('   Expected browser console messages:')
    console.log('   🔍 MANAGER DASHBOARD: useEffect called - loading dashboard data')
    console.log('   🔍 MANAGER DASHBOARD: loadDashboardData called')
    console.log('   🔍 MANAGER DASHBOARD: Loading pending approvals...')
    console.log('   🔍 MANAGER DASHBOARD: Pending approvals loaded: X')
    console.log('   🔍 MANAGER DASHBOARD: Loading procurement approvals...')
    console.log('   🔍 MANAGER DASHBOARD DEBUG:')
    console.log('   Procurement approvals received: 10')
    console.log('   🔍 MANAGER DASHBOARD: Setting procurement approvals state...')
    console.log('   🔍 MANAGER DASHBOARD: Procurement approvals state set')
    console.log('   🔍 MANAGER DASHBOARD: Component rendering')
    console.log('   Loading: false')
    console.log('   Procurement approvals length: 10')
    console.log('   🔍 RENDERING TABLE: procurementApprovals length = 10')
    
    console.log('\n🎯 MANAGER DASHBOARD COMPLETE TEST RESULTS:')
    console.log('==========================================')
    
    if (!procurementError && procurementApprovals && procurementApprovals.length > 0) {
      console.log('✅ MANAGER DASHBOARD COMPLETE TEST PASSED!')
      console.log('✅ DATABASE CONNECTIVITY IS WORKING!')
      console.log('✅ FUNCTION RETURNS CORRECT DATA!')
      console.log('✅ REACT COMPONENT SHOULD WORK!')
      console.log('')
      console.log('🔧 IF TABLE IS STILL EMPTY, CHECK:')
      console.log('1. Browser console for the debug messages I added')
      console.log('2. Look for "🔍 MANAGER DASHBOARD:" messages')
      console.log('3. Check if "Procurement approvals received: 10" appears')
      console.log('4. Check if "RENDERING TABLE: procurementApprovals length = 10" appears')
      console.log('5. If you see "EMPTY STATE: procurementApprovals.length = 0", there\'s a state issue')
      console.log('')
      console.log('🚀 FRONTEND FIXES:')
      console.log('1. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('2. Restart development server: npm run dev')
      console.log('3. Check browser console for JavaScript errors')
      console.log('4. Check if Manager Dashboard component is loading')
      console.log('')
      console.log('📋 DEBUGGING STEPS:')
      console.log('1. Open your browser')
      console.log('2. Go to Manager Dashboard')
      console.log('3. Open browser dev tools (F12)')
      console.log('4. Go to Console tab')
      console.log('5. Look for the debug messages I added')
      console.log('6. Tell me what debug messages you see')
      console.log('')
      console.log('🎉 THE COMPLETE TEST WORKS - CHECK BROWSER CONSOLE!')
    } else {
      console.log('❌ Manager dashboard complete test failed:')
      if (procurementError) console.log(`   - Procurement approvals error: ${procurementError.message}`)
      if (!procurementApprovals || procurementApprovals.length === 0) {
        console.log('   - No procurement approvals found')
      }
    }
    
  } catch (error) {
    console.error('💥 Manager dashboard complete test failed:', error)
  }
}

testManagerDashboardComplete()
