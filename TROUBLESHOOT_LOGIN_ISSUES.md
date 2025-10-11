# Troubleshoot Login Issues - Step by Step Guide

## Current Issue: Still Getting "Invalid username or password"

This means the database setup hasn't been completed successfully. Let's diagnose and fix this step by step.

## 🔍 Step 1: Verify Database Setup

### Check if Users Table Exists

1. **Go to your Supabase project dashboard**
2. **Navigate to Table Editor**
3. **Look for a "users" table**
4. **If you don't see it, the migration didn't run successfully**

### If Users Table Doesn't Exist:

**This means `supabase/clean_migration.sql` hasn't been run yet.**

**Solution:**
1. Go to **SQL Editor** in Supabase
2. Copy the ENTIRE content from `supabase/clean_migration.sql`
3. Paste it into SQL Editor
4. Click **"Run"** button
5. Wait for completion (should show success message)

## 🔍 Step 2: Check if Sample Users Were Created

### If Users Table Exists:

1. **Click on the "users" table in Table Editor**
2. **You should see 7 rows of data**
3. **Check if these usernames exist:**
   - admin
   - manager
   - employee
   - procurement
   - project_manager
   - maintenance
   - document_analyst

### If Users Table is Empty:

**This means the sample data insertion failed.**

**Solution:**
1. Go to **SQL Editor**
2. Run this query to check for errors:
   ```sql
   SELECT * FROM users;
   ```
3. If empty, re-run `supabase/clean_migration.sql`

## 🔍 Step 3: Check Authentication Method

### Your Frontend Might Be Using Supabase Auth Instead of Custom Users

**Check your login component:**
1. Look at `src/contexts/AuthContext.tsx`
2. Check if it's using `supabase.auth.signInWithPassword()`
3. If yes, you need to create users in Supabase Auth, not just the users table

### If Using Supabase Auth:

**You need to create users in Supabase Auth:**

1. **Go to Authentication → Users in Supabase**
2. **Click "Add user"**
3. **Create these users:**

| Email | Password | Role |
|-------|----------|------|
| admin@hospital.com | admin123 | admin |
| manager@hospital.com | manager123 | manager |
| employee@hospital.com | employee123 | employee |
| procurement@hospital.com | procurement123 | procurement |
| project_manager@hospital.com | pm123 | project_manager |
| maintenance@hospital.com | maintenance123 | maintenance |
| document_analyst@hospital.com | analyst123 | document_analyst |

## 🔍 Step 4: Check Your Login Implementation

### Check How Login Works in Your App

**Look at your login form:**
1. Does it use `supabase.auth.signInWithPassword()`?
2. Does it use a custom authentication function?
3. Does it check the `users` table directly?

### If Using Supabase Auth:

**Login with email instead of username:**
- Username: `admin@hospital.com`
- Password: `admin123`

### If Using Custom Authentication:

**Check the authenticate function:**
1. Look for `authenticate_user()` function in your database
2. Make sure it's working correctly
3. Test with username/password combination

## 🔍 Step 5: Alternative Quick Fix

### Create Users Manually in Supabase Auth

**If you want to use Supabase Auth (recommended):**

1. **Go to Authentication → Users**
2. **Click "Add user"**
3. **Create these users one by one:**

```
Email: admin@hospital.com
Password: admin123
Email Confirm: true
```

```
Email: manager@hospital.com
Password: manager123
Email Confirm: true
```

```
Email: employee@hospital.com
Password: employee123
Email Confirm: true
```

```
Email: procurement@hospital.com
Password: procurement123
Email Confirm: true
```

```
Email: project_manager@hospital.com
Password: pm123
Email Confirm: true
```

```
Email: maintenance@hospital.com
Password: maintenance123
Email Confirm: true
```

```
Email: document_analyst@hospital.com
Password: analyst123
Email Confirm: true
```

## 🔍 Step 6: Test Login

### After Creating Users:

1. **Start your application:** `npm run dev`
2. **Try logging in with:**
   - Email: `admin@hospital.com`
   - Password: `admin123`

### Expected Result:
- ✅ Login successful
- ✅ Dashboard loads
- ✅ No "notifications.filter is not a function" errors

## 🔍 Step 7: If Still Not Working

### Check Your AuthContext Implementation

**Look at `src/contexts/AuthContext.tsx`:**

```typescript
// Should look something like this:
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  // ... rest of implementation
}
```

### If Using Custom Authentication:

**Check if the authenticate_user function exists:**
1. Go to **SQL Editor**
2. Run: `SELECT authenticate_user('admin', 'admin123');`
3. Should return user data or error

## 🎯 Quick Diagnosis Commands

### Run These in Supabase SQL Editor:

**1. Check if users table exists:**
```sql
SELECT COUNT(*) FROM users;
```

**2. Check if sample users exist:**
```sql
SELECT username, role FROM users;
```

**3. Check if authenticate function exists:**
```sql
SELECT authenticate_user('admin', 'admin123');
```

**4. Check Supabase Auth users:**
```sql
SELECT email FROM auth.users;
```

## 🚀 Most Likely Solution

**Based on your setup, you probably need to:**

1. **Create users in Supabase Auth** (Authentication → Users → Add user)
2. **Use email instead of username for login**
3. **Make sure your AuthContext uses `supabase.auth.signInWithPassword()`**

**Try logging in with:**
- Email: `admin@hospital.com`
- Password: `admin123`

This should work immediately! 🎉
