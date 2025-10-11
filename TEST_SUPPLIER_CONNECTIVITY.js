import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING SUPPLIER CONNECTIVITY...\n')

async function testSupplierConnectivity() {
  try {
    console.log('1️⃣ Testing Direct Supabase Connection...')
    
    // Test direct connection to suppliers table
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(1)
    
    if (suppliersError) {
      console.log(`❌ Direct connection failed: ${suppliersError.message}`)
      console.log(`   Error Code: ${suppliersError.code}`)
      console.log(`   Error Details: ${suppliersError.details}`)
      console.log(`   Error Hint: ${suppliersError.hint}`)
      
      if (suppliersError.message.includes('permission denied')) {
        console.log('\n🔧 CONNECTIVITY ISSUE: Permission denied')
        console.log('   The frontend cannot access the suppliers table')
        console.log('   This is a database permission issue, not a code issue')
        console.log('')
        console.log('💡 SOLUTION: Run this SQL in Supabase SQL Editor:')
        console.log('===============================================')
        console.log('')
        console.log('-- Fix permissions for suppliers table')
        console.log('GRANT ALL ON TABLE suppliers TO authenticated;')
        console.log('GRANT ALL ON TABLE suppliers TO service_role;')
        console.log('')
        console.log('-- Enable RLS and create policy')
        console.log('ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;')
        console.log('DROP POLICY IF EXISTS "Allow all for authenticated users" ON suppliers;')
        console.log('CREATE POLICY "Allow all for authenticated users" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);')
        console.log('')
        console.log('===============================================')
        return
      }
    } else {
      console.log('✅ Direct connection successful')
      console.log(`   Found ${suppliers?.length || 0} suppliers`)
    }
    
    console.log('\n2️⃣ Testing Supplier Creation...')
    
    // Test creating a supplier
    const testSupplier = {
      name: 'Connectivity Test Supplier',
      contact: 'Test Contact',
      email: 'connectivity@test.com',
      rating: 4,
      status: 'active'
    }
    
    const { data: newSupplier, error: createError } = await supabase
      .from('suppliers')
      .insert(testSupplier)
      .select()
      .single()
    
    if (createError) {
      console.log(`❌ Supplier creation failed: ${createError.message}`)
      console.log(`   Error Code: ${createError.code}`)
      console.log(`   Error Details: ${createError.details}`)
      
      if (createError.message.includes('permission denied')) {
        console.log('\n🔧 CONNECTIVITY ISSUE: Cannot create suppliers')
        console.log('   The frontend cannot insert into the suppliers table')
        console.log('   This confirms it\'s a permission issue')
      } else if (createError.message.includes('duplicate key')) {
        console.log('\n✅ CONNECTIVITY WORKING: Duplicate key error means table is accessible')
        console.log('   The supplier with this email already exists')
        console.log('   This means the table is accessible but has duplicate data')
      }
    } else {
      console.log(`✅ Supplier creation successful: ${newSupplier.name}`)
      
      // Clean up test supplier
      await supabase
        .from('suppliers')
        .delete()
        .eq('id', newSupplier.id)
      console.log('   Test supplier cleaned up')
    }
    
    console.log('\n3️⃣ Testing Alternative Approach...')
    
    // Test if we can access the table with different methods
    console.log('   Testing table existence...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('suppliers')
      .select('count')
      .limit(0)
    
    if (tableError) {
      console.log(`   ❌ Table check failed: ${tableError.message}`)
    } else {
      console.log('   ✅ Table exists and is accessible')
    }
    
    console.log('\n4️⃣ Testing Service Role Connection...')
    
    // Test with service role key (if available)
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgwNzkyNCwiZXhwIjoyMDc1MzgzOTI0fQ.YourServiceRoleKeyHere'
    
    // Note: We can't test service role without the actual key
    console.log('   Service role testing requires the actual service role key')
    console.log('   This would bypass RLS and test if the table structure is correct')
    
    console.log('\n🎯 CONNECTIVITY TEST RESULTS:')
    console.log('=============================')
    
    if (suppliersError && suppliersError.message.includes('permission denied')) {
      console.log('❌ CONNECTIVITY ISSUE CONFIRMED!')
      console.log('')
      console.log('🔧 ROOT CAUSE: Database permissions')
      console.log('   - The suppliers table exists')
      console.log('   - The frontend cannot access it due to permissions')
      console.log('   - This is NOT a code issue, it\'s a database configuration issue')
      console.log('')
      console.log('💡 IMMEDIATE SOLUTION:')
      console.log('1. Go to Supabase Dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Run the permission fix SQL provided above')
      console.log('4. Test the Procurement Dashboard again')
      console.log('')
      console.log('📋 The exact SQL commands are shown above in the error message')
    } else if (createError && createError.message.includes('duplicate key')) {
      console.log('✅ CONNECTIVITY WORKING!')
      console.log('   The table is accessible, just has duplicate data')
      console.log('   Try with a different email address')
    } else if (newSupplier) {
      console.log('✅ CONNECTIVITY PERFECT!')
      console.log('   Supplier creation is working')
      console.log('   The issue might be in the frontend form validation')
    } else {
      console.log('❓ UNKNOWN CONNECTIVITY ISSUE')
      console.log('   Need to investigate further')
    }
    
  } catch (error) {
    console.error('💥 Connectivity test failed:', error)
  }
}

testSupplierConnectivity()
