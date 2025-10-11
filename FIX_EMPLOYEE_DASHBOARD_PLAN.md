# Fix Employee Dashboard Connectivity Issues

## Problem Analysis

The Employee Dashboard has two main issues:
1. **Failed to submit purchase request** - Using RPC function that may not exist
2. **Failed to load dashboard data** - Trying to use functions that may have database connectivity issues

## Root Causes

### Issue 1: Purchase Request Submission
- `approvalService.submitPurchaseRequest()` calls `supabase.rpc('submit_purchase_request')` 
- This RPC function may not exist in the database
- Should use direct table insertion like Procurement Dashboard does

### Issue 2: Dashboard Data Loading  
- `approvalService.getUserRequests()` may be using RPC or complex queries that fail
- `inventoryService.getByUser()` should work (we already fixed it)
- `notificationService.getUserNotifications()` may have issues

## Solution

### Fix 1: Change `submitPurchaseRequest` to use direct table insertion

**File: `src/services/approvalService.ts`**

Replace the RPC call with direct insertion into `procurement_approvals` table:

```typescript
async submitPurchaseRequest(requestData: {
  title: string
  description: string
  total_amount: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  required_date: string
  requested_by: string
}) {
  try {
    // Insert directly into procurement_approvals table
    const approvalData = {
      item_name: requestData.title,
      description: requestData.description,
      quantity: 1,
      unit_price: requestData.total_amount,
      total_value: requestData.total_amount,
      supplier: '',
      category: 'general',
      priority: requestData.priority,
      status: 'pending',
      requested_by: requestData.requested_by,
      request_reason: requestData.description,
      request_type: 'purchase_request'
    }

    const { data, error } = await supabase
      .from('procurement_approvals')
      .insert(approvalData)
      .select()
      .single()

    if (error) throw error
    return { success: true, request_id: data.id }
  } catch (error) {
    console.error('Error submitting purchase request:', error)
    throw error
  }
}
```

### Fix 2: Change `getUserRequests` to use direct table query

**File: `src/services/approvalService.ts`**

Replace the RPC call with direct query from `procurement_approvals` table:

```typescript
async getUserRequests(userId: string) {
  try {
    const { data, error } = await supabase
      .from('procurement_approvals')
      .select('*')
      .eq('requested_by', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Map to expected format
    return (data || []).map(req => ({
      id: req.id,
      request_number: `REQ-${req.id.slice(-8)}`,
      title: req.item_name,
      description: req.description,
      status: req.status,
      priority: req.priority,
      total_amount: req.total_value,
      required_date: req.created_at,
      created_at: req.created_at,
      approvals: []
    }))
  } catch (error) {
    console.error('Error fetching user requests:', error)
    return []
  }
}
```

### Fix 3: Verify `getUserNotifications` works

**File: `src/services/database.ts` (notificationService)**

Ensure it uses simple query:
```typescript
async getUserNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}
```

## Expected Outcome

After these changes:
1. Employee can submit purchase requests without RPC errors
2. Employee Dashboard loads all data successfully
3. Requests appear in Manager Dashboard for approval
4. No more "Failed to submit" or "Failed to load" errors
5. Clear workflow: Employee submits → Manager approves → PM approves

