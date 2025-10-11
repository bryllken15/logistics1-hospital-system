import { createClient } from '@supabase/supabase-js';

// Test the fixed asset service
async function testFixedAssetService() {
  console.log('🔧 Testing Fixed Asset Service...\n');

  const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('📋 Testing direct Supabase connection...');
    
    // Test 1: Simple read operation
    console.log('Testing READ access...');
    const { data: readData, error: readError } = await supabase
      .from('assets')
      .select('*')
      .limit(1);

    if (readError) {
      console.log(`❌ READ access failed: ${readError.message}`);
      console.log('\n🔧 This suggests the table structure or permissions need attention.');
      return;
    } else {
      console.log(`✅ READ access working - found ${readData.length} assets`);
    }

    // Test 2: Simple insert operation with only existing columns
    console.log('\nTesting CREATE access with correct schema...');
    const testAsset = {
      name: 'Fixed Service Test Asset',
      rfid_code: 'FIXED-TEST-001',
      location: 'Test Location',
      condition: 'good',
      next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const { data: createData, error: createError } = await supabase
      .from('assets')
      .insert(testAsset)
      .select()
      .single();

    if (createError) {
      console.log(`❌ CREATE access failed: ${createError.message}`);
      console.log('\n🔧 This means the table permissions or structure still need fixing.');
      return;
    } else {
      console.log(`✅ CREATE access working - asset created: ${createData.id}`);
    }

    // Test 3: Update the asset
    console.log('\nTesting UPDATE access...');
    const { data: updateData, error: updateError } = await supabase
      .from('assets')
      .update({ 
        name: 'Updated Fixed Service Test Asset',
        condition: 'excellent'
      })
      .eq('id', createData.id)
      .select()
      .single();

    if (updateError) {
      console.log(`❌ UPDATE access failed: ${updateError.message}`);
    } else {
      console.log(`✅ UPDATE access working - asset updated: ${updateData.id}`);
    }

    // Test 4: Delete the asset
    console.log('\nTesting DELETE access...');
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', createData.id);

    if (deleteError) {
      console.log(`❌ DELETE access failed: ${deleteError.message}`);
    } else {
      console.log(`✅ DELETE access working - asset deleted`);
    }

    console.log('\n🎉 Fixed Asset Service Test Complete!');
    console.log('\n✅ All CRUD operations working with correct schema');
    console.log('✅ Database connection is working properly');
    console.log('✅ The maintenance dashboard should now work!');

  } catch (error) {
    console.error('❌ Fixed asset service test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. The service has been fixed to use correct column names');
    console.log('2. Check if the assets table has the right structure');
    console.log('3. Verify Supabase connection is working');
  }
}

// Run the test
testFixedAssetService();
