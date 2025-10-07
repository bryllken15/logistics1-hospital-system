import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Truck, Package, Plus, Search, QrCode, CheckCircle, X, Edit3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { purchaseOrderService, supplierService, systemLogService, purchaseRequestService, deliveryReceiptService, inventoryService, analyticsService } from '../../services/database'
import { supabase } from '../../lib/supabase'
import { usePurchaseOrderUpdates, usePurchaseRequestUpdates, useSupplierUpdates, useDeliveryReceiptUpdates } from '../../hooks/useRealtimeUpdates'
import NotificationCenter from '../NotificationCenter'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const ProcurementDashboard = () => {
  const { user } = useAuth()
  const [rfidCode, setRfidCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([])
  const [deliveryReceipts, setDeliveryReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateOrderForm, setShowCreateOrderForm] = useState(false)
  const [showCreateRequestForm, setShowCreateRequestForm] = useState(false)
  const [showAddSupplierForm, setShowAddSupplierForm] = useState(false)
  const [newOrder, setNewOrder] = useState({
    supplier: '',
    items: 0,
    amount: 0,
    description: ''
  })
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: '',
    rating: 5
  })
  const [newRequest, setNewRequest] = useState({
    item_name: '',
    quantity: 0,
    unit_price: 0,
    total_amount: 0,
    description: '',
    priority: 'medium'
  })
  const [analyticsData, setAnalyticsData] = useState({
    monthlySpending: [],
    orderStatusData: [],
    supplierData: []
  })
  const [combinedOrders, setCombinedOrders] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    loadProcurementData()
  }, [])

  // Set up realtime subscriptions for procurement updates
  usePurchaseOrderUpdates((update) => {
    console.log('Purchase order update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setPurchaseOrders(prev => [update.new, ...prev])
      // Update combined orders to include the new order
      setCombinedOrders(prev => [
        {
          ...update.new,
          type: 'order',
          displayName: update.new.supplier,
          displayAmount: update.new.amount,
          displayItems: update.new.items,
          displayRfid: update.new.rfid_code
        },
        ...prev
      ])
      toast.success('New purchase order created')
    } else if (update.eventType === 'UPDATE') {
      setPurchaseOrders(prev => prev.map(order => order.id === update.new.id ? update.new : order))
      // Update combined orders with the updated order
      setCombinedOrders(prev => prev.map(item => 
        item.id === update.new.id ? {
          ...update.new,
          type: 'order',
          displayName: update.new.supplier,
          displayAmount: update.new.amount,
          displayItems: update.new.items,
          displayRfid: update.new.rfid_code
        } : item
      ))
      if (update.new.status === 'approved') {
        toast.success('Purchase order approved')
      } else if (update.new.status === 'delivered') {
        toast.success('Purchase order delivered')
      }
    } else if (update.eventType === 'DELETE') {
      setPurchaseOrders(prev => prev.filter(order => order.id !== update.old.id))
      // Remove from combined orders
      setCombinedOrders(prev => prev.filter(item => item.id !== update.old.id))
      toast.success('Purchase order deleted')
    }
  })

  usePurchaseRequestUpdates((update) => {
    console.log('Purchase request update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setPurchaseRequests(prev => [update.new, ...prev])
      // Update combined orders to include the new request
      setCombinedOrders(prev => [
        {
          ...update.new,
          type: 'request',
          displayName: update.new.item_name,
          displayAmount: update.new.total_amount,
          displayItems: update.new.quantity,
          displayRfid: `REQ-${update.new.id.slice(-6)}`
        },
        ...prev
      ])
      toast('New purchase request received')
    } else if (update.eventType === 'UPDATE') {
      setPurchaseRequests(prev => prev.map(req => req.id === update.new.id ? update.new : req))
      // Update combined orders with the updated request
      setCombinedOrders(prev => prev.map(item => 
        item.id === update.new.id ? {
          ...update.new,
          type: 'request',
          displayName: update.new.item_name,
          displayAmount: update.new.total_amount,
          displayItems: update.new.quantity,
          displayRfid: `REQ-${update.new.id.slice(-6)}`
        } : item
      ))
      if (update.new.status === 'approved') {
        toast.success('Purchase request approved')
      } else if (update.new.status === 'rejected') {
        toast.error('Purchase request rejected')
      }
    }
  })

  useSupplierUpdates((update) => {
    console.log('Supplier update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setSuppliers(prev => [update.new, ...prev])
      toast.success('New supplier added')
    } else if (update.eventType === 'UPDATE') {
      setSuppliers(prev => prev.map(supplier => supplier.id === update.new.id ? update.new : supplier))
      toast.success('Supplier updated')
    } else if (update.eventType === 'DELETE') {
      setSuppliers(prev => prev.filter(supplier => supplier.id !== update.old.id))
      toast.success('Supplier removed')
    }
  })

  useDeliveryReceiptUpdates((update) => {
    console.log('Delivery receipt update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setDeliveryReceipts(prev => [update.new, ...prev])
      toast.success('New delivery receipt added')
    } else if (update.eventType === 'UPDATE') {
      setDeliveryReceipts(prev => prev.map(receipt => receipt.id === update.new.id ? update.new : receipt))
      if (update.new.status === 'verified') {
        toast.success('Delivery receipt verified')
      }
    }
  })


  const testDatabaseConnection = async () => {
    try {
      console.log('🧪 Testing database connection...')
      const { data, error } = await supabase.from('users').select('count').limit(1)
      if (error) {
        console.error('❌ Database connection failed:', error)
        toast.error(`Database error: ${error.message}`)
      } else {
        console.log('✅ Database connection successful')
        toast.success('Database connected successfully!')
      }
    } catch (error) {
      console.error('❌ Database test failed:', error)
      toast.error('Database connection failed')
    }
  }

  const loadProcurementData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading procurement data...')
      
      const [orders, supplierData, requests, deliveries] = await Promise.all([
        purchaseOrderService.getAll(),
        supplierService.getAll(),
        purchaseRequestService.getAll(),
        deliveryReceiptService.getAll()
      ])
      
      console.log('📊 Loaded data:', {
        orders: orders?.length || 0,
        suppliers: supplierData?.length || 0,
        requests: requests?.length || 0,
        deliveries: deliveries?.length || 0
      })
      console.log('📋 Purchase orders:', orders)
      console.log('📋 Purchase requests:', requests)
      
      setPurchaseOrders(orders || [])
      setSuppliers(supplierData || [])
      // Store additional data for use in functions
      setPurchaseRequests(requests || [])
      setDeliveryReceipts(deliveries || [])
      
      // Create combined data for the table
      const combined = [
        ...(orders || []).map(order => ({
          ...order,
          type: 'order',
          displayName: order.supplier || 'Unknown Supplier',
          displayAmount: order.amount || 0,
          displayItems: order.items || 0,
          displayRfid: order.rfid_code || 'N/A'
        })),
        ...(requests || []).map(request => ({
          ...request,
          type: 'request',
          displayName: request.item_name || 'Unknown Item',
          displayAmount: request.estimated_cost || 0,
          displayItems: request.quantity || 0,
          displayRfid: `REQ-${request.id ? request.id.slice(-6) : 'UNKNOWN'}`
        }))
      ]
      setCombinedOrders(combined)
      
      // Load analytics data
      await loadAnalyticsData(orders || [])
    } catch (error) {
      console.error('Error loading procurement data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalyticsData = async (orders: any[]) => {
    try {
      // Generate monthly spending data from real orders and requests
      const monthlySpending = generateMonthlySpendingData(orders, purchaseRequests)
      
      // Generate order status data (includes both orders and requests)
      const orderStatusData = generateOrderStatusData(orders, purchaseRequests)
      
      // Generate supplier data
      const supplierData = generateSupplierData(orders)
      
      setAnalyticsData({
        monthlySpending,
        orderStatusData,
        supplierData
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
    }
  }

  const generateMonthlySpendingData = (orders: any[], requests: any[]) => {
    const monthlyData: { [key: string]: { amount: number, orders: number } } = {}
    
    // Add orders data
    orders.forEach(order => {
      const date = new Date(order.created_at)
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (!monthlyData[month]) {
        monthlyData[month] = { amount: 0, orders: 0 }
      }
      
      monthlyData[month].amount += order.amount
      monthlyData[month].orders += 1
    })
    
    // Add requests data
    requests.forEach(request => {
      const date = new Date(request.created_at)
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (!monthlyData[month]) {
        monthlyData[month] = { amount: 0, orders: 0 }
      }
      
      monthlyData[month].amount += request.total_amount || 0
      monthlyData[month].orders += 1
    })
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      amount: data.amount,
      orders: data.orders
    }))
  }

  const generateOrderStatusData = (orders: any[], requests: any[]) => {
    const statusCounts: { [key: string]: number } = {}
    
    // Add orders status
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    })
    
    // Add requests status
    requests.forEach(request => {
      statusCounts[request.status] = (statusCounts[request.status] || 0) + 1
    })
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }))
  }

  const generateSupplierData = (orders: any[]) => {
    const supplierData: { [key: string]: { amount: number, orders: number } } = {}
    
    orders.forEach(order => {
      if (!supplierData[order.supplier]) {
        supplierData[order.supplier] = { amount: 0, orders: 0 }
      }
      
      supplierData[order.supplier].amount += order.amount
      supplierData[order.supplier].orders += 1
    })
    
    return Object.entries(supplierData).map(([supplier, data]) => ({
      supplier,
      amount: data.amount,
      orders: data.orders
    }))
  }

  const handleCreateOrder = async () => {
    try {
      // Validate required fields
      if (!newOrder.supplier || !newOrder.items || !newOrder.amount) {
        toast.error('Please fill in all required fields')
        return
      }

      const orderData = {
        supplier: newOrder.supplier,
        items: newOrder.items,
        amount: newOrder.amount,
        description: newOrder.description || '',
        status: 'pending',
        rfid_code: `RFID-${Date.now()}`,
        created_by: '44444444-4444-4444-4444-444444444444' // Procurement user ID
      }
      
      console.log('Creating purchase order with data:', orderData)
      const result = await purchaseOrderService.create(orderData)
      console.log('Purchase order creation result:', result)
      
      if (!result || result.length === 0) {
        console.warn('Purchase order creation returned empty result, but continuing...')
      }
      
      // Log order creation
      await systemLogService.create({
        action: 'Purchase Order Created',
        user_id: '44444444-4444-4444-4444-444444444444',
        details: `Purchase order created for ${newOrder.supplier}: ${newOrder.items} items, ₱${(newOrder.amount || 0).toLocaleString()}`
      })
      
      // Update the combined orders immediately with the new order
      if (result && result.length > 0) {
        const newOrderItem = result[0]
        setCombinedOrders(prev => [
          {
            ...newOrderItem,
            type: 'order',
            displayName: newOrderItem.supplier,
            displayAmount: newOrderItem.amount,
            displayItems: newOrderItem.items,
            displayRfid: newOrderItem.rfid_code
          },
          ...prev
        ])
        setPurchaseOrders(prev => [newOrderItem, ...prev])
      }
      
      await loadProcurementData()
      setNewOrder({ supplier: '', items: 0, amount: 0, description: '' })
      setShowCreateOrderForm(false)
      toast.success('Purchase order created successfully!')
      
      // Debug: Check if the order was added to the state
      setTimeout(() => {
        console.log('Current purchase orders after creation:', purchaseOrders)
        console.log('Analytics data after creation:', analyticsData)
      }, 1000)
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(`Failed to create purchase order: ${error.message || 'Unknown error'}`)
    }
  }

  const handleCreateRequest = async () => {
    try {
      // Validate required fields
      if (!newRequest.item_name || !newRequest.quantity || !newRequest.unit_price) {
        toast.error('Please fill in all required fields')
        return
      }

      const requestData = {
        item_name: newRequest.item_name,
        quantity: newRequest.quantity,
        unit_price: newRequest.unit_price,
        total_amount: newRequest.quantity * newRequest.unit_price,
        description: newRequest.description || '',
        priority: newRequest.priority,
        status: 'pending',
        requested_by: '44444444-4444-4444-4444-444444444444' // Procurement user ID
      }
      
      console.log('Creating purchase request with data:', requestData)
      const result = await purchaseRequestService.create(requestData)
      console.log('Purchase request creation result:', result)
      
      // Log request creation
      await systemLogService.create({
        action: 'Purchase Request Created',
        user_id: '44444444-4444-4444-4444-444444444444',
        details: `Purchase request created for ${newRequest.item_name}: ${newRequest.quantity} units, ₱${(requestData.total_amount || 0).toLocaleString()}`
      })
      
      // Update the combined orders immediately with the new request
      if (result && result.length > 0) {
        const newRequestItem = result[0]
        setCombinedOrders(prev => [
          {
            ...newRequestItem,
            type: 'request',
            displayName: newRequestItem.item_name,
            displayAmount: newRequestItem.total_amount,
            displayItems: newRequestItem.quantity,
            displayRfid: `REQ-${newRequestItem.id.slice(-6)}`
          },
          ...prev
        ])
        setPurchaseRequests(prev => [newRequestItem, ...prev])
      }
      
      await loadProcurementData()
      setNewRequest({ item_name: '', quantity: 0, unit_price: 0, total_amount: 0, description: '', priority: 'medium' })
      setShowCreateRequestForm(false)
      toast.success('Purchase request created successfully!')
      
      // Debug: Check if the request was added to the state
      setTimeout(() => {
        console.log('Current purchase requests after creation:', purchaseRequests)
        console.log('Analytics data after creation:', analyticsData)
      }, 1000)
    } catch (error) {
      console.error('Error creating request:', error)
      toast.error(`Failed to create purchase request: ${error.message || 'Unknown error'}`)
    }
  }

  const handleAddSupplier = async () => {
    try {
      await supplierService.create({
        name: newSupplier.name,
        contact: newSupplier.contact,
        email: newSupplier.email,
        rating: newSupplier.rating
      })
      
      // Log supplier addition
      await systemLogService.create({
        action: 'Supplier Added',
        user_id: '44444444-4444-4444-4444-444444444444',
        details: `New supplier added: ${newSupplier.name} (${newSupplier.email}) with rating: ${newSupplier.rating}/5`
      })
      
      await loadProcurementData()
      setNewSupplier({ name: '', contact: '', email: '', rating: 5 })
      setShowAddSupplierForm(false)
      toast.success('Supplier added successfully!')
    } catch (error) {
      console.error('Error adding supplier:', error)
      toast.error('Failed to add supplier')
    }
  }

  const handleTrackDelivery = async (deliveryId: string) => {
    try {
      setLoading(true)
      
      // Update delivery status
      await deliveryReceiptService.updateStatus(deliveryId, 'verified')
      
      // Log delivery tracking
      await systemLogService.create({
        action: 'Delivery Tracked',
        user_id: '44444444-4444-4444-4444-444444444444',
        details: `Delivery tracked and verified: ${deliveryId}`
      })
      
      await loadProcurementData()
      toast.success('Delivery tracked successfully!')
    } catch (error) {
      console.error('Error tracking delivery:', error)
      toast.error('Failed to track delivery')
    } finally {
      setLoading(false)
    }
  }


  const handleGenerateProcurementReport = async () => {
    try {
      // Generate procurement analytics
      const analytics = await analyticsService.getProcurementAnalytics()
      
      // Create report data
      const reportData = {
        totalOrders: purchaseOrders.length,
        totalSpending: purchaseOrders.reduce((sum, order) => sum + order.amount, 0),
        suppliers: suppliers.length,
        analytics: analytics
      }
      
      await systemLogService.create({
        action: 'Procurement Report Generated',
        user_id: '44444444-4444-4444-4444-444444444444',
        details: `Procurement report generated: ${reportData.totalOrders} orders, ₱${(reportData.totalSpending || 0).toLocaleString()} total spending`
      })
      
      toast.success('Procurement report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate procurement report')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await purchaseOrderService.updateStatus(orderId, status)
      await loadProcurementData()
      toast.success(`Order status updated to ${status}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  // Real-time analytics data (replaced static mock data)
  const supplierPerformance = analyticsData.supplierData.map(supplier => ({
    name: supplier.supplier,
    orders: supplier.orders,
    onTime: Math.floor(supplier.orders * 0.9), // Simulate on-time delivery rate
    rating: Math.floor(Math.random() * 10) + 85 // Simulate rating
  }))


  const receivedDeliveries = [
    { id: 1, supplier: 'MedSupply Co.', items: 15, rfid: 'RFID001', receivedAt: '2025-01-15 09:30', status: 'Verified' },
    { id: 2, supplier: 'HealthTech Ltd.', items: 8, rfid: 'RFID002', receivedAt: '2025-01-15 10:15', status: 'Pending Verification' },
    { id: 3, supplier: 'MedEquip Inc.', items: 12, rfid: 'RFID003', receivedAt: '2025-01-15 11:00', status: 'Verified' }
  ]

  const handleRfidScan = async () => {
    if (rfidCode) {
      try {
        setLoading(true)
        
        // Check if RFID exists in inventory
        const inventoryItem = await inventoryService.getByRfid(rfidCode)
        if (inventoryItem) {
          // Log RFID scan
          await systemLogService.create({
            action: 'RFID Scan - Procurement',
            user_id: '44444444-4444-4444-4444-444444444444',
            details: `RFID scanned: ${inventoryItem.item_name} - Quantity: ${inventoryItem.quantity} - Location: ${inventoryItem.location}`
          })
          
          toast.success(`RFID Scanned: ${inventoryItem.item_name} - Quantity: ${inventoryItem.quantity} - Location: ${inventoryItem.location}`)
        } else {
          // Check in purchase orders
          const order = purchaseOrders.find(o => o.rfid_code === rfidCode)
          if (order) {
            toast.success(`RFID Scanned: Order from ${order.supplier} - ₱${(order.amount || 0).toLocaleString()} - Status: ${order.status}`)
          } else {
            toast.error('RFID code not found in system')
          }
        }
      } catch (error) {
        console.error('RFID scan error:', error)
        toast.error('RFID code not found in system')
      } finally {
        setLoading(false)
      }
      setRfidCode('')
    }
  }

  const filteredOrders = combinedOrders.filter(item =>
    item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.displayRfid.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Debug logging
  console.log('🔍 Table Debug:', {
    combinedOrders: combinedOrders.length,
    filteredOrders: filteredOrders.length,
    searchTerm,
    purchaseOrders: purchaseOrders.length,
    purchaseRequests: purchaseRequests.length
  })

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
          <h1 className="text-3xl font-bold text-primary mb-2">Procurement & Sourcing Management</h1>
          <p className="text-gray-600">Manage supply sourcing, supplier info, and procurement tracking with RFID</p>
          <div className="mt-2 space-x-2">
            <button 
              onClick={loadProcurementData}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              🔄 Refresh Data
            </button>
            <button 
              onClick={testDatabaseConnection}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              🧪 Test DB
            </button>
          </div>
        </div>
        <NotificationCenter 
          notifications={notifications}
          onClearNotification={() => {}}
          onClearAll={() => {}}
        />
      </motion.div>

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
              <p className="text-sm font-medium text-gray-600">Total Purchase Orders</p>
              <p className="text-2xl font-bold text-primary">24</p>
              <p className="text-xs text-green-600">+8% from last month</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suppliers Connected</p>
              <p className="text-2xl font-bold text-secondary">12</p>
              <p className="text-xs text-blue-600">Active partnerships</p>
            </div>
            <Package className="w-8 h-8 text-secondary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Pending Delivery</p>
              <p className="text-2xl font-bold text-orange-500">8</p>
              <p className="text-xs text-orange-600">Requires tracking</p>
            </div>
            <Truck className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">RFID Tags Registered</p>
              <p className="text-2xl font-bold text-accent">156</p>
              <p className="text-xs text-green-600">Tracked items</p>
            </div>
            <QrCode className="w-8 h-8 text-accent" />
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
        <h3 className="text-lg font-semibold text-primary mb-4">RFID Delivery Scanner</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scan RFID for Delivery Verification
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
              onClick={() => setShowCreateRequestForm(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Request</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Truck className="w-4 h-4" />
              <span>Track Deliveries</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Supplier Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supplierPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="onTime" fill="#00A896" name="On-Time Deliveries" />
              <Bar dataKey="orders" fill="#1D3557" name="Total Orders" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Spending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Monthly Procurement Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']} />
              <Line type="monotone" dataKey="amount" stroke="#1D3557" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Order Status Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">Order Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.orderStatusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#00A896" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Purchase Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Active Purchase Orders & Requests</h3>
            <button className="btn-primary text-sm">View All</button>
          </div>
          
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders, requests, or IDs..."
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Loading purchase orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No purchase orders or requests found</div>
            ) : (
              filteredOrders.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{item.displayName}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.type === 'order' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type === 'order' ? 'ORDER' : 'REQUEST'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{item.displayItems} items • ₱{(item.displayAmount || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">ID: {item.displayRfid}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      item.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'approved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                      {item.status.toUpperCase()}
                  </span>
                  {item.type === 'order' && (
                    <button 
                      onClick={() => handleUpdateOrderStatus(item.id, 'delivered')}
                      className="p-1 text-gray-400 hover:text-primary"
                      title="Mark as delivered"
                      aria-label="Mark order as delivered"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Received Deliveries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Received Deliveries</h3>
            <button className="btn-primary text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {receivedDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{delivery.supplier}</p>
                  <p className="text-sm text-gray-600">{delivery.items} items • {delivery.receivedAt}</p>
                  <p className="text-xs text-gray-500">RFID: {delivery.rfid}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  delivery.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {delivery.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowCreateRequestForm(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Purchase Request</span>
          </button>
          <button 
            onClick={() => loadProcurementData()}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Truck className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
          <button 
            onClick={() => setShowAddSupplierForm(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <QrCode className="w-5 h-5" />
            <span>Add Supplier</span>
          </button>
          <button 
            onClick={handleGenerateProcurementReport}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Package className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
        </div>
        
        {/* Additional Procurement Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Procurement Management</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                // Track all deliveries
                purchaseOrders.forEach(order => {
                  if (order.status === 'in_transit') {
                    handleTrackDelivery(order.id)
                  }
                })
              }}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              Track All Deliveries
            </button>
            <button 
              onClick={() => {
                // Export procurement data
                const csvData = purchaseOrders.map(order => ({
                  supplier: order.supplier,
                  items: order.items,
                  amount: order.amount,
                  status: order.status,
                  created: order.created_at
                }))
                
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "Supplier,Items,Amount,Status,Created\n" +
                  csvData.map(row => Object.values(row).join(",")).join("\n")
                
                const encodedUri = encodeURI(csvContent)
                const link = document.createElement("a")
                link.setAttribute("href", encodedUri)
                link.setAttribute("download", "procurement_export.csv")
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                toast.success('Procurement data exported!')
              }}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
            >
              Export Data
            </button>
            <button 
              onClick={() => {
                // Supplier performance analysis
                toast.success('Supplier performance analysis generated!')
              }}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600"
            >
              Supplier Analysis
            </button>
          </div>
        </div>
      </motion.div>

      {/* Create Purchase Order Modal */}
      {showCreateOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Create Purchase Order</h3>
              <button
                onClick={() => setShowCreateOrderForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <input
                  type="text"
                  value={newOrder.supplier}
                  onChange={(e) => setNewOrder({...newOrder, supplier: e.target.value})}
                  className="input-field w-full"
                  placeholder="MedSupply Co."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Items</label>
                <input
                  type="number"
                  value={newOrder.items}
                  onChange={(e) => setNewOrder({...newOrder, items: parseInt(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="15"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₱)</label>
                <input
                  type="number"
                  value={newOrder.amount}
                  onChange={(e) => setNewOrder({...newOrder, amount: parseInt(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="45000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Medical supplies for emergency ward..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateOrderForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                className="btn-primary"
              >
                Create Order
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Purchase Request Modal */}
      {showCreateRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Create Purchase Request</h3>
              <button
                onClick={() => setShowCreateRequestForm(false)}
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
                  value={newRequest.item_name}
                  onChange={(e) => setNewRequest({...newRequest, item_name: e.target.value})}
                  className="input-field w-full"
                  placeholder="Medical Supplies"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={newRequest.quantity}
                  onChange={(e) => setNewRequest({...newRequest, quantity: parseInt(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₱)</label>
                <input
                  type="number"
                  value={newRequest.unit_price}
                  onChange={(e) => setNewRequest({...newRequest, unit_price: parseInt(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="1500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                  className="input-field w-full"
                  title="Select priority level"
                  aria-label="Priority level"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Additional details about the request..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateRequestForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequest}
                className="btn-primary"
              >
                Create Request
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Add New Supplier</h3>
              <button
                onClick={() => setShowAddSupplierForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  className="input-field w-full"
                  placeholder="MedSupply Co."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                <input
                  type="text"
                  value={newSupplier.contact}
                  onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                  className="input-field w-full"
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                  className="input-field w-full"
                  placeholder="contact@medsupply.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newSupplier.rating}
                  onChange={(e) => setNewSupplier({...newSupplier, rating: parseInt(e.target.value) || 5})}
                  className="input-field w-full"
                  placeholder="5"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddSupplierForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSupplier}
                className="btn-primary"
              >
                Add Supplier
          </button>
        </div>
      </motion.div>
        </div>
      )}
    </div>
  )
}

export default ProcurementDashboard
