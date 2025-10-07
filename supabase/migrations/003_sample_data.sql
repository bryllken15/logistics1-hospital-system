-- Sample data for LOGISTICS 1
-- Run this after setting up RLS policies

-- Insert sample users (Note: These are placeholder UUIDs - replace with actual auth user IDs)
INSERT INTO public.users (id, email, full_name, role, is_authorized) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@logistics1.com', 'System Administrator', 'admin', true),
  ('00000000-0000-0000-0000-000000000002', 'manager@logistics1.com', 'Operations Manager', 'manager', true),
  ('00000000-0000-0000-0000-000000000003', 'employee@logistics1.com', 'Warehouse Employee', 'employee', true),
  ('00000000-0000-0000-0000-000000000004', 'procurement@logistics1.com', 'Procurement Specialist', 'procurement', true),
  ('00000000-0000-0000-0000-000000000005', 'project@logistics1.com', 'Project Manager', 'project_manager', true),
  ('00000000-0000-0000-0000-000000000006', 'maintenance@logistics1.com', 'Maintenance Technician', 'maintenance', true),
  ('00000000-0000-0000-0000-000000000007', 'document@logistics1.com', 'Document Analyst', 'document_analyst', true);

-- Insert sample inventory data
INSERT INTO public.inventory (item_name, rfid_code, quantity, status, location) VALUES
  ('Surgical Masks', 'RFID001', 150, 'in_stock', 'A-1-01'),
  ('Disposable Gloves', 'RFID002', 45, 'low_stock', 'A-1-02'),
  ('Antiseptic Solution', 'RFID003', 200, 'in_stock', 'A-2-01'),
  ('Bandages', 'RFID004', 12, 'critical', 'A-2-02'),
  ('Syringes', 'RFID005', 300, 'in_stock', 'B-1-01'),
  ('Thermometers', 'RFID006', 8, 'low_stock', 'B-1-02'),
  ('Blood Pressure Cuffs', 'RFID007', 25, 'in_stock', 'C-1-01'),
  ('Stethoscopes', 'RFID008', 15, 'in_stock', 'C-1-02'),
  ('Surgical Scissors', 'RFID009', 50, 'in_stock', 'D-1-01'),
  ('Surgical Forceps', 'RFID010', 30, 'in_stock', 'D-1-02');

-- Insert sample purchase orders
INSERT INTO public.purchase_orders (supplier, items, amount, status, rfid_code, created_by) VALUES
  ('MedSupply Co.', 15, 45000.00, 'pending', 'RFID001', '00000000-0000-0000-0000-000000000004'),
  ('HealthTech Ltd.', 8, 32500.00, 'approved', 'RFID002', '00000000-0000-0000-0000-000000000004'),
  ('MedEquip Inc.', 12, 78000.00, 'delivered', 'RFID003', '00000000-0000-0000-0000-000000000004'),
  ('PharmaCorp', 6, 23000.00, 'in_transit', 'RFID004', '00000000-0000-0000-0000-000000000004'),
  ('Surgical Solutions', 20, 55000.00, 'pending', 'RFID005', '00000000-0000-0000-0000-000000000004'),
  ('Medical Devices Co.', 10, 42000.00, 'approved', 'RFID006', '00000000-0000-0000-0000-000000000004');

-- Insert sample projects
INSERT INTO public.projects (name, status, progress, start_date, end_date, budget, spent, staff_count) VALUES
  ('Emergency Ward Renovation', 'on_track', 75, '2025-01-01', '2025-03-15', 2500000.00, 1800000.00, 8),
  ('New Equipment Installation', 'delayed', 45, '2025-01-15', '2025-02-28', 1200000.00, 540000.00, 5),
  ('Supply Chain Optimization', 'on_track', 90, '2024-12-01', '2025-01-30', 800000.00, 720000.00, 6),
  ('RFID Implementation', 'in_progress', 30, '2025-01-10', '2025-04-10', 1500000.00, 450000.00, 4),
  ('ICU Modernization', 'on_track', 60, '2025-01-05', '2025-05-15', 3000000.00, 1800000.00, 12),
  ('Laboratory Upgrade', 'in_progress', 25, '2025-01-20', '2025-06-30', 2000000.00, 500000.00, 8);

-- Insert sample assets
INSERT INTO public.assets (name, rfid_code, condition, next_maintenance, location) VALUES
  ('MRI Machine', 'RFID001', 'good', '2025-02-15', 'Radiology'),
  ('Ventilator Unit', 'RFID002', 'needs_repair', '2025-01-20', 'ICU'),
  ('X-Ray Machine', 'RFID003', 'excellent', '2025-03-10', 'Emergency'),
  ('Ultrasound Scanner', 'RFID004', 'good', '2025-02-28', 'Obstetrics'),
  ('CT Scanner', 'RFID005', 'under_repair', '2025-01-25', 'Radiology'),
  ('Dialysis Machine', 'RFID006', 'good', '2025-02-05', 'Nephrology'),
  ('ECG Machine', 'RFID007', 'excellent', '2025-03-20', 'Cardiology'),
  ('Defibrillator', 'RFID008', 'good', '2025-02-10', 'Emergency'),
  ('Patient Monitor', 'RFID009', 'good', '2025-02-25', 'ICU'),
  ('Anesthesia Machine', 'RFID010', 'excellent', '2025-03-05', 'Surgery');

-- Insert sample documents
INSERT INTO public.documents (file_name, file_type, file_size, status, uploaded_by) VALUES
  ('Delivery_Receipt_001.pdf', 'delivery_receipt', 2400000, 'verified', '00000000-0000-0000-0000-000000000003'),
  ('Purchase_Order_045.pdf', 'purchase_order', 1800000, 'pending_verification', '00000000-0000-0000-0000-000000000004'),
  ('Invoice_MedSupply_123.pdf', 'invoice', 3100000, 'verified', '00000000-0000-0000-0000-000000000004'),
  ('Contract_HealthTech_2025.pdf', 'contract', 5200000, 'archived', '00000000-0000-0000-0000-000000000001'),
  ('Delivery_Receipt_002.pdf', 'delivery_receipt', 2100000, 'verified', '00000000-0000-0000-0000-000000000003'),
  ('Purchase_Order_046.pdf', 'purchase_order', 2700000, 'pending_verification', '00000000-0000-0000-0000-000000000004'),
  ('Invoice_PharmaCorp_456.pdf', 'invoice', 2800000, 'verified', '00000000-0000-0000-0000-000000000004'),
  ('Contract_MedEquip_2025.pdf', 'contract', 4800000, 'verified', '00000000-0000-0000-0000-000000000001');

-- Insert sample delivery receipts
INSERT INTO public.delivery_receipts (receipt_number, supplier, amount, items, status) VALUES
  ('DR-2025-001', 'MedSupply Co.', 45000.00, 15, 'verified'),
  ('DR-2025-002', 'HealthTech Ltd.', 32500.00, 8, 'pending_verification'),
  ('DR-2025-003', 'MedEquip Inc.', 78000.00, 12, 'verified'),
  ('DR-2025-004', 'PharmaCorp', 23000.00, 6, 'archived'),
  ('DR-2025-005', 'Surgical Solutions', 55000.00, 20, 'verified'),
  ('DR-2025-006', 'Medical Devices Co.', 42000.00, 10, 'pending_verification'),
  ('DR-2025-007', 'MedSupply Co.', 38000.00, 12, 'verified'),
  ('DR-2025-008', 'HealthTech Ltd.', 29000.00, 6, 'verified');

-- Insert sample maintenance logs
INSERT INTO public.maintenance_logs (asset_id, maintenance_type, technician, cost, status) VALUES
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID001'), 'Scheduled', 'John Smith', 5000.00, 'completed'),
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID002'), 'Emergency', 'Sarah Johnson', 8500.00, 'in_progress'),
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID003'), 'Preventive', 'Mike Davis', 3200.00, 'completed'),
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID004'), 'Scheduled', 'Lisa Wilson', 2800.00, 'completed'),
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID005'), 'Emergency', 'Tom Brown', 12000.00, 'in_progress'),
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID006'), 'Preventive', 'Anna Garcia', 2400.00, 'completed'),
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID007'), 'Scheduled', 'David Lee', 1800.00, 'completed'),
  ((SELECT id FROM public.assets WHERE rfid_code = 'RFID008'), 'Preventive', 'Maria Rodriguez', 1500.00, 'completed');

-- Insert sample system logs
INSERT INTO public.system_logs (action, user_id, details) VALUES
  ('User Login', '00000000-0000-0000-0000-000000000001', 'Admin logged in successfully'),
  ('RFID Scan', '00000000-0000-0000-0000-000000000003', 'Scanned RFID001 - Surgical Masks'),
  ('Purchase Order Created', '00000000-0000-0000-0000-000000000004', 'Created PO for MedSupply Co.'),
  ('Asset Maintenance', '00000000-0000-0000-0000-000000000006', 'Scheduled maintenance for MRI Machine'),
  ('Document Upload', '00000000-0000-0000-0000-000000000007', 'Uploaded delivery receipt DR-2025-001'),
  ('User Login', '00000000-0000-0000-0000-000000000002', 'Manager logged in successfully'),
  ('RFID Scan', '00000000-0000-0000-0000-000000000003', 'Scanned RFID002 - Disposable Gloves'),
  ('Purchase Order Approved', '00000000-0000-0000-0000-000000000002', 'Approved PO for HealthTech Ltd.'),
  ('Project Update', '00000000-0000-0000-0000-000000000005', 'Updated Emergency Ward Renovation progress'),
  ('Asset Repair', '00000000-0000-0000-0000-000000000006', 'Completed repair for Ventilator Unit'),
  ('Document Verification', '00000000-0000-0000-0000-000000000007', 'Verified delivery receipt DR-2025-003'),
  ('User Login', '00000000-0000-0000-0000-000000000003', 'Employee logged in successfully');
