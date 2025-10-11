// Test Dashboard Fix
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

console.log('🚀 Testing Dashboard Fix...\n')

async function testMissingTables() {
  console.log('📋 Testing Missing Tables...')
  
  try {
    // Test maintenance_schedule table
    const { data: maintenanceSchedule, error: scheduleError } = await supabase
      .from('maintenance_schedule')
      .select('*')
      .limit(1)
    
    if (scheduleError) {
      console.error('❌ maintenance_schedule table error:', scheduleError.message)
      return false
    }
    
    console.log('✅ maintenance_schedule table accessible')
    
    // Test system_logs table
    const { data: systemLogs, error: logsError } = await supabase
      .from('system_logs')
      .select('*')
      .limit(1)
    
    if (logsError) {
      console.error('❌ system_logs table error:', logsError.message)
      return false
    }
    
    console.log('✅ system_logs table accessible')
    
    return true
  } catch (error) {
    console.error('❌ Missing tables test failed:', error.message)
    return false
  }
}

async function testSchemaConflicts() {
  console.log('\n🔧 Testing Schema Conflicts...')
  
  try {
    // Test documents table with new columns
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, file_name, category, description, tags, version')
      .limit(1)
    
    if (docError) {
      console.error('❌ Documents schema error:', docError.message)
      return false
    }
    
    console.log('✅ Documents table schema fixed')
    
    // Test assets table with new columns
    const { data: assets, error: assetError } = await supabase
      .from('assets')
      .select('id, name, asset_type, serial_number, criticality, status')
      .limit(1)
    
    if (assetError) {
      console.error('❌ Assets schema error:', assetError.message)
      return false
    }
    
    console.log('✅ Assets table schema fixed')
    
    // Test maintenance_logs table with new columns
    const { data: maintenance, error: maintError } = await supabase
      .from('maintenance_logs')
      .select('id, asset_id, priority, work_order_number, description')
      .limit(1)
    
    if (maintError) {
      console.error('❌ Maintenance logs schema error:', maintError.message)
      return false
    }
    
    console.log('✅ Maintenance logs table schema fixed')
    
    return true
  } catch (error) {
    console.error('❌ Schema conflicts test failed:', error.message)
    return false
  }
}

async function testCRUDOperations() {
  console.log('\n📝 Testing CRUD Operations...')
  
  try {
    // Test document creation
    const testDocument = {
      file_name: 'test-document.pdf',
      file_type: 'application/pdf',
      file_size: 1024000,
      category: 'contracts',
      description: 'Test contract document',
      tags: ['test', 'contract'],
      uploaded_by: '55555555-5555-5555-5555-555555555555',
      updated_by: '55555555-5555-5555-5555-555555555555',
      status: 'pending_verification',
      version: 1
    }
    
    const { data: insertedDoc, error: insertError } = await supabase
      .from('documents')
      .insert(testDocument)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Document insert error:', insertError.message)
      return false
    }
    
    console.log('✅ Document created successfully')
    
    // Test asset creation
    const testAsset = {
      name: 'Test Equipment',
      asset_type: 'Equipment',
      serial_number: 'TEST-001',
      criticality: 'medium',
      status: 'active',
      created_by: '55555555-5555-5555-5555-555555555555',
      updated_by: '55555555-5555-5555-5555-555555555555'
    }
    
    const { data: insertedAsset, error: assetError } = await supabase
      .from('assets')
      .insert(testAsset)
      .select()
      .single()
    
    if (assetError) {
      console.error('❌ Asset insert error:', assetError.message)
      return false
    }
    
    console.log('✅ Asset created successfully')
    
    // Test maintenance schedule creation
    const testSchedule = {
      asset_id: insertedAsset.id,
      maintenance_type: 'Preventive',
      scheduled_date: '2024-02-01',
      technician: 'Test Technician',
      status: 'scheduled',
      created_by: '55555555-5555-5555-5555-555555555555'
    }
    
    const { error: scheduleError } = await supabase
      .from('maintenance_schedule')
      .insert(testSchedule)
    
    if (scheduleError) {
      console.error('❌ Maintenance schedule error:', scheduleError.message)
      return false
    }
    
    console.log('✅ Maintenance schedule created successfully')
    
    // Test system log creation
    const testLog = {
      action: 'Test Action',
      user_id: '55555555-5555-5555-5555-555555555555',
      details: 'Test system log entry'
    }
    
    const { error: logError } = await supabase
      .from('system_logs')
      .insert(testLog)
    
    if (logError) {
      console.error('❌ System log error:', logError.message)
      return false
    }
    
    console.log('✅ System log created successfully')
    
    // Clean up test data
    await supabase
      .from('documents')
      .delete()
      .eq('id', insertedDoc.id)
    
    await supabase
      .from('maintenance_schedule')
      .delete()
      .eq('asset_id', insertedAsset.id)
    
    await supabase
      .from('assets')
      .delete()
      .eq('id', insertedAsset.id)
    
    await supabase
      .from('system_logs')
      .delete()
      .eq('details', 'Test system log entry')
    
    console.log('✅ Test data cleaned up')
    
    return true
  } catch (error) {
    console.error('❌ CRUD operations test failed:', error.message)
    return false
  }
}

async function testEnhancedServices() {
  console.log('\n🔧 Testing Enhanced Services...')
  
  try {
    // Test if enhanced services can be imported
    const { enhancedDocumentService, enhancedAssetService, enhancedMaintenanceService } = await import('./src/services/enhancedServices.js')
    
    if (!enhancedDocumentService || !enhancedAssetService || !enhancedMaintenanceService) {
      console.error('❌ Enhanced services not properly exported')
      return false
    }
    
    console.log('✅ Enhanced services properly exported')
    
    // Test document service
    const docStats = await enhancedDocumentService.getStats()
    console.log('✅ Document service working:', { total: docStats.total })
    
    // Test asset service
    const assets = await enhancedAssetService.getAll()
    console.log('✅ Asset service working:', { count: assets.length })
    
    // Test maintenance service
    const maintStats = await enhancedMaintenanceService.getStats()
    console.log('✅ Maintenance service working:', { totalAssets: maintStats.totalAssets })
    
    return true
  } catch (error) {
    console.error('❌ Enhanced services test failed:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🎯 Starting Dashboard Fix Test Suite...\n')
  
  const tests = [
    { name: 'Missing Tables', fn: testMissingTables },
    { name: 'Schema Conflicts', fn: testSchemaConflicts },
    { name: 'CRUD Operations', fn: testCRUDOperations },
    { name: 'Enhanced Services', fn: testEnhancedServices }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error.message)
      failed++
    }
  }
  
  console.log('\n📋 Test Results Summary:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📊 Total: ${passed + failed}`)
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Dashboard fix is complete.')
    console.log('\n📋 Next Steps:')
    console.log('1. Run fix-missing-tables.sql in Supabase SQL Editor')
    console.log('2. Hard refresh your browser (Ctrl+Shift+R)')
    console.log('3. Test the enhanced dashboards in your application')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.')
  }
}

// Run the tests
runAllTests().catch(console.error)
