# Database Setup Instructions

## Fixed User Authentication System

The system now uses **username/password authentication** with predefined accounts for each role. The admin can activate/deactivate these accounts.

## Quick Setup (Recommended)

For the easiest setup, use the final migration script:

```sql
-- Run this single script to set up everything
\i supabase/final_migration.sql
```

## Fix Password Hashes (If Authentication Fails)

If you get "Invalid username or password" errors, run the password fix script:

```sql
-- Fix password hashes to match the actual passwords
\i supabase/fix_password_hashes.sql
```

## Test Authentication

To verify authentication is working, run the test script:

```sql
-- Test authentication for all users
\i supabase/test_authentication.sql
```

## Alternative Migration Options

If you encounter issues, try these alternatives:

### Option 1: Step-by-Step Migration
```sql
-- Safer approach that inserts users one by one
\i supabase/step_by_step_migration.sql
```

### Option 2: Complete Migration (If you get foreign key errors)
```sql
-- This temporarily disables constraints to avoid circular dependencies
\i supabase/complete_migration.sql
```

## Manual Setup (Alternative)

If you prefer to run scripts individually, use this order:

### 1. First, run the main schema:
```sql
-- Run this first
\i supabase/schema.sql
```

### 2. Then run the enhanced schema:
```sql
-- Run this second
\i supabase/enhanced_schema.sql
```

### 3. Finally, run the migration:
```sql
-- Run this last
\i supabase/complete_migration.sql
```

## If You Get Column Errors

If you get errors about missing columns (like "column username does not exist"), run the migration script:

```sql
-- This handles existing tables and adds missing columns
\i supabase/complete_migration.sql
```

## Login Credentials

After setup, use these credentials to login:

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Admin | admin | password123 | Full system access |
| Manager | manager1 | password123 | Management functions |
| Employee | employee1 | password123 | Basic warehouse access |
| Procurement Staff | procurement1 | password123 | Procurement management |
| Project Manager | project1 | password123 | Project tracking |
| Maintenance Staff | maintenance1 | password123 | Asset management |
| Document Analyst | document1 | password123 | Document management |

## Admin User Management

The admin can activate/deactivate user accounts through the Admin Dashboard:

1. **Login as admin** (username: `admin`, password: `password123`)
2. **Go to Admin Dashboard** - User Management section
3. **Toggle user status** - Activate/deactivate any user account
4. **Monitor system** - View user statistics and system logs

## Key Features

- **Fixed User System**: Predefined accounts for each role
- **Admin Control**: Admin can activate/deactivate any user account
- **No User Creation**: Users cannot create new accounts
- **Role-Based Access**: Each role has specific dashboard and permissions
- **Secure Authentication**: Username/password with database validation

## Alternative: Manual User Creation

If you continue to have issues with the automated setup, you can manually create users through the Supabase dashboard:

1. Go to Authentication > Users in your Supabase dashboard
2. Create users with these emails:
   - admin@hospital.com
   - manager1@hospital.com
   - employee1@hospital.com
   - procurement1@hospital.com
   - project1@hospital.com
   - maintenance1@hospital.com
   - document1@hospital.com

3. Then run this SQL to update the users table with the correct roles:

```sql
-- Update users with roles after they're created in Supabase Auth
UPDATE public.users SET 
  role = 'admin',
  is_authorized = true
WHERE email = 'admin@hospital.com';

UPDATE public.users SET 
  role = 'manager',
  is_authorized = true
WHERE email = 'manager1@hospital.com';

UPDATE public.users SET 
  role = 'employee',
  is_authorized = true
WHERE email = 'employee1@hospital.com';

UPDATE public.users SET 
  role = 'procurement',
  is_authorized = true
WHERE email = 'procurement1@hospital.com';

UPDATE public.users SET 
  role = 'project_manager',
  is_authorized = true
WHERE email = 'project1@hospital.com';

UPDATE public.users SET 
  role = 'maintenance',
  is_authorized = true
WHERE email = 'maintenance1@hospital.com';

UPDATE public.users SET 
  role = 'document_analyst',
  is_authorized = true
WHERE email = 'document1@hospital.com';
```

## Troubleshooting

If you still get foreign key constraint errors:

1. **Check existing data**: Make sure there are no existing records that reference the users you're trying to create
2. **Clear existing data**: You may need to clear related tables first
3. **Use the simple setup**: Use `setup_users_simple.sql` instead of `setup_users.sql`

## Testing the Setup

After running the setup, you can test with these queries:

```sql
-- Check if users were created
SELECT * FROM public.users;

-- Check user statistics
SELECT role, COUNT(*) as count FROM public.users GROUP BY role;

-- Test the helper functions
SELECT * FROM get_user_by_role('admin');
```
