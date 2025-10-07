-- Initial schema migration for LOGISTICS 1
-- Run this after setting up your Supabase project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM (
  'admin',
  'manager', 
  'employee',
  'procurement',
  'project_manager',
  'maintenance',
  'document_analyst'
);

CREATE TYPE inventory_status AS ENUM (
  'in_stock',
  'low_stock',
  'critical',
  'out_of_stock'
);

CREATE TYPE order_status AS ENUM (
  'pending',
  'approved',
  'in_transit',
  'delivered'
);

CREATE TYPE project_status AS ENUM (
  'on_track',
  'delayed',
  'in_progress',
  'completed'
);

CREATE TYPE asset_condition AS ENUM (
  'excellent',
  'good',
  'needs_repair',
  'under_repair'
);

CREATE TYPE document_type AS ENUM (
  'delivery_receipt',
  'purchase_order',
  'invoice',
  'contract'
);

CREATE TYPE document_status AS ENUM (
  'pending_verification',
  'verified',
  'archived'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  is_authorized BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table (Smart Warehousing System)
CREATE TABLE public.inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_name TEXT NOT NULL,
  rfid_code TEXT UNIQUE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  status inventory_status NOT NULL DEFAULT 'in_stock',
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders table (Procurement & Sourcing Management)
CREATE TABLE public.purchase_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  supplier TEXT NOT NULL,
  items INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  rfid_code TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (Project Logistics Tracker)
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'in_progress',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(12,2) NOT NULL,
  spent DECIMAL(12,2) DEFAULT 0,
  staff_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table (Asset Lifecycle & Maintenance)
CREATE TABLE public.assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  rfid_code TEXT UNIQUE NOT NULL,
  condition asset_condition NOT NULL DEFAULT 'good',
  next_maintenance DATE NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table (Document Tracking & Records)
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type document_type NOT NULL,
  file_size BIGINT NOT NULL,
  status document_status NOT NULL DEFAULT 'pending_verification',
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Logs table
CREATE TABLE public.system_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Receipts table
CREATE TABLE public.delivery_receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  supplier TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  items INTEGER NOT NULL,
  status document_status NOT NULL DEFAULT 'pending_verification',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Logs table
CREATE TABLE public.maintenance_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  technician TEXT NOT NULL,
  cost DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
