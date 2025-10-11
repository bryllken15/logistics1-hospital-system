import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING ALTERNATIVE APPROACH...\n')

async function testAlternativeApproach() {
  try {
    console.log('1️⃣ Testing if we can use RPC functions instead...')
    
    // Try using an RPC function to bypass RLS
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('create_supplier', {
        p_name: 'RPC Test Supplier',
        p_contact: 'RPC Contact',
        p_email: 'rpc@test.com',
        p_rating: 4
      })
    
    if (rpcError) {
      console.log(`   ❌ RPC failed: ${rpcError.message}`)
      console.log('   🔍 RPC function might not exist')
    } else {
      console.log(`   ✅ RPC worked: ${rpcData[0]?.name}`)
      
      // Clean up
      await supabase.from('suppliers').delete().eq('id', rpcData[0]?.id)
    }
    
    console.log('\n2️⃣ Testing if we can use a different table approach...')
    
    // Try inserting into a different table to see if it's a general permission issue
    const { data: testData, error: testError } = await supabase
      .from('users')
      .insert({
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'employee',
        is_authorized: true
      })
      .select()
    
    if (testError) {
      console.log(`   ❌ Users table insert failed: ${testError.message}`)
      console.log('   🔍 This suggests a general permission issue')
    } else {
      console.log(`   ✅ Users table insert worked: ${testData[0]?.full_name}`)
      
      // Clean up
      await supabase.from('users').delete().eq('id', testData[0]?.id)
    }
    
    console.log('\n3️⃣ Testing if we can use UPDATE instead of INSERT...')
    
    // Try updating an existing supplier instead of inserting
    const { data: existingSuppliers, error: readError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(1)
    
    if (readError) {
      console.log(`   ❌ Can't read suppliers: ${readError.message}`)
    } else if (existingSuppliers && existingSuppliers.length > 0) {
      const supplier = existingSuppliers[0]
      console.log(`   📝 Testing UPDATE on existing supplier: ${supplier.name}`)
      
      const { data: updateData, error: updateError } = await supabase
        .from('suppliers')
        .update({ rating: 5 })
        .eq('id', supplier.id)
        .select()
      
      if (updateError) {
        console.log(`   ❌ UPDATE failed: ${updateError.message}`)
      } else {
        console.log(`   ✅ UPDATE worked: ${updateData[0]?.name}`)
      }
    }
    
    console.log('\n4️⃣ Testing if it\'s a Supabase project configuration issue...')
    
    // Check if we can access the Supabase project at all
    const { data: projectData, error: projectError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5)
    
    if (projectError) {
      console.log(`   ❌ Can't access project metadata: ${projectError.message}`)
    } else {
      console.log(`   ✅ Can access project: Found ${projectData?.length || 0} tables`)
    }
    
    console.log('\n🎯 ALTERNATIVE APPROACH RESULTS:')
    console.log('================================')
    
    if (rpcError && testError) {
      console.log('❌ ALL APPROACHES FAILED!')
      console.log('🔍 This suggests:')
      console.log('   1. RLS is still enabled despite running SQL')
      console.log('   2. The SQL didn\'t take effect')
      console.log('   3. There might be a Supabase project configuration issue')
      console.log('')
      console.log('💡 POSSIBLE SOLUTIONS:')
      console.log('   1. Try running the SQL again in Supabase SQL Editor')
      console.log('   2. Check if you\'re in the right Supabase project')
      console.log('   3. Try creating a new table without RLS')
      console.log('   4. Contact Supabase support if the issue persists')
    } else {
      console.log('✅ SOME APPROACHES WORKED!')
      console.log('🔍 We found a working solution!')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testAlternativeApproach()
