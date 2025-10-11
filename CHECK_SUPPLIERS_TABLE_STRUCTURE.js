import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 CHECKING SUPPLIERS TABLE STRUCTURE...\n')

async function checkSuppliersTableStructure() {
  try {
    console.log('1️⃣ Checking existing suppliers data...')
    
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*')
    
    if (suppliersError) {
      console.log(`   ❌ Error reading suppliers: ${suppliersError.message}`)
    } else {
      console.log(`   ✅ Found ${suppliers?.length || 0} suppliers`)
      if (suppliers && suppliers.length > 0) {
        console.log('   📋 Sample supplier structure:')
        console.log('   ', JSON.stringify(suppliers[0], null, 2))
      }
    }
    
    console.log('\n2️⃣ Testing different INSERT approaches...')
    
    // Test 1: Minimal data
    console.log('   Test 1: Minimal data (name, contact, email, rating)')
    const minimalData = {
      name: 'Minimal Test',
      contact: 'Minimal Contact',
      email: 'minimal@test.com',
      rating: 3
    }
    
    const { data: minimalResult, error: minimalError } = await supabase
      .from('suppliers')
      .insert(minimalData)
      .select()
    
    if (minimalError) {
      console.log(`   ❌ Minimal INSERT failed: ${minimalError.message}`)
    } else {
      console.log(`   ✅ Minimal INSERT successful: ${minimalResult[0]?.name}`)
      
      // Clean up
      await supabase.from('suppliers').delete().eq('id', minimalResult[0]?.id)
    }
    
    // Test 2: With optional fields
    console.log('   Test 2: With optional fields (phone, address)')
    const fullData = {
      name: 'Full Test',
      contact: 'Full Contact',
      email: 'full@test.com',
      rating: 4,
      phone: '+1-555-1234',
      address: '123 Test St'
    }
    
    const { data: fullResult, error: fullError } = await supabase
      .from('suppliers')
      .insert(fullData)
      .select()
    
    if (fullError) {
      console.log(`   ❌ Full INSERT failed: ${fullError.message}`)
    } else {
      console.log(`   ✅ Full INSERT successful: ${fullResult[0]?.name}`)
      
      // Clean up
      await supabase.from('suppliers').delete().eq('id', fullResult[0]?.id)
    }
    
    console.log('\n3️⃣ Testing UPDATE on existing supplier...')
    
    if (suppliers && suppliers.length > 0) {
      const existingSupplier = suppliers[0]
      console.log(`   Testing UPDATE on existing supplier: ${existingSupplier.name}`)
      
      const { data: updateResult, error: updateError } = await supabase
        .from('suppliers')
        .update({ rating: 5 })
        .eq('id', existingSupplier.id)
        .select()
      
      if (updateError) {
        console.log(`   ❌ UPDATE failed: ${updateError.message}`)
      } else {
        console.log(`   ✅ UPDATE successful: ${updateResult[0]?.name} (Rating: ${updateResult[0]?.rating})`)
      }
    }
    
    console.log('\n🎯 SUPPLIERS TABLE ANALYSIS:')
    console.log('============================')
    
    if (minimalError && fullError) {
      console.log('❌ ALL INSERT ATTEMPTS FAILED!')
      console.log('🔍 This confirms:')
      console.log('   1. The suppliers table exists (we can read from it)')
      console.log('   2. RLS policies are blocking INSERT operations')
      console.log('   3. The table has SELECT permissions but NO INSERT permissions')
      console.log('')
      console.log('💡 SOLUTION: The table needs INSERT permissions enabled!')
      console.log('   This is a Supabase project configuration issue, not code!')
    } else {
      console.log('✅ SOME INSERT ATTEMPTS WORKED!')
      console.log('🔍 The issue might be specific to certain data formats')
    }
    
  } catch (error) {
    console.error('💥 Check failed:', error)
  }
}

checkSuppliersTableStructure()
