import { createClient } from '@supabase/supabase-js';

// Test real-time updates for maintenance system
async function testRealtimeUpdates() {
  console.log('🔄 Testing Real-time Updates...\n');

  const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('📡 Setting up real-time subscriptions...');
    
    let eventsReceived = 0;
    const expectedEvents = 4; // We'll trigger 4 events
    
    // Set up subscriptions for all maintenance tables
    const channel = supabase
      .channel('maintenance-realtime-test')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'assets' },
        (payload) => {
          eventsReceived++;
          console.log(`✅ Assets INSERT event received: ${payload.new.name}`);
        }
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'maintenance_logs' },
        (payload) => {
          eventsReceived++;
          console.log(`✅ Maintenance Logs INSERT event received: ${payload.new.maintenance_type}`);
        }
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'maintenance_work_orders' },
        (payload) => {
          eventsReceived++;
          console.log(`✅ Work Orders INSERT event received: ${payload.new.title}`);
        }
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'spare_parts' },
        (payload) => {
          eventsReceived++;
          console.log(`✅ Spare Parts INSERT event received: ${payload.new.part_name}`);
        }
      )
      .subscribe();

    // Wait for subscription to establish
    console.log('⏳ Waiting for subscription to establish...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n📝 Triggering real-time events...');
    
    // Create test data to trigger real-time events
    const testData = {
      asset: {
        name: 'Realtime Test Asset',
        rfid_code: 'RT-TEST-001',
        location: 'Test Location',
        condition: 'good',
        next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      maintenanceLog: {
        maintenance_type: 'Realtime Test',
        technician: 'Test Tech',
        cost: 100.00,
        status: 'completed'
      },
      workOrder: {
        work_order_number: `WO-RT-${Date.now()}`,
        title: 'Realtime Test Work Order',
        description: 'Testing real-time updates',
        status: 'open',
        priority: 'medium'
      },
      sparePart: {
        part_name: 'Realtime Test Part',
        part_number: 'RTP-001',
        description: 'Testing real-time updates',
        category: 'Test',
        manufacturer: 'Test Manufacturer',
        unit_price: 50.00,
        stock_quantity: 5,
        min_stock_level: 1
      }
    };

    let createdAssetId = null;
    let createdLogId = null;
    let createdWorkOrderId = null;
    let createdSparePartId = null;

    // Create asset (should trigger real-time event)
    console.log('Creating asset...');
    const { data: assetData, error: assetError } = await supabase
      .from('assets')
      .insert(testData.asset)
      .select()
      .single();

    if (assetError) {
      console.log(`❌ Asset creation failed: ${assetError.message}`);
    } else {
      console.log(`✅ Asset created: ${assetData.id}`);
      createdAssetId = assetData.id;
    }

    // Wait a moment for real-time event
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create maintenance log (should trigger real-time event)
    console.log('Creating maintenance log...');
    const { data: logData, error: logError } = await supabase
      .from('maintenance_logs')
      .insert({
        ...testData.maintenanceLog,
        asset_id: createdAssetId
      })
      .select()
      .single();

    if (logError) {
      console.log(`❌ Maintenance log creation failed: ${logError.message}`);
    } else {
      console.log(`✅ Maintenance log created: ${logData.id}`);
      createdLogId = logData.id;
    }

    // Wait a moment for real-time event
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create work order (should trigger real-time event)
    console.log('Creating work order...');
    const { data: workOrderData, error: workOrderError } = await supabase
      .from('maintenance_work_orders')
      .insert({
        ...testData.workOrder,
        asset_id: createdAssetId
      })
      .select()
      .single();

    if (workOrderError) {
      console.log(`❌ Work order creation failed: ${workOrderError.message}`);
    } else {
      console.log(`✅ Work order created: ${workOrderData.id}`);
      createdWorkOrderId = workOrderData.id;
    }

    // Wait a moment for real-time event
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create spare part (should trigger real-time event)
    console.log('Creating spare part...');
    const { data: sparePartData, error: sparePartError } = await supabase
      .from('spare_parts')
      .insert(testData.sparePart)
      .select()
      .single();

    if (sparePartError) {
      console.log(`❌ Spare part creation failed: ${sparePartError.message}`);
    } else {
      console.log(`✅ Spare part created: ${sparePartData.id}`);
      createdSparePartId = sparePartData.id;
    }

    // Wait for all real-time events to be received
    console.log('\n⏳ Waiting for real-time events...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check results
    console.log(`\n📊 Real-time Events Summary:`);
    console.log(`Events received: ${eventsReceived}/${expectedEvents}`);
    
    if (eventsReceived >= expectedEvents) {
      console.log('✅ All real-time events received successfully!');
    } else {
      console.log(`⚠️ Only ${eventsReceived}/${expectedEvents} events received`);
      console.log('This might indicate real-time is not fully configured');
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      if (createdSparePartId) {
        await supabase.from('spare_parts').delete().eq('id', createdSparePartId);
      }
      if (createdWorkOrderId) {
        await supabase.from('maintenance_work_orders').delete().eq('id', createdWorkOrderId);
      }
      if (createdLogId) {
        await supabase.from('maintenance_logs').delete().eq('id', createdLogId);
      }
      if (createdAssetId) {
        await supabase.from('assets').delete().eq('id', createdAssetId);
      }
      console.log('✅ Test data cleaned up');
    } catch (err) {
      console.log(`⚠️ Cleanup warning: ${err.message}`);
    }

    // Unsubscribe
    supabase.removeChannel(channel);
    console.log('✅ Real-time subscription closed');

    console.log('\n🎉 Real-time Updates Test Complete!');
    
    if (eventsReceived >= expectedEvents) {
      console.log('\n✅ Real-time functionality is working perfectly!');
      console.log('✅ Your maintenance dashboard will receive live updates');
      console.log('✅ Multiple users can see changes in real-time');
    } else {
      console.log('\n⚠️ Real-time functionality needs attention');
      console.log('1. Make sure realtime is enabled in Supabase');
      console.log('2. Check that tables are added to realtime publication');
      console.log('3. Verify RLS policies allow real-time access');
    }

  } catch (error) {
    console.error('❌ Real-time test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check Supabase realtime configuration');
    console.log('2. Verify tables are in realtime publication');
    console.log('3. Check network connectivity');
  }
}

// Run the real-time test
testRealtimeUpdates();
