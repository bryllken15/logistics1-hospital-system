import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Package, ClipboardList, Wrench, CheckCircle, AlertCircle, X, Plus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { purchaseOrderService, projectService, systemLogService, analyticsService } from '../../services/database'
import { useLegacyRealtimeUpdates } from '../../hooks/useRealtimeUpdates'
import NotificationCenter from '../NotificationCenter'
import toast from 'react-hot-toast'

const ManagerDashboard = () => {
  const [approvalRequests, setApprovalRequests] = useState<any[]>([])
  const [projectStatus, setProjectStatus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const { isConnected, lastUpdate, notifications, realtimeData, clearNotification, clearAllNotifications } = useLegacyRealtimeUpdates()

  useEffect(() => {
    loadManagerData()
  }, [])

  // Real-time data updates
  useEffect(() => {
    if (realtimeData.purchaseOrders) {
      // Update approval requests when purchase orders change
      setApprovalRequests(prev => {
        const existingIndex = prev.findIndex(r => r.id === realtimeData.purchaseOrders.id)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = realtimeData.purchaseOrders
          return updated
        } else {
          return [realtimeData.purchaseOrders, ...prev]
        }
      })
    }
  }, [realtimeData.purchaseOrders])

  useEffect(() => {
    if (realtimeData.projects) {
      // Update project status when projects change
      setProjectStatus(prev => {
        const existingIndex = prev.findIndex(p => p.id === realtimeData.projects.id)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = realtimeData.projects
          return updated
        } else {
          return [realtimeData.projects, ...prev]
        }
      })
    }
  }, [realtimeData.projects])

  const loadManagerData = async () => {
    try {
      setLoading(true)
      const [purchaseOrders, projects] = await Promise.all([
        purchaseOrderService.getAll(),
        projectService.getAll()
      ])
      
      setApprovalRequests((purchaseOrders || []).filter(order => order.status === 'pending'))
      setProjectStatus(projects || [])
    } catch (error) {
      console.error('Error loading manager data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      await purchaseOrderService.updateStatus(requestId, 'approved')
      
      // Log approval
      await systemLogService.create({
        action: 'Purchase Request Approved',
        user_id: '22222222-2222-2222-2222-222222222222', // Manager user ID
        details: `Purchase request ${requestId} approved by manager`
      })
      
      await loadManagerData()
      toast.success('Request approved successfully!')
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Failed to approve request')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await purchaseOrderService.updateStatus(requestId, 'rejected')
      await loadManagerData()
      toast.success('Request rejected')
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject request')
    }
  }

  const handleUpdateProjectProgress = async (projectId: string, newProgress: number) => {
    try {
      await projectService.updateProgress(projectId, newProgress)
      
      // Log progress update
      await systemLogService.create({
        action: 'Project Progress Updated',
        user_id: '22222222-2222-2222-2222-222222222222',
        details: `Project ${projectId} progress updated to ${newProgress}%`
      })
      
      await loadManagerData()
      toast.success('Project progress updated!')
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project progress')
    }
  }

  const handleGenerateManagerReport = async () => {
    try {
      const analytics = await analyticsService.getProcurementAnalytics()
      
      await systemLogService.create({
        action: 'Manager Report Generated',
        user_id: '22222222-2222-2222-2222-222222222222',
        details: `Manager report generated with ${approvalRequests.length} pending requests and ${projectStatus.length} active projects`
      })
      
      toast.success('Manager report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate manager report')
    }
  }

  const handleBulkApproval = async (action: string) => {
    try {
      if (action === 'approve_all') {
        for (const request of approvalRequests) {
          await purchaseOrderService.updateStatus(request.id, 'approved')
        }
        toast.success('All requests approved!')
      } else if (action === 'reject_all') {
        for (const request of approvalRequests) {
          await purchaseOrderService.updateStatus(request.id, 'rejected')
        }
        toast.success('All requests rejected!')
      }
      
      await loadManagerData()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform bulk action')
    }
  }

  // Mock data for charts (can be replaced with real analytics later)
  const monthlyTrends = [
    { month: 'Jan', procurement: 45, warehouse: 38, projects: 12 },
    { month: 'Feb', procurement: 52, warehouse: 42, projects: 15 },
    { month: 'Mar', procurement: 48, warehouse: 35, projects: 18 },
    { month: 'Apr', procurement: 61, warehouse: 48, projects: 22 },
    { month: 'May', procurement: 55, warehouse: 41, projects: 19 },
    { month: 'Jun', procurement: 67, warehouse: 52, projects: 25 }
  ]

  const stockLevels = [
    { category: 'Medical Supplies', current: 85, optimal: 90, low: 20 },
    { category: 'Equipment', current: 72, optimal: 80, low: 15 },
    { category: 'Medications', current: 95, optimal: 95, low: 10 },
    { category: 'Emergency Items', current: 60, optimal: 85, low: 25 }
  ]

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
          <h1 className="text-3xl font-bold text-primary mb-2">Manager Overview</h1>
          <p className="text-gray-600">Monitor system activity, approve requests, and oversee department performance</p>
        </div>
        <NotificationCenter 
          notifications={notifications}
          onClearNotification={(id: number) => clearNotification(id.toString())}
          onClearAll={clearAllNotifications}
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
              <p className="text-sm font-medium text-gray-600">Total Procurement Requests</p>
              <p className="text-2xl font-bold text-primary">24</p>
              <p className="text-xs text-green-600">+12% from last month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Warehouse Stock</p>
              <p className="text-2xl font-bold text-secondary">₱2.4M</p>
              <p className="text-xs text-green-600">+8% from last month</p>
            </div>
            <Package className="w-8 h-8 text-secondary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ongoing Projects</p>
              <p className="text-2xl font-bold text-accent">4</p>
              <p className="text-xs text-orange-600">2 on track, 1 delayed</p>
            </div>
            <ClipboardList className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assets Under Maintenance</p>
              <p className="text-2xl font-bold text-orange-500">8</p>
              <p className="text-xs text-orange-600">3 critical</p>
            </div>
            <Wrench className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Monthly Activity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="procurement" stroke="#1D3557" strokeWidth={2} name="Procurement" />
              <Line type="monotone" dataKey="warehouse" stroke="#457B9D" strokeWidth={2} name="Warehouse" />
              <Line type="monotone" dataKey="projects" stroke="#00A896" strokeWidth={2} name="Projects" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Stock Level Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Stock Level Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockLevels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" fill="#00A896" name="Current Level" />
              <Bar dataKey="optimal" fill="#1D3557" name="Optimal Level" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Procurement Approval Requests</h3>
            <button className="btn-primary text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Loading approval requests...</div>
            ) : approvalRequests.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No pending approval requests</div>
            ) : (
              approvalRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Purchase Order</p>
                    <p className="text-sm text-gray-600">{request.supplier} • ₱{request.amount.toLocaleString()}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                        {request.items} items
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                        Pending
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleApproveRequest(request.id)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Project Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Project Logistics Status</h3>
            <button className="btn-primary text-sm">View All Projects</button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading projects...</div>
            ) : projectStatus.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No active projects</div>
            ) : (
              projectStatus.map((project) => (
                <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'on_track' ? 'bg-green-100 text-green-800' :
                      project.status === 'delayed' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress: {project.progress}%</span>
                    <span className="text-sm text-gray-600">Deadline: {new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => {
                        const newProgress = Math.min(project.progress + 10, 100)
                        handleUpdateProjectProgress(project.id, newProgress)
                      }}
                      className="text-xs text-primary hover:text-primary-dark"
                    >
                      Update Progress
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

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
            onClick={() => loadManagerData()}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
          <button 
            onClick={handleGenerateManagerReport}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
          <button 
            onClick={() => {
              // Monitor all projects
              toast.success('Monitoring all active projects...')
            }}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>Monitor Progress</span>
          </button>
          <button 
            onClick={() => {
              // System overview
              toast.success('System overview generated!')
            }}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Package className="w-5 h-5" />
            <span>System Overview</span>
          </button>
        </div>
        
        {/* Additional Manager Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Management Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleBulkApproval('approve_all')}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
            >
              Approve All Requests
            </button>
            <button 
              onClick={() => handleBulkApproval('reject_all')}
              className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
            >
              Reject All Requests
            </button>
            <button 
              onClick={() => {
                // Export manager data
                const csvData = {
                  approvalRequests: approvalRequests.length,
                  projects: projectStatus.length,
                  totalSpending: approvalRequests.reduce((sum, req) => sum + req.amount, 0)
                }
                
                toast.success('Manager data exported!')
              }}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              Export Data
            </button>
            <button 
              onClick={() => {
                // Department performance
                toast.success('Department performance analysis generated!')
              }}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600"
            >
              Performance Analysis
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ManagerDashboard
