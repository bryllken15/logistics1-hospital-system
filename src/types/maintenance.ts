// Maintenance & Asset Management Types
// Smart Supply Chain & Procurement Management System

export interface Asset {
  id: string
  name: string
  rfid_code: string
  condition: AssetCondition
  next_maintenance: string
  location: string
  created_at: string
  updated_at: string
  
  // Enhanced fields
  asset_type?: string
  serial_number?: string
  manufacturer?: string
  model?: string
  purchase_date?: string
  purchase_cost?: number
  warranty_expiry?: string
  depreciation_rate?: number
  current_value?: number
  assigned_to?: string
  department?: string
  criticality: AssetCriticality
  operating_hours: number
  last_service_date?: string
  service_interval_days: number
  status: AssetStatus
  notes?: string
  created_by?: string
  updated_by?: string
}

export interface MaintenanceLog {
  id: string
  asset_id: string
  maintenance_type: string
  technician: string
  cost?: number
  status: MaintenanceStatus
  created_at: string
  
  // Enhanced fields
  scheduled_date?: string
  completed_date?: string
  description?: string
  parts_used: string[]
  labor_hours?: number
  priority: MaintenancePriority
  work_order_number?: string
  assigned_to?: string
  notes?: string
  attachments: string[]
  downtime_hours?: number
  created_by?: string
  updated_by?: string
}

export interface MaintenanceWorkOrder {
  id: string
  work_order_number: string
  asset_id: string
  title: string
  description?: string
  priority: MaintenancePriority
  status: WorkOrderStatus
  assigned_to?: string
  created_by?: string
  scheduled_date?: string
  completed_date?: string
  estimated_cost?: number
  actual_cost?: number
  estimated_hours?: number
  actual_hours?: number
  parts_used: PartsUsed[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface SparePart {
  id: string
  part_name: string
  part_number: string
  category?: string
  quantity: number
  minimum_quantity: number
  unit_cost?: number
  supplier?: string
  location?: string
  compatible_assets: string[]
  last_ordered?: string
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface AssetMaintenanceSchedule {
  id: string
  asset_id: string
  maintenance_type: string
  frequency_days: number
  last_performed?: string
  next_due: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface PartsUsed {
  part_id: string
  part_name: string
  quantity: number
  unit_cost: number
  total_cost: number
}

export type AssetCondition = 
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'needs_repair'
  | 'out_of_service'

export type AssetCriticality = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'

export type AssetStatus = 
  | 'active'
  | 'inactive'
  | 'maintenance'
  | 'retired'
  | 'disposed'

export type MaintenanceStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'overdue'

export type MaintenancePriority = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'

export type WorkOrderStatus = 
  | 'open'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled'

export interface MaintenanceFilter {
  assetType?: string
  status?: MaintenanceStatus
  priority?: MaintenancePriority
  assignedTo?: string
  dateRange?: {
    start: string
    end: string
  }
  criticality?: AssetCriticality
  searchTerm?: string
}

export interface MaintenanceStats {
  totalAssets: number
  assetsNeedingMaintenance: number
  overdueMaintenance: number
  completedThisMonth: number
  totalMaintenanceCost: number
  averageDowntime: number
  byPriority: Record<MaintenancePriority, number>
  byStatus: Record<MaintenanceStatus, number>
  criticalAssets: number
  lowStockParts: number
}

export interface PredictiveMaintenanceAlert {
  asset_id: string
  asset_name: string
  maintenance_type: string
  predicted_failure_date: string
  confidence_level: number
  recommended_actions: string[]
  urgency: 'high' | 'medium' | 'low'
}

export interface AssetAnalytics {
  mtbf: number // Mean Time Between Failures
  mttr: number // Mean Time To Repair
  availability: number
  utilization: number
  totalCost: number
  costPerHour: number
  maintenanceFrequency: number
  failureRate: number
}

export interface QRCodeData {
  asset_id: string
  asset_name: string
  rfid_code: string
  location: string
  last_maintenance: string
  next_maintenance: string
  status: AssetStatus
  criticality: AssetCriticality
}
