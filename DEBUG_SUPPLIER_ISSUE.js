import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 DEBUGGING SUPPLIER ISSUE...\n')

async function debugSupplierIssue() {
  try {
    console.log('1️⃣ Checking if suppliers table exists...')
    
    // Try to query the table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(0)
    
    if (tableError) {
      console.log(`❌ Table access error: ${tableError.message}`)
      console.log(`   Error Code: ${tableError.code}`)
      console.log(`   Error Details: ${tableError.details}`)
      console.log(`   Error Hint: ${tableError.hint}`)
      
      if (tableError.message.includes('permission denied')) {
        console.log('\n🔧 REAL ISSUE: Permission denied')
        console.log('   This means the table exists but we don\'t have permission')
        console.log('   The issue is NOT SQL - it\'s the Supabase project settings')
        console.log('')
        console.log('💡 REAL SOLUTION:')
        console.log('1. Go to your Supabase Dashboard')
        console.log('2. Go to Settings > API')
        console.log('3. Check if your API key has the right permissions')
        console.log('4. Or the table might not exist at all')
        console.log('')
        console.log('🔍 Let\'s check what tables actually exist...')
        
        // Try to list all tables
        const { data: tables, error: tablesError } = await supabase
          .rpc('get_table_names')
          .select('*')
        
        if (tablesError) {
          console.log('❌ Cannot list tables:', tablesError.message)
        } else {
          console.log('✅ Available tables:', tables)
        }
      } else if (tableError.message.includes('relation "suppliers" does not exist')) {
        console.log('\n🔧 REAL ISSUE: Table does not exist')
        console.log('   The suppliers table has not been created yet')
        console.log('   This is NOT a permission issue - it\'s a missing table')
        console.log('')
        console.log('💡 REAL SOLUTION:')
        console.log('1. The table needs to be created first')
        console.log('2. Run the CREATE_SUPPLIERS_AND_ORDERS_DATABASE.sql script')
        console.log('3. Or create the table manually in Supabase Dashboard')
      }
    } else {
      console.log('✅ Suppliers table exists and is accessible')
      console.log('   The issue might be with the specific operation')
    }
    
    console.log('\n2️⃣ Testing different operations...')
    
    // Test SELECT operation
    console.log('   📖 Testing SELECT operation...')
    const { data: selectData, error: selectError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(1)
    
    if (selectError) {
      console.log(`   ❌ SELECT failed: ${selectError.message}`)
    } else {
      console.log(`   ✅ SELECT works: ${selectData?.length || 0} records`)
    }
    
    // Test INSERT operation
    console.log('   📝 Testing INSERT operation...')
    const testData = {
      name: 'Debug Test Supplier',
      contact: 'Debug Contact',
      email: 'debug@test.com',
      rating: 4
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('suppliers')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.log(`   ❌ INSERT failed: ${insertError.message}`)
      console.log(`   Error Code: ${insertError.code}`)
      
      if (insertError.code === '42501') {
        console.log('   🔧 This is a PERMISSION DENIED error')
        console.log('   The table exists but we don\'t have INSERT permission')
      } else if (insertError.code === '42P01') {
        console.log('   🔧 This is a TABLE NOT FOUND error')
        console.log('   The suppliers table does not exist')
      }
    } else {
      console.log(`   ✅ INSERT works: ${insertData?.length || 0} records created`)
      
      // Clean up test data
      if (insertData && insertData[0]) {
        await supabase
          .from('suppliers')
          .delete()
          .eq('id', insertData[0].id)
        console.log('   🧹 Test data cleaned up')
      }
    }
    
    console.log('\n3️⃣ Checking Supabase project status...')
    
    // Try to get project info
    const { data: projectInfo, error: projectError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (projectError) {
      console.log(`❌ Cannot access project info: ${projectError.message}`)
    } else {
      console.log('✅ Project accessible, available tables:')
      projectInfo?.forEach(table => {
        console.log(`   - ${table.table_name}`)
      })
    }
    
    console.log('\n🎯 DEBUG RESULTS:')
    console.log('=================')
    
    if (tableError && tableError.message.includes('permission denied')) {
      console.log('❌ ISSUE: Permission denied for suppliers table')
      console.log('🔧 SOLUTION: Fix Supabase project permissions')
      console.log('   1. Check Supabase Dashboard > Settings > API')
      console.log('   2. Verify your API key has correct permissions')
      console.log('   3. Check if RLS policies are blocking access')
    } else if (tableError && tableError.message.includes('does not exist')) {
      console.log('❌ ISSUE: Suppliers table does not exist')
      console.log('🔧 SOLUTION: Create the table first')
      console.log('   1. Run CREATE_SUPPLIERS_AND_ORDERS_DATABASE.sql')
      console.log('   2. Or create manually in Supabase Dashboard')
    } else if (insertError && insertError.code === '42501') {
      console.log('❌ ISSUE: INSERT permission denied')
      console.log('🔧 SOLUTION: Grant INSERT permissions')
      console.log('   1. Check Supabase Dashboard > Authentication > Policies')
      console.log('   2. Create permissive RLS policies')
    } else {
      console.log('✅ No obvious issues detected')
      console.log('   The problem might be elsewhere')
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error)
  }
}

debugSupplierIssue()
