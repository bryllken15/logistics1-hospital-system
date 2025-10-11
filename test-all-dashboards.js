// Comprehensive Dashboard Testing Script
// This script tests all role-based dashboards and real-time functionality

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'
const supabase = createClient(supabaseUrl, supabaseKey)

// Test users for different roles
const testUsers = {
  admin: {
    id: '11111111-1111-1111-1111-111111111111',
    username: 'admin',
    role: 'admin'
  },
  manager: {
    id: '22222222-2222-2222-2222-222222222222', 
    username: 'manager',
    role: 'manager'
  },
  employee: {
    id: '33333333-3333-3333-3333-333333333333',
    username: 'employee', 
    role: 'employee'
  },
  procurement: {
    id: '44444444-4444-4444-4444-444444444444',
    username: 'procurement',
    role: 'procurement'
  },
  project_manager: {
    id: '55555555-5555-5555-5555-555555555555',
    username: 'project_manager',
    role: 'project_manager'
  },
  maintenance: {
    id: '66666666-6666-6666-6666-666666666666',
    username: 'maintenance',
    role: 'maintenance'
  },
  document_analyst: {
    id: '77777777-7777-7777-7777-777777777777',
    username: 'document_analyst',
    role: 'document_analyst'
  }
}

// Test functions
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) throw error
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

async function testNotificationsTable() {
  console.log('🔍 Testing notifications table...')
  try {
    const { data, error } = await supabase.from('notifications').select('*').limit(1)
    if (error) throw error
    console.log('✅ Notifications table accessible')
    return true
  } catch (error) {
    console.error('❌ Notifications table error:', error.message)
    return false
  }
}

async function testApprovalSystem() {
  console.log('🔍 Testing approval system tables...')
  try {
    const tables = [
      'purchase_request_approvals',
      'inventory_change_approvals', 
      'approval_workflows',
      'purchase_requests'
    ]
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) throw error
      console.log(`✅ ${table} table accessible`)
    }
    return true
  } catch (error) {
    console.error('❌ Approval system error:', error.message)
    return false
  }
}

async function testUserNotifications(userId, role) {
  console.log(`🔍 Testing notifications for ${role}...`)
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    
    console.log(`✅ ${role} notifications loaded: ${data?.length || 0} items`)
    
    // Test that notifications is an array and can be filtered
    if (Array.isArray(data)) {
      const unreadCount = data.filter(n => !n.is_read).length
      console.log(`✅ Notifications filtering works: ${unreadCount} unread`)
    } else {
      console.log('❌ Notifications is not an array')
      return false
    }
    
    return true
  } catch (error) {
    console.error(`❌ ${role} notifications error:`, error.message)
    return false
  }
}

async function testRealTimeSubscriptions() {
  console.log('🔍 Testing real-time subscriptions...')
  
  return new Promise((resolve) => {
    const channel = supabase
      .channel('test_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('✅ Real-time notification received:', payload.new)
          channel.unsubscribe()
          resolve(true)
        }
      )
      .subscribe()

    // Create a test notification
    setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: testUsers.admin.id,
            title: 'Test Real-time Notification',
            message: 'Testing real-time functionality',
            type: 'test'
          })
        
        if (error) throw error
      } catch (error) {
        console.error('❌ Failed to create test notification:', error.message)
        channel.unsubscribe()
        resolve(false)
      }
    }, 1000)

    // Timeout after 5 seconds
    setTimeout(() => {
      console.log('❌ Real-time test timeout')
      channel.unsubscribe()
      resolve(false)
    }, 5000)
  })
}

async function testRoleBasedDashboards() {
  console.log('🔍 Testing role-based dashboard data access...')
  
  const dashboardTests = [
    {
      role: 'admin',
      tests: [
        () => supabase.from('users').select('*').limit(5),
        () => supabase.from('system_logs').select('*').limit(5)
      ]
    },
    {
      role: 'manager', 
      tests: [
        () => supabase.from('purchase_request_approvals').select('*').limit(5),
        () => supabase.from('notifications').select('*').eq('user_id', testUsers.manager.id).limit(5)
      ]
    },
    {
      role: 'employee',
      tests: [
        () => supabase.from('purchase_requests').select('*').eq('requested_by', testUsers.employee.id).limit(5),
        () => supabase.from('notifications').select('*').eq('user_id', testUsers.employee.id).limit(5)
      ]
    },
    {
      role: 'procurement',
      tests: [
        () => supabase.from('purchase_orders').select('*').limit(5),
        () => supabase.from('suppliers').select('*').limit(5)
      ]
    },
    {
      role: 'project_manager',
      tests: [
        () => supabase.from('projects').select('*').limit(5),
        () => supabase.from('staff_assignments').select('*').limit(5)
      ]
    },
    {
      role: 'maintenance',
      tests: [
        () => supabase.from('assets').select('*').limit(5),
        () => supabase.from('maintenance_logs').select('*').limit(5)
      ]
    },
    {
      role: 'document_analyst',
      tests: [
        () => supabase.from('documents').select('*').limit(5),
        () => supabase.from('delivery_receipts').select('*').limit(5)
      ]
    }
  ]

  let allPassed = true

  for (const dashboard of dashboardTests) {
    console.log(`\n📊 Testing ${dashboard.role} dashboard...`)
    
    for (const test of dashboard.tests) {
      try {
        const { data, error } = await test()
        if (error) throw error
        console.log(`✅ ${dashboard.role} data access successful`)
      } catch (error) {
        console.error(`❌ ${dashboard.role} data access failed:`, error.message)
        allPassed = false
      }
    }
  }

  return allPassed
}

async function testCrossUserNotifications() {
  console.log('🔍 Testing cross-user notifications...')
  
  try {
    // Create a notification from manager to employee
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: testUsers.employee.id,
        title: 'Cross-user Test',
        message: 'Testing cross-user notification functionality',
        type: 'test'
      })
    
    if (error) throw error
    
    // Check if employee can see the notification
    const { data, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUsers.employee.id)
      .eq('title', 'Cross-user Test')
      .single()
    
    if (fetchError) throw fetchError
    
    console.log('✅ Cross-user notifications working')
    return true
  } catch (error) {
    console.error('❌ Cross-user notifications failed:', error.message)
    return false
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting comprehensive dashboard testing...\n')
  
  const results = {
    databaseConnection: false,
    notificationsTable: false,
    approvalSystem: false,
    realTimeSubscriptions: false,
    roleBasedDashboards: false,
    crossUserNotifications: false
  }

  // Test database connection
  results.databaseConnection = await testDatabaseConnection()
  if (!results.databaseConnection) {
    console.log('\n❌ Database connection failed. Please check your Supabase configuration.')
    return
  }

  // Test notifications table
  results.notificationsTable = await testNotificationsTable()
  if (!results.notificationsTable) {
    console.log('\n❌ Notifications table not accessible. Please run the database setup scripts.')
    return
  }

  // Test approval system
  results.approvalSystem = await testApprovalSystem()
  if (!results.approvalSystem) {
    console.log('\n❌ Approval system not set up. Please run CREATE_APPROVAL_SYSTEM.sql')
    return
  }

  // Test user notifications for each role
  console.log('\n🔍 Testing notifications for each role...')
  for (const [role, user] of Object.entries(testUsers)) {
    await testUserNotifications(user.id, role)
  }

  // Test real-time subscriptions
  console.log('\n🔍 Testing real-time subscriptions...')
  results.realTimeSubscriptions = await testRealTimeSubscriptions()

  // Test role-based dashboards
  results.roleBasedDashboards = await testRoleBasedDashboards()

  // Test cross-user notifications
  results.crossUserNotifications = await testCrossUserNotifications()

  // Summary
  console.log('\n📋 Test Results Summary:')
  console.log('========================')
  console.log(`Database Connection: ${results.databaseConnection ? '✅' : '❌'}`)
  console.log(`Notifications Table: ${results.notificationsTable ? '✅' : '❌'}`)
  console.log(`Approval System: ${results.approvalSystem ? '✅' : '❌'}`)
  console.log(`Real-time Subscriptions: ${results.realTimeSubscriptions ? '✅' : '❌'}`)
  console.log(`Role-based Dashboards: ${results.roleBasedDashboards ? '✅' : '❌'}`)
  console.log(`Cross-user Notifications: ${results.crossUserNotifications ? '✅' : '❌'}`)

  const allPassed = Object.values(results).every(result => result)
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! The notification system is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above and ensure:')
    console.log('1. Database schema is set up (run supabase/clean_migration.sql)')
    console.log('2. Approval system is created (run CREATE_APPROVAL_SYSTEM.sql)')
    console.log('3. Supabase configuration is correct')
  }
}

// Run the tests
runAllTests().catch(console.error)
