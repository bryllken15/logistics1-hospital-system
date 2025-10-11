import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Bell,
  TrendingUp,
  Package,
  Calendar,
  DollarSign
} from 'lucide-react'
import { approvalService } from '../../services/approvalService'
import { inventoryService, notificationService } from '../../services/database'
import { useRealtimeSubscriptions } from '../../services/realtimeService'
import toast from 'react-hot-toast'

interface PurchaseRequest {
  id: string
  request_number: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  total_amount: number
  required_date: string
  created_at: string
  approvals?: any[]
}

interface InventoryRequest {
  id: string
  item_name: string
  quantity: number
  unit_price: number
  total_value: number
  status: string
  request_reason: string
  request_type: string
  manager_approved: boolean
  project_manager_approved: boolean
  created_at: string
}

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showInventoryRequestModal, setShowInventoryRequestModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userRequests, setUserRequests] = useState<PurchaseRequest[]>([])
  const [inventoryRequests, setInventoryRequests] = useState<InventoryRequest[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  })

  // Get current user from context (you'll need to implement this)
  const currentUser = {
    id: '33333333-3333-3333-3333-333333333333', // Employee ID
    name: 'John Employee',
    role: 'employee'
  }

  // Real-time subscriptions
  const { notifications: realtimeNotifications } = useRealtimeSubscriptions(currentUser.id)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (realtimeNotifications?.notifications) {
      setNotifications(realtimeNotifications.notifications)
    }
  }, [realtimeNotifications])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load user purchase requests
      const requests = await approvalService.getUserRequests(currentUser.id)
      setUserRequests(requests)

      // Load user inventory requests
      const inventoryReqs = await inventoryService.getByUser(currentUser.id)
      setInventoryRequests(inventoryReqs)

      // Load notifications
      const notifs = await notificationService.getUserNotifications(currentUser.id)
      setNotifications(notifs || [])

      // Calculate stats
      const totalRequests = requests.length + inventoryReqs.length
      const pendingRequests = requests.filter(r => r.status === 'pending').length + 
                            inventoryReqs.filter(r => r.status === 'pending').length
      const approvedRequests = requests.filter(r => r.status === 'approved').length + 
                             inventoryReqs.filter(r => r.status === 'approved').length
      const rejectedRequests = requests.filter(r => r.status === 'rejected').length + 
                              inventoryReqs.filter(r => r.status === 'rejected').length

      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (requestData: any) => {
    try {
      setLoading(true)
      
      await approvalService.submitPurchaseRequest({
        title: requestData.title,
        description: requestData.description,
        total_amount: parseFloat(requestData.total_amount),
        priority: requestData.priority,
        required_date: requestData.required_date,
        requested_by: currentUser.id
      })

      toast.success('Purchase request submitted successfully!')
      setShowRequestModal(false)
      loadDashboardData()
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error('Failed to submit purchase request')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitInventoryRequest = async (requestData: any) => {
    try {
      setLoading(true)
      
      await inventoryService.createWithApproval({
        item_name: requestData.item_name,
        quantity: parseInt(requestData.quantity),
        unit_price: parseFloat(requestData.unit_price),
        reason: requestData.reason || 'New inventory item request'
      }, currentUser.id)

      toast.success('Inventory request submitted for approval!')
      setShowInventoryRequestModal(false)
      loadDashboardData()
    } catch (error) {
      console.error('Error submitting inventory request:', error)
      toast.error('Failed to submit inventory request')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && userRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
        <p className="text-gray-600">Manage your purchase requests and track approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedRequests}</p>
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
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Purchase Requests
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Inventory Requests
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Notifications
            {(notifications || []).filter(n => !n.is_read).length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {(notifications || []).filter(n => !n.is_read).length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
            </div>
            <div className="p-6">
              {userRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center">
                    {getStatusIcon(request.status)}
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{request.title}</p>
                      <p className="text-sm text-gray-600">#{request.request_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ${request.total_amount ? request.total_amount.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              ))}
              {userRequests.length === 0 && (
                <p className="text-gray-500 text-center py-4">No requests yet</p>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
            </div>
            <div className="p-6">
              {(notifications || []).slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-start py-3 border-b last:border-b-0">
                  <Bell className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(notifications || []).length === 0 && (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">My Purchase Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{request.title}</p>
                        <p className="text-sm text-gray-600">#{request.request_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        ${request.total_amount ? request.total_amount.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(request.status)}
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {userRequests.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No purchase requests yet</p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Your First Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">My Inventory Requests</h3>
              <button
                onClick={() => setShowInventoryRequestModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Inventory Request
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventoryRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{request.item_name}</p>
                        <p className="text-sm text-gray-600">{request.request_reason}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{request.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        ${request.unit_price ? request.unit_price.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        ${request.total_value ? request.total_value.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(request.status)}
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${request.manager_approved ? 'text-green-600' : 'text-gray-400'}`}>
                          Manager {request.manager_approved ? '✓' : '⏳'}
                        </span>
                        <span className={`text-xs ${request.project_manager_approved ? 'text-green-600' : 'text-gray-400'}`}>
                          PM {request.project_manager_approved ? '✓' : '⏳'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inventoryRequests.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No inventory requests yet</p>
                <button
                  onClick={() => setShowInventoryRequestModal(true)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Your First Inventory Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => approvalService.markAllNotificationsAsRead(currentUser.id)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {(notifications || []).map((notification) => (
              <div key={notification.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start">
                  <Bell className={`w-5 h-5 mt-1 ${notification.is_read ? 'text-gray-400' : 'text-blue-600'}`} />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-medium ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        notification.type === 'success' ? 'bg-green-100 text-green-800' :
                        notification.type === 'error' ? 'bg-red-100 text-red-800' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {notification.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(notifications || []).length === 0 && (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {showRequestModal && (
        <NewRequestModal
          onSubmit={handleSubmitRequest}
          onClose={() => setShowRequestModal(false)}
          loading={loading}
        />
      )}

      {/* New Inventory Request Modal */}
      {showInventoryRequestModal && (
        <NewInventoryRequestModal
          onSubmit={handleSubmitInventoryRequest}
          onClose={() => setShowInventoryRequestModal(false)}
          loading={loading}
        />
      )}
    </div>
  )
}

// New Request Modal Component
const NewRequestModal = ({ onSubmit, onClose, loading }: any) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_amount: '',
    priority: 'medium',
    required_date: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">New Purchase Request</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Date</label>
            <input
              type="date"
              required
              value={formData.required_date}
              onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// New Inventory Request Modal Component
const NewInventoryRequestModal = ({ onSubmit, onClose, loading }: any) => {
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: '',
    unit_price: '',
    reason: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">New Inventory Request</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              required
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
            <input
              type="number"
              step="0.01"
              required
              min="0"
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              required
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Why do you need this item?"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmployeeDashboard