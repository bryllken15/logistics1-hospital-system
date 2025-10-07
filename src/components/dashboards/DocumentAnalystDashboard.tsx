import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, CheckCircle, Archive, Search, Download, Eye, X, Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { documentService, systemLogService, documentFileService, deliveryReceiptService, analyticsService } from '../../services/database'
import { useDocumentUpdates, useDeliveryReceiptUpdates } from '../../hooks/useRealtimeUpdates'
import NotificationCenter from '../NotificationCenter'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const DocumentAnalystDashboard = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showVerifyForm, setShowVerifyForm] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [newDocument, setNewDocument] = useState({
    file_name: '',
    file_type: '',
    description: '',
    file_size: 0
  })
  const [verificationNotes, setVerificationNotes] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    loadDocumentData()
  }, [])

  // Set up realtime subscriptions for document updates
  useDocumentUpdates((update) => {
    console.log('Document update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setDocuments(prev => [update.new, ...prev])
      toast.success('New document uploaded')
    } else if (update.eventType === 'UPDATE') {
      setDocuments(prev => prev.map(doc => doc.id === update.new.id ? update.new : doc))
      if (update.new.status === 'verified') {
        toast.success('Document verified')
      } else if (update.new.status === 'archived') {
        toast.info('Document archived')
      }
    } else if (update.eventType === 'DELETE') {
      setDocuments(prev => prev.filter(doc => doc.id !== update.old.id))
      toast.success('Document deleted')
    }
  })

  useDeliveryReceiptUpdates((update) => {
    console.log('Delivery receipt update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      toast.info('New delivery receipt received')
    } else if (update.eventType === 'UPDATE') {
      if (update.new.status === 'verified') {
        toast.success('Delivery receipt verified')
      }
    }
  })

  const loadDocumentData = async () => {
    try {
      setLoading(true)
      const data = await documentService.getAll()
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading document data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadDocument = async () => {
    try {
      const documentData = {
        ...newDocument,
        uploaded_by: '77777777-7777-7777-7777-777777777777', // Document Analyst user ID
        status: 'pending_verification'
      }
      
      await documentService.create(documentData)
      
      // Log document upload
      await systemLogService.create({
        action: 'Document Uploaded',
        user_id: '77777777-7777-7777-7777-777777777777',
        details: `Document uploaded: ${newDocument.file_name} (${newDocument.file_type}) - ${(newDocument.file_size / 1024 / 1024).toFixed(1)}MB`
      })
      
      await loadDocumentData()
      setNewDocument({ file_name: '', file_type: '', description: '', file_size: 0 })
      setShowUploadForm(false)
      toast.success('Document uploaded successfully!')
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    }
  }

  const handleVerifyDocument = async (documentId: string, status: string) => {
    try {
      setLoading(true)
      await documentService.updateStatus(documentId, status)
      
      // Log document verification
      await systemLogService.create({
        action: 'Document Verified',
        user_id: '77777777-7777-7777-7777-777777777777',
        details: `Document ${status}: ${selectedDocument?.file_name} - ${verificationNotes}`
      })
      
      await loadDocumentData()
      setVerificationNotes('')
      setShowVerifyForm(false)
      setSelectedDocument(null)
      toast.success(`Document ${status} successfully!`)
    } catch (error) {
      console.error('Error verifying document:', error)
      toast.error('Failed to verify document')
    } finally {
      setLoading(false)
    }
  }

  const handleArchiveDocument = async (documentId: string) => {
    try {
      await documentService.archive(documentId)
      
      // Log document archival
      await systemLogService.create({
        action: 'Document Archived',
        user_id: '77777777-7777-7777-7777-777777777777',
        details: `Document archived: ${documentId}`
      })
      
      await loadDocumentData()
      toast.success('Document archived successfully!')
    } catch (error) {
      console.error('Error archiving document:', error)
      toast.error('Failed to archive document')
    }
  }

  const handleBulkDocumentAction = async (action: string, documentIds: string[]) => {
    try {
      for (const documentId of documentIds) {
        if (action === 'verify') {
          await documentService.updateStatus(documentId, 'verified')
        } else if (action === 'archive') {
          await documentService.archive(documentId)
        }
      }
      
      await systemLogService.create({
        action: `Bulk Document ${action}`,
        user_id: '77777777-7777-7777-7777-777777777777',
        details: `${action} action performed on ${documentIds.length} documents`
      })
      
      await loadDocumentData()
      toast.success(`Bulk ${action} completed successfully!`)
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error)
      toast.error(`Failed to perform bulk ${action}`)
    }
  }

  const handleGenerateDocumentReport = async () => {
    try {
      const analytics = await analyticsService.getDocumentAnalytics()
      
      await systemLogService.create({
        action: 'Document Report Generated',
        user_id: '77777777-7777-7777-7777-777777777777',
        details: `Document report generated for ${documents.length} documents`
      })
      
      toast.success('Document report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate document report')
    }
  }

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
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Document Tracking & Records System</h1>
          <p className="text-gray-600">Manage logistics and procurement documents for verification and records</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Real-time Active</span>
          </div>
          <NotificationCenter />
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
              aria-label="Filter documents by status"
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
              aria-label="Filter documents by type"
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Loading documents...</td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No documents found</td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
                        <p className="text-xs text-gray-500">by {doc.uploaded_by}</p>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{doc.file_type.replace('_', ' ').toUpperCase()}</td>
                    <td className="py-3 text-sm text-gray-900">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                        doc.status === 'pending_verification' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {doc.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{(doc.file_size / 1024 / 1024).toFixed(1)} MB</td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedDocument(doc)
                            setShowVerifyForm(true)
                          }}
                          className="p-1 text-gray-400 hover:text-primary"
                          title="Verify Document"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleArchiveDocument(doc.id)}
                          className="p-1 text-gray-400 hover:text-primary"
                          title="Archive Document"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            // Download functionality
                            toast.success('Download functionality would be implemented here')
                          }}
                          className="p-1 text-gray-400 hover:text-primary"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowUploadForm(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Document</span>
          </button>
          <button 
            onClick={() => loadDocumentData()}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
          <button 
            onClick={handleGenerateDocumentReport}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Archive className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
          <button 
            onClick={() => {
              // Document verification workflow
              toast.success('Document verification workflow initiated!')
            }}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Verify Documents</span>
          </button>
        </div>
        
        {/* Additional Document Management Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Document Management</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                // Export document data
                const csvData = documents.map(doc => ({
                  fileName: doc.file_name,
                  type: doc.file_type,
                  status: doc.status,
                  size: (doc.file_size / 1024 / 1024).toFixed(1),
                  uploadedBy: doc.uploaded_by,
                  created: doc.created_at
                }))
                
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "File Name,Type,Status,Size (MB),Uploaded By,Created\n" +
                  csvData.map(row => Object.values(row).join(",")).join("\n")
                
                const encodedUri = encodeURI(csvContent)
                const link = document.createElement("a")
                link.setAttribute("href", encodedUri)
                link.setAttribute("download", "documents_export.csv")
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                toast.success('Document data exported!')
              }}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              Export Documents
            </button>
            <button 
              onClick={() => {
                // Bulk verify all pending documents
                const pendingDocs = documents.filter(doc => doc.status === 'pending_verification')
                if (pendingDocs.length > 0) {
                  const docIds = pendingDocs.map(doc => doc.id)
                  handleBulkDocumentAction('verify', docIds)
                } else {
                  toast.info('No pending documents to verify')
                }
              }}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
            >
              Verify All Pending
            </button>
            <button 
              onClick={() => {
                // Archive all verified documents
                const verifiedDocs = documents.filter(doc => doc.status === 'verified')
                if (verifiedDocs.length > 0) {
                  const docIds = verifiedDocs.map(doc => doc.id)
                  handleBulkDocumentAction('archive', docIds)
                } else {
                  toast.info('No verified documents to archive')
                }
              }}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600"
            >
              Archive All Verified
            </button>
            <button 
              onClick={() => {
                // Document analytics
                toast.success('Document analytics generated!')
              }}
              className="px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
            >
              Document Analytics
            </button>
          </div>
        </div>
      </motion.div>

      {/* Upload Document Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Upload Document</h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
                <input
                  type="text"
                  value={newDocument.file_name}
                  onChange={(e) => setNewDocument({...newDocument, file_name: e.target.value})}
                  className="input-field w-full"
                  placeholder="Delivery_Receipt_001.pdf"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
                <select
                  value={newDocument.file_type}
                  onChange={(e) => setNewDocument({...newDocument, file_type: e.target.value})}
                  className="input-field w-full"
                  aria-label="Document file type"
                >
                  <option value="">Select Type</option>
                  <option value="delivery_receipt">Delivery Receipt</option>
                  <option value="purchase_order">Purchase Order</option>
                  <option value="invoice">Invoice</option>
                  <option value="contract">Contract</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Size (MB)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newDocument.file_size}
                  onChange={(e) => setNewDocument({...newDocument, file_size: parseFloat(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="2.3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Document description..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDocument}
                className="btn-primary"
              >
                Upload Document
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Verify Document Modal */}
      {showVerifyForm && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Verify Document</h3>
              <button
                onClick={() => setShowVerifyForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Document: <span className="font-medium">{selectedDocument.file_name}</span></p>
              <p className="text-sm text-gray-600">Type: <span className="font-medium">{selectedDocument.file_type.replace('_', ' ').toUpperCase()}</span></p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Notes</label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Verification notes..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowVerifyForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyDocument(selectedDocument.id, 'verified')}
                className="btn-primary"
              >
                Approve
              </button>
              <button
                onClick={() => handleVerifyDocument(selectedDocument.id, 'rejected')}
                className="btn-secondary bg-red-500 hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default DocumentAnalystDashboard
