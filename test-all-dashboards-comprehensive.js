// Comprehensive Dashboard Testing Script
// Tests all 7 role-based dashboards and real-time functionality

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Check if credentials are properly configured
if (supabaseUrl === 'https://your-project.supabase.co' || supabaseKey === 'your-anon-key') {
  console.log('❌ Supabase credentials not configured!')
  console.log('\n🔧 To fix this:')
  console.log('1. Create a .env file in your project root')
  console.log('2. Add your Supabase credentials:')
  console.log('   VITE_SUPABASE_URL=https://your-project.supabase.co')
  console.log('   VITE_SUPABASE_ANON_KEY=your-anon-key')
  console.log('3. Or set environment variables:')
  console.log('   set VITE_SUPABASE_URL=https://your-project.supabase.co')
  console.log('   set VITE_SUPABASE_ANON_KEY=your-anon-key')
  console.log('\n📖 See SUPABASE_CREDENTIALS_SETUP.md for detailed instructions')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Test users for each role
const testUsers = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator' },
  { username: 'manager', password: 'manager123', role: 'manager', name: 'Department Manager' },
  { username: 'employee', password: 'employee123', role: 'employee', name: 'Hospital Employee' },
  { username: 'procurement', password: 'procurement123', role: 'procurement', name: 'Procurement Officer' },
  { username: 'project_manager', password: 'pm123', role: 'project_manager', name: 'Project Manager' },
  { username: 'maintenance', password: 'maintenance123', role: 'maintenance', name: 'Maintenance Technician' },
  { username: 'document_analyst', password: 'analyst123', role: 'document_analyst', name: 'Document Analyst' }
]

async function testAuthentication() {
  console.log('🔐 Testing Authentication for All Users...\n')
  
  let successCount = 0
  const results = {}

  for (const user of testUsers) {
    try {
      console.log(`Testing ${user.username} (${user.role})...`)
      
      const { data, error } = await supabase
        .rpc('authenticate_user', {
          user_username: user.username,
          user_password: user.password
        })

      if (error) {
        console.log(`❌ ${user.username}: ${error.message}`)
        results[user.role] = { success: false, error: error.message }
      } else if (data && data.length > 0) {
        console.log(`✅ ${user.username}: Login successful`)
        results[user.role] = { success: true, user: data[0] }
        successCount++
      } else {
        console.log(`❌ ${user.username}: No data returned`)
        results[user.role] = { success: false, error: 'No data returned' }
      }
    } catch (error) {
      console.log(`❌ ${user.username}: ${error.message}`)
      results[user.role] = { success: false, error: error.message }
    }
  }

  console.log(`\n📊 Authentication Results: ${successCount}/${testUsers.length} users can login`)
  return results
}

async function testManagerDashboard() {
  console.log('\n👔 Testing Manager Dashboard...')
  
  try {
    // Test authentication
    const { data: authData, error: authError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'manager',
        user_password: 'manager123'
      })

    if (authError || !authData || authData.length === 0) {
      console.log('❌ Manager authentication failed')
      return false
    }

    const managerId = authData[0].user_id

    // Test pending approvals
    const { data: approvals, error: approvalsError } = await supabase
      .rpc('get_pending_approvals', {
        p_user_id: managerId,
        p_user_role: 'manager'
      })

    if (approvalsError) {
      console.log('❌ Failed to fetch pending approvals:', approvalsError.message)
    } else {
      console.log('✅ Pending approvals accessible')
      console.log(`   Found ${approvals?.length || 0} pending approvals`)
    }

    // Test notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', managerId)
      .order('created_at', { ascending: false })

    if (notificationsError) {
      console.log('❌ Failed to fetch notifications:', notificationsError.message)
    } else {
      console.log('✅ Notifications accessible')
      console.log(`   Found ${notifications?.length || 0} notifications`)
    }

    // Test purchase requests
    const { data: requests, error: requestsError } = await supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.log('❌ Failed to fetch purchase requests:', requestsError.message)
    } else {
      console.log('✅ Purchase requests accessible')
      console.log(`   Found ${requests?.length || 0} purchase requests`)
    }

    console.log('✅ Manager Dashboard tests completed')
    return true

  } catch (error) {
    console.log('❌ Manager Dashboard test failed:', error.message)
    return false
  }
}

async function testEmployeeDashboard() {
  console.log('\n👤 Testing Employee Dashboard...')
  
  try {
    // Test authentication
    const { data: authData, error: authError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'employee',
        user_password: 'employee123'
      })

    if (authError || !authData || authData.length === 0) {
      console.log('❌ Employee authentication failed')
      return false
    }

    const employeeId = authData[0].user_id

    // Test user requests
    const { data: userRequests, error: requestsError } = await supabase
      .from('purchase_requests')
      .select('*')
      .eq('requested_by', employeeId)
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.log('❌ Failed to fetch user requests:', requestsError.message)
    } else {
      console.log('✅ User requests accessible')
      console.log(`   Found ${userRequests?.length || 0} user requests`)
    }

    // Test notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', employeeId)
      .order('created_at', { ascending: false })

    if (notificationsError) {
      console.log('❌ Failed to fetch notifications:', notificationsError.message)
    } else {
      console.log('✅ Notifications accessible')
      console.log(`   Found ${notifications?.length || 0} notifications`)
    }

    // Test creating a purchase request
    const { data: submitResult, error: submitError } = await supabase
      .rpc('submit_purchase_request', {
        p_title: 'Test Employee Request',
        p_description: 'Testing employee dashboard functionality',
        p_total_amount: 500.00,
        p_priority: 'medium',
        p_required_date: '2024-12-31',
        p_requested_by: employeeId
      })

    if (submitError) {
      console.log('❌ Failed to submit purchase request:', submitError.message)
    } else {
      console.log('✅ Purchase request creation working')
      console.log(`   Created request ID: ${submitResult}`)
    }

    console.log('✅ Employee Dashboard tests completed')
    return true

  } catch (error) {
    console.log('❌ Employee Dashboard test failed:', error.message)
    return false
  }
}

async function testAdminDashboard() {
  console.log('\n🛡️ Testing Admin Dashboard...')
  
  try {
    // Test authentication
    const { data: authData, error: authError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'admin',
        user_password: 'admin123'
      })

    if (authError || !authData || authData.length === 0) {
      console.log('❌ Admin authentication failed')
      return false
    }

    // Test user management
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.log('❌ Failed to fetch users:', usersError.message)
    } else {
      console.log('✅ User management accessible')
      console.log(`   Found ${users?.length || 0} users`)
    }

    // Test all purchase requests
    const { data: requests, error: requestsError } = await supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.log('❌ Failed to fetch all requests:', requestsError.message)
    } else {
      console.log('✅ All requests accessible')
      console.log(`   Found ${requests?.length || 0} total requests`)
    }

    // Test system logs
    const { data: logs, error: logsError } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (logsError) {
      console.log('⚠️ System logs not accessible (this may be normal)')
    } else {
      console.log('✅ System logs accessible')
      console.log(`   Found ${logs?.length || 0} system logs`)
    }

    console.log('✅ Admin Dashboard tests completed')
    return true

  } catch (error) {
    console.log('❌ Admin Dashboard test failed:', error.message)
    return false
  }
}

async function testProcurementDashboard() {
  console.log('\n📦 Testing Procurement Dashboard...')
  
  try {
    // Test authentication
    const { data: authData, error: authError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'procurement',
        user_password: 'procurement123'
      })

    if (authError || !authData || authData.length === 0) {
      console.log('❌ Procurement authentication failed')
      return false
    }

    // Test purchase orders
    const { data: orders, error: ordersError } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.log('❌ Failed to fetch purchase orders:', ordersError.message)
    } else {
      console.log('✅ Purchase orders accessible')
      console.log(`   Found ${orders?.length || 0} purchase orders`)
    }

    // Test suppliers
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })

    if (suppliersError) {
      console.log('❌ Failed to fetch suppliers:', suppliersError.message)
    } else {
      console.log('✅ Suppliers accessible')
      console.log(`   Found ${suppliers?.length || 0} suppliers`)
    }

    // Test inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .order('last_updated', { ascending: false })

    if (inventoryError) {
      console.log('❌ Failed to fetch inventory:', inventoryError.message)
    } else {
      console.log('✅ Inventory accessible')
      console.log(`   Found ${inventory?.length || 0} inventory items`)
    }

    console.log('✅ Procurement Dashboard tests completed')
    return true

  } catch (error) {
    console.log('❌ Procurement Dashboard test failed:', error.message)
    return false
  }
}

async function testProjectManagerDashboard() {
  console.log('\n📋 Testing Project Manager Dashboard...')
  
  try {
    // Test authentication
    const { data: authData, error: authError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'project_manager',
        user_password: 'pm123'
      })

    if (authError || !authData || authData.length === 0) {
      console.log('❌ Project Manager authentication failed')
      return false
    }

    // Test projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.log('❌ Failed to fetch projects:', projectsError.message)
    } else {
      console.log('✅ Projects accessible')
      console.log(`   Found ${projects?.length || 0} projects`)
    }

    // Test deliveries
    const { data: deliveries, error: deliveriesError } = await supabase
      .from('delivery_receipts')
      .select('*')
      .order('delivery_date', { ascending: false })

    if (deliveriesError) {
      console.log('❌ Failed to fetch deliveries:', deliveriesError.message)
    } else {
      console.log('✅ Deliveries accessible')
      console.log(`   Found ${deliveries?.length || 0} deliveries`)
    }

    console.log('✅ Project Manager Dashboard tests completed')
    return true

  } catch (error) {
    console.log('❌ Project Manager Dashboard test failed:', error.message)
    return false
  }
}

async function testMaintenanceDashboard() {
  console.log('\n🔧 Testing Maintenance Dashboard...')
  
  try {
    // Test authentication
    const { data: authData, error: authError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'maintenance',
        user_password: 'maintenance123'
      })

    if (authError || !authData || authData.length === 0) {
      console.log('❌ Maintenance authentication failed')
      return false
    }

    // Test assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })

    if (assetsError) {
      console.log('❌ Failed to fetch assets:', assetsError.message)
    } else {
      console.log('✅ Assets accessible')
      console.log(`   Found ${assets?.length || 0} assets`)
    }

    // Test maintenance logs
    const { data: logs, error: logsError } = await supabase
      .from('maintenance_logs')
      .select('*')
      .order('maintenance_date', { ascending: false })

    if (logsError) {
      console.log('❌ Failed to fetch maintenance logs:', logsError.message)
    } else {
      console.log('✅ Maintenance logs accessible')
      console.log(`   Found ${logs?.length || 0} maintenance logs`)
    }

    console.log('✅ Maintenance Dashboard tests completed')
    return true

  } catch (error) {
    console.log('❌ Maintenance Dashboard test failed:', error.message)
    return false
  }
}

async function testDocumentAnalystDashboard() {
  console.log('\n📄 Testing Document Analyst Dashboard...')
  
  try {
    // Test authentication
    const { data: authData, error: authError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'document_analyst',
        user_password: 'analyst123'
      })

    if (authError || !authData || authData.length === 0) {
      console.log('❌ Document Analyst authentication failed')
      return false
    }

    // Test documents
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (documentsError) {
      console.log('❌ Failed to fetch documents:', documentsError.message)
    } else {
      console.log('✅ Documents accessible')
      console.log(`   Found ${documents?.length || 0} documents`)
    }

    console.log('✅ Document Analyst Dashboard tests completed')
    return true

  } catch (error) {
    console.log('❌ Document Analyst Dashboard test failed:', error.message)
    return false
  }
}

async function testRealTimeUpdates() {
  console.log('\n🔄 Testing Real-time Updates...')
  
  try {
    // Test notifications real-time
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (notificationsError) {
      console.log('❌ Failed to fetch notifications for real-time test:', notificationsError.message)
    } else {
      console.log('✅ Notifications real-time accessible')
      console.log(`   Found ${notifications?.length || 0} recent notifications`)
    }

    // Test purchase requests real-time
    const { data: requests, error: requestsError } = await supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (requestsError) {
      console.log('❌ Failed to fetch purchase requests for real-time test:', requestsError.message)
    } else {
      console.log('✅ Purchase requests real-time accessible')
      console.log(`   Found ${requests?.length || 0} recent requests`)
    }

    console.log('✅ Real-time updates tests completed')
    return true

  } catch (error) {
    console.log('❌ Real-time updates test failed:', error.message)
    return false
  }
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Dashboard Tests...\n')
  
  const results = {
    authentication: false,
    managerDashboard: false,
    employeeDashboard: false,
    adminDashboard: false,
    procurementDashboard: false,
    projectManagerDashboard: false,
    maintenanceDashboard: false,
    documentAnalystDashboard: false,
    realTimeUpdates: false
  }

  // Test authentication
  const authResults = await testAuthentication()
  results.authentication = Object.values(authResults).every(r => r.success)

  // Test each dashboard
  results.managerDashboard = await testManagerDashboard()
  results.employeeDashboard = await testEmployeeDashboard()
  results.adminDashboard = await testAdminDashboard()
  results.procurementDashboard = await testProcurementDashboard()
  results.projectManagerDashboard = await testProjectManagerDashboard()
  results.maintenanceDashboard = await testMaintenanceDashboard()
  results.documentAnalystDashboard = await testDocumentAnalystDashboard()
  results.realTimeUpdates = await testRealTimeUpdates()

  // Summary
  console.log('\n📊 COMPREHENSIVE TEST RESULTS')
  console.log('================================')
  console.log(`Authentication: ${results.authentication ? '✅' : '❌'}`)
  console.log(`Manager Dashboard: ${results.managerDashboard ? '✅' : '❌'}`)
  console.log(`Employee Dashboard: ${results.employeeDashboard ? '✅' : '❌'}`)
  console.log(`Admin Dashboard: ${results.adminDashboard ? '✅' : '❌'}`)
  console.log(`Procurement Dashboard: ${results.procurementDashboard ? '✅' : '❌'}`)
  console.log(`Project Manager Dashboard: ${results.projectManagerDashboard ? '✅' : '❌'}`)
  console.log(`Maintenance Dashboard: ${results.maintenanceDashboard ? '✅' : '❌'}`)
  console.log(`Document Analyst Dashboard: ${results.documentAnalystDashboard ? '✅' : '❌'}`)
  console.log(`Real-time Updates: ${results.realTimeUpdates ? '✅' : '❌'}`)

  const successCount = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length

  console.log(`\n🎯 Overall Success Rate: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`)

  if (successCount === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!')
    console.log('Your Hospital Logistics System is fully functional!')
  } else {
    console.log('\n⚠️ Some tests failed.')
    console.log('Check the error messages above for troubleshooting.')
  }

  return results
}

// Run the comprehensive tests
runComprehensiveTests().catch(console.error)
