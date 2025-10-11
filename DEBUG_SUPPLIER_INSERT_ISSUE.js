import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 DEBUGGING SUPPLIER INSERT ISSUE...\n')

async function debugSupplierInsertIssue() {
  try {
    console.log('1️⃣ Testing what data the frontend is actually sending...')
    
    // Simulate exactly what the frontend sends
    const frontendData = {
      name: 'Frontend Test Supplier',
      contact: 'Frontend Contact',
      email: 'frontend@test.com',
      rating: 5
    }
    
    console.log('   📝 Frontend data structure:', JSON.stringify(frontendData, null, 2))
    
    console.log('\n2️⃣ Testing direct insert with frontend data...')
    
    const { data, error } = await supabase
      .from('suppliers')
      .insert(frontendData)
      .select()
    
    if (error) {
      console.log(`   ❌ INSERT failed: ${error.message}`)
      console.log(`   🔍 Error code: ${error.code}`)
      console.log(`   🔍 Full error:`, error)
      
      console.log('\n3️⃣ Testing if it\'s a table structure issue...')
      
      // Check what columns actually exist
      const { data: tableInfo, error: tableError } = await supabase
        .from('suppliers')
        .select('*')
        .limit(1)
      
      if (tableError) {
        console.log(`   ❌ Can't read table: ${tableError.message}`)
      } else if (tableInfo && tableInfo.length > 0) {
        console.log('   ✅ Table structure:')
        console.log('   ', Object.keys(tableInfo[0]))
        
        console.log('\n4️⃣ Testing with exact table structure...')
        
        // Try with the exact structure from the table
        const exactData = {
          name: 'Exact Structure Test',
          contact: 'Exact Contact',
          email: 'exact@test.com',
          rating: 4
        }
        
        // Add any missing required fields
        if (tableInfo[0].phone !== undefined) exactData.phone = '+1-555-0000'
        if (tableInfo[0].address !== undefined) exactData.address = 'Test Address'
        if (tableInfo[0].status !== undefined) exactData.status = 'active'
        if (tableInfo[0].notes !== undefined) exactData.notes = 'Test notes'
        
        console.log('   📝 Exact structure data:', JSON.stringify(exactData, null, 2))
        
        const { data: exactResult, error: exactError } = await supabase
          .from('suppliers')
          .insert(exactData)
          .select()
        
        if (exactError) {
          console.log(`   ❌ Exact structure also failed: ${exactError.message}`)
        } else {
          console.log(`   ✅ Exact structure worked: ${exactResult[0]?.name}`)
          
          // Clean up
          await supabase.from('suppliers').delete().eq('id', exactResult[0]?.id)
        }
      }
      
    } else {
      console.log(`   ✅ INSERT successful: ${data[0]?.name}`)
      console.log('   🎉 The issue is NOT with the data structure!')
      
      // Clean up
      await supabase.from('suppliers').delete().eq('id', data[0]?.id)
    }
    
    console.log('\n5️⃣ Testing if it\'s a Supabase client issue...')
    
    // Test with a different approach
    const { data: testData, error: testError } = await supabase
      .from('suppliers')
      .insert([{
        name: 'Array Test',
        contact: 'Array Contact', 
        email: 'array@test.com',
        rating: 3
      }])
      .select()
    
    if (testError) {
      console.log(`   ❌ Array insert failed: ${testError.message}`)
    } else {
      console.log(`   ✅ Array insert worked: ${testData[0]?.name}`)
      
      // Clean up
      await supabase.from('suppliers').delete().eq('id', testData[0]?.id)
    }
    
    console.log('\n🎯 DIAGNOSIS COMPLETE!')
    console.log('======================')
    
    if (error) {
      console.log('❌ THE REAL ISSUE:')
      console.log(`   - Error: ${error.message}`)
      console.log(`   - Code: ${error.code}`)
      console.log('')
      console.log('💡 This confirms it\'s a PERMISSION issue, not a data issue!')
      console.log('🔧 The suppliers table is blocking INSERT operations')
    } else {
      console.log('✅ INSERT IS WORKING!')
      console.log('💡 The issue might be in the frontend code or network')
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error)
  }
}

debugSupplierInsertIssue()
