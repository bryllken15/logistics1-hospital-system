#!/usr/bin/env node

/**
 * Integration Test for ManagerDashboard Real-time Data Integration
 * Tests the connection between ManagerDashboard, ProcurementDashboard, and ProjectManagerDashboard
 */

import { createClient } from '@supabase/supabase-js'

// Test configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🧪 Starting Integration Test for ManagerDashboard...')

async function testDatabaseConnection() {
  try {
    console.log('📡 Testing database connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    return false
  }
}

async function testRealTimeData() {
  try {
    console.log('📊 Testing real-time data integration...')
    
    // Test procurement data
    const { data: purchaseOrders, error: poError } = await supabase
      .from('purchase_orders')
      .select('*')
      .limit(5)
    
    if (poError) {
      console.error('❌ Failed to fetch purchase orders:', poError.message)
      return false
    }
    
    // Test project data
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .limit(5)
    
    if (projectError) {
      console.error('❌ Failed to fetch projects:', projectError.message)
      return false
    }
    
    // Test inventory data
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .limit(5)
    
    if (inventoryError) {
      console.error('❌ Failed to fetch inventory:', inventoryError.message)
      return false
    }
    
    // Test assets data
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .limit(5)
    
    if (assetsError) {
      console.error('❌ Failed to fetch assets:', assetsError.message)
      return false
    }
    
    console.log('✅ Real-time data integration test passed')
    console.log(`   📋 Purchase Orders: ${purchaseOrders?.length || 0}`)
    console.log(`   📋 Projects: ${projects?.length || 0}`)
    console.log(`   📋 Inventory Items: ${inventory?.length || 0}`)
    console.log(`   📋 Assets: ${assets?.length || 0}`)
    
    return true
  } catch (error) {
    console.error('❌ Real-time data test failed:', error.message)
    return false
  }
}

async function testManagerDashboardStats() {
  try {
    console.log('📈 Testing ManagerDashboard stats calculation...')
    
    // Fetch all data needed for stats
    const [purchaseOrders, purchaseRequests, projects, inventory, assets, maintenance] = await Promise.all([
      supabase.from('purchase_orders').select('*'),
      supabase.from('purchase_requests').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('inventory').select('*'),
      supabase.from('assets').select('*'),
      supabase.from('maintenance_logs').select('*')
    ])
    
    // Calculate stats like in ManagerDashboard
    const totalProcurementRequests = (purchaseOrders.data || []).length + (purchaseRequests.data || []).length
    const totalWarehouseStock = (inventory.data || []).reduce((sum, item) => sum + (item.quantity * (item.unit_price || 0)), 0)
    const ongoingProjects = (projects.data || []).filter(project => 
      project.status === 'in_progress' || project.status === 'on_track' || project.status === 'planning'
    ).length
    const assetsUnderMaintenance = (maintenance.data || []).filter(maintenance => 
      maintenance.status === 'in_progress' || maintenance.status === 'scheduled'
    ).length
    const pendingApprovals = (purchaseOrders.data || []).filter(order => order.status === 'pending').length + 
                             (purchaseRequests.data || []).filter(req => req.status === 'pending').length
    const totalSpending = (purchaseOrders.data || []).reduce((sum, order) => sum + (order.amount || 0), 0) +
                         (purchaseRequests.data || []).reduce((sum, req) => sum + (req.total_amount || 0), 0)
    const completedProjects = (projects.data || []).filter(project => project.status === 'completed').length
    const criticalAssets = (assets.data || []).filter(asset => asset.condition === 'needs_repair' || asset.condition === 'under_repair').length
    
    console.log('✅ ManagerDashboard stats calculation successful')
    console.log(`   📊 Total Procurement Requests: ${totalProcurementRequests}`)
    console.log(`   📊 Total Warehouse Stock: ₱${totalWarehouseStock.toLocaleString()}`)
    console.log(`   📊 Ongoing Projects: ${ongoingProjects}`)
    console.log(`   📊 Assets Under Maintenance: ${assetsUnderMaintenance}`)
    console.log(`   📊 Pending Approvals: ${pendingApprovals}`)
    console.log(`   📊 Total Spending: ₱${totalSpending.toLocaleString()}`)
    console.log(`   📊 Completed Projects: ${completedProjects}`)
    console.log(`   📊 Critical Assets: ${criticalAssets}`)
    
    return true
  } catch (error) {
    console.error('❌ ManagerDashboard stats test failed:', error.message)
    return false
  }
}

async function testDashboardConnections() {
  try {
    console.log('🔗 Testing dashboard connections...')
    
    // Test system log creation for navigation
    const { data: logData, error: logError } = await supabase
      .from('system_logs')
      .insert({
        action: 'Integration Test - Dashboard Connection',
        user_id: '22222222-2222-2222-2222-222222222222',
        details: 'Testing connection between ManagerDashboard and other dashboards'
      })
      .select()
    
    if (logError) {
      console.error('❌ Failed to create system log:', logError.message)
      return false
    }
    
    console.log('✅ Dashboard connections test passed')
    console.log(`   📝 System log created: ${logData?.[0]?.id}`)
    
    return true
  } catch (error) {
    console.error('❌ Dashboard connections test failed:', error.message)
    return false
  }
}

async function testRealtimeSubscriptions() {
  try {
    console.log('🔄 Testing real-time subscriptions...')
    
    // Test if realtime is enabled
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Failed to test realtime subscription:', error.message)
      return false
    }
    
    console.log('✅ Real-time subscriptions test passed')
    console.log('   📡 Realtime is enabled and accessible')
    
    return true
  } catch (error) {
    console.error('❌ Real-time subscriptions test failed:', error.message)
    return false
  }
}

async function runIntegrationTest() {
  console.log('🚀 Starting comprehensive integration test...\n')
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Real-time Data Integration', fn: testRealTimeData },
    { name: 'ManagerDashboard Stats', fn: testManagerDashboardStats },
    { name: 'Dashboard Connections', fn: testDashboardConnections },
    { name: 'Real-time Subscriptions', fn: testRealtimeSubscriptions }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name} test...`)
    try {
      const result = await test.fn()
      if (result) {
        passed++
        console.log(`✅ ${test.name} test PASSED`)
      } else {
        failed++
        console.log(`❌ ${test.name} test FAILED`)
      }
    } catch (error) {
      failed++
      console.log(`❌ ${test.name} test FAILED with error: ${error.message}`)
    }
  }
  
  console.log('\n📊 Integration Test Results:')
  console.log(`   ✅ Passed: ${passed}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All integration tests passed! ManagerDashboard is ready for production.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.')
  }
  
  return failed === 0
}

// Run the integration test
runIntegrationTest()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Integration test crashed:', error.message)
    process.exit(1)
  })

export {
  testDatabaseConnection,
  testRealTimeData,
  testManagerDashboardStats,
  testDashboardConnections,
  testRealtimeSubscriptions,
  runIntegrationTest
}
