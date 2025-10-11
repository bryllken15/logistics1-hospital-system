// Fixed Manager Dashboard Component
// This file shows the improved ManagerDashboard.tsx with better error handling

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
  priority: string
  approval_status: string
  created_at: string
}

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('approvals')
  const [loading, setLoading] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
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
  const [error, setError] = useState<string | null>(null)

  // Get current user from context
  const currentUser = {
    id: '22222222-2222-2222-2222-222222222222', // Manager ID
    name: 'Jane Manager',
    role: 'manager'
  }

  // Real-time subscriptions
  const { notifications: realtimeNotifications, approvals: realtimeApprovals } = useRealtimeSubscriptions(currentUser.id)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (realtimeNotifications?.notifications) {
      setNotifications(realtimeNotifications.notifications)
    }
  }, [realtimeNotifications])

  useEffect(() => {
    if (realtimeApprovals?.approvals) {
      setPendingApprovals(realtimeApprovals.approvals)
    }
  }, [realtimeApprovals])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading dashboard data for user:', currentUser.id, 'role:', currentUser.role)
      
      // Load pending approvals with better error handling
      console.log('Fetching pending approvals...')
      const approvals = await approvalService.getPendingApprovals(currentUser.id, currentUser.role)
      console.log('Pending approvals received:', approvals?.length || 0)
      setPendingApprovals(approvals || [])

      // Load notifications with better error handling
      console.log('Fetching notifications...')
      const notifs = await approvalService.getNotifications(currentUser.id)
      console.log('Notifications received:', notifs?.length || 0)
      setNotifications(notifs || [])

      // Load stats with better error handling
      console.log('Fetching approval stats...')
      const statsData = await approvalService.getApprovalStats(currentUser.id, currentUser.role)
      console.log('Stats received:', statsData)
      setStats(statsData || {
        pendingApprovals: 0,
        totalRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0
      })

      console.log('Dashboard data loaded successfully')

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError(`Failed to load dashboard data: ${error.message}`)
      toast.error('Failed to load dashboard data')
      
      // Set fallback data to prevent crashes
      setPendingApprovals([])
      setNotifications([])
      setStats({
        pendingApprovals: 0,
        totalRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (!selectedApproval) return

    try {
      setLoading(true)
      
      console.log(`${action}ing request:`, selectedApproval.request_id)
      
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
      
      // Reload data to reflect changes
      await loadDashboardData()
    } catch (error) {
      console.error('Error processing approval:', error)
      toast.error(`Failed to ${action} request: ${error.message}`)
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

  if (loading && pendingApprovals.length === 0) {
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
        
        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
            <button 
              onClick={loadDashboardData}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approvals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Approvals
              {(notifications || []).filter(n => !n.is_read).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {(notifications || []).filter(n => !n.is_read).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Notifications
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'approvals' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Pending Approvals</h2>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading approvals...</p>
                </div>
              ) : pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.approval_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{approval.request_title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(approval.priority)}`}>
                              {approval.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{approval.request_description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Requested by: {approval.requested_by_name}</span>
                            <span>Amount: ${approval.total_amount.toLocaleString()}</span>
                            <span>Date: {new Date(approval.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openApprovalModal(approval, 'approve')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openApprovalModal(approval, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">Notifications</h2>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                          <p className="text-gray-600">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Request
            </h3>
            <p className="text-gray-600 mb-4">
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} "{selectedApproval.request_title}"?
            </p>
            <textarea
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder={`${approvalAction === 'approve' ? 'Approval' : 'Rejection'} comments (optional)`}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => handleApprovalAction(approvalAction)}
                className={`px-4 py-2 text-white rounded-lg ${
                  approvalAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Processing...' : `${approvalAction === 'approve' ? 'Approve' : 'Reject'}`}
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerDashboard
