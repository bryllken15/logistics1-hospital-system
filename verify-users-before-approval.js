// Verify Users Before Running Approval System
// This script checks if the required users exist before running CREATE_APPROVAL_SYSTEM.sql

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'
const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyUsers() {
  console.log('🔍 Verifying users exist before running approval system...\n')
  
  try {
    // Check if users table exists and has data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, role, is_authorized')
      .order('role')

    if (usersError) {
      console.error('❌ Error accessing users table:', usersError.message)
      console.log('\n💡 Solution: Run supabase/clean_migration.sql first to create the users table')
      return false
    }

    if (!users || users.length === 0) {
      console.error('❌ No users found in the database')
      console.log('\n💡 Solution: Run supabase/clean_migration.sql first to create sample users')
      return false
    }

    console.log(`✅ Found ${users.length} users in the database:`)
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.is_authorized ? 'Authorized' : 'Not Authorized'}`)
    })

    // Check for required roles
    const requiredRoles = ['admin', 'manager', 'employee']
    const existingRoles = users.map(u => u.role)
    const missingRoles = requiredRoles.filter(role => !existingRoles.includes(role))

    if (missingRoles.length > 0) {
      console.error(`❌ Missing required roles: ${missingRoles.join(', ')}`)
      console.log('\n💡 Solution: Run supabase/clean_migration.sql to create all required users')
      return false
    }

    console.log('\n✅ All required roles found:')
    requiredRoles.forEach(role => {
      const user = users.find(u => u.role === role)
      console.log(`   - ${role}: ${user.username} (${user.is_authorized ? 'Authorized' : 'Not Authorized'})`)
    })

    // Check for authorized users
    const authorizedUsers = users.filter(u => u.is_authorized)
    if (authorizedUsers.length === 0) {
      console.warn('⚠️  No authorized users found. Some functionality may not work properly.')
    } else {
      console.log(`\n✅ Found ${authorizedUsers.length} authorized users`)
    }

    console.log('\n🎉 Users verification successful! You can now run CREATE_APPROVAL_SYSTEM.sql')
    return true

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    return false
  }
}

// Run verification
verifyUsers().then(success => {
  if (success) {
    console.log('\n📋 Next Steps:')
    console.log('1. Run CREATE_APPROVAL_SYSTEM.sql in Supabase SQL Editor')
    console.log('2. Test the frontend application')
    console.log('3. Use test-dashboard-frontend.html to verify all dashboards work')
  } else {
    console.log('\n📋 Required Actions:')
    console.log('1. Run supabase/clean_migration.sql in Supabase SQL Editor')
    console.log('2. Wait for it to complete successfully')
    console.log('3. Run this verification script again')
    console.log('4. Then run CREATE_APPROVAL_SYSTEM.sql')
  }
}).catch(console.error)
