// Enhanced Document Analyst Dashboard
// Smart Supply Chain & Procurement Management System

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { systemLogService } from '../../services/database'
import { 
  documentService,
  documentVersionService,
  documentApprovalService,
  analyticsService,
  realtimeService
} from '../../services/database'
import { 
  FileText,
  Search,
  Filter,
  Upload,
  CheckCircle,
  XCircle,
  Archive,
  Eye,
  Trash,
  Bell,
  Wifi,
  AlertTriangle,
  Copy,
  Clock,
  Tag,
  BarChart3,
  Download,
  FileCheck,
  AlertCircle,
  Plus,
  X,
  File,
  Calendar,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'

const DocumentAnalystDashboard = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showVerifyForm, setShowVerifyForm] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [documentVersions, setDocumentVersions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [expiringSoon, setExpiringSoon] = useState(false)
  
  // New document form state
  const [newDocument, setNewDocument] = useState({
    file: null as File | null,
    category: 'general' as string,
    description: '',
    tags: [] as string[],
    expirationDate: '',
    relatedEntityType: '',
    relatedEntityId: ''
  })
  
  const [verificationNotes, setVerificationNotes] = useState('')
  const [newTag, setNewTag] = useState('')

  // Available categories
  const categories: string[] = [
    'contracts', 'invoices', 'receipts', 'certificates', 
    'warranties', 'compliance', 'quality_control', 
    'shipping', 'insurance', 'maintenance_manuals', 
    'reports', 'general'
  ]

  // Available statuses
  const statuses = [
    { value: 'all', label: 'All Documents', color: 'gray' },
    { value: 'pending_verification', label: 'Pending Verification', color: 'yellow' },
    { value: 'verified', label: 'Verified', color: 'green' },
    { value: 'archived', label: 'Archived', color: 'blue' },
    { value: 'rejected', label: 'Rejected', color: 'red' }
  ]

  useEffect(() => {
    loadDocumentData()
    loadStats()
  }, [])

  // Set up realtime subscriptions
  useEffect(() => {
    const documentSub = realtimeService.subscribeToDocuments((payload) => {
      console.log('Document change:', payload)
      loadDocumentData()
    })
    
    setSubscriptions([documentSub])
    
    return () => {
      subscriptions.forEach(sub => realtimeService.unsubscribe(sub))
    }
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = documents

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        (doc.file_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        ((doc.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === filterStatus)
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterCategory)
    }

    if (filterTags.length > 0) {
      filtered = filtered.filter(doc => 
        filterTags.some(tag => doc.tags.includes(tag))
      )
    }

    setFilteredDocuments(filtered)
  }, [documents, searchTerm, filterStatus, filterCategory, filterTags])

  const loadDocumentData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading document data...')
      
      try {
        const data = await documentService.getAll()
        console.log('✅ Documents loaded:', data?.length || 0)
        
        // Apply client-side filtering since the database schema doesn't support all filters
        let filteredData = data || []
        
        // Filter by category (if supported)
        if (filterCategory !== 'all') {
          filteredData = filteredData.filter(doc => doc.category === filterCategory)
        }
        
        // Filter by status
        if (filterStatus !== 'all') {
          filteredData = filteredData.filter(doc => doc.status === filterStatus)
        }
        
        // Filter by search term
        if (searchTerm) {
          filteredData = filteredData.filter(doc => 
            (doc.file_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (doc.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
          )
        }
        
        // Filter by tags (if supported)
        if (filterTags.length > 0) {
          filteredData = filteredData.filter(doc => 
            doc.tags && doc.tags.some(tag => filterTags.includes(tag))
          )
        }
        
        setDocuments(data || [])
        setFilteredDocuments(filteredData)
        
        // Check for expiring documents (if expiration_date exists)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        const expiring = (data || []).filter(doc => 
          doc.expiration_date && 
          new Date(doc.expiration_date) <= thirtyDaysFromNow
        )
        setExpiringSoon(expiring.length > 0)
        
      } catch (error) {
        console.error('❌ Failed to load documents:', error)
        toast.error('Failed to load documents')
        setDocuments([])
        setFilteredDocuments([])
      }
    } catch (error) {
      console.error('💥 Document data loading failed:', error)
      toast.error('Failed to load document data')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      console.log('🔄 Loading document statistics...')
      
      try {
        const data = await analyticsService.getDocumentStats()
        console.log('✅ Document statistics loaded:', data)
        setStats(data)
      } catch (error) {
        console.error('❌ Failed to load document statistics:', error)
        // Set default stats if loading fails
        setStats({
          total: 0,
          pending: 0,
          verified: 0,
          rejected: 0,
          archived: 0,
          totalSize: 0,
          byType: {}
        })
      }
    } catch (error) {
      console.error('💥 Document statistics loading failed:', error)
    }
  }

  const handleUpload = async () => {
    if (!newDocument.file || !user) return

    try {
      const uploadData = {
        file: newDocument.file,
        category: newDocument.category,
        description: newDocument.description,
        tags: newDocument.tags,
        expirationDate: newDocument.expirationDate || undefined,
        relatedEntityType: newDocument.relatedEntityType || undefined,
        relatedEntityId: newDocument.relatedEntityId || undefined
      }

      // Create document data compatible with the current schema
      const documentData = {
        file_name: newDocument.file.name,
        file_type: newDocument.file.type,
        file_size: newDocument.file.size,
        description: newDocument.description,
        status: 'pending_verification',
        uploaded_by: user.id,
        category: newDocument.category,
        tags: newDocument.tags,
        expiration_date: newDocument.expirationDate || null,
        related_entity_type: newDocument.relatedEntityType || null,
        related_entity_id: newDocument.relatedEntityId || null
      }

      await documentService.create(documentData)
      
      // Log the action
      await systemLogService.create({
        action: 'Document Uploaded',
        user_id: user.id,
        details: `New document uploaded: ${newDocument.file.name} (${newDocument.category})`
      })

      setNewDocument({
        file: null,
        category: 'general',
        description: '',
        tags: [],
        expirationDate: '',
        relatedEntityType: '',
        relatedEntityId: ''
      })
      setShowUploadForm(false)
      toast.success('Document uploaded successfully!')
      await loadDocumentData()
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error(`Failed to upload document: ${error.message || 'Unknown error'}`)
    }
  }

  const handleVerify = async () => {
    if (!selectedDocument || !user) return

    try {
      await documentService.updateStatus(selectedDocument.id, 'verified')
      
      await systemLogService.create({
        action: 'Document Verified',
        user_id: user.id,
        details: `Document verified: ${selectedDocument.file_name || 'Unknown File'}`
      })

      setShowVerifyForm(false)
      setSelectedDocument(null)
      setVerificationNotes('')
      toast.success('Document verified successfully!')
      await loadDocumentData()
    } catch (error) {
      console.error('Error verifying document:', error)
      toast.error('Failed to verify document')
    }
  }

  const handleArchive = async (document: any) => {
    if (!user) return

    try {
      await documentService.archive(document.id)
      
      await systemLogService.create({
        action: 'Document Archived',
        user_id: user.id,
        details: `Document archived: ${document.file_name || 'Unknown File'}`
      })

      toast.success('Document archived successfully!')
      await loadDocumentData()
    } catch (error) {
      console.error('Error archiving document:', error)
      toast.error('Failed to archive document')
    }
  }

  const handleDelete = async (document: any) => {
    if (!user) return

    try {
      await documentService.delete(document.id)
      
      await systemLogService.create({
        action: 'Document Deleted',
        user_id: user.id,
        details: `Document deleted: ${document.file_name || 'Unknown File'}`
      })

      toast.success('Document deleted successfully!')
      await loadDocumentData()
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const handlePreview = async (document: any) => {
    try {
      // For now, just show the document details
      const preview = { canPreview: false, previewType: 'none' }
      setSelectedDocument({ ...document, ...preview })
      setShowPreviewModal(true)
    } catch (error) {
      console.error('Error getting preview:', error)
      toast.error('Failed to load document preview')
    }
  }

  const handleViewVersions = async (document: any) => {
    try {
      // For now, just show empty versions
      const versions = []
      setDocumentVersions(versions)
      setSelectedDocument(document)
      setShowVersionModal(true)
    } catch (error) {
      console.error('Error loading versions:', error)
      toast.error('Failed to load document versions')
    }
  }

  const addTag = () => {
    if (newTag && !newDocument.tags.includes(newTag)) {
      setNewDocument(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewDocument(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addFilterTag = (tag: string) => {
    if (!filterTags.includes(tag)) {
      setFilterTags(prev => [...prev, tag])
    }
  }

  const removeFilterTag = (tagToRemove: string) => {
    setFilterTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const getStatusColor = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status)
    return statusConfig?.color || 'gray'
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      contracts: <FileText className="w-4 h-4" />,
      invoices: <Download className="w-4 h-4" />,
      receipts: <FileCheck className="w-4 h-4" />,
      certificates: <FileCheck className="w-4 h-4" />,
      warranties: <FileText className="w-4 h-4" />,
      compliance: <FileCheck className="w-4 h-4" />,
      quality_control: <FileCheck className="w-4 h-4" />,
      shipping: <Download className="w-4 h-4" />,
      insurance: <FileText className="w-4 h-4" />,
      maintenance_manuals: <FileText className="w-4 h-4" />,
      reports: <BarChart3 className="w-4 h-4" />,
      general: <File className="w-4 h-4" />
    }
    return icons[category] || <File className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600">Manage and analyze all documents in your supply chain</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Wifi className={`w-5 h-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {(category || 'general').replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Document
          </button>
        </div>

        {/* Active Tags */}
        {filterTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active tags:</span>
            {filterTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  onClick={() => removeFilterTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <motion.tr
                  key={document.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getCategoryIcon(document.category)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {document.file_name || 'Unknown File'}
                        </div>
                        {document.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {document.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {(document.file_size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {(document.category || 'general').replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(document.status)}-100 text-${getStatusColor(document.status)}-800`}>
                      {(document.status || 'pending').replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {(document.tags || []).slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                          onClick={() => addFilterTag(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                      {(document.tags || []).length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{(document.tags || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.expiration_date ? (
                      <div className={`${new Date(document.expiration_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(document.expiration_date).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">No expiration</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    v{document.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreview(document)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {document.status === 'pending_verification' && (
                        <button
                          onClick={() => {
                            setSelectedDocument(document)
                            setShowVerifyForm(true)
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Verify"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewVersions(document)}
                        className="text-purple-600 hover:text-purple-900"
                        title="View Versions"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleArchive(document)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(document)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload New Document</h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewDocument(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newDocument.category}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {(category || 'general').replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter document description..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newDocument.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={newDocument.expirationDate}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, expirationDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Related Entity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Entity Type
                  </label>
                  <select
                    value={newDocument.relatedEntityType}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, relatedEntityType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type...</option>
                    <option value="project">Project</option>
                    <option value="purchase_order">Purchase Order</option>
                    <option value="asset">Asset</option>
                    <option value="inventory_item">Inventory Item</option>
                    <option value="maintenance_work_order">Work Order</option>
                    <option value="supplier">Supplier</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Entity ID
                  </label>
                  <input
                    type="text"
                    value={newDocument.relatedEntityId}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, relatedEntityId: e.target.value }))}
                    placeholder="Enter entity ID..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!newDocument.file}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Document
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Verification Form Modal */}
      {showVerifyForm && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Verify Document</h3>
              <button
                onClick={() => setShowVerifyForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Verify: <span className="font-medium">{selectedDocument.file_name || 'Unknown File'}</span>
              </p>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add verification notes (optional)..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowVerifyForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Verify Document
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Document Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Preview not available for this file type: {selectedDocument.file_type || 'Unknown Type'}
              </p>
              <p className="text-sm text-gray-500">
                File: {selectedDocument.file_name || 'Unknown File'}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Versions Modal */}
      {showVersionModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Document Versions</h3>
              <button
                onClick={() => setShowVersionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {documentVersions.map((version) => (
                <div key={version.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Version {version.version_number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(version.created_at).toLocaleString()}
                    </p>
                    {version.change_notes && (
                      <p className="text-sm text-gray-600 mt-1">{version.change_notes}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {version.users?.full_name || 'Unknown User'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default DocumentAnalystDashboard
