import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING USERS AND FOREIGN KEYS...\n')

async function testUsersAndForeignKeys() {
  try {
    console.log('1️⃣ Testing if required users exist...')
    
    // Test if the required users exist
    const requiredUsers = [
      '33333333-3333-3333-3333-333333333333', // Employee
      '22222222-2222-2222-2222-222222222222', // Manager
      '11111111-1111-1111-1111-111111111111'  // Project Manager
    ]
    
    for (const userId of requiredUsers) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username, full_name, role')
        .eq('id', userId)
        .single()
      
      if (userError) {
        console.log(`❌ User ${userId} not found: ${userError.message}`)
      } else {
        console.log(`✅ User ${userId} found: ${user.full_name} (${user.role})`)
      }
    }
    
    console.log('\n2️⃣ Testing all users in the system...')
    
    // Get all users to see what's available
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, username, full_name, role')
      .order('created_at', { ascending: false })
    
    if (allUsersError) {
      console.log(`❌ Failed to fetch users: ${allUsersError.message}`)
    } else {
      console.log(`✅ Found ${allUsers?.length || 0} users in the system:`)
      if (allUsers && allUsers.length > 0) {
        allUsers.slice(0, 5).forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.full_name} (${user.username}) - Role: ${user.role} - ID: ${user.id}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing purchase_requests foreign key constraint...')
    
    // Test if we can insert a purchase request with a valid user ID
    const validUserId = allUsers && allUsers.length > 0 ? allUsers[0].id : '33333333-3333-3333-3333-333333333333'
    
    const testRequest = {
      request_number: `REQ-FK-TEST-${Date.now()}`,
      title: 'Foreign Key Test Request',
      description: 'Testing foreign key constraint',
      total_amount: 100,
      priority: 'low',
      required_date: '2024-12-31',
      requested_date: new Date().toISOString().split('T')[0],
      requested_by: validUserId,
      status: 'pending'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('purchase_requests')
      .insert(testRequest)
      .select()
      .single()
    
    if (insertError) {
      console.log(`❌ Foreign key constraint failed: ${insertError.message}`)
    } else {
      console.log(`✅ Foreign key constraint works!`)
      console.log(`   Inserted request ID: ${insertData.id}`)
      console.log(`   Requested by: ${insertData.requested_by}`)
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('purchase_requests')
        .delete()
        .eq('id', insertData.id)
      
      if (deleteError) {
        console.log(`❌ Failed to clean up test data: ${deleteError.message}`)
      } else {
        console.log(`✅ Test data cleaned up successfully`)
      }
    }
    
    console.log('\n4️⃣ Testing with specific user IDs...')
    
    // Test with the specific user IDs we need
    const testUserIds = [
      { id: '33333333-3333-3333-3333-333333333333', role: 'Employee' },
      { id: '22222222-2222-2222-2222-222222222222', role: 'Manager' },
      { id: '11111111-1111-1111-1111-111111111111', role: 'Project Manager' }
    ]
    
    for (const testUser of testUserIds) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username, full_name, role')
        .eq('id', testUser.id)
        .single()
      
      if (userError) {
        console.log(`❌ ${testUser.role} user not found: ${testUser.id}`)
        console.log(`   Error: ${userError.message}`)
      } else {
        console.log(`✅ ${testUser.role} user found: ${user.full_name} (${user.username})`)
      }
    }
    
    console.log('\n🎯 USERS AND FOREIGN KEYS RESULTS:')
    console.log('==================================')
    
    if (allUsers && allUsers.length > 0) {
      console.log('✅ USERS TABLE HAS DATA!')
      console.log(`   Found ${allUsers.length} users in the system`)
      console.log('')
      console.log('🔧 TO FIX THE FOREIGN KEY CONSTRAINT:')
      console.log('1. Use existing user IDs from the users table')
      console.log('2. Or create the required users with the specific IDs')
      console.log('')
      console.log('📋 AVAILABLE USER IDS:')
      allUsers.slice(0, 3).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.id} - ${user.full_name} (${user.role})`)
      })
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Use one of the existing user IDs for testing')
      console.log('2. Or run the SQL script to create the required users')
      console.log('3. Then test the purchase request submission')
    } else {
      console.log('❌ NO USERS FOUND IN THE SYSTEM!')
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Run the SQL script: FIX_PURCHASE_REQUESTS_PERMISSIONS.sql')
      console.log('2. This will create the required users')
      console.log('3. Then test the purchase request submission')
    }
    
  } catch (error) {
    console.error('💥 Users and foreign keys test failed:', error)
  }
}

testUsersAndForeignKeys()
