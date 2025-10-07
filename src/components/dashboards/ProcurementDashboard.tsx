import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Truck, Package, TrendingUp, Plus, Search, QrCode, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const ProcurementDashboard = () => {
  const [rfidCode, setRfidCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data
  const supplierPerformance = [
    { name: 'MedSupply Co.', orders: 45, onTime: 42, rating: 93 },
    { name: 'HealthTech Ltd.', orders: 38, onTime: 35, rating: 92 },
    { name: 'MedEquip Inc.', orders: 52, onTime: 48, rating: 88 },
    { name: 'PharmaCorp', orders: 29, onTime: 25, rating: 86 }
  ]

  const monthlySpending = [
    { month: 'Jan', amount: 450000, orders: 12 },
    { month: 'Feb', amount: 520000, orders: 15 },
    { month: 'Mar', amount: 480000, orders: 13 },
    { month: 'Apr', amount: 610000, orders: 18 },
    { month: 'May', amount: 550000, orders: 16 },
    { month: 'Jun', amount: 670000, orders: 20 }
  ]

  const purchaseOrders = [
    { id: 1, supplier: 'MedSupply Co.', items: 15, amount: '₱45,000', status: 'Pending', rfid: 'RFID001' },
    { id: 2, supplier: 'HealthTech Ltd.', items: 8, amount: '₱32,500', status: 'Approved', rfid: 'RFID002' },
    { id: 3, supplier: 'MedEquip Inc.', items: 12, amount: '₱78,000', status: 'Delivered', rfid: 'RFID003' },
    { id: 4, supplier: 'PharmaCorp', items: 6, amount: '₱23,000', status: 'In Transit', rfid: 'RFID004' }
  ]

  const receivedDeliveries = [
    { id: 1, supplier: 'MedSupply Co.', items: 15, rfid: 'RFID001', receivedAt: '2025-01-15 09:30', status: 'Verified' },
    { id: 2, supplier: 'HealthTech Ltd.', items: 8, rfid: 'RFID002', receivedAt: '2025-01-15 10:15', status: 'Pending Verification' },
    { id: 3, supplier: 'MedEquip Inc.', items: 12, rfid: 'RFID003', receivedAt: '2025-01-15 11:00', status: 'Verified' }
  ]

  const handleRfidScan = () => {
    if (rfidCode) {
      // Simulate RFID scan for procurement
      const delivery = receivedDeliveries.find(d => d.rfid === rfidCode)
      if (delivery) {
        alert(`RFID Scanned: Delivery from ${delivery.supplier} - ${delivery.items} items - Status: ${delivery.status}`)
      } else {
        alert('RFID code not found in deliveries')
      }
      setRfidCode('')
    }
  }

  const filteredOrders = purchaseOrders.filter(order =>
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.rfid.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-2">Procurement & Sourcing Management</h1>
        <p className="text-gray-600">Manage supply sourcing, supplier info, and procurement tracking with RFID</p>
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
              <p className="text-sm font-medium text-gray-600">Total Purchase Orders</p>
              <p className="text-2xl font-bold text-primary">24</p>
              <p className="text-xs text-green-600">+8% from last month</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suppliers Connected</p>
              <p className="text-2xl font-bold text-secondary">12</p>
              <p className="text-xs text-blue-600">Active partnerships</p>
            </div>
            <Package className="w-8 h-8 text-secondary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Pending Delivery</p>
              <p className="text-2xl font-bold text-orange-500">8</p>
              <p className="text-xs text-orange-600">Requires tracking</p>
            </div>
            <Truck className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">RFID Tags Registered</p>
              <p className="text-2xl font-bold text-accent">156</p>
              <p className="text-xs text-green-600">Tracked items</p>
            </div>
            <QrCode className="w-8 h-8 text-accent" />
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
        <h3 className="text-lg font-semibold text-primary mb-4">RFID Delivery Scanner</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scan RFID for Delivery Verification
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
              <span>Create Purchase Request</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Truck className="w-4 h-4" />
              <span>Track Deliveries</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Supplier Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supplierPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="onTime" fill="#00A896" name="On-Time Deliveries" />
              <Bar dataKey="orders" fill="#1D3557" name="Total Orders" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Spending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Monthly Procurement Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']} />
              <Line type="monotone" dataKey="amount" stroke="#1D3557" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Purchase Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Active Purchase Orders</h3>
            <button className="btn-primary text-sm">View All</button>
          </div>
          
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders or RFID codes..."
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{order.supplier}</p>
                  <p className="text-sm text-gray-600">{order.items} items • {order.amount}</p>
                  <p className="text-xs text-gray-500">RFID: {order.rfid}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Approved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {order.status}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-primary">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Received Deliveries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Received Deliveries</h3>
            <button className="btn-primary text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {receivedDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{delivery.supplier}</p>
                  <p className="text-sm text-gray-600">{delivery.items} items • {delivery.receivedAt}</p>
                  <p className="text-xs text-gray-500">RFID: {delivery.rfid}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  delivery.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {delivery.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Purchase Request</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>View Deliveries</span>
          </button>
          <button className="btn-primary flex items-center justify-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Scan RFID Tag</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ProcurementDashboard
