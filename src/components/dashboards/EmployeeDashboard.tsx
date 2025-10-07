import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, Download, Plus, Search, QrCode, AlertTriangle, X, Edit3 } from 'lucide-react'
import { inventoryService, systemLogService, deliveryReceiptService, purchaseRequestService, inventoryChangeService } from '../../services/database'
import { useInventoryUpdates, usePurchaseRequestUpdates, useDocumentUpdates } from '../../hooks/useRealtimeUpdates'
import NotificationCenter from '../NotificationCenter'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const EmployeeDashboard = () => {
  const { user } = useAuth()
  const [rfidCode, setRfidCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [inventoryData, setInventoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    loadInventoryData()
  }, [])

  // Set up realtime subscriptions for inventory updates
  useInventoryUpdates((update) => {
    console.log('Inventory update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setInventoryData(prev => [update.new, ...prev])
      toast.success('New inventory item added')
    } else if (update.eventType === 'UPDATE') {
      setInventoryData(prev => prev.map(item => item.id === update.new.id ? update.new : item))
      toast.success('Inventory item updated')
    } else if (update.eventType === 'DELETE') {
      setInventoryData(prev => prev.filter(item => item.id !== update.old.id))
      toast.success('Inventory item removed')
    }
  })

  // Set up realtime subscriptions for purchase request updates
  usePurchaseRequestUpdates((update) => {
    console.log('Purchase request update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      toast.info('New purchase request received')
    } else if (update.eventType === 'UPDATE') {
      if (update.new.status === 'approved') {
        toast.success('Purchase request approved')
      } else if (update.new.status === 'rejected') {
        toast.error('Purchase request rejected')
      }
    }
  })

  // Set up realtime subscriptions for document updates
  useDocumentUpdates((update) => {
    console.log('Document update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      toast.info('New document uploaded')
    } else if (update.eventType === 'UPDATE') {
      if (update.new.status === 'verified') {
        toast.success('Document verified')
      }
    }
  })

  const loadInventoryData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await inventoryService.getAll()
      setInventoryData(data || [])
    } catch (error) {
      console.error('Error loading inventory data:', error)
      setError('Failed to load inventory data. Please try again.')
      toast.error('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  // Mock delivery logs for now (can be replaced with real data later)
  const deliveryLogs = [
    { id: 1, destination: 'Emergency Ward', items: 15, date: '2025-01-15 09:30', status: 'Delivered' },
    { id: 2, destination: 'Surgery Department', items: 8, date: '2025-01-15 10:15', status: 'In Transit' },
    { id: 3, destination: 'ICU', items: 12, date: '2025-01-15 11:00', status: 'Delivered' },
    { id: 4, destination: 'Pediatrics', items: 6, date: '2025-01-15 11:45', status: 'Pending' }
  ]

  const lowStockItems = inventoryData.filter(item => item.status === 'low_stock' || item.status === 'critical')

  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [showDeliveryForm, setShowDeliveryForm] = useState(false)
  const [showPurchaseRequestForm, setShowPurchaseRequestForm] = useState(false)
  const [newItem, setNewItem] = useState({
    item_name: '',
    rfid_code: '',
    quantity: 0,
    location: '',
    status: 'in_stock'
  })
  const [deliveryData, setDeliveryData] = useState({
    destination: '',
    items: 0,
    description: ''
  })
  const [purchaseRequestData, setPurchaseRequestData] = useState({
    item_name: '',
    quantity: 0,
    unit_price: 0,
    reason: ''
  })

  const handleRfidScan = async () => {
    if (rfidCode) {
      try {
        setLoading(true)
        const item = await inventoryService.getByRfid(rfidCode)
        if (item) {
          // Log RFID scan
          await systemLogService.logAction(
            'RFID Scan',
            user?.id || 'system',
            `RFID scanned: ${item.item_name} (${item.rfid_code}) - Quantity: ${item.quantity} - Location: ${item.location}`
          )
          
          toast.success(`RFID Scanned: ${item.item_name} - Quantity: ${item.quantity} - Location: ${item.location}`)
          
          // Update inventory data
          await loadInventoryData()
        } else {
          toast.error('RFID code not found in inventory')
        }
      } catch (error) {
        console.error('RFID scan error:', error)
        toast.error('RFID code not found in inventory')
      } finally {
        setLoading(false)
      }
      setRfidCode('')
    }
  }

  const handleAddItem = async () => {
    try {
      console.log('=== HANDLE ADD ITEM START ===')
      console.log('Form data:', newItem)
      
      // Validate required fields
      if (!newItem.item_name || !newItem.rfid_code || !newItem.quantity || !newItem.location) {
        console.log('Validation failed - missing required fields')
        toast.error('Please fill in all required fields')
        return
      }

      console.log('Validation passed, proceeding with creation')
      setLoading(true)
      
      const itemData = {
        ...newItem,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Creating inventory item with data:', itemData)
      const result = await inventoryService.create(itemData)
      console.log('Inventory creation result:', result)
      
      if (!result || result.length === 0) {
        console.warn('No result returned from inventory service')
        toast.error('Failed to create inventory item - no data returned')
        return
      }
      
      // Log item creation
      console.log('Logging item creation to system logs')
      await systemLogService.logAction(
        'Inventory Item Added',
        user?.id || 'system',
        `New inventory item added: ${newItem.item_name} (${newItem.rfid_code}) - Quantity: ${newItem.quantity} - Location: ${newItem.location}`
      )
      
      console.log('Reloading inventory data')
      await loadInventoryData()
      
      console.log('Resetting form and closing modal')
      setNewItem({ item_name: '', rfid_code: '', quantity: 0, location: '', status: 'in_stock' })
      setShowAddItemForm(false)
      toast.success('Inventory item added successfully!')
      
      console.log('=== HANDLE ADD ITEM SUCCESS ===')
    } catch (error) {
      console.error('=== HANDLE ADD ITEM ERROR ===')
      console.error('Error adding item:', error)
      toast.error(`Failed to add inventory item: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordDelivery = async () => {
    try {
      setLoading(true)
      
      // Create delivery record in system logs
      await systemLogService.create({
        action: 'Delivery Recorded',
        user_id: '33333333-3333-3333-3333-333333333333', // Employee user ID
        details: `Delivery to ${deliveryData.destination}: ${deliveryData.items} items - ${deliveryData.description}`
      })
      
      // Create delivery receipt
      await deliveryReceiptService.create({
        receipt_number: `DR-${Date.now()}`,
        destination: deliveryData.destination,
        items_count: deliveryData.items,
        description: deliveryData.description,
        status: 'delivered',
        delivered_by: '33333333-3333-3333-3333-333333333333'
      })
      
      setDeliveryData({ destination: '', items: 0, description: '' })
      setShowDeliveryForm(false)
      toast.success('Delivery recorded successfully!')
    } catch (error) {
      console.error('Error recording delivery:', error)
      toast.error('Failed to record delivery')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePurchaseRequest = async (itemData: any) => {
    try {
      setLoading(true)
      
      const requestData = {
        request_number: `PR-${Date.now()}`,
        item_name: itemData.item_name,
        quantity: itemData.quantity,
        unit_price: itemData.unit_price || 0,
        total_amount: (itemData.quantity * (itemData.unit_price || 0)),
        reason: itemData.reason || 'Warehouse restocking',
        status: 'pending',
        requested_by: '33333333-3333-3333-3333-333333333333'
      }
      
      await purchaseRequestService.create(requestData)
      
      // Log the request
      await systemLogService.create({
        action: 'Purchase Request Created',
        user_id: '33333333-3333-3333-3333-333333333333',
        details: `Purchase request created for ${itemData.item_name} - Quantity: ${itemData.quantity}`
      })
      
      toast.success('Purchase request created successfully! Awaiting manager approval.')
    } catch (error) {
      console.error('Error creating purchase request:', error)
      toast.error('Failed to create purchase request')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestInventoryChange = async (inventoryId: string, changeType: string, quantityChange: number, reason: string) => {
    try {
      setLoading(true)
      
      const changeData = {
        inventory_id: inventoryId,
        change_type: changeType,
        quantity_change: quantityChange,
        previous_quantity: 0, // Will be updated when approved
        new_quantity: quantityChange,
        reason: reason,
        changed_by: '33333333-3333-3333-3333-333333333333',
        status: 'pending'
      }
      
      await inventoryChangeService.create(changeData)
      
      // Log the change request
      await systemLogService.create({
        action: 'Inventory Change Requested',
        user_id: '33333333-3333-3333-3333-333333333333',
        details: `Inventory change requested: ${changeType} ${quantityChange} items - Reason: ${reason}`
      })
      
      toast.success('Inventory change requested successfully! Awaiting manager approval.')
    } catch (error) {
      console.error('Error requesting inventory change:', error)
      toast.error('Failed to request inventory change')
    } finally {
      setLoading(false)
    }
  }

  const handleInventoryAlert = async (itemId: string, alertType: string) => {
    try {
      await systemLogService.create({
        action: 'Inventory Alert',
        user_id: '33333333-3333-3333-3333-333333333333',
        details: `Inventory alert triggered: ${alertType} for item ${itemId}`
      })
      
      toast.success(`Inventory alert sent for ${alertType}`)
    } catch (error) {
      console.error('Error sending alert:', error)
      toast.error('Failed to send inventory alert')
    }
  }

  const handleBulkInventoryUpdate = async (updates: any[]) => {
    try {
      for (const update of updates) {
        await inventoryService.updateQuantity(update.id, update.quantity)
      }
      
      await systemLogService.create({
        action: 'Bulk Inventory Update',
        user_id: '33333333-3333-3333-3333-333333333333',
        details: `Bulk inventory update: ${updates.length} items updated`
      })
      
      await loadInventoryData()
      toast.success('Bulk inventory update completed!')
    } catch (error) {
      console.error('Error updating inventory:', error)
      toast.error('Failed to update inventory')
    }
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await inventoryService.updateQuantity(itemId, newQuantity)
      await loadInventoryData()
      toast.success('Inventory quantity updated!')
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    }
  }

  const filteredInventory = inventoryData.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rfid_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Smart Warehousing System</h1>
          <p className="text-gray-600">Manage inventory, handle RFID scanning, and update item records</p>
        </div>
        <NotificationCenter
          notifications={notifications}
          onClearNotification={(id) => {
            setNotifications(prev => prev.filter(n => n.id !== id))
          }}
          onClearAll={() => {
            setNotifications([])
          }}
        />
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <div className="text-red-400 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
              title="Close error message"
              aria-label="Close error message"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Real-time Status */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Real-time Status: {isConnected ? 'Connected' : 'Disconnected'}
              </h3>
              <p className="text-sm text-blue-700">
                {lastUpdate ? `Last update: ${lastUpdate.toLocaleTimeString()}` : 'No updates yet'}
              </p>
            </div>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center text-blue-600">
              <span className="text-sm font-medium">{notifications.length} new updates</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items in Stock</p>
              <p className="text-2xl font-bold text-primary">{loading ? '...' : inventoryData.length}</p>
              <p className="text-xs text-green-600">Live data from database</p>
            </div>
            <Package className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-orange-500">{lowStockItems.length}</p>
              <p className="text-xs text-orange-600">Requires attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outgoing Deliveries</p>
              <p className="text-2xl font-bold text-secondary">4</p>
              <p className="text-xs text-blue-600">Today's schedule</p>
            </div>
            <Truck className="w-8 h-8 text-secondary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Incoming Shipments</p>
              <p className="text-2xl font-bold text-accent">2</p>
              <p className="text-xs text-green-600">Expected today</p>
            </div>
            <Download className="w-8 h-8 text-accent" />
          </div>
        </div>
      </motion.div>

      {/* RFID Scanner Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">RFID Scanner</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RFID Code Scanner
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={rfidCode}
                onChange={(e) => setRfidCode(e.target.value)}
                placeholder="Scan or enter RFID code..."
                className="input-field flex-1"
              />
              <button
                onClick={handleRfidScan}
                className="btn-primary flex items-center space-x-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan</span>
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowAddItemForm(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
            <button 
              onClick={() => setShowDeliveryForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>Record Delivery</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Inventory Table</h3>
            <button className="btn-primary text-sm">Export Report</button>
          </div>
          
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items or RFID codes..."
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Item</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">RFID</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Qty</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">Loading inventory...</td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">No inventory items found</td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 text-sm text-gray-900">{item.item_name}</td>
                      <td className="py-3 text-sm text-gray-600 font-mono">{item.rfid_code}</td>
                      <td className="py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                          item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Delivery Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Delivery Logs</h3>
            <button className="btn-primary text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {deliveryLogs.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{delivery.destination}</p>
                  <p className="text-sm text-gray-600">{delivery.items} items • {delivery.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  delivery.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {delivery.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card p-6 border-l-4 border-orange-500"
        >
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500">Low Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="font-medium text-gray-900">{item.item_name}</p>
                <p className="text-sm text-gray-600">RFID: {item.rfid_code}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-sm text-gray-600">Location: {item.location}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowAddItemForm(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Inventory</span>
          </button>
          <button 
            onClick={() => setRfidCode('')}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <QrCode className="w-5 h-5" />
            <span>Scan RFID</span>
          </button>
          <button 
            onClick={() => setShowDeliveryForm(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Truck className="w-5 h-5" />
            <span>Record Delivery</span>
          </button>
          <button 
            onClick={() => setShowPurchaseRequestForm(true)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Package className="w-5 h-5" />
            <span>Request Purchase</span>
          </button>
          <button 
            onClick={() => loadInventoryData()}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Package className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
        </div>
        
        {/* Additional Employee Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Inventory Management</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                const lowStockItems = inventoryData.filter(item => item.status === 'low_stock' || item.status === 'critical')
                if (lowStockItems.length > 0) {
                  handleInventoryAlert(lowStockItems[0].id, 'Low Stock Alert')
                } else {
                  toast.success('No low stock items found')
                }
              }}
              className="px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
            >
              Send Low Stock Alert
            </button>
            <button 
              onClick={() => {
                // Export inventory data
                const csvData = inventoryData.map(item => ({
                  name: item.item_name,
                  rfid: item.rfid_code,
                  quantity: item.quantity,
                  status: item.status,
                  location: item.location
                }))
                
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "Name,RFID,Quantity,Status,Location\n" +
                  csvData.map(row => Object.values(row).join(",")).join("\n")
                
                const encodedUri = encodeURI(csvContent)
                const link = document.createElement("a")
                link.setAttribute("href", encodedUri)
                link.setAttribute("download", "inventory_export.csv")
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                toast.success('Inventory data exported!')
              }}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              Export Inventory
            </button>
            <button 
              onClick={() => {
                // Generate inventory report
                toast.success('Inventory report generated!')
              }}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
            >
              Generate Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* Add Item Modal */}
      {showAddItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Add Inventory Item</h3>
              <button
                onClick={() => setShowAddItemForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({...newItem, item_name: e.target.value})}
                  className="input-field w-full"
                  placeholder="Surgical Masks"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RFID Code</label>
                <input
                  type="text"
                  value={newItem.rfid_code}
                  onChange={(e) => setNewItem({...newItem, rfid_code: e.target.value})}
                  className="input-field w-full"
                  placeholder="RFID001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                  className="input-field w-full"
                  placeholder="A-1-01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newItem.status}
                  onChange={(e) => setNewItem({...newItem, status: e.target.value})}
                  className="input-field w-full"
                  aria-label="Item status"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="critical">Critical</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddItemForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Form submit button clicked')
                  console.log('Current form data:', newItem)
                  handleAddItem()
                }}
                className="btn-primary"
              >
                Add Item
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Record Delivery Modal */}
      {showDeliveryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Record Delivery</h3>
              <button
                onClick={() => setShowDeliveryForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <input
                  type="text"
                  value={deliveryData.destination}
                  onChange={(e) => setDeliveryData({...deliveryData, destination: e.target.value})}
                  className="input-field w-full"
                  placeholder="Emergency Ward"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Items</label>
                <input
                  type="number"
                  value={deliveryData.items}
                  onChange={(e) => setDeliveryData({...deliveryData, items: parseInt(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="15"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={deliveryData.description}
                  onChange={(e) => setDeliveryData({...deliveryData, description: e.target.value})}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Medical supplies for emergency procedures..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeliveryForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordDelivery}
                className="btn-primary"
              >
                Record Delivery
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Purchase Request Modal */}
      {showPurchaseRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Create Purchase Request</h3>
              <button
                onClick={() => setShowPurchaseRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={purchaseRequestData.item_name}
                  onChange={(e) => setPurchaseRequestData({...purchaseRequestData, item_name: e.target.value})}
                  className="input-field w-full"
                  placeholder="Surgical Masks"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={purchaseRequestData.quantity}
                  onChange={(e) => setPurchaseRequestData({...purchaseRequestData, quantity: parseInt(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchaseRequestData.unit_price}
                  onChange={(e) => setPurchaseRequestData({...purchaseRequestData, unit_price: parseFloat(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="2.50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={purchaseRequestData.reason}
                  onChange={(e) => setPurchaseRequestData({...purchaseRequestData, reason: e.target.value})}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Low stock in emergency ward..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowPurchaseRequestForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleCreatePurchaseRequest(purchaseRequestData)
                    setPurchaseRequestData({ item_name: '', quantity: 0, unit_price: 0, reason: '' })
                    setShowPurchaseRequestForm(false)
                  }}
                  className="btn-primary flex-1"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default EmployeeDashboard
