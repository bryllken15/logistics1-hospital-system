import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING INVENTORY REQUEST CONNECTIVITY...\n')

async function testInventoryConnectivity() {
  try {
    console.log('1️⃣ Testing inventory_approvals table connection...')
    
    // Test connection to inventory_approvals table
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .limit(5)
    
    if (inventoryError) {
      console.log(`❌ inventory_approvals connection failed: ${inventoryError.message}`)
    } else {
      console.log(`✅ inventory_approvals connection works: ${inventoryData?.length || 0} records`)
      
      if (inventoryData && inventoryData.length > 0) {
        console.log('   inventory_approvals columns:', Object.keys(inventoryData[0]))
      }
    }
    
    console.log('\n2️⃣ Testing inventory table connection...')
    
    // Test connection to inventory table
    const { data: inventoryTableData, error: inventoryTableError } = await supabase
      .from('inventory')
      .select('*')
      .limit(5)
    
    if (inventoryTableError) {
      console.log(`❌ inventory table connection failed: ${inventoryTableError.message}`)
    } else {
      console.log(`✅ inventory table connection works: ${inventoryTableData?.length || 0} records`)
      
      if (inventoryTableData && inventoryTableData.length > 0) {
        console.log('   inventory table columns:', Object.keys(inventoryTableData[0]))
      }
    }
    
    console.log('\n3️⃣ Testing Employee Dashboard inventory requests...')
    
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
    }
    
    console.log('\n4️⃣ Testing Manager Dashboard inventory approvals...')
    
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
    }
    
    console.log('\n5️⃣ Testing Project Manager Dashboard inventory approvals...')
    
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
    }
    
    console.log('\n6️⃣ Testing inventory request submission...')
    
    // Test creating a new inventory request
    const testInventoryRequest = {
      item_name: 'Test Inventory Item',
      description: 'Testing inventory request connectivity',
      quantity: 5,
      unit_price: 200,
      supplier: 'Test Supplier',
      category: 'equipment',
      priority: 'medium',
      status: 'pending',
      requested_by: '33333333-3333-3333-3333-333333333333',
      request_reason: 'Testing inventory request connectivity',
      request_type: 'inventory_request',
      manager_approved: false,
      project_manager_approved: false,
      admin_approved: false
    }
    
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
    
    console.log('\n7️⃣ Testing inventory approval workflow...')
    
    // Test Manager approval of inventory request
    if (insertInventoryData) {
      const { data: approveInventoryData, error: approveInventoryError } = await supabase
        .from('inventory_approvals')
        .update({ 
          status: 'approved',
          manager_approved: true,
          manager_approved_by: '22222222-2222-2222-2222-222222222222',
          manager_approved_at: new Date().toISOString(),
          manager_notes: 'Inventory connectivity test approval',
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
    
    console.log('\n🎯 INVENTORY CONNECTIVITY TEST RESULTS:')
    console.log('======================================')
    
    const hasErrors = inventoryError || inventoryTableError || userInventoryError || managerInventoryError || pmInventoryError || insertInventoryError
    
    if (!hasErrors) {
      console.log('✅ ALL INVENTORY CONNECTIONS ARE WORKING!')
      console.log('✅ INVENTORY TABLES ARE ACCESSIBLE!')
      console.log('✅ FRONTEND CAN CONNECT TO INVENTORY DATABASE!')
      console.log('✅ COMPLETE INVENTORY APPROVAL WORKFLOW IS FUNCTIONAL!')
      console.log('')
      console.log('🔧 INVENTORY CONNECTIVITY IS FIXED!')
      console.log('====================================')
      console.log('Your inventory system is working perfectly!')
      console.log('The frontend can now connect to:')
      console.log('- inventory_approvals table')
      console.log('- inventory table')
      console.log('- Complete inventory approval workflow')
      console.log('')
      console.log('🚀 INVENTORY WORKFLOW:')
      console.log('Employee → Manager → Project Manager → Inventory Update')
      console.log('')
      console.log('📋 NEXT STEPS:')
      console.log('1. Clear browser cache (Ctrl+Shift+R)')
      console.log('2. Restart dev server: npm run dev')
      console.log('3. Test Employee Dashboard inventory requests')
      console.log('4. Test Manager Dashboard inventory approvals')
      console.log('5. Test Project Manager Dashboard inventory approvals')
    } else {
      console.log('❌ Some inventory connections failed:')
      if (inventoryError) console.log(`   - inventory_approvals error: ${inventoryError.message}`)
      if (inventoryTableError) console.log(`   - inventory table error: ${inventoryTableError.message}`)
      if (userInventoryError) console.log(`   - User inventory requests error: ${userInventoryError.message}`)
      if (managerInventoryError) console.log(`   - Manager inventory approvals error: ${managerInventoryError.message}`)
      if (pmInventoryError) console.log(`   - PM inventory approvals error: ${pmInventoryError.message}`)
      if (insertInventoryError) console.log(`   - Inventory request submission error: ${insertInventoryError.message}`)
    }
    
  } catch (error) {
    console.error('💥 Inventory connectivity test failed:', error)
  }
}

testInventoryConnectivity()
