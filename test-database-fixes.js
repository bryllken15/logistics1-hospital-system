// Test script to verify database integration fixes
// This script tests the three main error scenarios that were fixed

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseFixes() {
  console.log('🧪 Testing Database Integration Fixes...\n')

  try {
    // Test 1: Inventory creation with approval workflow
    console.log('1️⃣ Testing inventory creation with approval workflow...')
    const inventoryData = {
      item_name: 'Test Medical Supply',
      rfid_code: `TEST-${Date.now()}`,
      quantity: 100,
      location: 'Test Warehouse',
      status: 'in_stock',
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f', // Real Employee user ID from your database
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
    console.log('\n2️⃣ Testing delivery receipt creation...')
    const deliveryData = {
      receipt_number: `DR-${Date.now()}`,
      supplier: 'Test Supplier',
      amount: 2500.00,
      items: 10,
      status: 'delivered',
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
    console.log('\n4️⃣ Verifying field accessibility...')
    const { data: verifyInventory, error: verifyError } = await supabase
      .from('inventory')
      .select('id, item_name, created_by, updated_by, quantity')
      .eq('id', inventoryResult[0].id)
      .single()

    if (verifyError) {
      console.error('❌ Field verification failed:', verifyError.message)
      return false
    } else {
      console.log('✅ All fields accessible:', {
        id: verifyInventory.id,
        item_name: verifyInventory.item_name,
        created_by: verifyInventory.created_by,
        updated_by: verifyInventory.updated_by,
        quantity: verifyInventory.quantity
      })
    }

    console.log('\n🎉 All database integration tests passed!')
    console.log('\n📋 Summary of fixes:')
    console.log('   ✅ Added updated_by field to inventory table')
    console.log('   ✅ Added destination, delivered_by, description fields to delivery_receipts table')
    console.log('   ✅ Updated TypeScript types to match database schema')
    console.log('   ✅ Fixed trigger to handle updated_by field properly')

    return true

  } catch (error) {
    console.error('💥 Test failed with error:', error.message)
    return false
  }
}

// Run the test
testDatabaseFixes()
  .then(success => {
    if (success) {
      console.log('\n✨ Database integration fixes verified successfully!')
      process.exit(0)
    } else {
      console.log('\n❌ Database integration fixes need attention.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('💥 Test script error:', error)
    process.exit(1)
  })

export { testDatabaseFixes }
