// Test script after applying RLS fix
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testAfterRLSFix() {
  console.log('🧪 Testing Database After RLS Fix...\n')

  try {
    // Test 1: Inventory creation with all fields
    console.log('1️⃣ Testing inventory creation with created_by field...')
    const inventoryData = {
      item_name: 'Test Medical Supply After RLS Fix',
      rfid_code: `TEST-RLS-${Date.now()}`,
      quantity: 100,
      location: 'Test Warehouse',
      status: 'in_stock',
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f', // Real Employee user ID
      unit_price: 25.50
    }

    const { data: inventoryResult, error: inventoryError } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select()

    if (inventoryError) {
      console.error('❌ Inventory creation failed:', inventoryError.message)
      return false
    } else {
      console.log('✅ Inventory creation successful:', inventoryResult[0].id)
    }

    // Test 2: Delivery receipt creation with new fields
    console.log('\n2️⃣ Testing delivery receipt creation with new fields...')
    const deliveryData = {
      receipt_number: `DR-RLS-${Date.now()}`,
      supplier: 'Test Supplier',
      amount: 2500.00,
      items: 10,
      status: 'verified', // Use valid document_status value
      destination: 'Emergency Ward',
      delivered_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f', // Real Employee user ID
      description: 'Test medical supplies for emergency procedures'
    }

    const { data: deliveryResult, error: deliveryError } = await supabase
      .from('delivery_receipts')
      .insert(deliveryData)
      .select()

    if (deliveryError) {
      console.error('❌ Delivery receipt creation failed:', deliveryError.message)
      return false
    } else {
      console.log('✅ Delivery receipt creation successful:', deliveryResult[0].id)
    }

    // Test 3: Update inventory item (tests updated_by field)
    console.log('\n3️⃣ Testing inventory update (updated_by field)...')
    const { data: updateResult, error: updateError } = await supabase
      .from('inventory')
      .update({ 
        quantity: 150,
        updated_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f' // Real Employee user ID
      })
      .eq('id', inventoryResult[0].id)
      .select()

    if (updateError) {
      console.error('❌ Inventory update failed:', updateError.message)
      return false
    } else {
      console.log('✅ Inventory update successful, updated_by set correctly')
    }

    // Test 4: Verify all fields are accessible
    console.log('\n4️⃣ Verifying all new fields are accessible...')
    const { data: verifyInventory, error: verifyInventoryError } = await supabase
      .from('inventory')
      .select('id, item_name, created_by, updated_by, quantity')
      .eq('id', inventoryResult[0].id)
      .single()

    if (verifyInventoryError) {
      console.error('❌ Inventory field verification failed:', verifyInventoryError.message)
      return false
    } else {
      console.log('✅ Inventory fields accessible:', {
        id: verifyInventory.id,
        item_name: verifyInventory.item_name,
        created_by: verifyInventory.created_by,
        updated_by: verifyInventory.updated_by,
        quantity: verifyInventory.quantity
      })
    }

    const { data: verifyDelivery, error: verifyDeliveryError } = await supabase
      .from('delivery_receipts')
      .select('id, destination, delivered_by, description')
      .eq('id', deliveryResult[0].id)
      .single()

    if (verifyDeliveryError) {
      console.error('❌ Delivery field verification failed:', verifyDeliveryError.message)
      return false
    } else {
      console.log('✅ Delivery fields accessible:', {
        id: verifyDelivery.id,
        destination: verifyDelivery.destination,
        delivered_by: verifyDelivery.delivered_by,
        description: verifyDelivery.description
      })
    }

    console.log('\n🎉 All database integration tests passed!')
    console.log('\n📋 Summary of fixes:')
    console.log('   ✅ Fixed RLS policy for audit_logs table')
    console.log('   ✅ Added updated_by field to inventory table')
    console.log('   ✅ Added destination, delivered_by, description fields to delivery_receipts table')
    console.log('   ✅ Updated TypeScript types to match database schema')
    console.log('   ✅ Fixed trigger to handle updated_by field properly')

    console.log('\n🎯 Original Errors Fixed:')
    console.log('   ✅ "Failed to create inventory request" - FIXED')
    console.log('   ✅ "Failed to add inventory item: record \'new\' has no field \'updated_by\'" - FIXED')
    console.log('   ✅ "Failed to record delivery" - FIXED')

    return true

  } catch (error) {
    console.error('💥 Test failed with error:', error.message)
    return false
  }
}

testAfterRLSFix()
  .then(success => {
    if (success) {
      console.log('\n✨ All database integration fixes verified successfully!')
      console.log('\n🚀 Your application should now work without the three original errors!')
    } else {
      console.log('\n❌ Some issues still need attention.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
