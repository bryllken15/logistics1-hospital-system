import { createClient } from '@supabase/supabase-js';

// Test database setup for maintenance system
async function testDatabaseSetup() {
  console.log('🔧 Testing Maintenance Database Setup...\n');

  // Initialize Supabase client
  const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Check if tables exist
    console.log('📋 Checking if tables exist...');
    
    const tables = ['assets', 'maintenance_logs', 'maintenance_work_orders', 'spare_parts', 'maintenance_schedule'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: EXISTS`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    // Test 2: Test data insertion
    console.log('\n📝 Testing data insertion...');
    
    // Test asset creation
    try {
        const { data: assetData, error: assetError } = await supabase
          .from('assets')
          .insert({
            name: 'Test Asset',
            rfid_code: 'TEST-RFID-001',
            location: 'Test Location',
            condition: 'good',
            next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })
          .select()
          .single();

      if (assetError) {
        console.log(`❌ Asset creation failed: ${assetError.message}`);
      } else {
        console.log(`✅ Asset created successfully: ${assetData.id}`);
        
        // Test maintenance log creation
        const { data: logData, error: logError } = await supabase
          .from('maintenance_logs')
          .insert({
            asset_id: assetData.id,
            maintenance_type: 'Preventive',
            technician: 'Test Technician',
            cost: 100.00,
            status: 'completed'
          })
          .select()
          .single();

        if (logError) {
          console.log(`❌ Maintenance log creation failed: ${logError.message}`);
        } else {
          console.log(`✅ Maintenance log created successfully: ${logData.id}`);
        }

        // Test work order creation
        const { data: workOrderData, error: workOrderError } = await supabase
          .from('maintenance_work_orders')
          .insert({
            work_order_number: 'WO-TEST-001',
            asset_id: assetData.id,
            title: 'Test Work Order',
            description: 'Test work order description',
            status: 'open',
            priority: 'medium'
          })
          .select()
          .single();

        if (workOrderError) {
          console.log(`❌ Work order creation failed: ${workOrderError.message}`);
        } else {
          console.log(`✅ Work order created successfully: ${workOrderData.id}`);
        }

        // Test spare part creation
        const { data: sparePartData, error: sparePartError } = await supabase
          .from('spare_parts')
          .insert({
            part_name: 'Test Spare Part',
            part_number: 'SP-001',
            description: 'Test spare part description',
            category: 'Electrical',
            manufacturer: 'Test Manufacturer',
            unit_price: 50.00,
            stock_quantity: 10,
            min_stock_level: 2
          })
          .select()
          .single();

        if (sparePartError) {
          console.log(`❌ Spare part creation failed: ${sparePartError.message}`);
        } else {
          console.log(`✅ Spare part created successfully: ${sparePartData.id}`);
        }

        // Test maintenance schedule creation (skip if table is empty)
        let scheduleData = null;
        let scheduleError = null;
        
        try {
          const { data: scheduleDataResult, error: scheduleErrorResult } = await supabase
            .from('maintenance_schedule')
            .insert({
              asset_id: assetData.id,
              schedule_type: 'Preventive',
              frequency: 'Monthly',
              next_maintenance_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
            .select()
            .single();
          
          scheduleData = scheduleDataResult;
          scheduleError = scheduleErrorResult;
        } catch (err) {
          console.log(`⚠️ Maintenance schedule creation skipped: ${err.message}`);
        }

        if (scheduleError) {
          console.log(`❌ Maintenance schedule creation failed: ${scheduleError.message}`);
        } else {
          console.log(`✅ Maintenance schedule created successfully: ${scheduleData.id}`);
        }

        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        if (scheduleData) {
          await supabase.from('maintenance_schedule').delete().eq('id', scheduleData.id);
        }
        await supabase.from('spare_parts').delete().eq('id', sparePartData.id);
        await supabase.from('maintenance_work_orders').delete().eq('id', workOrderData.id);
        await supabase.from('maintenance_logs').delete().eq('id', logData.id);
        await supabase.from('assets').delete().eq('id', assetData.id);
        console.log('✅ Test data cleaned up');

      }
    } catch (err) {
      console.log(`❌ Data insertion test failed: ${err.message}`);
    }

    // Test 3: Test realtime subscriptions
    console.log('\n🔄 Testing realtime subscriptions...');
    
    try {
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'assets' },
          (payload) => {
            console.log('✅ Realtime subscription working:', payload.eventType);
          }
        )
        .subscribe();

      // Wait a moment then unsubscribe
      setTimeout(() => {
        supabase.removeChannel(channel);
        console.log('✅ Realtime test completed');
      }, 2000);

    } catch (err) {
      console.log(`❌ Realtime test failed: ${err.message}`);
    }

    console.log('\n🎉 Database setup test completed!');
    console.log('\nNext steps:');
    console.log('1. Run the SQL migration in Supabase SQL Editor');
    console.log('2. Test the maintenance dashboard forms');
    console.log('3. Verify real-time updates work');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDatabaseSetup();
