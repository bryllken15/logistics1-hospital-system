# 🚀 Quick Start: Procurement Approval System Setup

## ⏱️ Estimated Time: 10-15 minutes

Follow these simple steps to add multi-level approval for procurement/purchase requests to your system.

---

## Step 1: Apply SQL Migration (5 minutes)

### Option A: Supabase Dashboard (Recommended)

1. Open your Supabase project: https://app.supabase.com/project/otjdtdnuowhlqriidgfg
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase/migrations/012_create_procurement_approvals.sql`
5. Copy ALL the contents
6. Paste into the SQL Editor
7. Click **RUN** button
8. Wait for "Success. No rows returned" message

✅ **Done!** The `procurement_approvals` table is now created.

---

## Step 2: Test the Backend (2 minutes)

Open terminal and run:

```bash
node test-procurement-approval-workflow.js
```

You should see:

```
🎉 Procurement Multi-Level Approval Test PASSED!

📋 Summary:
   ✅ Procurement approval requests can be created
   ✅ Manager can approve requests (first level)
   ✅ Project Manager can approve requests (second level)
   ✅ Complete multi-level procurement workflow works!

✨ Procurement multi-level approval workflow is working!
```

✅ **Done!** Backend is working correctly.

---

## Step 3: Add to Your Dashboards (5-10 minutes)

### A. Add Import Statement

In each dashboard file, add this import:

```typescript
import { procurementApprovalService, systemLogService } from '../../services/database'
```

### B. Manager Dashboard

**File:** `src/components/dashboards/ManagerDashboard.tsx`

1. **Add State:**
```typescript
const [procurementApprovals, setProcurementApprovals] = useState<any[]>([])
```

2. **Load Data:**
```typescript
const loadManagerData = async () => {
  // ... existing code ...
  
  const procurementApprovalsData = await procurementApprovalService.getPendingApprovals()
  setProcurementApprovals(procurementApprovalsData || [])
}
```

3. **Add Handler:**
```typescript
const handleProcurementApproval = async (approvalId: string, action: 'approve' | 'reject') => {
  try {
    if (action === 'approve') {
      await procurementApprovalService.approve(approvalId, user?.id || '', 'manager')
      toast.success('Procurement request approved!')
    } else {
      await procurementApprovalService.reject(approvalId, user?.id || '', 'manager')
      toast.success('Procurement request rejected!')
    }
    loadManagerData() // Refresh
  } catch (error) {
    toast.error('Failed to process approval')
  }
}
```

4. **Add UI Section** (copy from `PROCUREMENT_FRONTEND_INTEGRATION.md` file, lines 236-334)

### C. Project Manager Dashboard

**File:** `src/components/dashboards/ProjectManagerDashboard.tsx`

Same as Manager Dashboard, but use `'project_manager'` instead of `'manager'` in the approve/reject calls.

### D. Procurement/Employee Dashboard

**File:** Create new or update existing procurement dashboard

1. **Add State:**
```typescript
const [myProcurementRequests, setMyProcurementRequests] = useState<any[]>([])
```

2. **Load Data:**
```typescript
const loadMyRequests = async () => {
  const requestsData = await procurementApprovalService.getByUser(user?.id || '')
  setMyProcurementRequests(requestsData || [])
}
```

3. **Add Create Handler:**
```typescript
const handleCreateProcurementRequest = async (formData: any) => {
  try {
    await procurementApprovalService.createWithApproval({
      item_name: formData.item_name,
      description: formData.description,
      quantity: parseInt(formData.quantity),
      unit_price: parseFloat(formData.unit_price),
      supplier: formData.supplier,
      category: formData.category || 'general',
      priority: formData.priority || 'medium',
      reason: formData.reason || 'New procurement request'
    }, user?.id || '')
    
    toast.success('Procurement request submitted for approval!')
    loadMyRequests() // Refresh
  } catch (error) {
    toast.error('Failed to create request')
  }
}
```

4. **Add UI Section** (copy from `PROCUREMENT_FRONTEND_INTEGRATION.md` file, lines 336-425)

---

## Step 4: Test in Frontend (3 minutes)

1. **Login as Employee:**
   - Username: `employee`
   - Password: `employee123`
   - Create a procurement request
   - Verify it appears in "My Procurement Requests"

2. **Login as Manager:**
   - Username: `manager`
   - Password: `manager123`
   - Verify request appears in "Procurement Approval Requests"
   - Click "Approve"
   - Verify status updates

3. **Login as Project Manager:**
   - Verify request appears in "Procurement Approvals for Project Logistics"
   - Click "Approve"
   - Verify status changes to "Approved"

4. **Verify Purchase Request Created:**
   - Check `purchase_requests` table in Supabase
   - Should see new entry with both approvals

✅ **Done!** Procurement approval system is fully working!

---

## 📋 Checklist

- [ ] Applied SQL migration in Supabase Dashboard
- [ ] Ran test script successfully
- [ ] Added imports to dashboard files
- [ ] Added state management to dashboards
- [ ] Added load data functions
- [ ] Added approval handlers
- [ ] Added UI sections
- [ ] Tested complete workflow
- [ ] Verified purchase requests are created after both approvals

---

## 🎯 Quick Reference

### Service Functions

**Create Request:**
```typescript
procurementApprovalService.createWithApproval(requestData, userId)
```

**Get Pending (for managers):**
```typescript
procurementApprovalService.getPendingApprovals()
```

**Get My Requests (for employees):**
```typescript
procurementApprovalService.getByUser(userId)
```

**Approve:**
```typescript
procurementApprovalService.approve(id, userId, 'manager' | 'project_manager')
```

**Reject:**
```typescript
procurementApprovalService.reject(id, userId, 'manager' | 'project_manager')
```

---

## 🆘 Troubleshooting

**Problem:** "permission denied for table procurement_approvals"
**Solution:** You haven't applied the SQL migration yet. Go to Step 1.

**Problem:** Test script fails
**Solution:** Make sure SQL migration was applied successfully. Check Supabase logs.

**Problem:** Can't see requests in dashboard
**Solution:** 
- Check that `procurementApprovalService` is imported
- Check that load function is being called
- Check browser console for errors

**Problem:** Approvals not working
**Solution:**
- Check that you're passing the correct approval ID (not inventory_id)
- Check that you're passing the correct role ('manager' or 'project_manager')
- Check browser console for errors

---

## 📚 More Information

For detailed documentation, see:
- `PROCUREMENT_APPROVAL_SETUP_GUIDE.md` - Complete setup guide
- `PROCUREMENT_FRONTEND_INTEGRATION.md` - Detailed frontend examples
- `COMPLETE_APPROVAL_SYSTEM_SUMMARY.md` - Full system overview

---

## 🎉 Success!

After completing these steps, you'll have:

✅ Multi-level approval for procurement requests
✅ Manager approval (first level)
✅ Project Manager approval (second level)
✅ Automatic purchase request creation after both approvals
✅ Complete audit trail with timestamps
✅ Real-time dashboard updates
✅ Same workflow pattern as inventory approvals

**Your procurement system now has the same professional multi-level approval workflow as your inventory system!** 🚀

---

## 💡 Pro Tips

1. **Customize Priority Levels:** Edit the `priority` field in the form to match your needs
2. **Add Email Notifications:** Integrate with an email service to notify approvers
3. **Add Approval Notes:** Use the `manager_notes` and `project_manager_notes` fields
4. **Track Suppliers:** Use the `supplier` field to maintain vendor relationships
5. **Category Management:** Organize requests by category for better reporting

---

## 🙏 Need Help?

If you get stuck:
1. Check the documentation files
2. Review the test script for examples
3. Check browser console for errors
4. Review Supabase logs for database errors
5. Make sure all files are saved and the frontend is restarted

---

**Ready to start? Begin with Step 1!** 🎯
