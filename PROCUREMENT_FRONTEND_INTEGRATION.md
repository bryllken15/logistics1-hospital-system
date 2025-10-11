# Procurement Approval Frontend Integration Guide

## 🎯 Quick Integration Steps

### 1. Import the Service

In any dashboard component that needs to work with procurement approvals:

```typescript
import { procurementApprovalService } from '../../services/database'
```

### 2. Add State Management

```typescript
const [procurementApprovals, setProcurementApprovals] = useState<any[]>([])
const [myProcurementRequests, setMyProcurementRequests] = useState<any[]>([])
const [loading, setLoading] = useState(true)
```

### 3. Load Data Functions

**For Manager/Project Manager Dashboards:**
```typescript
const loadApprovals = async () => {
  try {
    setLoading(true)
    const approvalsData = await procurementApprovalService.getPendingApprovals()
    setProcurementApprovals(approvalsData || [])
  } catch (error) {
    console.error('Error loading procurement approvals:', error)
    toast.error('Failed to load procurement approvals')
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  loadApprovals()
}, [])
```

**For Employee/Procurement Dashboard:**
```typescript
const loadMyRequests = async () => {
  try {
    setLoading(true)
    const requestsData = await procurementApprovalService.getByUser(user?.id || '')
    setMyProcurementRequests(requestsData || [])
  } catch (error) {
    console.error('Error loading my procurement requests:', error)
    toast.error('Failed to load procurement requests')
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  if (user?.id) {
    loadMyRequests()
  }
}, [user?.id])
```

### 4. Handler Functions

**Create Procurement Request (Employee/Procurement Dashboard):**
```typescript
const handleCreateProcurementRequest = async () => {
  try {
    const requestData = {
      item_name: formData.item_name,
      description: formData.description,
      quantity: parseInt(formData.quantity),
      unit_price: parseFloat(formData.unit_price),
      supplier: formData.supplier,
      category: formData.category || 'general',
      priority: formData.priority || 'medium',
      reason: formData.reason || 'New procurement request'
    }

    await procurementApprovalService.createWithApproval(
      requestData,
      user?.id || ''
    )

    toast.success('Procurement request submitted for approval!')
    
    // Log the action
    await systemLogService.create({
      action: 'Procurement Request Created',
      user_id: user?.id || '',
      details: `Created procurement request for ${requestData.item_name}`
    })

    // Refresh the list
    loadMyRequests()
    
    // Close form/reset
    setShowCreateForm(false)
    setFormData({})
  } catch (error) {
    console.error('Error creating procurement request:', error)
    toast.error('Failed to create procurement request')
  }
}
```

**Approve/Reject (Manager Dashboard):**
```typescript
const handleProcurementApproval = async (
  approvalId: string,
  action: 'approve' | 'reject'
) => {
  try {
    if (action === 'approve') {
      await procurementApprovalService.approve(
        approvalId,
        user?.id || '',
        'manager'
      )

      await systemLogService.create({
        action: 'Procurement Request Approved by Manager',
        user_id: user?.id || '',
        details: `Approved procurement request ${approvalId}`
      })

      toast.success('Procurement request approved!')
    } else {
      await procurementApprovalService.reject(
        approvalId,
        user?.id || '',
        'manager'
      )

      await systemLogService.create({
        action: 'Procurement Request Rejected by Manager',
        user_id: user?.id || '',
        details: `Rejected procurement request ${approvalId}`
      })

      toast.success('Procurement request rejected!')
    }

    // Refresh the list
    loadApprovals()
  } catch (error) {
    console.error('Error processing procurement approval:', error)
    toast.error('Failed to process procurement approval')
  }
}
```

**Approve/Reject (Project Manager Dashboard):**
```typescript
const handleProcurementApproval = async (
  approvalId: string,
  action: 'approve' | 'reject'
) => {
  try {
    if (action === 'approve') {
      await procurementApprovalService.approve(
        approvalId,
        user?.id || '',
        'project_manager'
      )

      await systemLogService.create({
        action: 'Procurement Request Approved by Project Manager',
        user_id: user?.id || '',
        details: `Approved procurement request ${approvalId} for logistics`
      })

      toast.success('Procurement request approved for logistics!')
    } else {
      await procurementApprovalService.reject(
        approvalId,
        user?.id || '',
        'project_manager'
      )

      await systemLogService.create({
        action: 'Procurement Request Rejected by Project Manager',
        user_id: user?.id || '',
        details: `Rejected procurement request ${approvalId}`
      })

      toast.success('Procurement request rejected!')
    }

    // Refresh the list
    loadApprovals()
  } catch (error) {
    console.error('Error processing procurement approval:', error)
    toast.error('Failed to process procurement approval')
  }
}
```

### 5. UI Components

**Procurement Approval Requests Section (Manager Dashboard):**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="card p-6"
>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-primary">
      Procurement Approval Requests
    </h3>
    <span className="text-sm text-gray-500">
      Manager Approval Required
    </span>
  </div>

  <div className="space-y-3">
    {loading ? (
      <div className="text-center py-4">
        Loading procurement approvals...
      </div>
    ) : procurementApprovals.length === 0 ? (
      <div className="text-center py-4 text-gray-500">
        No pending procurement approval requests
      </div>
    ) : (
      procurementApprovals.map((approval) => (
        <div
          key={approval.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <p className="font-medium text-gray-900">
                {approval.item_name}
              </p>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                approval.priority === 'high' ? 'bg-red-100 text-red-800' :
                approval.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {approval.priority}
              </span>
            </div>

            {approval.description && (
              <p className="text-sm text-gray-600 mb-2">
                {approval.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Quantity:</span> {approval.quantity}
              </div>
              <div>
                <span className="font-medium">Unit Price:</span> ₱{approval.unit_price}
              </div>
              <div>
                <span className="font-medium">Total:</span> ₱{approval.total_value}
              </div>
              <div>
                <span className="font-medium">Supplier:</span> {approval.supplier}
              </div>
            </div>

            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span>
                Requested by: {approval.requested_by_user?.full_name || 'Unknown'}
              </span>
              <span>
                {new Date(approval.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-2 flex items-center space-x-2">
              {approval.manager_approved && (
                <span className="text-xs text-green-600 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Manager Approved
                </span>
              )}
              {approval.project_manager_approved && (
                <span className="text-xs text-green-600 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Project Manager Approved
                </span>
              )}
              {!approval.manager_approved && !approval.project_manager_approved && (
                <span className="text-xs text-yellow-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Awaiting Approval
                </span>
              )}
            </div>
          </div>

          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => handleProcurementApproval(approval.id, 'approve')}
              className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={approval.manager_approved}
            >
              {approval.manager_approved ? 'Approved' : 'Approve'}
            </button>
            <button
              onClick={() => handleProcurementApproval(approval.id, 'reject')}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))
    )}
  </div>
</motion.div>
```

**My Procurement Requests Section (Employee/Procurement Dashboard):**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="card p-6"
>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-primary">
      My Procurement Requests
    </h3>
    <button
      onClick={() => setShowCreateForm(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
    >
      <Plus className="w-4 h-4" />
      <span>New Request</span>
    </button>
  </div>

  <div className="space-y-3">
    {loading ? (
      <div className="text-center py-4">
        Loading your procurement requests...
      </div>
    ) : myProcurementRequests.length === 0 ? (
      <div className="text-center py-4 text-gray-500">
        No procurement requests yet. Create one to get started!
      </div>
    ) : (
      myProcurementRequests.map((request) => (
        <div
          key={request.id}
          className="p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-medium text-gray-900">
                  {request.item_name}
                </p>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </div>

              {request.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {request.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Quantity:</span> {request.quantity}
                </div>
                <div>
                  <span className="font-medium">Total:</span> ₱{request.total_value}
                </div>
                <div>
                  <span className="font-medium">Supplier:</span> {request.supplier}
                </div>
                <div>
                  <span className="font-medium">Priority:</span> {request.priority}
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Requested: {new Date(request.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="flex flex-col items-end space-y-1 ml-4">
              {request.manager_approved && (
                <span className="text-xs text-green-600 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Manager Approved
                </span>
              )}
              {request.project_manager_approved && (
                <span className="text-xs text-green-600 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Project Manager Approved
                </span>
              )}
              {!request.manager_approved && request.status === 'pending' && (
                <span className="text-xs text-yellow-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Awaiting Manager
                </span>
              )}
              {request.manager_approved && !request.project_manager_approved && request.status === 'pending' && (
                <span className="text-xs text-yellow-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Awaiting PM
                </span>
              )}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</motion.div>
```

## 📋 Complete Example: Procurement Dashboard Component

```typescript
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { procurementApprovalService, systemLogService } from '../../services/database'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const ProcurementDashboard = () => {
  const { user } = useAuth()
  const [myRequests, setMyRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    quantity: '',
    unit_price: '',
    supplier: '',
    category: 'general',
    priority: 'medium',
    reason: ''
  })

  useEffect(() => {
    if (user?.id) {
      loadMyRequests()
    }
  }, [user?.id])

  const loadMyRequests = async () => {
    try {
      setLoading(true)
      const requestsData = await procurementApprovalService.getByUser(user?.id || '')
      setMyRequests(requestsData || [])
    } catch (error) {
      console.error('Error loading procurement requests:', error)
      toast.error('Failed to load procurement requests')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const requestData = {
        item_name: formData.item_name,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        unit_price: parseFloat(formData.unit_price),
        supplier: formData.supplier,
        category: formData.category,
        priority: formData.priority,
        reason: formData.reason || 'New procurement request'
      }

      await procurementApprovalService.createWithApproval(requestData, user?.id || '')

      toast.success('Procurement request submitted for approval!')
      
      await systemLogService.create({
        action: 'Procurement Request Created',
        user_id: user?.id || '',
        details: `Created procurement request for ${requestData.item_name}`
      })

      loadMyRequests()
      setShowCreateForm(false)
      setFormData({
        item_name: '',
        description: '',
        quantity: '',
        unit_price: '',
        supplier: '',
        category: 'general',
        priority: 'medium',
        reason: ''
      })
    } catch (error) {
      console.error('Error creating procurement request:', error)
      toast.error('Failed to create procurement request')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Procurement Dashboard</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* My Procurement Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">
          My Procurement Requests
        </h3>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No procurement requests yet. Create one to get started!
            </div>
          ) : (
            myRequests.map((request) => (
              <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                {/* Request details (see UI component example above) */}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Create Form Modal (implement as needed) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Create Procurement Request</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              {/* Form fields (implement as needed) */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProcurementDashboard
```

## 🎉 That's It!

You now have a complete multi-level approval system for procurement requests that mirrors the inventory approval workflow!

Remember to:
1. Apply the SQL migration first
2. Import the service where needed
3. Add the UI components to your dashboards
4. Test the complete workflow

Happy coding! 🚀
