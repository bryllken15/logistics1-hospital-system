// Test script to check inventory_approvals table structure and fix issues
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testInventoryApprovalsTable() {
  console.log('🔍 Testing inventory_approvals table...\n')

  try {
    // 1. Check if table exists and get its structure
    console.log('1️⃣ Checking table structure...')
    const { data: columns, error: columnsError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .limit(0)

    if (columnsError) {
      console.error('❌ Error accessing table:', columnsError.message)
      
      if (columnsError.message.includes('relation "inventory_approvals" does not exist')) {
        console.log('🔧 Table does not exist. Creating it...')
        
        // Create the table
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.inventory_approvals (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
            item_name TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            unit_price DECIMAL(10,2) DEFAULT 0,
            total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
            manager_approved BOOLEAN DEFAULT false,
            manager_approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
            manager_approved_at TIMESTAMP WITH TIME ZONE,
            project_manager_approved BOOLEAN DEFAULT false,
            project_manager_approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
            project_manager_approved_at TIMESTAMP WITH TIME ZONE,
            admin_approved BOOLEAN DEFAULT false,
            admin_approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
            admin_approved_at TIMESTAMP WITH TIME ZONE,
            request_reason TEXT,
            request_type TEXT DEFAULT 'new_item',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
        
        console.log('Creating table with SQL:', createTableSQL)
        // Note: This would need to be run in Supabase SQL Editor
        console.log('⚠️ Please run this SQL in your Supabase SQL Editor:')
        console.log(createTableSQL)
        return
      }
    } else {
      console.log('✅ Table exists and is accessible')
    }

    // 2. Test inserting a record
    console.log('\n2️⃣ Testing record insertion...')
    const testData = {
      item_name: 'Test Item',
      quantity: 10,
      unit_price: 15.50,
      status: 'pending',
      requested_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f',
      request_reason: 'Test request',
      request_type: 'new_item'
    }

    const { data: insertResult, error: insertError } = await supabase
      .from('inventory_approvals')
      .insert(testData)
      .select()

    if (insertError) {
      console.error('❌ Insert error:', insertError.message)
      console.error('Full error:', insertError)
      
      // Check what columns are missing
      if (insertError.message.includes('column')) {
        console.log('\n🔍 Checking required columns...')
        const { data: tableInfo, error: tableInfoError } = await supabase
          .rpc('get_table_columns', { table_name: 'inventory_approvals' })
          .catch(() => {
            console.log('Cannot get table info via RPC, trying alternative...')
            return { data: null, error: { message: 'RPC not available' } }
          })
        
        if (tableInfoError) {
          console.log('⚠️ Cannot get table structure via RPC')
        }
      }
    } else {
      console.log('✅ Record inserted successfully:', insertResult[0].id)
      
      // Clean up test record
      await supabase.from('inventory_approvals').delete().eq('id', insertResult[0].id)
      console.log('✅ Test record cleaned up')
    }

    // 3. Test the exact query that the frontend uses
    console.log('\n3️⃣ Testing frontend query...')
    const { data: frontendQuery, error: frontendError } = await supabase
      .from('inventory_approvals')
      .select(`
        *,
        inventory:inventory_id(*),
        requested_by_user:requested_by(full_name, email),
        manager_approved_by_user:manager_approved_by(full_name, email),
        project_manager_approved_by_user:project_manager_approved_by(full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (frontendError) {
      console.error('❌ Frontend query error:', frontendError.message)
    } else {
      console.log(`✅ Frontend query successful, found ${frontendQuery.length} records`)
    }

  } catch (error) {
    console.error('💥 Test error:', error.message)
  }
}

testInventoryApprovalsTable()
  .then(() => {
    console.log('\n✨ Table test complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
