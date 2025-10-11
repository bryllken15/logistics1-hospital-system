-- Complete fix for users table - add all missing columns
-- Run this BEFORE running final-comprehensive-fix.sql

-- Add all missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing users to have default values
UPDATE users SET department = 'General' WHERE department IS NULL;
UPDATE users SET is_active = true WHERE is_active IS NULL;
UPDATE users SET created_at = NOW() WHERE created_at IS NULL;
UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;
