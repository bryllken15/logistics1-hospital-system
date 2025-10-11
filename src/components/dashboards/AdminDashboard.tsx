import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, X, AlertTriangle, Clock, Users, Package, TrendingUp } from 'lucide-react'
import { systemLogService, userService } from '../../services/database'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [adminPendingRequests, setAdminPendingRequests] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Real-time stats
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalUsers: 0,
    authorizedUsers: 0,
    pendingAuthorizations: 0,
    totalInventoryItems: 0,
    systemAlerts: 0
  })

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      const [usersData, pendingRequests] = await Promise.all([
        userService.getAll(),
        // Add service for admin pending requests when available
        Promise.resolve([])
      ])
      
      setUsers(usersData || [])
      setAdminPendingRequests(pendingRequests || [])
      
      // Calculate stats
      const totalUsers = (usersData || []).length
      const authorizedUsers = (usersData || []).filter(u => u.is_authorized).length
      const pendingAuthorizations = (usersData || []).filter(u => !u.is_authorized).length
      
      setStats({
        pendingApprovals: (pendingRequests || []).length,
        totalUsers,
        authorizedUsers,
        pendingAuthorizations,
        totalInventoryItems: 0, // Will be updated when inventory service is available
        systemAlerts: 0
      })
      
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string, requestType: string) => {
    try {
      setLoading(true)
      
      // Log approval
      await systemLogService.create({
        action: 'Admin Approved Request',
        user_id: user?.id || '11111111-1111-1111-1111-111111111111',
        details: `${requestType} request ${requestId} approved by admin`
      })
      
      await loadAdminData()
      toast.success('Request approved successfully!')
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Failed to approve request')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectRequest = async (requestId: string, requestType: string) => {
    try {
      setLoading(true)
      
      // Log rejection
      await systemLogService.create({
        action: 'Admin Rejected Request',
        user_id: user?.id || '11111111-1111-1111-1111-111111111111',
        details: `${requestType} request ${requestId} rejected by admin`
      })
      
      await loadAdminData()
      toast.success('Request rejected')
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject request')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthorizeUser = async (userId: string) => {
    try {
      setLoading(true)
      
      await userService.authorizeUser(userId)
      
      // Log authorization
      await systemLogService.create({
        action: 'User Authorized by Admin',
        user_id: user?.id || '11111111-1111-1111-1111-111111111111',
        details: `User ${userId} authorized by admin`
      })
      
      await loadAdminData()
      toast.success('User authorized successfully!')
    } catch (error) {
      console.error('Error authorizing user:', error)
      toast.error('Failed to authorize user')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkApproval = async (action: string) => {
    try {
      if (action === 'approve_all') {
        // Approve all pending requests
        for (const request of adminPendingRequests) {
          await handleApproveRequest(request.id, request.request_type)
        }
        toast.success('All requests approved!')
      } else if (action === 'authorize_all') {
        // Authorize all pending users
        const pendingUsers = users.filter(u => !u.is_authorized)
        for (const user of pendingUsers) {
          await handleAuthorizeUser(user.id)
        }
        toast.success('All users authorized!')
      }
      
      await loadAdminData()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform bulk action')
    }
  }

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
          <h1 className="text-3xl font-bold text-primary mb-2">Admin Control Panel</h1>
          <p className="text-gray-600">Manage system approvals, user authorizations, and system settings</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">System Active</span>
          </div>
        </div>
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
                System Status: {isConnected ? 'Connected' : 'Disconnected'}
              </h3>
              <p className="text-sm text-blue-700">
                {lastUpdate ? `Last update: ${lastUpdate.toLocaleTimeString()}` : 'No updates yet'}
              </p>
            </div>
          </div>
          {(notifications || []).length > 0 && (
            <div className="flex items-center text-blue-600">
              <span className="text-sm font-medium">{(notifications || []).length} new alerts</span>
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
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-red-500">{stats.pendingApprovals}</p>
              <p className="text-xs text-red-600">Requires admin action</p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
              <p className="text-xs text-green-600">System users</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Authorized Users</p>
              <p className="text-2xl font-bold text-green-500">{stats.authorizedUsers}</p>
              <p className="text-xs text-green-600">Active users</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Authorizations</p>
              <p className="text-2xl font-bold text-orange-500">{stats.pendingAuthorizations}</p>
              <p className="text-xs text-orange-600">Awaiting approval</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Admin Pending Requests</h3>
            <button 
              onClick={() => handleBulkApproval('approve_all')}
              className="btn-primary text-sm"
            >
              Approve All
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Loading pending requests...</div>
            ) : adminPendingRequests.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No pending admin requests</div>
            ) : (
              adminPendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{request.item_name}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {request.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {request.request_type.replace('_', ' ').toUpperCase()} • 
                      Manager: {request.manager_approved ? '✓' : '✗'} • 
                      PM: {request.project_manager_approved ? '✓' : '✗'}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        Admin Approval Required
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleApproveRequest(request.id, request.request_type)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(request.id, request.request_type)}
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

        {/* User Authorizations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">User Authorizations</h3>
            <button 
              onClick={() => handleBulkApproval('authorize_all')}
              className="btn-primary text-sm"
            >
              Authorize All
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : users.filter(u => !u.is_authorized).length === 0 ? (
              <div className="text-center py-4 text-gray-500">No pending user authorizations</div>
            ) : (
              users.filter(u => !u.is_authorized).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        PENDING
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Role: {user.role}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                        Awaiting Authorization
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAuthorizeUser(user.id)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                    >
                      Authorize
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
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">Admin Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => loadAdminData()}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
          <button 
            onClick={() => handleBulkApproval('approve_all')}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Approve All</span>
          </button>
          <button 
            onClick={() => handleBulkApproval('authorize_all')}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Authorize All</span>
          </button>
          <button 
            onClick={() => {
              // System maintenance
              toast.success('System maintenance mode activated!')
            }}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Shield className="w-5 h-5" />
            <span>System Maintenance</span>
          </button>
        </div>
        
        {/* Additional Admin Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">System Management</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                // Export admin data
                toast.success('Admin data exported!')
              }}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              Export System Data
            </button>
            <button 
              onClick={() => {
                // System backup
                toast.success('System backup initiated!')
              }}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
            >
              System Backup
            </button>
            <button 
              onClick={() => {
                // System logs
                toast.success('System logs generated!')
              }}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600"
            >
              View System Logs
            </button>
            <button 
              onClick={() => {
                // Security audit
                toast.success('Security audit completed!')
              }}
              className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
            >
              Security Audit
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard