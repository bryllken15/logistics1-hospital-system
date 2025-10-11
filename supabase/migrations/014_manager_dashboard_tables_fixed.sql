-- Manager Dashboard Enhancement Tables - Fixed Version
-- Migration: 014_manager_dashboard_tables_fixed.sql

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS export_logs CASCADE;
DROP TABLE IF EXISTS bulk_operations CASCADE;
DROP TABLE IF EXISTS manager_reports CASCADE;

-- Manager Reports Table
CREATE TABLE manager_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL,
  report_data JSONB NOT NULL,
  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMP DEFAULT NOW(),
  report_period_start DATE,
  report_period_end DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bulk Operations Table
CREATE TABLE bulk_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type VARCHAR(50) NOT NULL,
  target_table VARCHAR(50) NOT NULL,
  affected_ids UUID[],
  affected_count INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  initiated_by UUID REFERENCES users(id),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Export Logs Table
CREATE TABLE export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type VARCHAR(50) NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  exported_by UUID REFERENCES users(id),
  exported_at TIMESTAMP DEFAULT NOW(),
  record_count INTEGER,
  file_size BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2),
  metric_unit VARCHAR(20),
  calculated_for UUID REFERENCES users(id),
  period_start DATE,
  period_end DATE,
  calculated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_manager_reports_generated_by ON manager_reports(generated_by);
CREATE INDEX idx_manager_reports_type ON manager_reports(report_type);
CREATE INDEX idx_bulk_operations_initiated_by ON bulk_operations(initiated_by);
CREATE INDEX idx_bulk_operations_status ON bulk_operations(status);
CREATE INDEX idx_export_logs_exported_by ON export_logs(exported_by);
CREATE INDEX idx_performance_metrics_calculated_for ON performance_metrics(calculated_for);

-- Enable RLS
ALTER TABLE manager_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Managers can view their own reports" ON manager_reports;
DROP POLICY IF EXISTS "Managers can view their own bulk operations" ON bulk_operations;
DROP POLICY IF EXISTS "Managers can view their own export logs" ON export_logs;
DROP POLICY IF EXISTS "Managers can view their own metrics" ON performance_metrics;

-- Manager Reports RLS
CREATE POLICY "Managers can view their own reports" ON manager_reports
  FOR ALL USING (generated_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('manager', 'admin')));

-- Bulk Operations RLS
CREATE POLICY "Managers can view their own bulk operations" ON bulk_operations
  FOR ALL USING (initiated_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('manager', 'admin')));

-- Export Logs RLS
CREATE POLICY "Managers can view their own export logs" ON export_logs
  FOR ALL USING (exported_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('manager', 'admin')));

-- Performance Metrics RLS
CREATE POLICY "Managers can view their own metrics" ON performance_metrics
  FOR ALL USING (calculated_for = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('manager', 'admin')));

-- Grant permissions
GRANT ALL ON manager_reports TO authenticated;
GRANT ALL ON bulk_operations TO authenticated;
GRANT ALL ON export_logs TO authenticated;
GRANT ALL ON performance_metrics TO authenticated;
