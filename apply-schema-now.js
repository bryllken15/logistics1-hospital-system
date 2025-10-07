#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚨 URGENT: Apply Database Schema to Fix "toLocaleString" Error');
console.log('================================================================\n');

// Read the fixed migration schema
const schemaPath = path.join(__dirname, 'supabase', 'fixed_migration.sql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

console.log('📋 COPY THIS ENTIRE SCRIPT TO SUPABASE SQL EDITOR:');
console.log('==================================================');
console.log(schemaContent);
console.log('==================================================\n');

// Read the final fix script
const fixPath = path.join(__dirname, 'supabase', 'final_fix.sql');
const fixContent = fs.readFileSync(fixPath, 'utf8');

console.log('🔧 THEN COPY THIS PERMISSION FIX SCRIPT:');
console.log('=======================================');
console.log(fixContent);
console.log('=======================================\n');

console.log('📝 EXACT STEPS TO FIX THE ERROR:');
console.log('1. Open: https://supabase.com/dashboard');
console.log('2. Select your project: otjdtdnuowhlqriidgfg');
console.log('3. Click "SQL Editor" in the left sidebar');
console.log('4. Copy the FIRST script above (the long one)');
console.log('5. Paste it into the SQL Editor');
console.log('6. Click "Run" button');
console.log('7. Copy the SECOND script above (permission fix)');
console.log('8. Paste it into the SQL Editor');
console.log('9. Click "Run" button');
console.log('10. Go back to your app: http://localhost:5173');
console.log('11. Login with: admin / admin123');
console.log('\n✅ After these steps, the "toLocaleString" error will be FIXED!');
console.log('✅ All dashboards will load with data!');
console.log('✅ Purchase orders and requests will appear in tables!');
console.log('\n🚨 CRITICAL: You MUST run both scripts in Supabase for the app to work!');
