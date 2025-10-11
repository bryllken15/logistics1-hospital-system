// Test Authentication Fix - Verify login works
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuthentication() {
  console.log('🔐 Testing Authentication Fix...\n')
  
  const testUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'manager', password: 'manager123', role: 'manager' },
    { username: 'employee', password: 'employee123', role: 'employee' },
    { username: 'procurement', password: 'procurement123', role: 'procurement' },
    { username: 'project_manager', password: 'pm123', role: 'project_manager' },
    { username: 'maintenance', password: 'maintenance123', role: 'maintenance' },
    { username: 'document_analyst', password: 'analyst123', role: 'document_analyst' }
  ]

  let successCount = 0
  let totalTests = testUsers.length

  for (const user of testUsers) {
    try {
      console.log(`Testing ${user.username}...`)
      
      const { data, error } = await supabase
        .rpc('authenticate_user', {
          user_username: user.username,
          user_password: user.password
        })

      if (error) {
        console.log(`❌ ${user.username}: ${error.message}`)
      } else if (data && data.length > 0) {
        console.log(`✅ ${user.username}: Login successful (${data[0].role})`)
        successCount++
      } else {
        console.log(`❌ ${user.username}: No data returned`)
      }
    } catch (error) {
      console.log(`❌ ${user.username}: ${error.message}`)
    }
  }

  console.log(`\n📊 Results: ${successCount}/${totalTests} users can login`)
  
  if (successCount === totalTests) {
    console.log('🎉 ALL AUTHENTICATION TESTS PASSED!')
    console.log('\n✅ You can now login to your application with:')
    console.log('   Username: admin, Password: admin123')
    console.log('   Username: manager, Password: manager123')
    console.log('   Username: employee, Password: employee123')
    console.log('   Username: procurement, Password: procurement123')
    console.log('   Username: project_manager, Password: pm123')
    console.log('   Username: maintenance, Password: maintenance123')
    console.log('   Username: document_analyst, Password: analyst123')
  } else {
    console.log('❌ Some authentication tests failed.')
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure you ran FINAL_AUTH_FIX.sql in Supabase SQL Editor')
    console.log('2. Check that the authenticate_user function exists')
    console.log('3. Verify all users were created in the users table')
    console.log('4. Check your Supabase URL and API key are correct')
  }
}

// Run the test
testAuthentication().catch(console.error)