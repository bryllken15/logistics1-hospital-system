// Test Enhanced Dashboards Functionality
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

console.log('🚀 Testing Enhanced Dashboards Functionality...\n')

async function testDatabaseSchema() {
  console.log('📋 Testing Database Schema...')
  
  try {
    // Test documents table enhancements
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (docError) {
      console.error('❌ Documents table error:', docError.message)
      return false
    }
    
    console.log('✅ Documents table accessible')
    
    // Test assets table enhancements
    const { data: assets, error: assetError } = await supabase
      .from('assets')
      .select('*')
      .limit(1)
    
    if (assetError) {
      console.error('❌ Assets table error:', assetError.message)
      return false
    }
    
    console.log('✅ Assets table accessible')
    
    // Test maintenance_logs table enhancements
    const { data: maintenance, error: maintError } = await supabase
      .from('maintenance_logs')
      .select('*')
      .limit(1)
    
    if (maintError) {
      console.error('❌ Maintenance logs table error:', maintError.message)
      return false
    }
    
    console.log('✅ Maintenance logs table accessible')
    
    // Test new tables
    const newTables = [
      'spare_parts',
      'maintenance_work_orders',
      'document_versions',
      'document_approvals',
      'asset_maintenance_schedules'
    ]
    
    for (const table of newTables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ ${table} table error:`, error.message)
        return false
      }
      
      console.log(`✅ ${table} table accessible`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Schema test failed:', error.message)
    return false
  }
}

async function testDocumentOperations() {
  console.log('\n📄 Testing Document Operations...')
  
  try {
    // Test document upload simulation
    const testDocument = {
      file_name: 'test-document.pdf',
      file_type: 'application/pdf',
      file_size: 1024000,
      category: 'contracts',
      description: 'Test contract document',
      tags: ['test', 'contract', 'important'],
      expiration_date: '2025-12-31',
      related_entity_type: 'project',
      related_entity_id: 'test-project-id',
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
    
    // Test document update
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        status: 'verified',
        approved_by: '55555555-5555-5555-5555-555555555555',
        approved_at: new Date().toISOString()
      })
      .eq('id', insertedDoc.id)
    
    if (updateError) {
      console.error('❌ Document update error:', updateError.message)
      return false
    }
    
    console.log('✅ Document updated successfully')
    
    // Test document version creation
    const { error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: insertedDoc.id,
        version_number: 2,
        uploaded_by: '55555555-5555-5555-5555-555555555555',
        change_notes: 'Updated contract terms'
      })
    
    if (versionError) {
      console.error('❌ Document version error:', versionError.message)
      return false
    }
    
    console.log('✅ Document version created successfully')
    
    // Clean up test document
    await supabase
      .from('documents')
      .delete()
      .eq('id', insertedDoc.id)
    
    console.log('✅ Test document cleaned up')
    
    return true
  } catch (error) {
    console.error('❌ Document operations test failed:', error.message)
    return false
  }
}

async function testAssetOperations() {
  console.log('\n🔧 Testing Asset Operations...')
  
  try {
    // Test asset creation
    const testAsset = {
      name: 'Test Equipment',
      asset_type: 'Equipment',
      serial_number: 'TEST-001',
      manufacturer: 'Test Manufacturer',
      model: 'Test Model',
      purchase_date: '2024-01-01',
      purchase_cost: 10000,
      warranty_expiry: '2026-01-01',
      criticality: 'medium',
      status: 'active',
      location: 'Test Location',
      created_by: '55555555-5555-5555-5555-555555555555',
      updated_by: '55555555-5555-5555-5555-555555555555',
      operating_hours: 0,
      service_interval_days: 90
    }
    
    const { data: insertedAsset, error: insertError } = await supabase
      .from('assets')
      .insert(testAsset)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Asset insert error:', insertError.message)
      return false
    }
    
    console.log('✅ Asset created successfully')
    
    // Test maintenance log creation
    const testMaintenance = {
      asset_id: insertedAsset.id,
      maintenance_type: 'Preventive',
      description: 'Monthly maintenance check',
      priority: 'medium',
      status: 'scheduled',
      scheduled_date: '2024-02-01',
      estimated_cost: 500,
      created_by: '55555555-5555-5555-5555-555555555555',
      updated_by: '55555555-5555-5555-5555-555555555555'
    }
    
    const { error: maintError } = await supabase
      .from('maintenance_logs')
      .insert(testMaintenance)
    
    if (maintError) {
      console.error('❌ Maintenance log error:', maintError.message)
      return false
    }
    
    console.log('✅ Maintenance log created successfully')
    
    // Test work order creation
    const testWorkOrder = {
      work_order_number: `WO-${Date.now()}`,
      asset_id: insertedAsset.id,
      title: 'Test Work Order',
      description: 'Test work order for equipment',
      priority: 'medium',
      status: 'open',
      created_by: '55555555-5555-5555-5555-555555555555',
      updated_by: '55555555-5555-5555-5555-555555555555',
      estimated_cost: 1000,
      estimated_hours: 8
    }
    
    const { error: woError } = await supabase
      .from('maintenance_work_orders')
      .insert(testWorkOrder)
    
    if (woError) {
      console.error('❌ Work order error:', woError.message)
      return false
    }
    
    console.log('✅ Work order created successfully')
    
    // Test spare part creation
    const testPart = {
      part_name: 'Test Spare Part',
      part_number: 'SP-001',
      category: 'Electrical',
      quantity: 10,
      minimum_quantity: 5,
      unit_cost: 50,
      supplier: 'Test Supplier',
      location: 'Warehouse A',
      created_by: '55555555-5555-5555-5555-555555555555',
      updated_by: '55555555-5555-5555-5555-555555555555'
    }
    
    const { error: partError } = await supabase
      .from('spare_parts')
      .insert(testPart)
    
    if (partError) {
      console.error('❌ Spare part error:', partError.message)
      return false
    }
    
    console.log('✅ Spare part created successfully')
    
    // Clean up test data
    await supabase
      .from('maintenance_work_orders')
      .delete()
      .eq('asset_id', insertedAsset.id)
    
    await supabase
      .from('maintenance_logs')
      .delete()
      .eq('asset_id', insertedAsset.id)
    
    await supabase
      .from('assets')
      .delete()
      .eq('id', insertedAsset.id)
    
    await supabase
      .from('spare_parts')
      .delete()
      .eq('part_number', 'SP-001')
    
    console.log('✅ Test data cleaned up')
    
    return true
  } catch (error) {
    console.error('❌ Asset operations test failed:', error.message)
    return false
  }
}

async function testAnalytics() {
  console.log('\n📊 Testing Analytics...')
  
  try {
    // Test document stats
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('status, category, file_size, expiration_date, created_at')
    
    if (docError) {
      console.error('❌ Document stats error:', docError.message)
      return false
    }
    
    const docStats = {
      total: documents.length,
      pending: documents.filter(d => d.status === 'pending_verification').length,
      verified: documents.filter(d => d.status === 'verified').length,
      archived: documents.filter(d => d.status === 'archived').length
    }
    
    console.log('✅ Document stats calculated:', docStats)
    
    // Test maintenance stats
    const { data: maintenance, error: maintError } = await supabase
      .from('maintenance_logs')
      .select('status, priority, cost, created_at')
    
    if (maintError) {
      console.error('❌ Maintenance stats error:', maintError.message)
      return false
    }
    
    const maintStats = {
      total: maintenance.length,
      completed: maintenance.filter(m => m.status === 'completed').length,
      scheduled: maintenance.filter(m => m.status === 'scheduled').length,
      totalCost: maintenance.reduce((sum, m) => sum + (m.cost || 0), 0)
    }
    
    console.log('✅ Maintenance stats calculated:', maintStats)
    
    return true
  } catch (error) {
    console.error('❌ Analytics test failed:', error.message)
    return false
  }
}

async function testRealTimeSubscriptions() {
  console.log('\n🔄 Testing Real-time Subscriptions...')
  
  try {
    // Test document subscription
    const docChannel = supabase
      .channel('test_document_updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'documents' },
        (payload) => {
          console.log('✅ Document subscription working:', payload.new.file_name)
        }
      )
      .subscribe()
    
    // Test asset subscription
    const assetChannel = supabase
      .channel('test_asset_updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'assets' },
        (payload) => {
          console.log('✅ Asset subscription working:', payload.new.name)
        }
      )
      .subscribe()
    
    // Test maintenance subscription
    const maintChannel = supabase
      .channel('test_maintenance_updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'maintenance_logs' },
        (payload) => {
          console.log('✅ Maintenance subscription working:', payload.new.maintenance_type)
        }
      )
      .subscribe()
    
    console.log('✅ Real-time subscriptions set up successfully')
    
    // Clean up subscriptions
    setTimeout(() => {
      docChannel.unsubscribe()
      assetChannel.unsubscribe()
      maintChannel.unsubscribe()
      console.log('✅ Subscriptions cleaned up')
    }, 5000)
    
    return true
  } catch (error) {
    console.error('❌ Real-time subscriptions test failed:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🎯 Starting Enhanced Dashboards Test Suite...\n')
  
  const tests = [
    { name: 'Database Schema', fn: testDatabaseSchema },
    { name: 'Document Operations', fn: testDocumentOperations },
    { name: 'Asset Operations', fn: testAssetOperations },
    { name: 'Analytics', fn: testAnalytics },
    { name: 'Real-time Subscriptions', fn: testRealTimeSubscriptions }
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
    console.log('\n🎉 All tests passed! Enhanced dashboards are ready to use.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.')
  }
}

// Run the tests
runAllTests().catch(console.error)
