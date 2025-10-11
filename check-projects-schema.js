import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function checkProjectsSchema() {
  try {
    console.log('🔍 Checking Projects Table Schema...\n')
    
    // Check table structure
    console.log('1. Checking table structure...')
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    })
    
    if (columnsError) {
      console.log('⚠️  Could not query columns directly:', columnsError.message)
    } else {
      console.log('✅ Projects table columns:')
      columns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) - nullable: ${col.is_nullable}`)
      })
    }
    
    // Check for triggers
    console.log('\n2. Checking for triggers...')
    const { data: triggers, error: triggersError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT trigger_name, event_manipulation, action_statement
        FROM information_schema.triggers 
        WHERE event_object_table = 'projects'
        AND event_object_schema = 'public';
      `
    })
    
    if (triggersError) {
      console.log('⚠️  Could not query triggers directly:', triggersError.message)
    } else {
      console.log('✅ Triggers on projects table:')
      if (triggers.length === 0) {
        console.log('   No triggers found')
      } else {
        triggers.forEach(trigger => {
          console.log(`   - ${trigger.trigger_name} (${trigger.event_manipulation})`)
          console.log(`     ${trigger.action_statement}`)
        })
      }
    }
    
    // Try a simple insert to see the exact error
    console.log('\n3. Testing simple insert...')
    const testProject = {
      name: 'Schema Test Project',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      budget: 1000,
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
      console.log('❌ Insert failed:')
      console.log('   Error:', insertError.message)
      console.log('   Code:', insertError.code)
      console.log('   Details:', insertError.details)
      console.log('   Hint:', insertError.hint)
    } else {
      console.log('✅ Insert successful!')
      console.log('   Created project:', insertData[0].name)
      
      // Clean up
      await supabase.from('projects').delete().eq('id', insertData[0].id)
      console.log('🧹 Test project cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkProjectsSchema()
