import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔧 TESTING PERMISSION FIX...\n')

async function testPermissionFix() {
  try {
    console.log('1️⃣ Testing if RLS is disabled on suppliers table...')
    
    // Try to insert a test supplier
    const testSupplier = {
      name: 'Permission Test Supplier',
      contact: 'Permission Contact',
      email: 'permission@test.com',
      rating: 3
    }
    
    console.log('   📝 Attempting to create supplier:', testSupplier.name)
    
    const { data, error } = await supabase
      .from('suppliers')
      .insert(testSupplier)
      .select()
    
    if (error) {
      console.log(`   ❌ STILL FAILING: ${error.message}`)
      console.log(`   🔍 Error code: ${error.code}`)
      console.log('')
      console.log('🔧 THE SQL DIDN\'T WORK! You need to run this in Supabase SQL Editor:')
      console.log('')
      console.log('ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;')
      console.log('')
      console.log('Then test again!')
    } else {
      console.log(`   ✅ SUCCESS! Supplier created: ${data[0]?.name}`)
      console.log('')
      console.log('🎉 PERMISSIONS ARE FIXED!')
      console.log('🚀 Your Procurement Dashboard should work now!')
      
      // Clean up test data
      await supabase.from('suppliers').delete().eq('id', data[0]?.id)
      console.log('🧹 Test data cleaned up')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testPermissionFix()
