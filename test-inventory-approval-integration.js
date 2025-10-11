#!/usr/bin/env node

/**
 * Test script for inventory approval workflow integration
 * This script tests the complete flow from employee request to manager/project manager approval
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

if (!supabaseUrl.includes('your-project') && !supabaseKey.includes('your-anon-key')) {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  async function testInventoryApprovalIntegration() {
    console.log('🧪 Testing Inventory Approval Workflow Integration...\n')
    
    try {
      // Test 1: Check if database tables exist
      console.log('1️⃣ Checking database tables...')
      
      const { data: inventoryApprovals, error: approvalsError } = await supabase
        .from('inventory_approvals')
        .select('*')
        .limit(1)
      
      const { data: changeRequests, error: changeError } = await supabase
        .from('inventory_change_requests')
        .select('*')
        .limit(1)
      
      if (approvalsError) {
        console.log('❌ inventory_approvals table not found:', approvalsError.message)
      } else {
        console.log('✅ inventory_approvals table exists')
      }
      
      if (changeError) {
        console.log('❌ inventory_change_requests table not found:', changeError.message)
      } else {
        console.log('✅ inventory_change_requests table exists')
      }
      
      // Test 2: Create a sample inventory change request
      console.log('\n2️⃣ Creating sample inventory change request...')
      
      const sampleChangeRequest = {
        inventory_id: '00000000-0000-0000-0000-000000000001', // Sample inventory ID
        change_type: 'quantity_increase',
        current_value: '50',
        requested_value: '100',
        quantity_change: 50,
        reason: 'Test integration - need more supplies for project',
        requested_by: '33333333-3333-3333-3333-333333333333', // Employee ID
        status: 'pending'
      }
      
      const { data: createdRequest, error: createError } = await supabase
        .from('inventory_change_requests')
        .insert(sampleChangeRequest)
        .select()
      
      if (createError) {
        console.log('❌ Failed to create change request:', createError.message)
      } else {
        console.log('✅ Sample change request created:', createdRequest[0].id)
      }
      
      // Test 3: Test fetching pending requests
      console.log('\n3️⃣ Testing fetching pending requests...')
      
      const { data: pendingRequests, error: fetchError } = await supabase
        .from('inventory_change_requests')
        .select(`
          *,
          inventory:inventory_id (id, item_name, rfid_code),
          changed_by_user:requested_by (id, full_name),
          approved_by_user:approved_by (id, full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (fetchError) {
        console.log('❌ Failed to fetch pending requests:', fetchError.message)
      } else {
        console.log(`✅ Found ${pendingRequests.length} pending change requests`)
        if (pendingRequests.length > 0) {
          console.log('   Sample request:', {
            id: pendingRequests[0].id,
            change_type: pendingRequests[0].change_type,
            quantity_change: pendingRequests[0].quantity_change,
            reason: pendingRequests[0].reason
          })
        }
      }
      
      // Test 4: Test manager approval
      console.log('\n4️⃣ Testing manager approval...')
      
      if (pendingRequests && pendingRequests.length > 0) {
        const requestId = pendingRequests[0].id
        
        const { data: approvalResult, error: approvalError } = await supabase
          .from('inventory_change_requests')
          .update({
            status: 'approved',
            approved_by: '22222222-2222-2222-2222-222222222222', // Manager ID
            manager_approved: true,
            manager_approved_by: '22222222-2222-2222-2222-222222222222',
            manager_approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId)
          .select()
        
        if (approvalError) {
          console.log('❌ Failed to approve request:', approvalError.message)
        } else {
          console.log('✅ Manager approval successful')
        }
      }
      
      // Test 5: Test project manager approval
      console.log('\n5️⃣ Testing project manager approval...')
      
      if (pendingRequests && pendingRequests.length > 0) {
        const requestId = pendingRequests[0].id
        
        const { data: pmApprovalResult, error: pmApprovalError } = await supabase
          .from('inventory_change_requests')
          .update({
            project_manager_approved: true,
            project_manager_approved_by: '44444444-4444-4444-4444-444444444444', // Project Manager ID
            project_manager_approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId)
          .select()
        
        if (pmApprovalError) {
          console.log('❌ Failed to approve by project manager:', pmApprovalError.message)
        } else {
          console.log('✅ Project manager approval successful')
        }
      }
      
      console.log('\n🎉 Integration test completed!')
      console.log('\n📋 Summary:')
      console.log('   - Database tables: Checked')
      console.log('   - Sample request creation: Tested')
      console.log('   - Pending requests fetching: Tested')
      console.log('   - Manager approval: Tested')
      console.log('   - Project manager approval: Tested')
      
    } catch (error) {
      console.error('❌ Test failed:', error)
    }
  }
  
  // Run the test
  testInventoryApprovalIntegration()
} else {
  console.log('⚠️  Supabase configuration not found.')
  console.log('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
  console.log('   Or update the script with your Supabase credentials.')
}
