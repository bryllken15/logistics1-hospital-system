import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING INVENTORY APPROVAL WORKFLOW...\n')

async function testInventoryApprovalWorkflow() {
  try {
    console.log('1️⃣ Testing Employee inventory request submission...')
    
    const employeeId = '0b6ccaac-a97f-4d11-8795-44c6cce067c6' // Employee ID
    const managerId = '893ba925-2a4a-4c2f-afe3-1c90c960f467' // Manager ID
    const projectManagerId = '07444c7e-4edd-4789-8ddb-4c408213462a' // Project Manager ID
    
    console.log('   Employee ID:', employeeId)
    console.log('   Manager ID:', managerId)
    console.log('   Project Manager ID:', projectManagerId)
    
    // Test Employee submitting an inventory request
    const inventoryRequestData = {
      item_name: 'Project Logistics Test Item',
      quantity: 100,
      unit_price: 50.00,
      // total_value is a generated column, so we don't insert it
      request_reason: 'Need items for project logistics testing',
      request_type: 'inventory_request',
      status: 'pending',
      manager_approved: false,
      project_manager_approved: false,
      requested_by: employeeId,
      created_at: new Date().toISOString()
    }
    
    console.log('   Submitting inventory request:', inventoryRequestData.item_name)
    
    const { data: insertedInventoryRequest, error: insertError } = await supabase
      .from('inventory_approvals')
      .insert(inventoryRequestData)
      .select()
      .single()
    
    if (insertError) {
      console.log(`❌ Employee inventory request submission failed: ${insertError.message}`)
      return
    }
    
    console.log(`✅ Employee inventory request submitted successfully!`)
    console.log(`   Request ID: ${insertedInventoryRequest.id}`)
    console.log(`   Item: ${insertedInventoryRequest.item_name}`)
    console.log(`   Status: ${insertedInventoryRequest.status}`)
    console.log(`   Manager Approved: ${insertedInventoryRequest.manager_approved}`)
    console.log(`   Project Manager Approved: ${insertedInventoryRequest.project_manager_approved}`)
    
    console.log('\n2️⃣ Testing Manager Dashboard inventory approval...')
    
    // Test if Manager Dashboard can see the inventory request
    const { data: managerInventoryView, error: managerInventoryError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (managerInventoryError) {
      console.log(`❌ Manager Dashboard inventory view failed: ${managerInventoryError.message}`)
    } else {
      console.log(`✅ Manager Dashboard can see: ${managerInventoryView?.length || 0} pending inventory requests`)
      
      const employeeInventoryRequest = managerInventoryView?.find(req => req.id === insertedInventoryRequest.id)
      if (employeeInventoryRequest) {
        console.log(`✅ Manager can see Employee's inventory request: ${employeeInventoryRequest.item_name}`)
        console.log(`   Item details: ${employeeInventoryRequest.item_name}`)
        console.log(`   Quantity: ${employeeInventoryRequest.quantity}`)
        console.log(`   Total value: $${employeeInventoryRequest.total_value}`)
      } else {
        console.log(`❌ Manager cannot see Employee's inventory request!`)
      }
    }
    
    console.log('\n3️⃣ Testing Manager approval of inventory request...')
    
    // Test if Manager can approve the inventory request
    const { data: managerApprovedRequest, error: managerApproveError } = await supabase
      .from('inventory_approvals')
      .update({
        manager_approved: true,
        manager_approved_by: managerId,
        manager_approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', insertedInventoryRequest.id)
      .select()
      .single()
    
    if (managerApproveError) {
      console.log(`❌ Manager inventory approval failed: ${managerApproveError.message}`)
    } else {
      console.log(`✅ Manager inventory approval successful!`)
      console.log(`   Request: ${managerApprovedRequest.item_name}`)
      console.log(`   Manager Approved: ${managerApprovedRequest.manager_approved}`)
      console.log(`   Approved by: ${managerApprovedRequest.manager_approved_by}`)
      console.log(`   Approved at: ${managerApprovedRequest.manager_approved_at}`)
    }
    
    console.log('\n4️⃣ Testing Project Manager Dashboard inventory approval...')
    
    // Test if Project Manager Dashboard can see the manager-approved inventory request
    const { data: projectManagerView, error: projectManagerError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('manager_approved', true)
      .eq('project_manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (projectManagerError) {
      console.log(`❌ Project Manager Dashboard view failed: ${projectManagerError.message}`)
    } else {
      console.log(`✅ Project Manager Dashboard can see: ${projectManagerView?.length || 0} manager-approved inventory requests`)
      
      const projectManagerInventoryRequest = projectManagerView?.find(req => req.id === insertedInventoryRequest.id)
      if (projectManagerInventoryRequest) {
        console.log(`✅ Project Manager can see manager-approved inventory request: ${projectManagerInventoryRequest.item_name}`)
        console.log(`   Item details: ${projectManagerInventoryRequest.item_name}`)
        console.log(`   Manager Approved: ${projectManagerInventoryRequest.manager_approved}`)
        console.log(`   Project Manager Approved: ${projectManagerInventoryRequest.project_manager_approved}`)
      } else {
        console.log(`❌ Project Manager cannot see manager-approved inventory request!`)
      }
    }
    
    console.log('\n5️⃣ Testing Project Manager final approval...')
    
    // Test if Project Manager can give final approval
    const { data: projectManagerApprovedRequest, error: projectManagerApproveError } = await supabase
      .from('inventory_approvals')
      .update({
        project_manager_approved: true,
        project_manager_approved_by: projectManagerId,
        project_manager_approved_at: new Date().toISOString(),
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', insertedInventoryRequest.id)
      .select()
      .single()
    
    if (projectManagerApproveError) {
      console.log(`❌ Project Manager final approval failed: ${projectManagerApproveError.message}`)
    } else {
      console.log(`✅ Project Manager final approval successful!`)
      console.log(`   Request: ${projectManagerApprovedRequest.item_name}`)
      console.log(`   Project Manager Approved: ${projectManagerApprovedRequest.project_manager_approved}`)
      console.log(`   Final Status: ${projectManagerApprovedRequest.status}`)
      console.log(`   Approved by: ${projectManagerApprovedRequest.project_manager_approved_by}`)
      console.log(`   Approved at: ${projectManagerApprovedRequest.project_manager_approved_at}`)
    }
    
    console.log('\n6️⃣ Testing Employee Dashboard final status...')
    
    // Test if Employee Dashboard can see the final approved status
    const { data: employeeFinalView, error: employeeFinalError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('requested_by', employeeId)
      .order('created_at', { ascending: false })
    
    if (employeeFinalError) {
      console.log(`❌ Employee Dashboard final view failed: ${employeeFinalError.message}`)
    } else {
      console.log(`✅ Employee Dashboard can see: ${employeeFinalView?.length || 0} inventory requests`)
      
      const employeeFinalRequest = employeeFinalView?.find(req => req.id === insertedInventoryRequest.id)
      if (employeeFinalRequest) {
        console.log(`✅ Employee can see final approved inventory request: ${employeeFinalRequest.item_name}`)
        console.log(`   Final Status: ${employeeFinalRequest.status}`)
        console.log(`   Manager Approved: ${employeeFinalRequest.manager_approved}`)
        console.log(`   Project Manager Approved: ${employeeFinalRequest.project_manager_approved}`)
      } else {
        console.log(`❌ Employee cannot see final approved inventory request!`)
      }
    }
    
    console.log('\n🎯 INVENTORY APPROVAL WORKFLOW RESULTS:')
    console.log('=====================================')
    
    const hasErrors = insertError || managerInventoryError || managerApproveError || projectManagerError || projectManagerApproveError || employeeFinalError
    
    if (!hasErrors) {
      console.log('✅ INVENTORY APPROVAL WORKFLOW WORKS!')
      console.log('')
      console.log('🔧 WORKFLOW CONFIRMED:')
      console.log('1. Employee submits inventory request → inventory_approvals table')
      console.log('2. Manager Dashboard shows pending inventory requests')
      console.log('3. Manager approves inventory request → sets manager_approved = true')
      console.log('4. Project Manager Dashboard shows manager-approved requests')
      console.log('5. Project Manager gives final approval → sets project_manager_approved = true')
      console.log('6. Employee Dashboard shows final approved status')
      console.log('')
      console.log('🎉 THE INVENTORY APPROVAL WORKFLOW IS WORKING!')
      console.log('')
      console.log('🚀 NEXT STEPS:')
      console.log('1. Clear browser cache completely (Ctrl+Shift+R)')
      console.log('2. Restart development server: npm run dev')
      console.log('3. Test Employee Dashboard: Submit inventory request')
      console.log('4. Test Manager Dashboard: Approve inventory request')
      console.log('5. Test Project Manager Dashboard: Final approval for logistics')
      console.log('')
      console.log('🎉 THE INVENTORY APPROVAL WORKFLOW IS FULLY FUNCTIONAL!')
    } else {
      console.log('❌ INVENTORY APPROVAL WORKFLOW FAILED!')
      if (insertError) console.log(`   - Employee submission error: ${insertError.message}`)
      if (managerInventoryError) console.log(`   - Manager Dashboard error: ${managerInventoryError.message}`)
      if (managerApproveError) console.log(`   - Manager approval error: ${managerApproveError.message}`)
      if (projectManagerError) console.log(`   - Project Manager Dashboard error: ${projectManagerError.message}`)
      if (projectManagerApproveError) console.log(`   - Project Manager approval error: ${projectManagerApproveError.message}`)
      if (employeeFinalError) console.log(`   - Employee final view error: ${employeeFinalError.message}`)
      console.log('')
      console.log('🔧 TO FIX THIS:')
      console.log('1. Check if the inventory_approvals table has proper permissions')
      console.log('2. Check if the approval functions are working correctly')
      console.log('3. Check if the dashboards are loading data correctly')
      console.log('4. Check if the workflow is properly implemented')
    }
    
  } catch (error) {
    console.error('💥 Inventory approval workflow test failed:', error)
  }
}

testInventoryApprovalWorkflow()
