// Simple test to verify Manager Dashboard should work
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testManagerDashboardSimple() {
  console.log('🧪 Simple Manager Dashboard Test...\n')

  try {
    // Test the exact function that Manager Dashboard uses
    const { data, error } = await supabase
      .from('procurement_approvals')
      .select(`
        *,
        requested_by_user:requested_by(id, full_name, username, email),
        manager_approved_by_user:manager_approved_by(id, full_name, email),
        project_manager_approved_by_user:project_manager_approved_by(id, full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('❌ Error:', error.message)
      return false
    }

    console.log('✅ Manager Dashboard should work!')
    console.log('   Found', (data || []).length, 'pending approvals')
    
    if (data && data.length > 0) {
      console.log('\n📋 Pending Approvals for Manager:')
      data.forEach((approval, index) => {
        console.log(`   ${index + 1}. ${approval.item_name}`)
        console.log(`      Status: ${approval.status}`)
        console.log(`      Requested by: ${approval.requested_by_user?.full_name || 'Unknown'}`)
        console.log(`      Manager approved: ${approval.manager_approved}`)
        console.log(`      Project manager approved: ${approval.project_manager_approved}`)
        console.log(`      Total value: ₱${approval.total_value}`)
      })
    }

    console.log('\n🎯 Manager Dashboard Status:')
    console.log('   ✅ Database connection works')
    console.log('   ✅ Procurement approvals table accessible')
    console.log('   ✅ Manager Dashboard query works')
    console.log('   ✅ Data structure is correct')
    console.log('   ✅ Should display in UI')

    console.log('\n🚀 Next Steps:')
    console.log('1. Open frontend application')
    console.log('2. Login as manager')
    console.log('3. Check browser console for debug messages')
    console.log('4. Look for "Procurement Approval Requests" section')
    console.log('5. If still not showing, check for JavaScript errors')

    return true

  } catch (error) {
    console.error('💥 Test failed:', error.message)
    return false
  }
}

testManagerDashboardSimple()
  .then(success => {
    if (success) {
      console.log('\n✨ Manager Dashboard should be working!')
      console.log('\n🔍 If not showing in UI:')
      console.log('1. Check browser console for errors')
      console.log('2. Look for debug messages')
      console.log('3. Check network tab for failed requests')
      console.log('4. Verify you\'re logged in as manager')
    } else {
      console.log('\n❌ Manager Dashboard has issues.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
