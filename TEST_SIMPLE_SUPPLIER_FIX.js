import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔧 TESTING SIMPLE SUPPLIER FIX...\n')

async function testSimpleSupplierFix() {
  try {
    let testSupplierId = null
    
    console.log('1️⃣ Testing Simple CREATE...')
    
    // Test creating a supplier with minimal data
    const testSupplier = {
      name: 'Simple Test Supplier',
      contact: 'Simple Contact',
      email: 'simple@test.com',
      rating: 4
    }
    
    console.log('   📝 Creating supplier:', testSupplier.name)
    const { data: newSupplier, error: createError } = await supabase
      .from('suppliers')
      .insert(testSupplier)
      .select()
    
    if (createError) {
      console.log(`   ❌ CREATE failed: ${createError.message}`)
      console.log(`   🔍 Error details:`, createError)
      return
    } else {
      console.log(`   ✅ CREATE successful: ${newSupplier[0]?.name} (ID: ${newSupplier[0]?.id})`)
      testSupplierId = newSupplier[0]?.id
    }
    
    console.log('\n2️⃣ Testing Simple UPDATE...')
    
    // Test updating the supplier
    const updateData = {
      name: 'Updated Simple Supplier',
      rating: 5
    }
    
    console.log('   📝 Updating supplier:', updateData.name)
    const { data: updatedSupplier, error: updateError } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', testSupplierId)
      .select()
    
    if (updateError) {
      console.log(`   ❌ UPDATE failed: ${updateError.message}`)
    } else {
      console.log(`   ✅ UPDATE successful: ${updatedSupplier[0]?.name} (Rating: ${updatedSupplier[0]?.rating})`)
    }
    
    console.log('\n3️⃣ Testing Simple DELETE...')
    
    // Test deleting the supplier
    console.log('   🗑️ Deleting supplier:', testSupplierId)
    const { error: deleteError } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', testSupplierId)
    
    if (deleteError) {
      console.log(`   ❌ DELETE failed: ${deleteError.message}`)
    } else {
      console.log(`   ✅ DELETE successful: Supplier removed`)
    }
    
    console.log('\n🎯 SIMPLE SUPPLIER FIX RESULTS:')
    console.log('================================')
    
    const hasErrors = createError || updateError || deleteError
    
    if (hasErrors) {
      console.log('❌ STILL HAVING ISSUES!')
      console.log('')
      console.log('🔧 The problem is likely:')
      console.log('1. Table permissions (RLS blocking operations)')
      console.log('2. Table structure mismatch')
      console.log('3. Supabase project configuration')
      console.log('')
      console.log('💡 Try running this SQL in Supabase SQL Editor:')
      console.log('   ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;')
      console.log('   GRANT ALL ON TABLE suppliers TO authenticated;')
    } else {
      console.log('✅ ALL SUPPLIER OPERATIONS WORKING!')
      console.log('')
      console.log('🚀 CONFIRMED WORKING:')
      console.log('1. ✅ CREATE - Add new suppliers');
      console.log('2. ✅ UPDATE - Edit suppliers');
      console.log('3. ✅ DELETE - Remove suppliers');
      console.log('')
      console.log('🎉 PROCUREMENT DASHBOARD SUPPLIER FUNCTIONALITY IS WORKING!')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testSimpleSupplierFix()
