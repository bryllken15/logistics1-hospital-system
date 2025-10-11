// Fix inventory table total_value generated column issue using Supabase client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixInventoryTotalValue() {
  console.log('🔧 Fixing inventory total_value column...\n')

  try {
    // Step 1: Check current column definition
    console.log('1️⃣ Checking current total_value column...')
    const { data: columnInfo, error: columnError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, is_generated, generation_expression 
          FROM information_schema.columns 
          WHERE table_name = 'inventory' 
          AND column_name = 'total_value'
        `
      })

    if (columnError) {
      console.log('❌ Error checking column info:', columnError.message)
    } else {
      console.log('📋 Column info:', columnInfo)
    }

    // Step 2: Try to fix the column definition
    console.log('\n2️⃣ Attempting to fix total_value column...')
    
    // First, try to drop and recreate the column
    const { data: dropResult, error: dropError } = await supabase
      .rpc('exec_sql', {
        sql: 'ALTER TABLE public.inventory DROP COLUMN IF EXISTS total_value;'
      })

    if (dropError) {
      console.log('⚠️ Drop column error (may be expected):', dropError.message)
    } else {
      console.log('✅ Column dropped successfully')
    }

    // Recreate as generated column
    const { data: createResult, error: createError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE public.inventory 
          ADD COLUMN total_value DECIMAL(10,2) 
          GENERATED ALWAYS AS (quantity * unit_price) STORED;
        `
      })

    if (createError) {
      console.log('❌ Create column error:', createError.message)
    } else {
      console.log('✅ Column recreated as generated column')
    }

    // Step 3: Test the fix
    console.log('\n3️⃣ Testing the fix...')
    const testData = {
      item_name: 'Fix Test Item',
      rfid_code: `RFID-FIX-${Date.now()}`,
      quantity: 3,
      status: 'in_stock',
      location: 'Test Location',
      unit_price: 15.00,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    const { data: testResult, error: testError } = await supabase
      .from('inventory')
      .insert(testData)
      .select()

    if (testError) {
      console.log('❌ Test insert failed:', testError.message)
    } else {
      console.log('✅ Test insert successful!')
      console.log('📋 Result:', testResult[0])
      
      // Check if total_value was calculated correctly
      const expectedTotal = testData.quantity * testData.unit_price
      const actualTotal = testResult[0].total_value
      
      if (actualTotal === expectedTotal) {
        console.log(`✅ total_value calculated correctly: ${actualTotal} (${testData.quantity} * ${testData.unit_price})`)
      } else {
        console.log(`⚠️ total_value calculation issue: expected ${expectedTotal}, got ${actualTotal}`)
      }
      
      // Clean up test data
      await supabase.from('inventory').delete().eq('id', testResult[0].id)
      console.log('✅ Test data cleaned up')
    }

  } catch (error) {
    console.error('💥 Fix error:', error.message)
  }
}

fixInventoryTotalValue()
  .then(() => {
    console.log('\n✨ Fix attempt complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
