# 🚨 Missing Tables Fix Guide

## 🚨 **URGENT: Database Tables Missing**

The error `relation "public.notifications" does not exist` indicates that your database is missing essential tables required for the approval workflow.

## 🔍 **Root Cause**

The `COMPLETE_DATABASE_SETUP.sql` script either:
1. **Wasn't run** - You need to run it in Supabase
2. **Failed to complete** - Some tables weren't created due to errors
3. **Was run partially** - Only some tables were created

## 🚀 **Quick Fix Solution**

### Step 1: Run Emergency Table Fix
```sql
-- Go to Supabase → SQL Editor
-- Copy and paste the entire EMERGENCY_TABLE_FIX.sql script
-- Click "Run" to execute
```

### Step 2: Verify Tables Exist
```bash
# Check if all required tables exist
node check-missing-tables.js
```

### Step 3: Test the Workflow
```bash
# Test the complete approval workflow
node diagnose-approval-workflow.js
```

## 📋 **What EMERGENCY_TABLE_FIX.sql Does**

### Creates Missing Tables
- ✅ `notifications` - For real-time notifications
- ✅ `purchase_requests` - For employee requests
- ✅ `purchase_request_approvals` - For manager approvals
- ✅ `approval_workflows` - For workflow configuration

### Creates Required Types
- ✅ `request_status` enum - For request statuses

### Sets Up RLS Policies
- ✅ Allows managers to view all requests
- ✅ Allows employees to create requests
- ✅ Allows system to create notifications

### Creates Required Functions
- ✅ `create_approval_entries()` - Auto-creates approvals for managers
- ✅ `get_pending_approvals()` - Fetches pending approvals for managers
- ✅ `submit_purchase_request()` - Creates new requests
- ✅ `approve_purchase_request()` - Approves requests
- ✅ `reject_purchase_request()` - Rejects requests

### Creates Auto-Approval Trigger
- ✅ `auto_create_approvals` - Automatically creates approval entries when requests are created

## 🎯 **Expected Results After Fix**

### ✅ Database Level
- All required tables exist
- RLS policies allow proper access
- Functions work correctly
- Auto-approval trigger fires

### ✅ Application Level
- No more "Failed to load dashboard data" errors
- Managers can see pending approvals
- Employees can create requests
- Real-time notifications work

## 🧪 **Testing the Fix**

### 1. Check Tables Exist
```bash
node check-missing-tables.js
```
**Expected Output:**
```
✅ Table users exists
✅ Table notifications exists
✅ Table purchase_requests exists
✅ Table purchase_request_approvals exists
✅ Table approval_workflows exists
🎉 All required tables exist!
```

### 2. Test Complete Workflow
```bash
node diagnose-approval-workflow.js
```
**Expected Output:**
```
✅ Database connection successful
✅ Employee authentication successful
✅ Manager authentication successful
✅ Request created successfully
✅ Approval entries created automatically
✅ Manager can see pending approvals
🚀 The approval workflow is fully functional!
```

## 🔧 **If Issues Persist**

### Check Database Connection
1. Verify your Supabase URL and API key are correct
2. Test connection with a simple query

### Check RLS Policies
1. Ensure RLS is enabled on all tables
2. Verify policies allow the required access

### Check Functions
1. Verify all functions exist and are callable
2. Test function calls with sample data

## 📞 **Support**

If you still have issues after running the emergency fix:

1. **Check the browser console** for specific error messages
2. **Run the diagnostic scripts** to identify the problem
3. **Verify your Supabase credentials** are correct
4. **Check that the emergency fix script** ran without errors

## 🎉 **Success Criteria**

After running the emergency fix, you should have:

- ✅ All required tables exist
- ✅ No "relation does not exist" errors
- ✅ Managers can see pending approvals
- ✅ Employees can create requests
- ✅ Real-time notifications work
- ✅ Complete approval workflow functional

---

**🚀 Run the EMERGENCY_TABLE_FIX.sql script to fix all missing tables and get your approval workflow working!**
