#!/usr/bin/env node

/**
 * Database Setup Script for LOGISTICS 1
 * This script helps set up the Supabase database with the correct schema and sample data
 */

const fs = require('fs');
const path = require('path');

console.log('🏥 LOGISTICS 1 - Database Setup Script');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Please create .env.local with your Supabase credentials:');
  console.log('');
  console.log('VITE_SUPABASE_URL=your_supabase_project_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('VITE_APP_TITLE=LOGISTICS 1');
  console.log('VITE_APP_VERSION=1.0.0');
  console.log('VITE_APP_ENVIRONMENT=development');
  console.log('');
  console.log('📖 See SUPABASE_SETUP.md for detailed instructions.');
  process.exit(1);
}

console.log('✅ .env.local file found');
console.log('');

// Display setup instructions
console.log('📋 Database Setup Instructions:');
console.log('');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Run the following migrations in order:');
console.log('');

const migrations = [
  'supabase/migrations/001_initial_schema.sql',
  'supabase/migrations/002_seed_data.sql', 
  'supabase/migrations/003_sample_data.sql'
];

migrations.forEach((migration, index) => {
  const migrationPath = path.join(process.cwd(), migration);
  if (fs.existsSync(migrationPath)) {
    console.log(`   ${index + 1}. ${migration}`);
  } else {
    console.log(`   ${index + 1}. ${migration} (❌ Not found)`);
  }
});

console.log('');
console.log('4. Verify that all tables are created successfully');
console.log('5. Check that sample data is inserted');
console.log('6. Test the application with demo credentials');
console.log('');

// Check if migration files exist
let allMigrationsExist = true;
migrations.forEach(migration => {
  const migrationPath = path.join(process.cwd(), migration);
  if (!fs.existsSync(migrationPath)) {
    allMigrationsExist = false;
  }
});

if (allMigrationsExist) {
  console.log('✅ All migration files found');
} else {
  console.log('❌ Some migration files are missing');
}

console.log('');
console.log('🔐 Demo Credentials:');
console.log('');
console.log('Admin:     admin@logistics1.com     / admin123');
console.log('Manager:   manager@logistics1.com   / manager123');
console.log('Employee:  employee@logistics1.com  / employee123');
console.log('Procurement: procurement@logistics1.com / procurement123');
console.log('Project Manager: project@logistics1.com / project123');
console.log('Maintenance: maintenance@logistics1.com / maintenance123');
console.log('Document Analyst: document@logistics1.com / document123');
console.log('');

console.log('🚀 After setup, run: npm run dev');
console.log('🌐 Open: http://localhost:3000');
console.log('');

console.log('📚 For detailed setup instructions, see SUPABASE_SETUP.md');
console.log('');

// Create a simple verification script
const verificationScript = `
-- Verification queries for LOGISTICS 1 database
-- Run these in Supabase SQL Editor to verify setup

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check user count
SELECT COUNT(*) as user_count FROM public.users;

-- Check inventory count  
SELECT COUNT(*) as inventory_count FROM public.inventory;

-- Check purchase orders count
SELECT COUNT(*) as purchase_orders_count FROM public.purchase_orders;

-- Check projects count
SELECT COUNT(*) as projects_count FROM public.projects;

-- Check assets count
SELECT COUNT(*) as assets_count FROM public.assets;

-- Check documents count
SELECT COUNT(*) as documents_count FROM public.documents;

-- Check system logs count
SELECT COUNT(*) as system_logs_count FROM public.system_logs;
`;

fs.writeFileSync(path.join(process.cwd(), 'supabase/verification.sql'), verificationScript);
console.log('✅ Created verification.sql file');
console.log('');

console.log('🎉 Setup instructions complete!');
console.log('📖 Follow the steps above to set up your database.');
