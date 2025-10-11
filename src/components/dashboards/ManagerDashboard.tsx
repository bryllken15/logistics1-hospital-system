import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Bell,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Filter,
  Search
} from 'lucide-react'
import { approvalService } from '../../services/approvalService'
import { procurementApprovalService, inventoryService, notificationService } from '../../services/database'
import { useRealtimeSubscriptions } from '../../services/realtimeService'
import toast from 'react-hot-toast'

interface PendingApproval {
  approval_id: string
  request_id: string
  request_title: string
  request_description: string
  total_amount: number
  requested_by_name: string
  requested_date: string
  required_date: string
  priority: string
  approval_status: string
  created_at: string
}

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('approvals')
  const [loading, setLoading] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [procurementApprovals, setProcurementApprovals] = useState<any[]>([])
  const [inventoryApprovals, setInventoryApprovals] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  })
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')
  const [approvalComments, setApprovalComments] = useState('')

  // Get current user from context
  const currentUser = {
    id: '22222222-2222-2222-2222-222222222222', // Manager ID
    name: 'Jane Manager',
    role: 'manager'
  }

  // Real-time subscriptions
  const { notifications: realtimeNotifications, approvals: realtimeApprovals } = useRealtimeSubscriptions(currentUser.id)

  useEffect(() => {
    console.log('🔍 MANAGER DASHBOARD: useEffect called - loading dashboard data')
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (realtimeNotifications?.notifications) {
      setNotifications(realtimeNotifications.notifications)
    }
  }, [realtimeNotifications])

  useEffect(() => {
    if (realtimeApprovals?.approvals && realtimeApprovals.approvals.length > 0) {
      console.log('🔍 MANAGER DASHBOARD: Real-time approvals received:', realtimeApprovals.approvals.length)
      setPendingApprovals(realtimeApprovals.approvals)
    } else {
      console.log('🔍 MANAGER DASHBOARD: No real-time approvals or empty data, keeping existing data')
    }
  }, [realtimeApprovals])

  const loadDashboardData = async () => {
    try {
      console.log('🔍 MANAGER DASHBOARD: loadDashboardData called')
      setLoading(true)
      
      // Load pending purchase request approvals
      console.log('🔍 MANAGER DASHBOARD: Loading pending approvals...')
      console.log('   Current user ID:', currentUser.id)
      console.log('   Current user role:', currentUser.role)
      
      const approvals = await approvalService.getPendingApprovals(currentUser.id, currentUser.role)
      console.log('🔍 MANAGER DASHBOARD: Pending approvals loaded:', approvals?.length || 0)
      console.log('🔍 MANAGER DASHBOARD: Pending approvals data:', approvals)
      
      if (approvals && approvals.length > 0) {
        console.log('✅ MANAGER DASHBOARD: Data received successfully!')
        console.log('   First approval:', approvals[0])
      } else {
        console.log('❌ MANAGER DASHBOARD: No data received!')
        console.log('   This is why the table shows "No pending purchase requests"')
      }
      
      setPendingApprovals(approvals)
      console.log('🔍 MANAGER DASHBOARD: Pending approvals state set')

      // Load procurement approvals (only ones that need manager approval)
      console.log('🔍 MANAGER DASHBOARD: Loading procurement approvals...')
      const procurementApprovals = await procurementApprovalService.getPendingManagerApprovals()
      console.log('🔍 MANAGER DASHBOARD DEBUG:')
      console.log('   Procurement approvals received:', procurementApprovals?.length || 0)
      console.log('   Procurement approvals data:', procurementApprovals)
      console.log('🔍 MANAGER DASHBOARD: Setting procurement approvals state...')
      setProcurementApprovals(procurementApprovals)
      console.log('🔍 MANAGER DASHBOARD: Procurement approvals state set')

      // Load inventory approvals
      const inventoryApprovals = await inventoryService.getPendingApprovals()
      setInventoryApprovals(inventoryApprovals)

      // Load notifications
      const notifs = await notificationService.getUserNotifications(currentUser.id)
      setNotifications(notifs || [])

      // Load stats
      const statsData = await approvalService.getApprovalStats(currentUser.id, currentUser.role)
      setStats(statsData)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (!selectedApproval) return

    try {
      setLoading(true)
      
      if (action === 'approve') {
        await approvalService.approvePurchaseRequest(
          selectedApproval.request_id,
          currentUser.id,
          approvalComments
        )
        toast.success('Request approved successfully!')
      } else {
        await approvalService.rejectPurchaseRequest(
          selectedApproval.request_id,
          currentUser.id,
          approvalComments
        )
        toast.success('Request rejected')
      }

      setShowApprovalModal(false)
      setSelectedApproval(null)
      setApprovalComments('')
      loadDashboardData()
    } catch (error) {
      console.error('Error processing approval:', error)
      toast.error(`Failed to ${action} request`)
    } finally {
      setLoading(false)
    }
  }

  const openApprovalModal = (approval: PendingApproval, action: 'approve' | 'reject') => {
    setSelectedApproval(approval)
    setApprovalAction(action)
    setApprovalComments('')
    setShowApprovalModal(true)
  }

  const handleProcurementApproval = async (approvalId: string, action: 'approve' | 'reject') => {
    try {
      setLoading(true)
      
      if (action === 'approve') {
        await procurementApprovalService.approve(approvalId, currentUser.id, 'manager')
        toast.success('Procurement request approved!')
      } else {
        await procurementApprovalService.reject(approvalId, currentUser.id, 'manager')
        toast.success('Procurement request rejected!')
      }

      loadDashboardData()
    } catch (error) {
      console.error('Error processing procurement approval:', error)
      toast.error(`Failed to ${action} procurement request`)
    } finally {
      setLoading(false)
    }
  }

  const handleInventoryApproval = async (approvalId: string, action: 'approve' | 'reject') => {
    try {
      setLoading(true)
      
      if (action === 'approve') {
        await inventoryService.approve(approvalId, currentUser.id, 'manager')
        toast.success('Inventory request approved!')
      } else {
        await inventoryService.reject(approvalId, currentUser.id, 'manager')
        toast.success('Inventory request rejected!')
      }

      loadDashboardData()
    } catch (error) {
      console.error('Error processing inventory approval:', error)
      toast.error(`Failed to ${action} inventory request`)
    } finally {
      setLoading(false)
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  console.log('🔍 MANAGER DASHBOARD: Component rendering')
  console.log('   Loading:', loading)
  console.log('   Pending approvals length:', pendingApprovals.length)
  console.log('   Procurement approvals length:', procurementApprovals.length)
  console.log('   Active tab:', activeTab)
  console.log('   Pending approvals data:', pendingApprovals)

  if (loading && pendingApprovals.length === 0) {
    console.log('🔍 MANAGER DASHBOARD: Showing loading spinner')
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
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600">Review and approve purchase requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

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
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'approvals'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Purchase Requests
            {stats.pendingApprovals > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.pendingApprovals}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('procurement')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'procurement'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Procurement Approvals
            {procurementApprovals.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {procurementApprovals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Inventory Approvals
            {inventoryApprovals.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {inventoryApprovals.length}
              </span>
            )}
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
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
            </div>
            <div className="p-6">
              {pendingApprovals.slice(0, 5).map((approval) => (
                <div key={approval.approval_id || (approval as any).id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{approval.request_title}</p>
                      <p className="text-sm text-gray-600">by {approval.requested_by_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(approval.priority)}`}>
                      {approval.priority}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ${approval.total_amount ? approval.total_amount.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <p className="text-gray-500 text-center py-4">No pending approvals</p>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
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

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
             <h3 className="text-lg font-semibold text-gray-900">Purchase Requests</h3>
             <p className="text-sm text-gray-600 mt-1">Traditional purchase requests from employees</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingApprovals.map((approval) => (
                   <tr key={approval.approval_id || (approval as any).id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{approval.request_title}</p>
                        <p className="text-sm text-gray-600">{approval.request_description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{approval.requested_by_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                         ${approval.total_amount ? approval.total_amount.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getPriorityIcon(approval.priority)}
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityColor(approval.priority)}`}>
                          {approval.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(approval.required_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openApprovalModal(approval, 'approve')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => openApprovalModal(approval, 'reject')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pendingApprovals.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                 <p className="text-gray-500">No pending purchase requests</p>
               </div>
             )}
           </div>
         </div>
       )}

       {activeTab === 'procurement' && (
         <div className="bg-white rounded-lg shadow">
           <div className="p-6 border-b">
             <h3 className="text-lg font-semibold text-gray-900">Procurement Approvals</h3>
             <p className="text-sm text-gray-600 mt-1">Procurement requests that need manager approval</p>
           </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Debug log removed for production */}
                {procurementApprovals.map((approval) => (
                  <tr key={approval.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{approval.item_name}</p>
                        <p className="text-sm text-gray-600">{approval.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{approval.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        ${approval.unit_price ? approval.unit_price.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        ${approval.total_value ? approval.total_value.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {approval.requested_by_user?.full_name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(approval.priority)}`}>
                        {approval.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProcurementApproval(approval.id, 'approve')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleProcurementApproval(approval.id, 'reject')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {procurementApprovals.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending procurement approvals</p>
                {/* Debug log removed for production */}
              </div>
            )}
          </div>
        </div>
      )}

       {activeTab === 'inventory' && (
         <div className="bg-white rounded-lg shadow">
           <div className="p-6 border-b">
             <h3 className="text-lg font-semibold text-gray-900">Inventory Approvals</h3>
             <p className="text-sm text-gray-600 mt-1">Inventory change requests that need manager approval</p>
           </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventoryApprovals.map((approval) => (
                  <tr key={approval.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{approval.item_name}</p>
                        <p className="text-sm text-gray-600">{approval.request_type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{approval.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        ${approval.unit_price ? approval.unit_price.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        ${approval.total_value ? approval.total_value.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {approval.requested_by_user?.full_name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {approval.request_reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleInventoryApproval(approval.id, 'approve')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleInventoryApproval(approval.id, 'reject')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inventoryApprovals.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending inventory approvals</p>
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

      {/* Approval Modal */}
      {showApprovalModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Request
            </h3>
            
            <div className="mb-4">
              <p className="font-medium text-gray-900">{selectedApproval.request_title}</p>
              <p className="text-sm text-gray-600">by {selectedApproval.requested_by_name}</p>
              <p className="text-sm text-gray-600">Amount: ${selectedApproval.total_amount ? selectedApproval.total_amount.toFixed(2) : '0.00'}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments {approvalAction === 'reject' ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                rows={3}
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={approvalAction === 'approve' ? 'Add approval comments...' : 'Reason for rejection...'}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprovalAction(approvalAction)}
                disabled={loading || (approvalAction === 'reject' && !approvalComments.trim())}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  approvalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Processing...' : `${approvalAction === 'approve' ? 'Approve' : 'Reject'} Request`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerDashboard