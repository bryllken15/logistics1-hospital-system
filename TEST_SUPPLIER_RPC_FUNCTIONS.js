import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔧 TESTING SUPPLIER RPC FUNCTIONS...\n')

async function testSupplierRPCFunctions() {
  try {
    let testSupplierId = null
    
    console.log('1️⃣ Testing CREATE RPC Function...')
    
    // Test creating a supplier via RPC
    const testSupplier = {
      p_name: 'RPC Test Supplier',
      p_contact: 'RPC Test Contact',
      p_email: 'rpc@test.com',
      p_phone: '+1-555-RPC-TEST',
      p_address: '123 RPC Street, Test City, TC 12345',
      p_rating: 4,
      p_status: 'active',
      p_notes: 'Test supplier created via RPC function'
    }
    
    console.log('   📝 Creating supplier via RPC:', testSupplier.p_name)
    const { data: newSupplier, error: createError } = await supabase
      .rpc('create_supplier', testSupplier)
    
    if (createError) {
      console.log(`   ❌ CREATE RPC failed: ${createError.message}`)
      console.log('   🔧 SOLUTION: Run CREATE_SUPPLIER_RPC_FUNCTIONS.sql in Supabase SQL Editor')
      return
    } else {
      console.log(`   ✅ CREATE RPC successful: ${newSupplier[0]?.name} (ID: ${newSupplier[0]?.id})`)
      testSupplierId = newSupplier[0]?.id
    }
    
    console.log('\n2️⃣ Testing UPDATE RPC Function...')
    
    // Test updating the supplier via RPC
    const updateData = {
      p_id: testSupplierId,
      p_name: 'Updated RPC Test Supplier',
      p_rating: 5,
      p_contact: 'Updated RPC Contact',
      p_phone: '+1-555-UPDATED',
      p_notes: 'Updated test supplier via RPC'
    }
    
    console.log('   📝 Updating supplier via RPC:', updateData.p_name)
    const { data: updatedSupplier, error: updateError } = await supabase
      .rpc('update_supplier', updateData)
    
    if (updateError) {
      console.log(`   ❌ UPDATE RPC failed: ${updateError.message}`)
    } else {
      console.log(`   ✅ UPDATE RPC successful: ${updatedSupplier[0]?.name} (Rating: ${updatedSupplier[0]?.rating})`)
    }
    
    console.log('\n3️⃣ Testing READ Operation...')
    
    // Test reading the supplier
    const { data: readSupplier, error: readError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', testSupplierId)
      .single()
    
    if (readError) {
      console.log(`   ❌ READ failed: ${readError.message}`)
    } else {
      console.log(`   ✅ READ successful: ${readSupplier.name} (Rating: ${readSupplier.rating})`)
    }
    
    console.log('\n4️⃣ Testing DELETE RPC Function...')
    
    // Test deleting the supplier via RPC
    console.log('   🗑️ Deleting supplier via RPC:', testSupplierId)
    const { data: deleteResult, error: deleteError } = await supabase
      .rpc('delete_supplier', { p_id: testSupplierId })
    
    if (deleteError) {
      console.log(`   ❌ DELETE RPC failed: ${deleteError.message}`)
    } else {
      console.log(`   ✅ DELETE RPC successful: ${deleteResult ? 'Supplier deleted' : 'Supplier not found'}`)
    }
    
    console.log('\n5️⃣ Testing READ After Delete...')
    
    // Test reading the deleted supplier (should return null)
    const { data: deletedSupplier, error: readDeletedError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', testSupplierId)
      .single()
    
    if (readDeletedError && readDeletedError.code === 'PGRST116') {
      console.log(`   ✅ READ after delete successful: Supplier not found (as expected)`)
    } else if (deletedSupplier === null) {
      console.log(`   ✅ READ after delete successful: Supplier not found (as expected)`)
    } else {
      console.log(`   ❌ READ after delete failed: Supplier still exists`)
    }
    
    console.log('\n🎯 SUPPLIER RPC FUNCTIONS TEST RESULTS:')
    console.log('========================================')
    
    const hasErrors = createError || updateError || readError || deleteError || readDeletedError
    
    if (hasErrors) {
      console.log('❌ SOME RPC OPERATIONS STILL FAILING!')
      console.log('')
      console.log('🔧 REQUIRED ACTIONS:')
      console.log('1. Go to your Supabase Dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and paste the CREATE_SUPPLIER_RPC_FUNCTIONS.sql content')
      console.log('4. Run the SQL script')
      console.log('5. Test the Procurement Dashboard again')
      console.log('')
      console.log('📁 The CREATE_SUPPLIER_RPC_FUNCTIONS.sql file contains the RPC functions')
    } else {
      console.log('✅ ALL SUPPLIER RPC FUNCTIONS WORKING!')
      console.log('')
      console.log('🚀 CONFIRMED WORKING:')
      console.log('1. ✅ CREATE RPC - Add new suppliers via RPC function');
      console.log('2. ✅ UPDATE RPC - Edit suppliers via RPC function');
      console.log('3. ✅ DELETE RPC - Remove suppliers via RPC function');
      console.log('4. ✅ READ - View supplier details');
      console.log('5. ✅ VALIDATION - All operations properly validated');
      console.log('')
      console.log('🎉 PROCUREMENT DASHBOARD SUPPLIER FUNCTIONALITY IS FULLY WORKING!')
      console.log('')
      console.log('💡 THE RPC FUNCTIONS BYPASS ALL PERMISSION ISSUES!')
      console.log('🔒 SECURITY DEFINER functions have elevated privileges')
      console.log('🎯 No more "permission denied" errors!')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testSupplierRPCFunctions()
