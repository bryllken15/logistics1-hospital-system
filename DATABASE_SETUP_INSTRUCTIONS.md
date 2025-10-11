# Database Setup Instructions
## Smart Supply Chain & Procurement Management System

### 🚨 Current Issue
**Error**: `Cannot read properties of undefined (reading 'toUpperCase')`

This error occurs because the database schema hasn't been set up yet. The enhanced dashboards are trying to access data that doesn't exist.

### ✅ Solution

You need to run the database setup scripts in your Supabase project. Here's the step-by-step process:

---

## Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Navigate to **SQL Editor** (in the left sidebar)

---

## Step 2: Run the Clean Migration Script

1. In the SQL Editor, click **"New Query"**
2. Copy the **entire content** from `supabase/clean_migration.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** to execute the script

**⚠️ Important**: This script will:
- Drop existing tables (if any)
- Create all necessary tables with proper schema
- Set up user roles and permissions
- Enable real-time features

---

## Step 3: Run the Enhanced Schema Script

1. After the clean migration completes successfully
2. Create another **"New Query"**
3. Copy the **entire content** from `fix-documents-maintenance-schema.sql`
4. Paste it into the SQL Editor
5. Click **"Run"** to execute the script

This adds the enhanced features for the new dashboards.

---

## Step 4: Run the Missing Tables Script

1. Create another **"New Query"**
2. Copy the **entire content** from `fix-missing-tables.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** to execute the script

This ensures all required tables exist.

---

## Step 5: Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see these tables:
   - `users`
   - `documents`
   - `assets`
   - `maintenance_logs`
   - `maintenance_schedule`
   - `system_logs`
   - `inventory`
   - `projects`
   - And several others

---

## Step 6: Test the Application

1. Go back to your application
2. Hard refresh your browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)
3. Navigate to the Document Analyst or Maintenance dashboard
4. The error should be resolved

---

## 🎯 Expected Results

After completing these steps:

- ✅ **No more "toUpperCase" errors**
- ✅ **All dashboards load properly**
- ✅ **Database tables exist with correct schema**
- ✅ **Enhanced features work correctly**
- ✅ **Real-time updates function**

---

## 🔧 Troubleshooting

### If you get permission errors:
- Make sure you're logged in as the project owner
- Check that your Supabase project is active

### If tables don't appear:
- Wait a few minutes for the changes to propagate
- Refresh the Table Editor page

### If the application still shows errors:
- Clear your browser cache completely
- Restart your development server
- Check the browser console for any remaining errors

---

## 📋 Files to Use

1. **`supabase/clean_migration.sql`** - Main database setup
2. **`fix-documents-maintenance-schema.sql`** - Enhanced features
3. **`fix-missing-tables.sql`** - Missing table fixes

---

## 🚀 Next Steps

Once the database is set up:

1. **Test Document Analyst Dashboard**:
   - Try uploading a document
   - Test the category and tag features
   - Verify real-time updates

2. **Test Maintenance Dashboard**:
   - Try adding an asset
   - Test work order creation
   - Verify predictive maintenance alerts

3. **Test All Features**:
   - Document version control
   - Asset QR codes
   - Spare parts inventory
   - Analytics and reporting

Your Smart Supply Chain & Procurement Management System will be fully functional! 🎉
