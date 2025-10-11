import { createClient } from '@supabase/supabase-js';

// Check existing table schemas
async function checkExistingSchema() {
  console.log('🔍 Checking existing table schemas...\n');

  const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check assets table structure
    console.log('📋 Assets table structure:');
    const { data: assetsData, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .limit(1);
    
    if (assetsError) {
      console.log(`❌ Assets error: ${assetsError.message}`);
    } else {
      console.log('✅ Assets table exists');
      if (assetsData && assetsData.length > 0) {
        console.log('Columns:', Object.keys(assetsData[0]));
      }
    }

    // Check maintenance_logs table structure
    console.log('\n📋 Maintenance logs table structure:');
    const { data: logsData, error: logsError } = await supabase
      .from('maintenance_logs')
      .select('*')
      .limit(1);
    
    if (logsError) {
      console.log(`❌ Maintenance logs error: ${logsError.message}`);
    } else {
      console.log('✅ Maintenance logs table exists');
      if (logsData && logsData.length > 0) {
        console.log('Columns:', Object.keys(logsData[0]));
      }
    }

    // Check maintenance_work_orders table structure
    console.log('\n📋 Work orders table structure:');
    const { data: workOrdersData, error: workOrdersError } = await supabase
      .from('maintenance_work_orders')
      .select('*')
      .limit(1);
    
    if (workOrdersError) {
      console.log(`❌ Work orders error: ${workOrdersError.message}`);
    } else {
      console.log('✅ Work orders table exists');
      if (workOrdersData && workOrdersData.length > 0) {
        console.log('Columns:', Object.keys(workOrdersData[0]));
      }
    }

    // Check spare_parts table structure
    console.log('\n📋 Spare parts table structure:');
    const { data: sparePartsData, error: sparePartsError } = await supabase
      .from('spare_parts')
      .select('*')
      .limit(1);
    
    if (sparePartsError) {
      console.log(`❌ Spare parts error: ${sparePartsError.message}`);
    } else {
      console.log('✅ Spare parts table exists');
      if (sparePartsData && sparePartsData.length > 0) {
        console.log('Columns:', Object.keys(sparePartsData[0]));
      }
    }

    // Check maintenance_schedule table structure
    console.log('\n📋 Maintenance schedule table structure:');
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('maintenance_schedule')
      .select('*')
      .limit(1);
    
    if (scheduleError) {
      console.log(`❌ Maintenance schedule error: ${scheduleError.message}`);
    } else {
      console.log('✅ Maintenance schedule table exists');
      if (scheduleData && scheduleData.length > 0) {
        console.log('Columns:', Object.keys(scheduleData[0]));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkExistingSchema();
