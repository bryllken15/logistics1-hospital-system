import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

// Real-time subscription hooks for different data types

export const usePurchaseRequests = (userId?: string) => {
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('purchase_requests')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setPurchaseRequests(data || [])
      } catch (error) {
        console.error('Error fetching purchase requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()

    // Real-time subscription
    const subscription = supabase
      .channel('purchase_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchase_requests'
        },
        (payload) => {
          console.log('Purchase request change:', payload)
          
          if (payload.eventType === 'INSERT') {
            setPurchaseRequests(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setPurchaseRequests(prev => 
              prev.map(req => req.id === payload.new.id ? payload.new : req)
            )
          } else if (payload.eventType === 'DELETE') {
            setPurchaseRequests(prev => 
              prev.filter(req => req.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  return { purchaseRequests, loading, setPurchaseRequests }
}

export const usePurchaseRequestApprovals = (userId?: string) => {
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const { data, error } = await supabase
          .from('purchase_request_approvals')
          .select('*')
          .eq('approver_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setApprovals(data || [])
      } catch (error) {
        console.error('Error fetching approvals:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchApprovals()

      // Real-time subscription for approvals
      const subscription = supabase
        .channel('purchase_request_approvals_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'purchase_request_approvals',
            filter: `approver_id=eq.${userId}`
          },
          (payload) => {
            console.log('Approval change:', payload)
            
            if (payload.eventType === 'INSERT') {
              setApprovals(prev => [payload.new, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setApprovals(prev => 
                prev.map(approval => approval.id === payload.new.id ? payload.new : approval)
              )
            }
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [userId])

  return { approvals, loading, setApprovals }
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        setNotifications(data || [])
        setUnreadCount(data?.filter(n => !n.is_read).length || 0)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchNotifications()

      // Real-time subscription for notifications
      const subscription = supabase
        .channel('notifications_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('New notification:', payload)
            setNotifications(prev => [payload.new, ...prev])
            setUnreadCount(prev => prev + 1)
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    setNotifications 
  }
}

export const useProjects = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_manager:users!project_manager_id(full_name, email),
            created_by_user:users!created_by(full_name, email)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProjects(data || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()

    // Real-time subscription
    const subscription = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Project change:', payload)
          
          if (payload.eventType === 'INSERT') {
            setProjects(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setProjects(prev => 
              prev.map(project => project.id === payload.new.id ? payload.new : project)
            )
          } else if (payload.eventType === 'DELETE') {
            setProjects(prev => 
              prev.filter(project => project.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { projects, loading, setProjects }
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select(`
            *,
            created_by_user:users!created_by(full_name, email),
            updated_by_user:users!updated_by(full_name, email)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setInventory(data || [])
      } catch (error) {
        console.error('Error fetching inventory:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()

    // Real-time subscription
    const subscription = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory'
        },
        (payload) => {
          console.log('Inventory change:', payload)
          
          if (payload.eventType === 'INSERT') {
            setInventory(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setInventory(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new : item)
            )
          } else if (payload.eventType === 'DELETE') {
            setInventory(prev => 
              prev.filter(item => item.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { inventory, loading, setInventory }
}

// Utility function to setup all real-time subscriptions
export const useRealtimeSubscriptions = (userId?: string) => {
  const purchaseRequests = usePurchaseRequests(userId)
  const approvals = usePurchaseRequestApprovals(userId)
  const notifications = useNotifications(userId)
  const projects = useProjects()
  const inventory = useInventory()

  return {
    purchaseRequests,
    approvals,
    notifications,
    projects,
    inventory
  }
}

// Enhanced realtime subscriptions for approval workflows
export const useApprovalWorkflowSubscriptions = (userId?: string) => {
  const purchaseRequests = usePurchaseRequests(userId)
  const approvals = usePurchaseRequestApprovals(userId)
  const notifications = useNotifications(userId)
  const projects = useProjects()
  const inventory = useInventory()

  return {
    purchaseRequests,
    approvals,
    notifications,
    projects,
    inventory
  }
}