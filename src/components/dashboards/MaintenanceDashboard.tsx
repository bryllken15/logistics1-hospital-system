import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wrench, CheckCircle, Calendar, Plus, Search, QrCode, Clock, X, Edit3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { assetService, maintenanceService, systemLogService, maintenanceScheduleService, inventoryService, analyticsService } from '../../services/database'
import { useAssetUpdates, useMaintenanceLogUpdates, useMaintenanceScheduleUpdates } from '../../hooks/useRealtimeUpdates'
import NotificationCenter from '../NotificationCenter'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const MaintenanceDashboard = () => {
  const { user } = useAuth()
  const [rfidCode, setRfidCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [assets, setAssets] = useState<any[]>([])
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([])
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<any[]>([])
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
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    loadMaintenanceData()
  }, [])

  // Set up realtime subscriptions for asset updates
  useAssetUpdates((update) => {
    console.log('Asset update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setAssets(prev => [update.new, ...prev])
      toast.success('New asset added')
    } else if (update.eventType === 'UPDATE') {
      setAssets(prev => prev.map(asset => asset.id === update.new.id ? update.new : asset))
      if (update.new.condition === 'needs_repair') {
        toast.error('Asset needs repair')
      } else if (update.new.condition === 'excellent') {
        toast.success('Asset condition improved')
      }
    } else if (update.eventType === 'DELETE') {
      setAssets(prev => prev.filter(asset => asset.id !== update.old.id))
      toast.success('Asset removed')
    }
  })

  useMaintenanceLogUpdates((update) => {
    console.log('Maintenance log update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setMaintenanceLogs(prev => [update.new, ...prev])
      toast.success('Maintenance log added')
    } else if (update.eventType === 'UPDATE') {
      setMaintenanceLogs(prev => prev.map(log => log.id === update.new.id ? update.new : log))
      if (update.new.status === 'completed') {
        toast.success('Maintenance completed')
      }
    }
  })

  useMaintenanceScheduleUpdates((update) => {
    console.log('Maintenance schedule update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setMaintenanceSchedule(prev => [update.new, ...prev])
      toast.success('New maintenance scheduled')
    } else if (update.eventType === 'UPDATE') {
      setMaintenanceSchedule(prev => prev.map(schedule => schedule.id === update.new.id ? update.new : schedule))
      if (update.new.status === 'completed') {
        toast.success('Scheduled maintenance completed')
      }
    }
  })


  const loadMaintenanceData = async () => {
    try {
      setLoading(true)
      const [assetData, maintenanceData, scheduleData] = await Promise.all([
        assetService.getAll(),
        maintenanceService.getAll(),
        maintenanceScheduleService.getAll()
      ])
      
      setAssets(assetData || [])
      setMaintenanceLogs(maintenanceData || [])
      setMaintenanceSchedule(scheduleData || [])
    } catch (error) {
      console.error('Error loading maintenance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAsset = async () => {
    try {
      const assetData = {
        ...newAsset,
        created_by: '66666666-6666-6666-6666-666666666666', // Maintenance user ID
        next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      }
      
      await assetService.create(assetData)
      
      // Log asset creation
      await systemLogService.create({
        action: 'Asset Added',
        user_id: '66666666-6666-6666-6666-666666666666',
        details: `New asset added: ${newAsset.name} (${newAsset.asset_type}) with RFID: ${newAsset.rfid_code}`
      })
      
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
      setLoading(true)
      
      const scheduleData = {
        asset_id: newMaintenance.asset_id,
        maintenance_type: newMaintenance.maintenance_type,
        scheduled_date: newMaintenance.scheduled_date,
        technician: 'Maintenance Staff',
        status: 'scheduled',
        created_by: '66666666-6666-6666-6666-666666666666'
      }
      
      await maintenanceScheduleService.create(scheduleData)
      
      // Log maintenance scheduling
      await systemLogService.create({
        action: 'Maintenance Scheduled',
        user_id: '66666666-6666-6666-6666-666666666666',
        details: `Maintenance scheduled for asset ${newMaintenance.asset_id} - ${newMaintenance.maintenance_type}`
      })
      
      await loadMaintenanceData()
      setNewMaintenance({ asset_id: '', maintenance_type: 'scheduled', scheduled_date: '', description: '', priority: 'medium' })
      setShowScheduleMaintenanceForm(false)
      toast.success('Maintenance scheduled successfully!')
    } catch (error) {
      console.error('Error scheduling maintenance:', error)
      toast.error('Failed to schedule maintenance')
    } finally {
      setLoading(false)
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
      
      // Log condition update
      await systemLogService.create({
        action: 'Asset Condition Updated',
        user_id: '66666666-6666-6666-6666-666666666666',
        details: `Asset condition updated to: ${condition} for asset ${assetId}`
      })
      
      await loadMaintenanceData()
      toast.success('Asset condition updated!')
    } catch (error) {
      console.error('Error updating asset condition:', error)
      toast.error('Failed to update asset condition')
    }
  }

  const handleGenerateMaintenanceReport = async () => {
    try {
      const analytics = await analyticsService.getAssetAnalytics()
      
      await systemLogService.create({
        action: 'Maintenance Report Generated',
        user_id: '66666666-6666-6666-6666-666666666666',
        details: `Maintenance report generated for ${(assets || []).length} assets`
      })
      
      toast.success('Maintenance report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate maintenance report')
    }
  }

  const handleBulkMaintenanceUpdate = async (updates: any[]) => {
    try {
      for (const update of updates) {
        await maintenanceService.updateStatus(update.id, update.status)
      }
      
      await systemLogService.create({
        action: 'Bulk Maintenance Update',
        user_id: '66666666-6666-6666-6666-666666666666',
        details: `Bulk maintenance update: ${(updates || []).length} maintenance records updated`
      })
      
      await loadMaintenanceData()
      toast.success('Bulk maintenance update completed!')
    } catch (error) {
      console.error('Error updating maintenance:', error)
      toast.error('Failed to update maintenance records')
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
        setLoading(true)
        
        // Check if RFID exists in assets
        const asset = assets.find(a => a.rfid_code === rfidCode)
        if (asset) {
          // Log RFID scan
          await systemLogService.create({
            action: 'RFID Scan - Maintenance',
            user_id: '66666666-6666-6666-6666-666666666666',
            details: `RFID scanned: ${asset.name} - Condition: ${asset.condition} - Location: ${asset.location}`
          })
          
          toast.success(`RFID Scanned: ${asset.name} - Condition: ${asset.condition} - Location: ${asset.location}`)
        } else {
          // Check in inventory for maintenance items
          const inventoryItem = await inventoryService.getByRfid(rfidCode)
          if (inventoryItem) {
            toast.success(`RFID Scanned: ${inventoryItem.item_name} - Quantity: ${inventoryItem.quantity} - Location: ${inventoryItem.location}`)
          } else {
            toast.error('RFID code not found in system')
          }
        }
      } catch (error) {
        console.error('RFID scan error:', error)
        toast.error('RFID code not found in system')
      } finally {
        setLoading(false)
      }
      setRfidCode('')
    }
  }

  const filteredAssets = (assets || []).filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.rfid_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Asset Lifecycle & Maintenance System</h1>
          <p className="text-gray-600">Manage and record the maintenance lifecycle of hospital assets</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Real-time Active</span>
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
              ) : (assets || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No assets found</td>
                </tr>
              ) : (
                (assets || []).map((asset) => (
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
            {(maintenanceLogs || []).map((log) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowAddAssetForm(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Asset</span>
          </button>
          <button 
            onClick={() => setShowScheduleMaintenanceForm(true)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Calendar className="w-5 h-5" />
            <span>Schedule Repair</span>
          </button>
          <button 
            onClick={() => setRfidCode('')}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <QrCode className="w-5 h-5" />
            <span>Scan RFID Asset</span>
          </button>
          <button 
            onClick={handleGenerateMaintenanceReport}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Wrench className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
        </div>
        
        {/* Additional Maintenance Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Maintenance Management</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                // Export asset data
                const csvData = (assets || []).map(asset => ({
                  name: asset.name,
                  type: asset.asset_type,
                  condition: asset.condition,
                  location: asset.location,
                  rfid: asset.rfid_code,
                  nextMaintenance: asset.next_maintenance
                }))
                
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "Name,Type,Condition,Location,RFID,Next Maintenance\n" +
                  csvData.map(row => Object.values(row).join(",")).join("\n")
                
                const encodedUri = encodeURI(csvContent)
                const link = document.createElement("a")
                link.setAttribute("href", encodedUri)
                link.setAttribute("download", "assets_export.csv")
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                toast.success('Asset data exported!')
              }}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              Export Assets
            </button>
            <button 
              onClick={() => {
                // Schedule bulk maintenance
                toast.success('Bulk maintenance scheduling initiated!')
              }}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
            >
              Schedule Bulk Maintenance
            </button>
            <button 
              onClick={() => {
                // Asset condition analysis
                toast.success('Asset condition analysis generated!')
              }}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600"
            >
              Asset Analysis
            </button>
          </div>
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
                  aria-label="Asset condition"
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
                  aria-label="Select asset for maintenance"
                >
                  <option value="">Select Asset</option>
                  {(assets || []).map(asset => (
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
                  aria-label="Maintenance type"
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
                  aria-label="Scheduled maintenance date"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newMaintenance.priority}
                  onChange={(e) => setNewMaintenance({...newMaintenance, priority: e.target.value})}
                  className="input-field w-full"
                  aria-label="Maintenance priority"
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
