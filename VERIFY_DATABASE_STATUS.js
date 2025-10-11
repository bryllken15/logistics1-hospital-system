import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 VERIFYING DATABASE STATUS...\n')

async function verifyDatabaseStatus() {
  try {
    console.log('1️⃣ Checking if tables exist...')
    
    // Try to access suppliers table
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('count')
      .limit(1)
    
    if (suppliersError) {
      console.log(`❌ Suppliers table: ${suppliersError.message}`)
    } else {
      console.log('✅ Suppliers table exists and accessible')
    }
    
    // Try to access purchase_orders table
    const { data: orders, error: ordersError } = await supabase
      .from('purchase_orders')
      .select('count')
      .limit(1)
    
    if (ordersError) {
      console.log(`❌ Purchase orders table: ${ordersError.message}`)
    } else {
      console.log('✅ Purchase orders table exists and accessible')
    }
    
    // Try to access delivery_receipts table
    const { data: deliveries, error: deliveriesError } = await supabase
      .from('delivery_receipts')
      .select('count')
      .limit(1)
    
    if (deliveriesError) {
      console.log(`❌ Delivery receipts table: ${deliveriesError.message}`)
    } else {
      console.log('✅ Delivery receipts table exists and accessible')
    }
    
    console.log('\n2️⃣ Checking table structure...')
    
    // Try to get table info
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info')
      .select('*')
    
    if (tableError) {
      console.log(`❌ Table info: ${tableError.message}`)
    } else {
      console.log('✅ Table info accessible')
    }
    
    console.log('\n3️⃣ Recommendations...')
    
    if (suppliersError && ordersError && deliveriesError) {
      console.log('🔧 ISSUE: Permission denied for all tables')
      console.log('')
      console.log('📋 SOLUTION: Run this SQL in your Supabase SQL Editor:')
      console.log('')
      console.log('-- Copy and paste this into Supabase SQL Editor:')
      console.log('-- ================================================')
      console.log('')
      console.log('-- Grant permissions to authenticated users')
      console.log('GRANT ALL ON TABLE suppliers TO authenticated;')
      console.log('GRANT ALL ON TABLE purchase_orders TO authenticated;')
      console.log('GRANT ALL ON TABLE delivery_receipts TO authenticated;')
      console.log('')
      console.log('-- Grant permissions to service role')
      console.log('GRANT ALL ON TABLE suppliers TO service_role;')
      console.log('GRANT ALL ON TABLE purchase_orders TO service_role;')
      console.log('GRANT ALL ON TABLE delivery_receipts TO service_role;')
      console.log('')
      console.log('-- Enable RLS on all tables')
      console.log('ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;')
      console.log('ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;')
      console.log('ALTER TABLE delivery_receipts ENABLE ROW LEVEL SECURITY;')
      console.log('')
      console.log('-- Create policies for authenticated users')
      console.log('DROP POLICY IF EXISTS "Allow all for authenticated users" ON suppliers;')
      console.log('CREATE POLICY "Allow all for authenticated users" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);')
      console.log('')
      console.log('DROP POLICY IF EXISTS "Allow all for authenticated users" ON purchase_orders;')
      console.log('CREATE POLICY "Allow all for authenticated users" ON purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);')
      console.log('')
      console.log('DROP POLICY IF EXISTS "Allow all for authenticated users" ON delivery_receipts;')
      console.log('CREATE POLICY "Allow all for authenticated users" ON delivery_receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);')
      console.log('')
      console.log('-- ================================================')
      console.log('')
      console.log('After running this SQL, the Procurement Dashboard will work!')
    } else {
      console.log('✅ Some tables are accessible!')
      console.log('The database setup is partially working.')
    }
    
  } catch (error) {
    console.error('💥 Verification failed:', error)
  }
}

verifyDatabaseStatus()
