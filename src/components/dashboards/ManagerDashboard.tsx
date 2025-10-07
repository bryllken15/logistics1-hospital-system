import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Package, ClipboardList, Wrench, CheckCircle, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const ManagerDashboard = () => {
  // Mock data
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

  const approvalRequests = [
    { id: 1, type: 'Purchase Order', amount: '₱45,000', department: 'Procurement', priority: 'High', status: 'Pending' },
    { id: 2, type: 'Asset Maintenance', amount: '₱12,500', department: 'Maintenance', priority: 'Medium', status: 'Pending' },
    { id: 3, type: 'Equipment Request', amount: '₱78,000', department: 'Warehouse', priority: 'High', status: 'Pending' },
    { id: 4, type: 'Supply Order', amount: '₱23,000', department: 'Procurement', priority: 'Low', status: 'Approved' }
  ]

  const projectStatus = [
    { id: 1, name: 'Emergency Ward Renovation', progress: 75, status: 'On Track', deadline: '2025-03-15' },
    { id: 2, name: 'New Equipment Installation', progress: 45, status: 'Delayed', deadline: '2025-02-28' },
    { id: 3, name: 'Supply Chain Optimization', progress: 90, status: 'On Track', deadline: '2025-01-30' },
    { id: 4, name: 'RFID Implementation', progress: 30, status: 'In Progress', deadline: '2025-04-10' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-2">Manager Overview</h1>
        <p className="text-gray-600">Monitor system activity, approve requests, and oversee department performance</p>
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
            {approvalRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{request.type}</p>
                  <p className="text-sm text-gray-600">{request.department} • {request.amount}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.priority === 'High' ? 'bg-red-100 text-red-800' :
                      request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === 'Pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
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
            {projectStatus.map((project) => (
              <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    project.status === 'On Track' ? 'bg-green-100 text-green-800' :
                    project.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress: {project.progress}%</span>
                  <span className="text-sm text-gray-600">Deadline: {project.deadline}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
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
            <CheckCircle className="w-5 h-5" />
            <span>Approve Requests</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>View Reports</span>
          </button>
          <button className="btn-primary flex items-center justify-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Monitor Progress</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ManagerDashboard
