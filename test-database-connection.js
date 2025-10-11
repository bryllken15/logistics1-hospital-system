#!/usr/bin/env node

/**
 * Test database connection and table existence
 * Run this to verify your Supabase setup is working
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

if (!supabaseUrl.includes('your-project') && !supabaseKey.includes('your-anon-key')) {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  async function testDatabaseConnection() {
    console.log('🔍 Testing database connection and table existence...\n')
    
    try {
      // Test 1: Check basic connection
      console.log('1️⃣ Testing basic connection...')
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.log('❌ Basic connection failed:', testError.message)
        return
      }
      console.log('✅ Basic connection successful')
      
      // Test 2: Check if approval tables exist
      console.log('\n2️⃣ Checking approval tables...')
      
      const tables = [
        'inventory_approvals',
        'inventory_change_requests', 
        'admin_pending_requests',
        'approval_notifications'
      ]
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1)
          
          if (error) {
            console.log(`❌ Table '${table}' does not exist:`, error.message)
          } else {
            console.log(`✅ Table '${table}' exists`)
          }
        } catch (err) {
          console.log(`❌ Table '${table}' does not exist:`, err.message)
        }
      }
      
      // Test 3: Check if sample users exist
      console.log('\n3️⃣ Checking sample users...')
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .in('id', [
          '11111111-1111-1111-1111-111111111111',
          '22222222-2222-2222-2222-222222222222',
          '33333333-3333-3333-3333-333333333333'
        ])
      
      if (usersError) {
        console.log('❌ Users table error:', usersError.message)
      } else {
        console.log(`✅ Found ${users.length} sample users`)
        users.forEach(user => {
          console.log(`   - ${user.full_name} (${user.role})`)
        })
      }
      
      // Test 4: Check if sample inventory exists
      console.log('\n4️⃣ Checking sample inventory...')
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('id, item_name, quantity, status')
        .limit(3)
      
      if (inventoryError) {
        console.log('❌ Inventory table error:', inventoryError.message)
      } else {
        console.log(`✅ Found ${inventory.length} inventory items`)
        inventory.forEach(item => {
          console.log(`   - ${item.item_name} (${item.quantity} units, ${item.status})`)
        })
      }
      
      // Test 5: Try to create a test inventory request
      console.log('\n5️⃣ Testing inventory request creation...')
      try {
        const testRequest = {
          inventory_id: '00000000-0000-0000-0000-000000000001',
          change_type: 'quantity_increase',
          current_value: '100',
          requested_value: '150',
          quantity_change: 50,
          reason: 'Test request for database verification',
          requested_by: '33333333-3333-3333-3333-333333333333',
          status: 'pending'
        }
        
        const { data: requestResult, error: requestError } = await supabase
          .from('inventory_change_requests')
          .insert(testRequest)
          .select()
        
        if (requestError) {
          console.log('❌ Inventory request creation failed:', requestError.message)
        } else {
          console.log('✅ Inventory request created successfully!')
          console.log('   Request ID:', requestResult[0].id)
          
          // Clean up test request
          await supabase
            .from('inventory_change_requests')
            .delete()
            .eq('id', requestResult[0].id)
          console.log('   Test request cleaned up')
        }
      } catch (err) {
        console.log('❌ Inventory request creation failed:', err.message)
      }
      
      console.log('\n🎉 Database connection test completed!')
      console.log('\n📋 Summary:')
      console.log('   - Basic connection: ✅')
      console.log('   - Approval tables: Check results above')
      console.log('   - Sample data: Check results above')
      console.log('   - Request creation: Check results above')
      
    } catch (error) {
      console.error('❌ Test failed:', error)
    }
  }
  
  // Run the test
  testDatabaseConnection()
} else {
  console.log('⚠️  Supabase configuration not found.')
  console.log('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
  console.log('   Or update the script with your Supabase credentials.')
}
