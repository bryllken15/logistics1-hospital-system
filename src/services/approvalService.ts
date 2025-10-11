import { supabase } from '../lib/supabase'

export interface PurchaseRequest {
  id: string
  request_number: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  total_amount: number
  requested_by: string
  required_date: string
  created_at: string
  approvals?: Approval[]
}

export interface Approval {
  id: string
  request_id: string
  approver_id: string
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
  approved_at?: string
  approver?: {
    full_name: string
    email: string
  }
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  is_read: boolean
  created_at: string
}

export const approvalService = {
  // Submit a new purchase request
  async submitPurchaseRequest(requestData: {
    title: string
    description: string
    total_amount: number
    priority: 'low' | 'medium' | 'high' | 'urgent'
    required_date: string
    requested_by: string
  }) {
    try {
      // Insert into purchase_requests table
      const requestDataToInsert = {
        request_number: `REQ-${Date.now()}`, // Generate unique request number
        title: requestData.title,
        description: requestData.description,
        total_amount: requestData.total_amount,
        priority: requestData.priority,
        required_date: requestData.required_date,
        requested_date: new Date().toISOString().split('T')[0], // Today's date
        requested_by: requestData.requested_by,
        status: 'pending'
      }

      const { data, error } = await supabase
        .from('purchase_requests')
        .insert(requestDataToInsert)
        .select()
        .single()

      if (error) throw error
      return { success: true, request_id: data.id }
    } catch (error) {
      console.error('Error submitting purchase request:', error)
      throw error
    }
  },

  // Approve a purchase request
  async approvePurchaseRequest(requestId: string, approverId: string, comments?: string) {
    try {
      // Update purchase_requests table
      const { data, error } = await supabase
        .from('purchase_requests')
        .update({ 
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
          approval_notes: comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error approving purchase request:', error)
      throw error
    }
  },

  // Reject a purchase request
  async rejectPurchaseRequest(requestId: string, approverId: string, reason: string) {
    try {
      // Update purchase_requests table
      const { data, error } = await supabase
        .from('purchase_requests')
        .update({ 
          status: 'rejected',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
          approval_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error rejecting purchase request:', error)
      throw error
    }
  },

  // Get pending approvals for a user (from purchase_requests table)
  async getPendingApprovals(userId: string, userRole: string) {
    try {
      console.log('🔍 APPROVAL SERVICE: getPendingApprovals called')
      console.log('   User ID:', userId)
      console.log('   User Role:', userRole)
      
      // Use purchase_requests table for purchase request approvals
      // Simplified query without foreign key relationship to avoid connectivity issues
      const { data, error } = await supabase
        .from('purchase_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ APPROVAL SERVICE: Error fetching pending approvals:', error)
        throw error
      }
      
      console.log('✅ APPROVAL SERVICE: Pending approvals fetched:', data?.length || 0)
      console.log('   Sample data:', data?.[0])
      
      // Map to expected format
      const mappedData = (data || []).map(req => ({
        approval_id: req.id,
        request_id: req.id,
        request_title: req.title,
        request_description: req.description,
        total_amount: req.total_amount,
        requested_by_name: 'Employee', // Simplified since we can't join with users table
        requested_date: req.requested_date,
        required_date: req.required_date,
        priority: req.priority,
        approval_status: req.status,
        created_at: req.created_at
      }))
      
      console.log('✅ APPROVAL SERVICE: Mapped data:', mappedData.length)
      console.log('   Sample mapped data:', mappedData[0])
      
      return mappedData
    } catch (error) {
      console.error('❌ APPROVAL SERVICE: Error fetching pending approvals:', error)
      throw error
    }
  },

  // Get user's own requests
  async getUserRequests(userId: string) {
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select('*')
        .eq('requested_by', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Map to expected format using purchase_requests table structure
      return (data || []).map(req => ({
        id: req.id,
        request_number: req.request_number,
        title: req.title,
        description: req.description,
        status: req.status,
        priority: req.priority,
        total_amount: req.total_amount || 0,
        required_date: req.required_date,
        created_at: req.created_at,
        approvals: []
      }))
    } catch (error) {
      console.error('Error fetching user requests:', error)
      return []
    }
  },

  // Get all purchase requests with details
  async getAllPurchaseRequests() {
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching purchase requests:', error)
      throw error
    }
  },

  // Get notifications for a user
  async getNotifications(userId: string) {
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
      console.error('Error fetching notifications:', error)
      throw error
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  },

  // Mark all notifications as read
  async markAllNotificationsAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  },

  // Get approval statistics
  async getApprovalStats(userId: string, userRole: string) {
    try {
      let stats = {
        pendingApprovals: 0,
        totalRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0
      }

      if (userRole === 'manager' || userRole === 'admin') {
        // Get pending approvals count from purchase_requests for purchase request notifications
        const { data: pendingData, error: pendingError } = await supabase
          .from('purchase_requests')
          .select('id')
          .eq('status', 'pending')

        if (!pendingError) {
          stats.pendingApprovals = pendingData?.length || 0
        }
      }

      // Get user's request stats from purchase_requests
      const { data: userRequests, error: userError } = await supabase
        .from('purchase_requests')
        .select('status')
        .eq('requested_by', userId)

      if (!userError && userRequests) {
        stats.totalRequests = userRequests.length
        stats.approvedRequests = userRequests.filter(r => r.status === 'approved').length
        stats.rejectedRequests = userRequests.filter(r => r.status === 'rejected').length
      }

      return stats
    } catch (error) {
      console.error('Error fetching approval stats:', error)
      throw error
    }
  },

  // Get role-based dashboard data
  async getDashboardData(userId: string, userRole: string) {
    try {
      const data: any = {
        notifications: [],
        pendingApprovals: [],
        userRequests: [],
        stats: {}
      }

      // Get notifications
      data.notifications = await this.getNotifications(userId)

      // Get role-specific data
      if (userRole === 'manager' || userRole === 'admin') {
        data.pendingApprovals = await this.getPendingApprovals(userId, userRole)
      }

      if (userRole === 'employee' || userRole === 'manager' || userRole === 'admin') {
        data.userRequests = await this.getUserRequests(userId)
      }

      // Get stats
      data.stats = await this.getApprovalStats(userId, userRole)

      return data
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }
}
