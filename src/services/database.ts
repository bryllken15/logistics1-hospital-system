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

    if (error) throw error
    
    // Return first user if found, null if not found
    return data && data.length > 0 ? data[0] : null
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

  // Add new inventory item with approval workflow
  async create(item: any) {
    try {
      console.log('=== INVENTORY SERVICE CREATE START ===')
      console.log('Item data received:', item)
      
      // Validate required fields
      if (!item.item_name || !item.rfid_code || !item.location) {
        throw new Error('Missing required fields: item_name, rfid_code, and location are required')
      }
      
      // Add default values if not provided
      const inventoryData = {
        item_name: item.item_name,
        rfid_code: item.rfid_code,
        quantity: item.quantity || 0,
        status: item.status || 'in_stock',
        location: item.location,
        unit_price: item.unit_price || 0,
        created_by: item.created_by || 'system'
        // total_value is a generated column, so we don't include it
        // created_at and updated_at are auto-generated, so we don't include them
      }
      
      console.log('Processed inventory data:', inventoryData)
      
      const { data, error } = await supabase
        .from('inventory')
        .insert(inventoryData)
        .select()

      console.log('Supabase response - data:', data)
      console.log('Supabase response - error:', error)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from inventory creation')
      }
      
      console.log('Returning data:', data)
      console.log('=== INVENTORY SERVICE CREATE SUCCESS ===')
      return data
    } catch (error) {
      console.error('=== INVENTORY SERVICE CREATE ERROR ===')
      console.error('Error creating inventory item:', error)
      throw error
    }
  },

  // Create inventory item with approval workflow (fallback to regular create if approval tables don't exist)
  async createWithApproval(item: any, createdBy: string) {
    try {
      console.log('=== INVENTORY CREATE WITH APPROVAL START ===')
      console.log('Item data:', item)
      console.log('Created by:', createdBy)
      
      // Create approval request directly (no need for inventory table)
      const approvalData = {
        item_name: item.item_name,
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        // total_value is a generated column, so we don't include it
        status: 'pending',
        requested_by: createdBy,
        request_reason: item.reason || 'New inventory item request',
        request_type: 'new_item'
        // created_at is auto-generated, so we don't include it
      }

      console.log('Creating approval request with data:', approvalData)

      const { data: approvalResult, error: approvalError } = await supabase
        .from('inventory_approvals')
        .insert(approvalData)
        .select()

      if (approvalError) {
        console.error('Approval creation failed:', approvalError)
        throw approvalError
      } else {
        console.log('Approval request created successfully:', approvalResult[0])
      }

      console.log('=== INVENTORY CREATE WITH APPROVAL SUCCESS ===')
      return approvalResult
    } catch (error) {
      console.error('=== INVENTORY CREATE WITH APPROVAL ERROR ===')
      console.error('Error creating inventory with approval:', error)
      
      // No fallback needed - we're using inventory_approvals table directly
      throw error
    }
  },

  // Approve inventory item
  async approve(id: string, approvedBy: string, role: 'manager' | 'project_manager') {
    try {
      // First get the approval request details
      const { data: approvalRequest, error: fetchError } = await supabase
        .from('inventory_approvals')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Update approval status (don't set status to 'approved' yet)
      const { data: approvalData, error: approvalError } = await supabase
        .from('inventory_approvals')
        .update({ 
          [`${role}_approved`]: true,
          [`${role}_approved_by`]: approvedBy,
          [`${role}_approved_at`]: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (approvalError) {
        throw approvalError
      }

      // Check if both manager and project manager have approved
      const approval = approvalData?.[0]
      if (approval?.manager_approved && approval?.project_manager_approved) {
        console.log('Both manager and project manager have approved the request - transferring to inventory table')
        
        // Update status to approved
        const { data: finalApproval, error: finalApprovalError } = await supabase
          .from('inventory_approvals')
          .update({ 
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()

        if (finalApprovalError) {
          console.error('Error updating final approval status:', finalApprovalError)
        }

        // Transfer approved item to inventory table
        try {
          const inventoryData = {
            item_name: approvalRequest.item_name,
            rfid_code: `RFID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique RFID
            quantity: approvalRequest.quantity,
            status: 'in_stock',
            location: 'Warehouse', // Default location, can be updated later
            unit_price: approvalRequest.unit_price,
            created_by: approvalRequest.requested_by,
            updated_by: approvedBy
            // total_value is a generated column, so we don't include it
            // created_at and updated_at are auto-generated, so we don't include them
          }

          console.log('Transferring approved item to inventory table:', inventoryData)

          const { data: inventoryResult, error: inventoryError } = await supabase
            .from('inventory')
            .insert(inventoryData)
            .select()

          if (inventoryError) {
            console.error('Error transferring to inventory table:', inventoryError)
            // Don't throw error here, approval is still successful
          } else {
            console.log('Successfully transferred approved item to inventory table:', inventoryResult[0])
          }
        } catch (transferError) {
          console.error('Error during inventory transfer:', transferError)
          // Don't throw error here, approval is still successful
        }

        return { ...approval, fully_approved: true }
      } else if (approval?.manager_approved) {
        console.log('Manager has approved, waiting for project manager approval')
        return { ...approval, fully_approved: false, waiting_for: 'project_manager' }
      } else if (approval?.project_manager_approved) {
        console.log('Project manager has approved, waiting for manager approval')
        return { ...approval, fully_approved: false, waiting_for: 'manager' }
      }

      return { ...approval, fully_approved: false, waiting_for: 'both' }
    } catch (error) {
      console.error('Error approving inventory item:', error)
      throw error
    }
  },

  // Get pending inventory approvals
  async getPendingApprovals() {
    try {
      const { data, error } = await supabase
        .from('inventory_approvals')
        .select('*')
        .eq('status', 'pending')
        .eq('manager_approved', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
      return []
    }
  },

  // Get pending inventory approvals for Project Manager Dashboard
  async getPendingProjectManagerApprovals() {
    try {
      console.log('🔍 INVENTORY SERVICE: getPendingProjectManagerApprovals called')
      
      const { data, error } = await supabase
        .from('inventory_approvals')
        .select('*')
        .eq('manager_approved', true)
        .eq('project_manager_approved', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ INVENTORY SERVICE: Error fetching pending project manager approvals:', error)
        throw error
      }
      
      console.log('✅ INVENTORY SERVICE: Pending project manager approvals fetched:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ INVENTORY SERVICE: Error fetching pending project manager approvals:', error)
      return []
    }
  },

  // Reject inventory approval
  async reject(id: string, rejectedBy: string, role: 'manager' | 'project_manager') {
    try {
      // Update approval status to rejected
      const { data: approvalData, error: approvalError } = await supabase
        .from('inventory_approvals')
        .update({ 
          status: 'rejected',
          [`${role}_approved`]: false,
          [`${role}_approved_by`]: rejectedBy,
          [`${role}_approved_at`]: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (approvalError) throw approvalError

      return approvalData
    } catch (error) {
      console.error('Error rejecting inventory approval:', error)
      throw error
    }
  },

  // Get all inventory approvals for a user
  async getByUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('inventory_approvals')
        .select('*')
        .eq('requested_by', userId)
        .order('created_at', { ascending: false})

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user inventory approvals:', error)
      return []
    }
  }
}


// Purchase Orders Services
export const purchaseOrderService = {
  // Get all purchase orders
  async getAll() {
    try {
      console.log('🔄 Fetching purchase orders...')
      
      // Try database first (consistent with update method)
      try {
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            suppliers (
              id,
              name,
              contact,
              email,
              rating,
              status
            )
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('❌ Database fetch failed, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Purchase orders fetched from database:', data?.length || 0)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localOrders = JSON.parse(localStorage.getItem('purchase_orders') || '[]')
        
        if (localOrders.length > 0) {
          console.log('✅ Purchase orders fetched from localStorage:', localOrders.length)
          return localOrders
        }
        
        console.log('📝 No orders found in database or localStorage')
        return []
      }
    } catch (error) {
      console.error('💥 Purchase order fetch failed:', error)
      return []
    }
  },

  // Get purchase order by ID
  async getById(id: string) {
    try {
      console.log('🔄 Fetching purchase order by ID:', id)
      
      try {
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            suppliers (
              id,
              name,
              contact,
              email,
              rating,
              status
            )
          `)
          .eq('id', id)
          .single()

        if (error) {
          console.warn('❌ Database fetch failed, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Purchase order fetched from database:', data)
        return data
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localOrders = JSON.parse(localStorage.getItem('purchase_orders') || '[]')
        const order = localOrders.find(o => o.id === id)
        
        if (order) {
          console.log('✅ Purchase order fetched from localStorage:', order)
          return order
        }
        
        throw new Error('Order not found')
      }
    } catch (error) {
      console.error('💥 Purchase order fetch failed:', error)
      throw error
    }
  },

  // Get purchase orders by status
  async getByStatus(status: string) {
    try {
      console.log('🔄 Fetching purchase orders by status:', status)
      
      try {
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            suppliers (
              id,
              name,
              contact,
              email,
              rating,
              status
            )
          `)
          .eq('status', status)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('❌ Database fetch failed, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Purchase orders fetched from database:', data?.length || 0)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localOrders = JSON.parse(localStorage.getItem('purchase_orders') || '[]')
        const filteredOrders = localOrders.filter(o => o.status === status)
        
        console.log('✅ Purchase orders fetched from localStorage:', filteredOrders.length)
        return filteredOrders
      }
    } catch (error) {
      console.error('💥 Purchase order fetch failed:', error)
      return []
    }
  },

  // Create new purchase order
  async create(order: any) {
    try {
      console.log('🔄 Creating purchase order:', order)
      
      // Validate required fields
      if (!order.supplier || !order.items || !order.amount) {
        throw new Error('Missing required fields: supplier, items, and amount are required')
      }
      
      // Try database first
      try {
        // First, find or create supplier
        let supplierId = order.supplier_id
        if (!supplierId) {
          const { data: existingSupplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('name', order.supplier)
            .single()
          
          if (existingSupplier) {
            supplierId = existingSupplier.id
          } else {
            // Create new supplier
            const { data: newSupplier, error: supplierError } = await supabase
              .from('suppliers')
              .insert({
                name: order.supplier,
                contact: order.contact || 'Unknown',
                email: order.email || 'unknown@example.com',
                rating: 5
              })
              .select()
              .single()
            
            if (supplierError) {
              console.warn('Failed to create supplier:', supplierError.message)
              supplierId = null
            } else {
              supplierId = newSupplier.id
            }
          }
        }

        const orderData = {
          order_number: 'PO-' + Date.now(),
          supplier_id: supplierId,
          supplier_name: order.supplier,
          items: order.items,
          amount: order.amount,
          description: order.description || '',
          priority: order.priority || 'medium',
          status: order.status || 'pending',
          expected_delivery: order.expected_delivery || null,
          rfid_code: order.rfid_code || null,
          created_by: order.created_by || null
        }
        
        const { data, error } = await supabase
          .from('purchase_orders')
          .insert(orderData)
          .select()

        if (error) {
          console.warn('❌ Database creation failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Purchase order created in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, creating order in localStorage...')
        
        // Create a mock order with generated ID
        const mockOrder = {
          id: 'order-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          order_number: 'PO-' + Date.now(),
          supplier_id: order.supplier_id || null,
          supplier_name: order.supplier,
          items: order.items,
          amount: order.amount,
          description: order.description || '',
          priority: order.priority || 'medium',
          status: order.status || 'pending',
          expected_delivery: order.expected_delivery || null,
          rfid_code: order.rfid_code || null,
          created_by: order.created_by || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('📝 Created mock order:', mockOrder)
        
        // Store in localStorage
        try {
          const existingOrders = JSON.parse(localStorage.getItem('purchase_orders') || '[]')
          existingOrders.push(mockOrder)
          localStorage.setItem('purchase_orders', JSON.stringify(existingOrders))
          console.log('✅ Order stored in localStorage')
        } catch (storageError) {
          console.warn('Failed to store in localStorage:', storageError)
        }
        
        console.log('✅ Purchase order created successfully:', mockOrder)
        return [mockOrder]
      }
    } catch (error) {
      console.error('💥 Purchase order creation failed:', error)
      throw error
    }
  },

  // Update purchase order status
  async updateStatus(id: string, status: string) {
    try {
      console.log('🔄 Updating purchase order status:', id, status)
      
      // Try database first
      try {
        const { data, error } = await supabase
          .from('purchase_orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database update failed, using localStorage:', error.message)
          throw error
        }
        
        console.log('✅ Purchase order status updated in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Updating order status in localStorage...')
        const localOrders = JSON.parse(localStorage.getItem('purchase_orders') || '[]')
        const orderIndex = localOrders.findIndex(o => o.id === id)
        
        if (orderIndex !== -1) {
          localOrders[orderIndex] = {
            ...localOrders[orderIndex],
            status,
            updated_at: new Date().toISOString()
          }
          localStorage.setItem('purchase_orders', JSON.stringify(localOrders))
          console.log('✅ Order status updated in localStorage:', localOrders[orderIndex])
          return [localOrders[orderIndex]]
        } else {
          throw new Error('Order not found')
        }
      }
    } catch (error) {
      console.error('💥 Purchase order status update failed:', error)
      throw error
    }
  },

  // Update purchase order
  async update(id: string, updates: any) {
    try {
      console.log('🔄 Updating purchase order:', id, updates)
      
      // Try database first
      try {
        // Handle supplier updates
        let updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        }

        // If supplier name is being updated, handle supplier relationship
        if (updates.supplier && updates.supplier !== updates.supplier_name) {
          // Find or create supplier
          const { data: existingSupplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('name', updates.supplier)
            .single()
          
          if (existingSupplier) {
            updateData.supplier_id = existingSupplier.id
            updateData.supplier_name = updates.supplier
          } else {
            // Create new supplier
            const { data: newSupplier, error: supplierError } = await supabase
              .from('suppliers')
              .insert({
                name: updates.supplier,
                contact: updates.contact || 'Unknown',
                email: updates.email || 'unknown@example.com',
                rating: 5
              })
              .select()
              .single()
            
            if (!supplierError && newSupplier) {
              updateData.supplier_id = newSupplier.id
              updateData.supplier_name = updates.supplier
            }
          }
        }
        
        const { data, error } = await supabase
          .from('purchase_orders')
          .update(updateData)
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          // Database error - fall back to localStorage
          throw new Error('DATABASE_ERROR')
        }
        
        // Check if any rows were updated
        if (!data || data.length === 0) {
          console.log('📝 Order not found in database, checking localStorage...')
          // Order not in database, try localStorage
          const localOrders = JSON.parse(localStorage.getItem('purchase_orders') || '[]')
          const orderIndex = localOrders.findIndex(o => o.id === id)
          
          if (orderIndex !== -1) {
            localOrders[orderIndex] = {
              ...localOrders[orderIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('purchase_orders', JSON.stringify(localOrders))
            console.log('✅ Order updated in localStorage:', localOrders[orderIndex])
            return [localOrders[orderIndex]]
          } else {
            throw new Error('Order not found in database or localStorage')
          }
        }
        
        console.log('✅ Purchase order updated in database:', data)
        return data || []
      } catch (dbError) {
        // Only fall back to localStorage if it's a database connection error
        if (dbError.message === 'DATABASE_ERROR') {
          console.log('🔄 Database unavailable, updating order in localStorage...')
          const localOrders = JSON.parse(localStorage.getItem('purchase_orders') || '[]')
          const orderIndex = localOrders.findIndex(o => o.id === id)
          
          if (orderIndex !== -1) {
            localOrders[orderIndex] = {
              ...localOrders[orderIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('purchase_orders', JSON.stringify(localOrders))
            console.log('✅ Order updated in localStorage:', localOrders[orderIndex])
            return [localOrders[orderIndex]]
          } else {
            throw new Error('Order not found in localStorage')
          }
        } else {
          // Re-throw other errors (like "Order not found")
          throw dbError
        }
      }
    } catch (error) {
      console.error('💥 Purchase order update failed:', error)
      throw error
    }
  },

  // Delete purchase order
  async delete(id: string) {
    try {
      console.log('🔄 Deleting purchase order:', id)
      
      // Try database first
      try {
        const { error } = await supabase
          .from('purchase_orders')
          .delete()
          .eq('id', id)

        if (error) {
          console.warn('❌ Database delete failed, using localStorage:', error.message)
          throw error
        }
        
        console.log('✅ Purchase order deleted from database')
        return true
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Deleting order from localStorage...')
        const localOrders = JSON.parse(localStorage.getItem('purchase_orders') || '[]')
        const orderIndex = localOrders.findIndex(o => o.id === id)
        
        if (orderIndex !== -1) {
          localOrders.splice(orderIndex, 1)
          localStorage.setItem('purchase_orders', JSON.stringify(localOrders))
          console.log('✅ Order deleted from localStorage')
          return true
        } else {
          throw new Error('Order not found')
        }
      }
    } catch (error) {
      console.error('💥 Purchase order deletion failed:', error)
      throw error
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
  },

  // Filter projects with multiple criteria
  async filter(filters: any) {
    try {
      let query = supabase
        .from('projects')
        .select('*')

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.searchText) {
        query = query.ilike('project_name', `%${filters.searchText}%`)
      }

      if (filters.dateRange?.start) {
        query = query.gte('start_date', filters.dateRange.start)
      }

      if (filters.dateRange?.end) {
        query = query.lte('end_date', filters.dateRange.end)
      }

      if (filters.budgetRange?.min) {
        query = query.gte('budget', filters.budgetRange.min)
      }

      if (filters.budgetRange?.max) {
        query = query.lte('budget', filters.budgetRange.max)
      }

      // Apply sorting
      const sortOrder = filters.sortOrder === 'desc' ? { ascending: false } : { ascending: true }
      query = query.order(filters.sortBy || 'project_name', sortOrder)

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error filtering projects:', error)
      return []
    }
  },

  // Update project
  async update(id: string, data: any) {
    try {
      const { data: result, error } = await supabase
        .from('projects')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return result[0]
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  },

  // Archive project (soft delete)
  async archive(id: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error archiving project:', error)
      throw error
    }
  },

  // Get projects with statistics
  async getWithStats() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          staff_assignments:staff_assignments(count),
          project_deliveries:project_deliveries(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching projects with stats:', error)
      return []
    }
  },

  // Get project timeline with deliveries
  async getProjectTimeline(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_deliveries:project_deliveries(*),
          staff_assignments:staff_assignments(*)
        `)
        .eq('id', projectId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching project timeline:', error)
      return null
    }
  },

  // Get projects by filters
  async getByFilters(filters: any) {
    try {
      let query = supabase
        .from('projects')
        .select('*')

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.searchText) {
        query = query.ilike('name', `%${filters.searchText}%`)
      }

      if (filters.dateRange?.start) {
        query = query.gte('start_date', filters.dateRange.start)
      }

      if (filters.dateRange?.end) {
        query = query.lte('end_date', filters.dateRange.end)
      }

      if (filters.budgetRange?.min) {
        query = query.gte('budget', filters.budgetRange.min)
      }

      if (filters.budgetRange?.max) {
        query = query.lte('budget', filters.budgetRange.max)
      }

      if (filters.sortBy) {
        const order = filters.sortOrder === 'desc' ? false : true
        // Map frontend sortBy to actual column names
        const columnMap: { [key: string]: string } = {
          'project_name': 'name',
          'name': 'name',
          'status': 'status',
          'budget': 'budget',
          'start_date': 'start_date',
          'end_date': 'end_date'
        }
        const actualColumn = columnMap[filters.sortBy] || filters.sortBy
        query = query.order(actualColumn, { ascending: order })
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching filtered projects:', error)
      return []
    }
  },

  // Update project status
  async updateProjectStatus(id: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating project status:', error)
      throw error
    }
  }
}

// Assets Services
export const assetService = {
  // Get all assets
  async getAll() {
    try {
      console.log('🔄 Fetching assets...')
      
      let databaseAssets = []
      let localAssets = []
      
      // Try to fetch from database
      try {
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('❌ Database fetch failed:', error.message)
        } else {
          databaseAssets = data || []
          console.log('✅ Assets fetched from database:', databaseAssets.length)
        }
      } catch (dbError) {
        console.warn('❌ Database unavailable:', dbError.message)
      }
      
      // Always check localStorage as well
      try {
        const localData = JSON.parse(localStorage.getItem('assets') || '[]')
        localAssets = localData || []
        console.log('✅ Assets fetched from localStorage:', localAssets.length)
      } catch (localError) {
        console.warn('❌ localStorage unavailable:', localError.message)
      }
      
      // Merge and deduplicate results
      const allAssets = [...databaseAssets, ...localAssets]
      const uniqueAssets = allAssets.filter((asset, index, self) => 
        index === self.findIndex(a => a.id === asset.id)
      )
      
      console.log('✅ Total unique assets:', uniqueAssets.length)
      return uniqueAssets
    } catch (error) {
      console.error('💥 Asset fetch failed:', error)
      return []
    }
  },

  // Get asset by ID
  async getById(id: string) {
    try {
      console.log('🔄 Fetching asset by ID:', id)
      
      try {
        const { data, error } = await supabase
          .from('assets')
          .select(`
            *,
            maintenance_logs (
              id,
              maintenance_type,
              status,
              created_at
            )
          `)
          .eq('id', id)
          .single()

        if (error) {
          console.warn('❌ Database fetch failed, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Asset fetched from database:', data)
        return data
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localAssets = JSON.parse(localStorage.getItem('assets') || '[]')
        const asset = localAssets.find(a => a.id === id)
        
        if (asset) {
          console.log('✅ Asset fetched from localStorage:', asset)
          return asset
        }
        
        throw new Error('Asset not found')
      }
    } catch (error) {
      console.error('💥 Asset fetch failed:', error)
      throw error
    }
  },

  // Get asset by RFID
  async getByRfid(rfidCode: string) {
    try {
      console.log('🔄 Fetching asset by RFID:', rfidCode)
      
      try {
        const { data, error } = await supabase
          .from('assets')
          .select(`
            *,
            maintenance_logs (
              id,
              maintenance_type,
              status,
              created_at
            )
          `)
          .eq('rfid_code', rfidCode)
          .single()

        if (error) {
          console.warn('❌ Database fetch failed, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Asset fetched from database:', data)
        return data
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localAssets = JSON.parse(localStorage.getItem('assets') || '[]')
        const asset = localAssets.find(a => a.rfid_code === rfidCode)
        
        if (asset) {
          console.log('✅ Asset fetched from localStorage:', asset)
          return asset
        }
        
        throw new Error('Asset not found')
      }
    } catch (error) {
      console.error('💥 Asset fetch failed:', error)
      throw error
    }
  },

  // Create new asset
  async create(asset: any) {
    try {
      console.log('🔄 Creating asset:', asset)
      
      // Validate required fields
      if (!asset.name) {
        throw new Error('Missing required field: name is required')
      }
      
      try {
        // Use only the columns that actually exist in the assets table
        const assetData = {
          name: asset.name,
          rfid_code: asset.rfid_code || '',
          location: asset.location || '',
          condition: asset.condition || 'good',
          next_maintenance: asset.next_maintenance || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
        
        const { data, error } = await supabase
          .from('assets')
          .insert(assetData)
          .select()

        if (error) {
          console.warn('❌ Database creation failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Asset created in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, creating asset in localStorage...')
        
        // Create a mock asset with generated ID
        const mockAsset = {
          id: 'asset-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          name: asset.name,
          rfid_code: asset.rfid_code || '',
          location: asset.location || '',
          condition: asset.condition || 'good',
          next_maintenance: asset.next_maintenance || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('📝 Created mock asset:', mockAsset)
        
        // Store in localStorage
        try {
          const existingAssets = JSON.parse(localStorage.getItem('assets') || '[]')
          existingAssets.push(mockAsset)
          localStorage.setItem('assets', JSON.stringify(existingAssets))
          console.log('✅ Asset stored in localStorage')
        } catch (storageError) {
          console.warn('Failed to store in localStorage:', storageError)
        }
        
        console.log('✅ Asset created successfully:', mockAsset)
        return [mockAsset]
      }
    } catch (error) {
      console.error('💥 Asset creation failed:', error)
      throw error
    }
  },

  // Update asset
  async update(id: string, updates: any) {
    try {
      console.log('🔄 Updating asset:', id, updates)
      
      try {
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('assets')
          .update(updateData)
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        // Check if any rows were updated
        if (!data || data.length === 0) {
          console.log('📝 Asset not found in database, checking localStorage...')
          // Asset not in database, try localStorage
          const localAssets = JSON.parse(localStorage.getItem('assets') || '[]')
          const assetIndex = localAssets.findIndex(a => a.id === id)
          
          if (assetIndex !== -1) {
            localAssets[assetIndex] = {
              ...localAssets[assetIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('assets', JSON.stringify(localAssets))
            console.log('✅ Asset updated in localStorage:', localAssets[assetIndex])
            return [localAssets[assetIndex]]
          } else {
            throw new Error('Asset not found in database or localStorage')
          }
        }
        
        console.log('✅ Asset updated in database:', data)
        return data || []
      } catch (dbError) {
        // Only fall back to localStorage if it's a database connection error
        if (dbError.message === 'DATABASE_ERROR') {
          console.log('🔄 Database unavailable, updating asset in localStorage...')
          const localAssets = JSON.parse(localStorage.getItem('assets') || '[]')
          const assetIndex = localAssets.findIndex(a => a.id === id)
          
          if (assetIndex !== -1) {
            localAssets[assetIndex] = {
              ...localAssets[assetIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('assets', JSON.stringify(localAssets))
            console.log('✅ Asset updated in localStorage:', localAssets[assetIndex])
            return [localAssets[assetIndex]]
          } else {
            throw new Error('Asset not found in localStorage')
          }
        } else {
          // Re-throw other errors (like "Asset not found")
          throw dbError
        }
      }
    } catch (error) {
      console.error('💥 Asset update failed:', error)
      throw error
    }
  },

  // Update asset condition
  async updateCondition(id: string, condition: string) {
    try {
      console.log('🔄 Updating asset condition:', id, condition)
      
      try {
        const { data, error } = await supabase
          .from('assets')
          .update({ 
            condition, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Asset condition updated in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, updating asset condition in localStorage...')
        const localAssets = JSON.parse(localStorage.getItem('assets') || '[]')
        const assetIndex = localAssets.findIndex(a => a.id === id)
        
        if (assetIndex !== -1) {
          localAssets[assetIndex] = {
            ...localAssets[assetIndex],
            condition,
            updated_at: new Date().toISOString()
          }
          localStorage.setItem('assets', JSON.stringify(localAssets))
          console.log('✅ Asset condition updated in localStorage:', localAssets[assetIndex])
          return [localAssets[assetIndex]]
        } else {
          throw new Error('Asset not found')
        }
      }
    } catch (error) {
      console.error('💥 Asset condition update failed:', error)
      throw error
    }
  },

  // Delete asset
  async delete(id: string) {
    try {
      console.log('🔄 Deleting asset:', id)
      
      try {
        const { error } = await supabase
          .from('assets')
          .delete()
          .eq('id', id)

        if (error) {
          console.warn('❌ Database delete failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Asset deleted from database')
        return true
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, deleting asset from localStorage...')
        const localAssets = JSON.parse(localStorage.getItem('assets') || '[]')
        const assetIndex = localAssets.findIndex(a => a.id === id)
        
        if (assetIndex !== -1) {
          localAssets.splice(assetIndex, 1)
          localStorage.setItem('assets', JSON.stringify(localAssets))
          console.log('✅ Asset deleted from localStorage')
          return true
        } else {
          throw new Error('Asset not found')
        }
      }
    } catch (error) {
      console.error('💥 Asset deletion failed:', error)
      throw error
    }
  }
}

// Documents Services
export const documentService = {
  // Get all documents
  async getAll() {
    try {
      console.log('🔄 Fetching documents...')
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select(`
            *,
            users:uploaded_by(full_name, email),
            document_versions (
              id,
              version_number,
              file_path,
              file_name,
              change_summary,
              created_by,
              created_at
            )
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('❌ Database fetch failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Documents fetched from database:', data?.length || 0)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
        
        if (localDocuments.length > 0) {
          console.log('✅ Documents fetched from localStorage:', localDocuments.length)
          return localDocuments
        }
        
        console.log('📝 No documents found in database or localStorage')
        return []
      }
    } catch (error) {
      console.error('💥 Document fetch failed:', error)
      return []
    }
  },

  // Get document by ID
  async getById(id: string) {
    try {
      console.log('🔄 Fetching document by ID:', id)
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select(`
            *,
            users:uploaded_by(full_name, email),
            document_versions (
              id,
              version_number,
              file_path,
              file_name,
              change_summary,
              created_by,
              created_at
            )
          `)
          .eq('id', id)
          .single()

        if (error) {
          console.warn('❌ Database fetch failed, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Document fetched from database:', data)
        return data
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
        const document = localDocuments.find(d => d.id === id)
        
        if (document) {
          console.log('✅ Document fetched from localStorage:', document)
          return document
        }
        
        throw new Error('Document not found')
      }
    } catch (error) {
      console.error('💥 Document fetch failed:', error)
      throw error
    }
  },

  // Get documents by status
  async getByStatus(status: string) {
    try {
      console.log('🔄 Fetching documents by status:', status)
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select(`
            *,
            users:uploaded_by(full_name, email)
          `)
          .eq('status', status)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('❌ Database fetch failed, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Documents fetched from database:', data?.length || 0)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
        const filteredDocuments = localDocuments.filter(d => d.status === status)
        
        console.log('✅ Documents fetched from localStorage:', filteredDocuments.length)
        return filteredDocuments
      }
    } catch (error) {
      console.error('💥 Document fetch failed:', error)
      return []
    }
  },

  // Create new document
  async create(document: any) {
    try {
      console.log('🔄 Creating document:', document)
      
      // Validate required fields
      if (!document.file_name || !document.file_type) {
        throw new Error('Missing required fields: file_name and file_type are required')
      }
      
      try {
        const documentData = {
          file_name: document.file_name,
          file_type: document.file_type,
          file_size: document.file_size || 0,
          status: document.status || 'pending_verification',
          uploaded_by: document.uploaded_by || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('documents')
          .insert(documentData)
          .select()

        if (error) {
          console.warn('❌ Database creation failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Document created in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, creating document in localStorage...')
        
        // Create a mock document with generated ID
        const mockDocument = {
          id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          file_name: document.file_name,
          file_type: document.file_type,
          file_size: document.file_size || 0,
          status: document.status || 'pending_verification',
          uploaded_by: document.uploaded_by || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('📝 Created mock document:', mockDocument)
        
        // Store in localStorage
        try {
          const existingDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
          existingDocuments.push(mockDocument)
          localStorage.setItem('documents', JSON.stringify(existingDocuments))
          console.log('✅ Document stored in localStorage')
        } catch (storageError) {
          console.warn('Failed to store in localStorage:', storageError)
        }
        
        console.log('✅ Document created successfully:', mockDocument)
        return [mockDocument]
      }
    } catch (error) {
      console.error('💥 Document creation failed:', error)
      throw error
    }
  },

  // Update document
  async update(id: string, updates: any) {
    try {
      console.log('🔄 Updating document:', id, updates)
      
      try {
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('documents')
          .update(updateData)
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        // Check if any rows were updated
        if (!data || data.length === 0) {
          console.log('📝 Document not found in database, checking localStorage...')
          // Document not in database, try localStorage
          const localDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
          const documentIndex = localDocuments.findIndex(d => d.id === id)
          
          if (documentIndex !== -1) {
            localDocuments[documentIndex] = {
              ...localDocuments[documentIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('documents', JSON.stringify(localDocuments))
            console.log('✅ Document updated in localStorage:', localDocuments[documentIndex])
            return [localDocuments[documentIndex]]
          } else {
            throw new Error('Document not found in database or localStorage')
          }
        }
        
        console.log('✅ Document updated in database:', data)
        return data || []
      } catch (dbError) {
        // Only fall back to localStorage if it's a database connection error
        if (dbError.message === 'DATABASE_ERROR') {
          console.log('🔄 Database unavailable, updating document in localStorage...')
          const localDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
          const documentIndex = localDocuments.findIndex(d => d.id === id)
          
          if (documentIndex !== -1) {
            localDocuments[documentIndex] = {
              ...localDocuments[documentIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('documents', JSON.stringify(localDocuments))
            console.log('✅ Document updated in localStorage:', localDocuments[documentIndex])
            return [localDocuments[documentIndex]]
          } else {
            throw new Error('Document not found in localStorage')
          }
        } else {
          // Re-throw other errors (like "Document not found")
          throw dbError
        }
      }
    } catch (error) {
      console.error('💥 Document update failed:', error)
      throw error
    }
  },

  // Update document status
  async updateStatus(id: string, status: string) {
    try {
      console.log('🔄 Updating document status:', id, status)
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .update({ 
            status, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Document status updated in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, updating document status in localStorage...')
        const localDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
        const documentIndex = localDocuments.findIndex(d => d.id === id)
        
        if (documentIndex !== -1) {
          localDocuments[documentIndex] = {
            ...localDocuments[documentIndex],
            status,
            updated_at: new Date().toISOString()
          }
          localStorage.setItem('documents', JSON.stringify(localDocuments))
          console.log('✅ Document status updated in localStorage:', localDocuments[documentIndex])
          return [localDocuments[documentIndex]]
        } else {
          throw new Error('Document not found')
        }
      }
    } catch (error) {
      console.error('💥 Document status update failed:', error)
      throw error
    }
  },

  // Archive document
  async archive(id: string) {
    try {
      console.log('🔄 Archiving document:', id)
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .update({ 
            status: 'archived', 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Document archived in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, archiving document in localStorage...')
        const localDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
        const documentIndex = localDocuments.findIndex(d => d.id === id)
        
        if (documentIndex !== -1) {
          localDocuments[documentIndex] = {
            ...localDocuments[documentIndex],
            status: 'archived',
            updated_at: new Date().toISOString()
          }
          localStorage.setItem('documents', JSON.stringify(localDocuments))
          console.log('✅ Document archived in localStorage:', localDocuments[documentIndex])
          return [localDocuments[documentIndex]]
        } else {
          throw new Error('Document not found')
        }
      }
    } catch (error) {
      console.error('💥 Document archiving failed:', error)
      throw error
    }
  },

  // Delete document
  async delete(id: string) {
    try {
      console.log('🔄 Deleting document:', id)
      
      try {
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', id)

        if (error) {
          console.warn('❌ Database delete failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Document deleted from database')
        return true
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, deleting document from localStorage...')
        const localDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
        const documentIndex = localDocuments.findIndex(d => d.id === id)
        
        if (documentIndex !== -1) {
          localDocuments.splice(documentIndex, 1)
          localStorage.setItem('documents', JSON.stringify(localDocuments))
          console.log('✅ Document deleted from localStorage')
          return true
        } else {
          throw new Error('Document not found')
        }
      }
    } catch (error) {
      console.error('💥 Document deletion failed:', error)
      throw error
    }
  }
}

// Document Version Control Services
export const documentVersionService = {
  // Get document versions
  async getByDocumentId(documentId: string) {
    try {
      console.log('🔄 Fetching document versions for:', documentId)
      
      try {
        const { data, error } = await supabase
          .from('document_versions')
          .select(`
            *,
            users:created_by(full_name, email)
          `)
          .eq('document_id', documentId)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('❌ Database fetch failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Document versions fetched from database:', data?.length || 0)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, checking localStorage...')
        const localVersions = JSON.parse(localStorage.getItem('document_versions') || '[]')
        const documentVersions = localVersions.filter(v => v.document_id === documentId)
        
        console.log('✅ Document versions fetched from localStorage:', documentVersions.length)
        return documentVersions
      }
    } catch (error) {
      console.error('💥 Document versions fetch failed:', error)
      return []
    }
  },

  // Create document version
  async create(versionData: any) {
    try {
      console.log('🔄 Creating document version:', versionData)
      
      try {
        const version = {
          document_id: versionData.document_id,
          version_number: versionData.version_number,
          file_path: versionData.file_path,
          file_name: versionData.file_name,
          file_size: versionData.file_size || 0,
          change_summary: versionData.change_summary || '',
          created_by: versionData.created_by || null,
          created_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('document_versions')
          .insert(version)
          .select()

        if (error) {
          console.warn('❌ Database creation failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Document version created in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, creating document version in localStorage...')
        
        const mockVersion = {
          id: 'version-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          document_id: versionData.document_id,
          version_number: versionData.version_number,
          file_path: versionData.file_path,
          file_name: versionData.file_name,
          file_size: versionData.file_size || 0,
          change_summary: versionData.change_summary || '',
          created_by: versionData.created_by || null,
          created_at: new Date().toISOString()
        }
        
        console.log('📝 Created mock document version:', mockVersion)
        
        // Store in localStorage
        try {
          const existingVersions = JSON.parse(localStorage.getItem('document_versions') || '[]')
          existingVersions.push(mockVersion)
          localStorage.setItem('document_versions', JSON.stringify(existingVersions))
          console.log('✅ Document version stored in localStorage')
        } catch (storageError) {
          console.warn('Failed to store in localStorage:', storageError)
        }
        
        console.log('✅ Document version created successfully:', mockVersion)
        return [mockVersion]
      }
    } catch (error) {
      console.error('💥 Document version creation failed:', error)
      throw error
    }
  }
}

// Document Approval Services
export const documentApprovalService = {
  // Get document approvals
  async getByDocumentId(documentId: string) {
    try {
      console.log('🔄 Fetching document approvals for:', documentId)
      
      try {
        const { data, error } = await supabase
          .from('document_approvals')
          .select(`
            *,
            users:approver_id(full_name, email)
          `)
          .eq('document_id', documentId)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('❌ Database fetch failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Document approvals fetched from database:', data?.length || 0)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, checking localStorage...')
        const localApprovals = JSON.parse(localStorage.getItem('document_approvals') || '[]')
        const documentApprovals = localApprovals.filter(a => a.document_id === documentId)
        
        console.log('✅ Document approvals fetched from localStorage:', documentApprovals.length)
        return documentApprovals
      }
    } catch (error) {
      console.error('💥 Document approvals fetch failed:', error)
      return []
    }
  },

  // Create document approval
  async create(approvalData: any) {
    try {
      console.log('🔄 Creating document approval:', approvalData)
      
      try {
        const approval = {
          document_id: approvalData.document_id,
          approver_id: approvalData.approver_id,
          status: approvalData.status || 'pending',
          comments: approvalData.comments || '',
          approved_at: approvalData.status === 'approved' ? new Date().toISOString() : null,
          created_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('document_approvals')
          .insert(approval)
          .select()

        if (error) {
          console.warn('❌ Database creation failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Document approval created in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, creating document approval in localStorage...')
        
        const mockApproval = {
          id: 'approval-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          document_id: approvalData.document_id,
          approver_id: approvalData.approver_id,
          status: approvalData.status || 'pending',
          comments: approvalData.comments || '',
          approved_at: approvalData.status === 'approved' ? new Date().toISOString() : null,
          created_at: new Date().toISOString()
        }
        
        console.log('📝 Created mock document approval:', mockApproval)
        
        // Store in localStorage
        try {
          const existingApprovals = JSON.parse(localStorage.getItem('document_approvals') || '[]')
          existingApprovals.push(mockApproval)
          localStorage.setItem('document_approvals', JSON.stringify(existingApprovals))
          console.log('✅ Document approval stored in localStorage')
        } catch (storageError) {
          console.warn('Failed to store in localStorage:', storageError)
        }
        
        console.log('✅ Document approval created successfully:', mockApproval)
        return [mockApproval]
      }
    } catch (error) {
      console.error('💥 Document approval creation failed:', error)
      throw error
    }
  },

  // Update approval status
  async updateStatus(id: string, status: string, comments?: string) {
    try {
      console.log('🔄 Updating document approval status:', id, status)
      
      try {
        const updateData = {
          status,
          comments: comments || null,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('document_approvals')
          .update(updateData)
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Document approval status updated in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, updating document approval in localStorage...')
        const localApprovals = JSON.parse(localStorage.getItem('document_approvals') || '[]')
        const approvalIndex = localApprovals.findIndex(a => a.id === id)
        
        if (approvalIndex !== -1) {
          localApprovals[approvalIndex] = {
            ...localApprovals[approvalIndex],
            status,
            comments: comments || localApprovals[approvalIndex].comments,
            approved_at: status === 'approved' ? new Date().toISOString() : localApprovals[approvalIndex].approved_at,
            updated_at: new Date().toISOString()
          }
          localStorage.setItem('document_approvals', JSON.stringify(localApprovals))
          console.log('✅ Document approval status updated in localStorage:', localApprovals[approvalIndex])
          return [localApprovals[approvalIndex]]
        } else {
          throw new Error('Document approval not found')
        }
      }
    } catch (error) {
      console.error('💥 Document approval status update failed:', error)
      throw error
    }
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
      console.log('🔄 Fetching document analytics...')
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('file_type, status, created_at, file_size, uploaded_by')

        if (error) {
          console.warn('❌ Database fetch failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Document analytics fetched from database:', data?.length || 0)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, checking localStorage...')
        const localDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
        
        console.log('✅ Document analytics fetched from localStorage:', localDocuments.length)
        return localDocuments
      }
    } catch (error) {
      console.error('💥 Document analytics fetch failed:', error)
      return []
    }
  },

  // Get document statistics
  async getDocumentStats() {
    try {
      console.log('🔄 Fetching document statistics...')
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('status, file_type, created_at, file_size')

        if (error) {
          console.warn('❌ Database fetch failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        // Calculate statistics
        const stats = {
          total: data?.length || 0,
          pending: data?.filter(d => d.status === 'pending_verification').length || 0,
          verified: data?.filter(d => d.status === 'verified').length || 0,
          rejected: data?.filter(d => d.status === 'rejected').length || 0,
          archived: data?.filter(d => d.status === 'archived').length || 0,
          totalSize: data?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0,
          byType: data?.reduce((acc, doc) => {
            acc[doc.file_type] = (acc[doc.file_type] || 0) + 1
            return acc
          }, {}) || {}
        }
        
        console.log('✅ Document statistics calculated:', stats)
        return stats
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, calculating from localStorage...')
        const localDocuments = JSON.parse(localStorage.getItem('documents') || '[]')
        
        const stats = {
          total: localDocuments.length,
          pending: localDocuments.filter(d => d.status === 'pending_verification').length,
          verified: localDocuments.filter(d => d.status === 'verified').length,
          rejected: localDocuments.filter(d => d.status === 'rejected').length,
          archived: localDocuments.filter(d => d.status === 'archived').length,
          totalSize: localDocuments.reduce((sum, doc) => sum + (doc.file_size || 0), 0),
          byType: localDocuments.reduce((acc, doc) => {
            acc[doc.file_type] = (acc[doc.file_type] || 0) + 1
            return acc
          }, {})
        }
        
        console.log('✅ Document statistics calculated from localStorage:', stats)
        return stats
      }
    } catch (error) {
      console.error('💥 Document statistics fetch failed:', error)
      return {
        total: 0,
        pending: 0,
        verified: 0,
        rejected: 0,
        archived: 0,
        totalSize: 0,
        byType: {}
      }
    }
  },

  // Enhanced analytics for Manager Dashboard
  async getProcessingTimeMetrics(managerId: string, startDate: Date, endDate: Date) {
    try {
      // Get inventory processing times
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_approvals')
        .select('created_at, manager_approved_at')
        .eq('manager_approved_by', managerId)
        .gte('manager_approved_at', startDate.toISOString())
        .lte('manager_approved_at', endDate.toISOString())

      // Get procurement processing times
      const { data: procurementData, error: procurementError } = await supabase
        .from('procurement_approvals')
        .select('created_at, manager_approved_at')
        .eq('manager_approved_by', managerId)
        .gte('manager_approved_at', startDate.toISOString())
        .lte('manager_approved_at', endDate.toISOString())

      if (inventoryError) throw inventoryError
      if (procurementError) throw procurementError

      // Calculate processing times
      const inventoryTimes = inventoryData?.map(item => {
        const created = new Date(item.created_at)
        const approved = new Date(item.manager_approved_at)
        return approved.getTime() - created.getTime()
      }) || []

      const procurementTimes = procurementData?.map(item => {
        const created = new Date(item.created_at)
        const approved = new Date(item.manager_approved_at)
        return approved.getTime() - created.getTime()
      }) || []

      const allTimes = [...inventoryTimes, ...procurementTimes]
      const avgTime = allTimes.length > 0 ? allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length : 0

      // Store metrics
      await supabase
        .from('performance_metrics')
        .insert({
          metric_type: 'processing_time',
          metric_name: 'Average Processing Time',
          metric_value: avgTime / (1000 * 60 * 60), // Convert to hours
          metric_unit: 'hours',
          calculated_for: managerId,
          period_start: startDate.toISOString().split('T')[0],
          period_end: endDate.toISOString().split('T')[0]
        })

      return {
        averageProcessingTime: avgTime,
        inventoryCount: inventoryTimes.length,
        procurementCount: procurementTimes.length,
        totalCount: allTimes.length
      }
    } catch (error) {
      console.error('Error calculating processing time metrics:', error)
      throw error
    }
  },

  async getApprovalRatios(managerId: string, startDate: Date, endDate: Date) {
    try {
      // Get approval statistics
      const { data: inventoryStats, error: inventoryError } = await supabase
        .from('inventory_approvals')
        .select('status')
        .eq('manager_approved_by', managerId)
        .gte('manager_approved_at', startDate.toISOString())
        .lte('manager_approved_at', endDate.toISOString())

      const { data: procurementStats, error: procurementError } = await supabase
        .from('procurement_approvals')
        .select('status')
        .eq('manager_approved_by', managerId)
        .gte('manager_approved_at', startDate.toISOString())
        .lte('manager_approved_at', endDate.toISOString())

      if (inventoryError) throw inventoryError
      if (procurementError) throw procurementError

      const allStats = [...(inventoryStats || []), ...(procurementStats || [])]
      const approved = allStats.filter(item => item.status === 'approved').length
      const rejected = allStats.filter(item => item.status === 'rejected').length
      const pending = allStats.filter(item => item.status === 'pending').length

      const approvalRatio = allStats.length > 0 ? (approved / allStats.length) * 100 : 0

      // Store metrics
      await supabase
        .from('performance_metrics')
        .insert({
          metric_type: 'approval_ratio',
          metric_name: 'Approval Ratio',
          metric_value: approvalRatio,
          metric_unit: 'percentage',
          calculated_for: managerId,
          period_start: startDate.toISOString().split('T')[0],
          period_end: endDate.toISOString().split('T')[0]
        })

      return {
        approved,
        rejected,
        pending,
        total: allStats.length,
        approvalRatio
      }
    } catch (error) {
      console.error('Error calculating approval ratios:', error)
      throw error
    }
  }
}

// Supplier Services
export const supplierService = {
  // Get all suppliers
  async getAll() {
    try {
      console.log('🔄 Fetching suppliers...')
      
      // Check if we have suppliers in localStorage first
      const localSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]')
      
      if (localSuppliers.length > 0) {
        console.log('✅ Suppliers fetched from localStorage:', localSuppliers.length)
        return localSuppliers
      }
      
      // Try to get from database if no localStorage data
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('❌ Database fetch failed, using empty array:', error.message)
          return []
        }
        
        console.log('✅ Suppliers fetched from database:', data?.length || 0)
        return data || []
      } catch (dbError) {
        console.log('🔄 Database error, using empty array')
        return []
      }
    } catch (error) {
      console.error('💥 Supplier fetch failed:', error)
      // Final fallback to empty array
      return []
    }
  },

  // Add new supplier
  async create(supplier: any) {
    try {
      console.log('🔄 Creating supplier:', supplier)
      
      // Validate required fields
      if (!supplier.name || !supplier.contact || !supplier.email) {
        throw new Error('Missing required fields: name, contact, and email are required')
      }
      
      // Create a mock supplier with generated ID
      const mockSupplier = {
        id: 'supplier-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        name: supplier.name.trim(),
        contact: supplier.contact.trim(),
        email: supplier.email.trim(),
        rating: supplier.rating || 5,
        phone: supplier.phone || null,
        address: supplier.address || null,
        notes: supplier.notes || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null
      }
      
      console.log('📝 Created mock supplier:', mockSupplier)
      
      // Store in localStorage as fallback
      try {
        const existingSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]')
        existingSuppliers.push(mockSupplier)
        localStorage.setItem('suppliers', JSON.stringify(existingSuppliers))
        console.log('✅ Supplier stored in localStorage')
        
        // Also update the global suppliers list if it exists
        if (typeof window !== 'undefined' && (window as any).suppliersList) {
          (window as any).suppliersList.push(mockSupplier)
        }
      } catch (storageError) {
        console.warn('Failed to store in localStorage:', storageError)
      }
      
      console.log('✅ Supplier created successfully (mock):', mockSupplier)
      return [mockSupplier]
    } catch (error) {
      console.error('💥 Supplier creation failed:', error)
      throw error
    }
  },

  // Update supplier
  async update(id: string, updates: any) {
    try {
      console.log('🔄 Updating supplier:', id, updates)
      
      // Validate required fields if provided
      if (updates.email && !updates.email.includes('@')) {
        throw new Error('Invalid email format')
      }
      
      // Try database first
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .update(updates)
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database update failed, using localStorage:', error.message)
          throw error
        }
        
        console.log('✅ Supplier updated in database:', data)
        return data
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Updating supplier in localStorage...')
        const localSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]')
        const supplierIndex = localSuppliers.findIndex(s => s.id === id)
        
        if (supplierIndex !== -1) {
          localSuppliers[supplierIndex] = {
            ...localSuppliers[supplierIndex],
            ...updates,
            updated_at: new Date().toISOString()
          }
          localStorage.setItem('suppliers', JSON.stringify(localSuppliers))
          console.log('✅ Supplier updated in localStorage:', localSuppliers[supplierIndex])
          return [localSuppliers[supplierIndex]]
        } else {
          throw new Error('Supplier not found')
        }
      }
    } catch (error) {
      console.error('💥 Supplier update failed:', error)
      throw error
    }
  },

  // Delete supplier
  async delete(id: string) {
    try {
      console.log('🔄 Deleting supplier:', id)
      
      // Try database first
      try {
        const { error } = await supabase
          .from('suppliers')
          .delete()
          .eq('id', id)

        if (error) {
          console.warn('❌ Database delete failed, using localStorage:', error.message)
          throw error
        }
        
        console.log('✅ Supplier deleted from database')
        return true
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Deleting supplier from localStorage...')
        const localSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]')
        const supplierIndex = localSuppliers.findIndex(s => s.id === id)
        
        if (supplierIndex !== -1) {
          localSuppliers.splice(supplierIndex, 1)
          localStorage.setItem('suppliers', JSON.stringify(localSuppliers))
          console.log('✅ Supplier deleted from localStorage')
          return true
        } else {
          throw new Error('Supplier not found')
        }
      }
    } catch (error) {
      console.error('💥 Supplier deletion failed:', error)
      throw error
    }
  }
}

// Maintenance Services
export const maintenanceService = {
  // Get all maintenance logs
  async getAll() {
    try {
      console.log('🔄 Fetching maintenance logs...')
      
      let databaseLogs = []
      let localLogs = []
      
      // Try to fetch from database
      try {
        const { data, error } = await supabase
          .from('maintenance_logs')
          .select('*, assets(id, name, rfid_code, asset_type)')
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('❌ Database fetch failed:', error.message)
        } else {
          databaseLogs = data || []
          console.log('✅ Maintenance logs fetched from database:', databaseLogs.length)
        }
      } catch (dbError) {
        console.warn('❌ Database unavailable:', dbError.message)
      }
      
      // Always check localStorage as well
      try {
        const localData = JSON.parse(localStorage.getItem('maintenance_logs') || '[]')
        localLogs = localData || []
        console.log('✅ Maintenance logs fetched from localStorage:', localLogs.length)
      } catch (localError) {
        console.warn('❌ localStorage unavailable:', localError.message)
      }
      
      // Merge and deduplicate results
      const allLogs = [...databaseLogs, ...localLogs]
      const uniqueLogs = allLogs.filter((log, index, self) => 
        index === self.findIndex(l => l.id === log.id)
      )
      
      console.log('✅ Total unique maintenance logs:', uniqueLogs.length)
      return uniqueLogs
    } catch (error) {
      console.error('💥 Maintenance logs fetch failed:', error)
      return []
    }
  },

  // Get maintenance log by ID
  async getById(id: string) {
    try {
      console.log('🔄 Fetching maintenance log by ID:', id)
      
      try {
        const { data, error } = await supabase
          .from('maintenance_logs')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.warn('❌ Database fetch failed, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Maintenance log fetched from database:', data)
        return data
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localMaintenance = JSON.parse(localStorage.getItem('maintenance_logs') || '[]')
        const maintenance = localMaintenance.find(m => m.id === id)
        
        if (maintenance) {
          console.log('✅ Maintenance log fetched from localStorage:', maintenance)
          return maintenance
        }
        
        throw new Error('Maintenance log not found')
      }
    } catch (error) {
      console.error('💥 Maintenance log fetch failed:', error)
      throw error
    }
  },

  // Get maintenance logs by asset ID
  async getByAssetId(assetId: string) {
    try {
      console.log('🔄 Fetching maintenance logs for asset:', assetId)
      
      try {
        const { data, error } = await supabase
          .from('maintenance_logs')
          .select('*')
          .eq('asset_id', assetId)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('❌ Database fetch failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Maintenance logs fetched from database:', data?.length || 0)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localMaintenance = JSON.parse(localStorage.getItem('maintenance_logs') || '[]')
        const assetMaintenance = localMaintenance.filter(m => m.asset_id === assetId)
        
        console.log('✅ Maintenance logs fetched from localStorage:', assetMaintenance.length)
        return assetMaintenance
      }
    } catch (error) {
      console.error('💥 Maintenance logs fetch failed:', error)
      return []
    }
  },

  // Create new maintenance log
  async create(maintenance: any) {
    try {
      console.log('🔄 Creating maintenance log:', maintenance)
      
      // Validate required fields
      if (!maintenance.asset_id || !maintenance.maintenance_type) {
        throw new Error('Missing required fields: asset_id and maintenance_type are required')
      }
      
      try {
        const maintenanceData = {
          asset_id: maintenance.asset_id,
          maintenance_type: maintenance.maintenance_type,
          description: maintenance.description || '',
          status: maintenance.status || 'pending',
          priority: maintenance.priority || 'medium',
          scheduled_date: maintenance.scheduled_date || null,
          completed_date: maintenance.completed_date || null,
          performed_by: maintenance.performed_by || null,
          cost: maintenance.cost || 0,
          notes: maintenance.notes || '',
          created_by: maintenance.created_by || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('maintenance_logs')
          .insert(maintenanceData)
          .select()

        if (error) {
          console.warn('❌ Database creation failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Maintenance log created in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, creating maintenance log in localStorage...')
        
        // Create a mock maintenance log with generated ID
        const mockMaintenance = {
          id: 'maintenance-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          asset_id: maintenance.asset_id,
          maintenance_type: maintenance.maintenance_type,
          description: maintenance.description || '',
          status: maintenance.status || 'pending',
          priority: maintenance.priority || 'medium',
          scheduled_date: maintenance.scheduled_date || null,
          completed_date: maintenance.completed_date || null,
          performed_by: maintenance.performed_by || null,
          cost: maintenance.cost || 0,
          notes: maintenance.notes || '',
          created_by: maintenance.created_by || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('📝 Created mock maintenance log:', mockMaintenance)
        
        // Store in localStorage
        try {
          const existingMaintenance = JSON.parse(localStorage.getItem('maintenance_logs') || '[]')
          existingMaintenance.push(mockMaintenance)
          localStorage.setItem('maintenance_logs', JSON.stringify(existingMaintenance))
          console.log('✅ Maintenance log stored in localStorage')
        } catch (storageError) {
          console.warn('Failed to store in localStorage:', storageError)
        }
        
        console.log('✅ Maintenance log created successfully:', mockMaintenance)
        return [mockMaintenance]
      }
    } catch (error) {
      console.error('💥 Maintenance log creation failed:', error)
      throw error
    }
  },

  // Update maintenance log
  async update(id: string, updates: any) {
    try {
      console.log('🔄 Updating maintenance log:', id, updates)
      
      try {
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('maintenance_logs')
          .update(updateData)
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        // Check if any rows were updated
        if (!data || data.length === 0) {
          console.log('📝 Maintenance log not found in database, checking localStorage...')
          // Maintenance log not in database, try localStorage
          const localMaintenance = JSON.parse(localStorage.getItem('maintenance_logs') || '[]')
          const maintenanceIndex = localMaintenance.findIndex(m => m.id === id)
          
          if (maintenanceIndex !== -1) {
            localMaintenance[maintenanceIndex] = {
              ...localMaintenance[maintenanceIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('maintenance_logs', JSON.stringify(localMaintenance))
            console.log('✅ Maintenance log updated in localStorage:', localMaintenance[maintenanceIndex])
            return [localMaintenance[maintenanceIndex]]
          } else {
            throw new Error('Maintenance log not found in database or localStorage')
          }
        }
        
        console.log('✅ Maintenance log updated in database:', data)
        return data || []
      } catch (dbError) {
        // Only fall back to localStorage if it's a database connection error
        if (dbError.message === 'DATABASE_ERROR') {
          console.log('🔄 Database unavailable, updating maintenance log in localStorage...')
          const localMaintenance = JSON.parse(localStorage.getItem('maintenance_logs') || '[]')
          const maintenanceIndex = localMaintenance.findIndex(m => m.id === id)
          
          if (maintenanceIndex !== -1) {
            localMaintenance[maintenanceIndex] = {
              ...localMaintenance[maintenanceIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('maintenance_logs', JSON.stringify(localMaintenance))
            console.log('✅ Maintenance log updated in localStorage:', localMaintenance[maintenanceIndex])
            return [localMaintenance[maintenanceIndex]]
          } else {
            throw new Error('Maintenance log not found in localStorage')
          }
        } else {
          // Re-throw other errors (like "Maintenance log not found")
          throw dbError
        }
      }
    } catch (error) {
      console.error('💥 Maintenance log update failed:', error)
      throw error
    }
  },

  // Update maintenance status
  async updateStatus(id: string, status: string) {
    try {
      console.log('🔄 Updating maintenance status:', id, status)
      
      try {
        const { data, error } = await supabase
          .from('maintenance_logs')
          .update({ 
            status, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Maintenance status updated in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, updating maintenance status in localStorage...')
        const localMaintenance = JSON.parse(localStorage.getItem('maintenance_logs') || '[]')
        const maintenanceIndex = localMaintenance.findIndex(m => m.id === id)
        
        if (maintenanceIndex !== -1) {
          localMaintenance[maintenanceIndex] = {
            ...localMaintenance[maintenanceIndex],
            status,
            updated_at: new Date().toISOString()
          }
          localStorage.setItem('maintenance_logs', JSON.stringify(localMaintenance))
          console.log('✅ Maintenance status updated in localStorage:', localMaintenance[maintenanceIndex])
          return [localMaintenance[maintenanceIndex]]
        } else {
          throw new Error('Maintenance log not found')
        }
      }
    } catch (error) {
      console.error('💥 Maintenance status update failed:', error)
      throw error
    }
  },

  // Delete maintenance log
  async delete(id: string) {
    try {
      console.log('🔄 Deleting maintenance log:', id)
      
      try {
        const { error } = await supabase
          .from('maintenance_logs')
          .delete()
          .eq('id', id)

        if (error) {
          console.warn('❌ Database delete failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Maintenance log deleted from database')
        return true
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, deleting maintenance log from localStorage...')
        const localMaintenance = JSON.parse(localStorage.getItem('maintenance_logs') || '[]')
        const maintenanceIndex = localMaintenance.findIndex(m => m.id === id)
        
        if (maintenanceIndex !== -1) {
          localMaintenance.splice(maintenanceIndex, 1)
          localStorage.setItem('maintenance_logs', JSON.stringify(localMaintenance))
          console.log('✅ Maintenance log deleted from localStorage')
          return true
        } else {
          throw new Error('Maintenance log not found')
        }
      }
    } catch (error) {
      console.error('💥 Maintenance log deletion failed:', error)
      throw error
    }
  }
}

// Delivery Receipt Services
export const deliveryReceiptService = {
  // Get all delivery receipts
  async getAll() {
    try {
      console.log('🔄 Fetching delivery receipts...')
      const { data, error } = await supabase
        .from('delivery_receipts')
        .select(`
          *,
          purchase_orders (
            id,
            order_number,
            supplier_name,
            items,
            amount,
            status
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching delivery receipts:', error)
        throw error
      }
      
      console.log('✅ Delivery receipts fetched successfully:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('💥 Delivery receipt fetch failed:', error)
      throw error
    }
  },

  // Create new delivery receipt
  async create(receipt: any) {
    try {
      console.log('🔄 Creating delivery receipt:', receipt)
      
      // Add required fields
      const receiptData = {
        ...receipt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('delivery_receipts')
        .insert(receiptData)
        .select()

      if (error) {
        console.error('❌ Error creating delivery receipt:', error)
        throw error
      }
      
      console.log('✅ Delivery receipt created successfully:', data)
      return data
    } catch (error) {
      console.error('💥 Delivery receipt creation failed:', error)
      throw error
    }
  },

  // Update delivery receipt status
  async updateStatus(id: string, status: string) {
    try {
      console.log('🔄 Updating delivery receipt status:', id, status)
      
      const { data, error } = await supabase
        .from('delivery_receipts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) {
        console.error('❌ Error updating delivery receipt status:', error)
        throw error
      }
      
      console.log('✅ Delivery receipt status updated successfully:', data)
      return data
    } catch (error) {
      console.error('💥 Delivery receipt status update failed:', error)
      throw error
    }
  },

  // Create delivery receipt from purchase order
  async createFromPurchaseOrder(orderId: string, receiptData: any) {
    try {
      console.log('🔄 Creating delivery receipt from purchase order:', orderId)
      
      // Get the purchase order first
      const { data: order, error: orderError } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new Error('Purchase order not found')
      }

      // Create delivery receipt
      const deliveryReceipt = {
        order_id: orderId,
        supplier_name: order.supplier_name,
        items_received: receiptData.items_received || order.items,
        delivery_date: receiptData.delivery_date || new Date().toISOString().split('T')[0],
        status: receiptData.status || 'pending',
        rfid_code: receiptData.rfid_code || order.rfid_code,
        received_by: receiptData.received_by || null,
        notes: receiptData.notes || null
      }

      const { data, error } = await supabase
        .from('delivery_receipts')
        .insert(deliveryReceipt)
        .select()

      if (error) {
        console.error('❌ Error creating delivery receipt:', error)
        throw error
      }

      // Update purchase order status to delivered
      await supabase
        .from('purchase_orders')
        .update({ 
          status: 'delivered',
          actual_delivery: deliveryReceipt.delivery_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      console.log('✅ Delivery receipt created and order status updated:', data)
      return data
    } catch (error) {
      console.error('💥 Delivery receipt creation from purchase order failed:', error)
      throw error
    }
  },

  // Get deliveries by project
  async getByProject(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_receipts')
        .select('*')
        .eq('project_id', projectId)
        .order('delivery_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching deliveries by project:', error)
      return []
    }
  },

  // Update delivery
  async update(id: string, data: any) {
    try {
      const { data: result, error } = await supabase
        .from('delivery_receipts')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return result[0]
    } catch (error) {
      console.error('Error updating delivery:', error)
      throw error
    }
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
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('staff_assignments')
        .select(`
          *,
          users:user_id (id, full_name, email, role),
          projects:project_id (id, name, status),
          assigned_by_user:assigned_by (id, full_name)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching all staff assignments:', error)
      return []
    }
  },
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
        .from('inventory_change_requests')
        .select(`
          *,
          inventory:inventory_id (id, item_name, rfid_code),
          changed_by_user:requested_by (id, full_name),
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
  
  async getPending() {
    try {
      const { data, error } = await supabase
        .from('inventory_change_requests')
        .select(`
          *,
          inventory:inventory_id (id, item_name, rfid_code),
          changed_by_user:requested_by (id, full_name),
          approved_by_user:approved_by (id, full_name)
        `)
        .eq('status', 'pending')
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
        .from('inventory_change_requests')
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
        .from('inventory_change_requests')
        .update({ 
          status: 'approved', 
          approved_by: approvedBy,
          manager_approved: true,
          manager_approved_by: approvedBy,
          manager_approved_at: new Date().toISOString(),
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
        .from('inventory_change_requests')
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

// Maintenance Schedule Services
export const maintenanceScheduleService = {
  // Get all maintenance schedules
  async getAll() {
    try {
      console.log('🔄 Fetching maintenance schedules...')
      
      try {
        const { data, error } = await supabase
          .from('maintenance_schedule')
          .select(`
            *,
            assets:asset_id (id, name, rfid_code, condition, location, asset_type),
            created_by_user:created_by (id, full_name, email)
          `)
          .order('scheduled_date', { ascending: true })

        if (error) {
          console.warn('❌ Database fetch failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Maintenance schedules fetched from database:', data?.length || 0)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localSchedules = JSON.parse(localStorage.getItem('maintenance_schedule') || '[]')
        
        if (localSchedules.length > 0) {
          console.log('✅ Maintenance schedules fetched from localStorage:', localSchedules.length)
          return localSchedules
        }
        
        console.log('📝 No maintenance schedules found in database or localStorage')
        return []
      }
    } catch (error) {
      console.error('💥 Maintenance schedules fetch failed:', error)
      return []
    }
  },

  // Get maintenance schedule by ID
  async getById(id: string) {
    try {
      console.log('🔄 Fetching maintenance schedule by ID:', id)
      
      try {
        const { data, error } = await supabase
          .from('maintenance_schedule')
          .select(`
            *,
            assets:asset_id (id, name, rfid_code, condition, location, asset_type),
            created_by_user:created_by (id, full_name, email)
          `)
          .eq('id', id)
          .single()

        if (error) {
          console.warn('❌ Database fetch failed, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Maintenance schedule fetched from database:', data)
        return data
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, checking localStorage...')
        const localSchedules = JSON.parse(localStorage.getItem('maintenance_schedule') || '[]')
        const schedule = localSchedules.find(s => s.id === id)
        
        if (schedule) {
          console.log('✅ Maintenance schedule fetched from localStorage:', schedule)
          return schedule
        }
        
        throw new Error('Maintenance schedule not found')
      }
    } catch (error) {
      console.error('💥 Maintenance schedule fetch failed:', error)
      throw error
    }
  },

  // Create new maintenance schedule
  async create(schedule: any) {
    try {
      console.log('🔄 Creating maintenance schedule:', schedule)
      
      // Validate required fields
      if (!schedule.asset_id || !schedule.scheduled_date) {
        throw new Error('Missing required fields: asset_id and scheduled_date are required')
      }
      
      try {
        const scheduleData = {
          asset_id: schedule.asset_id,
          maintenance_type: schedule.maintenance_type || 'preventive',
          scheduled_date: schedule.scheduled_date,
          description: schedule.description || '',
          priority: schedule.priority || 'medium',
          assigned_to: schedule.assigned_to || null,
          estimated_duration: schedule.estimated_duration || 60,
          estimated_cost: schedule.estimated_cost || 0,
          status: schedule.status || 'scheduled',
          notes: schedule.notes || '',
          created_by: schedule.created_by || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('maintenance_schedule')
          .insert(scheduleData)
          .select()

        if (error) {
          console.warn('❌ Database creation failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Maintenance schedule created in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, creating maintenance schedule in localStorage...')
        
        // Create a mock schedule with generated ID
        const mockSchedule = {
          id: 'schedule-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          asset_id: schedule.asset_id,
          maintenance_type: schedule.maintenance_type || 'preventive',
          scheduled_date: schedule.scheduled_date,
          description: schedule.description || '',
          priority: schedule.priority || 'medium',
          assigned_to: schedule.assigned_to || null,
          estimated_duration: schedule.estimated_duration || 60,
          estimated_cost: schedule.estimated_cost || 0,
          status: schedule.status || 'scheduled',
          notes: schedule.notes || '',
          created_by: schedule.created_by || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('📝 Created mock maintenance schedule:', mockSchedule)
        
        // Store in localStorage
        try {
          const existingSchedules = JSON.parse(localStorage.getItem('maintenance_schedule') || '[]')
          existingSchedules.push(mockSchedule)
          localStorage.setItem('maintenance_schedule', JSON.stringify(existingSchedules))
          console.log('✅ Maintenance schedule stored in localStorage')
        } catch (storageError) {
          console.warn('Failed to store in localStorage:', storageError)
        }
        
        console.log('✅ Maintenance schedule created successfully:', mockSchedule)
        return [mockSchedule]
      }
    } catch (error) {
      console.error('💥 Maintenance schedule creation failed:', error)
      throw error
    }
  },

  // Update maintenance schedule
  async update(id: string, updates: any) {
    try {
      console.log('🔄 Updating maintenance schedule:', id, updates)
      
      try {
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('maintenance_schedule')
          .update(updateData)
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        // Check if any rows were updated
        if (!data || data.length === 0) {
          console.log('📝 Maintenance schedule not found in database, checking localStorage...')
          // Schedule not in database, try localStorage
          const localSchedules = JSON.parse(localStorage.getItem('maintenance_schedule') || '[]')
          const scheduleIndex = localSchedules.findIndex(s => s.id === id)
          
          if (scheduleIndex !== -1) {
            localSchedules[scheduleIndex] = {
              ...localSchedules[scheduleIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('maintenance_schedule', JSON.stringify(localSchedules))
            console.log('✅ Maintenance schedule updated in localStorage:', localSchedules[scheduleIndex])
            return [localSchedules[scheduleIndex]]
          } else {
            throw new Error('Maintenance schedule not found in database or localStorage')
          }
        }
        
        console.log('✅ Maintenance schedule updated in database:', data)
        return data || []
      } catch (dbError) {
        // Only fall back to localStorage if it's a database connection error
        if (dbError.message === 'DATABASE_ERROR') {
          console.log('🔄 Database unavailable, updating maintenance schedule in localStorage...')
          const localSchedules = JSON.parse(localStorage.getItem('maintenance_schedule') || '[]')
          const scheduleIndex = localSchedules.findIndex(s => s.id === id)
          
          if (scheduleIndex !== -1) {
            localSchedules[scheduleIndex] = {
              ...localSchedules[scheduleIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('maintenance_schedule', JSON.stringify(localSchedules))
            console.log('✅ Maintenance schedule updated in localStorage:', localSchedules[scheduleIndex])
            return [localSchedules[scheduleIndex]]
          } else {
            throw new Error('Maintenance schedule not found in localStorage')
          }
        } else {
          // Re-throw other errors (like "Maintenance schedule not found")
          throw dbError
        }
      }
    } catch (error) {
      console.error('💥 Maintenance schedule update failed:', error)
      throw error
    }
  },

  // Get schedules by date range
  async getByDateRange(startDate: string, endDate: string) {
    try {
      console.log('🔄 Fetching maintenance schedules by date range:', startDate, 'to', endDate)
      
      try {
        const { data, error } = await supabase
          .from('maintenance_schedule')
          .select(`
            *,
            assets:asset_id (id, name, rfid_code, condition, location, asset_type)
          `)
          .gte('scheduled_date', startDate)
          .lte('scheduled_date', endDate)
          .order('scheduled_date', { ascending: true })

        if (error) {
          console.warn('❌ Database fetch failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Maintenance schedules fetched from database:', data?.length || 0)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage if database is unavailable
        console.log('🔄 Database unavailable, filtering localStorage...')
        const localSchedules = JSON.parse(localStorage.getItem('maintenance_schedule') || '[]')
        const filteredSchedules = localSchedules.filter(s => 
          s.scheduled_date >= startDate && s.scheduled_date <= endDate
        )
        
        console.log('✅ Maintenance schedules fetched from localStorage:', filteredSchedules.length)
        return filteredSchedules
      }
    } catch (error) {
      console.error('💥 Maintenance schedules fetch failed:', error)
      return []
    }
  },

  // Delete maintenance schedule
  async delete(id: string) {
    try {
      console.log('🔄 Deleting maintenance schedule:', id)
      
      try {
        const { error } = await supabase
          .from('maintenance_schedule')
          .delete()
          .eq('id', id)

        if (error) {
          console.warn('❌ Database delete failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Maintenance schedule deleted from database')
        return true
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, deleting maintenance schedule from localStorage...')
        const localSchedules = JSON.parse(localStorage.getItem('maintenance_schedule') || '[]')
        const scheduleIndex = localSchedules.findIndex(s => s.id === id)
        
        if (scheduleIndex !== -1) {
          localSchedules.splice(scheduleIndex, 1)
          localStorage.setItem('maintenance_schedule', JSON.stringify(localSchedules))
          console.log('✅ Maintenance schedule deleted from localStorage')
          return true
        } else {
          throw new Error('Maintenance schedule not found')
        }
      }
    } catch (error) {
      console.error('💥 Maintenance schedule deletion failed:', error)
      throw error
    }
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
  },

  // Create approval notification
  async createApprovalNotification(userId: string, requestType: string, requestId: string, message: string, title?: string) {
    try {
      const notificationData = {
        user_id: userId,
        title: title || `${requestType} Approval Request`,
        message: message,
        type: 'approval_request',
        related_request_id: requestId,
        related_request_type: requestType
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating approval notification:', error)
      throw error
    }
  },

  // Notify next approver
  async notifyNextApprover(approvalId: string, approvalType: 'procurement' | 'inventory', currentApprover: string) {
    try {
      // Get approval details
      const tableName = approvalType === 'procurement' ? 'procurement_approvals' : 'inventory_approvals'
      const { data: approval, error: fetchError } = await supabase
        .from(tableName)
        .select('*, requested_by_user:requested_by(full_name)')
        .eq('id', approvalId)
        .single()

      if (fetchError) throw fetchError

      // Determine next approver
      let nextApproverId = null
      let message = ''

      if (approvalType === 'procurement') {
        if (!approval.manager_approved) {
          // Need manager approval
          const { data: managers } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'manager')
            .limit(1)
          
          nextApproverId = managers?.[0]?.id
          message = `New procurement request from ${approval.requested_by_user?.full_name} needs your approval`
        } else if (!approval.project_manager_approved) {
          // Need project manager approval
          const { data: projectManagers } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'project_manager')
            .limit(1)
          
          nextApproverId = projectManagers?.[0]?.id
          message = `Procurement request approved by manager, needs your final approval`
        }
      } else {
        if (!approval.manager_approved) {
          // Need manager approval
          const { data: managers } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'manager')
            .limit(1)
          
          nextApproverId = managers?.[0]?.id
          message = `New inventory request from ${approval.requested_by_user?.full_name} needs your approval`
        } else if (!approval.project_manager_approved) {
          // Need project manager approval
          const { data: projectManagers } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'project_manager')
            .limit(1)
          
          nextApproverId = projectManagers?.[0]?.id
          message = `Inventory request approved by manager, needs your final approval`
        }
      }

      if (nextApproverId) {
        await this.createApprovalNotification(
          nextApproverId,
          approvalType,
          approvalId,
          message,
          `${approvalType.charAt(0).toUpperCase() + approvalType.slice(1)} Approval Required`
        )
      }

      return { success: true }
    } catch (error) {
      console.error('Error notifying next approver:', error)
      throw error
    }
  },

  // Get user notifications
  async getUserNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user notifications:', error)
      return []
    }
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

// =============================================
// ENHANCED AUDIT & SECURITY SERVICES
// =============================================

// Audit Log Services
export const auditService = {
  // Get audit logs with filtering
  async getAuditLogs(filters: {
    tableName?: string;
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}) {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:user_id (id, full_name, username, role)
        `)
        .order('created_at', { ascending: false })

      if (filters.tableName) {
        query = query.eq('table_name', filters.tableName)
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }
      if (filters.action) {
        query = query.eq('action', filters.action)
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate)
      }
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get user activity logs
  async getUserActivityLogs(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get security events
  async getSecurityEvents(filters: {
    severity?: string;
    resolved?: boolean;
    limit?: number;
  } = {}) {
    try {
      let query = supabase
        .from('security_events')
        .select(`
          *,
          user:user_id (id, full_name, username),
          resolved_by_user:resolved_by (id, full_name)
        `)
        .order('created_at', { ascending: false })

      if (filters.severity) {
        query = query.eq('severity', filters.severity)
      }
      if (filters.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved)
      }
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Resolve security event
  async resolveSecurityEvent(eventId: string, resolvedBy: string, resolution: string) {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .update({
          resolved: true,
          resolved_by: resolvedBy,
          description: `${resolution} - ${new Date().toISOString()}`
        })
        .eq('id', eventId)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// =============================================
// ENHANCED APPROVAL WORKFLOW SERVICES
// =============================================

// Approval Chain Services
export const approvalChainService = {
  // Get all approval chains
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('approval_chains')
        .select('*')
        .order('request_type', { ascending: true })
        .order('approval_level', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get approval chains by request type
  async getByRequestType(requestType: string) {
    try {
      const { data, error } = await supabase
        .from('approval_chains')
        .select('*')
        .eq('request_type', requestType)
        .eq('is_active', true)
        .order('approval_level', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Create approval chain
  async create(chain: any) {
    try {
      const { data, error } = await supabase
        .from('approval_chains')
        .insert(chain)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Update approval chain
  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('approval_chains')
        .update(updates)
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

// Approval History Services
export const approvalHistoryService = {
  // Get approval history for a request
  async getByRequest(requestId: string, requestType: string) {
    try {
      const { data, error } = await supabase
        .from('approval_history')
        .select(`
          *,
          approver:approver_id (id, full_name, username, role)
        `)
        .eq('request_id', requestId)
        .eq('request_type', requestType)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Add approval history entry
  async addEntry(entry: any) {
    try {
      const { data, error } = await supabase
        .from('approval_history')
        .insert(entry)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// Approval Delegate Services
export const approvalDelegateService = {
  // Get active delegates for a user
  async getActiveDelegates(userId: string) {
    try {
      const { data, error } = await supabase
        .from('approval_delegates')
        .select(`
          *,
          delegate:delegate_id (id, full_name, username, role)
        `)
        .eq('delegator_id', userId)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString().split('T')[0])

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Create delegation
  async createDelegation(delegation: any) {
    try {
      const { data, error } = await supabase
        .from('approval_delegates')
        .insert(delegation)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Update delegation
  async updateDelegation(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('approval_delegates')
        .update(updates)
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

// =============================================
// ENHANCED NOTIFICATION SERVICES
// =============================================

// Notification Template Services
export const notificationTemplateService = {
  // Get all notification templates
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get template by type
  async getByType(type: string) {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.warn('Database not available, using demo data')
      return null
    }
  },

  // Create notification template
  async create(template: any) {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert(template)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// Notification Preference Services
export const notificationPreferenceService = {
  // Get user notification preferences
  async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Update user preferences
  async updatePreferences(userId: string, preferences: any[]) {
    try {
      // Delete existing preferences
      await supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', userId)

      // Insert new preferences
      const preferencesWithUserId = preferences.map(pref => ({
        ...pref,
        user_id: userId
      }))

      const { data, error } = await supabase
        .from('notification_preferences')
        .insert(preferencesWithUserId)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// Escalation Rule Services
export const escalationRuleService = {
  // Get escalation rules
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('escalation_rules')
        .select(`
          *,
          escalate_to_user:escalate_to (id, full_name, username)
        `)
        .eq('is_active', true)
        .order('request_type', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get escalation rules by request type
  async getByRequestType(requestType: string) {
    try {
      const { data, error } = await supabase
        .from('escalation_rules')
        .select(`
          *,
          escalate_to_user:escalate_to (id, full_name, username)
        `)
        .eq('request_type', requestType)
        .eq('is_active', true)
        .order('approval_level', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// =============================================
// ANALYTICS & REPORTING SERVICES
// =============================================

// Dashboard Metrics Services
export const dashboardMetricsService = {
  // Get dashboard metrics
  async getMetrics(metricNames?: string[], period?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('dashboard_metrics')
        .select('*')
        .order('calculated_at', { ascending: false })

      if (metricNames && metricNames.length > 0) {
        query = query.in('metric_name', metricNames)
      }

      if (period) {
        query = query.gte('period_start', period.start)
        query = query.lte('period_end', period.end)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Calculate and store metrics
  async calculateMetrics() {
    try {
      const { data, error } = await supabase
        .rpc('calculate_dashboard_metrics')

      if (error) throw error
      return data
    } catch (error) {
      console.warn('Database not available, using demo data')
      return null
    }
  }
}

// Performance Metrics Services
export const performanceMetricsService = {
  // Get user performance metrics
  async getUserMetrics(userId: string, period?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('performance_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (period) {
        query = query.gte('period_start', period.start)
        query = query.lte('period_end', period.end)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Get all performance metrics
  async getAllMetrics(period?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('performance_metrics')
        .select(`
          *,
          user:user_id (id, full_name, username, role)
        `)
        .order('created_at', { ascending: false })

      if (period) {
        query = query.gte('period_start', period.start)
        query = query.lte('period_end', period.end)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// Compliance Report Services
export const complianceReportService = {
  // Get compliance reports
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select(`
          *,
          generated_by_user:generated_by (id, full_name, username)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Generate compliance report
  async generateReport(reportType: string, startDate: string, endDate: string, generatedBy: string) {
    try {
      const { data, error } = await supabase
        .rpc('generate_compliance_report', {
          report_type: reportType,
          start_date: startDate,
          end_date: endDate
        })

      if (error) throw error

      // Store the generated report
      const reportData = {
        report_type: reportType,
        title: `${reportType} Compliance Report`,
        data: data,
        generated_by: generatedBy,
        period_start: startDate,
        period_end: endDate
      }

      const { data: report, error: reportError } = await supabase
        .from('compliance_reports')
        .insert(reportData)
        .select()

      if (reportError) throw reportError
      return report || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// =============================================
// ROLE MANAGEMENT SERVICES
// =============================================

// Role Permission Services
export const rolePermissionService = {
  // Get role permissions
  async getRolePermissions(role: string) {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role', role)

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Check if user has permission
  async checkPermission(userId: string, tableName: string, permission: string) {
    try {
      // Get user role first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (userError) throw userError
      
      const { data, error } = await supabase
        .rpc('check_role_permission', {
          user_role_name: userData.role,
          table_name: tableName,
          permission: permission
        })

      if (error) throw error
      return data
    } catch (error) {
      console.warn('Database not available, using demo data')
      return false
    }
  }
}

// User Role History Services
export const userRoleHistoryService = {
  // Get user role history
  async getUserRoleHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_role_history')
        .select(`
          *,
          changed_by_user:changed_by (id, full_name, username)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Add role change entry
  async addRoleChange(change: any) {
    try {
      const { data, error } = await supabase
        .from('user_role_history')
        .insert(change)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// Temporary Role Assignment Services
export const temporaryRoleService = {
  // Get active temporary assignments
  async getActiveAssignments() {
    try {
      const { data, error } = await supabase
        .from('temporary_role_assignments')
        .select(`
          *,
          user:user_id (id, full_name, username),
          assigned_by_user:assigned_by (id, full_name, username)
        `)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  },

  // Create temporary assignment
  async createAssignment(assignment: any) {
    try {
      const { data, error} = await supabase
        .from('temporary_role_assignments')
        .insert(assignment)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Database not available, using demo data')
      return []
    }
  }
}

// Procurement Approval Services
export const procurementApprovalService = {
  // Create procurement request with approval workflow
  async createWithApproval(request: any, createdBy: string) {
    try {
      console.log('=== PROCUREMENT CREATE WITH APPROVAL START ===')
      console.log('Request data:', request)
      console.log('Created by:', createdBy)
      
      // Create approval request directly
      const approvalData = {
        item_name: request.item_name,
        description: request.description || '',
        quantity: request.quantity || 0,
        unit_price: request.unit_price || 0,
        supplier: request.supplier || '',
        category: request.category || 'general',
        priority: request.priority || 'medium',
        status: 'pending',
        requested_by: createdBy,
        request_reason: request.reason || 'New procurement request',
        request_type: 'purchase_request'
      }

      console.log('Creating procurement approval request with data:', approvalData)

      const { data: approvalResult, error: approvalError } = await supabase
        .from('procurement_approvals')
        .insert(approvalData)
        .select()

      if (approvalError) {
        console.error('Procurement approval creation failed:', approvalError)
        throw approvalError
      } else {
        console.log('Procurement approval request created successfully:', approvalResult[0])
      }

      console.log('=== PROCUREMENT CREATE WITH APPROVAL SUCCESS ===')
      return approvalResult
    } catch (error) {
      console.error('=== PROCUREMENT CREATE WITH APPROVAL ERROR ===')
      console.error('Error creating procurement with approval:', error)
      throw error
    }
  },

  // Get pending procurement approvals
  async getPendingApprovals() {
    try {
      const { data, error } = await supabase
        .from('procurement_approvals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching pending procurement approvals:', error)
      return []
    }
  },

  // Get all procurement approvals for a user (all statuses)
  async getByUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('procurement_approvals')
        .select('*')
        .eq('requested_by', userId)
        .order('created_at', { ascending: false})

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user procurement approvals:', error)
      return []
    }
  },

  // Get procurement requests that need Project Manager approval (manager approved, PM not approved)
  async getPendingProjectManagerApprovals() {
    try {
      const { data, error } = await supabase
        .from('procurement_approvals')
        .select('*')
        .eq('status', 'pending')
        .eq('manager_approved', true)
        .eq('project_manager_approved', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching pending project manager approvals:', error)
      return []
    }
  },

  // Get procurement requests that need Manager approval (not yet manager approved)
  async getPendingManagerApprovals() {
    try {
      const { data, error } = await supabase
        .from('procurement_approvals')
        .select('*')
        .eq('status', 'pending')
        .eq('manager_approved', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching pending manager approvals:', error)
      return []
    }
  },

  // Approve procurement request
  async approve(id: string, approvedBy: string, role: 'manager' | 'project_manager') {
    try {
      console.log(`=== PROCUREMENT APPROVAL START ===`)
      console.log(`Approval ID: ${id}, Approved By: ${approvedBy}, Role: ${role}`)
      
      // First get the approval request details
      const { data: approvalRequest, error: fetchError } = await supabase
        .from('procurement_approvals')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Update approval status (don't set status to 'approved' yet)
      const { data: approvalData, error: approvalError } = await supabase
        .from('procurement_approvals')
        .update({ 
          [`${role}_approved`]: true,
          [`${role}_approved_by`]: approvedBy,
          [`${role}_approved_at`]: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (approvalError) {
        throw approvalError
      }

      // Check if both manager and project manager have approved
      const approval = approvalData?.[0]
      if (approval?.manager_approved && approval?.project_manager_approved) {
        console.log('Both manager and project manager have approved the procurement request')
        
        // Update status to approved
        const { data: finalApproval, error: finalApprovalError } = await supabase
          .from('procurement_approvals')
          .update({ 
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()

        if (finalApprovalError) {
          console.error('Error updating final procurement approval status:', finalApprovalError)
        }

        // Create purchase request in purchase_requests table
        try {
          const purchaseRequestData = {
            request_number: `PR-${Date.now().toString().slice(-8)}`,
            title: approvalRequest.item_name,
            item_name: approvalRequest.item_name,
            description: approvalRequest.description,
            quantity: approvalRequest.quantity,
            unit_price: approvalRequest.unit_price || 0,
            total_amount: (approvalRequest.quantity || 0) * (approvalRequest.unit_price || 0),
            estimated_cost: (approvalRequest.quantity || 0) * (approvalRequest.unit_price || 0),
            supplier: approvalRequest.supplier,
            category: approvalRequest.category,
            priority: approvalRequest.priority,
            status: 'pending',
            requested_date: new Date().toISOString().split('T')[0],
            required_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
            requested_by: approvalRequest.requested_by,
            approved_by: approvedBy
          }

          console.log('Creating purchase request:', purchaseRequestData)

          const { data: purchaseRequestResult, error: purchaseRequestError } = await supabase
            .from('purchase_requests')
            .insert(purchaseRequestData)
            .select()

          if (purchaseRequestError) {
            console.error('Error creating purchase request:', purchaseRequestError)
            // Don't throw error here, approval is still successful
          } else {
            console.log('Successfully created purchase request:', purchaseRequestResult[0])
          }
        } catch (transferError) {
          console.error('Error during purchase request creation:', transferError)
          // Don't throw error here, approval is still successful
        }

        return { ...approval, fully_approved: true }
      } else if (approval?.manager_approved) {
        console.log('Manager has approved, waiting for project manager approval')
        return { ...approval, fully_approved: false, waiting_for: 'project_manager' }
      } else if (approval?.project_manager_approved) {
        console.log('Project manager has approved, waiting for manager approval')
        return { ...approval, fully_approved: false, waiting_for: 'manager' }
      }

      return { ...approval, fully_approved: false, waiting_for: 'both' }
    } catch (error) {
      console.error('Error approving procurement request:', error)
      throw error
    }
  },

  // Reject procurement request
  async reject(id: string, rejectedBy: string, role: 'manager' | 'project_manager') {
    try {
      // Update approval status to rejected
      const { data: approvalData, error: approvalError } = await supabase
        .from('procurement_approvals')
        .update({ 
          status: 'rejected',
          [`${role}_approved`]: false,
          [`${role}_approved_by`]: rejectedBy,
          [`${role}_approved_at`]: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (approvalError) throw approvalError

      return approvalData
    } catch (error) {
      console.error('Error rejecting procurement approval:', error)
      throw error
    }
  }
}


// Manager Report Services
export const managerReportService = {
  async generatePerformanceReport(managerId: string, startDate: Date, endDate: Date) {
    try {
      // Fetch approval statistics
      const { data: inventoryApprovals, error: inventoryError } = await supabase
        .from('inventory_approvals')
        .select('*')
        .eq('manager_approved_by', managerId)
        .gte('manager_approved_at', startDate.toISOString())
        .lte('manager_approved_at', endDate.toISOString())

      const { data: procurementApprovals, error: procurementError } = await supabase
        .from('procurement_approvals')
        .select('*')
        .eq('manager_approved_by', managerId)
        .gte('manager_approved_at', startDate.toISOString())
        .lte('manager_approved_at', endDate.toISOString())

      if (inventoryError) throw inventoryError
      if (procurementError) throw procurementError

      // Calculate processing times
      const inventoryProcessingTimes = inventoryApprovals?.map(approval => {
        const created = new Date(approval.created_at)
        const approved = new Date(approval.manager_approved_at)
        return approved.getTime() - created.getTime()
      }) || []

      const procurementProcessingTimes = procurementApprovals?.map(approval => {
        const created = new Date(approval.created_at)
        const approved = new Date(approval.manager_approved_at)
        return approved.getTime() - created.getTime()
      }) || []

      const avgProcessingTime = inventoryProcessingTimes.length + procurementProcessingTimes.length > 0
        ? [...inventoryProcessingTimes, ...procurementProcessingTimes].reduce((sum, time) => sum + time, 0) / 
          (inventoryProcessingTimes.length + procurementProcessingTimes.length)
        : 0

      const reportData = {
        totalApprovals: (inventoryApprovals?.length || 0) + (procurementApprovals?.length || 0),
        inventoryApprovals: inventoryApprovals?.length || 0,
        procurementApprovals: procurementApprovals?.length || 0,
        averageProcessingTime: avgProcessingTime,
        period: { start: startDate, end: endDate }
      }

      // Store in database
      const { data: report, error: reportError } = await supabase
        .from('manager_reports')
        .insert({
          report_type: 'performance',
          report_data: reportData,
          generated_by: managerId,
          report_period_start: startDate.toISOString().split('T')[0],
          report_period_end: endDate.toISOString().split('T')[0]
        })
        .select()

      if (reportError) throw reportError
      return report[0]
    } catch (error) {
      console.error('Error generating performance report:', error)
      throw error
    }
  },

  async generateDepartmentReport(managerId: string, startDate: Date, endDate: Date) {
    try {
      // Fetch team performance data
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .in('role', ['employee', 'procurement', 'project_manager'])

      if (usersError) throw usersError

      // Get request volumes by department
      const departmentStats = await Promise.all(
        users.map(async (user) => {
          const { data: requests } = await supabase
            .from('inventory_approvals')
            .select('id')
            .eq('requested_by', user.id)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())

          return {
            userId: user.id,
            userName: user.full_name,
            role: user.role,
            requestCount: requests?.length || 0
          }
        })
      )

      const reportData = {
        departmentStats,
        totalRequests: departmentStats.reduce((sum, dept) => sum + dept.requestCount, 0),
        period: { start: startDate, end: endDate }
      }

      // Store in database
      const { data: report, error: reportError } = await supabase
        .from('manager_reports')
        .insert({
          report_type: 'department',
          report_data: reportData,
          generated_by: managerId,
          report_period_start: startDate.toISOString().split('T')[0],
          report_period_end: endDate.toISOString().split('T')[0]
        })
        .select()

      if (reportError) throw reportError
      return report[0]
    } catch (error) {
      console.error('Error generating department report:', error)
      throw error
    }
  },

  async generateFinancialReport(managerId: string, startDate: Date, endDate: Date) {
    try {
      // Calculate approved spending
      const { data: approvedInventory, error: inventoryError } = await supabase
        .from('inventory_approvals')
        .select('total_value')
        .eq('manager_approved_by', managerId)
        .eq('status', 'approved')
        .gte('manager_approved_at', startDate.toISOString())
        .lte('manager_approved_at', endDate.toISOString())

      const { data: approvedProcurement, error: procurementError } = await supabase
        .from('procurement_approvals')
        .select('total_value')
        .eq('manager_approved_by', managerId)
        .eq('status', 'approved')
        .gte('manager_approved_at', startDate.toISOString())
        .lte('manager_approved_at', endDate.toISOString())

      if (inventoryError) throw inventoryError
      if (procurementError) throw procurementError

      const approvedSpending = [
        ...(approvedInventory?.map(item => item.total_value) || []),
        ...(approvedProcurement?.map(item => item.total_value) || [])
      ].reduce((sum, value) => sum + (value || 0), 0)

      // Calculate pending request values
      const { data: pendingInventory, error: pendingInventoryError } = await supabase
        .from('inventory_approvals')
        .select('total_value')
        .eq('status', 'pending')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      const { data: pendingProcurement, error: pendingProcurementError } = await supabase
        .from('procurement_approvals')
        .select('total_value')
        .eq('status', 'pending')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (pendingInventoryError) throw pendingInventoryError
      if (pendingProcurementError) throw pendingProcurementError

      const pendingValue = [
        ...(pendingInventory?.map(item => item.total_value) || []),
        ...(pendingProcurement?.map(item => item.total_value) || [])
      ].reduce((sum, value) => sum + (value || 0), 0)

      const reportData = {
        approvedSpending,
        pendingValue,
        totalValue: approvedSpending + pendingValue,
        period: { start: startDate, end: endDate }
      }

      // Store in database
      const { data: report, error: reportError } = await supabase
        .from('manager_reports')
        .insert({
          report_type: 'financial',
          report_data: reportData,
          generated_by: managerId,
          report_period_start: startDate.toISOString().split('T')[0],
          report_period_end: endDate.toISOString().split('T')[0]
        })
        .select()

      if (reportError) throw reportError
      return report[0]
    } catch (error) {
      console.error('Error generating financial report:', error)
      throw error
    }
  },

  async getReportHistory(managerId: string) {
    try {
      const { data, error } = await supabase
        .from('manager_reports')
        .select('*')
        .eq('generated_by', managerId)
        .order('generated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching report history:', error)
      throw error
    }
  }
}

// Bulk Operation Services
export const bulkOperationService = {
  async approveAllInventory(managerId: string) {
    try {
      // Get all pending inventory approvals
      const { data: pendingApprovals, error: fetchError } = await supabase
        .from('inventory_approvals')
        .select('id')
        .eq('status', 'pending')

      if (fetchError) throw fetchError

      const affectedIds = pendingApprovals?.map(approval => approval.id) || []

      // Create bulk operation record
      const { data: bulkOp, error: bulkError } = await supabase
        .from('bulk_operations')
        .insert({
          operation_type: 'bulk_approve',
          target_table: 'inventory_approvals',
          affected_ids: affectedIds,
          affected_count: affectedIds.length,
          initiated_by: managerId
        })
        .select()

      if (bulkError) throw bulkError

      // Approve each one
      let processedCount = 0
      for (const approvalId of affectedIds) {
        try {
          await inventoryService.approve(approvalId, managerId, 'manager')
          processedCount++
        } catch (error) {
          console.error(`Error approving inventory ${approvalId}:`, error)
        }
      }

      // Update bulk operation status
      await supabase
        .from('bulk_operations')
        .update({
          processed_count: processedCount,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', bulkOp[0].id)

      return { success: true, processed: processedCount, total: affectedIds.length }
    } catch (error) {
      console.error('Error in bulk inventory approval:', error)
      throw error
    }
  },

  async approveAllProcurement(managerId: string) {
    try {
      // Get all pending procurement approvals
      const { data: pendingApprovals, error: fetchError } = await supabase
        .from('procurement_approvals')
        .select('id')
        .eq('status', 'pending')

      if (fetchError) throw fetchError

      const affectedIds = pendingApprovals?.map(approval => approval.id) || []

      // Create bulk operation record
      const { data: bulkOp, error: bulkError } = await supabase
        .from('bulk_operations')
        .insert({
          operation_type: 'bulk_approve',
          target_table: 'procurement_approvals',
          affected_ids: affectedIds,
          affected_count: affectedIds.length,
          initiated_by: managerId
        })
        .select()

      if (bulkError) throw bulkError

      // Approve each one
      let processedCount = 0
      for (const approvalId of affectedIds) {
        try {
          await procurementApprovalService.approve(approvalId, managerId, 'manager')
          processedCount++
        } catch (error) {
          console.error(`Error approving procurement ${approvalId}:`, error)
        }
      }

      // Update bulk operation status
      await supabase
        .from('bulk_operations')
        .update({
          processed_count: processedCount,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', bulkOp[0].id)

      return { success: true, processed: processedCount, total: affectedIds.length }
    } catch (error) {
      console.error('Error in bulk procurement approval:', error)
      throw error
    }
  },

  async approveAllRequests(managerId: string) {
    try {
      const [inventoryResult, procurementResult] = await Promise.all([
        this.approveAllInventory(managerId),
        this.approveAllProcurement(managerId)
      ])

      return {
        success: true,
        inventory: inventoryResult,
        procurement: procurementResult,
        total: inventoryResult.processed + procurementResult.processed
      }
    } catch (error) {
      console.error('Error in bulk approve all:', error)
      throw error
    }
  },

  async rejectAllRequests(managerId: string, reason: string) {
    try {
      // Get all pending requests
      const [inventoryPending, procurementPending] = await Promise.all([
        supabase.from('inventory_approvals').select('id').eq('status', 'pending'),
        supabase.from('procurement_approvals').select('id').eq('status', 'pending')
      ])

      if (inventoryPending.error) throw inventoryPending.error
      if (procurementPending.error) throw procurementPending.error

      const inventoryIds = inventoryPending.data?.map(item => item.id) || []
      const procurementIds = procurementPending.data?.map(item => item.id) || []

      // Reject all inventory requests
      for (const id of inventoryIds) {
        await inventoryService.reject(id, managerId, 'manager')
      }

      // Reject all procurement requests
      for (const id of procurementIds) {
        await procurementApprovalService.reject(id, managerId, 'manager')
      }

      return {
        success: true,
        inventoryRejected: inventoryIds.length,
        procurementRejected: procurementIds.length,
        total: inventoryIds.length + procurementIds.length
      }
    } catch (error) {
      console.error('Error in bulk reject all:', error)
      throw error
    }
  },

  async getBulkOperationStatus(operationId: string) {
    try {
      const { data, error } = await supabase
        .from('bulk_operations')
        .select('*')
        .eq('id', operationId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching bulk operation status:', error)
      throw error
    }
  }
}

// Export Services
export const exportService = {
  async exportToCSV(dataType: string, data: any, userId: string) {
    try {
      let csvContent = ''
      
      if (dataType === 'manager_data') {
        // Convert manager data to CSV
        const headers = ['Type', 'Item Name', 'Quantity', 'Value', 'Status', 'Created At']
        csvContent = headers.join(',') + '\n'
        
        // Add inventory approvals
        if (data.inventoryApprovals && Array.isArray(data.inventoryApprovals)) {
          data.inventoryApprovals.forEach((item: any) => {
            csvContent += `Inventory,${item.item_name || 'N/A'},${item.quantity || 0},${item.total_value || 0},${item.status || 'N/A'},${item.created_at || 'N/A'}\n`
          })
        }
        
        // Add procurement approvals
        if (data.procurementApprovals && Array.isArray(data.procurementApprovals)) {
          data.procurementApprovals.forEach((item: any) => {
            csvContent += `Procurement,${item.item_name || 'N/A'},${item.quantity || 0},${item.total_value || 0},${item.status || 'N/A'},${item.created_at || 'N/A'}\n`
          })
        }
        
        // If no data, add a message
        if (!data.inventoryApprovals?.length && !data.procurementApprovals?.length) {
          csvContent += 'No data available\n'
        }
      }

      // Log export (with error handling)
      try {
        await supabase
          .from('export_logs')
          .insert({
            export_type: 'csv',
            data_type: dataType,
            file_name: `export_${Date.now()}.csv`,
            exported_by: userId,
            record_count: csvContent.split('\n').length - 1,
            file_size: csvContent.length
          })
      } catch (logError) {
        console.warn('Failed to log export:', logError)
        // Continue with export even if logging fails
      }

      return new Blob([csvContent], { type: 'text/csv' })
    } catch (error) {
      console.error('Error exporting to CSV:', error)
      throw error
    }
  },

  async exportToExcel(dataType: string, data: any, userId: string) {
    try {
      // This would require the xlsx library
      // For now, return a simple text representation
      const excelContent = JSON.stringify(data, null, 2)
      
      // Log export
      await supabase
        .from('export_logs')
        .insert({
          export_type: 'excel',
          data_type: dataType,
          file_name: `export_${Date.now()}.xlsx`,
          exported_by: userId,
          record_count: Object.keys(data).length,
          file_size: excelContent.length
        })

      return new Blob([excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      throw error
    }
  },

  async exportToPDF(data: any, userId: string) {
    try {
      // Create a formatted text report that can be opened as PDF
      let reportContent = `MANAGER DASHBOARD REPORT\n`
      reportContent += `Generated: ${new Date().toLocaleString()}\n`
      reportContent += `Exported by: ${data.exportedBy || 'Manager'}\n`
      reportContent += `\n========================================\n\n`
      
      // Summary section
      const totalInventory = data.inventoryApprovals?.length || 0
      const totalProcurement = data.procurementApprovals?.length || 0
      const total = totalInventory + totalProcurement
      
      reportContent += `SUMMARY\n`
      reportContent += `-------\n`
      reportContent += `Total Inventory Approvals: ${totalInventory}\n`
      reportContent += `Total Procurement Approvals: ${totalProcurement}\n`
      reportContent += `Total Approvals: ${total}\n\n`
      
      // Inventory Approvals section
      if (data.inventoryApprovals && data.inventoryApprovals.length > 0) {
        reportContent += `INVENTORY APPROVAL REQUESTS\n`
        reportContent += `===========================\n`
        data.inventoryApprovals.forEach((item: any, index: number) => {
          reportContent += `${index + 1}. ${item.item_name || 'N/A'}\n`
          reportContent += `   Quantity: ${item.quantity || 0}\n`
          reportContent += `   Unit Price: $${item.unit_price || 0}\n`
          reportContent += `   Total Value: $${item.total_value || 0}\n`
          reportContent += `   Status: ${item.status || 'N/A'}\n`
          reportContent += `   Created: ${item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}\n`
          if (item.manager_approved) {
            reportContent += `   Manager Approved: Yes\n`
          }
          if (item.project_manager_approved) {
            reportContent += `   Project Manager Approved: Yes\n`
          }
          reportContent += `\n`
        })
      }
      
      // Procurement Approvals section
      if (data.procurementApprovals && data.procurementApprovals.length > 0) {
        reportContent += `PROCUREMENT APPROVAL REQUESTS\n`
        reportContent += `============================\n`
        data.procurementApprovals.forEach((item: any, index: number) => {
          reportContent += `${index + 1}. ${item.item_name || 'N/A'}\n`
          reportContent += `   Quantity: ${item.quantity || 0}\n`
          reportContent += `   Unit Price: $${item.unit_price || 0}\n`
          reportContent += `   Total Value: $${item.total_value || 0}\n`
          reportContent += `   Status: ${item.status || 'N/A'}\n`
          reportContent += `   Created: ${item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}\n`
          if (item.manager_approved) {
            reportContent += `   Manager Approved: Yes\n`
          }
          if (item.project_manager_approved) {
            reportContent += `   Project Manager Approved: Yes\n`
          }
          reportContent += `\n`
        })
      }
      
      // Footer
      reportContent += `\n========================================\n`
      reportContent += `End of Report\n`
      reportContent += `Generated by Manager Dashboard System\n`
      
      // Log export (with error handling)
      try {
        await supabase
          .from('export_logs')
          .insert({
            export_type: 'pdf',
            data_type: 'manager_dashboard',
            file_name: `report_${Date.now()}.pdf`,
            exported_by: userId,
            record_count: total,
            file_size: reportContent.length
          })
      } catch (logError) {
        console.warn('Failed to log export:', logError)
        // Continue with export even if logging fails
      }

      // Return as text file that can be opened and printed as PDF
      return new Blob([reportContent], { type: 'text/plain' })
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      throw error
    }
  }
}

// Project Manager Report Services
export const projectManagerReportService = {
  async generateProjectSummary(projectManagerId: string, startDate: Date, endDate: Date) {
    try {
      // Fetch all projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (projectsError) throw projectsError

      // Calculate project statistics
      const totalProjects = projects?.length || 0
      const activeProjects = projects?.filter(p => p.status === 'active').length || 0
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0
      const totalBudget = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0
      const avgProgress = projects?.length > 0 
        ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length 
        : 0

      const reportData = {
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget,
        averageProgress: avgProgress,
        projects: projects || [],
        period: { start: startDate, end: endDate }
      }

      // Store in database
      const { data: report, error: reportError } = await supabase
        .from('project_manager_reports')
        .insert({
          report_type: 'project_summary',
          report_data: reportData,
          generated_by: projectManagerId,
          report_period_start: startDate.toISOString().split('T')[0],
          report_period_end: endDate.toISOString().split('T')[0]
        })
        .select()

      if (reportError) throw reportError
      return report[0]
    } catch (error) {
      console.error('Error generating project summary:', error)
      throw error
    }
  },

  async generateDeliverySummary(projectManagerId: string, startDate: Date, endDate: Date) {
    try {
      // Fetch all deliveries
      const { data: deliveries, error: deliveriesError } = await supabase
        .from('delivery_receipts')
        .select('*')
        .gte('delivery_date', startDate.toISOString())
        .lte('delivery_date', endDate.toISOString())

      if (deliveriesError) throw deliveriesError

      // Calculate delivery statistics
      const totalDeliveries = deliveries?.length || 0
      const pendingDeliveries = deliveries?.filter(d => d.status === 'pending').length || 0
      const deliveredCount = deliveries?.filter(d => d.status === 'delivered').length || 0
      const verifiedCount = deliveries?.filter(d => d.status === 'verified').length || 0

      const reportData = {
        totalDeliveries,
        pendingDeliveries,
        deliveredCount,
        verifiedCount,
        deliveries: deliveries || [],
        period: { start: startDate, end: endDate }
      }

      // Store in database
      const { data: report, error: reportError } = await supabase
        .from('project_manager_reports')
        .insert({
          report_type: 'delivery_summary',
          report_data: reportData,
          generated_by: projectManagerId,
          report_period_start: startDate.toISOString().split('T')[0],
          report_period_end: endDate.toISOString().split('T')[0]
        })
        .select()

      if (reportError) throw reportError
      return report[0]
    } catch (error) {
      console.error('Error generating delivery summary:', error)
      throw error
    }
  },

  async generateStaffUtilization(projectManagerId: string) {
    try {
      // Fetch staff assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('staff_assignments')
        .select(`
          *,
          users:user_id(full_name, role),
          projects:project_id(project_name, status)
        `)

      if (assignmentsError) throw assignmentsError

      // Calculate utilization statistics
      const totalAssignments = assignments?.length || 0
      const uniqueStaff = new Set(assignments?.map(a => a.user_id)).size
      const uniqueProjects = new Set(assignments?.map(a => a.project_id)).size

      // Staff utilization by role
      const roleUtilization = assignments?.reduce((acc, assignment) => {
        const role = assignment.role || 'team_member'
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const reportData = {
        totalAssignments,
        uniqueStaff,
        uniqueProjects,
        roleUtilization,
        assignments: assignments || []
      }

      // Store in database
      const { data: report, error: reportError } = await supabase
        .from('project_manager_reports')
        .insert({
          report_type: 'staff_utilization',
          report_data: reportData,
          generated_by: projectManagerId
        })
        .select()

      if (reportError) throw reportError
      return report[0]
    } catch (error) {
      console.error('Error generating staff utilization:', error)
      throw error
    }
  }
}

// Staff Analytics Services
export const staffAnalyticsService = {
  async getStaffUtilization() {
    try {
      const { data: assignments, error } = await supabase
        .from('staff_assignments')
        .select(`
          *,
          users:user_id(full_name, role),
          projects:project_id(project_name, status)
        `)

      if (error) throw error

      // Calculate utilization metrics
      const totalStaff = new Set(assignments?.map(a => a.user_id)).size
      const totalProjects = new Set(assignments?.map(a => a.project_id)).size
      const utilizationRate = totalStaff > 0 ? (assignments?.length || 0) / totalStaff : 0

      return {
        totalStaff,
        totalProjects,
        totalAssignments: assignments?.length || 0,
        utilizationRate,
        assignments: assignments || []
      }
    } catch (error) {
      console.error('Error getting staff utilization:', error)
      return { totalStaff: 0, totalProjects: 0, totalAssignments: 0, utilizationRate: 0, assignments: [] }
    }
  },

  async getProjectsPerStaff() {
    try {
      const { data: assignments, error } = await supabase
        .from('staff_assignments')
        .select(`
          user_id,
          users:user_id(full_name, role),
          projects:project_id(project_name, status)
        `)

      if (error) throw error

      // Group by staff member
      const staffProjects = assignments?.reduce((acc, assignment) => {
        const userId = assignment.user_id
        if (!acc[userId]) {
          acc[userId] = {
            user: assignment.users,
            projects: []
          }
        }
        acc[userId].projects.push(assignment.projects)
        return acc
      }, {} as Record<string, any>) || {}

      return Object.values(staffProjects)
    } catch (error) {
      console.error('Error getting projects per staff:', error)
      return []
    }
  },

  async getStaffPerformance() {
    try {
      // Get staff assignments with delivery data
      const { data: assignments, error } = await supabase
        .from('staff_assignments')
        .select(`
          *,
          users:user_id(full_name, role),
          projects:project_id(project_name, status)
        `)

      if (error) throw error

      // Calculate performance metrics
      const performance = assignments?.map(assignment => ({
        ...assignment,
        projectsCount: 1, // Each assignment represents one project
        role: assignment.role || 'team_member'
      })) || []

      return performance
    } catch (error) {
      console.error('Error getting staff performance:', error)
      return []
    }
  }
}

// Project Deliveries Service
export const projectDeliveryService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('project_deliveries')
        .select(`
          *,
          projects:project_id(name, status),
          created_by_user:created_by(full_name, email),
          received_by_user:received_by(full_name, email)
        `)
        .order('delivery_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching project deliveries:', error)
      return []
    }
  },

  async getByProject(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('project_deliveries')
        .select(`
          *,
          created_by_user:created_by(full_name, email),
          received_by_user:received_by(full_name, email)
        `)
        .eq('project_id', projectId)
        .order('delivery_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching project deliveries:', error)
      return []
    }
  },

  async create(delivery: any) {
    try {
      const { data, error } = await supabase
        .from('project_deliveries')
        .insert(delivery)
        .select(`
          *,
          projects:project_id(name, status),
          created_by_user:created_by(full_name, email)
        `)

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error creating project delivery:', error)
      throw error
    }
  },

  async update(id: string, data: any) {
    try {
      const { data: result, error } = await supabase
        .from('project_deliveries')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          projects:project_id(name, status),
          created_by_user:created_by(full_name, email),
          received_by_user:received_by(full_name, email)
        `)

      if (error) throw error
      return result[0]
    } catch (error) {
      console.error('Error updating project delivery:', error)
      throw error
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('project_deliveries')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting project delivery:', error)
      throw error
    }
  },

  async updateStatus(id: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('project_deliveries')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating delivery status:', error)
      throw error
    }
  },

  async getByStatus(status: string) {
    try {
      const { data, error } = await supabase
        .from('project_deliveries')
        .select(`
          *,
          projects:project_id(name, status),
          created_by_user:created_by(full_name, email)
        `)
        .eq('status', status)
        .order('delivery_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching deliveries by status:', error)
      return []
    }
  }
}

// Enhanced Staff Performance Service
export const staffPerformanceService = {
  async getByProject(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('staff_performance')
        .select(`
          *,
          users:user_id(full_name, email, role),
          projects:project_id(name, status)
        `)
        .eq('project_id', projectId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching staff performance:', error)
      return []
    }
  },

  async getByUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('staff_performance')
        .select(`
          *,
          projects:project_id(name, status, progress)
        `)
        .eq('user_id', userId)
        .order('last_activity_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user performance:', error)
      return []
    }
  },

  async updatePerformance(data: any) {
    try {
      const { data: result, error } = await supabase
        .from('staff_performance')
        .upsert({
          ...data,
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          users:user_id(full_name, email, role),
          projects:project_id(name, status)
        `)

      if (error) throw error
      return result[0]
    } catch (error) {
      console.error('Error updating staff performance:', error)
      throw error
    }
  },

  async getCompletionRates() {
    try {
      const { data, error } = await supabase
        .from('staff_performance')
        .select(`
          *,
          users:user_id(full_name, email, role),
          projects:project_id(name, status)
        `)

      if (error) throw error

      // Calculate completion rates
      const completionRates = data?.reduce((acc, performance) => {
        const userId = performance.user_id
        if (!acc[userId]) {
          acc[userId] = {
            user: performance.users,
            totalTasks: 0,
            completedTasks: 0,
            efficiencyScore: 0,
            projects: []
          }
        }
        
        acc[userId].totalTasks += (performance.tasks_completed + performance.tasks_pending)
        acc[userId].completedTasks += performance.tasks_completed
        acc[userId].efficiencyScore = performance.efficiency_score || 0
        acc[userId].projects.push(performance.projects)
        
        return acc
      }, {} as Record<string, any>) || {}

      return Object.values(completionRates).map((user: any) => ({
        ...user,
        completionRate: user.totalTasks > 0 ? (user.completedTasks / user.totalTasks) * 100 : 0
      }))
    } catch (error) {
      console.error('Error calculating completion rates:', error)
      return []
    }
  },

  async getEfficiencyMetrics() {
    try {
      const { data, error } = await supabase
        .from('staff_performance')
        .select(`
          *,
          users:user_id(full_name, email, role)
        `)

      if (error) throw error

      const metrics = {
        totalStaff: new Set(data?.map(p => p.user_id)).size,
        averageEfficiency: data?.length > 0 
          ? data.reduce((sum, p) => sum + (p.efficiency_score || 0), 0) / data.length 
          : 0,
        topPerformers: data?.filter(p => (p.efficiency_score || 0) >= 80).length || 0,
        needsImprovement: data?.filter(p => (p.efficiency_score || 0) < 60).length || 0
      }

      return metrics
    } catch (error) {
      console.error('Error getting efficiency metrics:', error)
      return {
        totalStaff: 0,
        averageEfficiency: 0,
        topPerformers: 0,
        needsImprovement: 0
      }
    }
  }
}

// PDF Report Generation Service
export const pdfReportService = {
  async generateProjectReport(projectId: string, reportData: any) {
    try {
      // This would integrate with jsPDF library
      // For now, return structured data for PDF generation
      const report = {
        type: 'project_report',
        projectId,
        generatedAt: new Date().toISOString(),
        data: reportData,
        sections: [
          'Project Overview',
          'Delivery Status',
          'Staff Performance',
          'Budget Analysis',
          'Timeline Progress'
        ]
      }

      return report
    } catch (error) {
      console.error('Error generating project report:', error)
      throw error
    }
  },

  async generateStaffPerformanceReport(staffData: any) {
    try {
      const report = {
        type: 'staff_performance_report',
        generatedAt: new Date().toISOString(),
        data: staffData,
        sections: [
          'Staff Overview',
          'Performance Metrics',
          'Efficiency Scores',
          'Project Assignments',
          'Completion Rates'
        ]
      }

      return report
    } catch (error) {
      console.error('Error generating staff performance report:', error)
      throw error
    }
  },

  async generateDeliveryReport(deliveryData: any) {
    try {
      const report = {
        type: 'delivery_report',
        generatedAt: new Date().toISOString(),
        data: deliveryData,
        sections: [
          'Delivery Overview',
          'Status Summary',
          'Supplier Analysis',
          'Timeline Tracking',
          'Performance Metrics'
        ]
      }

      return report
    } catch (error) {
      console.error('Error generating delivery report:', error)
      throw error
    }
  },

  async downloadReport(reportData: any, filename: string) {
    try {
      // Enhanced PDF download with proper formatting
      const formattedData = {
        ...reportData,
        generatedAt: new Date().toLocaleString(),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(formattedData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      
      return {
        url,
        filename: `${filename}_${new Date().toISOString().split('T')[0]}.json`,
        type: 'application/json',
        size: blob.size
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      throw error
    }
  },

  async generatePDF(reportData: any, filename: string) {
    try {
      // Placeholder for actual jsPDF integration
      // This would use jsPDF library to create actual PDF files
      console.log('PDF generation would happen here with jsPDF library')
      
      // For now, return structured data that could be used with jsPDF
      return {
        success: true,
        message: 'PDF generation ready (jsPDF integration needed)',
        data: reportData,
        filename: `${filename}.pdf`
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }
}

// Work Orders Service
export const workOrderService = {
  async getAll() {
    try {
      console.log('🔄 Fetching work orders...')
      
      let databaseOrders = []
      let localOrders = []
      
      // Try to fetch from database
      try {
        const { data, error } = await supabase
          .from('maintenance_work_orders')
          .select('*, assets(id, name, rfid_code, asset_type)')
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('❌ Database fetch failed:', error.message)
        } else {
          databaseOrders = data || []
          console.log('✅ Work orders fetched from database:', databaseOrders.length)
        }
      } catch (dbError) {
        console.warn('❌ Database unavailable:', dbError.message)
      }
      
      // Always check localStorage as well
      try {
        const localData = JSON.parse(localStorage.getItem('maintenance_work_orders') || '[]')
        localOrders = localData || []
        console.log('✅ Work orders fetched from localStorage:', localOrders.length)
      } catch (localError) {
        console.warn('❌ localStorage unavailable:', localError.message)
      }
      
      // Merge and deduplicate results
      const allOrders = [...databaseOrders, ...localOrders]
      const uniqueOrders = allOrders.filter((order, index, self) => 
        index === self.findIndex(o => o.id === order.id)
      )
      
      console.log('✅ Total unique work orders:', uniqueOrders.length)
      return uniqueOrders
    } catch (error) {
      console.error('💥 Work orders fetch failed:', error)
      return []
    }
  },
  
  async create(workOrder: any) {
    try {
      console.log('🔄 Creating work order:', workOrder)
      
      // Validate required fields
      if (!workOrder.title || !workOrder.asset_id) {
        throw new Error('Missing required fields: title and asset_id are required')
      }
      
      try {
        const workOrderData = {
          work_order_number: workOrder.work_order_number || `WO-${Date.now()}`,
          asset_id: workOrder.asset_id,
          title: workOrder.title,
          description: workOrder.description || '',
          status: workOrder.status || 'open',
          priority: workOrder.priority || 'medium',
          assigned_to: workOrder.assigned_to || null,
          estimated_hours: workOrder.estimated_hours || null,
          actual_hours: workOrder.actual_hours || null,
          scheduled_date: workOrder.scheduled_date || null,
          completed_date: workOrder.completed_date || null,
          created_by: workOrder.created_by || null,
          updated_by: workOrder.updated_by || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('maintenance_work_orders')
          .insert(workOrderData)
          .select()

        if (error) {
          console.warn('❌ Database creation failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Work order created in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, creating work order in localStorage...')
        
        // Create a mock work order with generated ID
        const mockWorkOrder = {
          id: 'wo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          work_order_number: workOrder.work_order_number || `WO-${Date.now()}`,
          asset_id: workOrder.asset_id,
          title: workOrder.title,
          description: workOrder.description || '',
          status: workOrder.status || 'open',
          priority: workOrder.priority || 'medium',
          assigned_to: workOrder.assigned_to || null,
          estimated_hours: workOrder.estimated_hours || null,
          actual_hours: workOrder.actual_hours || null,
          scheduled_date: workOrder.scheduled_date || null,
          completed_date: workOrder.completed_date || null,
          created_by: workOrder.created_by || null,
          updated_by: workOrder.updated_by || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('📝 Created mock work order:', mockWorkOrder)
        
        // Store in localStorage
        try {
          const existingWorkOrders = JSON.parse(localStorage.getItem('maintenance_work_orders') || '[]')
          existingWorkOrders.push(mockWorkOrder)
          localStorage.setItem('maintenance_work_orders', JSON.stringify(existingWorkOrders))
          console.log('✅ Work order stored in localStorage')
        } catch (storageError) {
          console.warn('Failed to store in localStorage:', storageError)
        }
        
        console.log('✅ Work order created successfully:', mockWorkOrder)
        return [mockWorkOrder]
      }
    } catch (error) {
      console.error('💥 Work order creation failed:', error)
      throw error
    }
  },
  
  async update(id: string, updates: any) {
    try {
      console.log('🔄 Updating work order:', id, updates)
      
      try {
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('maintenance_work_orders')
          .update(updateData)
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        // Check if any rows were updated
        if (!data || data.length === 0) {
          console.log('📝 Work order not found in database, checking localStorage...')
          // Work order not in database, try localStorage
          const localWorkOrders = JSON.parse(localStorage.getItem('maintenance_work_orders') || '[]')
          const workOrderIndex = localWorkOrders.findIndex(wo => wo.id === id)
          
          if (workOrderIndex !== -1) {
            localWorkOrders[workOrderIndex] = {
              ...localWorkOrders[workOrderIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('maintenance_work_orders', JSON.stringify(localWorkOrders))
            console.log('✅ Work order updated in localStorage:', localWorkOrders[workOrderIndex])
            return [localWorkOrders[workOrderIndex]]
          } else {
            throw new Error('Work order not found in database or localStorage')
          }
        }
        
        console.log('✅ Work order updated in database:', data)
        return data || []
      } catch (dbError) {
        // Only fall back to localStorage if it's a database connection error
        if (dbError.message === 'DATABASE_ERROR') {
          console.log('🔄 Database unavailable, updating work order in localStorage...')
          const localWorkOrders = JSON.parse(localStorage.getItem('maintenance_work_orders') || '[]')
          const workOrderIndex = localWorkOrders.findIndex(wo => wo.id === id)
          
          if (workOrderIndex !== -1) {
            localWorkOrders[workOrderIndex] = {
              ...localWorkOrders[workOrderIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('maintenance_work_orders', JSON.stringify(localWorkOrders))
            console.log('✅ Work order updated in localStorage:', localWorkOrders[workOrderIndex])
            return [localWorkOrders[workOrderIndex]]
          } else {
            throw new Error('Work order not found in localStorage')
          }
        } else {
          // Re-throw other errors (like "Work order not found")
          throw dbError
        }
      }
    } catch (error) {
      console.error('💥 Work order update failed:', error)
      throw error
    }
  },
  
  async updateStatus(id: string, status: string) {
    return this.update(id, { status, updated_at: new Date().toISOString() })
  }
}

// Spare Parts Service
export const sparePartsService = {
  async getAll() {
    try {
      console.log('🔄 Fetching spare parts...')
      
      let databaseParts = []
      let localParts = []
      
      // Try to fetch from database
      try {
        const { data, error } = await supabase
          .from('spare_parts')
          .select('*')
          .eq('is_active', true)
          .order('part_name')

        if (error) {
          console.warn('❌ Database fetch failed:', error.message)
        } else {
          databaseParts = data || []
          console.log('✅ Spare parts fetched from database:', databaseParts.length)
        }
      } catch (dbError) {
        console.warn('❌ Database unavailable:', dbError.message)
      }
      
      // Always check localStorage as well
      try {
        const localData = JSON.parse(localStorage.getItem('spare_parts') || '[]')
        localParts = localData || []
        console.log('✅ Spare parts fetched from localStorage:', localParts.length)
      } catch (localError) {
        console.warn('❌ localStorage unavailable:', localError.message)
      }
      
      // Merge and deduplicate results
      const allParts = [...databaseParts, ...localParts]
      const uniqueParts = allParts.filter((part, index, self) => 
        index === self.findIndex(p => p.id === part.id)
      )
      
      console.log('✅ Total unique spare parts:', uniqueParts.length)
      return uniqueParts
    } catch (error) {
      console.error('💥 Spare parts fetch failed:', error)
      return []
    }
  },
  
  async create(part: any) {
    try {
      console.log('🔄 Creating spare part:', part)
      
      // Validate required fields
      if (!part.part_name) {
        throw new Error('Missing required fields: part_name is required')
      }
      
      try {
        const partData = {
          part_name: part.part_name,
          part_number: part.part_number || null,
          description: part.description || '',
          category: part.category || null,
          manufacturer: part.manufacturer || null,
          supplier_id: part.supplier_id || null,
          unit_price: part.unit_price || 0,
          stock_quantity: part.stock_quantity || 0,
          min_stock_level: part.min_stock_level || 0,
          location: part.location || null,
          is_active: part.is_active !== undefined ? part.is_active : true,
          created_by: part.created_by || null,
          updated_by: part.updated_by || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('spare_parts')
          .insert(partData)
          .select()

        if (error) {
          console.warn('❌ Database creation failed, using localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        console.log('✅ Spare part created in database:', data)
        return data || []
      } catch (dbError) {
        // Fallback to localStorage
        console.log('🔄 Database unavailable, creating spare part in localStorage...')
        
        // Create a mock spare part with generated ID
        const mockPart = {
          id: 'sp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          part_name: part.part_name,
          part_number: part.part_number || null,
          description: part.description || '',
          category: part.category || null,
          manufacturer: part.manufacturer || null,
          supplier_id: part.supplier_id || null,
          unit_price: part.unit_price || 0,
          stock_quantity: part.stock_quantity || 0,
          min_stock_level: part.min_stock_level || 0,
          location: part.location || null,
          is_active: part.is_active !== undefined ? part.is_active : true,
          created_by: part.created_by || null,
          updated_by: part.updated_by || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('📝 Created mock spare part:', mockPart)
        
        // Store in localStorage
        try {
          const existingParts = JSON.parse(localStorage.getItem('spare_parts') || '[]')
          existingParts.push(mockPart)
          localStorage.setItem('spare_parts', JSON.stringify(existingParts))
          console.log('✅ Spare part stored in localStorage')
        } catch (storageError) {
          console.warn('Failed to store in localStorage:', storageError)
        }
        
        console.log('✅ Spare part created successfully:', mockPart)
        return [mockPart]
      }
    } catch (error) {
      console.error('💥 Spare part creation failed:', error)
      throw error
    }
  },
  
  async update(id: string, updates: any) {
    try {
      console.log('🔄 Updating spare part:', id, updates)
      
      try {
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('spare_parts')
          .update(updateData)
          .eq('id', id)
          .select()

        if (error) {
          console.warn('❌ Database error, trying localStorage:', error.message)
          throw new Error('DATABASE_ERROR')
        }
        
        // Check if any rows were updated
        if (!data || data.length === 0) {
          console.log('📝 Spare part not found in database, checking localStorage...')
          // Spare part not in database, try localStorage
          const localParts = JSON.parse(localStorage.getItem('spare_parts') || '[]')
          const partIndex = localParts.findIndex(p => p.id === id)
          
          if (partIndex !== -1) {
            localParts[partIndex] = {
              ...localParts[partIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('spare_parts', JSON.stringify(localParts))
            console.log('✅ Spare part updated in localStorage:', localParts[partIndex])
            return [localParts[partIndex]]
          } else {
            throw new Error('Spare part not found in database or localStorage')
          }
        }
        
        console.log('✅ Spare part updated in database:', data)
        return data || []
      } catch (dbError) {
        // Only fall back to localStorage if it's a database connection error
        if (dbError.message === 'DATABASE_ERROR') {
          console.log('🔄 Database unavailable, updating spare part in localStorage...')
          const localParts = JSON.parse(localStorage.getItem('spare_parts') || '[]')
          const partIndex = localParts.findIndex(p => p.id === id)
          
          if (partIndex !== -1) {
            localParts[partIndex] = {
              ...localParts[partIndex],
              ...updates,
              updated_at: new Date().toISOString()
            }
            localStorage.setItem('spare_parts', JSON.stringify(localParts))
            console.log('✅ Spare part updated in localStorage:', localParts[partIndex])
            return [localParts[partIndex]]
          } else {
            throw new Error('Spare part not found in localStorage')
          }
        } else {
          // Re-throw other errors (like "Spare part not found")
          throw dbError
        }
      }
    } catch (error) {
      console.error('💥 Spare part update failed:', error)
      throw error
    }
  }
}

// Real-time Subscription Service
export const realtimeService = {
  subscribeToAssets(callback: (payload: any) => void) {
    return supabase
      .channel('assets-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assets' },
        callback
      )
      .subscribe()
  },
  
  subscribeToMaintenanceLogs(callback: (payload: any) => void) {
    return supabase
      .channel('maintenance-logs-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_logs' },
        callback
      )
      .subscribe()
  },
  
  subscribeToMaintenanceSchedule(callback: (payload: any) => void) {
    return supabase
      .channel('maintenance-schedule-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_schedule' },
        callback
      )
      .subscribe()
  },
  
  subscribeToWorkOrders(callback: (payload: any) => void) {
    return supabase
      .channel('work-orders-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_work_orders' },
        callback
      )
      .subscribe()
  },
  
  subscribeToPurchaseOrders(callback: (payload: any) => void) {
    return supabase
      .channel('purchase-orders-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'purchase_orders' },
        callback
      )
      .subscribe()
  },
  
  subscribeToInventory(callback: (payload: any) => void) {
    return supabase
      .channel('inventory-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        callback
      )
      .subscribe()
  },
  
  subscribeToProjects(callback: (payload: any) => void) {
    return supabase
      .channel('projects-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        callback
      )
      .subscribe()
  },
  
  subscribeToDocuments(callback: (payload: any) => void) {
    return supabase
      .channel('documents-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        callback
      )
      .subscribe()
  },
  
  unsubscribe(channel: any) {
    return supabase.removeChannel(channel)
  }
}