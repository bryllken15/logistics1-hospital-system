# 🚀 LOGISTICS 1 - Deployment Guide

Complete guide for deploying LOGISTICS 1 to GitHub and Vercel with Supabase integration.

## 📋 Prerequisites

- GitHub account
- Vercel account
- Supabase account
- Node.js 18+ installed locally

## 🔧 Step 1: GitHub Setup

### 1.1 Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click "New repository"
3. Fill in repository details:
   - **Repository name**: `logistics1-hospital-system`
   - **Description**: `Smart Hospital Supply Chain & Procurement Management System`
   - **Visibility**: Public (or Private if preferred)
   - **Initialize**: ✅ Add README, ✅ Add .gitignore, ✅ Add license

### 1.2 Clone and Setup Local Repository

```bash
# Clone your repository
git clone https://github.com/yourusername/logistics1-hospital-system.git
cd logistics1-hospital-system

# Copy the project files to this directory
# (Copy all the files we created earlier)

# Initial commit
git add .
git commit -m "Initial commit: LOGISTICS 1 Hospital Management System"
git push origin main
```

### 1.3 Configure Git (if not already done)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🗄️ Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Fill in project details:
   - **Name**: `logistics1-hospital-system`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait for project creation (2-3 minutes)

### 2.2 Get Supabase Credentials

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJ...` (starts with eyJ)

### 2.3 Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the following migrations in order:

```sql
-- Run supabase/migrations/001_initial_schema.sql
-- Run supabase/migrations/002_seed_data.sql  
-- Run supabase/migrations/003_sample_data.sql
```

3. Verify tables are created in **Table Editor**

### 2.4 Configure Authentication

1. Go to **Authentication** → **Settings**
2. Set **Site URL**: `https://your-app.vercel.app`
3. Add **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` (for development)

## 🌐 Step 3: Vercel Setup

### 3.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository:
   - **Import Git Repository**: Select `logistics1-hospital-system`
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2 Configure Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_TITLE=LOGISTICS 1
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
```

### 3.3 Deploy

1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Your app will be available at `https://your-app.vercel.app`

## 🔐 Step 4: Configure GitHub Secrets (Optional - for CI/CD)

### 4.1 Add Repository Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add the following secrets:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id  
VERCEL_PROJECT_ID=your_vercel_project_id
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4.2 Get Vercel Tokens

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create new token: `github-actions`
3. Copy the token value

4. Get Org ID and Project ID:
   - Go to your Vercel project settings
   - Copy the values from the URL or settings

## 🧪 Step 5: Testing Deployment

### 5.1 Test Production Environment

1. Visit your deployed app: `https://your-app.vercel.app`
2. Test login with demo credentials:
   - **Admin**: `admin@logistics1.com` / `admin123`
   - **Manager**: `manager@logistics1.com` / `manager123`
   - **Employee**: `employee@logistics1.com` / `employee123`

### 5.2 Verify Database Connection

1. Login as Admin
2. Check if data is loading correctly
3. Test RFID scanning functionality
4. Verify all dashboards are working

## 🔄 Step 6: Continuous Deployment

### 6.1 Automatic Deployments

With the GitHub Actions workflow, every push to `main` branch will:
- Build the project
- Deploy to Vercel
- Update the production environment

### 6.2 Manual Deployment

```bash
# Make changes to your code
git add .
git commit -m "Update feature X"
git push origin main

# Vercel will automatically deploy
```

## 🛠️ Step 7: Production Configuration

### 7.1 Update Supabase Settings

1. **Authentication**:
   - Update Site URL to your Vercel domain
   - Configure email templates
   - Set up email provider (SendGrid, etc.)

2. **Database**:
   - Enable database backups
   - Set up monitoring
   - Configure connection pooling

3. **Security**:
   - Review RLS policies
   - Set up API rate limiting
   - Configure CORS settings

### 7.2 Environment-Specific Settings

Create different Supabase projects for:
- **Development**: `logistics1-dev`
- **Staging**: `logistics1-staging`  
- **Production**: `logistics1-prod`

## 📊 Step 8: Monitoring and Analytics

### 8.1 Vercel Analytics

1. Enable Vercel Analytics in your project
2. Monitor performance and user behavior
3. Set up alerts for errors

### 8.2 Supabase Monitoring

1. Monitor database performance
2. Track authentication metrics
3. Review system logs

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs in Vercel dashboard
# Verify environment variables are set
# Ensure all dependencies are in package.json
```

#### 2. Database Connection Issues
```bash
# Verify Supabase URL and keys
# Check RLS policies
# Ensure database schema is set up
```

#### 3. Authentication Problems
```bash
# Check Supabase auth settings
# Verify redirect URLs
# Review user permissions
```

### Debug Commands

```bash
# Local development
npm run dev

# Build locally
npm run build

# Preview production build
npm run preview

# Check Supabase connection
npm run db:setup
```

## 🚀 Advanced Features

### Custom Domain

1. Go to Vercel project settings
2. Add custom domain
3. Update Supabase redirect URLs
4. Configure DNS settings

### Database Migrations

```bash
# Create new migration
supabase migration new add_new_feature

# Apply migrations
supabase db push

# Reset database
supabase db reset
```

### Backup Strategy

1. **Database Backups**: Enable in Supabase dashboard
2. **Code Backups**: GitHub provides automatic backups
3. **Environment Variables**: Store in secure password manager

## 📞 Support

If you encounter issues:

1. **Check Vercel Logs**: Project → Functions → Logs
2. **Check Supabase Logs**: Dashboard → Logs
3. **GitHub Issues**: Create issue in repository
4. **Community**: Supabase Discord, Vercel Community

## 🎉 Success Checklist

- [ ] GitHub repository created and connected
- [ ] Supabase project created with schema
- [ ] Vercel project deployed successfully
- [ ] Environment variables configured
- [ ] Authentication working
- [ ] Database connection verified
- [ ] All dashboards functional
- [ ] RFID simulation working
- [ ] Role-based access control working
- [ ] Production environment tested

---

**🎊 Congratulations!** Your LOGISTICS 1 system is now live and ready for hospital operations!

**🌐 Live URL**: `https://your-app.vercel.app`  
**📊 Dashboard**: Vercel Analytics  
**🗄️ Database**: Supabase Dashboard  
**📝 Code**: GitHub Repository
