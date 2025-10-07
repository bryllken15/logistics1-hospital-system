#!/usr/bin/env node

/**
 * Deployment Setup Script for LOGISTICS 1
 * This script helps set up GitHub and Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 LOGISTICS 1 - Deployment Setup Script');
console.log('=======================================\n');

// Check if we're in a git repository
const gitPath = path.join(process.cwd(), '.git');
if (!fs.existsSync(gitPath)) {
  console.log('❌ Not a Git repository!');
  console.log('📝 Please initialize Git first:');
  console.log('');
  console.log('git init');
  console.log('git add .');
  console.log('git commit -m "Initial commit"');
  console.log('');
  process.exit(1);
}

console.log('✅ Git repository found');
console.log('');

// Check for required files
const requiredFiles = [
  'package.json',
  'vercel.json',
  '.github/workflows/deploy.yml',
  'src/lib/supabase.ts',
  'supabase/schema.sql'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (Missing)`);
    allFilesExist = false;
  }
});

console.log('');

if (!allFilesExist) {
  console.log('❌ Some required files are missing!');
  console.log('📝 Please ensure all project files are in place.');
  process.exit(1);
}

console.log('✅ All required files found');
console.log('');

// Display setup instructions
console.log('📋 Deployment Setup Instructions:');
console.log('');
console.log('1. 🐙 GITHUB SETUP:');
console.log('   a. Create repository on GitHub');
console.log('   b. Add remote origin:');
console.log('      git remote add origin https://github.com/yourusername/logistics1-hospital-system.git');
console.log('   c. Push to GitHub:');
console.log('      git push -u origin main');
console.log('');

console.log('2. 🗄️ SUPABASE SETUP:');
console.log('   a. Create project at supabase.com');
console.log('   b. Run database migrations in SQL Editor:');
console.log('      - supabase/migrations/001_initial_schema.sql');
console.log('      - supabase/migrations/002_seed_data.sql');
console.log('      - supabase/migrations/003_sample_data.sql');
console.log('   c. Copy Project URL and Anon Key');
console.log('');

console.log('3. 🌐 VERCEL SETUP:');
console.log('   a. Go to vercel.com and connect GitHub');
console.log('   b. Import your repository');
console.log('   c. Configure environment variables:');
console.log('      VITE_SUPABASE_URL=https://your-project.supabase.co');
console.log('      VITE_SUPABASE_ANON_KEY=your_anon_key');
console.log('   d. Deploy!');
console.log('');

console.log('4. 🔐 ENVIRONMENT VARIABLES:');
console.log('   Create .env.local for local development:');
console.log('   VITE_SUPABASE_URL=https://your-project.supabase.co');
console.log('   VITE_SUPABASE_ANON_KEY=your_anon_key');
console.log('   VITE_APP_TITLE=LOGISTICS 1');
console.log('   VITE_APP_VERSION=1.0.0');
console.log('   VITE_APP_ENVIRONMENT=development');
console.log('');

console.log('5. 🧪 TESTING:');
console.log('   a. Test locally: npm run dev');
console.log('   b. Test production: Visit your Vercel URL');
console.log('   c. Login with demo credentials');
console.log('');

console.log('📚 For detailed instructions, see DEPLOYMENT_GUIDE.md');
console.log('');

// Create environment template
const envTemplate = `# LOGISTICS 1 Environment Variables
# Copy this to .env.local and update with your values

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration
VITE_APP_TITLE=LOGISTICS 1
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
`;

fs.writeFileSync(path.join(process.cwd(), '.env.template'), envTemplate);
console.log('✅ Created .env.template file');
console.log('');

console.log('🎉 Setup instructions complete!');
console.log('📖 Follow the steps above to deploy your application.');
console.log('');
console.log('🔗 Quick Links:');
console.log('   GitHub: https://github.com');
console.log('   Vercel: https://vercel.com');
console.log('   Supabase: https://supabase.com');
console.log('');
