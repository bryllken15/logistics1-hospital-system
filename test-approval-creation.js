// Test script to debug why approval requests aren't being created
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testApprovalCreation() {
  console.log('🧪 Testing Approval Request Creation...\n')

  try {
    // 1. First create an inventory item
    console.log('1️⃣ Creating inventory item...')
    const inventoryData = {
      item_name: 'Test Approval Item',
      rfid_code: `RFID-TEST-${Date.now()}`,
      quantity: 0, // Start with 0, will be updated after approval
      status: 'in_stock',
      location: 'Test Location',
      unit_price: 25.50,
      created_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f'
    }

    const { data: inventoryResult, error: inventoryError } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select()

    if (inventoryError) {
      console.error('❌ Error creating inventory item:', inventoryError.message)
      return
    }

    console.log('✅ Inventory item created:', inventoryResult[0].id)

    // 2. Now try to create the approval request
    console.log('\n2️⃣ Creating approval request...')
    const approvalData = {
      inventory_id: inventoryResult[0].id,
      item_name: 'Test Approval Item',
      quantity: 100,
      unit_price: 25.50,
      // total_value is a generated column, so we don't include it
      status: 'pending',
      requested_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f',
      request_reason: 'Test approval request',
      request_type: 'new_item'
    }

    console.log('Approval data:', approvalData)

    const { data: approvalResult, error: approvalError } = await supabase
      .from('inventory_approvals')
      .insert(approvalData)
      .select()

    if (approvalError) {
      console.error('❌ Error creating approval request:', approvalError.message)
      console.error('Full error:', approvalError)
      
      // Check if it's a column issue
      if (approvalError.message.includes('column')) {
        console.log('\n🔍 Checking table structure...')
        const { data: columns, error: columnsError } = await supabase
          .from('inventory_approvals')
          .select('*')
          .limit(0)
        
        if (columnsError) {
          console.error('❌ Error accessing table:', columnsError.message)
        } else {
          console.log('✅ Table is accessible')
        }
      }
    } else {
      console.log('✅ Approval request created successfully:', approvalResult[0])
      
      // 3. Test if manager can see it
      console.log('\n3️⃣ Testing manager query...')
      const { data: managerQuery, error: managerError } = await supabase
        .from('inventory_approvals')
        .select(`
          *,
          inventory:inventory_id(*),
          requested_by_user:requested_by(full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (managerError) {
        console.error('❌ Manager query error:', managerError.message)
      } else {
        console.log(`✅ Manager query found ${managerQuery.length} pending requests`)
        if (managerQuery.length > 0) {
          managerQuery.forEach((req, i) => {
            console.log(`  ${i + 1}. ${req.item_name} - Status: ${req.status}`)
          })
        }
      }

      // Clean up
      console.log('\n4️⃣ Cleaning up test data...')
      await supabase.from('inventory_approvals').delete().eq('id', approvalResult[0].id)
      await supabase.from('inventory').delete().eq('id', inventoryResult[0].id)
      console.log('✅ Test data cleaned up')
    }

  } catch (error) {
    console.error('💥 Test error:', error.message)
  }
}

testApprovalCreation()
  .then(() => {
    console.log('\n✨ Test complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
