import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 DEBUGGING THE REAL ISSUE...\n')

async function debugRealIssue() {
  try {
    console.log('1️⃣ Testing if we can READ from suppliers table...')
    
    const { data: readData, error: readError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(1)
    
    if (readError) {
      console.log(`   ❌ READ failed: ${readError.message}`)
      console.log(`   🔍 Error code: ${readError.code}`)
      console.log(`   🔍 Error details:`, readError)
    } else {
      console.log(`   ✅ READ successful: Found ${readData?.length || 0} suppliers`)
    }
    
    console.log('\n2️⃣ Testing if we can INSERT into suppliers table...')
    
    const testData = {
      name: 'Debug Test Supplier',
      contact: 'Debug Contact',
      email: 'debug@test.com',
      rating: 3
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('suppliers')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.log(`   ❌ INSERT failed: ${insertError.message}`)
      console.log(`   🔍 Error code: ${insertError.code}`)
      console.log(`   🔍 Error details:`, insertError)
    } else {
      console.log(`   ✅ INSERT successful: Created supplier ${insertData[0]?.name}`)
      
      // Clean up the test data
      console.log('\n3️⃣ Cleaning up test data...')
      const { error: deleteError } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', insertData[0]?.id)
      
      if (deleteError) {
        console.log(`   ⚠️ DELETE failed: ${deleteError.message}`)
      } else {
        console.log(`   ✅ DELETE successful: Test data cleaned up`)
      }
    }
    
    console.log('\n4️⃣ Testing other tables to see if it\'s a general permission issue...')
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log(`   ❌ Users table READ failed: ${usersError.message}`)
    } else {
      console.log(`   ✅ Users table READ successful: Found ${usersData?.length || 0} users`)
    }
    
    console.log('\n🎯 REAL ISSUE DIAGNOSIS:')
    console.log('========================')
    
    if (readError && insertError) {
      console.log('❌ BOTH READ AND INSERT FAILED!')
      console.log('🔍 This suggests:')
      console.log('   1. Table might not exist')
      console.log('   2. RLS is blocking all operations')
      console.log('   3. User has no permissions at all')
    } else if (readError && !insertError) {
      console.log('❌ READ FAILED BUT INSERT WORKED!')
      console.log('🔍 This suggests a SELECT permission issue')
    } else if (!readError && insertError) {
      console.log('❌ READ WORKED BUT INSERT FAILED!')
      console.log('🔍 This suggests an INSERT permission issue')
    } else {
      console.log('✅ BOTH READ AND INSERT WORKED!')
      console.log('🔍 The issue might be in the frontend code or data format')
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error)
  }
}

debugRealIssue()
