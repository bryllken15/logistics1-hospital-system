# 🚀 Complete Setup Guide for Logistics 1 System

## ⚠️ Current Issue
You're getting "Cannot read properties of undefined (reading 'toLocaleString')" because:
1. The database schema hasn't been set up in Supabase
2. The `.env.local` file is missing or not configured
3. The application can't connect to the database

## 🔧 Step-by-Step Fix

### Step 1: Create Environment File
1. Copy `env.local.template` to `.env.local`
2. Update the Supabase credentials:

```bash
# Copy the template
cp env.local.template .env.local
```

Then edit `.env.local` with your actual Supabase credentials:
```
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

### Step 2: Set Up Database Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the **FIRST script** from the output below
4. Click **Run** to execute the schema
5. Copy and paste the **SECOND script** (Permission Fix)
6. Click **Run** to execute the permission fix

### Step 3: Verify Setup
1. Start the development server: `npm run dev`
2. Go to `http://localhost:5173`
3. Try logging in with sample credentials
4. Test the "Test DB" button in Procurement Dashboard

## 🎯 Sample Users for Testing
- **Admin**: username: `admin`, password: `admin123`
- **Manager**: username: `manager`, password: `manager123`
- **Employee**: username: `employee`, password: `employee123`
- **Procurement**: username: `procurement`, password: `procurement123`
- **Project Manager**: username: `project_manager`, password: `pm123`
- **Maintenance**: username: `maintenance`, password: `maintenance123`
- **Document Analyst**: username: `document_analyst`, password: `analyst123`

## 🔍 Troubleshooting
If you still get errors:
1. Check that your Supabase URL and key are correct
2. Verify the database schema was applied successfully
3. Check the browser console for specific error messages
4. Try the "Test DB" button to verify database connection

## ✅ Expected Results
After setup:
- ✅ Login should work with sample credentials
- ✅ All dashboards should load with data
- ✅ Purchase orders and requests should appear in tables
- ✅ Real-time updates should work
- ✅ No more "toLocaleString" errors
