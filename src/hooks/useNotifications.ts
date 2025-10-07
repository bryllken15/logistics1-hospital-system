import { useState, useEffect } from 'react'
import { inventoryService } from '../services/database'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
    // Check for notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const inventory = await inventoryService.getAll()
      const lowStockItems = inventory.filter(item => 
        item.status === 'low_stock' || item.status === 'critical'
      )
      
      const alerts = lowStockItems.map(item => ({
        id: item.id,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${item.item_name} is running low (${item.quantity} remaining)`,
        severity: item.status === 'critical' ? 'high' : 'medium',
        timestamp: new Date().toISOString()
      }))
      
      setNotifications(alerts)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  return {
    notifications,
    loading,
    dismissNotification,
    refreshNotifications: loadNotifications
  }
}
