// Script to check if the migration needs to be applied
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMigrationStatus() {
  console.log('🔍 Checking if migration needs to be applied...\n')

  try {
    // Check if updated_by field exists in inventory table
    console.log('1️⃣ Checking inventory table structure...')
    const { data: inventoryColumns, error: inventoryError } = await supabase
      .rpc('get_table_columns', { table_name: 'inventory' })
      .single()

    if (inventoryError) {
      console.log('⚠️  Cannot check table structure directly, trying alternative method...')
      
      // Try to insert a test record to see what fields are missing
      const { data: testInsert, error: testError } = await supabase
        .from('inventory')
        .insert({
          item_name: 'Test Item',
          rfid_code: 'TEST-STRUCTURE-CHECK',
          quantity: 1,
          location: 'Test',
          status: 'in_stock'
        })
        .select()

      if (testError) {
        console.log('❌ Inventory insert error:', testError.message)
        if (testError.message.includes('updated_by')) {
          console.log('   → The updated_by field is missing! Migration needed.')
        }
        if (testError.message.includes('audit_logs')) {
          console.log('   → Audit triggers are active but audit_logs table may be missing permissions.')
        }
      } else {
        console.log('✅ Basic inventory insert works')
        // Clean up test record
        await supabase.from('inventory').delete().eq('rfid_code', 'TEST-STRUCTURE-CHECK')
      }
    }

    // Check delivery_receipts table
    console.log('\n2️⃣ Checking delivery_receipts table structure...')
    const { data: deliveryTest, error: deliveryError } = await supabase
      .from('delivery_receipts')
      .insert({
        receipt_number: 'TEST-DELIVERY-CHECK',
        supplier: 'Test Supplier',
        amount: 100,
        items: 1,
        status: 'pending_verification'
      })
      .select()

    if (deliveryError) {
      console.log('❌ Delivery receipts insert error:', deliveryError.message)
      if (deliveryError.message.includes('destination') || deliveryError.message.includes('delivered_by')) {
        console.log('   → New fields (destination, delivered_by, description) are missing! Migration needed.')
      }
    } else {
      console.log('✅ Basic delivery receipts insert works')
      // Clean up test record
      await supabase.from('delivery_receipts').delete().eq('receipt_number', 'TEST-DELIVERY-CHECK')
    }

    console.log('\n📋 Migration Status Summary:')
    console.log('   🔧 You need to apply the migration in your Supabase dashboard:')
    console.log('   1. Go to your Supabase project dashboard')
    console.log('   2. Navigate to SQL Editor')
    console.log('   3. Copy and paste the contents of: supabase/migrations/009_fix_schema_mismatches.sql')
    console.log('   4. Execute the SQL')
    console.log('   5. Then run the test again')

    return true

  } catch (error) {
    console.error('💥 Migration check failed:', error.message)
    return false
  }
}

checkMigrationStatus()
  .then(success => {
    if (success) {
      console.log('\n✨ Migration check completed!')
    } else {
      console.log('\n❌ Migration check failed.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
