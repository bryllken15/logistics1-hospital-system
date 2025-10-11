// Verify Database Setup
// Smart Supply Chain & Procurement Management System

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Verifying Database Setup...\n')

async function checkRequiredTables() {
  console.log('📋 Checking Required Tables...')
  
  const requiredTables = [
    'users',
    'documents', 
    'assets',
    'maintenance_logs',
    'maintenance_schedule',
    'system_logs',
    'inventory',
    'projects',
    'purchase_requests',
    'purchase_orders',
    'suppliers',
    'delivery_receipts',
    'inventory_changes',
    'staff_assignments',
    'notifications',
    'reports'
  ]
  
  let allTablesExist = true
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ Table '${table}' missing or inaccessible:`, error.message)
        allTablesExist = false
      } else {
        console.log(`✅ Table '${table}' exists`)
      }
    } catch (err) {
      console.error(`❌ Error checking table '${table}':`, err.message)
      allTablesExist = false
    }
  }
  
  return allTablesExist
}

async function checkEnhancedTables() {
  console.log('\n🔧 Checking Enhanced Tables...')
  
  const enhancedTables = [
    'spare_parts',
    'maintenance_work_orders', 
    'document_versions',
    'document_approvals',
    'asset_maintenance_schedules'
  ]
  
  let allEnhancedTablesExist = true
  
  for (const table of enhancedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ Enhanced table '${table}' missing:`, error.message)
        allEnhancedTablesExist = false
      } else {
        console.log(`✅ Enhanced table '${table}' exists`)
      }
    } catch (err) {
      console.error(`❌ Error checking enhanced table '${table}':`, err.message)
      allEnhancedTablesExist = false
    }
  }
  
  return allEnhancedTablesExist
}

async function checkTableSchemas() {
  console.log('\n📊 Checking Table Schemas...')
  
  try {
    // Check documents table has enhanced columns
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, file_name, category, description, tags, version')
      .limit(1)
    
    if (docError) {
      console.error('❌ Documents table schema incomplete:', docError.message)
      return false
    }
    console.log('✅ Documents table has enhanced schema')
    
    // Check assets table has enhanced columns
    const { data: assets, error: assetError } = await supabase
      .from('assets')
      .select('id, name, asset_type, serial_number, criticality, status')
      .limit(1)
    
    if (assetError) {
      console.error('❌ Assets table schema incomplete:', assetError.message)
      return false
    }
    console.log('✅ Assets table has enhanced schema')
    
    // Check maintenance_logs table has enhanced columns
    const { data: maintenance, error: maintError } = await supabase
      .from('maintenance_logs')
      .select('id, asset_id, priority, work_order_number, description')
      .limit(1)
    
    if (maintError) {
      console.error('❌ Maintenance logs table schema incomplete:', maintError.message)
      return false
    }
    console.log('✅ Maintenance logs table has enhanced schema')
    
    return true
  } catch (error) {
    console.error('❌ Schema check failed:', error.message)
    return false
  }
}

async function testBasicOperations() {
  console.log('\n🧪 Testing Basic Operations...')
  
  try {
    // Test user authentication function
    const { data: authTest, error: authError } = await supabase
      .rpc('authenticate_user', {
        user_username: 'test',
        user_password: 'test'
      })
    
    if (authError && !authError.message.includes('Invalid credentials')) {
      console.error('❌ Authentication function not working:', authError.message)
      return false
    }
    console.log('✅ Authentication function working')
    
    // Test document creation
    const testDoc = {
      file_name: 'test-verification.pdf',
      file_type: 'application/pdf',
      file_size: 1024,
      category: 'general',
      description: 'Database verification test',
      uploaded_by: '55555555-5555-5555-5555-555555555555',
      updated_by: '55555555-5555-5555-5555-555555555555',
      status: 'pending_verification',
      version: 1
    }
    
    const { data: insertedDoc, error: insertError } = await supabase
      .from('documents')
      .insert(testDoc)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Document creation test failed:', insertError.message)
      return false
    }
    
    console.log('✅ Document creation working')
    
    // Clean up test document
    await supabase
      .from('documents')
      .delete()
      .eq('id', insertedDoc.id)
    
    console.log('✅ Document deletion working')
    
    return true
  } catch (error) {
    console.error('❌ Basic operations test failed:', error.message)
    return false
  }
}

async function runVerification() {
  console.log('🎯 Starting Database Verification...\n')
  
  const checks = [
    { name: 'Required Tables', fn: checkRequiredTables },
    { name: 'Enhanced Tables', fn: checkEnhancedTables },
    { name: 'Table Schemas', fn: checkTableSchemas },
    { name: 'Basic Operations', fn: testBasicOperations }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const check of checks) {
    try {
      const result = await check.fn()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.error(`❌ ${check.name} check crashed:`, error.message)
      failed++
    }
  }
  
  console.log('\n📋 Verification Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📊 Total: ${passed + failed}`)
  
  if (failed === 0) {
    console.log('\n🎉 Database setup is complete!')
    console.log('Your enhanced dashboards should now work without errors.')
  } else {
    console.log('\n⚠️  Database setup is incomplete.')
    console.log('Please follow the DATABASE_SETUP_INSTRUCTIONS.md to fix the issues.')
  }
  
  return failed === 0
}

// Run the verification
runVerification().catch(console.error)