import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING EXISTING DATABASE CONNECTION...\n')

async function testExistingDatabaseConnection() {
  try {
    console.log('1️⃣ Testing connection to existing tables...')
    
    // Test connection to procurement_approvals table
    const { data: procurementData, error: procurementError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .limit(5)
    
    if (procurementError) {
      console.log(`❌ procurement_approvals connection failed: ${procurementError.message}`)
    } else {
      console.log(`✅ procurement_approvals connection works: ${procurementData?.length || 0} records`)
    }
    
    // Test connection to purchase_requests table
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchase_requests')
      .select('*')
      .limit(5)
    
    if (purchaseError) {
      console.log(`❌ purchase_requests connection failed: ${purchaseError.message}`)
    } else {
      console.log(`✅ purchase_requests connection works: ${purchaseData?.length || 0} records`)
    }
    
    // Test connection to users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.log(`❌ users connection failed: ${usersError.message}`)
    } else {
      console.log(`✅ users connection works: ${usersData?.length || 0} records`)
    }
    
    // Test connection to notifications table
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5)
    
    if (notificationsError) {
      console.log(`❌ notifications connection failed: ${notificationsError.message}`)
    } else {
      console.log(`✅ notifications connection works: ${notificationsData?.length || 0} records`)
    }
    
    console.log('\n2️⃣ Testing table schemas...')
    
    // Check procurement_approvals schema
    if (procurementData && procurementData.length > 0) {
      console.log('   procurement_approvals columns:', Object.keys(procurementData[0]))
    }
    
    // Check purchase_requests schema
    if (purchaseData && purchaseData.length > 0) {
      console.log('   purchase_requests columns:', Object.keys(purchaseData[0]))
    }
    
    // Check users schema
    if (usersData && usersData.length > 0) {
      console.log('   users columns:', Object.keys(usersData[0]))
    }
    
    console.log('\n3️⃣ Testing Employee Dashboard connectivity...')
    
    // Test Employee user requests
    const { data: employeeRequests, error: employeeError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('requested_by', '33333333-3333-3333-3333-333333333333')
      .order('created_at', { ascending: false })
    
    if (employeeError) {
      console.log(`❌ Employee requests failed: ${employeeError.message}`)
    } else {
      console.log(`✅ Employee requests work: ${employeeRequests?.length || 0} found`)
    }
    
    console.log('\n4️⃣ Testing Manager Dashboard connectivity...')
    
    // Test Manager pending approvals
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
    }
    
    console.log('\n5️⃣ Testing Project Manager Dashboard connectivity...')
    
    // Test PM pending approvals
    const { data: pmApprovals, error: pmError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'approved')
      .eq('manager_approved', true)
      .eq('project_manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (pmError) {
      console.log(`❌ PM approvals failed: ${pmError.message}`)
    } else {
      console.log(`✅ PM approvals work: ${pmApprovals?.length || 0} found`)
    }
    
    console.log('\n🎯 DATABASE CONNECTION TEST RESULTS:')
    console.log('====================================')
    
    const connectionErrors = [procurementError, purchaseError, usersError, notificationsError, employeeError, managerError, pmError].filter(Boolean)
    
    if (connectionErrors.length === 0) {
      console.log('✅ ALL DATABASE CONNECTIONS ARE WORKING!')
      console.log('✅ EXISTING TABLES ARE ACCESSIBLE!')
      console.log('✅ FRONTEND CAN CONNECT TO DATABASE!')
      console.log('')
      console.log('🔧 CONNECTIVITY IS FIXED!')
      console.log('========================')
      console.log('Your existing database tables are working perfectly!')
      console.log('The frontend can now connect to:')
      console.log('- procurement_approvals table')
      console.log('- purchase_requests table') 
      console.log('- users table')
      console.log('- notifications table')
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Clear browser cache (Ctrl+Shift+R)')
      console.log('2. Restart dev server: npm run dev')
      console.log('3. Test Employee Dashboard')
      console.log('4. Test Manager Dashboard')
      console.log('5. Test Project Manager Dashboard')
    } else {
      console.log('❌ Some connections failed:')
      connectionErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.message}`)
      })
    }
    
  } catch (error) {
    console.error('💥 Connection test failed:', error)
  }
}

testExistingDatabaseConnection()
