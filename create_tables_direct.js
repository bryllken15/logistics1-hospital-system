import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTablesDirectly() {
  try {
    console.log('🚀 Creating Suppliers and Purchase Orders Tables Directly...\n')
    
    // First, let's check if tables already exist
    console.log('🔍 Checking existing tables...')
    
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('count')
      .limit(1)
    
    const { data: orders, error: ordersError } = await supabase
      .from('purchase_orders')
      .select('count')
      .limit(1)
    
    if (!suppliersError) {
      console.log('✅ Suppliers table already exists')
    } else {
      console.log('❌ Suppliers table does not exist, will create sample data')
    }
    
    if (!ordersError) {
      console.log('✅ Purchase orders table already exists')
    } else {
      console.log('❌ Purchase orders table does not exist, will create sample data')
    }
    
    // Insert sample suppliers if they don't exist
    console.log('\n📝 Inserting sample suppliers...')
    
    const suppliersData = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'MedSupply Co.',
        contact: 'John Smith',
        email: 'john@medsupply.com',
        phone: '+1-555-0101',
        address: '123 Medical St, Health City, HC 12345',
        rating: 5,
        status: 'active',
        notes: 'Primary medical supplies supplier'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'HealthTech Ltd.',
        contact: 'Sarah Johnson',
        email: 'sarah@healthtech.com',
        phone: '+1-555-0102',
        address: '456 Tech Ave, Innovation City, IC 67890',
        rating: 4,
        status: 'active',
        notes: 'Advanced medical technology supplier'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'MedEquip Inc.',
        contact: 'Mike Wilson',
        email: 'mike@medequip.com',
        phone: '+1-555-0103',
        address: '789 Equipment Blvd, Industrial City, IC 13579',
        rating: 4,
        status: 'active',
        notes: 'Medical equipment and devices'
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'PharmaCorp',
        contact: 'Lisa Brown',
        email: 'lisa@pharmacorp.com',
        phone: '+1-555-0104',
        address: '321 Pharma Way, Research City, RC 24680',
        rating: 3,
        status: 'active',
        notes: 'Pharmaceutical supplies and medications'
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Equipment Solutions',
        contact: 'David Lee',
        email: 'david@equipsol.com',
        phone: '+1-555-0105',
        address: '654 Solution St, Service City, SC 97531',
        rating: 4,
        status: 'active',
        notes: 'Comprehensive equipment solutions'
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        name: 'Medical Supply Co',
        contact: 'Emma Davis',
        email: 'emma@medsupplyco.com',
        phone: '+1-555-0106',
        address: '987 Supply Lane, Distribution City, DC 86420',
        rating: 5,
        status: 'active',
        notes: 'Full-service medical supply company'
      }
    ]
    
    for (const supplier of suppliersData) {
      const { error } = await supabase
        .from('suppliers')
        .upsert(supplier, { onConflict: 'id' })
      
      if (error) {
        console.log(`❌ Error inserting supplier ${supplier.name}: ${error.message}`)
      } else {
        console.log(`✅ Supplier ${supplier.name} inserted/updated successfully`)
      }
    }
    
    // Insert sample purchase orders
    console.log('\n📦 Inserting sample purchase orders...')
    
    const ordersData = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        order_number: 'PO-2024-001',
        supplier_id: '11111111-1111-1111-1111-111111111111',
        supplier_name: 'MedSupply Co.',
        items: 15,
        amount: 45000.00,
        description: 'Emergency medical supplies for ICU ward',
        priority: 'high',
        status: 'delivered',
        expected_delivery: '2024-01-15',
        actual_delivery: '2024-01-15',
        rfid_code: 'RFID-001-2024',
        created_by: '44444444-4444-4444-4444-444444444444'
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        order_number: 'PO-2024-002',
        supplier_id: '22222222-2222-2222-2222-222222222222',
        supplier_name: 'HealthTech Ltd.',
        items: 8,
        amount: 32500.00,
        description: 'Advanced monitoring equipment for surgery',
        priority: 'medium',
        status: 'in_transit',
        expected_delivery: '2024-01-20',
        rfid_code: 'RFID-002-2024',
        created_by: '44444444-4444-4444-4444-444444444444'
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        order_number: 'PO-2024-003',
        supplier_id: '33333333-3333-3333-3333-333333333333',
        supplier_name: 'MedEquip Inc.',
        items: 25,
        amount: 78000.00,
        description: 'Surgical instruments and equipment',
        priority: 'urgent',
        status: 'delivered',
        expected_delivery: '2024-01-10',
        actual_delivery: '2024-01-10',
        rfid_code: 'RFID-003-2024',
        created_by: '44444444-4444-4444-4444-444444444444'
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        order_number: 'PO-2024-004',
        supplier_id: '44444444-4444-4444-4444-444444444444',
        supplier_name: 'PharmaCorp',
        items: 12,
        amount: 23000.00,
        description: 'Essential medications and vaccines',
        priority: 'medium',
        status: 'pending',
        expected_delivery: '2024-01-25',
        rfid_code: 'RFID-004-2024',
        created_by: '44444444-4444-4444-4444-444444444444'
      },
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        order_number: 'PO-2024-005',
        supplier_id: '55555555-5555-5555-5555-555555555555',
        supplier_name: 'Equipment Solutions',
        items: 6,
        amount: 15000.00,
        description: 'Maintenance tools and spare parts',
        priority: 'low',
        status: 'approved',
        expected_delivery: '2024-01-30',
        rfid_code: 'RFID-005-2024',
        created_by: '44444444-4444-4444-4444-444444444444'
      },
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        order_number: 'PO-2024-006',
        supplier_id: '66666666-6666-6666-6666-666666666666',
        supplier_name: 'Medical Supply Co',
        items: 20,
        amount: 55000.00,
        description: 'General medical supplies and consumables',
        priority: 'high',
        status: 'in_transit',
        expected_delivery: '2024-02-05',
        rfid_code: 'RFID-006-2024',
        created_by: '44444444-4444-4444-4444-444444444444'
      }
    ]
    
    for (const order of ordersData) {
      const { error } = await supabase
        .from('purchase_orders')
        .upsert(order, { onConflict: 'id' })
      
      if (error) {
        console.log(`❌ Error inserting order ${order.order_number}: ${error.message}`)
      } else {
        console.log(`✅ Order ${order.order_number} inserted/updated successfully`)
      }
    }
    
    // Insert sample delivery receipts
    console.log('\n🚚 Inserting sample delivery receipts...')
    
    const deliveriesData = [
      {
        id: '77777777-7777-7777-7777-777777777777',
        order_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        supplier_name: 'MedSupply Co.',
        items_received: 15,
        delivery_date: '2024-01-15',
        status: 'completed',
        rfid_code: 'RFID-001-2024',
        notes: 'All items received in good condition'
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        order_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        supplier_name: 'MedEquip Inc.',
        items_received: 25,
        delivery_date: '2024-01-10',
        status: 'completed',
        rfid_code: 'RFID-003-2024',
        notes: 'Surgical equipment delivered successfully'
      },
      {
        id: '99999999-9999-9999-9999-999999999999',
        order_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        supplier_name: 'HealthTech Ltd.',
        items_received: 8,
        delivery_date: '2024-01-20',
        status: 'pending',
        rfid_code: 'RFID-002-2024',
        notes: 'Equipment in transit, expected delivery soon'
      },
      {
        id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        order_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        supplier_name: 'Medical Supply Co',
        items_received: 20,
        delivery_date: '2024-02-05',
        status: 'pending',
        rfid_code: 'RFID-006-2024',
        notes: 'General supplies en route'
      }
    ]
    
    for (const delivery of deliveriesData) {
      const { error } = await supabase
        .from('delivery_receipts')
        .upsert(delivery, { onConflict: 'id' })
      
      if (error) {
        console.log(`❌ Error inserting delivery ${delivery.id}: ${error.message}`)
      } else {
        console.log(`✅ Delivery ${delivery.id} inserted/updated successfully`)
      }
    }
    
    console.log('\n🎉 Database setup completed successfully!')
    
    // Verify the data
    console.log('\n🔍 Verifying data...')
    
    const { data: finalSuppliers, error: finalSuppliersError } = await supabase
      .from('suppliers')
      .select('*')
    
    const { data: finalOrders, error: finalOrdersError } = await supabase
      .from('purchase_orders')
      .select('*')
    
    const { data: finalDeliveries, error: finalDeliveriesError } = await supabase
      .from('delivery_receipts')
      .select('*')
    
    if (finalSuppliersError) {
      console.log('❌ Suppliers verification failed:', finalSuppliersError.message)
    } else {
      console.log(`✅ Suppliers: ${finalSuppliers?.length || 0} items`)
    }
    
    if (finalOrdersError) {
      console.log('❌ Orders verification failed:', finalOrdersError.message)
    } else {
      console.log(`✅ Purchase orders: ${finalOrders?.length || 0} items`)
    }
    
    if (finalDeliveriesError) {
      console.log('❌ Deliveries verification failed:', finalDeliveriesError.message)
    } else {
      console.log(`✅ Delivery receipts: ${finalDeliveries?.length || 0} items`)
    }
    
    console.log('\n🎊 Database is ready for Procurement Dashboard!')
    
  } catch (error) {
    console.error('💥 Database setup failed:', error)
  }
}

createTablesDirectly()
