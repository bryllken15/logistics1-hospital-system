// Enhanced Maintenance Dashboard
// Smart Supply Chain & Procurement Management System

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { 
  assetService,
  maintenanceService,
  maintenanceScheduleService,
  workOrderService,
  sparePartsService,
  realtimeService,
  analyticsService,
  systemLogService
} from '../../services/database'
import { enhancedMaintenanceService } from '../../services/enhancedServices'
import { 
  Wrench,
  Search,
  Filter,
  Plus,
  BarChart3,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Wifi,
  QrCode,
  FileText,
  DollarSign,
  Calendar,
  User,
  Settings,
  Truck,
  Beaker,
  ClipboardList,
  Archive,
  Eye,
  Edit,
  Trash,
  X,
  Bell
} from 'lucide-react'
import toast from 'react-hot-toast'

const MaintenanceDashboard = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterCriticality, setFilterCriticality] = useState('all')
  const [activeTab, setActiveTab] = useState<'assets' | 'maintenance' | 'workorders' | 'parts'>('assets')
  
  // Data states
  const [assets, setAssets] = useState<any[]>([])
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([])
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [spareParts, setSpareParts] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false)
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false)
  const [showSparePartForm, setShowSparePartForm] = useState(false)
  const [showPartsForm, setShowPartsForm] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [predictiveAlerts, setPredictiveAlerts] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  
  // Form states
  const [newAsset, setNewAsset] = useState({
    name: '',
    asset_type: '',
    serial_number: '',
    manufacturer: '',
    model: '',
    purchase_date: '',
    purchase_cost: 0,
    warranty_expiry: '',
    assigned_to: '',
    department: '',
    criticality: 'medium' as const,
    location: '',
    notes: ''
  })
  
  const [newMaintenance, setNewMaintenance] = useState({
    asset_id: '',
    maintenance_type: '',
    description: '',
    status: 'pending' as string,
    priority: 'medium' as string,
    assigned_to: '',
    scheduled_date: '',
    estimated_cost: 0,
    notes: ''
  })
  
  const [newWorkOrder, setNewWorkOrder] = useState({
    asset_id: '',
    title: '',
    description: '',
    priority: 'medium' as string,
    assigned_to: '',
    scheduled_date: '',
    estimated_cost: 0,
    estimated_hours: 0,
    notes: ''
  })
  
  const [newPart, setNewPart] = useState({
    part_name: '',
    part_number: '',
    category: '',
    stock_quantity: 0,
    min_stock_level: 5,
    unit_price: 0,
    supplier: '',
    location: '',
    compatible_assets: [] as string[]
  })

  // Available options
  const assetTypes = ['Equipment', 'Vehicle', 'Tool', 'Computer', 'Furniture', 'Machinery', 'Other']
  const criticalityLevels = ['critical', 'high', 'medium', 'low']
  const priorityLevels = ['critical', 'high', 'medium', 'low']
  const maintenanceTypes = ['Preventive', 'Corrective', 'Emergency', 'Inspection', 'Calibration', 'Repair']
  const workOrderStatuses = ['open', 'in_progress', 'on_hold', 'completed', 'cancelled']

  useEffect(() => {
    loadAllData()
  }, [])

  // Set up realtime subscriptions
  useEffect(() => {
    // Subscribe to real-time changes
    const assetSub = realtimeService.subscribeToAssets((payload) => {
      console.log('Asset change:', payload)
    loadAssets()
  })

    const maintenanceSub = realtimeService.subscribeToMaintenanceLogs((payload) => {
      console.log('Maintenance change:', payload)
    loadMaintenanceLogs()
  })

    const scheduleSub = realtimeService.subscribeToMaintenanceSchedule((payload) => {
      console.log('Schedule change:', payload)
      loadMaintenanceLogs() // Refresh main data
    })
    
    const workOrderSub = realtimeService.subscribeToWorkOrders((payload) => {
      console.log('Work order change:', payload)
    loadWorkOrders()
  })
    
    setSubscriptions([assetSub, maintenanceSub, scheduleSub, workOrderSub])
    
    return () => {
      subscriptions.forEach(sub => realtimeService.unsubscribe(sub))
    }
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered: any[] = []
    
    switch (activeTab) {
      case 'assets':
        filtered = assets
        if (searchTerm) {
          filtered = filtered.filter(asset => 
            (asset.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.serial_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        if (filterCriticality !== 'all') {
          filtered = filtered.filter(asset => asset.criticality === filterCriticality)
        }
        break
      case 'maintenance':
        filtered = maintenanceLogs
        if (searchTerm) {
          filtered = filtered.filter(log => 
            (log.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.work_order_number || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        if (filterStatus !== 'all') {
          filtered = filtered.filter(log => log.status === filterStatus)
        }
        if (filterPriority !== 'all') {
          filtered = filtered.filter(log => log.priority === filterPriority)
        }
        break
      case 'workorders':
        filtered = workOrders
        if (searchTerm) {
          filtered = filtered.filter(wo => 
            (wo.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (wo.description || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        if (filterStatus !== 'all') {
          filtered = filtered.filter(wo => wo.status === filterStatus)
        }
        if (filterPriority !== 'all') {
          filtered = filtered.filter(wo => wo.priority === filterPriority)
        }
        break
      case 'parts':
        filtered = spareParts
        if (searchTerm) {
          filtered = filtered.filter(part => 
            (part.part_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (part.part_number || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        break
    }
    
    setFilteredData(filtered)
  }, [activeTab, assets, maintenanceLogs, workOrders, spareParts, searchTerm, filterStatus, filterPriority, filterCriticality])

  const loadAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadAssets(),
        loadMaintenanceLogs(),
        loadWorkOrders(),
        loadSpareParts(),
        loadStats(),
        loadPredictiveAlerts()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load maintenance data')
    } finally {
      setLoading(false)
    }
  }

  const loadAssets = async () => {
    try {
      console.log('🔄 Loading assets...')
      const data = await assetService.getAll()
      console.log('✅ Assets loaded:', data?.length || 0)
      setAssets(data || [])
    } catch (error) {
      console.error('❌ Error loading assets:', error)
      toast.error('Failed to load assets')
      setAssets([])
    }
  }

  const loadMaintenanceLogs = async () => {
    try {
      console.log('🔄 Loading maintenance logs...')
      const data = await maintenanceService.getAll()
      console.log('✅ Maintenance logs loaded:', data?.length || 0)
      setMaintenanceLogs(data || [])
    } catch (error) {
      console.error('❌ Error loading maintenance logs:', error)
      toast.error('Failed to load maintenance logs')
      setMaintenanceLogs([])
    }
  }

  const loadWorkOrders = async () => {
    try {
      console.log('🔄 Loading work orders...')
      const data = await workOrderService.getAll()
      console.log('✅ Work orders loaded:', data?.length || 0)
      setWorkOrders(data || [])
    } catch (error) {
      console.error('❌ Error loading work orders:', error)
      toast.error('Failed to load work orders')
      setWorkOrders([])
    }
  }

  const loadSpareParts = async () => {
    try {
      console.log('🔄 Loading spare parts...')
      const data = await sparePartsService.getAll()
      console.log('✅ Spare parts loaded:', data?.length || 0)
      setSpareParts(data || [])
    } catch (error) {
      console.error('❌ Error loading spare parts:', error)
      toast.error('Failed to load spare parts')
      setSpareParts([])
    }
  }

  const loadStats = async () => {
    try {
      console.log('🔄 Loading maintenance statistics...')
      // Use enhanced service for real-time database stats
      const stats = await enhancedMaintenanceService.getStats()
      console.log('✅ Maintenance statistics loaded:', stats)
      setStats(stats)
    } catch (error) {
      console.error('❌ Error loading statistics:', error)
      // Fallback to basic stats if enhanced service fails
      const fallbackStats = {
        totalAssets: (assets || []).length,
        assetsNeedingMaintenance: 0,
        overdueMaintenance: 0,
        completedThisMonth: (maintenanceLogs || []).filter(m => m.status === 'completed').length,
        totalMaintenanceCost: 0,
        averageDowntime: 0,
        byPriority: {},
        byStatus: {},
        criticalAssets: 0,
        lowStockParts: 0
      }
      setStats(fallbackStats)
      console.log('Using fallback stats due to error')
    }
  }

  const loadPredictiveAlerts = async () => {
    try {
      console.log('🔄 Loading predictive alerts...')
      // For now, return empty array - predictive alerts not implemented yet
      console.log('✅ Predictive alerts loaded: 0')
      setPredictiveAlerts([])
    } catch (error) {
      console.error('❌ Error loading predictive alerts:', error)
      toast.error('Failed to load predictive alerts')
      setPredictiveAlerts([])
    }
  }

  const handleCreateAsset = async () => {
    if (!user) return

    try {
      const assetData = {
        ...newAsset,
        created_by: user.id,
        updated_by: user.id,
        status: 'active' as const,
        operating_hours: 0,
        service_interval_days: 90
      }

      await assetService.create(assetData)
      
      await systemLogService.create({
        action: 'Asset Created',
        user_id: user.id,
        details: `New asset created: ${newAsset.name} (${newAsset.asset_type})`
      })

      // Reload data to show the new asset
      await loadAssets()
      await loadStats()

      setNewAsset({
        name: '',
        asset_type: '',
        serial_number: '',
        manufacturer: '',
        model: '',
        purchase_date: '',
        purchase_cost: 0,
        warranty_expiry: '',
        assigned_to: '',
        department: '',
        criticality: 'medium',
        location: '',
        notes: ''
      })
      setShowAssetForm(false)
      toast.success('Asset created successfully!')
    } catch (error) {
      console.error('Error creating asset:', error)
      toast.error('Failed to create asset')
    }
  }

  const handleCreateMaintenance = async () => {
    if (!user) return

    try {
      const maintenanceData = {
        ...newMaintenance,
        created_by: user.id,
        updated_by: user.id,
        status: 'scheduled' as const
      }

      await maintenanceService.create(maintenanceData)
      
      await systemLogService.create({
        action: 'Maintenance Scheduled',
        user_id: user.id,
        details: `Maintenance scheduled: ${newMaintenance.maintenance_type} for asset ${newMaintenance.asset_id}`
      })

      // Reload data to show the new maintenance log
      await loadMaintenanceLogs()
      await loadStats()

      setNewMaintenance({
        asset_id: '',
        maintenance_type: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assigned_to: '',
        scheduled_date: '',
        estimated_cost: 0,
        notes: ''
      })
      setShowMaintenanceForm(false)
      toast.success('Maintenance scheduled successfully!')
    } catch (error) {
      console.error('Error creating maintenance:', error)
      toast.error('Failed to schedule maintenance')
    }
  }

  const handleCreateWorkOrder = async () => {
    if (!user) return

    try {
      const workOrderData = {
        ...newWorkOrder,
        created_by: user.id,
        updated_by: user.id,
        status: 'open' as const,
        work_order_number: `WO-${Date.now()}`
      }

      await workOrderService.create(workOrderData)
      
      await systemLogService.create({
        action: 'Work Order Created',
        user_id: user.id,
        details: `Work order created: ${workOrderData.title}`
      })

      // Reload data to show the new work order
      await loadWorkOrders()
      await loadStats()

      setNewWorkOrder({
        asset_id: '',
        title: '',
        description: '',
        priority: 'medium',
        assigned_to: '',
        scheduled_date: '',
        estimated_cost: 0,
        estimated_hours: 0,
        notes: ''
      })
      setShowWorkOrderForm(false)
      toast.success('Work order created successfully!')
    } catch (error) {
      console.error('Error creating work order:', error)
      toast.error('Failed to create work order')
    }
  }

  const handleCreatePart = async () => {
    if (!user) return

    try {
      const partData = {
        ...newPart,
        created_by: user.id,
        updated_by: user.id
      }

      await sparePartsService.create(partData)
      
      await systemLogService.create({
        action: 'Spare Part Added',
        user_id: user.id,
        details: `Spare part added: ${newPart.part_name} (${newPart.part_number})`
      })

      setNewPart({
        part_name: '',
        part_number: '',
        category: '',
        stock_quantity: 0,
        min_stock_level: 5,
        unit_price: 0,
        supplier: '',
        location: '',
        compatible_assets: []
      })
      setShowPartsForm(false)
      toast.success('Spare part added successfully!')
    } catch (error) {
      console.error('Error creating spare part:', error)
      toast.error('Failed to add spare part')
    }
  }

  const handleCreateSparePart = async () => {
    if (!user) return

    try {
      const partData = {
        ...newPart,
        created_by: user.id,
        updated_by: user.id
      }

      await sparePartsService.create(partData)
      
      await systemLogService.create({
        action: 'Spare Part Added',
        user_id: user.id,
        details: `Spare part added: ${newPart.part_name} (${newPart.part_number})`
      })

      // Reload data to show the new spare part
      await loadSpareParts()
      await loadStats()

      setNewPart({
        part_name: '',
        part_number: '',
        category: '',
        stock_quantity: 0,
        min_stock_level: 5,
        unit_price: 0,
        supplier: '',
        location: '',
        compatible_assets: []
      })
      setShowSparePartForm(false)
      toast.success('Spare part added successfully!')
    } catch (error) {
      console.error('Error creating spare part:', error)
      toast.error('Failed to create spare part')
    }
  }

  const handleQRCode = async (asset: any) => {
    try {
      // For now, just create a mock QR code data
      const qrData = {
        qr_code_url: `data:image/svg+xml;base64,${btoa(`
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white"/>
            <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
              QR Code for ${asset.name}
            </text>
          </svg>
        `)}`
      }
      setSelectedAsset({ ...asset, ...qrData })
      setShowQRModal(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code')
    }
  }

  const handleAnalytics = async (asset: any) => {
    try {
      // For now, just create mock analytics data
      const analytics = {
        totalMaintenance: 5,
        lastMaintenance: '2024-01-15',
        nextMaintenance: '2024-04-15',
        totalCost: 1500,
        efficiency: 85
      }
      setSelectedAsset({ ...asset, analytics })
      setShowAnalyticsModal(true)
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics')
    }
  }

  const handleEditAsset = async (asset: any) => {
    // Pre-fill the form with the asset data
    setNewAsset({
      name: asset.name || '',
      asset_type: asset.asset_type || '',
      serial_number: asset.serial_number || '',
      manufacturer: asset.manufacturer || '',
      model: asset.model || '',
      purchase_date: asset.purchase_date || '',
      purchase_cost: asset.purchase_cost || 0,
      warranty_expiry: asset.warranty_expiry || '',
      assigned_to: asset.assigned_to || '',
      department: asset.department || '',
      criticality: asset.criticality || 'medium',
      location: asset.location || '',
      notes: asset.notes || ''
    })
    setSelectedAsset(asset)
    setShowAssetForm(true)
  }

  const handleViewAsset = async (asset: any) => {
    setSelectedAsset(asset)
    // We'll show analytics modal as a view modal for now
    setShowAnalyticsModal(true)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'green',
      'inactive': 'gray',
      'maintenance': 'yellow',
      'retired': 'red',
      'disposed': 'red',
      'scheduled': 'blue',
      'in_progress': 'yellow',
      'completed': 'green',
      'cancelled': 'red',
      'overdue': 'red',
      'open': 'blue',
      'on_hold': 'yellow'
    }
    return colors[status] || 'gray'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'critical': 'red',
      'high': 'orange',
      'medium': 'yellow',
      'low': 'green'
    }
    return colors[priority] || 'gray'
  }

  const getCriticalityColor = (criticality: string) => {
    const colors: Record<string, string> = {
      'critical': 'red',
      'high': 'orange',
      'medium': 'yellow',
      'low': 'green'
    }
    return colors[criticality] || 'gray'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Management</h1>
          <p className="text-gray-600">Manage assets, maintenance, and spare parts</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Wifi className={`w-5 h-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Predictive Alerts */}
      {(predictiveAlerts || []).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              Predictive Maintenance Alerts ({(predictiveAlerts || []).length})
            </h3>
          </div>
          <div className="mt-2 space-y-2">
            {(predictiveAlerts || []).slice(0, 3).map((alert) => (
              <div key={alert.asset_id} className="text-sm text-red-700">
                <strong>{alert.asset_name}</strong> - {alert.maintenance_type} due {alert.predicted_failure_date}
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  alert.urgency === 'high' ? 'bg-red-200 text-red-800' :
                  alert.urgency === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-green-200 text-green-800'
                }`}>
                  {(alert.urgency || 'unknown').toUpperCase()}
                </span>
              </div>
            ))}
            {(predictiveAlerts || []).length > 3 && (
              <div className="text-sm text-red-600">
                +{(predictiveAlerts || []).length - 3} more alerts
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Wrench className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalAssets || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Needs Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.assetsNeedingMaintenance || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completedThisMonth || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">₱{(stats?.totalMaintenanceCost || 0).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'assets', label: 'Assets', icon: Wrench },
              { id: 'maintenance', label: 'Maintenance', icon: Settings },
              { id: 'workorders', label: 'Work Orders', icon: ClipboardList },
              { id: 'parts', label: 'Spare Parts', icon: Beaker }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Filters and Search */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              {activeTab !== 'parts' && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Filter by status"
                >
                  <option value="all">All Statuses</option>
                  {activeTab === 'assets' ? (
                    <>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="retired">Retired</option>
                    </>
                  ) : (
                    <>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="overdue">Overdue</option>
                    </>
                  )}
                </select>
              )}

              {/* Priority Filter */}
              {activeTab !== 'assets' && activeTab !== 'parts' && (
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Filter by priority"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              )}

              {/* Criticality Filter for Assets */}
              {activeTab === 'assets' && (
                <select
                  value={filterCriticality}
                  onChange={(e) => setFilterCriticality(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Filter by criticality"
                >
                  <option value="all">All Criticality</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              )}

              {/* Add Button */}
              <button
                onClick={() => {
                  switch (activeTab) {
                    case 'assets': setShowAssetForm(true); break
                    case 'maintenance': setShowMaintenanceForm(true); break
                    case 'workorders': setShowWorkOrderForm(true); break
                    case 'parts': setShowSparePartForm(true); break
                  }
                }}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add {activeTab === 'assets' ? 'Asset' : activeTab === 'maintenance' ? 'Maintenance' : activeTab === 'workorders' ? 'Work Order' : 'Part'}
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'assets' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criticality</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Maintenance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                  {activeTab === 'maintenance' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                  {activeTab === 'workorders' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                  {activeTab === 'parts' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredData || []).map((item, index) => (
                  <motion.tr
                    key={item.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    {activeTab === 'assets' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Wrench className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.serial_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.asset_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(item.status)}-100 text-${getStatusColor(item.status)}-800`}>
                            {(item.status || 'unknown').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getCriticalityColor(item.criticality)}-100 text-${getCriticalityColor(item.criticality)}-800`}>
                            {(item.criticality || 'unknown').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.next_maintenance ? new Date(item.next_maintenance).toLocaleDateString() : 'Not scheduled'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleQRCode(item)}
                              className="text-blue-600 hover:text-blue-900"
                              title="QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAnalytics(item)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Analytics"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditAsset(item)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleViewAsset(item)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'maintenance' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.asset_name || item.assets?.name || 'Unknown Asset'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.maintenance_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(item.status)}-100 text-${getStatusColor(item.status)}-800`}>
                            {(item.status || 'unknown').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getPriorityColor(item.priority)}-100 text-${getPriorityColor(item.priority)}-800`}>
                            {(item.priority || 'unknown').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => console.log('View maintenance:', item)}
                              className="text-blue-600 hover:text-blue-900" 
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => console.log('Edit maintenance:', item)}
                              className="text-green-600 hover:text-green-900" 
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'workorders' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500">{item.work_order_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.asset_name || item.assets?.name || 'Unknown Asset'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(item.status)}-100 text-${getStatusColor(item.status)}-800`}>
                            {(item.status || 'unknown').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getPriorityColor(item.priority)}-100 text-${getPriorityColor(item.priority)}-800`}>
                            {(item.priority || 'unknown').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.assigned_user?.full_name || 'Unassigned'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => console.log('View work order:', item)}
                              className="text-blue-600 hover:text-blue-900" 
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => console.log('Edit work order:', item)}
                              className="text-green-600 hover:text-green-900" 
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'parts' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.part_name}</div>
                          <div className="text-sm text-gray-500">{item.supplier}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.part_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.stock_quantity || 0}</div>
                          {(item.stock_quantity || 0) <= (item.min_stock_level || 0) && (
                            <div className="text-xs text-red-600">Low stock!</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{(item.unit_price || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => console.log('View spare part:', item)}
                              className="text-blue-600 hover:text-blue-900" 
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => console.log('Edit spare part:', item)}
                              className="text-green-600 hover:text-green-900" 
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Asset Form Modal */}
      {showAssetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Asset</h3>
              <button
                onClick={() => setShowAssetForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                <select
                  value={newAsset.asset_type}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, asset_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select asset type"
                >
                  <option value="">Select type...</option>
                  {assetTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                <input
                  type="text"
                  value={newAsset.serial_number}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, serial_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                <input
                  type="text"
                  value={newAsset.manufacturer}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, manufacturer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  value={newAsset.model}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                <input
                  type="date"
                  value={newAsset.purchase_date}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, purchase_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Cost</label>
                <input
                  type="number"
                  value={newAsset.purchase_cost}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, purchase_cost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Expiry</label>
                <input
                  type="date"
                  value={newAsset.warranty_expiry}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, warranty_expiry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={newAsset.department}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Criticality</label>
                <select
                  value={newAsset.criticality}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, criticality: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select criticality level"
                >
                  {criticalityLevels.map(level => (
                    <option key={level} value={level}>{level.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newAsset.notes}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAssetForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAsset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Asset
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Asset QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 p-8 rounded-lg mb-4">
                <QrCode className="w-24 h-24 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600 mt-2">QR Code would be generated here</p>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Asset:</strong> {selectedAsset.name}</p>
                <p><strong>Serial:</strong> {selectedAsset.serial_number}</p>
                <p><strong>Location:</strong> {selectedAsset.location}</p>
                <p><strong>Status:</strong> {selectedAsset.status}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Asset Analytics</h3>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Analytics for: <strong>{selectedAsset.name}</strong>
              </p>
              <div className="bg-gray-100 p-8 rounded-lg">
                <BarChart3 className="w-24 h-24 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600 mt-2">Analytics charts would be displayed here</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Maintenance Form Modal */}
      {showMaintenanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Maintenance Record</h3>
              <button
                onClick={() => setShowMaintenanceForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                <select
                  value={newMaintenance.asset_id}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, asset_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select asset"
                >
                  <option value="">Select Asset</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Type</label>
                <select
                  value={newMaintenance.maintenance_type}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, maintenance_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select maintenance type"
                >
                  <option value="">Select Type</option>
                  {maintenanceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newMaintenance.status}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select status"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newMaintenance.priority}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select priority"
                >
                  {priorityLevels.map(level => (
                    <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newMaintenance.description}
                onChange={(e) => setNewMaintenance(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter maintenance description"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowMaintenanceForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMaintenance}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Maintenance
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Work Order Form Modal */}
      {showWorkOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Work Order</h3>
              <button
                onClick={() => setShowWorkOrderForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                <select
                  value={newWorkOrder.asset_id}
                  onChange={(e) => setNewWorkOrder(prev => ({ ...prev, asset_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select asset"
                >
                  <option value="">Select Asset</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newWorkOrder.priority}
                  onChange={(e) => setNewWorkOrder(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select priority"
                >
                  {priorityLevels.map(level => (
                    <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newWorkOrder.title}
                onChange={(e) => setNewWorkOrder(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter work order title"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newWorkOrder.description}
                onChange={(e) => setNewWorkOrder(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter work order description"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowWorkOrderForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Work Order
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Spare Parts Form Modal */}
      {showSparePartForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Spare Part</h3>
              <button
                onClick={() => setShowSparePartForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Part Name</label>
                <input
                  type="text"
                  value={newPart.part_name}
                  onChange={(e) => setNewPart(prev => ({ ...prev, part_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter part name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
                <input
                  type="text"
                  value={newPart.part_number}
                  onChange={(e) => setNewPart(prev => ({ ...prev, part_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter part number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={newPart.category}
                  onChange={(e) => setNewPart(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={newPart.stock_quantity || 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    console.log('Setting stock quantity to:', value);
                    setNewPart(prev => ({ ...prev, stock_quantity: value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₱)</label>
                <input
                  type="number"
                  value={newPart.unit_price || 0}
                  onChange={(e) => setNewPart(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newPart.location}
                  onChange={(e) => setNewPart(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSparePartForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSparePart}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Spare Part
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceDashboard
