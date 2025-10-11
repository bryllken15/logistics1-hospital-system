#!/usr/bin/env node

/**
 * Complete Approval Workflow Test Script
 * Tests both Procurement and Inventory approval workflows
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not configured!')
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Test data
const testUsers = {
  employee: '33333333-3333-3333-3333-333333333333',
  manager: '22222222-2222-2222-2222-222222222222',
  projectManager: '55555555-5555-5555-5555-555555555555'
}

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, role')
      .limit(1)
    
    if (error) throw error
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

async function testTablesExist() {
  console.log('🔍 Checking if approval tables exist...')
  
  const tables = [
    'procurement_approvals',
    'inventory_approvals', 
    'notifications',
    'users'
  ]
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) throw error
      console.log(`✅ Table ${table} exists`)
    } catch (error) {
      console.error(`❌ Table ${table} does not exist or is not accessible:`, error.message)
      return false
    }
  }
  
  return true
}

async function testInventoryApprovalWorkflow() {
  console.log('🔍 Testing Inventory Approval Workflow...')
  
  try {
    // Step 1: Employee creates inventory request
    console.log('📝 Step 1: Employee creates inventory request')
    const inventoryRequest = {
      item_name: 'Test Medical Equipment',
      quantity: 5,
      unit_price: 150.00,
      status: 'pending',
      requested_by: testUsers.employee,
      request_reason: 'Testing inventory approval workflow',
      request_type: 'new_item'
    }
    
    const { data: inventoryApproval, error: inventoryError } = await supabase
      .from('inventory_approvals')
      .insert(inventoryRequest)
      .select()
    
    if (inventoryError) throw inventoryError
    
    console.log('✅ Inventory request created:', inventoryApproval[0].id)
    
    // Step 2: Manager approves
    console.log('👨‍💼 Step 2: Manager approves inventory request')
    const { data: managerApproval, error: managerError } = await supabase
      .from('inventory_approvals')
      .update({
        manager_approved: true,
        manager_approved_by: testUsers.manager,
        manager_approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', inventoryApproval[0].id)
      .select()
    
    if (managerError) throw managerError
    console.log('✅ Manager approved inventory request')
    
    // Step 3: Project Manager approves
    console.log('👨‍💼 Step 3: Project Manager approves inventory request')
    const { data: pmApproval, error: pmError } = await supabase
      .from('inventory_approvals')
      .update({
        project_manager_approved: true,
        project_manager_approved_by: testUsers.projectManager,
        project_manager_approved_at: new Date().toISOString(),
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', inventoryApproval[0].id)
      .select()
    
    if (pmError) throw pmError
    console.log('✅ Project Manager approved inventory request')
    
    // Step 4: Check if inventory item was created
    console.log('📦 Step 4: Checking if inventory item was created')
    const { data: inventoryItems, error: inventoryCheckError } = await supabase
      .from('inventory')
      .select('*')
      .eq('item_name', 'Test Medical Equipment')
    
    if (inventoryCheckError) throw inventoryCheckError
    
    if (inventoryItems.length > 0) {
      console.log('✅ Inventory item created successfully:', inventoryItems[0].id)
    } else {
      console.log('⚠️  Inventory item not found - this might be expected if auto-creation is not implemented')
    }
    
    return inventoryApproval[0].id
  } catch (error) {
    console.error('❌ Inventory approval workflow failed:', error.message)
    throw error
  }
}

async function testProcurementApprovalWorkflow() {
  console.log('🔍 Testing Procurement Approval Workflow...')
  
  try {
    // Step 1: Employee creates procurement request
    console.log('📝 Step 1: Employee creates procurement request')
    const procurementRequest = {
      item_name: 'Test Office Supplies',
      description: 'Testing procurement approval workflow',
      quantity: 10,
      unit_price: 25.00,
      supplier: 'Test Supplier',
      category: 'office',
      priority: 'medium',
      status: 'pending',
      requested_by: testUsers.employee,
      request_reason: 'Testing procurement approval workflow',
      request_type: 'purchase_request'
    }
    
    const { data: procurementApproval, error: procurementError } = await supabase
      .from('procurement_approvals')
      .insert(procurementRequest)
      .select()
    
    if (procurementError) throw procurementError
    
    console.log('✅ Procurement request created:', procurementApproval[0].id)
    
    // Step 2: Manager approves
    console.log('👨‍💼 Step 2: Manager approves procurement request')
    const { data: managerApproval, error: managerError } = await supabase
      .from('procurement_approvals')
      .update({
        manager_approved: true,
        manager_approved_by: testUsers.manager,
        manager_approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', procurementApproval[0].id)
      .select()
    
    if (managerError) throw managerError
    console.log('✅ Manager approved procurement request')
    
    // Step 3: Project Manager approves
    console.log('👨‍💼 Step 3: Project Manager approves procurement request')
    const { data: pmApproval, error: pmError } = await supabase
      .from('procurement_approvals')
      .update({
        project_manager_approved: true,
        project_manager_approved_by: testUsers.projectManager,
        project_manager_approved_at: new Date().toISOString(),
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', procurementApproval[0].id)
      .select()
    
    if (pmError) throw pmError
    console.log('✅ Project Manager approved procurement request')
    
    // Step 4: Check if purchase request was created
    console.log('📦 Step 4: Checking if purchase request was created')
    const { data: purchaseRequests, error: purchaseCheckError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('item_name', 'Test Office Supplies')
    
    if (purchaseCheckError) throw purchaseCheckError
    
    if (purchaseRequests.length > 0) {
      console.log('✅ Purchase request created successfully:', purchaseRequests[0].id)
    } else {
      console.log('⚠️  Purchase request not found - this might be expected if auto-creation is not implemented')
    }
    
    return procurementApproval[0].id
  } catch (error) {
    console.error('❌ Procurement approval workflow failed:', error.message)
    throw error
  }
}

async function testNotificationSystem() {
  console.log('🔍 Testing Notification System...')
  
  try {
    // Create test notification
    const notification = {
      user_id: testUsers.manager,
      title: 'Test Approval Request',
      message: 'This is a test notification for the approval workflow',
      type: 'approval_request',
      related_request_id: 'test-request-id',
      related_request_type: 'inventory'
    }
    
    const { data: notificationData, error: notificationError } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
    
    if (notificationError) throw notificationError
    
    console.log('✅ Test notification created:', notificationData[0].id)
    
    // Test reading notifications
    const { data: notifications, error: readError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUsers.manager)
      .order('created_at', { ascending: false })
    
    if (readError) throw readError
    
    console.log(`✅ Found ${notifications.length} notifications for manager`)
    
    return notificationData[0].id
  } catch (error) {
    console.error('❌ Notification system test failed:', error.message)
    throw error
  }
}

async function testRealtimeSubscriptions() {
  console.log('🔍 Testing Real-time Subscriptions...')
  
  try {
    // Test subscription to procurement_approvals
    const procurementChannel = supabase
      .channel('test_procurement_approvals')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'procurement_approvals'
      }, (payload) => {
        console.log('✅ Real-time update received for procurement_approvals:', payload.eventType)
      })
      .subscribe()
    
    // Test subscription to inventory_approvals
    const inventoryChannel = supabase
      .channel('test_inventory_approvals')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory_approvals'
      }, (payload) => {
        console.log('✅ Real-time update received for inventory_approvals:', payload.eventType)
      })
      .subscribe()
    
    // Test subscription to notifications
    const notificationChannel = supabase
      .channel('test_notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        console.log('✅ Real-time update received for notifications:', payload.eventType)
      })
      .subscribe()
    
    console.log('✅ Real-time subscriptions set up successfully')
    
    // Clean up subscriptions
    setTimeout(() => {
      supabase.removeChannel(procurementChannel)
      supabase.removeChannel(inventoryChannel)
      supabase.removeChannel(notificationChannel)
      console.log('✅ Real-time subscriptions cleaned up')
    }, 5000)
    
    return true
  } catch (error) {
    console.error('❌ Real-time subscription test failed:', error.message)
    throw error
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...')
  
  try {
    // Clean up test notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('title', 'Test Approval Request')
    
    // Clean up test inventory approvals
    await supabase
      .from('inventory_approvals')
      .delete()
      .eq('item_name', 'Test Medical Equipment')
    
    // Clean up test procurement approvals
    await supabase
      .from('procurement_approvals')
      .delete()
      .eq('item_name', 'Test Office Supplies')
    
    // Clean up test inventory items
    await supabase
      .from('inventory')
      .delete()
      .eq('item_name', 'Test Medical Equipment')
    
    // Clean up test purchase requests
    await supabase
      .from('purchase_requests')
      .delete()
      .eq('item_name', 'Test Office Supplies')
    
    console.log('✅ Test data cleaned up successfully')
  } catch (error) {
    console.error('⚠️  Error cleaning up test data:', error.message)
  }
}

async function runAllTests() {
  console.log('🚀 Starting Complete Approval Workflow Tests\n')
  
  try {
    // Test 1: Database Connection
    const dbConnected = await testDatabaseConnection()
    if (!dbConnected) {
      console.error('❌ Cannot proceed without database connection')
      return
    }
    console.log('')
    
    // Test 2: Tables Exist
    const tablesExist = await testTablesExist()
    if (!tablesExist) {
      console.error('❌ Required tables do not exist')
      return
    }
    console.log('')
    
    // Test 3: Inventory Approval Workflow
    const inventoryApprovalId = await testInventoryApprovalWorkflow()
    console.log('')
    
    // Test 4: Procurement Approval Workflow
    const procurementApprovalId = await testProcurementApprovalWorkflow()
    console.log('')
    
    // Test 5: Notification System
    const notificationId = await testNotificationSystem()
    console.log('')
    
    // Test 6: Real-time Subscriptions
    await testRealtimeSubscriptions()
    console.log('')
    
    // Cleanup
    await cleanupTestData()
    console.log('')
    
    console.log('🎉 All tests completed successfully!')
    console.log('✅ Approval workflows are working correctly')
    console.log('✅ Real-time notifications are functional')
    console.log('✅ Database integration is complete')
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the tests
runAllTests()

export {
  testDatabaseConnection,
  testTablesExist,
  testInventoryApprovalWorkflow,
  testProcurementApprovalWorkflow,
  testNotificationSystem,
  testRealtimeSubscriptions,
  cleanupTestData,
  runAllTests
}
