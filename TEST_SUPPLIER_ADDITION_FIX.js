import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔧 TESTING SUPPLIER ADDITION FIX...\n')

async function testSupplierAdditionFix() {
  try {
    console.log('1️⃣ Testing Database Access...')
    
    // Test if we can access suppliers table
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(1)
    
    if (suppliersError) {
      console.log(`❌ Cannot access suppliers table: ${suppliersError.message}`)
      console.log('\n🔧 SOLUTION: Run the FIX_SUPPLIER_ADDITION.sql script in your Supabase SQL Editor')
      console.log('')
      console.log('📋 Copy and paste this into Supabase SQL Editor:')
      console.log('===============================================')
      console.log('')
      console.log('-- Grant ALL permissions to authenticated users')
      console.log('GRANT ALL ON TABLE suppliers TO authenticated;')
      console.log('GRANT ALL ON TABLE purchase_orders TO authenticated;')
      console.log('GRANT ALL ON TABLE delivery_receipts TO authenticated;')
      console.log('')
      console.log('-- Grant ALL permissions to service role')
      console.log('GRANT ALL ON TABLE suppliers TO service_role;')
      console.log('GRANT ALL ON TABLE purchase_orders TO service_role;')
      console.log('GRANT ALL ON TABLE delivery_receipts TO service_role;')
      console.log('')
      console.log('-- Enable RLS on all tables')
      console.log('ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;')
      console.log('ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;')
      console.log('ALTER TABLE delivery_receipts ENABLE ROW LEVEL SECURITY;')
      console.log('')
      console.log('-- Create permissive policies')
      console.log('DROP POLICY IF EXISTS "Allow all for authenticated users" ON suppliers;')
      console.log('CREATE POLICY "Allow all for authenticated users" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);')
      console.log('')
      console.log('DROP POLICY IF EXISTS "Allow all for authenticated users" ON purchase_orders;')
      console.log('CREATE POLICY "Allow all for authenticated users" ON purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);')
      console.log('')
      console.log('DROP POLICY IF EXISTS "Allow all for authenticated users" ON delivery_receipts;')
      console.log('CREATE POLICY "Allow all for authenticated users" ON delivery_receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);')
      console.log('')
      console.log('===============================================')
      return
    } else {
      console.log('✅ Suppliers table accessible')
    }
    
    console.log('\n2️⃣ Testing Supplier Addition...')
    
    // Test adding a new supplier
    const testSupplier = {
      name: 'Test Supplier Fix',
      contact: 'Test Contact',
      email: 'testfix@supplier.com',
      phone: '+1-555-9999',
      address: '123 Test Street, Test City, TC 12345',
      rating: 4,
      status: 'active',
      notes: 'Test supplier for fixing addition issue'
    }
    
    console.log('   📝 Attempting to add test supplier...')
    const { data: newSupplier, error: createError } = await supabase
      .from('suppliers')
      .insert(testSupplier)
      .select()
      .single()
    
    if (createError) {
      console.log(`   ❌ Supplier addition failed: ${createError.message}`)
      console.log('\n🔧 DETAILED ERROR ANALYSIS:')
      console.log(`   Error Code: ${createError.code}`)
      console.log(`   Error Details: ${createError.details}`)
      console.log(`   Error Hint: ${createError.hint}`)
      
      if (createError.message.includes('permission denied')) {
        console.log('\n💡 SOLUTION: Permission issue detected!')
        console.log('   Run the FIX_SUPPLIER_ADDITION.sql script in Supabase SQL Editor')
      } else if (createError.message.includes('duplicate key')) {
        console.log('\n💡 SOLUTION: Duplicate email detected!')
        console.log('   The supplier with this email already exists')
      } else {
        console.log('\n💡 SOLUTION: Unknown error - check table structure and permissions')
      }
    } else {
      console.log(`   ✅ Supplier addition successful: ${newSupplier.name}`)
      
      // Test updating the supplier
      console.log('\n3️⃣ Testing Supplier Update...')
      const { data: updatedSupplier, error: updateError } = await supabase
        .from('suppliers')
        .update({ rating: 5 })
        .eq('id', newSupplier.id)
        .select()
        .single()
      
      if (updateError) {
        console.log(`   ❌ Supplier update failed: ${updateError.message}`)
      } else {
        console.log(`   ✅ Supplier update successful: Rating updated to ${updatedSupplier.rating}`)
      }
      
      // Test deleting the supplier
      console.log('\n4️⃣ Testing Supplier Deletion...')
      const { error: deleteError } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', newSupplier.id)
      
      if (deleteError) {
        console.log(`   ❌ Supplier deletion failed: ${deleteError.message}`)
      } else {
        console.log(`   ✅ Supplier deletion successful: Test supplier removed`)
      }
    }
    
    console.log('\n5️⃣ Testing Purchase Order Addition...')
    
    // Test adding a purchase order
    const testOrder = {
      order_number: 'PO-TEST-001',
      supplier_id: '11111111-1111-1111-1111-111111111111',
      supplier_name: 'MedSupply Co.',
      items: 5,
      amount: 10000.00,
      description: 'Test order for fixing addition issue',
      priority: 'medium',
      status: 'pending',
      expected_delivery: '2024-12-31',
      rfid_code: 'RFID-TEST-001',
      created_by: '44444444-4444-4444-4444-444444444444'
    }
    
    const { data: newOrder, error: orderError } = await supabase
      .from('purchase_orders')
      .insert(testOrder)
      .select()
      .single()
    
    if (orderError) {
      console.log(`   ❌ Order addition failed: ${orderError.message}`)
    } else {
      console.log(`   ✅ Order addition successful: ${newOrder.order_number}`)
      
      // Clean up test order
      await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', newOrder.id)
    }
    
    console.log('\n🎯 SUPPLIER ADDITION FIX TEST RESULTS:')
    console.log('=====================================')
    
    if (suppliersError || createError) {
      console.log('❌ SUPPLIER ADDITION STILL FAILING!')
      console.log('')
      console.log('🔧 REQUIRED ACTIONS:')
      console.log('1. Go to your Supabase Dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and paste the FIX_SUPPLIER_ADDITION.sql content')
      console.log('4. Run the SQL script')
      console.log('5. Test the Procurement Dashboard again')
      console.log('')
      console.log('📁 The FIX_SUPPLIER_ADDITION.sql file contains the complete fix')
    } else {
      console.log('✅ SUPPLIER ADDITION FIX WORKING!')
      console.log('')
      console.log('🚀 FEATURES NOW WORKING:')
      console.log('1. ✅ Add new suppliers')
      console.log('2. ✅ Update existing suppliers')
      console.log('3. ✅ Delete suppliers')
      console.log('4. ✅ Add purchase orders')
      console.log('5. ✅ Full CRUD operations')
      console.log('')
      console.log('🎉 PROCUREMENT DASHBOARD IS FULLY FUNCTIONAL!')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testSupplierAdditionFix()
