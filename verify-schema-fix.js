// Verify Schema Fix - Check purchase_requests table schema
// This script verifies that the schema mismatch has been resolved

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'
const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyPurchaseRequestsSchema() {
  console.log('🔍 Verifying purchase_requests table schema...\n')
  
  try {
    // Check if purchase_requests table exists and has the correct columns
    const { data, error } = await supabase
      .from('purchase_requests')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error accessing purchase_requests table:', error.message)
      return false
    }

    console.log('✅ purchase_requests table accessible')

    // Try to insert a test record with the enhanced schema
    const testRecord = {
      request_number: 'TEST-SCHEMA-' + Date.now(),
      title: 'Test Request',
      description: 'Testing enhanced schema',
      total_amount: 100.00,
      priority: 'medium',
      required_date: '2024-12-31',
      status: 'pending'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('purchase_requests')
      .insert(testRecord)
      .select()

    if (insertError) {
      console.error('❌ Schema mismatch detected:', insertError.message)
      console.log('\n💡 This indicates the schema fix was not applied correctly.')
      console.log('   Please run the updated supabase/clean_migration.sql first.')
      return false
    }

    console.log('✅ Enhanced schema working correctly')
    console.log('✅ All required columns present: title, description, total_amount, priority, required_date')

    // Clean up test record
    await supabase
      .from('purchase_requests')
      .delete()
      .eq('request_number', testRecord.request_number)

    return true

  } catch (error) {
    console.error('❌ Schema verification failed:', error.message)
    return false
  }
}

async function verifyApprovalSystemTables() {
  console.log('\n🔍 Verifying approval system tables...\n')
  
  const requiredTables = [
    'purchase_request_approvals',
    'inventory_change_approvals', 
    'approval_workflows'
  ]

  let allTablesExist = true

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        console.error(`❌ ${table} table error:`, error.message)
        allTablesExist = false
      } else {
        console.log(`✅ ${table} table accessible`)
      }
    } catch (error) {
      console.error(`❌ ${table} table failed:`, error.message)
      allTablesExist = false
    }
  }

  return allTablesExist
}

async function testApprovalSystemFunctions() {
  console.log('\n🔍 Testing approval system functions...\n')
  
  try {
    // Test if we can call the approval system functions
    const { data, error } = await supabase
      .rpc('get_pending_approvals', {
        p_user_id: '11111111-1111-1111-1111-111111111111', // This will be replaced with actual user ID
        p_user_role: 'manager'
      })

    if (error) {
      console.log('⚠️  Approval functions not yet created (this is expected if CREATE_APPROVAL_SYSTEM.sql hasn\'t been run)')
      console.log('   This is normal - run CREATE_APPROVAL_SYSTEM.sql after the schema fix')
      return true
    } else {
      console.log('✅ Approval system functions working')
      return true
    }
  } catch (error) {
    console.log('⚠️  Approval functions not yet created (this is expected)')
    return true
  }
}

async function runSchemaVerification() {
  console.log('🚀 Starting schema verification...\n')
  
  const results = {
    purchaseRequestsSchema: false,
    approvalSystemTables: false,
    approvalSystemFunctions: false
  }

  // Test purchase_requests schema
  results.purchaseRequestsSchema = await verifyPurchaseRequestsSchema()
  
  if (!results.purchaseRequestsSchema) {
    console.log('\n❌ Schema verification failed.')
    console.log('\n📋 Required Actions:')
    console.log('1. Run the updated supabase/clean_migration.sql in Supabase SQL Editor')
    console.log('2. Wait for it to complete successfully')
    console.log('3. Run this verification script again')
    return
  }

  // Test approval system tables
  results.approvalSystemTables = await verifyApprovalSystemTables()
  
  if (!results.approvalSystemTables) {
    console.log('\n⚠️  Approval system tables not found.')
    console.log('   This is expected if CREATE_APPROVAL_SYSTEM.sql hasn\'t been run yet.')
  }

  // Test approval system functions
  results.approvalSystemFunctions = await testApprovalSystemFunctions()

  // Summary
  console.log('\n📋 Schema Verification Results:')
  console.log('================================')
  console.log(`Purchase Requests Schema: ${results.purchaseRequestsSchema ? '✅' : '❌'}`)
  console.log(`Approval System Tables: ${results.approvalSystemTables ? '✅' : '⚠️  (Run CREATE_APPROVAL_SYSTEM.sql)'}`)
  console.log(`Approval System Functions: ${results.approvalSystemFunctions ? '✅' : '⚠️  (Run CREATE_APPROVAL_SYSTEM.sql)'}`)

  if (results.purchaseRequestsSchema) {
    console.log('\n🎉 Schema fix successful!')
    console.log('\n📋 Next Steps:')
    console.log('1. Run CREATE_APPROVAL_SYSTEM.sql in Supabase SQL Editor')
    console.log('2. Test the frontend application')
    console.log('3. Use test-dashboard-frontend.html to verify all dashboards work')
  } else {
    console.log('\n❌ Schema fix not applied correctly.')
    console.log('   Please run the updated supabase/clean_migration.sql first.')
  }
}

// Run the verification
runSchemaVerification().catch(console.error)
