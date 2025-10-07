// Script to add sample data to Supabase database
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample data
const sampleUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@logistics1.com',
    full_name: 'System Administrator',
    role: 'admin',
    is_authorized: true
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'manager@logistics1.com',
    full_name: 'Operations Manager',
    role: 'manager',
    is_authorized: true
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'employee@logistics1.com',
    full_name: 'Warehouse Employee',
    role: 'employee',
    is_authorized: true
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'procurement@logistics1.com',
    full_name: 'Procurement Specialist',
    role: 'procurement',
    is_authorized: true
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'project@logistics1.com',
    full_name: 'Project Manager',
    role: 'project_manager',
    is_authorized: true
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'maintenance@logistics1.com',
    full_name: 'Maintenance Technician',
    role: 'maintenance',
    is_authorized: true
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    email: 'document@logistics1.com',
    full_name: 'Document Analyst',
    role: 'document_analyst',
    is_authorized: true
  }
]

const sampleInventory = [
  {
    item_name: 'Surgical Masks (N95)',
    rfid_code: 'RFID001',
    quantity: 150,
    status: 'in_stock',
    location: 'A-1-01'
  },
  {
    item_name: 'Disposable Gloves (Latex)',
    rfid_code: 'RFID002',
    quantity: 45,
    status: 'low_stock',
    location: 'A-1-02'
  },
  {
    item_name: 'Antiseptic Solution',
    rfid_code: 'RFID003',
    quantity: 200,
    status: 'in_stock',
    location: 'A-2-01'
  },
  {
    item_name: 'Medical Bandages',
    rfid_code: 'RFID004',
    quantity: 12,
    status: 'critical',
    location: 'A-2-02'
  },
  {
    item_name: 'Disposable Syringes',
    rfid_code: 'RFID005',
    quantity: 300,
    status: 'in_stock',
    location: 'B-1-01'
  },
  {
    item_name: 'Digital Thermometers',
    rfid_code: 'RFID006',
    quantity: 8,
    status: 'low_stock',
    location: 'B-1-02'
  },
  {
    item_name: 'Oxygen Masks',
    rfid_code: 'RFID007',
    quantity: 25,
    status: 'in_stock',
    location: 'C-1-01'
  },
  {
    item_name: 'IV Bags (500ml)',
    rfid_code: 'RFID008',
    quantity: 5,
    status: 'critical',
    location: 'C-1-02'
  }
]

const sampleProjects = [
  {
    name: 'Emergency Ward Renovation',
    status: 'on_track',
    progress: 75,
    start_date: '2024-12-01',
    end_date: '2025-03-15',
    budget: 500000,
    spent: 375000,
    staff_count: 8
  },
  {
    name: 'New Equipment Installation',
    status: 'delayed',
    progress: 45,
    start_date: '2024-11-15',
    end_date: '2025-02-28',
    budget: 300000,
    spent: 135000,
    staff_count: 5
  },
  {
    name: 'Supply Chain Optimization',
    status: 'on_track',
    progress: 90,
    start_date: '2024-10-01',
    end_date: '2025-01-30',
    budget: 150000,
    spent: 135000,
    staff_count: 3
  }
]

const sampleAssets = [
  {
    name: 'X-Ray Machine Model XR-2000',
    rfid_code: 'ASSET001',
    condition: 'excellent',
    next_maintenance: '2025-02-15',
    location: 'Radiology Department'
  },
  {
    name: 'MRI Scanner Model MRI-500',
    rfid_code: 'ASSET002',
    condition: 'good',
    next_maintenance: '2025-01-20',
    location: 'Imaging Center'
  },
  {
    name: 'Ultrasound Machine Model US-300',
    rfid_code: 'ASSET003',
    condition: 'needs_repair',
    next_maintenance: '2025-01-10',
    location: 'Emergency Ward'
  }
]

const samplePurchaseOrders = [
  {
    supplier: 'MedSupply Philippines',
    items: 15,
    amount: 45000,
    status: 'pending',
    rfid_code: 'PO001',
    created_by: '44444444-4444-4444-4444-444444444444'
  },
  {
    supplier: 'Global Medical Equipment',
    items: 8,
    amount: 125000,
    status: 'approved',
    rfid_code: 'PO002',
    created_by: '44444444-4444-4444-4444-444444444444'
  }
]

const sampleDocuments = [
  {
    file_name: 'delivery_receipt_001.pdf',
    file_type: 'delivery_receipt',
    file_size: 1024000,
    status: 'verified',
    uploaded_by: '33333333-3333-3333-3333-333333333333'
  },
  {
    file_name: 'purchase_order_medsupply.pdf',
    file_type: 'purchase_order',
    file_size: 512000,
    status: 'pending_verification',
    uploaded_by: '44444444-4444-4444-4444-444444444444'
  }
]

const sampleSystemLogs = [
  {
    action: 'User Login',
    user_id: '11111111-1111-1111-1111-111111111111',
    details: 'Admin user logged in successfully'
  },
  {
    action: 'RFID Scan',
    user_id: '33333333-3333-3333-3333-333333333333',
    details: 'Scanned RFID001 - Surgical Masks'
  },
  {
    action: 'Purchase Order Created',
    user_id: '44444444-4444-4444-4444-444444444444',
    details: 'Created PO001 for MedSupply Philippines'
  },
  {
    action: 'Asset Maintenance',
    user_id: '66666666-6666-6666-6666-666666666666',
    details: 'Scheduled maintenance for X-Ray Machine'
  },
  {
    action: 'Document Upload',
    user_id: '77777777-7777-7777-7777-777777777777',
    details: 'Uploaded delivery_receipt_001.pdf'
  }
]

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Insert users
    console.log('👥 Adding users...')
    const { error: usersError } = await supabase
      .from('users')
      .upsert(sampleUsers)
    
    if (usersError) {
      console.error('❌ Error adding users:', usersError.message)
    } else {
      console.log('✅ Users added successfully')
    }

    // Insert inventory
    console.log('📦 Adding inventory...')
    const { error: inventoryError } = await supabase
      .from('inventory')
      .upsert(sampleInventory)
    
    if (inventoryError) {
      console.error('❌ Error adding inventory:', inventoryError.message)
    } else {
      console.log('✅ Inventory added successfully')
    }

    // Insert projects
    console.log('📋 Adding projects...')
    const { error: projectsError } = await supabase
      .from('projects')
      .upsert(sampleProjects)
    
    if (projectsError) {
      console.error('❌ Error adding projects:', projectsError.message)
    } else {
      console.log('✅ Projects added successfully')
    }

    // Insert assets
    console.log('🔧 Adding assets...')
    const { error: assetsError } = await supabase
      .from('assets')
      .upsert(sampleAssets)
    
    if (assetsError) {
      console.error('❌ Error adding assets:', assetsError.message)
    } else {
      console.log('✅ Assets added successfully')
    }

    // Insert purchase orders
    console.log('🛒 Adding purchase orders...')
    const { error: ordersError } = await supabase
      .from('purchase_orders')
      .upsert(samplePurchaseOrders)
    
    if (ordersError) {
      console.error('❌ Error adding purchase orders:', ordersError.message)
    } else {
      console.log('✅ Purchase orders added successfully')
    }

    // Insert documents
    console.log('📄 Adding documents...')
    const { error: docsError } = await supabase
      .from('documents')
      .upsert(sampleDocuments)
    
    if (docsError) {
      console.error('❌ Error adding documents:', docsError.message)
    } else {
      console.log('✅ Documents added successfully')
    }

    // Insert system logs
    console.log('📊 Adding system logs...')
    const { error: logsError } = await supabase
      .from('system_logs')
      .upsert(sampleSystemLogs)
    
    if (logsError) {
      console.error('❌ Error adding system logs:', logsError.message)
    } else {
      console.log('✅ System logs added successfully')
    }

    console.log('🎉 Database seeding completed successfully!')
    console.log('📊 Your database now contains:')
    console.log('   - 7 users with different roles')
    console.log('   - 8 inventory items with RFID codes')
    console.log('   - 3 active projects')
    console.log('   - 3 assets with maintenance schedules')
    console.log('   - 2 purchase orders')
    console.log('   - 2 documents')
    console.log('   - 5 system activity logs')

  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
  }
}

// Run the seeding
seedDatabase()
