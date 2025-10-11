# 🔑 Supabase Credentials Setup Guide

## Quick Setup (Recommended)

### Step 1: Get Your Supabase Credentials

1. **Go to your Supabase project dashboard**
2. **Click on "Settings" → "API"**
3. **Copy the "Project URL"** (this is your `VITE_SUPABASE_URL`)
4. **Copy the "anon public" key"** (this is your `VITE_SUPABASE_ANON_KEY`)

### Step 2: Create .env File

1. **Copy the template file:**
   ```bash
   copy env.example .env
   ```

2. **Edit the .env file** and replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

## Alternative: Environment Variables (Windows)

If you prefer to set environment variables instead of using a .env file:

### PowerShell
```powershell
$env:VITE_SUPABASE_URL="https://your-project-id.supabase.co"
$env:VITE_SUPABASE_ANON_KEY="your-anon-key-here"
```

### Command Prompt
```cmd
set VITE_SUPABASE_URL=https://your-project-id.supabase.co
set VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Verify Your Setup

### Test Without Credentials (Manual Verification)
```bash
node test-database-setup-verification.js
```

### Test With Credentials (After Setup)
```bash
# Test all dashboards
node test-all-dashboards-comprehensive.js

# Test manager workflow
node test-manager-workflow.js

# Test real-time updates
node test-realtime-cross-user.js
```

## Troubleshooting

### ❌ "Invalid supabaseUrl" Error
**Solution:** Make sure your `VITE_SUPABASE_URL` starts with `https://` and ends with `.supabase.co`

### ❌ "Invalid supabaseKey" Error
**Solution:** Make sure your `VITE_SUPABASE_ANON_KEY` is the correct anon key from your Supabase project

### ❌ "Credentials not configured" Error
**Solution:** 
1. Check that your .env file exists in the project root
2. Verify the variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Make sure there are no extra spaces or quotes around the values

### ❌ Environment Variables Not Working
**Solution:**
1. Restart your terminal/command prompt after setting variables
2. Make sure you're in the correct directory
3. Try using the .env file method instead

## Example .env File

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.example-signature
```

## Next Steps

Once your credentials are set up:

1. **Run the database setup:** Execute `COMPLETE_DATABASE_SETUP.sql` in Supabase
2. **Test the system:** Run the test scripts to verify everything works
3. **Start your application:** Your Hospital Logistics System is ready to use!

## Support

If you're still having issues:
1. Check the browser console for any JavaScript errors
2. Verify your Supabase project is active and accessible
3. Review the `QUICK_START_GUIDE.md` for complete setup instructions
4. Check the `VERIFICATION_CHECKLIST.md` for systematic testing steps
