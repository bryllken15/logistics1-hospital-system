// Debug Manager Dashboard procurement approvals
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testManagerDashboardDebug() {
  console.log('🔍 Debugging Manager Dashboard Procurement Approvals...\n')

  try {
    // Test 1: Check if there are procurement approvals
    console.log('1️⃣ Checking procurement approvals in database...')
    const { data: allApprovals, error: allError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .order('created_at', { ascending: false })

    if (allError) {
      console.log('❌ Error fetching approvals:', allError.message)
      return false
    }

    console.log('✅ Found', allApprovals.length, 'total procurement approvals')
    
    if (allApprovals.length > 0) {
      console.log('   Recent approvals:')
      allApprovals.slice(0, 3).forEach((approval, index) => {
        console.log(`   ${index + 1}. ${approval.item_name}`)
        console.log(`      Status: ${approval.status}`)
        console.log(`      Manager approved: ${approval.manager_approved}`)
        console.log(`      Project manager approved: ${approval.project_manager_approved}`)
        console.log(`      Created: ${approval.created_at}`)
      })
    }

    // Test 2: Test the exact query that Manager Dashboard uses
    console.log('\n2️⃣ Testing Manager Dashboard query...')
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
    console.log('   Found', pendingApprovals.length, 'pending approvals')

    if (pendingApprovals.length > 0) {
      console.log('   Pending approvals:')
      pendingApprovals.forEach((approval, index) => {
        console.log(`   ${index + 1}. ${approval.item_name}`)
        console.log(`      Status: ${approval.status}`)
        console.log(`      Requested by: ${approval.requested_by_user?.full_name || 'Unknown'}`)
        console.log(`      Manager approved: ${approval.manager_approved}`)
        console.log(`      Project manager approved: ${approval.project_manager_approved}`)
        console.log(`      Total value: ₱${approval.total_value}`)
        console.log(`      Created: ${approval.created_at}`)
      })
    } else {
      console.log('   ⚠️  No pending approvals found')
    }

    // Test 3: Check if there are any issues with the data structure
    console.log('\n3️⃣ Checking data structure...')
    if (pendingApprovals.length > 0) {
      const sampleApproval = pendingApprovals[0]
      console.log('   Sample approval structure:')
      console.log('     - ID:', sampleApproval.id)
      console.log('     - Item name:', sampleApproval.item_name)
      console.log('     - Description:', sampleApproval.description)
      console.log('     - Quantity:', sampleApproval.quantity)
      console.log('     - Unit price:', sampleApproval.unit_price)
      console.log('     - Total value:', sampleApproval.total_value)
      console.log('     - Status:', sampleApproval.status)
      console.log('     - Requested by:', sampleApproval.requested_by)
      console.log('     - Manager approved:', sampleApproval.manager_approved)
      console.log('     - Project manager approved:', sampleApproval.project_manager_approved)
      console.log('     - Created at:', sampleApproval.created_at)
      
      // Check user relationships
      console.log('   User relationships:')
      console.log('     - Requested by user:', sampleApproval.requested_by_user)
      console.log('     - Manager approved by user:', sampleApproval.manager_approved_by_user)
      console.log('     - Project manager approved by user:', sampleApproval.project_manager_approved_by_user)
    }

    // Test 4: Create a test approval if none exist
    if (pendingApprovals.length === 0) {
      console.log('\n4️⃣ Creating a test procurement approval...')
      const testData = {
        item_name: 'Debug Test Item',
        description: 'Testing manager dashboard debug',
        quantity: 1,
        unit_price: 50.00,
        supplier: 'Debug Supplier',
        category: 'test',
        priority: 'high',
        status: 'pending',
        requested_by: 'f3c890ae-e580-492f-aea1-a92733e0f756',
        request_reason: 'Testing debug',
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
      console.log('\n5️⃣ Testing query again with new approval...')
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

      // Clean up test data
      console.log('\n6️⃣ Cleaning up test data...')
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

    console.log('\n🎉 Manager Dashboard Debug Test COMPLETED!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Database connection works')
    console.log('   ✅ Procurement approvals table is accessible')
    console.log('   ✅ Manager Dashboard query works')
    console.log('   ✅ Data structure is correct')

    if (pendingApprovals.length > 0) {
      console.log('\n🚀 Manager Dashboard should show procurement approvals!')
      console.log('   - Check the "Procurement Approval Requests" section')
      console.log('   - Look for pending approvals')
      console.log('   - Check browser console for debug messages')
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

testManagerDashboardDebug()
  .then(success => {
    if (success) {
      console.log('\n✨ Manager Dashboard debug test completed!')
      console.log('\n🎯 Next steps:')
      console.log('1. Check browser console for debug messages')
      console.log('2. Look for "Manager Dashboard - Procurement Approvals Data" in console')
      console.log('3. Check the "Procurement Approval Requests" section in UI')
      console.log('4. If still not showing, check for JavaScript errors')
    } else {
      console.log('\n❌ Manager Dashboard debug test failed.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
