import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wrench, CheckCircle, Calendar, Plus, Search, QrCode, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const MaintenanceDashboard = () => {
  const [rfidCode, setRfidCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data
  const assetStatus = [
    { status: 'In Operation', count: 45, color: '#00A896' },
    { status: 'Under Repair', count: 8, color: '#F77F00' },
    { status: 'Scheduled Maintenance', count: 12, color: '#FCBF49' },
    { status: 'Out of Service', count: 3, color: '#D62828' }
  ]

  const maintenanceHistory = [
    { month: 'Jan', completed: 15, scheduled: 18, emergency: 3 },
    { month: 'Feb', completed: 22, scheduled: 20, emergency: 2 },
    { month: 'Mar', completed: 18, scheduled: 16, emergency: 4 },
    { month: 'Apr', completed: 25, scheduled: 22, emergency: 1 },
    { month: 'May', completed: 20, scheduled: 19, emergency: 3 },
    { month: 'Jun', completed: 28, scheduled: 25, emergency: 2 }
  ]

  const assetList = [
    { id: 1, name: 'MRI Machine', tagId: 'RFID001', condition: 'Good', nextMaintenance: '2025-02-15', location: 'Radiology' },
    { id: 2, name: 'Ventilator Unit', tagId: 'RFID002', condition: 'Needs Repair', nextMaintenance: '2025-01-20', location: 'ICU' },
    { id: 3, name: 'X-Ray Machine', tagId: 'RFID003', condition: 'Excellent', nextMaintenance: '2025-03-10', location: 'Emergency' },
    { id: 4, name: 'Ultrasound Scanner', tagId: 'RFID004', condition: 'Good', nextMaintenance: '2025-02-28', location: 'Obstetrics' },
    { id: 5, name: 'CT Scanner', tagId: 'RFID005', condition: 'Under Repair', nextMaintenance: '2025-01-25', location: 'Radiology' },
    { id: 6, name: 'Dialysis Machine', tagId: 'RFID006', condition: 'Good', nextMaintenance: '2025-02-05', location: 'Nephrology' }
  ]

  const maintenanceLogs = [
    { id: 1, asset: 'MRI Machine', type: 'Scheduled', date: '2025-01-15', technician: 'John Smith', status: 'Completed', cost: '₱5,000' },
    { id: 2, asset: 'Ventilator Unit', type: 'Emergency', date: '2025-01-14', technician: 'Sarah Johnson', status: 'In Progress', cost: '₱8,500' },
    { id: 3, asset: 'X-Ray Machine', type: 'Preventive', date: '2025-01-13', technician: 'Mike Davis', status: 'Completed', cost: '₱3,200' },
    { id: 4, asset: 'Ultrasound Scanner', type: 'Scheduled', date: '2025-01-12', technician: 'Lisa Wilson', status: 'Completed', cost: '₱2,800' }
  ]

  const upcomingMaintenance = [
    { id: 1, asset: 'CT Scanner', type: 'Critical', date: '2025-01-25', priority: 'High' },
    { id: 2, asset: 'Dialysis Machine', type: 'Preventive', date: '2025-02-05', priority: 'Medium' },
    { id: 3, asset: 'MRI Machine', type: 'Scheduled', date: '2025-02-15', priority: 'Medium' },
    { id: 4, asset: 'Ultrasound Scanner', type: 'Preventive', date: '2025-02-28', priority: 'Low' }
  ]

  const handleRfidScan = () => {
    if (rfidCode) {
      // Simulate RFID scan for asset
      const asset = assetList.find(item => item.tagId === rfidCode)
      if (asset) {
        alert(`RFID Scanned: ${asset.name} - Condition: ${asset.condition} - Next Maintenance: ${asset.nextMaintenance}`)
      } else {
        alert('RFID code not found in asset database')
      }
      setRfidCode('')
    }
  }

  const filteredAssets = assetList.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-2">Asset Lifecycle & Maintenance System</h1>
        <p className="text-gray-600">Manage and record the maintenance lifecycle of hospital assets</p>
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
              <p className="text-sm font-medium text-gray-600">Assets in Operation</p>
              <p className="text-2xl font-bold text-green-500">45</p>
              <p className="text-xs text-green-600">94% operational</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assets Under Repair</p>
              <p className="text-2xl font-bold text-orange-500">8</p>
              <p className="text-xs text-orange-600">3 critical</p>
            </div>
            <Wrench className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Maintenance</p>
              <p className="text-2xl font-bold text-blue-500">12</p>
              <p className="text-xs text-blue-600">This month</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">RFID-Tagged Equipment</p>
              <p className="text-2xl font-bold text-primary">68</p>
              <p className="text-xs text-green-600">100% coverage</p>
            </div>
            <QrCode className="w-8 h-8 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* RFID Scanner Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">RFID Asset Scanner</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scan RFID for Asset Information
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={rfidCode}
                onChange={(e) => setRfidCode(e.target.value)}
                placeholder="Scan or enter RFID code..."
                className="input-field flex-1"
              />
              <button
                onClick={handleRfidScan}
                className="btn-primary flex items-center space-x-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan</span>
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="btn-secondary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Maintenance Log</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Schedule Repair</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Asset Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {assetStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Maintenance History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Maintenance History Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={maintenanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#00A896" name="Completed" />
              <Bar dataKey="scheduled" fill="#1D3557" name="Scheduled" />
              <Bar dataKey="emergency" fill="#F77F00" name="Emergency" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Asset List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Asset List</h3>
          <button className="btn-primary text-sm">Add Asset</button>
        </div>
        
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets, RFID codes, or locations..."
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Asset Name</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Tag ID</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Condition</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Next Maintenance</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Location</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 text-sm text-gray-900">{asset.name}</td>
                  <td className="py-3 text-sm text-gray-600 font-mono">{asset.tagId}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      asset.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                      asset.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                      asset.condition === 'Needs Repair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-900">{asset.nextMaintenance}</td>
                  <td className="py-3 text-sm text-gray-600">{asset.location}</td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-primary">
                        <Wrench className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-primary">
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Recent Maintenance History</h3>
            <button className="btn-primary text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {maintenanceLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{log.asset}</p>
                  <p className="text-sm text-gray-600">{log.type} • {log.technician}</p>
                  <p className="text-xs text-gray-500">{log.date} • {log.cost}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  log.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Maintenance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Upcoming Maintenance</h3>
            <button className="btn-primary text-sm">View Calendar</button>
          </div>
          <div className="space-y-3">
            {upcomingMaintenance.map((maintenance) => (
              <div key={maintenance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{maintenance.asset}</p>
                  <p className="text-sm text-gray-600">{maintenance.type} • {maintenance.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    maintenance.priority === 'High' ? 'bg-red-100 text-red-800' :
                    maintenance.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {maintenance.priority}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-primary">
                    <Clock className="w-4 h-4" />
                  </button>
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
        transition={{ duration: 0.5, delay: 0.8 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Maintenance Log</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Schedule Repair</span>
          </button>
          <button className="btn-primary flex items-center justify-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Scan RFID Asset</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default MaintenanceDashboard
