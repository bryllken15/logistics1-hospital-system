import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wrench, CheckCircle, Calendar, Plus, Search, QrCode, Clock, X, Edit3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { assetService, maintenanceService, systemLogService } from '../../services/database'
import toast from 'react-hot-toast'

const MaintenanceDashboard = () => {
  const [rfidCode, setRfidCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [assets, setAssets] = useState<any[]>([])
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddAssetForm, setShowAddAssetForm] = useState(false)
  const [showScheduleMaintenanceForm, setShowScheduleMaintenanceForm] = useState(false)
  const [newAsset, setNewAsset] = useState({
    name: '',
    asset_type: '',
    location: '',
    condition: 'good',
    rfid_code: ''
  })
  const [newMaintenance, setNewMaintenance] = useState({
    asset_id: '',
    maintenance_type: 'scheduled',
    scheduled_date: '',
    description: '',
    priority: 'medium'
  })

  useEffect(() => {
    loadMaintenanceData()
  }, [])

  const loadMaintenanceData = async () => {
    try {
      setLoading(true)
      const [assetData, maintenanceData] = await Promise.all([
        assetService.getAll(),
        maintenanceService.getAll()
      ])
      
      setAssets(assetData)
      setMaintenanceLogs(maintenanceData)
    } catch (error) {
      console.error('Error loading maintenance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAsset = async () => {
    try {
      await assetService.create(newAsset)
      await loadMaintenanceData()
      setNewAsset({ name: '', asset_type: '', location: '', condition: 'good', rfid_code: '' })
      setShowAddAssetForm(false)
      toast.success('Asset added successfully!')
    } catch (error) {
      console.error('Error adding asset:', error)
      toast.error('Failed to add asset')
    }
  }

  const handleScheduleMaintenance = async () => {
    try {
      await maintenanceService.create(newMaintenance)
      
      // Log maintenance scheduling
      await systemLogService.create({
        action: 'Maintenance Scheduled',
        user_id: '66666666-6666-6666-6666-666666666666', // Maintenance user ID
        details: `Maintenance scheduled for asset ${newMaintenance.asset_id} - ${newMaintenance.maintenance_type}`
      })
      
      await loadMaintenanceData()
      setNewMaintenance({ asset_id: '', maintenance_type: 'scheduled', scheduled_date: '', description: '', priority: 'medium' })
      setShowScheduleMaintenanceForm(false)
      toast.success('Maintenance scheduled successfully!')
    } catch (error) {
      console.error('Error scheduling maintenance:', error)
      toast.error('Failed to schedule maintenance')
    }
  }

  const handleCompleteMaintenance = async (maintenanceId: string) => {
    try {
      await maintenanceService.updateStatus(maintenanceId, 'completed')
      await loadMaintenanceData()
      toast.success('Maintenance marked as completed!')
    } catch (error) {
      console.error('Error completing maintenance:', error)
      toast.error('Failed to complete maintenance')
    }
  }

  const handleUpdateAssetCondition = async (assetId: string, condition: string) => {
    try {
      await assetService.updateCondition(assetId, condition)
      await loadMaintenanceData()
      toast.success('Asset condition updated!')
    } catch (error) {
      console.error('Error updating asset condition:', error)
      toast.error('Failed to update asset condition')
    }
  }

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


  const upcomingMaintenance = [
    { id: 1, asset: 'CT Scanner', type: 'Critical', date: '2025-01-25', priority: 'High' },
    { id: 2, asset: 'Dialysis Machine', type: 'Preventive', date: '2025-02-05', priority: 'Medium' },
    { id: 3, asset: 'MRI Machine', type: 'Scheduled', date: '2025-02-15', priority: 'Medium' },
    { id: 4, asset: 'Ultrasound Scanner', type: 'Preventive', date: '2025-02-28', priority: 'Low' }
  ]

  const handleRfidScan = async () => {
    if (rfidCode) {
      try {
        const asset = assets.find(a => a.rfid_code === rfidCode)
        if (asset) {
          toast.success(`RFID Scanned: ${asset.name} - Condition: ${asset.condition} - Location: ${asset.location}`)
        } else {
          toast.error('RFID code not found in assets')
        }
      } catch (error) {
        toast.error('RFID code not found in assets')
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
          <button 
            onClick={() => setShowAddAssetForm(true)}
            className="btn-primary text-sm"
          >
            Add Asset
          </button>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Loading assets...</td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No assets found</td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">{asset.name}</td>
                    <td className="py-3 text-sm text-gray-600 font-mono">{asset.rfid_code}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        asset.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                        asset.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                        asset.condition === 'needs_repair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {asset.condition.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-900">{new Date(asset.next_maintenance).toLocaleDateString()}</td>
                    <td className="py-3 text-sm text-gray-600">{asset.location}</td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleUpdateAssetCondition(asset.id, 'needs_repair')}
                          className="p-1 text-gray-400 hover:text-primary"
                          title="Mark for Repair"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setNewMaintenance({...newMaintenance, asset_id: asset.id})
                            setShowScheduleMaintenanceForm(true)
                          }}
                          className="p-1 text-gray-400 hover:text-primary"
                          title="Schedule Maintenance"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

      {/* Add Asset Modal */}
      {showAddAssetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Add New Asset</h3>
              <button
                onClick={() => setShowAddAssetForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  className="input-field w-full"
                  placeholder="MRI Machine"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                <input
                  type="text"
                  value={newAsset.asset_type}
                  onChange={(e) => setNewAsset({...newAsset, asset_type: e.target.value})}
                  className="input-field w-full"
                  placeholder="Medical Equipment"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
                  className="input-field w-full"
                  placeholder="Radiology Department"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RFID Code</label>
                <input
                  type="text"
                  value={newAsset.rfid_code}
                  onChange={(e) => setNewAsset({...newAsset, rfid_code: e.target.value})}
                  className="input-field w-full"
                  placeholder="RFID001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={newAsset.condition}
                  onChange={(e) => setNewAsset({...newAsset, condition: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="needs_repair">Needs Repair</option>
                  <option value="out_of_service">Out of Service</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddAssetForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAsset}
                className="btn-primary"
              >
                Add Asset
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      {showScheduleMaintenanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Schedule Maintenance</h3>
              <button
                onClick={() => setShowScheduleMaintenanceForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                <select
                  value={newMaintenance.asset_id}
                  onChange={(e) => setNewMaintenance({...newMaintenance, asset_id: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="">Select Asset</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Type</label>
                <select
                  value={newMaintenance.maintenance_type}
                  onChange={(e) => setNewMaintenance({...newMaintenance, maintenance_type: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="preventive">Preventive</option>
                  <option value="emergency">Emergency</option>
                  <option value="repair">Repair</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                <input
                  type="date"
                  value={newMaintenance.scheduled_date}
                  onChange={(e) => setNewMaintenance({...newMaintenance, scheduled_date: e.target.value})}
                  className="input-field w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newMaintenance.priority}
                  onChange={(e) => setNewMaintenance({...newMaintenance, priority: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Maintenance description..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleMaintenanceForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleMaintenance}
                className="btn-primary"
              >
                Schedule Maintenance
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceDashboard
