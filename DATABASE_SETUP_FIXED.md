# Database Setup Guide - Fixed Foreign Key Issues

## Problem Solved ✅

The foreign key constraint error has been fixed in `CREATE_APPROVAL_SYSTEM.sql`. The script now uses dynamic user lookups instead of hardcoded user IDs.

## Setup Instructions

### Step 1: Run Base Migration First
**IMPORTANT:** You must run the base migration first to create the users table.

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the content from `supabase/clean_migration.sql`
4. Click "Run" to execute the script
5. Wait for it to complete successfully

This script will:
- Create all base tables including `users`
- Insert sample users with different roles
- Set up proper permissions and RLS policies

### Step 2: Verify Users Exist
Before running the approval system, verify that users exist:

```bash
node verify-users-before-approval.js
```

This script will:
- Check if the users table exists
- Verify required roles are present (admin, manager, employee)
- Confirm users are properly set up

### Step 3: Run Approval System
After verifying users exist:

1. Go to Supabase SQL Editor
2. Copy and paste the content from `CREATE_APPROVAL_SYSTEM.sql` (updated version)
3. Click "Run" to execute the script
4. Wait for it to complete successfully

## What Was Fixed

### Before (Causing Error)
```sql
-- This would fail if the user doesn't exist
INSERT INTO public.approval_workflows (workflow_name, workflow_type, approver_roles, created_by) VALUES
('Purchase Request Approval', 'purchase_request', ARRAY['manager', 'admin'], '11111111-1111-1111-1111-111111111111');
```

### After (Fixed)
```sql
-- This dynamically finds an existing admin user
INSERT INTO public.approval_workflows (workflow_name, workflow_type, approver_roles, created_by) VALUES
('Purchase Request Approval', 'purchase_request', ARRAY['manager', 'admin'], (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1));
```

## Files Updated

- ✅ `CREATE_APPROVAL_SYSTEM.sql` - Fixed foreign key constraints
- ✅ `verify-users-before-approval.js` - New verification script
- ✅ `DATABASE_SETUP_FIXED.md` - This guide

## Testing After Setup

### 1. Automated Testing
```bash
node test-all-dashboards.js
```

### 2. Frontend Testing
1. Start your application: `npm run dev`
2. Open `test-dashboard-frontend.html` in your browser
3. Follow the testing procedures for each role

### 3. Manual Verification
1. Login as different users (admin, manager, employee, etc.)
2. Verify dashboards load without "notifications.filter is not a function" errors
3. Test real-time notifications between users
4. Confirm all role-based functionality works

## Expected Users After Setup

After running `supabase/clean_migration.sql`, you should have these users:

| Username | Role | Password | Authorized |
|----------|------|----------|------------|
| admin | admin | admin123 | ✅ |
| manager | manager | manager123 | ✅ |
| employee | employee | employee123 | ✅ |
| procurement | procurement | procurement123 | ✅ |
| project_manager | project_manager | pm123 | ✅ |
| maintenance | maintenance | maintenance123 | ✅ |
| document_analyst | document_analyst | analyst123 | ✅ |

## Troubleshooting

### Error: "users table doesn't exist"
**Solution:** Run `supabase/clean_migration.sql` first

### Error: "No users found"
**Solution:** The migration didn't complete properly. Re-run `supabase/clean_migration.sql`

### Error: "Missing required roles"
**Solution:** The migration didn't create all users. Check the migration script output for errors

### Error: "Foreign key constraint violation"
**Solution:** This should be fixed now. If it still occurs, run the verification script first

## Success Indicators

After successful setup, you should see:

1. ✅ All 7 users created with proper roles
2. ✅ Notifications table accessible
3. ✅ Approval system tables created
4. ✅ All dashboards load without errors
5. ✅ Real-time notifications working
6. ✅ Cross-user functionality working

## Next Steps

Once the database is set up correctly:

1. Test all role-based dashboards
2. Verify real-time functionality
3. Test cross-user notifications
4. Confirm no "filter is not a function" errors

The notification system should now work perfectly across all dashboards! 🎉
