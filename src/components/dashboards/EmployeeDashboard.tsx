import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, Download, Plus, Search, QrCode, AlertTriangle, X, Edit3 } from 'lucide-react'
import { inventoryService, systemLogService } from '../../services/database'
import toast from 'react-hot-toast'

const EmployeeDashboard = () => {
  const [rfidCode, setRfidCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [inventoryData, setInventoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInventoryData()
  }, [])

  const loadInventoryData = async () => {
    try {
      setLoading(true)
      const data = await inventoryService.getAll()
      setInventoryData(data)
    } catch (error) {
      console.error('Error loading inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock delivery logs for now (can be replaced with real data later)
  const deliveryLogs = [
    { id: 1, destination: 'Emergency Ward', items: 15, date: '2025-01-15 09:30', status: 'Delivered' },
    { id: 2, destination: 'Surgery Department', items: 8, date: '2025-01-15 10:15', status: 'In Transit' },
    { id: 3, destination: 'ICU', items: 12, date: '2025-01-15 11:00', status: 'Delivered' },
    { id: 4, destination: 'Pediatrics', items: 6, date: '2025-01-15 11:45', status: 'Pending' }
  ]

  const lowStockItems = inventoryData.filter(item => item.status === 'low_stock' || item.status === 'critical')

  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [showDeliveryForm, setShowDeliveryForm] = useState(false)
  const [newItem, setNewItem] = useState({
    item_name: '',
    rfid_code: '',
    quantity: 0,
    location: '',
    status: 'in_stock'
  })
  const [deliveryData, setDeliveryData] = useState({
    destination: '',
    items: 0,
    description: ''
  })

  const handleRfidScan = async () => {
    if (rfidCode) {
      try {
        const item = await inventoryService.getByRfid(rfidCode)
        if (item) {
          toast.success(`RFID Scanned: ${item.item_name} - Quantity: ${item.quantity} - Location: ${item.location}`)
        } else {
          toast.error('RFID code not found in inventory')
        }
      } catch (error) {
        toast.error('RFID code not found in inventory')
      }
      setRfidCode('')
    }
  }

  const handleAddItem = async () => {
    try {
      await inventoryService.create(newItem)
      await loadInventoryData()
      setNewItem({ item_name: '', rfid_code: '', quantity: 0, location: '', status: 'in_stock' })
      setShowAddItemForm(false)
      toast.success('Inventory item added successfully!')
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add inventory item')
    }
  }

  const handleRecordDelivery = async () => {
    try {
      // Create delivery record in system logs
      await systemLogService.create({
        action: 'Delivery Recorded',
        user_id: '33333333-3333-3333-3333-333333333333', // Employee user ID
        details: `Delivery to ${deliveryData.destination}: ${deliveryData.items} items - ${deliveryData.description}`
      })
      
      setDeliveryData({ destination: '', items: 0, description: '' })
      setShowDeliveryForm(false)
      toast.success('Delivery recorded successfully!')
    } catch (error) {
      console.error('Error recording delivery:', error)
      toast.error('Failed to record delivery')
    }
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await inventoryService.updateQuantity(itemId, newQuantity)
      await loadInventoryData()
      toast.success('Inventory quantity updated!')
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    }
  }

  const filteredInventory = inventoryData.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rfid_code.toLowerCase().includes(searchTerm.toLowerCase())
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
              <p className="text-2xl font-bold text-primary">{loading ? '...' : inventoryData.length}</p>
              <p className="text-xs text-green-600">Live data from database</p>
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
            <button 
              onClick={() => setShowAddItemForm(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
            <button 
              onClick={() => setShowDeliveryForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
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
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">Loading inventory...</td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">No inventory items found</td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 text-sm text-gray-900">{item.item_name}</td>
                      <td className="py-3 text-sm text-gray-600 font-mono">{item.rfid_code}</td>
                      <td className="py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                          item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
                <p className="font-medium text-gray-900">{item.item_name}</p>
                <p className="text-sm text-gray-600">RFID: {item.rfid_code}</p>
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
          <button 
            onClick={() => setShowAddItemForm(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Inventory</span>
          </button>
          <button 
            onClick={() => setRfidCode('')}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <QrCode className="w-5 h-5" />
            <span>Scan RFID</span>
          </button>
          <button 
            onClick={() => setShowDeliveryForm(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Truck className="w-5 h-5" />
            <span>Record Delivery</span>
          </button>
        </div>
      </motion.div>

      {/* Add Item Modal */}
      {showAddItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Add Inventory Item</h3>
              <button
                onClick={() => setShowAddItemForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({...newItem, item_name: e.target.value})}
                  className="input-field w-full"
                  placeholder="Surgical Masks"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RFID Code</label>
                <input
                  type="text"
                  value={newItem.rfid_code}
                  onChange={(e) => setNewItem({...newItem, rfid_code: e.target.value})}
                  className="input-field w-full"
                  placeholder="RFID001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                  className="input-field w-full"
                  placeholder="A-1-01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newItem.status}
                  onChange={(e) => setNewItem({...newItem, status: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="critical">Critical</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddItemForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="btn-primary"
              >
                Add Item
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Record Delivery Modal */}
      {showDeliveryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Record Delivery</h3>
              <button
                onClick={() => setShowDeliveryForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <input
                  type="text"
                  value={deliveryData.destination}
                  onChange={(e) => setDeliveryData({...deliveryData, destination: e.target.value})}
                  className="input-field w-full"
                  placeholder="Emergency Ward"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Items</label>
                <input
                  type="number"
                  value={deliveryData.items}
                  onChange={(e) => setDeliveryData({...deliveryData, items: parseInt(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="15"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={deliveryData.description}
                  onChange={(e) => setDeliveryData({...deliveryData, description: e.target.value})}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Medical supplies for emergency procedures..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeliveryForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordDelivery}
                className="btn-primary"
              >
                Record Delivery
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default EmployeeDashboard
