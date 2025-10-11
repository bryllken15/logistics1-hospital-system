// Check the real user accounts in the database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRealUsers() {
  console.log('🔍 Checking Real User Accounts...\n')

  try {
    // Get all users from the database
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, full_name, role, is_authorized')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching users:', error.message)
      return
    }

    console.log(`✅ Found ${users.length} users in database:`)
    console.log('')

    users.forEach((user, i) => {
      console.log(`${i + 1}. Username: ${user.username}`)
      console.log(`   Full Name: ${user.full_name}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Authorized: ${user.is_authorized ? 'Yes' : 'No'}`)
      console.log(`   ID: ${user.id}`)
      console.log('')
    })

    // Test the manager login you mentioned
    console.log('🧪 Testing manager login with password "manager123"...')
    
    try {
      const { data: authResult, error: authError } = await supabase
        .rpc('authenticate_user', {
          user_username: 'manager',
          user_password: 'manager123'
        })
        .single()

      if (authError) {
        console.log('❌ Manager login failed:', authError.message)
      } else {
        console.log('✅ Manager login successful!')
        console.log('   User:', authResult)
      }
    } catch (error) {
      console.log('❌ Manager login error:', error.message)
    }

    // Test employee login
    console.log('\n🧪 Testing employee login...')
    
    try {
      const { data: empResult, error: empError } = await supabase
        .rpc('authenticate_user', {
          user_username: 'employee',
          user_password: 'employee123'
        })
        .single()

      if (empError) {
        console.log('❌ Employee login failed:', empError.message)
      } else {
        console.log('✅ Employee login successful!')
        console.log('   User:', empResult)
      }
    } catch (error) {
      console.log('❌ Employee login error:', error.message)
    }

    console.log('\n📋 Summary:')
    console.log('Use these credentials to login:')
    users.forEach(user => {
      if (user.is_authorized) {
        console.log(`- Username: ${user.username} | Role: ${user.role}`)
      }
    })

  } catch (error) {
    console.error('💥 Script error:', error.message)
  }
}

checkRealUsers()
  .then(() => {
    console.log('\n✨ User check complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
