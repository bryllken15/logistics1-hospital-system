import React from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, Activity, Shield, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const AdminDashboard = () => {
  // Mock data
  const userStats = [
    { role: 'Admin', count: 1, color: '#1D3557' },
    { role: 'Manager', count: 2, color: '#457B9D' },
    { role: 'Employee', count: 15, color: '#00A896' },
    { role: 'Procurement', count: 8, color: '#F77F00' },
    { role: 'Maintenance', count: 5, color: '#FCBF49' },
    { role: 'Document Analyst', count: 3, color: '#D62828' }
  ]

  const procurementData = [
    { month: 'Jan', approved: 45, pending: 12 },
    { month: 'Feb', approved: 52, pending: 8 },
    { month: 'Mar', approved: 48, pending: 15 },
    { month: 'Apr', approved: 61, pending: 6 },
    { month: 'May', approved: 55, pending: 9 },
    { month: 'Jun', approved: 67, pending: 4 }
  ]

  const systemLogs = [
    { id: 1, action: 'User Login', user: 'admin', timestamp: '2025-01-15 10:30:00', status: 'success' },
    { id: 2, action: 'RFID Scan', user: 'employee1', timestamp: '2025-01-15 10:25:00', status: 'success' },
    { id: 3, action: 'Purchase Order Created', user: 'procurement1', timestamp: '2025-01-15 10:20:00', status: 'success' },
    { id: 4, action: 'Asset Maintenance', user: 'maintenance1', timestamp: '2025-01-15 10:15:00', status: 'success' },
    { id: 5, action: 'Document Upload', user: 'document1', timestamp: '2025-01-15 10:10:00', status: 'success' }
  ]

  const pendingUsers = [
    { id: 1, name: 'John Doe', email: 'john@hospital.com', role: 'Employee', requestedAt: '2025-01-14' },
    { id: 2, name: 'Jane Smith', email: 'jane@hospital.com', role: 'Procurement Staff', requestedAt: '2025-01-13' }
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
              <p className="text-2xl font-bold text-primary">34</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Authorizations</p>
              <p className="text-2xl font-bold text-orange-500">2</p>
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
            {pendingUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">Role: {user.role}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600">
                    Reject
                  </button>
                </div>
              </div>
            ))}
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
            {systemLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{log.action}</p>
                  <p className="text-sm text-gray-600">by {log.user}</p>
                  <p className="text-xs text-gray-500">{log.timestamp}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {log.status}
                </div>
              </div>
            ))}
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
          <button className="btn-primary flex items-center justify-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Add New User</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <UserCheck className="w-5 h-5" />
            <span>Authorize Account</span>
          </button>
          <button className="btn-primary flex items-center justify-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Generate Reports</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard
