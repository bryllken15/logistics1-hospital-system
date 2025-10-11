import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function testRLSDisabled() {
  try {
    console.log('🧪 Testing RLS Disabled State...\n')
    
    // Test project creation (should work now)
    console.log('1. Testing project creation...')
    const testProject = {
      name: 'RLS Disabled Test Project',
      description: 'Testing after RLS disabled',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      budget: 5000,
      status: 'in_progress',
      progress: 0,
      spent: 0,
      staff_count: 0
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('projects')
      .insert(testProject)
      .select()
    
    if (insertError) {
      console.log('❌ Insert still failing:', insertError.message)
      console.log('   Error code:', insertError.code)
      console.log('   RLS may still be enabled')
    } else {
      console.log('✅ Insert successful! RLS is disabled')
      console.log('   Created project:', insertData[0].name)
      console.log('   Project ID:', insertData[0].id)
      
      // Clean up test project
      await supabase.from('projects').delete().eq('id', insertData[0].id)
      console.log('🧹 Test project cleaned up')
    }
    
    // Test reading projects
    console.log('\n2. Testing project reading...')
    const { data: projects, error: selectError } = await supabase
      .from('projects')
      .select('*')
      .limit(3)
    
    if (selectError) {
      console.log('❌ SELECT failed:', selectError.message)
    } else {
      console.log('✅ SELECT successful - found', projects.length, 'projects')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testRLSDisabled()
