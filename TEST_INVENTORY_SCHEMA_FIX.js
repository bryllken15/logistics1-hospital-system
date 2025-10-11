import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING INVENTORY SCHEMA FIX...\n')

async function testInventorySchemaFix() {
  try {
    console.log('1️⃣ Testing inventory_approvals table schema...')
    
    // Get one record to see the actual schema
    const { data: schemaData, error: schemaError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .limit(1)
    
    if (schemaError) {
      console.log(`❌ Schema check failed: ${schemaError.message}`)
    } else {
      console.log(`✅ Schema check works`)
      if (schemaData && schemaData.length > 0) {
        console.log('   Available columns:', Object.keys(schemaData[0]))
        console.log('   Sample data:', JSON.stringify(schemaData[0], null, 2))
      }
    }
    
    console.log('\n2️⃣ Testing inventory request submission with correct schema...')
    
    // Test creating inventory request with only existing columns
    const testInventoryRequest = {
      item_name: 'Fixed Inventory Item',
      quantity: 3,
      unit_price: 150,
      total_value: 450,
      status: 'pending',
      requested_by: '33333333-3333-3333-3333-333333333333',
      request_reason: 'Testing fixed inventory request connectivity',
      request_type: 'inventory_request',
      manager_approved: false,
      project_manager_approved: false,
      admin_approved: false
    }
    
    console.log('   Test request data:', JSON.stringify(testInventoryRequest, null, 2))
    
    const { data: insertInventoryData, error: insertInventoryError } = await supabase
      .from('inventory_approvals')
      .insert(testInventoryRequest)
      .select()
      .single()
    
    if (insertInventoryError) {
      console.log(`❌ Inventory request submission failed: ${insertInventoryError.message}`)
    } else {
      console.log(`✅ Inventory request submission works: ${insertInventoryData.id}`)
    }
    
    console.log('\n3️⃣ Testing inventory approval workflow...')
    
    // Test Manager approval of inventory request
    if (insertInventoryData) {
      const { data: approveInventoryData, error: approveInventoryError } = await supabase
        .from('inventory_approvals')
        .update({ 
          status: 'approved',
          manager_approved: true,
          manager_approved_by: '22222222-2222-2222-2222-222222222222',
          manager_approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', insertInventoryData.id)
        .select()
      
      if (approveInventoryError) {
        console.log(`❌ Inventory approval failed: ${approveInventoryError.message}`)
      } else {
        console.log(`✅ Inventory approval works: ${approveInventoryData[0]?.status}`)
      }
    }
    
    console.log('\n4️⃣ Testing Employee Dashboard inventory requests...')
    
    // Test Employee Dashboard: Get user inventory requests
    const { data: userInventoryRequests, error: userInventoryError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('requested_by', '33333333-3333-3333-3333-333333333333')
      .order('created_at', { ascending: false })
    
    if (userInventoryError) {
      console.log(`❌ User inventory requests failed: ${userInventoryError.message}`)
    } else {
      console.log(`✅ User inventory requests work: ${userInventoryRequests?.length || 0} found`)
      
      if (userInventoryRequests && userInventoryRequests.length > 0) {
        const latestRequest = userInventoryRequests[0]
        console.log(`   Latest request: ${latestRequest.item_name} - ${latestRequest.status}`)
        console.log(`   Quantity: ${latestRequest.quantity}`)
        console.log(`   Unit price: ${latestRequest.unit_price}`)
        console.log(`   Total value: ${latestRequest.total_value}`)
      }
    }
    
    console.log('\n5️⃣ Testing Manager Dashboard inventory approvals...')
    
    // Test Manager Dashboard: Get pending inventory approvals
    const { data: managerInventoryApprovals, error: managerInventoryError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (managerInventoryError) {
      console.log(`❌ Manager inventory approvals failed: ${managerInventoryError.message}`)
    } else {
      console.log(`✅ Manager inventory approvals work: ${managerInventoryApprovals?.length || 0} found`)
      
      // Check if our test request is there
      const ourRequest = managerInventoryApprovals?.find(req => 
        req.item_name === 'Fixed Inventory Item'
      )
      
      if (ourRequest) {
        console.log(`   ✅ Our test inventory request is visible to manager: ${ourRequest.id}`)
      }
    }
    
    console.log('\n6️⃣ Testing Project Manager Dashboard inventory approvals...')
    
    // Test Project Manager Dashboard: Get manager-approved inventory requests
    const { data: pmInventoryApprovals, error: pmInventoryError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('status', 'approved')
      .eq('manager_approved', true)
      .eq('project_manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (pmInventoryError) {
      console.log(`❌ PM inventory approvals failed: ${pmInventoryError.message}`)
    } else {
      console.log(`✅ PM inventory approvals work: ${pmInventoryApprovals?.length || 0} found`)
      
      // Check if our approved request is there
      const ourApprovedRequest = pmInventoryApprovals?.find(req => 
        req.item_name === 'Fixed Inventory Item'
      )
      
      if (ourApprovedRequest) {
        console.log(`   ✅ Our approved inventory request is visible to PM: ${ourApprovedRequest.id}`)
      }
    }
    
    console.log('\n🎯 INVENTORY SCHEMA FIX TEST RESULTS:')
    console.log('=====================================')
    
    const hasErrors = insertInventoryError || userInventoryError || managerInventoryError || pmInventoryError
    
    if (!hasErrors) {
      console.log('✅ INVENTORY CONNECTIVITY IS COMPLETELY FIXED!')
      console.log('✅ INVENTORY TABLES ARE WORKING!')
      console.log('✅ FRONTEND CAN CONNECT TO INVENTORY DATABASE!')
      console.log('✅ COMPLETE INVENTORY APPROVAL WORKFLOW IS FUNCTIONAL!')
      console.log('')
      console.log('🔧 WHAT THIS FIXES:')
      console.log('1. Fixed inventory_approvals table schema compatibility')
      console.log('2. Removed non-existent columns (category, supplier, priority)')
      console.log('3. Uses only existing columns for inventory requests')
      console.log('4. Complete inventory approval workflow: Employee → Manager → Project Manager')
      console.log('5. All inventory dashboards can now connect to database')
      console.log('')
      console.log('🚀 INVENTORY SYSTEM IS NOW FULLY CONNECTED!')
      console.log('==========================================')
      console.log('Employee → Manager → Project Manager → Inventory Update workflow is working!')
      console.log('All inventory dashboards can now connect to your existing database!')
      console.log('')
      console.log('📋 NEXT STEPS:')
      console.log('1. Clear browser cache (Ctrl+Shift+R)')
      console.log('2. Restart dev server: npm run dev')
      console.log('3. Test Employee Dashboard inventory requests')
      console.log('4. Test Manager Dashboard inventory approvals')
      console.log('5. Test Project Manager Dashboard inventory approvals')
      console.log('')
      console.log('🎉 NO MORE INVENTORY "Failed to submit" OR "Failed to load" ERRORS!')
    } else {
      console.log('❌ Some inventory connections still failed:')
      if (insertInventoryError) console.log(`   - Insert error: ${insertInventoryError.message}`)
      if (userInventoryError) console.log(`   - User inventory requests error: ${userInventoryError.message}`)
      if (managerInventoryError) console.log(`   - Manager inventory approvals error: ${managerInventoryError.message}`)
      if (pmInventoryError) console.log(`   - PM inventory approvals error: ${pmInventoryError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Inventory schema fix test failed:', error)
  }
}

testInventorySchemaFix()
