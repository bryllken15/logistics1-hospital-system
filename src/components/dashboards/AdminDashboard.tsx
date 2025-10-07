import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, Activity, Shield, TrendingUp, Plus, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { userService, systemLogService, analyticsService, purchaseRequestService, inventoryChangeService, reportService } from '../../services/database'
import { supabase } from '../../lib/supabase'
import { useDashboardRealtime } from '../../hooks/useRealtimeUpdates'
import NotificationCenter from '../NotificationCenter'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [systemLogs, setSystemLogs] = useState<any[]>([])
  const [userStats, setUserStats] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showSystemSettings, setShowSystemSettings] = useState(false)
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    role: 'employee'
  })
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    notifications: true,
    maxUsers: 100
  })
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Set up realtime subscriptions
  useDashboardRealtime({
    onUserUpdate: (update) => {
      console.log('User update received:', update)
      setLastUpdate(new Date())
      if (update.eventType === 'INSERT') {
        setUsers(prev => [update.new, ...prev])
        toast.success('New user registered')
      } else if (update.eventType === 'UPDATE') {
        setUsers(prev => prev.map(user => user.id === update.new.id ? update.new : user))
        toast.success('User updated')
      }
    },
    onPurchaseRequestUpdate: (update) => {
      console.log('Purchase request update received:', update)
      setLastUpdate(new Date())
      if (update.eventType === 'INSERT') {
        setPendingRequests(prev => [update.new, ...prev])
        toast.success('New purchase request received')
      } else if (update.eventType === 'UPDATE') {
        setPendingRequests(prev => prev.map(req => req.id === update.new.id ? update.new : req))
        if (update.new.status === 'approved') {
          toast.success('Purchase request approved')
        } else if (update.new.status === 'rejected') {
          toast.success('Purchase request rejected')
        }
      }
    },
    onSystemLogUpdate: (update) => {
      console.log('System log update received:', update)
      setLastUpdate(new Date())
      if (update.eventType === 'INSERT') {
        setSystemLogs(prev => [update.new, ...prev.slice(0, 9)])
      }
    },
    onNotificationUpdate: (update) => {
      console.log('Notification update received:', update)
      setLastUpdate(new Date())
      if (update.eventType === 'INSERT') {
        setNotifications(prev => [update.new, ...prev])
        toast.success(update.new.title)
      }
    }
  })

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load users, pending requests, and system logs
      const [allUsers, purchaseRequests, inventoryChanges, logs] = await Promise.all([
        userService.getAll(),
        purchaseRequestService.getAll(),
        inventoryChangeService.getAll(),
        systemLogService.getAll(10)
      ])
      
      setUsers(allUsers)
      setPendingRequests([
        ...purchaseRequests.filter((req: any) => req.status === 'pending'),
        ...inventoryChanges.filter((change: any) => change.status === 'pending')
      ])
      setSystemLogs(logs)
      
      // Calculate user stats by role
      const roleCounts = allUsers.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {})
      
      const stats = [
        { role: 'Admin', count: roleCounts.admin || 0, color: '#1D3557' },
        { role: 'Manager', count: roleCounts.manager || 0, color: '#457B9D' },
        { role: 'Employee', count: roleCounts.employee || 0, color: '#00A896' },
        { role: 'Procurement', count: roleCounts.procurement || 0, color: '#F77F00' },
        { role: 'Maintenance', count: roleCounts.maintenance || 0, color: '#FCBF49' },
        { role: 'Document Analyst', count: roleCounts.document_analyst || 0, color: '#D62828' }
      ]
      
      setUserStats(stats)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setLoading(true)
      
      // Get current user status
      const currentUser = users.find(u => u.id === userId)
      if (!currentUser) {
        throw new Error('User not found')
      }
      
      const newStatus = !currentUser.is_authorized
      
      // Update user authorization status
      const { data, error } = await supabase
        .from('users')
        .update({ is_authorized: newStatus, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
      
      if (error) throw error
      
      // Log the action
      await systemLogService.logAction(
        newStatus ? 'User Authorized' : 'User Deauthorized',
        user?.id || 'system',
        `User ${currentUser.full_name} ${newStatus ? 'authorized' : 'deauthorized'} by admin`
      )
      
      toast.success(newStatus ? 'User activated successfully!' : 'User deactivated successfully!')
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Failed to update user status')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string, requestType: string) => {
    try {
      setLoading(true)
      
      if (requestType === 'purchase_request') {
        await purchaseRequestService.approve(requestId, user?.id || 'system')
      } else if (requestType === 'inventory_change') {
        await inventoryChangeService.approve(requestId, user?.id || 'system')
      }
      
      // Log the action
      await systemLogService.logAction(
        'Request Approved',
        user?.id || 'system',
        `${requestType} ${requestId} approved by admin`
      )
      
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
      
      if (requestType === 'purchase_request') {
        await purchaseRequestService.reject(requestId, user?.id || 'system')
      } else if (requestType === 'inventory_change') {
        await inventoryChangeService.reject(requestId, user?.id || 'system')
      }
      
      // Log the action
      await systemLogService.logAction(
        'Request Rejected',
        user?.id || 'system',
        `${requestType} ${requestId} rejected by admin`
      )
      
      toast.success('Request rejected successfully!')
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject request')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReports = async () => {
    try {
      setLoading(true)
      
      // Generate comprehensive system report
      const reportData = {
        report_name: `System Report - ${new Date().toLocaleDateString()}`,
        report_type: 'system_overview',
        generated_by: '11111111-1111-1111-1111-111111111111',
        parameters: {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.is_authorized).length,
          pendingRequests: pendingRequests.length,
          systemLogs: systemLogs.length,
          systemHealth: 'Good',
          lastBackup: new Date().toISOString(),
          generatedAt: new Date().toISOString()
        }
      }
      
      // Create report in database
      await reportService.create(reportData)
      
      // Log report generation
      await systemLogService.create({
        action: 'Report Generated',
        user_id: '11111111-1111-1111-1111-111111111111',
        details: `System report generated with ${Object.keys(reportData.parameters).length} metrics`
      })
      
      toast.success('System report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handleSystemMaintenance = async () => {
    try {
      await systemLogService.create({
        action: 'System Maintenance',
        user_id: '11111111-1111-1111-1111-111111111111',
        details: 'System maintenance mode toggled'
      })
      
      toast.success('System maintenance mode updated!')
    } catch (error) {
      console.error('Error updating system maintenance:', error)
      toast.error('Failed to update system maintenance')
    }
  }

  const handleAddNewUser = async (userData: any) => {
    try {
      setLoading(true)
      
      const newUserData = {
        username: userData.email.split('@')[0], // Generate username from email
        email: userData.email,
        full_name: userData.fullName,
        role: userData.role,
        password_hash: 'temp_password', // Will be changed on first login
        is_authorized: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
      
      if (error) throw error
      
      // Log the action
      await systemLogService.logAction(
        'New User Added',
        user?.id || 'system',
        `New user ${userData.fullName} added with role ${userData.role}`
      )
      
      toast.success('New user added successfully!')
    } catch (error) {
      console.error('Error adding new user:', error)
      toast.error('Failed to add new user')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUserActions = async (action: string) => {
    try {
      if (action === 'authorize_all') {
        // Authorize all pending users
        for (const user of users.filter(u => !u.is_authorized)) {
          await userService.authorizeUser(user.id)
        }
        toast.success('All pending users authorized!')
      } else if (action === 'export_users') {
        // Export user data
        const csvData = users.map(user => ({
          name: user.full_name,
          email: user.email,
          role: user.role,
          authorized: user.is_authorized,
          created: user.created_at
        }))
        
        // Create downloadable CSV
        const csvContent = "data:text/csv;charset=utf-8," + 
          "Name,Email,Role,Authorized,Created\n" +
          csvData.map(row => Object.values(row).join(",")).join("\n")
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "users_export.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('User data exported successfully!')
      }
      
      await loadDashboardData()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform bulk action')
    }
  }

  // Mock procurement data for now (can be replaced with real data later)
  const procurementData = [
    { month: 'Jan', approved: 45, pending: 12 },
    { month: 'Feb', approved: 52, pending: 8 },
    { month: 'Mar', approved: 48, pending: 15 },
    { month: 'Apr', approved: 61, pending: 6 },
    { month: 'May', approved: 55, pending: 9 },
    { month: 'Jun', approved: 67, pending: 4 }
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
          <h1 className="text-3xl font-bold text-primary mb-2">Admin Control Center</h1>
          <p className="text-gray-600">Manage users, monitor system activity, and oversee all modules</p>
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
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-primary">{loading ? '...' : users.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Authorizations</p>
              <p className="text-2xl font-bold text-orange-500">{loading ? '...' : users.filter(u => !u.is_authorized).length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Modules</p>
              <p className="text-2xl font-bold text-green-500">6</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-green-500">99.9%</p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">User Distribution by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ role, count }) => `${role}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {userStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Procurement Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Procurement Requests Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={procurementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="approved" fill="#00A896" name="Approved" />
              <Bar dataKey="pending" fill="#F77F00" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">User Management</h3>
            <button className="btn-primary text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No users found</div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Role: {user.role}</p>
                    <p className={`text-xs ${user.is_authorized ? 'text-green-600' : 'text-red-600'}`}>
                      Status: {user.is_authorized ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleToggleUserStatus(user.id)}
                      className={`px-3 py-1 text-white text-xs rounded-lg ${
                        user.is_authorized 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {user.is_authorized ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Pending Requests</h3>
            <button className="btn-primary text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Loading pending requests...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No pending requests</div>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.item_name || request.change_type || 'Request'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.requested_by_user?.full_name || request.changed_by_user?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Type: {request.request_number ? 'Purchase Request' : 'Inventory Change'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleApproveRequest(request.id, request.request_number ? 'purchase_request' : 'inventory_change')}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(request.id, request.request_number ? 'purchase_request' : 'inventory_change')}
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

        {/* System Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Recent System Activity</h3>
            <button className="btn-primary text-sm">View All Logs</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Loading system logs...</div>
            ) : systemLogs.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No system logs available</div>
            ) : (
              systemLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{log.action}</p>
                    <p className="text-sm text-gray-600">by {log.users?.full_name || 'System'}</p>
                    <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    success
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
            onClick={() => loadDashboardData()}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
          <button 
            onClick={handleGenerateReports}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Generate Reports</span>
          </button>
          <button 
            onClick={() => setShowSystemSettings(true)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Shield className="w-5 h-5" />
            <span>System Settings</span>
          </button>
        </div>
        
        {/* Additional Admin Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Bulk Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleBulkUserActions('authorize_all')}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
            >
              Authorize All Pending
            </button>
            <button 
              onClick={() => handleBulkUserActions('export_users')}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              Export User Data
            </button>
            <button 
              onClick={handleSystemMaintenance}
              className="px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
            >
              System Maintenance
            </button>
          </div>
        </div>
      </motion.div>

      {/* Add User Modal */}
      {showAddUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Add New User</h3>
              <button
                onClick={() => setShowAddUserForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="input-field w-full"
                  placeholder="user@hospital.com"
                  aria-label="User email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  className="input-field w-full"
                  placeholder="John Doe"
                  aria-label="User full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="input-field w-full"
                  aria-label="User role"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="procurement">Procurement</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="document_analyst">Document Analyst</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddUserForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAddNewUser(newUser)
                  setNewUser({ email: '', fullName: '', role: 'employee' })
                  setShowAddUserForm(false)
                }}
                className="btn-primary"
              >
                Add User
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* System Settings Modal */}
      {showSystemSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">System Settings</h3>
              <button
                onClick={() => setShowSystemSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                <input
                  type="checkbox"
                  checked={systemSettings.maintenanceMode}
                  onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                  className="w-4 h-4 text-primary"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Auto Backup</label>
                <input
                  type="checkbox"
                  checked={systemSettings.autoBackup}
                  onChange={(e) => setSystemSettings({...systemSettings, autoBackup: e.target.checked})}
                  className="w-4 h-4 text-primary"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Notifications</label>
                <input
                  type="checkbox"
                  checked={systemSettings.notifications}
                  onChange={(e) => setSystemSettings({...systemSettings, notifications: e.target.checked})}
                  className="w-4 h-4 text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Users</label>
                <input
                  type="number"
                  value={systemSettings.maxUsers}
                  onChange={(e) => setSystemSettings({...systemSettings, maxUsers: parseInt(e.target.value) || 100})}
                  className="input-field w-full"
                  placeholder="100"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSystemSettings(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSystemMaintenance()
                  setShowSystemSettings(false)
                }}
                className="btn-primary"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
