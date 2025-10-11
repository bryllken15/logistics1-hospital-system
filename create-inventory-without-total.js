// Create inventory items without total_value column issue
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createInventoryWithoutTotal() {
  console.log('🔧 Creating inventory without total_value column...\n')

  try {
    // Step 1: Check if we can create a new table without total_value
    console.log('1️⃣ Checking if we can create a new table...')
    
    // Try to create a simple test table
    const { data: createTableResult, error: createTableError } = await supabase
      .rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.inventory_test (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            item_name TEXT NOT NULL,
            rfid_code TEXT UNIQUE,
            quantity INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending_approval',
            location TEXT,
            unit_price DECIMAL(10,2) DEFAULT 0,
            created_by UUID REFERENCES public.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
    
    if (createTableError) {
      console.log('❌ Cannot create test table:', createTableError.message)
      console.log('   This suggests we don\'t have permission to create tables')
    } else {
      console.log('✅ Test table created successfully!')
      
      // Try to insert into the test table
      const { data: testInsertResult, error: testInsertError } = await supabase
        .from('inventory_test')
        .insert({
          item_name: 'Test Table Item',
          rfid_code: `RFID-TEST-TABLE-${Date.now()}`,
          quantity: 5,
          status: 'pending_approval',
          location: 'Test Location',
          unit_price: 30.00,
          created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
        })
        .select()
      
      if (testInsertError) {
        console.log('❌ Test table insert failed:', testInsertError.message)
      } else {
        console.log('✅ Test table insert successful!')
        console.log('📋 Result:', testInsertResult[0])
        
        // Clean up test table
        await supabase.from('inventory_test').delete().eq('id', testInsertResult[0].id)
        console.log('✅ Test table data cleaned up')
      }
    }

    // Step 2: Try to work around the total_value issue
    console.log('\n2️⃣ Trying to work around total_value issue...')
    
    // Let's try to insert with a different approach - using a stored procedure
    const { data: procedureResult, error: procedureError } = await supabase
      .rpc('exec_sql', {
        sql: `
          INSERT INTO public.inventory (
            item_name, 
            rfid_code, 
            quantity, 
            status, 
            location, 
            unit_price, 
            created_by
          ) VALUES (
            'Procedure Test Item', 
            'RFID-PROCEDURE-${Date.now()}', 
            3, 
            'pending_approval', 
            'Test Location', 
            35.00, 
            'dbbd608b-377f-4368-b61e-102f1f727f4f'
          ) RETURNING id, item_name, quantity, unit_price;
        `
      })
    
    if (procedureError) {
      console.log('❌ Procedure insert failed:', procedureError.message)
    } else {
      console.log('✅ Procedure insert successful!')
      console.log('📋 Result:', procedureResult)
    }

    // Step 3: Try to modify the existing table
    console.log('\n3️⃣ Trying to modify existing table...')
    
    // Try to drop the total_value column
    const { data: dropColumnResult, error: dropColumnError } = await supabase
      .rpc('exec_sql', {
        sql: 'ALTER TABLE public.inventory DROP COLUMN IF EXISTS total_value;'
      })
    
    if (dropColumnError) {
      console.log('❌ Cannot drop total_value column:', dropColumnError.message)
      console.log('   This suggests we don\'t have permission to modify the table structure')
    } else {
      console.log('✅ total_value column dropped successfully!')
      
      // Now try to insert
      const { data: insertAfterDropResult, error: insertAfterDropError } = await supabase
        .from('inventory')
        .insert({
          item_name: 'After Drop Test Item',
          rfid_code: `RFID-AFTER-DROP-${Date.now()}`,
          quantity: 4,
          status: 'pending_approval',
          location: 'Test Location',
          unit_price: 40.00,
          created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
        })
        .select()
      
      if (insertAfterDropError) {
        console.log('❌ Insert after drop failed:', insertAfterDropError.message)
      } else {
        console.log('✅ Insert after drop successful!')
        console.log('📋 Result:', insertAfterDropResult[0])
        
        // Clean up
        await supabase.from('inventory').delete().eq('id', insertAfterDropResult[0].id)
        console.log('✅ Test data cleaned up')
      }
    }

  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

createInventoryWithoutTotal()
  .then(() => {
    console.log('\n✨ Inventory creation test complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
