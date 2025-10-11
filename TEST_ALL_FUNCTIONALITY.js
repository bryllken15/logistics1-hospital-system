import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAllFunctionality() {
  console.log('🚀 TESTING ALL FUNCTIONALITY AFTER DATABASE REBUILD\n')

  let passedTests = 0
  let totalTests = 0

  // Test 1: Authentication
  console.log('1. Testing Authentication...')
  totalTests++
  try {
    const { data, error } = await supabase.rpc('authenticate_user', {
      user_username: 'admin',
      user_password: 'admin123'
    })
    
    if (error) {
      console.error('❌ Authentication failed:', error)
    } else if (data && data.length > 0 && data[0].user_id) {
      console.log('✅ Authentication working - Admin user found')
      passedTests++
    } else {
      console.error('❌ Authentication returned no data')
    }
  } catch (error) {
    console.error('❌ Authentication error:', error)
  }

  // Test 2: Users Table Access
  console.log('\n2. Testing Users Table Access...')
  totalTests++
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username, full_name, role')
      .limit(5)

    if (error) {
      console.error('❌ Users table access failed:', error)
    } else {
      console.log('✅ Users table accessible - Found', data.length, 'users')
      console.log('   Users:', data.map(u => `${u.username} (${u.full_name})`).join(', '))
      passedTests++
    }
  } catch (error) {
    console.error('❌ Users table error:', error)
  }

  // Test 3: Projects Table Access
  console.log('\n3. Testing Projects Table Access...')
  totalTests++
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('name, status, priority')
      .limit(5)

    if (error) {
      console.error('❌ Projects table access failed:', error)
    } else {
      console.log('✅ Projects table accessible - Found', data.length, 'projects')
      if (data.length > 0) {
        console.log('   Projects:', data.map(p => `${p.name} (${p.status})`).join(', '))
      }
      passedTests++
    }
  } catch (error) {
    console.error('❌ Projects table error:', error)
  }

  // Test 4: Documents Table Access
  console.log('\n4. Testing Documents Table Access...')
  totalTests++
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('title, status, category')
      .limit(5)

    if (error) {
      console.error('❌ Documents table access failed:', error)
    } else {
      console.log('✅ Documents table accessible - Found', data.length, 'documents')
      passedTests++
    }
  } catch (error) {
    console.error('❌ Documents table error:', error)
  }

  // Test 5: Assets Table Access
  console.log('\n5. Testing Assets Table Access...')
  totalTests++
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('name, asset_type, status')
      .limit(5)

    if (error) {
      console.error('❌ Assets table access failed:', error)
    } else {
      console.log('✅ Assets table accessible - Found', data.length, 'assets')
      if (data.length > 0) {
        console.log('   Assets:', data.map(a => `${a.name} (${a.asset_type})`).join(', '))
      }
      passedTests++
    }
  } catch (error) {
    console.error('❌ Assets table error:', error)
  }

  // Test 6: Inventory Table Access
  console.log('\n6. Testing Inventory Table Access...')
  totalTests++
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('item_name, quantity, unit_price')
      .limit(5)

    if (error) {
      console.error('❌ Inventory table access failed:', error)
    } else {
      console.log('✅ Inventory table accessible - Found', data.length, 'items')
      if (data.length > 0) {
        console.log('   Items:', data.map(i => `${i.item_name} (Qty: ${i.quantity})`).join(', '))
      }
      passedTests++
    }
  } catch (error) {
    console.error('❌ Inventory table error:', error)
  }

  // Test 7: Enhanced Tables Access
  console.log('\n7. Testing Enhanced Tables Access...')
  totalTests++
  try {
    const enhancedTables = ['spare_parts', 'maintenance_work_orders', 'document_versions', 'document_approvals', 'asset_maintenance_schedules']
    let enhancedTablesWorking = 0

    for (const table of enhancedTables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1)

      if (!error) {
        enhancedTablesWorking++
      }
    }

    if (enhancedTablesWorking === enhancedTables.length) {
      console.log('✅ All enhanced tables accessible')
      passedTests++
    } else {
      console.log(`❌ Only ${enhancedTablesWorking}/${enhancedTables.length} enhanced tables accessible`)
    }
  } catch (error) {
    console.error('❌ Enhanced tables error:', error)
  }

  // Test 8: Create Test Project
  console.log('\n8. Testing Project Creation...')
  totalTests++
  try {
    const testProject = {
      name: 'Test Project ' + Date.now(),
      description: 'Test project created by automated test',
      status: 'active',
      priority: 'medium',
      created_by: '11111111-1111-1111-1111-111111111111'
    }

    const { data, error } = await supabase
      .from('projects')
      .insert(testProject)
      .select()

    if (error) {
      console.error('❌ Project creation failed:', error)
    } else {
      console.log('✅ Project creation working - Created:', data[0].name)
      passedTests++
    }
  } catch (error) {
    console.error('❌ Project creation error:', error)
  }

  // Test 9: Create Test Document
  console.log('\n9. Testing Document Creation...')
  totalTests++
  try {
    const testDocument = {
      title: 'Test Document ' + Date.now(),
      description: 'Test document created by automated test',
      file_name: 'test.pdf',
      file_type: 'application/pdf',
      category: 'Test',
      status: 'draft',
      uploaded_by: '11111111-1111-1111-1111-111111111111'
    }

    const { data, error } = await supabase
      .from('documents')
      .insert(testDocument)
      .select()

    if (error) {
      console.error('❌ Document creation failed:', error)
    } else {
      console.log('✅ Document creation working - Created:', data[0].title)
      passedTests++
    }
  } catch (error) {
    console.error('❌ Document creation error:', error)
  }

  // Test 10: Create Test Asset
  console.log('\n10. Testing Asset Creation...')
  totalTests++
  try {
    const testAsset = {
      name: 'Test Asset ' + Date.now(),
      asset_type: 'Equipment',
      rfid_code: 'TEST' + Date.now(),
      status: 'active',
      location: 'Test Location',
      criticality: 'medium',
      created_by: '11111111-1111-1111-1111-111111111111'
    }

    const { data, error } = await supabase
      .from('assets')
      .insert(testAsset)
      .select()

    if (error) {
      console.error('❌ Asset creation failed:', error)
    } else {
      console.log('✅ Asset creation working - Created:', data[0].name)
      passedTests++
    }
  } catch (error) {
    console.error('❌ Asset creation error:', error)
  }

  // Test 11: All User Logins
  console.log('\n11. Testing All User Logins...')
  totalTests++
  try {
    const testUsers = [
      { username: 'admin', password: 'admin123' },
      { username: 'manager', password: 'manager123' },
      { username: 'employee', password: 'employee123' },
      { username: 'procurement', password: 'procurement123' },
      { username: 'project_manager', password: 'pm123' },
      { username: 'maintenance', password: 'maintenance123' },
      { username: 'document_analyst', password: 'analyst123' }
    ]

    let successfulLogins = 0
    for (const user of testUsers) {
      const { data, error } = await supabase.rpc('authenticate_user', {
        user_username: user.username,
        user_password: user.password
      })

      if (!error && data && data.length > 0 && data[0].user_id) {
        successfulLogins++
      }
    }

    if (successfulLogins === testUsers.length) {
      console.log('✅ All user logins working -', successfulLogins, 'users can login')
      passedTests++
    } else {
      console.log('❌ Only', successfulLogins, 'of', testUsers.length, 'users can login')
    }
  } catch (error) {
    console.error('❌ User login test error:', error)
  }

  // Final Results
  console.log('\n' + '='.repeat(50))
  console.log('📊 FINAL TEST RESULTS')
  console.log('='.repeat(50))
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${totalTests - passedTests}`)
  console.log(`📊 Total: ${totalTests}`)
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Database is fully functional!')
    console.log('✅ Ready for frontend integration')
    console.log('✅ All users can login')
    console.log('✅ All tables accessible')
    console.log('✅ CRUD operations working')
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.')
  }

  return passedTests === totalTests
}

// Run the tests
testAllFunctionality()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  })
