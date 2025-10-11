# Complete Database Setup Instructions

## 🎯 Single Script Setup

This guide will set up your entire Hospital Logistics System database with one script.

## 📋 Prerequisites

- ✅ Supabase project created
- ✅ Supabase URL and API key available
- ✅ Access to Supabase SQL Editor

## 🚀 Step-by-Step Setup

### Step 1: Run the Complete Database Setup

1. **Go to your Supabase project dashboard**
   - Open [supabase.com](https://supabase.com)
   - Sign in and select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the complete setup script**
   - Copy the ENTIRE content from `COMPLETE_DATABASE_SETUP.sql`
   - Paste it into the SQL Editor
   - Click "Run" button
   - Wait for completion (should take 30-60 seconds)

### Step 2: Verify Setup Success

**Look for this success message:**
```
🎉 COMPLETE DATABASE SETUP FINISHED!
✅ All tables created successfully
✅ All 7 users created with authentication
✅ Approval system configured
✅ RLS policies enabled
✅ Real-time subscriptions enabled
✅ Sample data inserted
```

### Step 3: Test Your Application

1. **Start your frontend application:**
   ```bash
   npm run dev
   ```

2. **Test login with any of these credentials:**

| Username | Password | Role | Dashboard Access |
|----------|----------|------|-----------------|
| admin | admin123 | Admin | User management, system overview |
| manager | manager123 | Manager | Pending approvals, approve/reject requests |
| employee | employee123 | Employee | Create requests, view own requests |
| procurement | procurement123 | Procurement | Purchase orders, inventory management |
| project_manager | pm123 | Project Manager | Project management, deliveries |
| maintenance | maintenance123 | Maintenance | Asset management, work orders |
| document_analyst | analyst123 | Document Analyst | Document management, versions |

## 🔍 What the Script Creates

### **Database Tables:**
- ✅ `users` - All user accounts with authentication
- ✅ `notifications` - Real-time notifications system
- ✅ `purchase_requests` - Enhanced with title, description, priority
- ✅ `purchase_orders` - Purchase order management
- ✅ `inventory` - Inventory tracking
- ✅ `projects` - Project management
- ✅ `documents` - Document management
- ✅ `assets` - Asset tracking
- ✅ `maintenance_logs` - Maintenance records
- ✅ `suppliers` - Supplier information
- ✅ `delivery_receipts` - Delivery tracking
- ✅ `approval_workflows` - Approval system configuration
- ✅ `purchase_request_approvals` - Approval tracking
- ✅ `inventory_change_approvals` - Inventory change approvals

### **Authentication System:**
- ✅ `authenticate_user()` function for login
- ✅ Password hashing with bcrypt
- ✅ All 7 test users with proper credentials

### **Approval Workflow:**
- ✅ Auto-creation of approval entries when requests are created
- ✅ Automatic notifications to managers
- ✅ Approval/rejection functions
- ✅ Real-time updates

### **Security:**
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Role-based access policies
- ✅ Secure authentication system

### **Real-time Features:**
- ✅ Real-time subscriptions for all tables
- ✅ Live notifications
- ✅ Cross-user updates

## 🧪 Testing the Approval Workflow

### **Test Manager Approval Workflow:**

1. **Login as Employee:**
   - Username: `employee`
   - Password: `employee123`
   - Create a new purchase request

2. **Login as Manager:**
   - Username: `manager`
   - Password: `manager123`
   - Check "Pending Approvals" section
   - You should see the request created by employee
   - Approve or reject the request

3. **Verify Notifications:**
   - Manager should receive notification about new request
   - Employee should receive notification about approval/rejection

## 🔧 Troubleshooting

### **If you get errors:**

1. **"relation does not exist" errors:**
   - Make sure you ran the complete script
   - Check that all tables were created

2. **"permission denied" errors:**
   - RLS policies are working (this is good!)
   - Make sure you're logged in with correct user

3. **"function does not exist" errors:**
   - Make sure the script completed successfully
   - Check that all functions were created

### **If login doesn't work:**

1. **Check authentication method:**
   - Your app should use `authenticate_user()` function
   - Not Supabase Auth

2. **Verify users exist:**
   - Go to Table Editor → users
   - Should see 7 users

## ✅ Success Indicators

After successful setup:

- ✅ No 404/400/500 errors in browser console
- ✅ All dashboards load without errors
- ✅ Login works with test credentials
- ✅ Manager can see pending approvals
- ✅ Employee can create requests
- ✅ Real-time notifications working
- ✅ No "notifications.filter is not a function" errors

## 🎉 You're Done!

Your Hospital Logistics System is now fully set up with:
- Complete database schema
- Working authentication
- Approval workflow system
- Real-time notifications
- Role-based dashboards
- Secure access controls

**All 7 role-based dashboards should now work perfectly!** 🚀
