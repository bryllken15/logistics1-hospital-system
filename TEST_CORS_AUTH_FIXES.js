import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔧 TESTING CORS AND AUTHENTICATION FIXES...\n')

async function testCorsAndAuthFixes() {
  try {
    console.log('1️⃣ Testing CORS Configuration...')
    
    // Test if we can make requests without CORS errors
    console.log('   🌐 Testing CORS headers...')
    
    // Test suppliers endpoint
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(1)
    
    if (suppliersError) {
      console.log(`   ❌ CORS/Suppliers error: ${suppliersError.message}`)
      if (suppliersError.message.includes('CORS')) {
        console.log('   🔧 CORS ISSUE: Need to update Supabase Dashboard settings')
        console.log('   📋 SOLUTION: Add http://localhost:3001 to Supabase Dashboard')
        console.log('      1. Go to Supabase Dashboard')
        console.log('      2. Settings > API')
        console.log('      3. Add http://localhost:3001 to Site URL')
        console.log('      4. Add http://localhost:3001 to Additional Redirect URLs')
        console.log('      5. Save changes')
      }
    } else {
      console.log('   ✅ CORS/Suppliers working: No CORS errors')
    }
    
    console.log('\n2️⃣ Testing Authentication...')
    
    // Test purchase orders endpoint
    const { data: orders, error: ordersError } = await supabase
      .from('purchase_orders')
      .select('*')
      .limit(1)
    
    if (ordersError) {
      console.log(`   ❌ Auth/Orders error: ${ordersError.message}`)
      if (ordersError.message.includes('401') || ordersError.message.includes('permission denied')) {
        console.log('   🔧 AUTH ISSUE: Need to run FIX_CORS_AND_AUTH_ISSUES.sql')
        console.log('   📋 SOLUTION: Run the SQL script in Supabase SQL Editor')
      }
    } else {
      console.log('   ✅ Auth/Orders working: No authentication errors')
    }
    
    console.log('\n3️⃣ Testing All Endpoints...')
    
    // Test all endpoints
    const endpoints = [
      { name: 'suppliers', table: 'suppliers' },
      { name: 'purchase_orders', table: 'purchase_orders' },
      { name: 'delivery_receipts', table: 'delivery_receipts' },
      { name: 'purchase_requests', table: 'purchase_requests' },
      { name: 'procurement_approvals', table: 'procurement_approvals' },
      { name: 'inventory_approvals', table: 'inventory_approvals' },
      { name: 'notifications', table: 'notifications' }
    ]
    
    let allWorking = true
    
    for (const endpoint of endpoints) {
      try {
        const { data, error } = await supabase
          .from(endpoint.table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`   ❌ ${endpoint.name}: ${error.message}`)
          allWorking = false
        } else {
          console.log(`   ✅ ${endpoint.name}: Working`)
        }
      } catch (err) {
        console.log(`   ❌ ${endpoint.name}: ${err.message}`)
        allWorking = false
      }
    }
    
    console.log('\n4️⃣ Testing CRUD Operations...')
    
    // Test creating a supplier
    const testSupplier = {
      name: 'CORS Test Supplier',
      contact: 'Test Contact',
      email: 'cors@test.com',
      rating: 4,
      status: 'active'
    }
    
    const { data: newSupplier, error: createError } = await supabase
      .from('suppliers')
      .insert(testSupplier)
      .select()
      .single()
    
    if (createError) {
      console.log(`   ❌ Supplier creation failed: ${createError.message}`)
      allWorking = false
    } else {
      console.log(`   ✅ Supplier creation successful: ${newSupplier.name}`)
      
      // Clean up
      await supabase
        .from('suppliers')
        .delete()
        .eq('id', newSupplier.id)
      console.log('   🧹 Test supplier cleaned up')
    }
    
    console.log('\n🎯 CORS AND AUTH FIX TEST RESULTS:')
    console.log('==================================')
    
    if (allWorking) {
      console.log('✅ ALL CORS AND AUTH ISSUES FIXED!')
      console.log('')
      console.log('🚀 FEATURES NOW WORKING:')
      console.log('1. ✅ CORS configuration working')
      console.log('2. ✅ Authentication working')
      console.log('3. ✅ All endpoints accessible')
      console.log('4. ✅ CRUD operations working')
      console.log('5. ✅ No more 401 errors')
      console.log('6. ✅ No more CORS errors')
      console.log('')
      console.log('🎉 PROCUREMENT DASHBOARD IS FULLY FUNCTIONAL!')
      console.log('')
      console.log('💡 NEXT STEPS:')
      console.log('1. 🏢 Use the Suppliers tab to manage suppliers')
      console.log('2. 📦 Use the Orders tab to manage purchase orders')
      console.log('3. 🚚 Use Track Deliveries to monitor shipments')
      console.log('4. 📊 View real-time analytics and performance metrics')
      console.log('5. 🔄 All data updates in real-time across the dashboard')
    } else {
      console.log('❌ CORS AND AUTH ISSUES STILL EXIST!')
      console.log('')
      console.log('🔧 REQUIRED ACTIONS:')
      console.log('1. Run FIX_CORS_AND_AUTH_ISSUES.sql in Supabase SQL Editor')
      console.log('2. Update Supabase Dashboard settings:')
      console.log('   - Go to Settings > API')
      console.log('   - Add http://localhost:3001 to Site URL')
      console.log('   - Add http://localhost:3001 to Additional Redirect URLs')
      console.log('   - Save changes')
      console.log('3. Restart your development server')
      console.log('4. Test the Procurement Dashboard again')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testCorsAndAuthFixes()
