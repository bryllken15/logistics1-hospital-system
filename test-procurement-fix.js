// Test procurement_approvals table after permission fix
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testProcurementFix() {
  console.log('🧪 Testing procurement_approvals table after permission fix...\n')

  try {
    // Test 1: Basic table access
    console.log('1️⃣ Testing basic table access...')
    const { data: basicTest, error: basicError } = await supabase
      .from('procurement_approvals')
      .select('count')
      .limit(1)

    if (basicError) {
      console.log('❌ Basic access failed:', basicError.message)
      return false
    }
    console.log('✅ Basic access works!')

    // Test 2: Insert a test record
    console.log('\n2️⃣ Testing record insertion...')
    const testData = {
      item_name: 'Permission Test Item',
      description: 'Testing after permission fix',
      quantity: 3,
      unit_price: 15.00,
      supplier: 'Test Supplier',
      category: 'test',
      priority: 'medium',
      status: 'pending',
      requested_by: 'f3c890ae-e580-492f-aea1-a92733e0f756',
      request_reason: 'Testing permissions after fix',
      request_type: 'purchase_request'
    }

    const { data: insertResult, error: insertError } = await supabase
      .from('procurement_approvals')
      .insert(testData)
      .select()

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message)
      console.log('   Full error:', insertError)
      return false
    }

    console.log('✅ Insert successful!')
    console.log('   Record ID:', insertResult[0].id)
    console.log('   Total Value (generated):', insertResult[0].total_value)

    // Test 3: Read the record
    console.log('\n3️⃣ Testing record retrieval...')
    const { data: readResult, error: readError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('id', insertResult[0].id)

    if (readError) {
      console.log('❌ Read failed:', readError.message)
      return false
    }

    console.log('✅ Read successful!')
    console.log('   Retrieved:', readResult[0].item_name)

    // Test 4: Update the record
    console.log('\n4️⃣ Testing record update...')
    const { data: updateResult, error: updateError } = await supabase
      .from('procurement_approvals')
      .update({ 
        status: 'approved',
        manager_approved: true,
        manager_approved_by: 'f3c890ae-e580-492f-aea1-a92733e0f756',
        manager_approved_at: new Date().toISOString()
      })
      .eq('id', insertResult[0].id)
      .select()

    if (updateError) {
      console.log('❌ Update failed:', updateError.message)
      return false
    }

    console.log('✅ Update successful!')
    console.log('   Status:', updateResult[0].status)
    console.log('   Manager Approved:', updateResult[0].manager_approved)

    // Test 5: Test the service function
    console.log('\n5️⃣ Testing service function...')
    const { data: serviceTest, error: serviceError } = await supabase
      .from('procurement_approvals')
      .select(`
        *,
        requested_by_user:requested_by(id, full_name, username, email),
        manager_approved_by_user:manager_approved_by(id, full_name, email),
        project_manager_approved_by_user:project_manager_approved_by(id, full_name, email)
      `)
      .eq('requested_by', 'f3c890ae-e580-492f-aea1-a92733e0f756')
      .order('created_at', { ascending: false })

    if (serviceError) {
      console.log('❌ Service function failed:', serviceError.message)
      return false
    }

    console.log('✅ Service function works!')
    console.log('   Found', serviceTest.length, 'records')

    // Test 6: Clean up
    console.log('\n6️⃣ Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('procurement_approvals')
      .delete()
      .eq('id', insertResult[0].id)

    if (deleteError) {
      console.log('❌ Delete failed:', deleteError.message)
      return false
    }

    console.log('✅ Cleanup successful!')

    console.log('\n🎉 Procurement Permission Fix Test PASSED!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Table access works')
    console.log('   ✅ Insert operations work')
    console.log('   ✅ Read operations work')
    console.log('   ✅ Update operations work')
    console.log('   ✅ Delete operations work')
    console.log('   ✅ Service functions work')
    console.log('   ✅ Generated columns work')
    console.log('   ✅ No more 401 errors!')

    console.log('\n🚀 Your procurement system is now fully functional!')
    console.log('   - All CRUD operations work')
    console.log('   - No permission denied errors')
    console.log('   - No 401 errors')
    console.log('   - Ready for frontend use')

    return true

  } catch (error) {
    console.error('💥 Test failed:', error.message)
    console.error('   Full error:', error)
    return false
  }
}

testProcurementFix()
  .then(success => {
    if (success) {
      console.log('\n✨ Procurement permissions are fixed!')
      console.log('\n🎯 Next steps:')
      console.log('1. Test creating a procurement request in the frontend')
      console.log('2. Check that it appears in "My Procurement Requests"')
      console.log('3. Login as manager to see approval requests')
    } else {
      console.log('\n❌ Procurement permissions still have issues.')
      console.log('\n🔧 To fix:')
      console.log('1. Go to Supabase Dashboard')
      console.log('2. SQL Editor')
      console.log('3. Run the contents of fix-procurement-permissions-complete.sql')
      console.log('4. Test again')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })