import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  console.log('Please check your .env file has:')
  console.log('VITE_SUPABASE_URL=your_url')
  console.log('VITE_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING ALL DATA FETCHING ISSUES...\n')

async function testAllDataFetching() {
  try {
    // Test 1: Check if tables exist
    console.log('1️⃣ Testing table existence...')
    
    const tables = [
      'users',
      'purchase_requests', 
      'procurement_approvals',
      'inventory_approvals',
      'notifications',
      'projects',
      'inventory'
    ]
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: EXISTS`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`)
      }
    }
    
    console.log('\n2️⃣ Testing user authentication...')
    
    // Test 2: Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, role')
      .limit(5)
    
    if (usersError) {
      console.log(`❌ Users query failed: ${usersError.message}`)
    } else {
      console.log(`✅ Users found: ${users?.length || 0}`)
      console.log('Sample users:', users?.map(u => `${u.username} (${u.role})`))
    }
    
    console.log('\n3️⃣ Testing purchase requests...')
    
    // Test 3: Purchase requests with relationships
    const { data: purchaseRequests, error: prError } = await supabase
      .from('purchase_requests')
      .select(`
        *,
        requested_by_user:users!requested_by(full_name, email)
      `)
      .limit(5)
    
    if (prError) {
      console.log(`❌ Purchase requests failed: ${prError.message}`)
    } else {
      console.log(`✅ Purchase requests found: ${purchaseRequests?.length || 0}`)
    }
    
    console.log('\n4️⃣ Testing procurement approvals...')
    
    // Test 4: Procurement approvals
    const { data: procurementApprovals, error: paError } = await supabase
      .from('procurement_approvals')
      .select(`
        *,
        requested_by_user:requested_by(id, full_name, username, email),
        manager_approved_by_user:manager_approved_by(id, full_name, email),
        project_manager_approved_by_user:project_manager_approved_by(id, full_name, email),
        purchase_request:purchase_request_id(*)
      `)
      .limit(5)
    
    if (paError) {
      console.log(`❌ Procurement approvals failed: ${paError.message}`)
    } else {
      console.log(`✅ Procurement approvals found: ${procurementApprovals?.length || 0}`)
    }
    
    console.log('\n5️⃣ Testing notifications...')
    
    // Test 5: Notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5)
    
    if (notifError) {
      console.log(`❌ Notifications failed: ${notifError.message}`)
    } else {
      console.log(`✅ Notifications found: ${notifications?.length || 0}`)
    }
    
    console.log('\n6️⃣ Testing RPC functions...')
    
    // Test 6: RPC functions
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_pending_approvals', {
      p_user_id: users?.[0]?.id || '00000000-0000-0000-0000-000000000000',
      p_user_role: 'manager'
    })
    
    if (rpcError) {
      console.log(`❌ RPC function failed: ${rpcError.message}`)
    } else {
      console.log(`✅ RPC function works: ${rpcData?.length || 0} pending approvals`)
    }
    
    console.log('\n7️⃣ Testing projects...')
    
    // Test 7: Projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        project_manager:users!project_manager_id(full_name, email),
        created_by_user:users!created_by(full_name, email)
      `)
      .limit(5)
    
    if (projectsError) {
      console.log(`❌ Projects failed: ${projectsError.message}`)
    } else {
      console.log(`✅ Projects found: ${projects?.length || 0}`)
    }
    
    console.log('\n8️⃣ Testing inventory...')
    
    // Test 8: Inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        *,
        created_by_user:users!created_by(full_name, email),
        updated_by_user:users!updated_by(full_name, email)
      `)
      .limit(5)
    
    if (inventoryError) {
      console.log(`❌ Inventory failed: ${inventoryError.message}`)
    } else {
      console.log(`✅ Inventory found: ${inventory?.length || 0}`)
    }
    
    console.log('\n🎯 SUMMARY:')
    console.log('========================================')
    
    if (usersError) console.log('❌ Users table has issues')
    if (prError) console.log('❌ Purchase requests have issues')
    if (paError) console.log('❌ Procurement approvals have issues')
    if (notifError) console.log('❌ Notifications have issues')
    if (rpcError) console.log('❌ RPC functions have issues')
    if (projectsError) console.log('❌ Projects have issues')
    if (inventoryError) console.log('❌ Inventory has issues')
    
    if (!usersError && !prError && !paError && !notifError && !rpcError && !projectsError && !inventoryError) {
      console.log('✅ ALL DATA FETCHING TESTS PASSED!')
      console.log('🎉 Your approval workflow should work now!')
    } else {
      console.log('❌ Some tests failed - see details above')
      console.log('🔧 Run the SIMPLE_APPROVAL_WORKFLOW_FIX.sql script to fix issues')
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error)
  }
}

testAllDataFetching()
