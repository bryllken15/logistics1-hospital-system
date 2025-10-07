import { supabase } from '../lib/supabase'

// Inventory Services
export const inventoryService = {
  // Get all inventory items
  async getAll() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get inventory by RFID
  async getByRfid(rfidCode: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('rfid_code', rfidCode)
      .single()

    if (error) throw error
    return data
  },

  // Update inventory quantity
  async updateQuantity(id: string, quantity: number) {
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  },

  // Add new inventory item
  async create(item: any) {
    const { data, error } = await supabase
      .from('inventory')
      .insert(item)
      .select()

    if (error) throw error
    return data
  }
}

// Purchase Orders Services
export const purchaseOrderService = {
  // Get all purchase orders
  async getAll() {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        users:created_by(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Create new purchase order
  async create(order: any) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(order)
      .select()

    if (error) throw error
    return data
  },

  // Update purchase order status
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  }
}

// Projects Services
export const projectService = {
  // Get all projects
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Create new project
  async create(project: any) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()

    if (error) throw error
    return data
  },

  // Update project progress
  async updateProgress(id: string, progress: number) {
    const { data, error } = await supabase
      .from('projects')
      .update({ progress, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  }
}

// Assets Services
export const assetService = {
  // Get all assets
  async getAll() {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get asset by RFID
  async getByRfid(rfidCode: string) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('rfid_code', rfidCode)
      .single()

    if (error) throw error
    return data
  },

  // Update asset condition
  async updateCondition(id: string, condition: string) {
    const { data, error } = await supabase
      .from('assets')
      .update({ condition, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  }
}

// Documents Services
export const documentService = {
  // Get all documents
  async getAll() {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        users:uploaded_by(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Create new document
  async create(document: any) {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()

    if (error) throw error
    return data
  },

  // Update document status
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  }
}

// Users Services
export const userService = {
  // Get all users
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get pending authorizations
  async getPendingAuthorizations() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_authorized', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Authorize user
  async authorizeUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ is_authorized: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  }
}

// System Logs Services
export const systemLogService = {
  // Get system logs
  async getAll(limit = 50) {
    const { data, error } = await supabase
      .from('system_logs')
      .select(`
        *,
        users:user_id(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Create system log
  async create(log: any) {
    const { data, error } = await supabase
      .from('system_logs')
      .insert(log)
      .select()

    if (error) throw error
    return data
  }
}

// Analytics Services
export const analyticsService = {
  // Get inventory analytics
  async getInventoryAnalytics() {
    const { data, error } = await supabase
      .from('inventory')
      .select('status, quantity')

    if (error) throw error
    return data
  },

  // Get procurement analytics
  async getProcurementAnalytics() {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('status, amount, created_at')

    if (error) throw error
    return data
  },

  // Get project analytics
  async getProjectAnalytics() {
    const { data, error } = await supabase
      .from('projects')
      .select('status, progress, budget, spent')

    if (error) throw error
    return data
  },

  // Get asset analytics
  async getAssetAnalytics() {
    const { data, error } = await supabase
      .from('assets')
      .select('condition')

    if (error) throw error
    return data
  },

  // Get document analytics
  async getDocumentAnalytics() {
    const { data, error } = await supabase
      .from('documents')
      .select('file_type, status, created_at')

    if (error) throw error
    return data
  }
}
