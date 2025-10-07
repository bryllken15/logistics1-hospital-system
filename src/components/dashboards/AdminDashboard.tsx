import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, Activity, Shield, TrendingUp, Plus, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { userService, systemLogService, analyticsService } from '../../services/database'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([])
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [systemLogs, setSystemLogs] = useState<any[]>([])
  const [userStats, setUserStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    role: 'employee'
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load users and pending authorizations
      const [allUsers, pendingAuths, logs] = await Promise.all([
        userService.getAll(),
        userService.getPendingAuthorizations(),
        systemLogService.getAll(10)
      ])
      
      setUsers(allUsers)
      setPendingUsers(pendingAuths)
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
    } finally {
      setLoading(false)
    }
  }

  const handleAuthorizeUser = async (userId: string) => {
    try {
      await userService.authorizeUser(userId)
      await loadDashboardData() // Refresh data
      toast.success('User authorized successfully!')
    } catch (error) {
      console.error('Error authorizing user:', error)
      toast.error('Failed to authorize user')
    }
  }

  const handleRejectUser = async (userId: string) => {
    try {
      // Delete user from database
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
      
      if (error) throw error
      
      await loadDashboardData() // Refresh data
      toast.success('User rejected and removed')
    } catch (error) {
      console.error('Error rejecting user:', error)
      toast.error('Failed to reject user')
    }
  }

  const handleAddNewUser = async (userData: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role,
          is_authorized: false
        }])
        .select()

      if (error) throw error
      
      await loadDashboardData() // Refresh data
      toast.success('New user added successfully!')
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error('Failed to add user')
    }
  }

  const handleGenerateReports = async () => {
    try {
      // Generate comprehensive system report
      const reportData = {
        totalUsers: users.length,
        pendingAuthorizations: pendingUsers.length,
        systemLogs: systemLogs.length,
        timestamp: new Date().toISOString()
      }
      
      // Create system log entry
      await systemLogService.create({
        action: 'Report Generated',
        user_id: '11111111-1111-1111-1111-111111111111', // Admin user ID
        details: `System report generated with ${reportData.totalUsers} users, ${reportData.pendingAuthorizations} pending authorizations`
      })
      
      toast.success('System report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
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
      >
        <h1 className="text-3xl font-bold text-primary mb-2">Admin Control Center</h1>
        <p className="text-gray-600">Manage users, monitor system activity, and oversee all modules</p>
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
              <p className="text-2xl font-bold text-orange-500">{loading ? '...' : pendingUsers.length}</p>
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
            <h3 className="text-lg font-semibold text-primary">Pending Authorizations</h3>
            <button className="btn-primary text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Loading pending users...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No pending authorizations</div>
            ) : (
              pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Role: {user.role}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAuthorizeUser(user.id)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectUser(user.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowAddUserForm(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Add New User</span>
          </button>
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
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="input-field w-full"
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
    </div>
  )
}

export default AdminDashboard
