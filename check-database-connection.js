// Quick script to check database connection and see what users exist
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Checking database connection and users...\n')

  try {
    // Check if we can connect
    console.log('1️⃣ Testing database connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message)
      return false
    }
    console.log('✅ Database connection successful!')

    // Check what users exist
    console.log('\n2️⃣ Checking existing users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, full_name, role')
      .limit(10)

    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError.message)
      return false
    }

    if (users && users.length > 0) {
      console.log('✅ Found users:')
      users.forEach(user => {
        console.log(`   - ID: ${user.id}`)
        console.log(`     Username: ${user.username}`)
        console.log(`     Name: ${user.full_name}`)
        console.log(`     Role: ${user.role}`)
        console.log('')
      })
    } else {
      console.log('⚠️  No users found in database')
    }

    // Check inventory table structure
    console.log('3️⃣ Checking inventory table structure...')
    const { data: inventoryTest, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .limit(1)

    if (inventoryError) {
      console.log('❌ Inventory table error:', inventoryError.message)
      console.log('   This might mean the migration needs to be applied')
    } else {
      console.log('✅ Inventory table accessible')
    }

    // Check delivery_receipts table structure
    console.log('\n4️⃣ Checking delivery_receipts table structure...')
    const { data: deliveryTest, error: deliveryError } = await supabase
      .from('delivery_receipts')
      .select('*')
      .limit(1)

    if (deliveryError) {
      console.log('❌ Delivery receipts table error:', deliveryError.message)
      console.log('   This might mean the migration needs to be applied')
    } else {
      console.log('✅ Delivery receipts table accessible')
    }

    return true

  } catch (error) {
    console.error('💥 Database check failed:', error.message)
    return false
  }
}

checkDatabase()
  .then(success => {
    if (success) {
      console.log('\n✨ Database check completed!')
    } else {
      console.log('\n❌ Database check failed.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
