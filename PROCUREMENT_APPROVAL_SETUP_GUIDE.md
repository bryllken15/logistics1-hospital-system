# Procurement Multi-Level Approval System Setup Guide

## 🎯 Overview

This guide will help you set up a multi-level approval workflow for procurement purchase requests, similar to the inventory approval system we just implemented.

## 📋 Features

- **Multi-Level Approval**: Requires both Manager AND Project Manager approval before creating purchase requests
- **Complete Audit Trail**: Tracks who approved, when they approved, and approval notes
- **Real-time Dashboards**: Shows pending requests to both managers
- **Employee Tracking**: Employees can see the status of their procurement requests
- **Automatic Transfer**: Approved requests automatically create purchase requests in the system

## 🚀 Setup Steps

### Step 1: Apply the Database Migration

You need to apply the SQL migration to create the `procurement_approvals` table in your Supabase database.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase Dashboard: https://app.supabase.com/project/otjdtdnuowhlqriidgfg
2. Navigate to **SQL Editor** in the left sidebar
3. Click "New Query"
4. Copy and paste the entire contents of `supabase/migrations/012_create_procurement_approvals.sql`
5. Click "Run" to execute the migration
6. You should see a success message

**Option B: Using Supabase CLI (if you have it installed)**

```bash
supabase db push
```

### Step 2: Verify the Table Creation

After applying the migration, verify that the table was created successfully:

1. Go to **Table Editor** in Supabase Dashboard
2. Look for the `procurement_approvals` table
3. Check that it has all the required columns:
   - id, purchase_request_id, item_name, description
   - quantity, unit_price, total_value (generated column)
   - supplier, category, priority, status
   - requested_by, request_reason, request_type
   - manager_approved, manager_approved_by, manager_approved_at, manager_notes
   - project_manager_approved, project_manager_approved_by, project_manager_approved_at, project_manager_notes
   - admin_approved, admin_approved_by, admin_approved_at, admin_notes
   - created_at, updated_at

### Step 3: Test the Workflow

After the migration is applied, run the test script to verify everything is working:

```bash
node test-procurement-approval-workflow.js
```

Expected output:
```
🎉 Procurement Multi-Level Approval Test PASSED!

📋 Summary:
   ✅ Procurement approval requests can be created
   ✅ Purchase requests are NOT created before any approval
   ✅ Manager can approve requests (first level)
   ✅ Purchase requests are STILL NOT created after manager approval only
   ✅ Project Manager can approve requests (second level)
   ✅ Purchase requests are created ONLY after BOTH approvals
   ✅ Complete multi-level procurement workflow works!
```

## 📊 How It Works

### 1. Employee Creates Procurement Request

**Frontend (Procurement Dashboard):**
```typescript
import { procurementApprovalService } from '../../services/database'

const handleCreateProcurementRequest = async () => {
  const requestData = {
    item_name: 'Medical Supplies',
    description: 'Urgent medical supplies needed',
    quantity: 50,
    unit_price: 25.00,
    supplier: 'MedSupply Inc.',
    category: 'medical_supplies',
    priority: 'high',
    reason: 'Urgent medical supplies needed for clinic'
  }
  
  await procurementApprovalService.createWithApproval(requestData, user.id)
  toast.success('Procurement request submitted for approval!')
}
```

### 2. Manager Sees and Approves Request

**Frontend (Manager Dashboard):**
```typescript
const handleProcurementApproval = async (approvalId: string, action: 'approve' | 'reject') => {
  if (action === 'approve') {
    await procurementApprovalService.approve(approvalId, user.id, 'manager')
    toast.success('Procurement request approved!')
  } else {
    await procurementApprovalService.reject(approvalId, user.id, 'manager')
    toast.success('Procurement request rejected!')
  }
  loadManagerData() // Refresh dashboard
}
```

### 3. Project Manager Sees and Approves Request

**Frontend (Project Manager Dashboard):**
```typescript
const handleProcurementApproval = async (approvalId: string, action: 'approve' | 'reject') => {
  if (action === 'approve') {
    await procurementApprovalService.approve(approvalId, user.id, 'project_manager')
    toast.success('Procurement request approved for logistics!')
  } else {
    await procurementApprovalService.reject(approvalId, user.id, 'project_manager')
    toast.success('Procurement request rejected!')
  }
  loadProjectData() // Refresh dashboard
}
```

### 4. Both Approvals Complete → Purchase Request Created

When both manager and project manager have approved, the system automatically:
1. Updates the approval status to `'approved'`
2. Creates a purchase request in the `purchase_requests` table
3. Maintains complete audit trail of both approvals

## 🔧 Service Functions

### Create Procurement Request with Approval
```typescript
procurementApprovalService.createWithApproval(request, userId)
```

### Get Pending Approvals
```typescript
procurementApprovalService.getPendingApprovals()
```

### Get User's Requests
```typescript
procurementApprovalService.getByUser(userId)
```

### Approve Request
```typescript
procurementApprovalService.approve(approvalId, userId, 'manager' | 'project_manager')
```

### Reject Request
```typescript
procurementApprovalService.reject(approvalId, userId, 'manager' | 'project_manager')
```

## 📱 Dashboard Integration

### Manager Dashboard
Add a section to show pending procurement approval requests:

```typescript
const [procurementApprovals, setProcurementApprovals] = useState<any[]>([])

// Load procurement approvals
const loadManagerData = async () => {
  const procurementApprovalsData = await procurementApprovalService.getPendingApprovals()
  setProcurementApprovals(procurementApprovalsData || [])
}

// UI Section
<motion.div className="card p-6">
  <h3 className="text-lg font-semibold text-primary mb-4">
    Procurement Approval Requests
  </h3>
  <div className="space-y-3">
    {procurementApprovals.map((approval) => (
      <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <p className="font-medium">{approval.item_name}</p>
          <p className="text-sm text-gray-600">
            Quantity: {approval.quantity} × ₱{approval.unit_price} = ₱{approval.total_value}
          </p>
          <p className="text-xs text-gray-500">
            Requested by: {approval.requested_by_user?.full_name}
          </p>
          <p className="text-xs text-gray-500">
            Supplier: {approval.supplier} | Priority: {approval.priority}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleProcurementApproval(approval.id, 'approve')}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
            disabled={approval.manager_approved}
          >
            {approval.manager_approved ? 'Approved' : 'Approve'}
          </button>
          <button 
            onClick={() => handleProcurementApproval(approval.id, 'reject')}
            className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      </div>
    ))}
  </div>
</motion.div>
```

### Project Manager Dashboard
Similar implementation with `role: 'project_manager'` in the approve/reject calls.

### Employee Dashboard (Procurement Officer)
Add a section to show their procurement requests:

```typescript
const [myProcurementRequests, setMyProcurementRequests] = useState<any[]>([])

// Load employee's procurement requests
const loadEmployeeData = async () => {
  const requests = await procurementApprovalService.getByUser(user.id)
  setMyProcurementRequests(requests || [])
}

// UI Section
<motion.div className="card p-6">
  <h3 className="text-lg font-semibold text-primary mb-4">
    My Procurement Requests
  </h3>
  <div className="space-y-3">
    {myProcurementRequests.map((request) => (
      <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">{request.item_name}</p>
            <p className="text-sm text-gray-600">
              Quantity: {request.quantity} × ₱{request.unit_price} = ₱{request.total_value}
            </p>
            <p className="text-xs text-gray-500">
              Supplier: {request.supplier} | Priority: {request.priority}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 rounded text-xs ${
              request.status === 'approved' ? 'bg-green-100 text-green-800' :
              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {request.status}
            </span>
            {request.manager_approved && (
              <span className="text-xs text-green-600">✓ Manager</span>
            )}
            {request.project_manager_approved && (
              <span className="text-xs text-green-600">✓ Project Manager</span>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</motion.div>
```

## 🎯 Approval Flow

```
┌─────────────────┐
│ Employee Creates│
│ Procurement Req │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ procurement_    │
│ approvals table │
│ status: pending │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Manager Sees    │
│ & Approves      │
│ (First Level)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ status: pending │
│ manager_approved│
│ = true          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Project Manager │
│ Sees & Approves │
│ (Second Level)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ status: approved│
│ Both approved   │
│ = true          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ purchase_       │
│ requests table  │
│ (Auto-created)  │
└─────────────────┘
```

## ✅ Benefits

1. **Enhanced Control**: Two-level approval ensures proper oversight
2. **Complete Audit Trail**: Track every approval with timestamps and notes
3. **Consistent with Inventory**: Same workflow pattern for consistency
4. **Real-time Updates**: Dashboards update automatically
5. **Clear Status Tracking**: Always know who has approved and who is pending
6. **Rejection Handling**: Either manager can reject with notes

## 🔍 Troubleshooting

### Table doesn't exist
- Make sure you've applied the SQL migration in Supabase Dashboard
- Check that the migration ran successfully without errors

### Permission denied
- Check RLS policies in Supabase Dashboard
- Ensure users have the correct roles (manager, project_manager, etc.)

### Approvals not showing in dashboard
- Check that the `procurementApprovalService` is imported correctly
- Verify that the dashboard is calling `getPendingApprovals()`
- Check browser console for errors

### Purchase requests not being created after approval
- Verify that BOTH manager and project manager have approved
- Check the `purchase_requests` table exists
- Look at browser console for any errors during the approval process

## 📚 Related Files

- `supabase/migrations/012_create_procurement_approvals.sql` - Database migration
- `src/services/database.ts` - Service functions (procurementApprovalService)
- `test-procurement-approval-workflow.js` - Test script

## 🎉 Success Criteria

After successful setup, you should be able to:

✅ Create procurement requests as an employee
✅ See pending requests in Manager Dashboard
✅ Approve/reject requests as Manager (first level)
✅ See pending requests in Project Manager Dashboard
✅ Approve/reject requests as Project Manager (second level)
✅ See purchase requests created only after both approvals
✅ Track complete approval history
✅ See request status in Employee Dashboard

---

**Need Help?**

If you encounter any issues, please check:
1. The SQL migration was applied successfully
2. The RLS policies are configured correctly
3. The service is imported in your dashboard components
4. The test script runs without errors

**Happy Procuring! 🚀**
