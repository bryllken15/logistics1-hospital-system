// Test if Manager Dashboard can load procurement approvals
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testManagerDashboardLoading() {
  console.log('🧪 Testing Manager Dashboard Loading...\n')

  try {
    // Test 1: Check if there are any procurement approvals in the database
    console.log('1️⃣ Checking existing procurement approvals...')
    const { data: allApprovals, error: allError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .order('created_at', { ascending: false })

    if (allError) {
      console.log('❌ Failed to fetch approvals:', allError.message)
      return false
    }

    console.log('✅ Found', allApprovals.length, 'total procurement approvals')
    
    if (allApprovals.length > 0) {
      console.log('   Recent approvals:')
      allApprovals.slice(0, 3).forEach((approval, index) => {
        console.log(`   ${index + 1}. ${approval.item_name} - Status: ${approval.status}`)
        console.log(`      Manager approved: ${approval.manager_approved}`)
        console.log(`      Project manager approved: ${approval.project_manager_approved}`)
        console.log(`      Created: ${approval.created_at}`)
      })
    }

    // Test 2: Test the exact query that Manager Dashboard uses
    console.log('\n2️⃣ Testing Manager Dashboard query (getPendingApprovals)...')
    const { data: pendingApprovals, error: pendingError } = await supabase
      .from('procurement_approvals')
      .select(`
        *,
        requested_by_user:requested_by(id, full_name, username, email),
        manager_approved_by_user:manager_approved_by(id, full_name, email),
        project_manager_approved_by_user:project_manager_approved_by(id, full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (pendingError) {
      console.log('❌ Manager Dashboard query failed:', pendingError.message)
      console.log('   Full error:', pendingError)
      return false
    }

    console.log('✅ Manager Dashboard query successful!')
    console.log('   Found', pendingApprovals.length, 'pending approvals for manager')

    if (pendingApprovals.length > 0) {
      console.log('   Pending approvals for manager:')
      pendingApprovals.forEach((approval, index) => {
        console.log(`   ${index + 1}. ${approval.item_name}`)
        console.log(`      Status: ${approval.status}`)
        console.log(`      Requested by: ${approval.requested_by_user?.full_name || 'Unknown'}`)
        console.log(`      Manager approved: ${approval.manager_approved}`)
        console.log(`      Project manager approved: ${approval.project_manager_approved}`)
        console.log(`      Total value: ₱${approval.total_value}`)
      })
    } else {
      console.log('   ⚠️  No pending approvals found for manager')
      console.log('   This means either:')
      console.log('   1. No procurement requests have been created')
      console.log('   2. All requests have been approved/rejected')
      console.log('   3. There\'s an issue with the query')
    }

    // Test 3: Create a test procurement approval if none exist
    if (pendingApprovals.length === 0) {
      console.log('\n3️⃣ Creating a test procurement approval...')
      const testData = {
        item_name: 'Test Manager Dashboard Item',
        description: 'Testing manager dashboard loading',
        quantity: 2,
        unit_price: 100.00,
        supplier: 'Test Supplier',
        category: 'test',
        priority: 'medium',
        status: 'pending',
        requested_by: 'f3c890ae-e580-492f-aea1-a92733e0f756',
        request_reason: 'Testing manager dashboard',
        request_type: 'purchase_request'
      }

      const { data: insertResult, error: insertError } = await supabase
        .from('procurement_approvals')
        .insert(testData)
        .select()

      if (insertError) {
        console.log('❌ Failed to create test approval:', insertError.message)
        return false
      }

      console.log('✅ Test procurement approval created!')
      console.log('   ID:', insertResult[0].id)
      console.log('   Item:', insertResult[0].item_name)
      console.log('   Status:', insertResult[0].status)

      // Test the query again
      console.log('\n4️⃣ Testing Manager Dashboard query again...')
      const { data: newPendingApprovals, error: newPendingError } = await supabase
        .from('procurement_approvals')
        .select(`
          *,
          requested_by_user:requested_by(id, full_name, username, email),
          manager_approved_by_user:manager_approved_by(id, full_name, email),
          project_manager_approved_by_user:project_manager_approved_by(id, full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (newPendingError) {
        console.log('❌ Second query failed:', newPendingError.message)
        return false
      }

      console.log('✅ Second query successful!')
      console.log('   Found', newPendingApprovals.length, 'pending approvals')

      if (newPendingApprovals.length > 0) {
        console.log('   ✅ Manager Dashboard should now show this approval!')
        console.log('   Item:', newPendingApprovals[0].item_name)
        console.log('   Status:', newPendingApprovals[0].status)
      }

      // Clean up test data
      console.log('\n5️⃣ Cleaning up test data...')
      const { error: deleteError } = await supabase
        .from('procurement_approvals')
        .delete()
        .eq('id', insertResult[0].id)

      if (deleteError) {
        console.log('❌ Cleanup failed:', deleteError.message)
      } else {
        console.log('✅ Cleanup successful!')
      }
    }

    console.log('\n🎉 Manager Dashboard Loading Test COMPLETED!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Database connection works')
    console.log('   ✅ Procurement approvals table is accessible')
    console.log('   ✅ Manager Dashboard query works')
    console.log('   ✅ Data can be retrieved correctly')

    if (pendingApprovals.length > 0) {
      console.log('\n🚀 Manager Dashboard should show procurement approvals!')
      console.log('   - Check the "Procurement Approval Requests" section')
      console.log('   - Look for pending approvals')
      console.log('   - Test approve/reject functionality')
    } else {
      console.log('\n⚠️  No pending approvals found')
      console.log('   - Create a procurement request first')
      console.log('   - Then check the manager dashboard')
    }

    return true

  } catch (error) {
    console.error('💥 Test failed:', error.message)
    console.error('   Full error:', error)
    return false
  }
}

testManagerDashboardLoading()
  .then(success => {
    if (success) {
      console.log('\n✨ Manager Dashboard loading test completed!')
    } else {
      console.log('\n❌ Manager Dashboard loading test failed.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
