# Running Verification Scripts - Setup Guide

## Problem Fixed ✅

The verification scripts have been updated to use ES module syntax instead of CommonJS.

## Scripts Available

### 1. `verify-schema-fix.js`
**Purpose:** Verifies that the purchase_requests table schema is correctly set up
**Usage:** `node verify-schema-fix.js`

### 2. `verify-users-before-approval.js`
**Purpose:** Checks if users exist before running the approval system
**Usage:** `node verify-users-before-approval.js`

### 3. `test-all-dashboards.js`
**Purpose:** Comprehensive testing of all role-based dashboards and real-time functionality
**Usage:** `node test-all-dashboards.js`

## Prerequisites

### 1. Environment Variables
Make sure you have your Supabase credentials set up:

```bash
# Option 1: Set environment variables
export VITE_SUPABASE_URL="your-supabase-url"
export VITE_SUPABASE_ANON_KEY="your-supabase-key"

# Option 2: Create .env file
echo "VITE_SUPABASE_URL=your-supabase-url" > .env
echo "VITE_SUPABASE_ANON_KEY=your-supabase-key" >> .env
```

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js
```

## Running the Scripts

### Step 1: Verify Schema Fix
```bash
node verify-schema-fix.js
```

**Expected Output:**
- ✅ purchase_requests table accessible
- ✅ Enhanced schema working correctly
- ✅ All required columns present

### Step 2: Verify Users (if needed)
```bash
node verify-users-before-approval.js
```

**Expected Output:**
- ✅ Found X users in the database
- ✅ All required roles found
- ✅ Found X authorized users

### Step 3: Test All Dashboards
```bash
node test-all-dashboards.js
```

**Expected Output:**
- ✅ Database connection successful
- ✅ Notifications table accessible
- ✅ Approval system tables created
- ✅ Real-time subscriptions working
- ✅ All role-based dashboards working

## Troubleshooting

### Error: "require is not defined in ES module scope"
**Solution:** ✅ Fixed - Scripts now use ES module syntax

### Error: "Cannot find module '@supabase/supabase-js'"
**Solution:** Run `npm install @supabase/supabase-js`

### Error: "Database connection failed"
**Solution:** Check your Supabase URL and API key

### Error: "Schema mismatch detected"
**Solution:** Run the updated `supabase/clean_migration.sql` first

## Expected Workflow

1. **Run enhanced migration:** `supabase/clean_migration.sql` in Supabase SQL Editor
2. **Verify schema:** `node verify-schema-fix.js`
3. **Run approval system:** `CREATE_APPROVAL_SYSTEM.sql` in Supabase SQL Editor
4. **Test everything:** `node test-all-dashboards.js`
5. **Test frontend:** Open `test-dashboard-frontend.html`

## Success Indicators

- [x] No "require is not defined" errors
- [x] No "column does not exist" errors
- [x] No foreign key constraint violations
- [x] Enhanced purchase_requests table created
- [x] Approval system tables created
- [x] All RPC functions working
- [x] Sample data inserted successfully
- [x] Real-time subscriptions enabled
- [x] All dashboards load without errors

The verification scripts are now ready to use! 🎉
