import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, CheckCircle, Archive, Search, Download, Eye } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const DocumentAnalystDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  // Mock data
  const documentStats = [
    { type: 'Delivery Receipts', count: 45, color: '#00A896' },
    { type: 'Purchase Orders', count: 32, color: '#1D3557' },
    { type: 'Invoices', count: 28, color: '#457B9D' },
    { type: 'Contracts', count: 15, color: '#F77F00' }
  ]

  const monthlyUploads = [
    { month: 'Jan', uploaded: 45, verified: 42, archived: 38 },
    { month: 'Feb', uploaded: 52, verified: 48, archived: 45 },
    { month: 'Mar', uploaded: 38, verified: 35, archived: 32 },
    { month: 'Apr', uploaded: 61, verified: 58, archived: 55 },
    { month: 'May', uploaded: 55, verified: 52, archived: 48 },
    { month: 'Jun', uploaded: 67, verified: 63, archived: 60 }
  ]

  const documentHistory = [
    { 
      id: 1, 
      fileName: 'Delivery_Receipt_001.pdf', 
      type: 'Delivery Receipt', 
      date: '2025-01-15', 
      status: 'Verified',
      size: '2.3 MB',
      uploadedBy: 'employee1'
    },
    { 
      id: 2, 
      fileName: 'Purchase_Order_045.pdf', 
      type: 'Purchase Order', 
      date: '2025-01-15', 
      status: 'Pending Verification',
      size: '1.8 MB',
      uploadedBy: 'procurement1'
    },
    { 
      id: 3, 
      fileName: 'Invoice_MedSupply_123.pdf', 
      type: 'Invoice', 
      date: '2025-01-14', 
      status: 'Verified',
      size: '3.1 MB',
      uploadedBy: 'procurement1'
    },
    { 
      id: 4, 
      fileName: 'Contract_HealthTech_2025.pdf', 
      type: 'Contract', 
      date: '2025-01-14', 
      status: 'Archived',
      size: '5.2 MB',
      uploadedBy: 'admin'
    },
    { 
      id: 5, 
      fileName: 'Delivery_Receipt_002.pdf', 
      type: 'Delivery Receipt', 
      date: '2025-01-13', 
      status: 'Verified',
      size: '2.1 MB',
      uploadedBy: 'employee1'
    },
    { 
      id: 6, 
      fileName: 'Purchase_Order_046.pdf', 
      type: 'Purchase Order', 
      date: '2025-01-13', 
      status: 'Pending Verification',
      size: '2.7 MB',
      uploadedBy: 'procurement1'
    }
  ]

  const deliveryReceipts = [
    { 
      id: 1, 
      receiptNumber: 'DR-2025-001', 
      supplier: 'MedSupply Co.', 
      date: '2025-01-15', 
      amount: '₱45,000',
      status: 'Verified',
      items: 15
    },
    { 
      id: 2, 
      receiptNumber: 'DR-2025-002', 
      supplier: 'HealthTech Ltd.', 
      date: '2025-01-14', 
      amount: '₱32,500',
      status: 'Pending Verification',
      items: 8
    },
    { 
      id: 3, 
      receiptNumber: 'DR-2025-003', 
      supplier: 'MedEquip Inc.', 
      date: '2025-01-13', 
      amount: '₱78,000',
      status: 'Verified',
      items: 12
    },
    { 
      id: 4, 
      receiptNumber: 'DR-2025-004', 
      supplier: 'PharmaCorp', 
      date: '2025-01-12', 
      amount: '₱23,000',
      status: 'Archived',
      items: 6
    }
  ]

  const filteredDocuments = documentHistory.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || doc.status.toLowerCase().replace(' ', '_') === filterStatus
    const matchesType = filterType === 'all' || doc.type.toLowerCase().replace(' ', '_') === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredReceipts = deliveryReceipts.filter(receipt => {
    const matchesSearch = receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || receipt.status.toLowerCase().replace(' ', '_') === filterStatus
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-2">Document Tracking & Records System</h1>
        <p className="text-gray-600">Manage logistics and procurement documents for verification and records</p>
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
              <p className="text-sm font-medium text-gray-600">Documents Uploaded</p>
              <p className="text-2xl font-bold text-primary">156</p>
              <p className="text-xs text-green-600">+12% this month</p>
            </div>
            <Upload className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
              <p className="text-2xl font-bold text-orange-500">8</p>
              <p className="text-xs text-orange-600">Requires attention</p>
            </div>
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Records</p>
              <p className="text-2xl font-bold text-green-500">142</p>
              <p className="text-xs text-green-600">91% approval rate</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Archived Files</p>
              <p className="text-2xl font-bold text-secondary">98</p>
              <p className="text-xs text-blue-600">Long-term storage</p>
            </div>
            <Archive className="w-8 h-8 text-secondary" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Document Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={documentStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1D3557" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Upload Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Monthly Document Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyUploads}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="uploaded" stroke="#1D3557" strokeWidth={2} name="Uploaded" />
              <Line type="monotone" dataKey="verified" stroke="#00A896" strokeWidth={2} name="Verified" />
              <Line type="monotone" dataKey="archived" stroke="#457B9D" strokeWidth={2} name="Archived" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Document History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Document History</h3>
          <button className="btn-primary text-sm">Upload Document</button>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents, types, or uploaders..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending_verification">Pending</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Types</option>
              <option value="delivery_receipt">Delivery Receipt</option>
              <option value="purchase_order">Purchase Order</option>
              <option value="invoice">Invoice</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">File Name</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Size</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">by {doc.uploadedBy}</p>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{doc.type}</td>
                  <td className="py-3 text-sm text-gray-900">{doc.date}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      doc.status === 'Verified' ? 'bg-green-100 text-green-800' :
                      doc.status === 'Pending Verification' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{doc.size}</td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-primary">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-primary">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-primary">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Delivery Receipts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Delivery Receipts</h3>
          <button className="btn-primary text-sm">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Receipt Number</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Supplier</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Items</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 text-sm font-medium text-gray-900">{receipt.receiptNumber}</td>
                  <td className="py-3 text-sm text-gray-600">{receipt.supplier}</td>
                  <td className="py-3 text-sm text-gray-900">{receipt.date}</td>
                  <td className="py-3 text-sm text-gray-900">{receipt.amount}</td>
                  <td className="py-3 text-sm text-gray-600">{receipt.items}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      receipt.status === 'Verified' ? 'bg-green-100 text-green-800' :
                      receipt.status === 'Pending Verification' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {receipt.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-primary">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-primary">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-primary">
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

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
            <Upload className="w-5 h-5" />
            <span>Upload Document</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Verify Document</span>
          </button>
          <button className="btn-primary flex items-center justify-center space-x-2">
            <Archive className="w-5 h-5" />
            <span>Archive Record</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default DocumentAnalystDashboard
