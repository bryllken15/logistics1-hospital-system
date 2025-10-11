# Supabase Credentials Setup Guide

## Problem Identified ✅

The verification scripts are failing because they need your actual Supabase credentials instead of placeholder values.

## Current Issue

**Error:** `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.`

**Root Cause:** The scripts are using placeholder values:
```javascript
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'
```

## Solution Options

### Option 1: Set Environment Variables (Recommended)

**Windows (PowerShell):**
```powershell
$env:VITE_SUPABASE_URL="https://your-project-id.supabase.co"
$env:VITE_SUPABASE_ANON_KEY="your-anon-key"
```

**Windows (Command Prompt):**
```cmd
set VITE_SUPABASE_URL=https://your-project-id.supabase.co
set VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Linux/Mac:**
```bash
export VITE_SUPABASE_URL="https://your-project-id.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### Option 2: Create .env File

Create a `.env` file in your project root:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Option 3: Update Scripts Directly

Modify the verification scripts to include your actual credentials:

```javascript
// Replace these lines in verify-schema-fix.js, verify-users-before-approval.js, and test-all-dashboards.js
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseKey = 'your-anon-key'
```

## How to Find Your Supabase Credentials

### Step 1: Go to Your Supabase Project
1. Open [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### Step 2: Get Your Project URL
1. Go to **Settings** → **API**
2. Copy the **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)

### Step 3: Get Your API Key
1. In the same **Settings** → **API** page
2. Copy the **anon public** key (starts with `eyJ...`)

## Quick Test

After setting up credentials, test with:

```bash
node verify-schema-fix.js
```

**Expected Output:**
```
🔍 Verifying purchase_requests table schema...

✅ purchase_requests table accessible
✅ Enhanced schema working correctly
✅ All required columns present: title, description, total_amount, priority, required_date
```

## Alternative: Skip Verification Scripts

If you prefer to skip the verification scripts, you can:

1. **Run the database setup directly:**
   - Go to Supabase SQL Editor
   - Run `supabase/clean_migration.sql`
   - Run `CREATE_APPROVAL_SYSTEM.sql`

2. **Test the frontend:**
   - Start your app: `npm run dev`
   - Open `test-dashboard-frontend.html`
   - Test all role-based dashboards

## Files That Need Credentials

- `verify-schema-fix.js`
- `verify-users-before-approval.js`
- `test-all-dashboards.js`

## Success Indicators

After setting up credentials:
- ✅ No "Invalid supabaseUrl" errors
- ✅ Database connection successful
- ✅ Schema verification working
- ✅ All dashboards testing functional

The verification scripts will work once you provide your actual Supabase credentials! 🎉
