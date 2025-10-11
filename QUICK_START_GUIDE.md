# 🚀 Quick Start Guide - Hospital Logistics System

## 📋 Prerequisites

1. **Supabase Project** - You need a Supabase project set up
2. **Node.js** - For running test scripts
3. **Frontend Application** - Your React/Vue application

## 🎯 Step-by-Step Setup

### Step 1: Database Setup

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Copy the entire content from `COMPLETE_DATABASE_SETUP.sql`**
4. **Paste it into the SQL Editor**
5. **Click "Run" to execute the script**
6. **Verify no errors occurred**

### Step 2: Configure Supabase Credentials

#### Option A: Environment Variables (Recommended)

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Option B: Set Environment Variables Manually

**Windows (PowerShell):**
```powershell
$env:VITE_SUPABASE_URL="https://your-project-id.supabase.co"
$env:VITE_SUPABASE_ANON_KEY="your-anon-key-here"
```

**Windows (Command Prompt):**
```cmd
set VITE_SUPABASE_URL=https://your-project-id.supabase.co
set VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Linux/Mac:**
```bash
export VITE_SUPABASE_URL="https://your-project-id.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key-here"
```

### Step 3: Get Your Supabase Credentials

1. **Go to your Supabase project dashboard**
2. **Click on "Settings" → "API"**
3. **Copy the "Project URL"** (this is your `VITE_SUPABASE_URL`)
4. **Copy the "anon public" key** (this is your `VITE_SUPABASE_ANON_KEY`)

### Step 4: Test the Setup

#### Test Database Setup (No Credentials Required)
```bash
node test-database-setup-verification.js
```

#### Test with Credentials (After setting up .env)
```bash
# Test all dashboards
node test-all-dashboards-comprehensive.js

# Test manager workflow specifically
node test-manager-workflow.js

# Test real-time updates
node test-realtime-cross-user.js
```

### Step 5: Test the Application

1. **Start your frontend application**
2. **Login with any of these test users:**

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager | manager123 |
| Employee | employee | employee123 |
| Procurement | procurement | procurement123 |
| Project Manager | project_manager | pm123 |
| Maintenance | maintenance | maintenance123 |
| Document Analyst | document_analyst | analyst123 |

3. **Test the manager approval workflow:**
   - Login as Employee
   - Create a purchase request
   - Login as Manager
   - Verify you see the request in pending approvals
   - Approve or reject the request
   - Login back as Employee to see the status update

## 🔧 Troubleshooting

### Common Issues

#### ❌ "Invalid supabaseUrl" Error
**Solution:** Set up your Supabase credentials in `.env` file or environment variables

#### ❌ "Invalid username or password" Error
**Solution:** 
1. Verify `COMPLETE_DATABASE_SETUP.sql` ran successfully
2. Check that users table has data
3. Ensure `authenticate_user` function exists

#### ❌ 404/400/500 Errors
**Solution:**
1. Verify all tables were created
2. Check RLS policies are not blocking access
3. Ensure functions exist and are callable

#### ❌ Managers Don't Receive Requests
**Solution:**
1. Check auto-approval trigger exists
2. Verify approval entries are being created
3. Check notification triggers are working

#### ❌ Real-time Updates Don't Work
**Solution:**
1. Verify real-time is enabled in Supabase
2. Check tables have replication enabled
3. Ensure frontend uses correct Supabase client

## 📊 Verification Checklist

### Database Setup ✅
- [ ] `COMPLETE_DATABASE_SETUP.sql` executed successfully
- [ ] All tables created (users, notifications, purchase_requests, etc.)
- [ ] All functions created (authenticate_user, submit_purchase_request, etc.)
- [ ] RLS policies configured
- [ ] Real-time enabled for key tables

### Authentication ✅
- [ ] All 7 test users can login
- [ ] Custom `authenticate_user` function working
- [ ] No "Invalid username or password" errors

### Manager Workflow ✅
- [ ] Employee can create purchase request
- [ ] Manager receives request in pending approvals
- [ ] Manager receives notification
- [ ] Manager can approve/reject request
- [ ] Employee receives approval/rejection notification

### Dashboards ✅
- [ ] Admin Dashboard: User management, system overview
- [ ] Manager Dashboard: Pending approvals, notifications
- [ ] Employee Dashboard: Create requests, view own requests
- [ ] Procurement Dashboard: Purchase orders, suppliers
- [ ] Project Manager Dashboard: Projects, deliveries
- [ ] Maintenance Dashboard: Assets, work orders
- [ ] Document Analyst Dashboard: Documents, versions

### Real-time Updates ✅
- [ ] Cross-user notifications working
- [ ] Live data updates across sessions
- [ ] No JavaScript errors in console

## 🎉 Success!

If all checklist items are completed, your Hospital Logistics Management System is fully functional with:

- ✅ **7 Role-based Dashboards** working perfectly
- ✅ **Manager Approval Workflow** functioning end-to-end
- ✅ **Real-time Updates** across all users
- ✅ **Defensive Coding** preventing filter errors
- ✅ **Complete Database Schema** with security
- ✅ **Authentication System** with 7 test users

## 📞 Support

If you need help:
1. Check the browser console for errors
2. Verify your Supabase credentials are correct
3. Review the `COMPLETE_IMPLEMENTATION_SUMMARY.md` file
4. Run the verification scripts to identify issues

---

**🚀 Your Hospital Logistics Management System is ready for production use!**
