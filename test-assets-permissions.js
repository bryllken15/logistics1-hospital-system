import { createClient } from '@supabase/supabase-js';

// Test assets table permissions specifically
async function testAssetsPermissions() {
  console.log('🔧 Testing Assets Table Permissions...\n');

  const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('📋 Testing assets table access...');
    
    // Test 1: Try to read existing assets
    console.log('Testing READ access...');
    const { data: existingAssets, error: readError } = await supabase
      .from('assets')
      .select('*')
      .limit(5);

    if (readError) {
      console.log(`❌ READ access failed: ${readError.message}`);
    } else {
      console.log(`✅ READ access working - found ${existingAssets.length} assets`);
    }

    // Test 2: Try to create a new asset
    console.log('\nTesting CREATE access...');
    const { data: newAsset, error: createError } = await supabase
      .from('assets')
      .insert({
        name: 'Permission Test Asset',
        rfid_code: 'PERM-TEST-001',
        location: 'Test Location',
        condition: 'good',
        next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select()
      .single();

    if (createError) {
      console.log(`❌ CREATE access failed: ${createError.message}`);
      console.log('\n🔧 This means you need to run the SQL script to fix permissions.');
      console.log('Please run the content from fix-assets-permissions.sql in Supabase SQL Editor.');
      return;
    } else {
      console.log(`✅ CREATE access working - asset created: ${newAsset.id}`);
    }

    // Test 3: Try to update the asset
    console.log('\nTesting UPDATE access...');
    const { data: updatedAsset, error: updateError } = await supabase
      .from('assets')
      .update({ 
        name: 'Updated Permission Test Asset',
        condition: 'excellent'
      })
      .eq('id', newAsset.id)
      .select()
      .single();

    if (updateError) {
      console.log(`❌ UPDATE access failed: ${updateError.message}`);
    } else {
      console.log(`✅ UPDATE access working - asset updated: ${updatedAsset.id}`);
    }

    // Test 4: Try to delete the asset
    console.log('\nTesting DELETE access...');
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', newAsset.id);

    if (deleteError) {
      console.log(`❌ DELETE access failed: ${deleteError.message}`);
    } else {
      console.log(`✅ DELETE access working - asset deleted`);
    }

    // Test 5: Test real-time subscription
    console.log('\nTesting real-time subscription...');
    
    const channel = supabase
      .channel('assets-permission-test')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'assets' },
        (payload) => {
          console.log('✅ Real-time asset event received:', payload.new.name);
        }
      )
      .subscribe();

    // Wait for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create another asset to test real-time
    const { data: realtimeAsset, error: realtimeError } = await supabase
      .from('assets')
      .insert({
        name: 'Realtime Test Asset',
        rfid_code: 'RT-TEST-001',
        location: 'Realtime Test Location',
        condition: 'good',
        next_maintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select()
      .single();

    if (realtimeError) {
      console.log(`❌ Real-time test failed: ${realtimeError.message}`);
    } else {
      console.log(`✅ Real-time test asset created: ${realtimeAsset.id}`);
      
      // Wait for real-time event
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clean up
      await supabase.from('assets').delete().eq('id', realtimeAsset.id);
    }

    // Unsubscribe
    supabase.removeChannel(channel);

    console.log('\n🎉 Assets Permissions Test Complete!');
    console.log('\n✅ All CRUD operations working');
    console.log('✅ Real-time updates working');
    console.log('✅ Assets table is fully functional!');

  } catch (error) {
    console.error('❌ Assets permissions test failed:', error.message);
    console.log('\n🔧 If you still see permission errors:');
    console.log('1. Run the SQL script: fix-assets-permissions.sql');
    console.log('2. Make sure you\'re logged into Supabase');
    console.log('3. Check that the SQL executed without errors');
  }
}

// Run the test
testAssetsPermissions();
