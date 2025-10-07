import { supabase } from '../lib/supabase'

// Authentication Services
export const authService = {
  // Authenticate user with username and password
  async authenticate(username: string, password: string) {
    const { data, error } = await supabase
      .rpc('authenticate_user', {
        user_username: username,
        user_password: password
      })
      .single()

    if (error) throw error
    return data
  },

  // Get user by username
  async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error) throw error
    return data
  },

  // Get user by ID
  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
}

// Inventory Services
export const inventoryService = {
  // Get all inventory items
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get inventory by RFID
  async getByRfid(rfidCode: string) {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('rfid_code', rfidCode)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.warn('Database not available, using demo data')
      return null
    }
  },

  // Update inventory quantity
  async updateQuantity(id: string, quantity: number) {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Add new inventory item
  async create(item: any) {
    try {
      console.log('=== INVENTORY SERVICE CREATE START ===')
      console.log('Item data received:', item)
      console.log('Supabase client:', supabase)
      
      const insertResult = await supabase
        .from('inventory')
        .insert(item)
      
      console.log('Insert result:', insertResult)
      
      const { data, error } = insertResult

      console.log('Supabase response - data:', data)
      console.log('Supabase response - error:', error)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Returning data:', data || [])
      console.log('=== INVENTORY SERVICE CREATE SUCCESS ===')
      return data || []
    } catch (error) {
      console.error('=== INVENTORY SERVICE CREATE ERROR ===')
      console.error('Database not available, using demo data:', error)
      return []
    }
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
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(order)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Update purchase order status
  async updateStatus(id: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
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
  },

  // Update project status
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('projects')
      .update({ status, updated_at: new Date().toISOString() })
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

  // Create new asset
  async create(asset: any) {
    const { data, error } = await supabase
      .from('assets')
      .insert(asset)
      .select()

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
  },

  // Archive document
  async archive(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
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
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get pending authorizations
  async getPendingAuthorizations() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_authorized', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Authorize user
  async authorizeUser(id: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_authorized: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// System Logs Services
export const systemLogService = {
  // Get system logs
  async getAll(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select(`
          *,
          users:user_id(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Create system log
  async create(log: any) {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .insert(log)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Log user action
  async logAction(action: string, userId: string, details?: string) {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .insert({
          action,
          user_id: userId,
          details: details || `${action} performed by user ${userId}`
        })
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Failed to log action:', error)
      return []
    }
  }
}

// Analytics Services
export const analyticsService = {
  // Get inventory analytics
  async getInventoryAnalytics() {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('status, quantity')

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get procurement analytics
  async getProcurementAnalytics() {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('status, amount, created_at')

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get project analytics
  async getProjectAnalytics() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('status, progress, budget, spent')

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get asset analytics
  async getAssetAnalytics() {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('condition')

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get document analytics
  async getDocumentAnalytics() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('file_type, status, created_at')

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// Supplier Services
export const supplierService = {
  // Get all suppliers
  async getAll() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Add new supplier
  async create(supplier: any) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()

    if (error) throw error
    return data
  },

  // Update supplier
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  },

  // Delete supplier
  async delete(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Maintenance Services
export const maintenanceService = {
  // Get all maintenance logs
  async getAll() {
    const { data, error } = await supabase
      .from('maintenance_logs')
      .select(`
        *,
        assets:asset_id(name, rfid_code)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Create new maintenance log
  async create(maintenance: any) {
    const { data, error } = await supabase
      .from('maintenance_logs')
      .insert(maintenance)
      .select()

    if (error) throw error
    return data
  },

  // Update maintenance status
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('maintenance_logs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  }
}

// Delivery Receipt Services
export const deliveryReceiptService = {
  // Get all delivery receipts
  async getAll() {
    const { data, error } = await supabase
      .from('delivery_receipts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Create new delivery receipt
  async create(receipt: any) {
    const { data, error } = await supabase
      .from('delivery_receipts')
      .insert(receipt)
      .select()

    if (error) throw error
    return data
  },

  // Update delivery receipt status
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('delivery_receipts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  }
}


// Purchase Requests Services
export const purchaseRequestService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select(`
          *,
          requested_by_user:requested_by (id, full_name),
          approved_by_user:approved_by (id, full_name)
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },
  async create(request: any) {
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .insert(request)
        .select()
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },
  async approve(id: string, approvedBy: string) {
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .update({ 
          status: 'approved', 
          approved_by: approvedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },
  async reject(id: string, approvedBy: string) {
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .update({ 
          status: 'rejected', 
          approved_by: approvedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// Staff Assignment Services
export const staffAssignmentService = {
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('staff_assignments')
      .select(`
        *,
        users:user_id (id, full_name, email, role),
        assigned_by_user:assigned_by (id, full_name)
      `)
      .eq('project_id', projectId)
    if (error) throw error
    return data
  },
  async assign(assignment: any) {
    const { data, error } = await supabase
      .from('staff_assignments')
      .insert(assignment)
      .select()
    if (error) throw error
    return data
  },
  async remove(projectId: string, userId: string) {
    const { data, error } = await supabase
      .from('staff_assignments')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId)
    if (error) throw error
    return data
  }
}

// Inventory Changes Services
export const inventoryChangeService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('inventory_changes')
        .select(`
          *,
          inventory:inventory_id (id, item_name, rfid_code),
          changed_by_user:changed_by (id, full_name),
          approved_by_user:approved_by (id, full_name)
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },
  async create(change: any) {
    try {
      const { data, error } = await supabase
        .from('inventory_changes')
        .insert(change)
        .select()
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },
  async approve(id: string, approvedBy: string) {
    try {
      const { data, error } = await supabase
        .from('inventory_changes')
        .update({ 
          status: 'approved', 
          approved_by: approvedBy
        })
        .eq('id', id)
        .select()
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },
  async reject(id: string, approvedBy: string) {
    try {
      const { data, error } = await supabase
        .from('inventory_changes')
        .update({ 
          status: 'rejected', 
          approved_by: approvedBy
        })
        .eq('id', id)
        .select()
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// Maintenance Schedule Services
export const maintenanceScheduleService = {
  async getAll() {
    const { data, error } = await supabase
      .from('maintenance_schedule')
      .select(`
        *,
        assets:asset_id (id, name, rfid_code, condition, location),
        created_by_user:created_by (id, full_name)
      `)
      .order('scheduled_date', { ascending: true })
    if (error) throw error
    return data
  },
  async create(schedule: any) {
    const { data, error } = await supabase
      .from('maintenance_schedule')
      .insert(schedule)
      .select()
    if (error) throw error
    return data
  },
  async update(id: string, schedule: any) {
    const { data, error } = await supabase
      .from('maintenance_schedule')
      .update(schedule)
      .eq('id', id)
      .select()
    if (error) throw error
    return data
  },
  async getByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('maintenance_schedule')
      .select(`
        *,
        assets:asset_id (id, name, rfid_code, condition, location)
      `)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true })
    if (error) throw error
    return data
  }
}

// Notifications Services
export const notificationService = {
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async create(notification: any) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
    if (error) throw error
    return data
  },
  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
    if (error) throw error
    return data
  },
  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .select()
    if (error) throw error
    return data
  }
}

// Reports Services
export const reportService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          generated_by_user:generated_by (id, full_name)
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },
  async create(report: any) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert(report)
        .select()
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },
  async getByType(reportType: string) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('report_type', reportType)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}