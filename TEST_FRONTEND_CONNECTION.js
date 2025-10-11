import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING FRONTEND CONNECTION...\n')

async function testFrontendConnection() {
  try {
    console.log('1️⃣ Testing basic connection...')
    
    // Test if we can connect to Supabase at all
    const { data, error } = await supabase
      .from('suppliers')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log(`   ❌ Connection failed: ${error.message}`)
      console.log(`   🔍 Error code: ${error.code}`)
      return
    } else {
      console.log(`   ✅ Connection successful!`)
    }
    
    console.log('\n2️⃣ Testing if we can read data...')
    
    const { data: suppliers, error: readError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(3)
    
    if (readError) {
      console.log(`   ❌ Read failed: ${readError.message}`)
    } else {
      console.log(`   ✅ Read successful: Found ${suppliers?.length || 0} suppliers`)
    }
    
    console.log('\n3️⃣ Testing if we can write data...')
    
    // Try a simple insert
    const testData = {
      name: 'Connection Test',
      contact: 'Test Contact',
      email: 'connection@test.com',
      rating: 3
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('suppliers')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.log(`   ❌ Write failed: ${insertError.message}`)
      console.log(`   🔍 Error code: ${insertError.code}`)
      
      if (insertError.code === '42501') {
        console.log('   🔧 SOLUTION: The table has RLS enabled!')
        console.log('   💡 You need to disable RLS on the suppliers table')
      }
    } else {
      console.log(`   ✅ Write successful: Created ${insertData[0]?.name}`)
      
      // Clean up
      await supabase.from('suppliers').delete().eq('id', insertData[0]?.id)
      console.log('   🧹 Test data cleaned up')
    }
    
    console.log('\n4️⃣ Testing the exact same data the frontend sends...')
    
    // Simulate exactly what the frontend sends
    const frontendData = {
      name: 'Frontend Test',
      contact: 'Frontend Contact',
      email: 'frontend@test.com',
      rating: 5
    }
    
    console.log('   📝 Frontend data:', JSON.stringify(frontendData, null, 2))
    
    const { data: frontendResult, error: frontendError } = await supabase
      .from('suppliers')
      .insert(frontendData)
      .select()
    
    if (frontendError) {
      console.log(`   ❌ Frontend data failed: ${frontendError.message}`)
      console.log(`   🔍 Error code: ${frontendError.code}`)
    } else {
      console.log(`   ✅ Frontend data worked: Created ${frontendResult[0]?.name}`)
      
      // Clean up
      await supabase.from('suppliers').delete().eq('id', frontendResult[0]?.id)
    }
    
    console.log('\n🎯 CONNECTION TEST RESULTS:')
    console.log('===========================')
    
    if (insertError || frontendError) {
      console.log('❌ CONNECTION ISSUE FOUND!')
      console.log('')
      console.log('🔍 THE PROBLEM:')
      if (insertError) {
        console.log(`   - Insert error: ${insertError.message}`)
        console.log(`   - Error code: ${insertError.code}`)
      }
      if (frontendError) {
        console.log(`   - Frontend error: ${frontendError.message}`)
        console.log(`   - Error code: ${frontendError.code}`)
      }
      console.log('')
      console.log('💡 THE SOLUTION:')
      console.log('   The suppliers table has Row Level Security (RLS) enabled')
      console.log('   This blocks all INSERT operations from the frontend')
      console.log('')
      console.log('🔧 FIX: Run this SQL in Supabase SQL Editor:')
      console.log('   ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;')
    } else {
      console.log('✅ CONNECTION IS WORKING!')
      console.log('')
      console.log('🚀 The database connection is fine!')
      console.log('💡 The issue might be in the frontend code or network')
    }
    
  } catch (error) {
    console.error('💥 Connection test failed:', error)
  }
}

testFrontendConnection()
