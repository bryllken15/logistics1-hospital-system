# 🔧 Supabase Database Fix Guide

## ❌ **The Problem**
You're getting this error:
```
ERROR: 23503: insert or update on table "users" violates foreign key constraint "users_id_fkey"
DETAIL: Key (id)=(00000000-0000-0000-0000-000000000001) is not present in table "users".
```

This happens because we're trying to insert users with hardcoded UUIDs that don't exist in the `auth.users` table.

## ✅ **The Solution**

### **Step 1: Reset Your Database**

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Run this command to reset the database:**
   ```sql
   -- Reset all tables
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```

### **Step 2: Run the Fixed Migrations**

Run these migrations in order in your Supabase SQL Editor:

1. **First, run the initial schema:**
   ```sql
   -- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
   ```

2. **Then run the RLS policies:**
   ```sql
   -- Copy and paste the contents of supabase/migrations/002_seed_data.sql
   ```

3. **Finally, run the simple setup:**
   ```sql
   -- Copy and paste the contents of supabase/migrations/006_simple_setup.sql
   ```

### **Step 3: Create Demo Users (Recommended Approach)**

Instead of hardcoded users, create them through the Supabase Auth UI:

1. **Go to Authentication → Users in your Supabase dashboard**
2. **Click "Add user"**
3. **Create these demo users one by one:**

   **Admin User:**
   - Email: `admin@logistics1.com`
   - Password: `admin123`
   - User Metadata: `{"full_name": "System Administrator", "role": "admin", "is_authorized": true}`

   **Manager User:**
   - Email: `manager@logistics1.com`
   - Password: `manager123`
   - User Metadata: `{"full_name": "Operations Manager", "role": "manager", "is_authorized": true}`

   **Employee User:**
   - Email: `employee@logistics1.com`
   - Password: `employee123`
   - User Metadata: `{"full_name": "Warehouse Employee", "role": "employee", "is_authorized": true}`

   **Procurement User:**
   - Email: `procurement@logistics1.com`
   - Password: `procurement123`
   - User Metadata: `{"full_name": "Procurement Specialist", "role": "procurement", "is_authorized": true}`

   **Project Manager User:**
   - Email: `project@logistics1.com`
   - Password: `project123`
   - User Metadata: `{"full_name": "Project Manager", "role": "project_manager", "is_authorized": true}`

   **Maintenance User:**
   - Email: `maintenance@logistics1.com`
   - Password: `maintenance123`
   - User Metadata: `{"full_name": "Maintenance Technician", "role": "maintenance", "is_authorized": true}`

   **Document Analyst User:**
   - Email: `document@logistics1.com`
   - Password: `document123`
   - User Metadata: `{"full_name": "Document Analyst", "role": "document_analyst", "is_authorized": true}`

### **Step 4: Verify the Setup**

1. **Check that users are created:**
   ```sql
   SELECT * FROM public.users;
   ```

2. **Check that sample data exists:**
   ```sql
   SELECT COUNT(*) FROM public.inventory;
   SELECT COUNT(*) FROM public.projects;
   SELECT COUNT(*) FROM public.assets;
   ```

3. **Test authentication in your app:**
   - Start your development server: `npm run dev`
   - Try logging in with the demo credentials
   - Verify all dashboards work

## 🚀 **Alternative: Quick Fix Without Resetting**

If you don't want to reset the database, you can just run the fix migration:

1. **Go to SQL Editor in Supabase**
2. **Run the contents of `supabase/migrations/004_fix_users.sql`**
3. **Create users through the Auth UI as described in Step 3**

## 🧪 **Testing Your Fix**

After applying the fix:

1. **Test local development:**
   ```bash
   npm run dev
   ```

2. **Test login with demo credentials:**
   - Admin: `admin@logistics1.com` / `admin123`
   - Manager: `manager@logistics1.com` / `manager123`
   - Employee: `employee@logistics1.com` / `employee123`

3. **Verify all dashboards load correctly**

## 📝 **Why This Happened**

The original migration tried to insert users with hardcoded UUIDs, but Supabase Auth manages the `auth.users` table automatically. The `public.users` table references `auth.users`, so we need to create users through the proper authentication flow.

## 🎉 **Success!**

Once you've completed these steps:
- ✅ Database schema is properly set up
- ✅ Demo users are created through Supabase Auth
- ✅ Sample data is loaded
- ✅ Authentication works correctly
- ✅ All dashboards are functional

Your LOGISTICS 1 system is now ready for development and deployment!
