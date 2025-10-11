import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Truck, Package, Plus, Search, QrCode, CheckCircle, X, Edit3, FileText, Clock, Eye, Trash2, Calendar, Star, MapPin, Phone, Mail, User } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { purchaseOrderService, supplierService, systemLogService, purchaseRequestService, deliveryReceiptService, inventoryService, analyticsService, procurementApprovalService, realtimeService } from '../../services/database'
import { supabase } from '../../lib/supabase'
import { usePurchaseOrderUpdates, usePurchaseRequestUpdates, useSupplierUpdates, useDeliveryReceiptUpdates } from '../../hooks/useRealtimeUpdates'
import NotificationCenter from '../NotificationCenter'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const ProcurementDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [rfidCode, setRfidCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([])
  const [deliveryReceipts, setDeliveryReceipts] = useState<any[]>([])
  const [myProcurementRequests, setMyProcurementRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [orderLoading, setOrderLoading] = useState(false)
  const [supplierLoading, setSupplierLoading] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const [showCreateOrderForm, setShowCreateOrderForm] = useState(false)
  const [showCreateRequestForm, setShowCreateRequestForm] = useState(false)
  const [showAddSupplierForm, setShowAddSupplierForm] = useState(false)
  const [showSupplierDetailsModal, setShowSupplierDetailsModal] = useState(false)
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false)
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false)
  const [showEditOrderModal, setShowEditOrderModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [newOrder, setNewOrder] = useState({
    supplier: '',
    items: 0,
    amount: 0,
    description: '',
    priority: 'medium',
    expectedDelivery: ''
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
  const [subscriptions, setSubscriptions] = useState<any[]>([])

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
          displayName: update.new.supplier || 'Unknown Supplier',
          displayAmount: update.new.amount || 0,
          displayItems: update.new.items || 0,
          displayRfid: update.new.rfid_code || 'N/A'
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
          displayName: update.new.supplier || 'Unknown Supplier',
          displayAmount: update.new.amount || 0,
          displayItems: update.new.items || 0,
          displayRfid: update.new.rfid_code || 'N/A'
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
          displayName: update.new.item_name || 'Unknown Item',
          displayAmount: update.new.total_amount || 0,
          displayItems: update.new.quantity || 0,
          displayRfid: `REQ-${update.new.id ? update.new.id.slice(-6) : 'UNKNOWN'}`
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
          displayName: update.new.item_name || 'Unknown Item',
          displayAmount: update.new.total_amount || 0,
          displayItems: update.new.quantity || 0,
          displayRfid: `REQ-${update.new.id ? update.new.id.slice(-6) : 'UNKNOWN'}`
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

  // Additional realtime subscriptions using realtimeService
  useEffect(() => {
    const purchaseOrderSub = realtimeService.subscribeToPurchaseOrders((payload) => {
      console.log('Purchase order realtime change:', payload)
      loadProcurementData()
    })
    
    setSubscriptions([purchaseOrderSub])
    
    return () => {
      subscriptions.forEach(sub => realtimeService.unsubscribe(sub))
    }
  }, [])

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
      
      // Load data with individual error handling
      let orders = []
      let supplierData = []
      let requests = []
      let deliveries = []
      let procurementRequests = []
      
      try {
        orders = await purchaseOrderService.getAll()
        console.log('✅ Purchase orders loaded:', orders?.length || 0)
      } catch (error) {
        console.error('❌ Failed to load purchase orders:', error)
        toast.error('Failed to load purchase orders')
      }
      
      try {
        supplierData = await supplierService.getAll()
        console.log('✅ Suppliers loaded:', supplierData?.length || 0)
      } catch (error) {
        console.error('❌ Failed to load suppliers:', error)
        toast.error('Failed to load suppliers')
      }
      
      try {
        requests = await purchaseRequestService.getAll()
        console.log('✅ Purchase requests loaded:', requests?.length || 0)
      } catch (error) {
        console.error('❌ Failed to load purchase requests:', error)
        toast.error('Failed to load purchase requests')
      }
      
      try {
        deliveries = await deliveryReceiptService.getAll()
        console.log('✅ Delivery receipts loaded:', deliveries?.length || 0)
      } catch (error) {
        console.error('❌ Failed to load delivery receipts:', error)
        toast.error('Failed to load delivery receipts')
      }
      
      if (user?.id) {
        try {
          procurementRequests = await procurementApprovalService.getByUser(user.id)
          console.log('✅ Procurement approvals loaded:', procurementRequests?.length || 0)
        } catch (error) {
          console.error('❌ Failed to load procurement approvals:', error)
          toast.error('Failed to load procurement approvals')
        }
      }
      
      console.log('📊 Loaded data:', {
        orders: orders?.length || 0,
        suppliers: supplierData?.length || 0,
        requests: requests?.length || 0,
        deliveries: deliveries?.length || 0
      })
      
      setPurchaseOrders(orders || [])
      setSuppliers(supplierData || [])
      // Store additional data for use in functions
      setPurchaseRequests(requests || [])
      setDeliveryReceipts(deliveries || [])
      setMyProcurementRequests(procurementRequests || [])
      
      // Create combined data for the table
      const combined = [
        ...(orders || []).map(order => ({
          ...order,
          type: 'order',
          displayName: order.supplier_name || order.supplier || 'Unknown Supplier',
          displayAmount: order.amount || 0,
          displayItems: order.items || 0,
          displayRfid: order.rfid_code || 'N/A',
          supplierInfo: order.suppliers || null
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
      setOrderLoading(true)
      
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
        priority: newOrder.priority || 'medium',
        expected_delivery: newOrder.expectedDelivery,
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
            displayName: newOrderItem.supplier_name || newOrderItem.supplier || 'Unknown Supplier',
            displayAmount: newOrderItem.amount || 0,
            displayItems: newOrderItem.items || 0,
            displayRfid: newOrderItem.rfid_code || 'N/A',
            supplierInfo: newOrderItem.suppliers || null
          },
          ...prev
        ])
        setPurchaseOrders(prev => [newOrderItem, ...prev])
      }
      
      await loadProcurementData()
      setNewOrder({ 
        supplier: '', 
        items: 0, 
        amount: 0, 
        description: '', 
        priority: 'medium',
        expectedDelivery: ''
      })
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
    } finally {
      setOrderLoading(false)
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
        description: newRequest.description || '',
        quantity: newRequest.quantity,
        unit_price: newRequest.unit_price,
        supplier: '', // Can be filled later
        category: 'general',
        priority: newRequest.priority,
        reason: `Procurement request for ${newRequest.item_name}`
      }
      
      console.log('Creating procurement approval request with data:', requestData)
      const result = await procurementApprovalService.createWithApproval(requestData, user?.id || '')
      console.log('Procurement approval request creation result:', result)
      
      // Log request creation
      await systemLogService.create({
        action: 'Procurement Request Created',
        user_id: user?.id || '',
        details: `Procurement request created for ${newRequest.item_name}: ${newRequest.quantity} units, ₱${(newRequest.quantity * newRequest.unit_price).toLocaleString()} - Awaiting approval`
      })
      
      // Update the combined orders immediately with the new request
      if (result && result.length > 0) {
        const newRequestItem = result[0]
        setCombinedOrders(prev => [
          {
            ...newRequestItem,
            type: 'request',
            displayName: newRequestItem.item_name || 'Unknown Item',
            displayAmount: newRequestItem.total_value || 0,
            displayItems: newRequestItem.quantity || 0,
            displayRfid: `REQ-${newRequestItem.id ? newRequestItem.id.slice(-6) : 'UNKNOWN'}`
          },
          ...prev
        ])
        setMyProcurementRequests(prev => [newRequestItem, ...prev])
      }
      
      await loadProcurementData()
      setNewRequest({ item_name: '', quantity: 0, unit_price: 0, total_amount: 0, description: '', priority: 'medium' })
      setShowCreateRequestForm(false)
      toast.success('Procurement request submitted for approval!')
      
      // Debug: Check if the request was added to the state
      setTimeout(() => {
        console.log('Current procurement requests after creation:', myProcurementRequests)
        console.log('Analytics data after creation:', analyticsData)
      }, 1000)
    } catch (error) {
      console.error('Error creating procurement request:', error)
      toast.error(`Failed to create procurement request: ${error.message || 'Unknown error'}`)
    }
  }

  const handleAddSupplier = async () => {
    // Validate required fields
    if (!newSupplier.name.trim()) {
      toast.error('Please enter supplier name')
      return
    }
    if (!newSupplier.contact.trim()) {
      toast.error('Please enter contact person')
      return
    }
    if (!newSupplier.email.trim()) {
      toast.error('Please enter email address')
      return
    }
    if (!newSupplier.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      console.log('🔄 Adding supplier:', newSupplier)
      
      const supplierData = {
        name: newSupplier.name.trim(),
        contact: newSupplier.contact.trim(),
        email: newSupplier.email.trim(),
        rating: newSupplier.rating || 5
      }
      
      const result = await supplierService.create(supplierData)
      console.log('✅ Supplier created:', result)
      
      // Log supplier addition
      try {
        await systemLogService.create({
          action: 'Supplier Added',
          user_id: '44444444-4444-4444-4444-444444444444',
          details: `New supplier added: ${newSupplier.name} (${newSupplier.email}) with rating: ${newSupplier.rating}/5`
        })
      } catch (logError) {
        console.warn('Failed to log supplier addition:', logError)
      }
      
      // Refresh suppliers specifically
      const updatedSuppliers = await supplierService.getAll()
      setSuppliers(updatedSuppliers || [])
      
      // Also refresh all data
      await loadProcurementData()
      setNewSupplier({ name: '', contact: '', email: '', rating: 5 })
      setShowAddSupplierForm(false)
      toast.success('Supplier added successfully!')
    } catch (error) {
      console.error('❌ Error adding supplier:', error)
      toast.error(`Failed to add supplier: ${error.message || 'Unknown error'}`)
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
      
      // Refresh orders specifically
      const updatedOrders = await purchaseOrderService.getAll()
      setPurchaseOrders(updatedOrders || [])
      
      await loadProcurementData()
      toast.success(`Order status updated to ${status}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  // Handle approved requests from ManagerDashboard
  const handleApprovedRequestFromManager = async (requestId: string, requestType: 'order' | 'request') => {
    try {
      if (requestType === 'order') {
        // Update order status to approved and ready for procurement
        await purchaseOrderService.updateStatus(requestId, 'approved')
        toast.success('Purchase order approved by manager - ready for procurement processing')
      } else {
        // Update request status to approved
        await purchaseRequestService.approve(requestId, '44444444-4444-4444-4444-444444444444')
        toast.success('Purchase request approved by manager - ready for procurement processing')
      }
      
      // Log the approval from manager
      await systemLogService.create({
        action: 'Request Approved by Manager - Procurement Processing',
        user_id: '44444444-4444-4444-4444-444444444444',
        details: `${requestType === 'order' ? 'Purchase order' : 'Purchase request'} ${requestId} approved by manager and ready for procurement processing`
      })
      
      await loadProcurementData()
    } catch (error) {
      console.error('Error processing approved request from manager:', error)
      toast.error('Failed to process approved request')
    }
  }

  // New handler functions for enhanced functionality
  const handleEditSupplier = async () => {
    // Validate required fields
    if (!editingSupplier) {
      toast.error('No supplier selected for editing')
      return
    }
    if (!editingSupplier.name?.trim()) {
      toast.error('Please enter supplier name')
      return
    }
    if (!editingSupplier.contact?.trim()) {
      toast.error('Please enter contact person')
      return
    }
    if (!editingSupplier.email?.trim()) {
      toast.error('Please enter email address')
      return
    }
    if (!editingSupplier.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      console.log('🔄 Updating supplier:', editingSupplier)
      setLoading(true)
      
      const updateData = {
        name: editingSupplier.name.trim(),
        contact: editingSupplier.contact.trim(),
        email: editingSupplier.email.trim(),
        rating: editingSupplier.rating || 5
      }
      
      const result = await supplierService.update(editingSupplier.id, updateData)
      console.log('✅ Supplier updated:', result)
      
      // Refresh suppliers specifically
      const updatedSuppliers = await supplierService.getAll()
      setSuppliers(updatedSuppliers || [])
      
      toast.success('Supplier updated successfully!')
      setShowEditSupplierModal(false)
      setEditingSupplier(null)
      await loadProcurementData()
    } catch (error) {
      console.error('❌ Error updating supplier:', error)
      toast.error(`Failed to update supplier: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSupplier = async (supplierId) => {
    if (!supplierId) {
      toast.error('No supplier ID provided for deletion')
      return
    }

    if (confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      try {
        console.log('🔄 Deleting supplier:', supplierId)
        setLoading(true)
        
        await supplierService.delete(supplierId)
        console.log('✅ Supplier deleted successfully')
        
        // Refresh suppliers specifically
        const updatedSuppliers = await supplierService.getAll()
        setSuppliers(updatedSuppliers || [])
        
        toast.success('Supplier deleted successfully!')
        await loadProcurementData()
      } catch (error) {
        console.error('❌ Error deleting supplier:', error)
        toast.error(`Failed to delete supplier: ${error.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleViewSupplierDetails = (supplier) => {
    setSelectedSupplier(supplier)
    setShowSupplierDetailsModal(true)
  }

  const handleEditSupplierClick = (supplier) => {
    if (!supplier || !supplier.id) {
      toast.error('Invalid supplier data for editing')
      return
    }
    
    console.log('🔄 Opening edit modal for supplier:', supplier)
    
    // Ensure all required fields are present
    const supplierData = {
      id: supplier.id,
      name: supplier.name || '',
      contact: supplier.contact || '',
      email: supplier.email || '',
      rating: supplier.rating || 5,
      phone: supplier.phone || '',
      address: supplier.address || '',
      notes: supplier.notes || ''
    }
    
    setEditingSupplier(supplierData)
    setShowEditSupplierModal(true)
  }

  const handleCloseAddSupplierForm = () => {
    setNewSupplier({ name: '', contact: '', email: '', rating: 5 })
    setShowAddSupplierForm(false)
  }

  const handleCloseEditSupplierModal = () => {
    setEditingSupplier(null)
    setShowEditSupplierModal(false)
  }

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderDetailsModal(true)
  }

  const handleEditOrderClick = (order) => {
    setEditingOrder(order)
    setNewOrder({
      supplier: order.supplier || '',
      items: order.items || 0,
      amount: order.amount || 0,
      description: order.description || '',
      priority: order.priority || 'medium',
      expectedDelivery: order.expected_delivery || ''
    })
    setShowEditOrderModal(true)
  }

  const handleUpdateOrder = async () => {
    if (!editingOrder || !newOrder.supplier || !newOrder.items || !newOrder.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setOrderLoading(true)
      const orderData = {
        supplier: newOrder.supplier,
        supplier_name: newOrder.supplier,
        items: newOrder.items,
        amount: newOrder.amount,
        description: newOrder.description || '',
        priority: newOrder.priority || 'medium',
        expected_delivery: newOrder.expectedDelivery,
        status: editingOrder.status,
        rfid_code: editingOrder.rfid_code
      }
      
      await purchaseOrderService.update(editingOrder.id, orderData)
      
      // Refresh orders specifically
      const updatedOrders = await purchaseOrderService.getAll()
      setPurchaseOrders(updatedOrders || [])
      
      toast.success('Order updated successfully!')
      setShowEditOrderModal(false)
      setEditingOrder(null)
      setNewOrder({ supplier: '', items: 0, amount: 0, description: '', priority: 'medium', expectedDelivery: '' })
      loadProcurementData()
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    } finally {
      setOrderLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        setOrderLoading(true)
        await purchaseOrderService.delete(orderId)
        toast.success('Order deleted successfully!')
        loadProcurementData()
      } catch (error) {
        console.error('Error deleting order:', error)
        toast.error('Failed to delete order')
      } finally {
        setOrderLoading(false)
      }
    }
  }

  const handleTrackDeliveries = async () => {
    try {
      setLoading(true)
      
      // Get all in-transit orders
      const inTransitOrders = purchaseOrders.filter(order => order.status === 'in_transit')
      
      if (inTransitOrders.length === 0) {
        toast.success('No in-transit orders to track')
        return
      }

      // Update delivery receipts for tracking
      for (const order of inTransitOrders) {
        const deliveryData = {
          order_id: order.id,
          supplier_name: order.supplier,
          items_received: order.items,
          delivery_date: new Date().toISOString().split('T')[0],
          status: 'pending',
          rfid_code: order.rfid_code,
          notes: `Auto-generated delivery receipt for order ${order.id}`
        }
        
        await deliveryReceiptService.create(deliveryData)
      }

      toast.success(`Tracking ${inTransitOrders.length} in-transit orders`)
      loadProcurementData()
    } catch (error) {
      console.error('Error tracking deliveries:', error)
      toast.error('Failed to track deliveries')
    } finally {
      setLoading(false)
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
    (item.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.displayRfid?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Procurement Dashboard</h1>
          <p className="text-gray-600">Manage supply sourcing, supplier info, and procurement tracking with RFID</p>
          </div>

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
          <div className="flex items-center space-x-4">
          {(notifications || []).length > 0 && (
            <div className="flex items-center text-blue-600">
              <span className="text-sm font-medium">{(notifications || []).length} new updates</span>
            </div>
          )}
            <button 
              onClick={() => {
                // Test real-time connection
                testDatabaseConnection()
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Test Connection
            </button>
          </div>
        </div>
      </motion.div>

      {/* Procurement Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Procurement Notifications</h3>
          <button 
            onClick={() => {
              // Clear all notifications
              setNotifications([])
              toast.success('Notifications cleared!')
            }}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
                <p className="text-sm font-medium text-green-800">Approved Requests</p>
                <p className="text-lg font-bold text-green-600">
                  {myProcurementRequests.filter(req => req.status === 'approved').length}
                </p>
            </div>
          </div>
        </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Edit3 className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
                <p className="text-sm font-medium text-yellow-800">Pending Approval</p>
                <p className="text-lg font-bold text-yellow-600">
                  {myProcurementRequests.filter(req => req.status === 'pending').length}
                </p>
            </div>
          </div>
        </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Truck className="w-5 h-5 text-blue-600 mr-2" />
            <div>
                <p className="text-sm font-medium text-blue-800">In Transit</p>
                <p className="text-lg font-bold text-blue-600">
                  {purchaseOrders.filter(order => order.status === 'in_transit').length}
                </p>
            </div>
          </div>
        </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Purchase Orders</p>
              <p className="text-2xl font-bold text-gray-900">{purchaseOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suppliers Connected</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Truck className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Delivery</p>
              <p className="text-2xl font-bold text-gray-900">
                {purchaseOrders.filter(order => order.status === 'in_transit' || order.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <QrCode className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Requests</p>
              <p className="text-2xl font-bold text-gray-900">{myProcurementRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
              <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Requests
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'suppliers'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Suppliers
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Analytics
              </button>
            </div>

          <div className="flex space-x-2">
            <button 
              onClick={() => setShowCreateRequestForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
            <Plus className="w-4 h-4 mr-2" />
            New Request
            </button>
          <button
            onClick={() => setShowCreateOrderForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
            </button>
          </div>
        </div>

      {/* Content */}
      {activeTab === 'overview' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Purchase Orders</h3>
            </div>
            <div className="p-6">
              {purchaseOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{order.supplier}</p>
                      <p className="text-sm text-gray-600">₱{(order.amount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'approved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
              {purchaseOrders.length === 0 && (
                <p className="text-gray-500 text-center py-4">No purchase orders found</p>
              )}
            </div>
      </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
      </div>
            <div className="p-6">
              {myProcurementRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{request.item_name}</p>
                      <p className="text-sm text-gray-600">₱{(request.total_value || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
              ))}
              {myProcurementRequests.length === 0 && (
                <p className="text-gray-500 text-center py-4">No requests found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Orders Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Purchase Orders Management</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowCreateOrderForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                  </button>
                  <button 
                    onClick={() => {
                      loadProcurementData()
                      toast.success('Orders data refreshed!')
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
          </div>
          
            {/* Search and Filter */}
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search orders by supplier, amount, or status..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
            </div>
          </div>

            <div className="p-6">
              <div className="space-y-4">
            {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading purchase orders...</p>
                  </div>
            ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No purchase orders found</p>
                    <p className="text-gray-400 text-sm">Create your first order to get started</p>
                    <button 
                      onClick={() => setShowCreateOrderForm(true)}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Create Order
                    </button>
                  </div>
            ) : (
              filteredOrders.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="text-lg font-semibold text-gray-900">{item.displayName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.type === 'order' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                              {item.type === 'order' ? 'PURCHASE ORDER' : 'REQUEST'}
                    </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      item.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'approved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                      {item.status.toUpperCase()}
                  </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Items:</span> {item.displayItems}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Amount:</span> ₱{(item.displayAmount || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">RFID:</span> {item.displayRfid}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Created:</span> {new Date(item.created_at || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Priority:</span> 
                                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                  item.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {item.priority || 'medium'}
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Order Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>Order Progress</span>
                              <span>{Math.round((['pending', 'approved', 'in_transit', 'delivered'].indexOf(item.status) + 1) / 4 * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  item.status === 'delivered' ? 'bg-green-500' :
                                  item.status === 'in_transit' ? 'bg-blue-500' :
                                  item.status === 'approved' ? 'bg-yellow-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ 
                                  width: `${Math.round((['pending', 'approved', 'in_transit', 'delivered'].indexOf(item.status) + 1) / 4 * 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          {item.status === 'pending' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(item.id, 'approved')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve order"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {item.status === 'approved' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(item.id, 'in_transit')}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Mark as in transit"
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                          )}
                          {item.status === 'in_transit' && (
                    <button 
                      onClick={() => handleUpdateOrderStatus(item.id, 'delivered')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Mark as delivered"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                          <button 
                            onClick={() => handleViewOrderDetails(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditOrderClick(item)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="Edit order"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                </div>
              </div>
              ))
            )}
          </div>
            </div>
          </div>
          
          {/* Order Analytics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{purchaseOrders.length}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
          </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {purchaseOrders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {purchaseOrders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  ₱{purchaseOrders.reduce((sum, order) => sum + (order.amount || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">My Procurement Requests</h3>
          </div>
          <div className="p-6">
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Loading your procurement requests...</div>
            ) : myProcurementRequests.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No procurement requests yet. Create one to get started!
              </div>
            ) : (
              myProcurementRequests.map((request) => (
                <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900">{request.item_name}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          request.priority === 'high' ? 'bg-red-100 text-red-800' :
                          request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.priority}
                        </span>
                      </div>

                      {request.description && (
                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Quantity:</span> {request.quantity}
                        </div>
                        <div>
                            <span className="font-medium">Unit Price:</span> ₱{request.unit_price || '0.00'}
                        </div>
                        <div>
                            <span className="font-medium">Total:</span> ₱{request.total_value || '0.00'}
                        </div>
                        <div>
                          <span className="font-medium">Supplier:</span> {request.supplier || 'Not specified'}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Requested: {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1 ml-4">
                      {request.manager_approved && (
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Manager Approved
                        </span>
                      )}
                      {request.project_manager_approved && (
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Project Manager Approved
                        </span>
                      )}
                      {!request.manager_approved && request.status === 'pending' && (
                        <span className="text-xs text-yellow-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                          Awaiting Manager
                        </span>
                      )}
                      {request.manager_approved && !request.project_manager_approved && request.status === 'pending' && (
                        <span className="text-xs text-yellow-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                          Awaiting PM
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          {/* Suppliers Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Suppliers Management</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowAddSupplierForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Supplier
                  </button>
                  <button 
                    onClick={() => {
                      loadProcurementData()
                      toast.success('Suppliers data refreshed!')
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
          </div>
                </div>
            </div>
            
            {/* Search and Filter */}
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search suppliers by name, contact, or email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        const searchTerm = e.target.value.toLowerCase()
                        // Filter suppliers based on search term
                        const filtered = suppliers.filter(supplier => 
                          (supplier.name?.toLowerCase() || '').includes(searchTerm) ||
                          (supplier.contact?.toLowerCase() || '').includes(searchTerm) ||
                          (supplier.email?.toLowerCase() || '').includes(searchTerm)
                        )
                        // You can implement state management for filtered results
                        console.log('Filtered suppliers:', filtered)
                      }}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading suppliers...</p>
                  </div>
                ) : suppliers.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No suppliers found</p>
                    <p className="text-gray-400 text-sm">Add your first supplier to get started</p>
                    <button 
                      onClick={() => setShowAddSupplierForm(true)}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Add Supplier
                    </button>
                  </div>
                ) : (
                  suppliers.map((supplier) => (
                    <div key={supplier.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{supplier.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              supplier.rating >= 4 ? 'bg-green-100 text-green-800' :
                              supplier.rating >= 3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {supplier.rating >= 4 ? 'Excellent' : supplier.rating >= 3 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Contact:</span> {supplier.contact}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Email:</span> {supplier.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Rating:</span> 
                                <div className="flex items-center mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < supplier.rating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                  <span className="ml-2 text-sm text-gray-600">({supplier.rating}/5)</span>
          </div>
                              </p>
                            </div>
      </div>

                          {/* Supplier Performance Stats */}
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-2xl font-bold text-blue-600">
                                {purchaseOrders.filter(order => order.supplier === supplier.name).length}
                              </p>
                              <p className="text-xs text-blue-600">Total Orders</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="text-2xl font-bold text-green-600">
                                ₱{purchaseOrders
                                  .filter(order => order.supplier === supplier.name)
                                  .reduce((sum, order) => sum + (order.amount || 0), 0)
                                  .toLocaleString()}
                              </p>
                              <p className="text-xs text-green-600">Total Value</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-2xl font-bold text-purple-600">
                                {Math.round((purchaseOrders.filter(order => order.supplier === supplier.name && order.status === 'delivered').length / 
                                 Math.max(purchaseOrders.filter(order => order.supplier === supplier.name).length, 1)) * 100)}%
                              </p>
                              <p className="text-xs text-purple-600">Delivery Rate</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <button 
                            onClick={() => handleEditSupplierClick(supplier)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit supplier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
          <button 
                            onClick={() => handleViewSupplierDetails(supplier)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="View details"
          >
                            <Eye className="w-4 h-4" />
          </button>
          <button 
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete supplier"
          >
                            <Trash2 className="w-4 h-4" />
          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Supplier Analytics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Performance Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{suppliers.length}</div>
                <div className="text-sm text-gray-600">Total Suppliers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {suppliers.filter(s => s.rating >= 4).length}
                </div>
                <div className="text-sm text-gray-600">Highly Rated (4+ Stars)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supplier Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Supplier Performance</h3>
          <button 
                  onClick={() => {
                    loadProcurementData()
                    toast.success('Supplier data refreshed!')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Refresh
          </button>
              </div>
              {supplierPerformance.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No supplier data available</p>
                    <p className="text-sm">Create purchase orders to see supplier performance</p>
                  </div>
                </div>
              )}
            </div>

            {/* Monthly Spending */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Procurement Spending</h3>
          <button 
                  onClick={() => {
                    const totalSpending = purchaseOrders.reduce((sum, order) => sum + (order.amount || 0), 0)
                    toast.success(`Total spending: ₱${totalSpending.toLocaleString()}`)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Report
          </button>
              </div>
              {analyticsData.monthlySpending.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']} />
                    <Line type="monotone" dataKey="amount" stroke="#1D3557" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No spending data available</p>
                    <p className="text-sm">Create purchase orders to see spending trends</p>
                  </div>
                </div>
              )}
            </div>
        </div>
        
          {/* Order Status Analytics */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Status Distribution</h3>
              <div className="flex space-x-2">
            <button 
              onClick={() => {
                    const statusBreakdown = analyticsData.orderStatusData.map(item => 
                      `${item.status}: ${item.count}`
                    ).join(', ')
                    toast.success(`Status breakdown: ${statusBreakdown}`)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details
            </button>
            <button 
              onClick={() => {
                    const csvData = analyticsData.orderStatusData.map(item => ({
                      status: item.status,
                      count: item.count
                }))
                
                const csvContent = "data:text/csv;charset=utf-8," + 
                      "Status,Count\n" +
                  csvData.map(row => Object.values(row).join(",")).join("\n")
                
                const encodedUri = encodeURI(csvContent)
                const link = document.createElement("a")
                link.setAttribute("href", encodedUri)
                    link.setAttribute("download", "order_status_export.csv")
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                    toast.success('Order status data exported!')
              }}
                  className="text-sm text-green-600 hover:text-green-800"
            >
                  Export
            </button>
              </div>
            </div>
            {analyticsData.orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00A896" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No order status data available</p>
                  <p className="text-sm">Create orders and requests to see status distribution</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RFID Scanner Section - Only show on overview tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">RFID Delivery Scanner</h3>
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
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            <button 
                  onClick={handleRfidScan}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan</span>
            </button>
          </div>
        </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowCreateRequestForm(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Purchase Request</span>
            </button>
              <button 
                onClick={handleTrackDeliveries}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Truck className="w-4 h-4" />
                <span>Track Deliveries</span>
              </button>
          </div>
        </div>
        </div>
      )}


      {/* Create Purchase Order Modal */}
      {showCreateOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Purchase Order</h3>
              <button
                onClick={() => setShowCreateOrderForm(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <select
                  value={newOrder.supplier}
                  onChange={(e) => setNewOrder({...newOrder, supplier: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.name}>
                      {supplier.name} ({supplier.rating}★)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {suppliers.length === 0 ? 'No suppliers available. Add suppliers first.' : `${suppliers.length} suppliers available`}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Items</label>
                <input
                  type="number"
                  value={newOrder.items}
                  onChange={(e) => setNewOrder({...newOrder, items: parseInt(e.target.value) || 0})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="15"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₱)</label>
                <input
                  type="number"
                  value={newOrder.amount}
                  onChange={(e) => setNewOrder({...newOrder, amount: parseInt(e.target.value) || 0})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="45000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newOrder.priority || 'medium'}
                  onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
                <input
                  type="date"
                  value={newOrder.expectedDelivery || ''}
                  onChange={(e) => setNewOrder({...newOrder, expectedDelivery: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Medical supplies for emergency ward..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateOrderForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={orderLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {orderLoading ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Purchase Request Modal */}
      {showCreateRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Purchase Request</h3>
              <button
                onClick={() => setShowCreateRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
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
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Medical Supplies"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={newRequest.quantity}
                  onChange={(e) => setNewRequest({...newRequest, quantity: parseInt(e.target.value) || 0})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₱)</label>
                <input
                  type="number"
                  value={newRequest.unit_price}
                  onChange={(e) => setNewRequest({...newRequest, unit_price: parseInt(e.target.value) || 0})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional details about the request..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateRequestForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequest}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Supplier</h3>
              <button
                onClick={handleCloseAddSupplierForm}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
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
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MedSupply Co."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                <input
                  type="text"
                  value={newSupplier.contact}
                  onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseAddSupplierForm}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSupplier}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Supplier
          </button>
        </div>
          </div>
        </div>
      )}

      {/* Supplier Details Modal */}
      {showSupplierDetailsModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Supplier Details</h3>
              <button
                onClick={() => setShowSupplierDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Supplier Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedSupplier.name}</h4>
                    <div className="flex items-center space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`w-5 h-5 ${
                            i < selectedSupplier.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-gray-600">({selectedSupplier.rating}/5)</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{selectedSupplier.contact}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{selectedSupplier.email}</span>
                  </div>
                </div>
              </div>

              {/* Supplier Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {purchaseOrders.filter(order => order.supplier === selectedSupplier.name).length}
                  </div>
                  <div className="text-sm text-blue-600">Total Orders</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₱{purchaseOrders
                      .filter(order => order.supplier === selectedSupplier.name)
                      .reduce((sum, order) => sum + (order.amount || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Total Value</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((purchaseOrders.filter(order => order.supplier === selectedSupplier.name && order.status === 'delivered').length / 
                     Math.max(purchaseOrders.filter(order => order.supplier === selectedSupplier.name).length, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-purple-600">Delivery Rate</div>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Recent Orders</h5>
                <div className="space-y-2">
                  {purchaseOrders
                    .filter(order => order.supplier === selectedSupplier.name)
                    .slice(0, 5)
                    .map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">₱{(order.amount || 0).toLocaleString()} • {order.items} items</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'approved' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  {purchaseOrders.filter(order => order.supplier === selectedSupplier.name).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No orders found for this supplier</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSupplierDetailsModal(false)
                  handleEditSupplierClick(selectedSupplier)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit Supplier
              </button>
              <button
                onClick={() => setShowSupplierDetailsModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Order Details</h3>
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-gray-900">Order #{selectedOrder.id?.slice(-8) || 'N/A'}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'approved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedOrder.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Supplier</p>
                    <p className="font-medium text-gray-900">{selectedOrder.supplier || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">RFID Code</p>
                    <p className="font-medium text-gray-900">{selectedOrder.rfid_code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="font-medium text-gray-900">{selectedOrder.items || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-medium text-gray-900">₱{(selectedOrder.amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedOrder.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedOrder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedOrder.priority || 'medium'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Progress */}
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Order Progress</h5>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      selectedOrder.status === 'delivered' ? 'bg-green-500' :
                      selectedOrder.status === 'in_transit' ? 'bg-blue-500' :
                      selectedOrder.status === 'approved' ? 'bg-yellow-500' :
                      'bg-orange-500'
                    }`}
                    style={{ 
                      width: `${Math.round((['pending', 'approved', 'in_transit', 'delivered'].indexOf(selectedOrder.status) + 1) / 4 * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Pending</span>
                  <span>Approved</span>
                  <span>In Transit</span>
                  <span>Delivered</span>
                </div>
              </div>

              {/* Description */}
              {selectedOrder.description && (
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-3">Description</h5>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedOrder.description}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowOrderDetailsModal(false)
                  handleEditOrderClick(selectedOrder)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit Order
              </button>
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditSupplierModal && editingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Supplier</h3>
              <button
                onClick={handleCloseEditSupplierModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
                <input
                  type="text"
                  value={editingSupplier.name}
                  onChange={(e) => setEditingSupplier({...editingSupplier, name: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MedSupply Co."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                <input
                  type="text"
                  value={editingSupplier.contact}
                  onChange={(e) => setEditingSupplier({...editingSupplier, contact: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingSupplier.email}
                  onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@medsupply.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editingSupplier.rating}
                  onChange={(e) => setEditingSupplier({...editingSupplier, rating: parseInt(e.target.value) || 5})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseEditSupplierModal}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSupplier}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Update Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditOrderModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Order</h3>
              <button
                onClick={() => setShowEditOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <select
                  value={newOrder.supplier}
                  onChange={(e) => setNewOrder({...newOrder, supplier: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.name}>
                      {supplier.name} ({supplier.rating}★)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Items</label>
                <input
                  type="number"
                  value={newOrder.items}
                  onChange={(e) => setNewOrder({...newOrder, items: parseInt(e.target.value) || 0})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="15"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₱)</label>
                <input
                  type="number"
                  value={newOrder.amount}
                  onChange={(e) => setNewOrder({...newOrder, amount: parseInt(e.target.value) || 0})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="45000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newOrder.priority || 'medium'}
                  onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
                <input
                  type="date"
                  value={newOrder.expectedDelivery || ''}
                  onChange={(e) => setNewOrder({...newOrder, expectedDelivery: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Medical supplies for emergency ward..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditOrderModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrder}
                disabled={orderLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {orderLoading ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProcurementDashboard
