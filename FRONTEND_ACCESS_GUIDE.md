# 🚀 Frontend Access Guide

## How to Access Your Inventory Approval System

### 1. Start the Development Server
The server should already be running in the background. If not, run:
```bash
npm start
```

### 2. Open Your Browser
Go to: **http://localhost:3000**

### 3. Login with Test Users

#### For Employee (SWS) Dashboard:
- **Email**: `employee@hospital.com`
- **Password**: `password123`
- **Role**: Employee
- **What you'll see**: "My Inventory Requests" section where you can create new requests

#### For Manager Dashboard:
- **Email**: `manager@hospital.com` 
- **Password**: `password123`
- **Role**: Manager
- **What you'll see**: "Inventory Approval Requests" section where you can approve/reject requests

#### For Project Manager Dashboard:
- **Email**: `pm@hospital.com`
- **Password**: `password123`
- **Role**: Project Manager
- **What you'll see**: Can also approve inventory requests

### 4. Test the Complete Workflow

#### Step 1: Employee Creates Request
1. Login as **Employee**
2. Go to **Employee Dashboard**
3. Look for **"My Inventory Requests"** section
4. Click **"New Request"** button
5. Fill out the form:
   - Item Name: "Emergency Medical Supplies"
   - Quantity: 100
   - Unit Price: 25.50
   - Location: "Emergency Ward"
   - Reason: "Urgent restocking needed"
6. Click **"Submit Request"**

#### Step 2: Manager Approves Request
1. Login as **Manager**
2. Go to **Manager Dashboard**
3. Look for **"Inventory Approval Requests"** section
4. You should see the request you just created
5. Click **"Approve"** button

#### Step 3: Verify the Result
1. Go back to **Employee Dashboard**
2. Check **"My Inventory Requests"** section
3. The request should now show as **"APPROVED"**

### 5. What You Should See

#### Employee Dashboard Features:
- ✅ **"My Inventory Requests"** section
- ✅ **"New Request"** button to create requests
- ✅ **Request status** (Pending/Approved/Rejected)
- ✅ **Request details** (item name, quantity, price, total value)

#### Manager Dashboard Features:
- ✅ **"Inventory Approval Requests"** section
- ✅ **Pending requests** from employees
- ✅ **Approve/Reject** buttons
- ✅ **Request details** and approval status

### 6. Troubleshooting

If you don't see the sections:
1. **Check the browser console** for any errors
2. **Refresh the page** after logging in
3. **Make sure you're logged in with the correct role**
4. **Check if the development server is running** (should show "localhost:3000")

### 7. Expected UI Sections

#### Employee Dashboard:
```
┌─────────────────────────────────────┐
│ My Inventory Requests               │
│ [New Request] Button                │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Emergency Medical Supplies       │ │
│ │ Status: PENDING                  │ │
│ │ Quantity: 100 • Price: ₱25.50   │ │
│ │ Total: ₱2,550                   │ │
│ │ Reason: Urgent restocking...    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Manager Dashboard:
```
┌─────────────────────────────────────┐
│ Inventory Approval Requests          │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Emergency Medical Supplies       │ │
│ │ Status: PENDING                  │ │
│ │ Quantity: 100 • Price: ₱25.50   │ │
│ │ Total: ₱2,550                   │ │
│ │ [Approve] [Reject] Buttons      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🎯 Quick Test

1. **Login as Employee** → Create a request
2. **Login as Manager** → Approve the request  
3. **Login as Employee** → See the approved status

Your inventory approval workflow is now fully functional! 🎉
