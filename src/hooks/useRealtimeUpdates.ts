import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeUpdate {
  table: string
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: any
  old?: any
}

export const useRealtimeUpdates = (
  table: string,
  callback: (update: RealtimeUpdate) => void,
  dependencies: any[] = []
) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    // Create realtime channel for the table
    const newChannel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log(`Realtime update for ${table}:`, payload)
          callback({
            table,
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
          })
        }
      )
      .subscribe()

    setChannel(newChannel)

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel)
      }
    }
  }, [table, ...dependencies])

  return channel
}

// Specific hooks for different modules
export const useInventoryUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('inventory', callback)
}

export const usePurchaseOrderUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('purchase_orders', callback)
}

export const usePurchaseRequestUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('purchase_requests', callback)
}

export const useProjectUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('projects', callback)
}

export const useAssetUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('assets', callback)
}

export const useDocumentUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('documents', callback)
}

export const useUserUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('users', callback)
}

export const useSystemLogUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('system_logs', callback)
}

export const useNotificationUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('notifications', callback)
}

// Comprehensive realtime hook for dashboard updates
export const useDashboardRealtime = (
  callbacks: {
    onInventoryUpdate?: (update: RealtimeUpdate) => void
    onPurchaseOrderUpdate?: (update: RealtimeUpdate) => void
    onPurchaseRequestUpdate?: (update: RealtimeUpdate) => void
    onProjectUpdate?: (update: RealtimeUpdate) => void
    onAssetUpdate?: (update: RealtimeUpdate) => void
    onDocumentUpdate?: (update: RealtimeUpdate) => void
    onUserUpdate?: (update: RealtimeUpdate) => void
    onSystemLogUpdate?: (update: RealtimeUpdate) => void
    onNotificationUpdate?: (update: RealtimeUpdate) => void
  }
) => {
  const [channels, setChannels] = useState<RealtimeChannel[]>([])

  useEffect(() => {
    const newChannels: RealtimeChannel[] = []

    // Set up channels for each callback
    if (callbacks.onInventoryUpdate) {
      const channel = supabase
        .channel('inventory_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory',
          },
          (payload) => {
            callbacks.onInventoryUpdate!({
              table: 'inventory',
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new,
              old: payload.old,
            })
          }
        )
        .subscribe()
      newChannels.push(channel)
    }

    if (callbacks.onPurchaseOrderUpdate) {
      const channel = supabase
        .channel('purchase_orders_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'purchase_orders',
          },
          (payload) => {
            callbacks.onPurchaseOrderUpdate!({
              table: 'purchase_orders',
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new,
              old: payload.old,
            })
          }
        )
        .subscribe()
      newChannels.push(channel)
    }

    if (callbacks.onPurchaseRequestUpdate) {
      const channel = supabase
        .channel('purchase_requests_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'purchase_requests',
          },
          (payload) => {
            callbacks.onPurchaseRequestUpdate!({
              table: 'purchase_requests',
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new,
              old: payload.old,
            })
          }
        )
        .subscribe()
      newChannels.push(channel)
    }

    if (callbacks.onProjectUpdate) {
      const channel = supabase
        .channel('projects_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects',
          },
          (payload) => {
            callbacks.onProjectUpdate!({
              table: 'projects',
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new,
              old: payload.old,
            })
          }
        )
        .subscribe()
      newChannels.push(channel)
    }

    if (callbacks.onAssetUpdate) {
      const channel = supabase
        .channel('assets_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'assets',
          },
          (payload) => {
            callbacks.onAssetUpdate!({
              table: 'assets',
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new,
              old: payload.old,
            })
          }
        )
        .subscribe()
      newChannels.push(channel)
    }

    if (callbacks.onDocumentUpdate) {
      const channel = supabase
        .channel('documents_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documents',
          },
          (payload) => {
            callbacks.onDocumentUpdate!({
              table: 'documents',
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new,
              old: payload.old,
            })
          }
        )
        .subscribe()
      newChannels.push(channel)
    }

    if (callbacks.onUserUpdate) {
      const channel = supabase
        .channel('users_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users',
          },
          (payload) => {
            callbacks.onUserUpdate!({
              table: 'users',
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new,
              old: payload.old,
            })
          }
        )
        .subscribe()
      newChannels.push(channel)
    }

    if (callbacks.onSystemLogUpdate) {
      const channel = supabase
        .channel('system_logs_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'system_logs',
          },
          (payload) => {
            callbacks.onSystemLogUpdate!({
              table: 'system_logs',
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new,
              old: payload.old,
            })
          }
        )
        .subscribe()
      newChannels.push(channel)
    }

    if (callbacks.onNotificationUpdate) {
      const channel = supabase
        .channel('notifications_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            callbacks.onNotificationUpdate!({
              table: 'notifications',
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new,
              old: payload.old,
            })
          }
        )
        .subscribe()
      newChannels.push(channel)
    }

    setChannels(newChannels)

    return () => {
      newChannels.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [])

  return channels
}

// Legacy hook for backward compatibility - returns the expected object structure
export const useLegacyRealtimeUpdates = () => {
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [realtimeData, setRealtimeData] = useState<any>({})

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return {
    isConnected,
    lastUpdate,
    notifications,
    realtimeData,
    clearNotification,
    clearAllNotifications
  }
}

// Additional hooks for specific modules
export const useSupplierUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('suppliers', callback)
}

export const useDeliveryReceiptUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('delivery_receipts', callback)
}

export const useMaintenanceLogUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('maintenance_logs', callback)
}

export const useMaintenanceScheduleUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('maintenance_schedule', callback)
}

// Approval workflow hooks
export const useInventoryApprovalUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('inventory_approvals', callback)
}

export const useProcurementApprovalUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('procurement_approvals', callback)
}

export const useApprovalNotificationUpdates = (callback: (update: RealtimeUpdate) => void) => {
  return useRealtimeUpdates('notifications', callback)
}