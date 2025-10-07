# Supabase Setup Guide for LOGISTICS 1

This guide will help you set up Supabase for the LOGISTICS 1 Hospital Supply Chain & Procurement Management System.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `logistics1-hospital-system`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

### 2. Get Project Credentials

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### 3. Configure Environment Variables

1. Create a `.env.local` file in your project root:
```bash
cp env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_TITLE=LOGISTICS 1
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

### 4. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL script
5. Verify that all tables are created successfully

### 5. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure the following settings:

#### Email Settings
- **Enable email confirmations**: ✅ (for production)
- **Enable email change confirmations**: ✅
- **Enable email change**: ✅

#### URL Configuration
- **Site URL**: `http://localhost:3000` (for development)
- **Redirect URLs**: 
  - `http://localhost:3000/**`
  - `https://your-domain.com/**` (for production)

#### Auth Providers
- **Email**: ✅ Enabled (default)
- **Google**: Optional (for production)
- **GitHub**: Optional (for production)

### 6. Set Up Row Level Security (RLS)

The database schema includes RLS policies, but you may need to verify they're active:

1. Go to **Authentication** → **Policies**
2. Ensure all tables have RLS enabled
3. Review and adjust policies as needed

### 7. Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Open `http://localhost:3000`
3. Try logging in with demo credentials:
   - **Admin**: `admin@logistics1.com` / `admin123`
   - **Manager**: `manager@logistics1.com` / `manager123`
   - **Employee**: `employee@logistics1.com` / `employee123`

## 🔧 Advanced Configuration

### Custom Authentication

If you want to use custom authentication instead of Supabase Auth:

1. Update `src/contexts/AuthContext.tsx` to use your preferred auth method
2. Modify the authentication flow in `src/pages/LoginPage.tsx`
3. Update the user management in your dashboards

### Database Customization

#### Adding New Tables

1. Create the table in Supabase SQL Editor
2. Add the table definition to `src/lib/supabase.ts`
3. Create corresponding service functions in `src/services/database.ts`
4. Update the RLS policies

#### Modifying Existing Tables

1. Use Supabase migrations or SQL Editor
2. Update TypeScript types in `src/lib/supabase.ts`
3. Update service functions as needed

### Production Deployment

#### Environment Variables for Production

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_APP_TITLE=LOGISTICS 1
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
```

#### Security Considerations

1. **Enable RLS**: Ensure Row Level Security is enabled on all tables
2. **Review Policies**: Regularly audit RLS policies
3. **API Keys**: Use service role key only on server-side
4. **Rate Limiting**: Configure appropriate rate limits
5. **Backup**: Set up automated database backups

## 📊 Database Schema Overview

### Core Tables

- **users**: User profiles and roles
- **inventory**: Warehouse inventory items
- **purchase_orders**: Procurement orders
- **projects**: Project management
- **assets**: Equipment and maintenance
- **documents**: File management
- **system_logs**: Activity tracking

### Relationships

- Users can create purchase orders, documents, and system logs
- Assets have maintenance logs
- Projects track logistics and deliveries
- Documents are linked to users and delivery receipts

## 🔍 Troubleshooting

### Common Issues

#### 1. Authentication Errors
- Check if RLS policies are correctly configured
- Verify user roles and permissions
- Ensure email confirmation is set up properly

#### 2. Database Connection Issues
- Verify environment variables are correct
- Check if the Supabase project is active
- Ensure the database schema is properly set up

#### 3. Permission Errors
- Review RLS policies for each table
- Check user authorization status
- Verify role-based access controls

### Debug Mode

Enable debug logging in your application:

```typescript
// In src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    debug: true // Enable debug mode
  }
})
```

## 📈 Monitoring and Analytics

### Supabase Dashboard

1. **Database**: Monitor queries, connections, and performance
2. **Authentication**: Track user signups and logins
3. **Storage**: Monitor file uploads and usage
4. **Logs**: Review application and database logs

### Custom Analytics

The system includes built-in analytics for:
- Inventory levels and trends
- Procurement spending and patterns
- Project progress and timelines
- Asset maintenance schedules
- Document processing workflows

## 🚀 Next Steps

1. **Test all functionality** with different user roles
2. **Customize the schema** for your specific needs
3. **Set up monitoring** and alerting
4. **Plan for scaling** as your hospital grows
5. **Implement backup strategies** for data protection

## 📞 Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [Supabase Community](https://github.com/supabase/supabase/discussions)
3. Contact your system administrator
4. Create an issue in the project repository

---

**LOGISTICS 1** - Powered by Supabase for reliable, scalable hospital logistics management.
