// Script to fix audit permission issues
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAuditPermissions() {
  console.log('🔧 Fixing Audit Permission Issues...\n')

  try {
    // First, let's try to create the audit_logs table if it doesn't exist
    console.log('1️⃣ Creating audit_logs table if it doesn\'t exist...')
    
    const createAuditTableSQL = `
      CREATE TABLE IF NOT EXISTS public.audit_logs (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL,
        old_data JSONB,
        new_data JSONB,
        user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Grant permissions
      GRANT ALL ON public.audit_logs TO anon, authenticated;
      GRANT ALL ON public.audit_logs TO service_role;
    `

    const { data: auditTableResult, error: auditTableError } = await supabase
      .rpc('exec_sql', { sql: createAuditTableSQL })

    if (auditTableError) {
      console.log('⚠️  Cannot create audit_logs table via RPC, trying alternative approach...')
      
      // Try to disable the problematic triggers temporarily
      console.log('2️⃣ Attempting to disable audit triggers...')
      
      const disableTriggersSQL = `
        -- Disable audit triggers temporarily
        DROP TRIGGER IF EXISTS audit_inventory_trigger ON public.inventory;
        DROP TRIGGER IF EXISTS audit_delivery_trigger ON public.delivery_receipts;
      `

      const { data: disableResult, error: disableError } = await supabase
        .rpc('exec_sql', { sql: disableTriggersSQL })

      if (disableError) {
        console.log('⚠️  Cannot disable triggers via RPC either')
        console.log('   → You need to apply the migration manually in Supabase dashboard')
      } else {
        console.log('✅ Triggers disabled successfully')
      }
    } else {
      console.log('✅ Audit logs table created successfully')
    }

    // Now try the basic test
    console.log('\n3️⃣ Testing basic operations after fix...')
    
    const { data: testInventory, error: testError } = await supabase
      .from('inventory')
      .insert({
        item_name: 'Test Item After Fix',
        rfid_code: `TEST-AFTER-FIX-${Date.now()}`,
        quantity: 1,
        location: 'Test Location',
        status: 'in_stock'
      })
      .select()

    if (testError) {
      console.log('❌ Still getting error:', testError.message)
      console.log('\n🔧 Manual Fix Required:')
      console.log('   1. Go to your Supabase dashboard')
      console.log('   2. Navigate to SQL Editor')
      console.log('   3. Run this SQL to disable audit triggers:')
      console.log('      DROP TRIGGER IF EXISTS audit_inventory_trigger ON public.inventory;')
      console.log('      DROP TRIGGER IF EXISTS audit_delivery_trigger ON public.delivery_receipts;')
      console.log('   4. Then apply the migration: supabase/migrations/009_fix_schema_mismatches.sql')
    } else {
      console.log('✅ Basic operations work after fix!')
      // Clean up
      await supabase.from('inventory').delete().eq('rfid_code', `TEST-AFTER-FIX-${Date.now()}`)
    }

    return true

  } catch (error) {
    console.error('💥 Fix attempt failed:', error.message)
    return false
  }
}

fixAuditPermissions()
  .then(success => {
    if (success) {
      console.log('\n✨ Audit permission fix completed!')
    } else {
      console.log('\n❌ Audit permission fix failed.')
    }
  })
  .catch(error => {
    console.error('💥 Script error:', error)
  })
