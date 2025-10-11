-- Fix users table schema - add missing department column
-- Run this BEFORE running comprehensive-database-fix.sql

-- Add department column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(50);

-- Update existing users to have a default department
UPDATE users SET department = 'General' WHERE department IS NULL;
