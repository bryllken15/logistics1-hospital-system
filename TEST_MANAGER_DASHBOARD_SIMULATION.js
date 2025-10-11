import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING MANAGER DASHBOARD SIMULATION...\n')

// Simulate the exact procurementApprovalService.getPendingManagerApprovals function
async function getPendingManagerApprovals() {
  try {
    const { data, error } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching pending manager approvals:', error)
    return []
  }
}

async function testManagerDashboardSimulation() {
  try {
    console.log('1️⃣ Simulating Manager Dashboard loadDashboardData function...')
    
    // Simulate the exact call from Manager Dashboard
    console.log('   Calling procurementApprovalService.getPendingManagerApprovals()...')
    const procurementApprovals = await getPendingManagerApprovals()
    
    console.log('🔍 MANAGER DASHBOARD DEBUG:')
    console.log('   Procurement approvals received:', procurementApprovals?.length || 0)
    console.log('   Procurement approvals data:', procurementApprovals?.slice(0, 2) || 'No data')
    
    // Simulate React state setting
    console.log('\n2️⃣ Simulating React state update...')
    console.log('   setProcurementApprovals(procurementApprovals)')
    console.log('   State should now contain:', procurementApprovals?.length || 0, 'items')
    
    // Simulate table rendering
    console.log('\n3️⃣ Simulating table rendering...')
    console.log('🔍 RENDERING TABLE: procurementApprovals length =', procurementApprovals?.length || 0)
    
    if (procurementApprovals && procurementApprovals.length > 0) {
      console.log('   ✅ Table should render', procurementApprovals.length, 'rows')
      console.log('   ✅ Each row should show:')
      procurementApprovals.slice(0, 3).forEach((approval, index) => {
        console.log(`     Row ${index + 1}: ${approval.item_name} - $${approval.unit_price}`)
      })
    } else {
      console.log('   ❌ Table would show "No pending procurement approvals"')
      console.log('🔍 EMPTY STATE: procurementApprovals.length =', procurementApprovals?.length || 0)
    }
    
    console.log('\n4️⃣ Testing different scenarios...')
    
    // Test if there's a timing issue
    console.log('   Testing immediate call...')
    const immediateResult = await getPendingManagerApprovals()
    console.log('   Immediate result:', immediateResult?.length || 0)
    
    // Test if there's a caching issue
    console.log('   Testing second call...')
    const secondResult = await getPendingManagerApprovals()
    console.log('   Second result:', secondResult?.length || 0)
    
    console.log('\n🎯 MANAGER DASHBOARD SIMULATION RESULTS:')
    console.log('=========================================')
    
    if (procurementApprovals && procurementApprovals.length > 0) {
      console.log('✅ MANAGER DASHBOARD SIMULATION WORKS!')
      console.log('✅ FUNCTION RETURNS DATA!')
      console.log('✅ REACT STATE SHOULD UPDATE!')
      console.log('✅ TABLE SHOULD RENDER!')
      console.log('')
      console.log('🔧 IF TABLE IS STILL EMPTY, THE ISSUE IS:')
      console.log('1. React component not calling loadDashboardData()')
      console.log('2. React component not re-rendering after state update')
      console.log('3. Browser cache preventing updates')
      console.log('4. JavaScript error preventing execution')
      console.log('')
      console.log('🚀 FRONTEND FIXES:')
      console.log('1. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('2. Restart development server: npm run dev')
      console.log('3. Check browser console for JavaScript errors')
      console.log('4. Check if Manager Dashboard component is loading')
      console.log('')
      console.log('📋 DEBUGGING STEPS:')
      console.log('1. Open browser dev tools (F12)')
      console.log('2. Go to Console tab')
      console.log('3. Look for "🔍 MANAGER DASHBOARD DEBUG:" messages')
      console.log('4. If you see the debug messages, the function is working')
      console.log('5. If you don\'t see debug messages, the component isn\'t loading')
      console.log('')
      console.log('🎉 THE SIMULATION WORKS - CHECK BROWSER CONSOLE!')
    } else {
      console.log('❌ Manager dashboard simulation failed:')
      console.log('   - No data returned from function')
      console.log('   - Check database connection')
    }
    
  } catch (error) {
    console.error('💥 Manager dashboard simulation failed:', error)
  }
}

testManagerDashboardSimulation()
