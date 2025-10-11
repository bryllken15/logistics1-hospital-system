import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 TESTING PROJECT MANAGER DATA SOURCES...\n')

async function testProjectManagerDataSources() {
  try {
    console.log('1️⃣ Testing inventoryService.getPendingApprovals() function...')
    
    // Test what inventoryService.getPendingApprovals() actually returns
    const { data: inventoryServiceData, error: inventoryServiceError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (inventoryServiceError) {
      console.log(`❌ inventoryService.getPendingApprovals() failed: ${inventoryServiceError.message}`)
    } else {
      console.log(`✅ inventoryService.getPendingApprovals(): ${inventoryServiceData?.length || 0} items`)
      console.log('   This is what the Project Manager Dashboard is receiving from inventoryService')
      
      if (inventoryServiceData && inventoryServiceData.length > 0) {
        console.log('   Sample inventory service data:')
        inventoryServiceData.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.item_name} - Manager Approved: ${item.manager_approved}`)
        })
      }
    }
    
    console.log('\n2️⃣ Testing what Project Manager Dashboard SHOULD receive...')
    
    // Test what Project Manager Dashboard should actually receive
    const { data: projectManagerShouldReceive, error: projectManagerError } = await supabase
      .from('inventory_approvals')
      .select('*')
      .eq('manager_approved', true)
      .eq('project_manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (projectManagerError) {
      console.log(`❌ Project Manager should receive failed: ${projectManagerError.message}`)
    } else {
      console.log(`✅ Project Manager should receive: ${projectManagerShouldReceive?.length || 0} items`)
      console.log('   This is what the Project Manager Dashboard SHOULD be receiving')
      
      if (projectManagerShouldReceive && projectManagerShouldReceive.length > 0) {
        console.log('   Sample Project Manager should receive:')
        projectManagerShouldReceive.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.item_name} - Manager Approved: ${item.manager_approved} - PM Approved: ${item.project_manager_approved}`)
        })
      }
    }
    
    console.log('\n3️⃣ Testing procurementApprovalService.getPendingProjectManagerApprovals()...')
    
    // Test what procurementApprovalService.getPendingProjectManagerApprovals() returns
    const { data: procurementServiceData, error: procurementServiceError } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('status', 'pending')
      .eq('manager_approved', true)
      .eq('project_manager_approved', false)
      .order('created_at', { ascending: false })
    
    if (procurementServiceError) {
      console.log(`❌ procurementApprovalService.getPendingProjectManagerApprovals() failed: ${procurementServiceError.message}`)
    } else {
      console.log(`✅ procurementApprovalService.getPendingProjectManagerApprovals(): ${procurementServiceData?.length || 0} items`)
      console.log('   This is what the Project Manager Dashboard is receiving from procurementApprovalService')
      
      if (procurementServiceData && procurementServiceData.length > 0) {
        console.log('   Sample procurement service data:')
        procurementServiceData.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.item_name} - Manager Approved: ${item.manager_approved} - PM Approved: ${item.project_manager_approved}`)
        })
      }
    }
    
    console.log('\n4️⃣ Testing the data mismatch...')
    
    const inventoryServiceCount = inventoryServiceData?.length || 0
    const projectManagerShouldCount = projectManagerShouldReceive?.length || 0
    const procurementServiceCount = procurementServiceData?.length || 0
    
    console.log('   Data comparison:')
    console.log(`   - inventoryService.getPendingApprovals(): ${inventoryServiceCount} items`)
    console.log(`   - Project Manager should receive: ${projectManagerShouldCount} items`)
    console.log(`   - procurementApprovalService.getPendingProjectManagerApprovals(): ${procurementServiceCount} items`)
    
    if (inventoryServiceCount !== projectManagerShouldCount) {
      console.log('')
      console.log('⚠️  DATA MISMATCH DETECTED!')
      console.log(`   inventoryService returns: ${inventoryServiceCount} items`)
      console.log(`   Project Manager should receive: ${projectManagerShouldCount} items`)
      console.log('')
      console.log('🔧 THE ISSUE IS:')
      console.log('1. inventoryService.getPendingApprovals() looks for manager_approved = false')
      console.log('2. Project Manager Dashboard needs manager_approved = true AND project_manager_approved = false')
      console.log('3. This is why Project Manager Dashboard shows no inventory approvals!')
      console.log('')
      console.log('✅ THIS EXPLAINS WHY PROJECT MANAGER DASHBOARD IS NOT SHOWING DATA!')
    } else {
      console.log('')
      console.log('✅ NO DATA MISMATCH DETECTED!')
      console.log('   The data sources are working correctly')
    }
    
    console.log('\n🎯 PROJECT MANAGER DATA SOURCES RESULTS:')
    console.log('========================================')
    
    if (inventoryServiceError || projectManagerError || procurementServiceError) {
      console.log('❌ PROJECT MANAGER DATA SOURCES FAILED!')
      if (inventoryServiceError) console.log(`   - inventoryService error: ${inventoryServiceError.message}`)
      if (projectManagerError) console.log(`   - Project Manager should receive error: ${projectManagerError.message}`)
      if (procurementServiceError) console.log(`   - procurementService error: ${procurementServiceError.message}`)
    } else {
      console.log('✅ PROJECT MANAGER DATA SOURCES ANALYSIS COMPLETE!')
      console.log('')
      console.log('🔧 THE ISSUE IS IDENTIFIED:')
      console.log('1. inventoryService.getPendingApprovals() is looking for the wrong data')
      console.log('2. It should look for manager_approved = true AND project_manager_approved = false')
      console.log('3. This is why Project Manager Dashboard shows no inventory approvals')
      console.log('')
      console.log('🚀 TO FIX THIS:')
      console.log('1. Update inventoryService.getPendingApprovals() to look for the right data')
      console.log('2. Or create a new function specifically for Project Manager Dashboard')
      console.log('3. This will make Project Manager Dashboard show the correct data')
      console.log('')
      console.log('🎉 THE PROJECT MANAGER DATA SOURCE ISSUE IS IDENTIFIED!')
    }
    
  } catch (error) {
    console.error('💥 Project Manager data sources test failed:', error)
  }
}

testProjectManagerDataSources()
