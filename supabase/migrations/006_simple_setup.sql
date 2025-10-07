-- Simple setup without hardcoded users
-- This approach creates the database structure without pre-inserted users

-- Remove any existing sample data that might cause conflicts
DELETE FROM public.users;
DELETE FROM public.inventory;
DELETE FROM public.purchase_orders;
DELETE FROM public.projects;
DELETE FROM public.assets;
DELETE FROM public.documents;
DELETE FROM public.system_logs;
DELETE FROM public.delivery_receipts;
DELETE FROM public.maintenance_logs;

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_authorized)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')::user_role,
    COALESCE((NEW.raw_user_meta_data->>'is_authorized')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample inventory data (no user dependencies)
INSERT INTO public.inventory (item_name, rfid_code, quantity, status, location) VALUES
  ('Surgical Masks', 'RFID001', 150, 'in_stock', 'A-1-01'),
  ('Disposable Gloves', 'RFID002', 45, 'low_stock', 'A-1-02'),
  ('Antiseptic Solution', 'RFID003', 200, 'in_stock', 'A-2-01'),
  ('Bandages', 'RFID004', 12, 'critical', 'A-2-02'),
  ('Syringes', 'RFID005', 300, 'in_stock', 'B-1-01'),
  ('Thermometers', 'RFID006', 8, 'low_stock', 'B-1-02');

-- Insert sample projects (no user dependencies)
INSERT INTO public.projects (name, status, progress, start_date, end_date, budget, spent, staff_count) VALUES
  ('Emergency Ward Renovation', 'on_track', 75, '2025-01-01', '2025-03-15', 2500000.00, 1800000.00, 8),
  ('New Equipment Installation', 'delayed', 45, '2025-01-15', '2025-02-28', 1200000.00, 540000.00, 5),
  ('Supply Chain Optimization', 'on_track', 90, '2024-12-01', '2025-01-30', 800000.00, 720000.00, 6),
  ('RFID Implementation', 'in_progress', 30, '2025-01-10', '2025-04-10', 1500000.00, 450000.00, 4);

-- Insert sample assets (no user dependencies)
INSERT INTO public.assets (name, rfid_code, condition, next_maintenance, location) VALUES
  ('MRI Machine', 'RFID001', 'good', '2025-02-15', 'Radiology'),
  ('Ventilator Unit', 'RFID002', 'needs_repair', '2025-01-20', 'ICU'),
  ('X-Ray Machine', 'RFID003', 'excellent', '2025-03-10', 'Emergency'),
  ('Ultrasound Scanner', 'RFID004', 'good', '2025-02-28', 'Obstetrics'),
  ('CT Scanner', 'RFID005', 'under_repair', '2025-01-25', 'Radiology'),
  ('Dialysis Machine', 'RFID006', 'good', '2025-02-05', 'Nephrology');

-- Insert sample delivery receipts (no user dependencies)
INSERT INTO public.delivery_receipts (receipt_number, supplier, amount, items, status) VALUES
  ('DR-2025-001', 'MedSupply Co.', 45000.00, 15, 'verified'),
  ('DR-2025-002', 'HealthTech Ltd.', 32500.00, 8, 'pending_verification'),
  ('DR-2025-003', 'MedEquip Inc.', 78000.00, 12, 'verified'),
  ('DR-2025-004', 'PharmaCorp', 23000.00, 6, 'archived');
