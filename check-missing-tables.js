// Check Missing Tables Script
// Verifies that all required tables exist in the database

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

// Check if credentials are properly configured
if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseKey === 'your-anon-key-here') {
  console.log('❌ Supabase credentials not configured!')
  console.log('\n🔧 To fix this:')
  console.log('1. Create a .env file in your project root')
  console.log('2. Add your Supabase credentials:')
  console.log('   VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.log('   VITE_SUPABASE_ANON_KEY=your-anon-key-here')
  console.log('3. Or set environment variables:')
  console.log('   set VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.log('   set VITE_SUPABASE_ANON_KEY=your-anon-key-here')
  console.log('\n📖 See setup-credentials.md for detailed instructions')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMissingTables() {
  console.log('🔍 Checking for Missing Tables...\n')
  
  const requiredTables = [
    'users',
    'notifications', 
    'purchase_requests',
    'purchase_request_approvals',
    'approval_workflows'
  ]
  
  const missingTables = []
  const existingTables = []
  
  for (const tableName of requiredTables) {
    try {
      console.log(`Checking table: ${tableName}`)
      
      // Try to query the table
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table ${tableName} missing or inaccessible:`, error.message)
        missingTables.push(tableName)
      } else {
        console.log(`✅ Table ${tableName} exists`)
        existingTables.push(tableName)
      }
      
    } catch (error) {
      console.log(`❌ Error checking table ${tableName}:`, error.message)
      missingTables.push(tableName)
    }
  }
  
  console.log('\n📊 TABLE CHECK RESULTS')
  console.log('====================')
  console.log(`✅ Existing tables: ${existingTables.length}`)
  existingTables.forEach(table => console.log(`   - ${table}`))
  
  console.log(`❌ Missing tables: ${missingTables.length}`)
  missingTables.forEach(table => console.log(`   - ${table}`))
  
  if (missingTables.length > 0) {
    console.log('\n🔧 SOLUTION:')
    console.log('1. Go to Supabase → SQL Editor')
    console.log('2. Copy and paste the entire EMERGENCY_TABLE_FIX.sql script')
    console.log('3. Click "Run" to execute')
    console.log('4. Run this script again to verify tables exist')
    
    return false
  } else {
    console.log('\n🎉 All required tables exist!')
    console.log('✅ Your database is ready for the approval workflow')
    return true
  }
}

// Run the check
checkMissingTables().catch(console.error)
