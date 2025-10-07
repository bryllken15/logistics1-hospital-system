import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useRealtimeUpdates = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    // Simple connection check
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        
        if (error) throw error
        setIsConnected(true)
        setLastUpdate(new Date())
      } catch (error) {
        console.error('Connection check failed:', error)
        setIsConnected(false)
      }
    }

    checkConnection()

    // Set up real-time subscriptions for different tables
    const channels = [
      supabase
        .channel('inventory_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
          setLastUpdate(new Date())
        })
        .subscribe(),
      
      supabase
        .channel('purchase_orders_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_orders' }, () => {
          setLastUpdate(new Date())
        })
        .subscribe(),
      
      supabase
        .channel('projects_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
          setLastUpdate(new Date())
        })
        .subscribe(),
      
      supabase
        .channel('assets_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, () => {
          setLastUpdate(new Date())
        })
        .subscribe(),
      
      supabase
        .channel('documents_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
          setLastUpdate(new Date())
        })
        .subscribe()
    ]

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [])

  return { isConnected, lastUpdate }
}