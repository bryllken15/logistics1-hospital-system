// Debug script to check inventory approval requests
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugApprovalRequests() {
  console.log('🔍 Debugging Inventory Approval Requests...\n')

  try {
    // 1. Check if inventory_approvals table exists and has data
    console.log('1️⃣ Checking inventory_approvals table...')
    const { data: approvals, error: approvalsError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .order('created_at', { ascending: false })

    if (approvalsError) {
      console.error('❌ Error accessing inventory_approvals:', approvalsError.message)
      return
    }

    console.log(`✅ Found ${approvals.length} approval requests`)
    if (approvals.length > 0) {
      console.log('Recent requests:')
      approvals.slice(0, 3).forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.item_name} - Status: ${req.status} - Created: ${req.created_at}`)
      })
    }

    // 2. Check what the manager dashboard is trying to load
    console.log('\n2️⃣ Testing manager dashboard query...')
    const { data: managerQuery, error: managerError } = await supabase
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

    if (managerError) {
      console.error('❌ Error with manager query:', managerError.message)
    } else {
      console.log(`✅ Manager query found ${managerQuery.length} pending requests`)
      if (managerQuery.length > 0) {
        managerQuery.forEach((req, i) => {
          console.log(`  ${i + 1}. ${req.item_name} - Requested by: ${req.requested_by_user?.full_name || 'Unknown'}`)
        })
      }
    }

    // 3. Check if there are any inventory items created recently
    console.log('\n3️⃣ Checking recent inventory items...')
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (inventoryError) {
      console.error('❌ Error accessing inventory:', inventoryError.message)
    } else {
      console.log(`✅ Found ${inventory.length} inventory items`)
      inventory.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.item_name} - Created: ${item.created_at}`)
      })
    }

    // 4. Test creating a new approval request
    console.log('\n4️⃣ Testing creation of new approval request...')
    const testRequest = {
      item_name: 'Debug Test Item',
      quantity: 10,
      unit_price: 15.50,
      status: 'pending',
      requested_by: 'dbbd608b-377f-4368-b61e-102f1f727f4f', // Real employee ID
      request_reason: 'Debug test request',
      request_type: 'new_item'
    }

    const { data: newRequest, error: createError } = await supabase
      .from('inventory_approvals')
      .insert(testRequest)
      .select()

    if (createError) {
      console.error('❌ Error creating test request:', createError.message)
    } else {
      console.log('✅ Test request created successfully:', newRequest[0].id)
      
      // Clean up test request
      await supabase.from('inventory_approvals').delete().eq('id', newRequest[0].id)
      console.log('✅ Test request cleaned up')
    }

    // 5. Check the exact query the manager dashboard uses
    console.log('\n5️⃣ Testing exact manager dashboard query...')
    const { data: exactQuery, error: exactError } = await supabase
      .from('inventory_approvals')
      .select(`
        *,
        inventory:inventory_id(*),
        requested_by_user:requested_by(full_name, email),
        manager_approved_by_user:manager_approved_by(full_name, email),
        project_manager_approved_by_user:project_manager_approved_by(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (exactError) {
      console.error('❌ Error with exact query:', exactError.message)
    } else {
      console.log(`✅ Exact query found ${exactQuery.length} total requests`)
      const pendingRequests = exactQuery.filter(req => req.status === 'pending')
      console.log(`✅ Found ${pendingRequests.length} pending requests`)
      
      if (pendingRequests.length > 0) {
        console.log('Pending requests:')
        pendingRequests.forEach((req, i) => {
          console.log(`  ${i + 1}. ${req.item_name} - Status: ${req.status} - Requested by: ${req.requested_by_user?.full_name || 'Unknown'}`)
        })
      }
    }

    console.log('\n🎯 Debug Summary:')
    console.log(`- Total approval requests: ${approvals.length}`)
    console.log(`- Pending requests: ${approvals.filter(req => req.status === 'pending').length}`)
    console.log(`- Manager query works: ${managerError ? 'NO' : 'YES'}`)
    console.log(`- Recent inventory items: ${inventory.length}`)

  } catch (error) {
    console.error('💥 Debug script error:', error.message)
  }
}

debugApprovalRequests()
  .then(() => {
    console.log('\n✨ Debug complete!')
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
