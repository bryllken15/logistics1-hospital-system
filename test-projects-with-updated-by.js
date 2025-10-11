import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function testProjectsWithUpdatedBy() {
  try {
    console.log('🧪 Testing Projects with updated_by field...\n')
    
    // First, get a user ID to use as updated_by
    console.log('1. Getting a user ID for updated_by...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, role')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Could not get users:', usersError.message)
      return
    }
    
    if (users.length === 0) {
      console.log('❌ No users found in database')
      return
    }
    
    const userId = users[0].id
    console.log(`✅ Using user: ${users[0].full_name} (${users[0].role})`)
    
    // Test project creation with updated_by field
    console.log('\n2. Testing project creation with updated_by...')
    const testProject = {
      name: 'Updated By Test Project',
      description: 'Testing with updated_by field',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      budget: 5000,
      status: 'in_progress',
      progress: 0,
      spent: 0,
      staff_count: 0,
      updated_by: userId
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('projects')
      .insert(testProject)
      .select()
    
    if (insertError) {
      console.log('❌ Insert failed:')
      console.log('   Error:', insertError.message)
      console.log('   Code:', insertError.code)
      console.log('   Details:', insertError.details)
      console.log('   Hint:', insertError.hint)
    } else {
      console.log('✅ Insert successful!')
      console.log('   Created project:', insertData[0].name)
      console.log('   Project ID:', insertData[0].id)
      console.log('   Updated by:', insertData[0].updated_by)
      
      // Clean up test project
      await supabase.from('projects').delete().eq('id', insertData[0].id)
      console.log('🧹 Test project cleaned up')
    }
    
    // Test without updated_by to see if it's required
    console.log('\n3. Testing project creation without updated_by...')
    const testProjectNoUpdatedBy = {
      name: 'No Updated By Test Project',
      description: 'Testing without updated_by field',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      budget: 3000,
      status: 'in_progress',
      progress: 0,
      spent: 0,
      staff_count: 0
    }
    
    const { data: insertData2, error: insertError2 } = await supabase
      .from('projects')
      .insert(testProjectNoUpdatedBy)
      .select()
    
    if (insertError2) {
      console.log('❌ Insert without updated_by failed:')
      console.log('   Error:', insertError2.message)
      console.log('   This suggests updated_by is required')
    } else {
      console.log('✅ Insert without updated_by successful!')
      console.log('   Created project:', insertData2[0].name)
      
      // Clean up
      await supabase.from('projects').delete().eq('id', insertData2[0].id)
      console.log('🧹 Test project cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testProjectsWithUpdatedBy()
