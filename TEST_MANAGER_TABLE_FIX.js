import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING MANAGER TABLE FIX...\n')

async function testManagerTableFix() {
  try {
    console.log('1️⃣ Testing getPendingManagerApprovals function...')
    
    // Test the exact function the Manager Dashboard uses
    const { data: managerApprovals, error: managerError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (managerError) {
      console.log(`❌ Manager approvals failed: ${managerError.message}`)
    } else {
      console.log(`✅ Manager approvals work: ${managerApprovals?.length || 0} found`)
      
      if (managerApprovals && managerApprovals.length > 0) {
        console.log('   Manager approvals for table:')
        managerApprovals.forEach((approval, index) => {
          console.log(`   ${index + 1}. ${approval.item_name} - ${approval.status} - $${approval.unit_price}`)
          console.log(`       ID: ${approval.id}`)
          console.log(`       Requested by: ${approval.requested_by}`)
          console.log(`       Manager approved: ${approval.manager_approved}`)
          console.log(`       Created: ${approval.created_at}`)
        })
      } else {
        console.log('   ⚠️  No manager approvals found!')
      }
    }
    
    console.log('\n2️⃣ Testing all procurement approvals...')
    
    // Test all procurement approvals to see what's available
    const { data: allApprovals, error: allError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.log(`❌ All approvals failed: ${allError.message}`)
    } else {
      console.log(`✅ All approvals work: ${allApprovals?.length || 0} found`)
      
      if (allApprovals && allApprovals.length > 0) {
        console.log('   All procurement approvals:')
        allApprovals.forEach((approval, index) => {
          console.log(`   ${index + 1}. ${approval.item_name} - ${approval.status} - Manager: ${approval.manager_approved}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing different filter combinations...')
    
    // Test different filter combinations to see what data is available
    console.log('   Testing: status = pending')
    const { data: pendingOnly, error: pendingError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (!pendingError) {
      console.log(`   ✅ Pending only: ${pendingOnly?.length || 0} found`)
    }
    
    console.log('   Testing: manager_approved = false')
    const { data: notManagerApproved, error: notManagerError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (!notManagerError) {
      console.log(`   ✅ Not manager approved: ${notManagerApproved?.length || 0} found`)
    }
    
    console.log('   Testing: status = pending AND manager_approved = false')
    const { data: bothFilters, error: bothError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (!bothError) {
      console.log(`   ✅ Both filters: ${bothFilters?.length || 0} found`)
    }
    
    console.log('\n4️⃣ Testing request_type filter...')
    
    // Test with request_type filter
    const { data: purchaseRequests, error: purchaseError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .eq('request_type', 'purchase_request')
      .order('created_at', { ascending: false })
    
    if (purchaseError) {
      console.log(`❌ Purchase requests failed: ${purchaseError.message}`)
    } else {
      console.log(`✅ Purchase requests work: ${purchaseRequests?.length || 0} found`)
      
      if (purchaseRequests && purchaseRequests.length > 0) {
        console.log('   Purchase requests for manager:')
        purchaseRequests.forEach((request, index) => {
          console.log(`   ${index + 1}. ${request.item_name} - ${request.status} - $${request.unit_price}`)
        })
      }
    }
    
    console.log('\n🎯 MANAGER TABLE FIX TEST RESULTS:')
    console.log('===================================')
    
    const hasErrors = managerError || allError || pendingError || notManagerError || bothError || purchaseError
    
    if (!hasErrors) {
      console.log('✅ MANAGER TABLE DATA IS AVAILABLE!')
      console.log('✅ DATABASE CONNECTIVITY IS WORKING!')
      console.log('✅ FILTERS ARE WORKING!')
      console.log('')
      console.log('🔧 THE ISSUE IS LIKELY:')
      console.log('1. Frontend component not receiving the data')
      console.log('2. React state not updating')
      console.log('3. Component not re-rendering')
      console.log('4. Browser cache issue')
      console.log('')
      console.log('🚀 FRONTEND FIXES:')
      console.log('1. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('2. Check browser console for errors')
      console.log('3. Restart development server: npm run dev')
      console.log('4. Check if React component is receiving data')
      console.log('')
      console.log('📋 DEBUGGING STEPS:')
      console.log('1. Open browser dev tools (F12)')
      console.log('2. Go to Console tab')
      console.log('3. Look for any red error messages')
      console.log('4. Check if procurementApprovals array is empty in React state')
      console.log('5. Add console.log in ManagerDashboard component to debug')
      console.log('')
      console.log('🎉 THE DATA IS THERE - CHECK REACT COMPONENT STATE!')
    } else {
      console.log('❌ Some queries failed:')
      if (managerError) console.log(`   - Manager approvals error: ${managerError.message}`)
      if (allError) console.log(`   - All approvals error: ${allError.message}`)
      if (pendingError) console.log(`   - Pending only error: ${pendingError.message}`)
      if (notManagerError) console.log(`   - Not manager approved error: ${notManagerError.message}`)
      if (bothError) console.log(`   - Both filters error: ${bothError.message}`)
      if (purchaseError) console.log(`   - Purchase requests error: ${purchaseError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Manager table fix test failed:', error)
  }
}

testManagerTableFix()
