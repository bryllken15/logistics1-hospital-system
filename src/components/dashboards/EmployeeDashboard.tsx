import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, Download, Plus, Search, QrCode, AlertTriangle } from 'lucide-react'

const EmployeeDashboard = () => {
  const [rfidCode, setRfidCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data
  const inventoryData = [
    { id: 1, item: 'Surgical Masks', rfid: 'RFID001', quantity: 150, status: 'In Stock', location: 'A-1-01' },
    { id: 2, item: 'Disposable Gloves', rfid: 'RFID002', quantity: 45, status: 'Low Stock', location: 'A-1-02' },
    { id: 3, item: 'Antiseptic Solution', rfid: 'RFID003', quantity: 200, status: 'In Stock', location: 'A-2-01' },
    { id: 4, item: 'Bandages', rfid: 'RFID004', quantity: 12, status: 'Critical', location: 'A-2-02' },
    { id: 5, item: 'Syringes', rfid: 'RFID005', quantity: 300, status: 'In Stock', location: 'B-1-01' },
    { id: 6, item: 'Thermometers', rfid: 'RFID006', quantity: 8, status: 'Low Stock', location: 'B-1-02' }
  ]

  const deliveryLogs = [
    { id: 1, destination: 'Emergency Ward', items: 15, date: '2025-01-15 09:30', status: 'Delivered' },
    { id: 2, destination: 'Surgery Department', items: 8, date: '2025-01-15 10:15', status: 'In Transit' },
    { id: 3, destination: 'ICU', items: 12, date: '2025-01-15 11:00', status: 'Delivered' },
    { id: 4, destination: 'Pediatrics', items: 6, date: '2025-01-15 11:45', status: 'Pending' }
  ]

  const lowStockItems = inventoryData.filter(item => item.status === 'Low Stock' || item.status === 'Critical')

  const handleRfidScan = () => {
    if (rfidCode) {
      // Simulate RFID scan
      const item = inventoryData.find(item => item.rfid === rfidCode)
      if (item) {
        alert(`RFID Scanned: ${item.item} - Quantity: ${item.quantity} - Location: ${item.location}`)
      } else {
        alert('RFID code not found in inventory')
      }
      setRfidCode('')
    }
  }

  const filteredInventory = inventoryData.filter(item =>
    item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rfid.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-2">Smart Warehousing System</h1>
        <p className="text-gray-600">Manage inventory, handle RFID scanning, and update item records</p>
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
              <p className="text-sm font-medium text-gray-600">Total Items in Stock</p>
              <p className="text-2xl font-bold text-primary">715</p>
              <p className="text-xs text-green-600">+5% from last week</p>
            </div>
            <Package className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-orange-500">{lowStockItems.length}</p>
              <p className="text-xs text-orange-600">Requires attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outgoing Deliveries</p>
              <p className="text-2xl font-bold text-secondary">4</p>
              <p className="text-xs text-blue-600">Today's schedule</p>
            </div>
            <Truck className="w-8 h-8 text-secondary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Incoming Shipments</p>
              <p className="text-2xl font-bold text-accent">2</p>
              <p className="text-xs text-green-600">Expected today</p>
            </div>
            <Download className="w-8 h-8 text-accent" />
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
        <h3 className="text-lg font-semibold text-primary mb-4">RFID Scanner</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RFID Code Scanner
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
              <span>Add Item</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Record Delivery</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Inventory Table</h3>
            <button className="btn-primary text-sm">Export Report</button>
          </div>
          
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items or RFID codes..."
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Item</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">RFID</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Qty</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">{item.item}</td>
                    <td className="py-3 text-sm text-gray-600 font-mono">{item.rfid}</td>
                    <td className="py-3 text-sm text-gray-900">{item.quantity}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                        item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Delivery Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Delivery Logs</h3>
            <button className="btn-primary text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {deliveryLogs.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{delivery.destination}</p>
                  <p className="text-sm text-gray-600">{delivery.items} items • {delivery.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  delivery.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {delivery.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card p-6 border-l-4 border-orange-500"
        >
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500">Low Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="font-medium text-gray-900">{item.item}</p>
                <p className="text-sm text-gray-600">RFID: {item.rfid}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-sm text-gray-600">Location: {item.location}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

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
            <Plus className="w-5 h-5" />
            <span>Add Inventory</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Scan RFID</span>
          </button>
          <button className="btn-primary flex items-center justify-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Record Delivery</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default EmployeeDashboard
