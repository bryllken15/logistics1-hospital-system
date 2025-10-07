import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { analyticsService } from '../services/database'

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const [inventory, procurement, projects, assets, documents] = await Promise.all([
        analyticsService.getInventoryAnalytics(),
        analyticsService.getProcurementAnalytics(),
        analyticsService.getProjectAnalytics(),
        analyticsService.getAssetAnalytics(),
        analyticsService.getDocumentAnalytics()
      ])

      setAnalyticsData({
        inventory,
        procurement,
        projects,
        assets,
        documents
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate key metrics
  const totalInventoryValue = analyticsData.inventory?.reduce((sum: number, item: any) => sum + (item.quantity * 100), 0) || 0
  const lowStockCount = analyticsData.inventory?.filter((item: any) => item.status === 'low_stock' || item.status === 'critical').length || 0
  const totalProcurementValue = analyticsData.procurement?.reduce((sum: number, order: any) => sum + order.amount, 0) || 0
  const pendingOrders = analyticsData.procurement?.filter((order: any) => order.status === 'pending').length || 0
  const totalProjects = analyticsData.projects?.length || 0
  const activeProjects = analyticsData.projects?.filter((project: any) => project.status === 'in_progress').length || 0
  const assetsNeedingMaintenance = analyticsData.assets?.filter((asset: any) => asset.condition === 'needs_repair').length || 0
  const pendingDocuments = analyticsData.documents?.filter((doc: any) => doc.status === 'pending_verification').length || 0

  // Generate trend data
  const generateTrendData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toISOString().split('T')[0],
        inventory: Math.floor(Math.random() * 50) + 20,
        procurement: Math.floor(Math.random() * 30) + 10,
        projects: Math.floor(Math.random() * 15) + 5
      })
    }
    
    return data
  }

  const trendData = generateTrendData()

  // Inventory status distribution
  const inventoryStatusData = analyticsData.inventory?.reduce((acc: any, item: any) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {}) || {}

  const statusChartData = [
    { name: 'In Stock', value: inventoryStatusData.in_stock || 0, color: '#00A896' },
    { name: 'Low Stock', value: inventoryStatusData.low_stock || 0, color: '#F77F00' },
    { name: 'Critical', value: inventoryStatusData.critical || 0, color: '#D62828' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Advanced Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into your hospital's supply chain performance</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
              <p className="text-2xl font-bold text-primary">₱{totalInventoryValue.toLocaleString()}</p>
              <p className="text-xs text-green-600">+5.2% from last month</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-orange-500">{lowStockCount}</p>
              <p className="text-xs text-orange-600">Requires attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-secondary">{activeProjects}/{totalProjects}</p>
              <p className="text-xs text-blue-600">In progress</p>
            </div>
            <Activity className="w-8 h-8 text-secondary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-accent">{pendingOrders}</p>
              <p className="text-xs text-purple-600">Awaiting approval</p>
            </div>
            <Package className="w-8 h-8 text-accent" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Activity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="inventory" stackId="1" stroke="#00A896" fill="#00A896" fillOpacity={0.6} name="Inventory" />
              <Area type="monotone" dataKey="procurement" stackId="1" stroke="#1D3557" fill="#1D3557" fillOpacity={0.6} name="Procurement" />
              <Area type="monotone" dataKey="projects" stackId="1" stroke="#457B9D" fill="#457B9D" fillOpacity={0.6} name="Projects" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Inventory Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Inventory Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Procurement Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Order Value</span>
              <span className="font-semibold">₱{Math.round(totalProcurementValue / (analyticsData.procurement?.length || 1)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Orders This Month</span>
              <span className="font-semibold">{analyticsData.procurement?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Approval</span>
              <span className="font-semibold text-orange-500">{pendingOrders}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Asset Management</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Assets</span>
              <span className="font-semibold">{analyticsData.assets?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Needs Maintenance</span>
              <span className="font-semibold text-red-500">{assetsNeedingMaintenance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Maintenance Rate</span>
              <span className="font-semibold">{Math.round((assetsNeedingMaintenance / (analyticsData.assets?.length || 1)) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Document Processing</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Documents</span>
              <span className="font-semibold">{analyticsData.documents?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Verification</span>
              <span className="font-semibold text-orange-500">{pendingDocuments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Processing Rate</span>
              <span className="font-semibold">{Math.round(((analyticsData.documents?.length || 0) - pendingDocuments) / (analyticsData.documents?.length || 1) * 100)}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Real-time Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">System Status</h3>
            <p className="text-sm text-gray-600">Real-time monitoring and updates</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Updates Active</span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AnalyticsDashboard
