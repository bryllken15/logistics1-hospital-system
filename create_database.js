import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createDatabase() {
  try {
    console.log('🚀 Creating Suppliers and Purchase Orders Database...\n')
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('CREATE_SUPPLIERS_AND_ORDERS_DATABASE.sql', 'utf8')
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Executing ${statements.length} SQL statements...\n`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`)
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
          
          if (error) {
            console.log(`❌ Error in statement ${i + 1}: ${error.message}`)
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err) {
          console.log(`❌ Exception in statement ${i + 1}: ${err.message}`)
        }
      }
    }
    
    console.log('\n🎉 Database creation process completed!')
    
    // Verify the tables were created
    console.log('\n🔍 Verifying database creation...')
    
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('count')
      .limit(1)
    
    const { data: orders, error: ordersError } = await supabase
      .from('purchase_orders')
      .select('count')
      .limit(1)
    
    const { data: deliveries, error: deliveriesError } = await supabase
      .from('delivery_receipts')
      .select('count')
      .limit(1)
    
    if (suppliersError) {
      console.log('❌ Suppliers table verification failed:', suppliersError.message)
    } else {
      console.log('✅ Suppliers table created successfully')
    }
    
    if (ordersError) {
      console.log('❌ Purchase orders table verification failed:', ordersError.message)
    } else {
      console.log('✅ Purchase orders table created successfully')
    }
    
    if (deliveriesError) {
      console.log('❌ Delivery receipts table verification failed:', deliveriesError.message)
    } else {
      console.log('✅ Delivery receipts table created successfully')
    }
    
  } catch (error) {
    console.error('💥 Database creation failed:', error)
  }
}

createDatabase()
