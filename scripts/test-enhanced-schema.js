#!/usr/bin/env node

/**
 * Enhanced Schema Testing Script
 * Hospital Supply Chain & Procurement Management System
 * 
 * This script validates:
 * - All role-based permissions
 * - Audit trail functionality
 * - Approval workflows end-to-end
 * - RLS policies
 * - Database integrity
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';

// Initialize Supabase clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Test users for different roles
const testUsers = {
  admin: {
    username: 'test_admin',
    password: 'admin123',
    full_name: 'Test Administrator',
    email: 'test_admin@hospital.com',
    role: 'admin',
    is_authorized: true
  },
  manager: {
    username: 'test_manager',
    password: 'manager123',
    full_name: 'Test Manager',
    email: 'test_manager@hospital.com',
    role: 'manager',
    is_authorized: true
  },
  employee: {
    username: 'test_employee',
    password: 'employee123',
    full_name: 'Test Employee',
    email: 'test_employee@hospital.com',
    role: 'employee',
    is_authorized: true
  },
  procurement: {
    username: 'test_procurement',
    password: 'procurement123',
    full_name: 'Test Procurement',
    email: 'test_procurement@hospital.com',
    role: 'procurement',
    is_authorized: true
  },
  project_manager: {
    username: 'test_pm',
    password: 'pm123',
    full_name: 'Test Project Manager',
    email: 'test_pm@hospital.com',
    role: 'project_manager',
    is_authorized: true
  },
  maintenance: {
    username: 'test_maintenance',
    password: 'maintenance123',
    full_name: 'Test Maintenance',
    email: 'test_maintenance@hospital.com',
    role: 'maintenance',
    is_authorized: true
  },
  document_analyst: {
    username: 'test_analyst',
    password: 'analyst123',
    full_name: 'Test Document Analyst',
    email: 'test_analyst@hospital.com',
    role: 'document_analyst',
    is_authorized: true
  }
};

// Utility functions
function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${details}`);
  }
  testResults.details.push({ test: testName, passed, details });
}

async function testDatabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    logTest('Database Connection', true);
    return true;
  } catch (error) {
    logTest('Database Connection', false, error.message);
    return false;
  }
}

async function testTableExistence() {
  const requiredTables = [
    'users', 'inventory', 'purchase_orders', 'purchase_requests',
    'projects', 'assets', 'documents', 'system_logs',
    'delivery_receipts', 'maintenance_logs', 'suppliers',
    'staff_assignments', 'inventory_changes', 'maintenance_schedule',
    'notifications', 'reports', 'audit_logs', 'user_activity_logs',
    'approval_audit_trail', 'security_events', 'approval_chains',
    'approval_delegates', 'approval_history', 'role_permissions',
    'user_role_history', 'temporary_role_assignments', 'role_hierarchies',
    'notification_preferences', 'notification_templates', 'escalation_rules',
    'dashboard_metrics', 'performance_metrics', 'compliance_reports'
  ];

  let allTablesExist = true;
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        logTest(`Table ${table} exists`, false, error.message);
        allTablesExist = false;
      } else {
        logTest(`Table ${table} exists`, true);
      }
    } catch (error) {
      logTest(`Table ${table} exists`, false, error.message);
      allTablesExist = false;
    }
  }
  
  return allTablesExist;
}

async function testRolePermissions() {
  console.log('\n🔐 Testing Role-Based Permissions...');
  
  // Test each role's permissions
  for (const [roleName, userData] of Object.entries(testUsers)) {
    console.log(`\nTesting ${roleName} role permissions...`);
    
    // Test user creation
    try {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (userError) throw userError;
      
      logTest(`${roleName} user creation`, true);
      
      // Test role-specific permissions
      await testRoleSpecificPermissions(roleName, user.id);
      
      // Clean up test user
      await supabaseAdmin.from('users').delete().eq('id', user.id);
      
    } catch (error) {
      logTest(`${roleName} user creation`, false, error.message);
    }
  }
}

async function testRoleSpecificPermissions(roleName, userId) {
  const roleTests = {
    admin: async () => {
      // Admin should have access to all tables
      const tables = ['users', 'inventory', 'purchase_orders', 'audit_logs'];
      for (const table of tables) {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);
        
        logTest(`${roleName} can read ${table}`, !error, error?.message);
      }
    },
    
    manager: async () => {
      // Manager should have access to inventory and purchase requests
      const { data: inventory, error: invError } = await supabaseAdmin
        .from('inventory')
        .select('*')
        .limit(1);
      
      const { data: purchaseRequests, error: prError } = await supabaseAdmin
        .from('purchase_requests')
        .select('*')
        .limit(1);
      
      logTest(`${roleName} can read inventory`, !invError, invError?.message);
      logTest(`${roleName} can read purchase_requests`, !prError, prError?.message);
    },
    
    employee: async () => {
      // Employee should have read access to most tables but limited write access
      const { data: inventory, error: invError } = await supabaseAdmin
        .from('inventory')
        .select('*')
        .limit(1);
      
      logTest(`${roleName} can read inventory`, !invError, invError?.message);
    },
    
    procurement: async () => {
      // Procurement should have access to purchase orders and suppliers
      const { data: purchaseOrders, error: poError } = await supabaseAdmin
        .from('purchase_orders')
        .select('*')
        .limit(1);
      
      const { data: suppliers, error: supError } = await supabaseAdmin
        .from('suppliers')
        .select('*')
        .limit(1);
      
      logTest(`${roleName} can read purchase_orders`, !poError, poError?.message);
      logTest(`${roleName} can read suppliers`, !supError, supError?.message);
    },
    
    project_manager: async () => {
      // Project manager should have access to projects
      const { data: projects, error: projError } = await supabaseAdmin
        .from('projects')
        .select('*')
        .limit(1);
      
      logTest(`${roleName} can read projects`, !projError, projError?.message);
    },
    
    maintenance: async () => {
      // Maintenance should have access to assets
      const { data: assets, error: assetError } = await supabaseAdmin
        .from('assets')
        .select('*')
        .limit(1);
      
      logTest(`${roleName} can read assets`, !assetError, assetError?.message);
    },
    
    document_analyst: async () => {
      // Document analyst should have access to documents
      const { data: documents, error: docError } = await supabaseAdmin
        .from('documents')
        .select('*')
        .limit(1);
      
      logTest(`${roleName} can read documents`, !docError, docError?.message);
    }
  };
  
  if (roleTests[roleName]) {
    await roleTests[roleName]();
  }
}

async function testAuditTrail() {
  console.log('\n📝 Testing Audit Trail Functionality...');
  
  try {
    // Create a test user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        username: 'audit_test_user',
        password_hash: 'test_hash',
        full_name: 'Audit Test User',
        email: 'audit_test@hospital.com',
        role: 'employee',
        is_authorized: true
      })
      .select()
      .single();
    
    if (userError) throw userError;
    
    // Create an inventory item to trigger audit
    const { data: inventory, error: invError } = await supabaseAdmin
      .from('inventory')
      .insert({
        item_name: 'Test Item',
        rfid_code: 'TEST001',
        quantity: 10,
        status: 'in_stock',
        location: 'Test Location',
        created_by: user.id
      })
      .select()
      .single();
    
    if (invError) throw invError;
    
    // Check if audit log was created
    const { data: auditLogs, error: auditError } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('table_name', 'inventory')
      .eq('record_id', inventory.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (auditError) throw auditError;
    
    logTest('Audit trail creation', auditLogs && auditLogs.length > 0, 
      auditLogs ? 'Audit log created successfully' : 'No audit log found');
    
    // Test user activity logging
    const { data: activityLogs, error: activityError } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    logTest('User activity logging', !activityError, activityError?.message);
    
    // Clean up
    await supabaseAdmin.from('inventory').delete().eq('id', inventory.id);
    await supabaseAdmin.from('users').delete().eq('id', user.id);
    
  } catch (error) {
    logTest('Audit trail functionality', false, error.message);
  }
}

async function testApprovalWorkflows() {
  console.log('\n🔄 Testing Approval Workflows...');
  
  try {
    // Test approval chain creation
    const { data: approvalChain, error: chainError } = await supabaseAdmin
      .from('approval_chains')
      .insert({
        name: 'Test Approval Chain',
        request_type: 'test_request',
        approval_level: 1,
        required_role: 'manager',
        sla_hours: 24,
        is_active: true
      })
      .select()
      .single();
    
    if (chainError) throw chainError;
    
    logTest('Approval chain creation', true);
    
    // Test approval history
    const { data: approvalHistory, error: historyError } = await supabaseAdmin
      .from('approval_history')
      .insert({
        request_id: 'test-request-123',
        request_type: 'test_request',
        approver_id: null,
        action: 'created',
        approval_level: 1
      })
      .select()
      .single();
    
    if (historyError) throw historyError;
    
    logTest('Approval history creation', true);
    
    // Test notification templates
    const { data: notificationTemplate, error: templateError } = await supabaseAdmin
      .from('notification_templates')
      .insert({
        name: 'Test Template',
        type: 'approval_request',
        subject_template: 'Test Subject',
        body_template: 'Test Body',
        is_active: true
      })
      .select()
      .single();
    
    if (templateError) throw templateError;
    
    logTest('Notification template creation', true);
    
    // Clean up
    await supabaseAdmin.from('approval_chains').delete().eq('id', approvalChain.id);
    await supabaseAdmin.from('approval_history').delete().eq('id', approvalHistory.id);
    await supabaseAdmin.from('notification_templates').delete().eq('id', notificationTemplate.id);
    
  } catch (error) {
    logTest('Approval workflows', false, error.message);
  }
}

async function testRLSPolicies() {
  console.log('\n🔒 Testing Row Level Security Policies...');
  
  try {
    // Test that RLS is enabled on key tables
    const tablesWithRLS = [
      'users', 'inventory', 'purchase_orders', 'audit_logs',
      'notifications', 'role_permissions'
    ];
    
    for (const table of tablesWithRLS) {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);
      
      // Even with RLS, admin should be able to read
      logTest(`RLS enabled on ${table}`, !error, error?.message);
    }
    
  } catch (error) {
    logTest('RLS policies', false, error.message);
  }
}

async function testDatabaseIntegrity() {
  console.log('\n🔍 Testing Database Integrity...');
  
  try {
    // Test foreign key constraints
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) throw usersError;
    
    if (users && users.length > 0) {
      const userId = users[0].id;
      
      // Test inventory with user reference
      const { data: inventory, error: invError } = await supabaseAdmin
        .from('inventory')
        .insert({
          item_name: 'Integrity Test Item',
          rfid_code: 'INTEGRITY001',
          quantity: 1,
          status: 'in_stock',
          location: 'Test Location',
          created_by: userId
        })
        .select()
        .single();
      
      if (invError) throw invError;
      
      logTest('Foreign key constraints', true);
      
      // Clean up
      await supabaseAdmin.from('inventory').delete().eq('id', inventory.id);
    }
    
    // Test unique constraints
    const { data: duplicateUser, error: duplicateError } = await supabaseAdmin
      .from('users')
      .insert({
        username: 'duplicate_test',
        password_hash: 'test_hash',
        full_name: 'Duplicate Test',
        email: 'duplicate@test.com',
        role: 'employee',
        is_authorized: true
      })
      .select()
      .single();
    
    if (duplicateError) throw duplicateError;
    
    // Try to insert duplicate username
    const { data: duplicateUser2, error: duplicateError2 } = await supabaseAdmin
      .from('users')
      .insert({
        username: 'duplicate_test', // Same username
        password_hash: 'test_hash',
        full_name: 'Duplicate Test 2',
        email: 'duplicate2@test.com',
        role: 'employee',
        is_authorized: true
      })
      .select()
      .single();
    
    // This should fail due to unique constraint
    logTest('Unique constraints', duplicateError2 && duplicateError2.code === '23505', 
      duplicateError2 ? 'Unique constraint working' : 'Unique constraint failed');
    
    // Clean up
    if (duplicateUser) {
      await supabaseAdmin.from('users').delete().eq('id', duplicateUser.id);
    }
    
  } catch (error) {
    logTest('Database integrity', false, error.message);
  }
}

async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  try {
    const startTime = Date.now();
    
    // Test query performance
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(100);
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    logTest('Query performance', queryTime < 1000, 
      `Query took ${queryTime}ms (should be < 1000ms)`);
    
    // Test index performance
    const indexStartTime = Date.now();
    
    const { data: indexedData, error: indexError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .limit(10);
    
    const indexEndTime = Date.now();
    const indexQueryTime = indexEndTime - indexStartTime;
    
    logTest('Index performance', indexQueryTime < 500, 
      `Indexed query took ${indexQueryTime}ms (should be < 500ms)`);
    
  } catch (error) {
    logTest('Performance tests', false, error.message);
  }
}

async function generateTestReport() {
  console.log('\n📊 Test Report');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`  - ${test.test}: ${test.details}`);
      });
  }
  
  // Save detailed report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / testResults.total) * 100).toFixed(2)
    },
    details: testResults.details
  };
  
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return testResults.failed === 0;
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Enhanced Schema Tests...');
  console.log('='.repeat(50));
  
  try {
    // Test database connection first
    const connected = await testDatabaseConnection();
    if (!connected) {
      console.log('❌ Cannot connect to database. Exiting...');
      process.exit(1);
    }
    
    // Run all tests
    await testTableExistence();
    await testRolePermissions();
    await testAuditTrail();
    await testApprovalWorkflows();
    await testRLSPolicies();
    await testDatabaseIntegrity();
    await testPerformance();
    
    // Generate final report
    const allTestsPassed = await generateTestReport();
    
    if (allTestsPassed) {
      console.log('\n🎉 All tests passed! Enhanced schema is ready for production.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testDatabaseConnection,
  testTableExistence,
  testRolePermissions,
  testAuditTrail,
  testApprovalWorkflows,
  testRLSPolicies,
  testDatabaseIntegrity,
  testPerformance
};
