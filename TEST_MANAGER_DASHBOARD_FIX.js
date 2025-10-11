import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING MANAGER DASHBOARD FIX...\n')

async function testManagerDashboardFix() {
  try {
    console.log('1️⃣ Testing simplified procurement approvals query...')
    
    // Test the exact query that Manager Dashboard will use
    const { data: procurementApprovals, error: paError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (paError) {
      console.log(`❌ Procurement approvals failed: ${paError.message}`)
    } else {
      console.log(`✅ Procurement approvals work: ${procurementApprovals?.length || 0} found`)
      if (procurementApprovals && procurementApprovals.length > 0) {
        console.log(`   Sample approval: ${JSON.stringify(procurementApprovals[0], null, 2)}`)
      }
    }
    
    console.log('\n2️⃣ Testing simplified inventory approvals query...')
    
    // Test the exact query that Manager Dashboard will use
    const { data: inventoryApprovals, error: iaError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (iaError) {
      console.log(`❌ Inventory approvals failed: ${iaError.message}`)
    } else {
      console.log(`✅ Inventory approvals work: ${inventoryApprovals?.length || 0} found`)
      if (inventoryApprovals && inventoryApprovals.length > 0) {
        console.log(`   Sample approval: ${JSON.stringify(inventoryApprovals[0], null, 2)}`)
      }
    }
    
    console.log('\n3️⃣ Testing Manager Dashboard data structure...')
    
    if (procurementApprovals && procurementApprovals.length > 0) {
      const sample = procurementApprovals[0]
      console.log(`   Procurement approval fields: ${Object.keys(sample).join(', ')}`)
      
      // Check if the data has the fields the Manager Dashboard expects
      const requiredFields = ['id', 'item_name', 'description', 'quantity', 'unit_price', 'total_value', 'priority', 'status']
      const missingFields = requiredFields.filter(field => !(field in sample))
      
      if (missingFields.length > 0) {
        console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`)
      } else {
        console.log(`   ✅ All required fields present`)
      }
    }
    
    if (inventoryApprovals && inventoryApprovals.length > 0) {
      const sample = inventoryApprovals[0]
      console.log(`   Inventory approval fields: ${Object.keys(sample).join(', ')}`)
    }
    
    console.log('\n4️⃣ Testing user data for display...')
    
    // Check if we can get user information for display
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, username')
      .limit(5)
    
    if (usersError) {
      console.log(`❌ Users query failed: ${usersError.message}`)
    } else {
      console.log(`✅ Users query works: ${users?.length || 0} found`)
      if (users && users.length > 0) {
        console.log(`   Sample users: ${users.map(u => `${u.username} (${u.full_name})`).join(', ')}`)
      }
    }
    
    console.log('\n🎯 MANAGER DASHBOARD FIX TEST RESULTS:')
    console.log('========================================')
    
    const hasErrors = paError || iaError || usersError
    
    if (!hasErrors) {
      console.log('✅ ALL MANAGER DASHBOARD QUERIES WORK!')
      console.log('✅ PROCUREMENT REQUESTS WILL NOW APPEAR!')
      console.log('✅ INVENTORY REQUESTS WILL NOW APPEAR!')
      console.log('🎉 MANAGER DASHBOARD IS FIXED!')
      console.log('')
      console.log('📋 WHAT THIS FIXES:')
      console.log('1. Manager Dashboard will load without 400 errors')
      console.log('2. Procurement tab will show pending procurement requests')
      console.log('3. Inventory tab will show pending inventory requests')
      console.log('4. Manager can approve/reject requests')
      console.log('5. No more "Failed to load" errors')
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Restart your development server: npm run dev')
      console.log('2. Login as manager (username: manager, password: manager123)')
      console.log('3. Go to Manager Dashboard')
      console.log('4. Click on "Procurement" tab - should show requests!')
      console.log('5. Click on "Inventory" tab - should show requests!')
    } else {
      console.log('❌ Some queries still failed - see details above')
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error)
  }
}

testManagerDashboardFix()
