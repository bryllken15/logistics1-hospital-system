import { createClient } from '@supabase/supabase-js'

// Use hardcoded values to avoid environment variable issues
const supabaseUrl = 'https://otjdtdnuowhlqriidgfg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90amR0ZG51b3dobHFyaWlkZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDc5MjQsImV4cCI6MjA3NTM4MzkyNH0.XMR9R2JTuVRW-3L8BXh0ksj-kbNSRCYHIT_DM1PrQFg'

// Create Supabase client with real database connection
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3001',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
  db: {
    schema: 'public'
  }
})


// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'manager' | 'employee' | 'procurement' | 'project_manager' | 'maintenance' | 'document_analyst'
          is_authorized: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'manager' | 'employee' | 'procurement' | 'project_manager' | 'maintenance' | 'document_analyst'
          is_authorized?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'manager' | 'employee' | 'procurement' | 'project_manager' | 'maintenance' | 'document_analyst'
          is_authorized?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          item_name: string
          rfid_code: string
          quantity: number
          status: 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock'
          location: string
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_name: string
          rfid_code: string
          quantity: number
          status: 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock'
          location: string
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_name?: string
          rfid_code?: string
          quantity?: number
          status?: 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock'
          location?: string
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      purchase_orders: {
        Row: {
          id: string
          supplier: string
          items: number
          amount: number
          status: 'pending' | 'approved' | 'in_transit' | 'delivered'
          rfid_code: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier: string
          items: number
          amount: number
          status?: 'pending' | 'approved' | 'in_transit' | 'delivered'
          rfid_code: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier?: string
          items?: number
          amount?: number
          status?: 'pending' | 'approved' | 'in_transit' | 'delivered'
          rfid_code?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          status: 'on_track' | 'delayed' | 'in_progress' | 'completed'
          progress: number
          start_date: string
          end_date: string
          budget: number
          spent: number
          staff_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: 'on_track' | 'delayed' | 'in_progress' | 'completed'
          progress?: number
          start_date: string
          end_date: string
          budget: number
          spent?: number
          staff_count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'on_track' | 'delayed' | 'in_progress' | 'completed'
          progress?: number
          start_date?: string
          end_date?: string
          budget?: number
          spent?: number
          staff_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      project_deliveries: {
        Row: {
          id: string
          project_id: string
          item_name: string
          quantity_delivered: number
          supplier_name: string
          delivery_date: string
          destination: string | null
          status: string
          notes: string | null
          tracking_number: string | null
          received_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          item_name: string
          quantity_delivered: number
          supplier_name: string
          delivery_date: string
          destination?: string | null
          status?: string
          notes?: string | null
          tracking_number?: string | null
          received_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          item_name?: string
          quantity_delivered?: number
          supplier_name?: string
          delivery_date?: string
          destination?: string | null
          status?: string
          notes?: string | null
          tracking_number?: string | null
          received_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      staff_performance: {
        Row: {
          id: string
          user_id: string
          project_id: string
          tasks_completed: number
          tasks_pending: number
          efficiency_score: number | null
          last_activity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          tasks_completed?: number
          tasks_pending?: number
          efficiency_score?: number | null
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          tasks_completed?: number
          tasks_pending?: number
          efficiency_score?: number | null
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_manager_reports: {
        Row: {
          id: string
          report_type: string
          report_data: any
          generated_by: string | null
          generated_at: string
          report_period_start: string | null
          report_period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_type: string
          report_data: any
          generated_by?: string | null
          generated_at?: string
          report_period_start?: string | null
          report_period_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_type?: string
          report_data?: any
          generated_by?: string | null
          generated_at?: string
          report_period_start?: string | null
          report_period_end?: string | null
          created_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          name: string
          rfid_code: string
          condition: 'excellent' | 'good' | 'needs_repair' | 'under_repair'
          next_maintenance: string
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          rfid_code: string
          condition: 'excellent' | 'good' | 'needs_repair' | 'under_repair'
          next_maintenance: string
          location: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          rfid_code?: string
          condition?: 'excellent' | 'good' | 'needs_repair' | 'under_repair'
          next_maintenance?: string
          location?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          file_name: string
          file_type: 'delivery_receipt' | 'purchase_order' | 'invoice' | 'contract'
          file_size: number
          status: 'pending_verification' | 'verified' | 'archived'
          uploaded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_type: 'delivery_receipt' | 'purchase_order' | 'invoice' | 'contract'
          file_size: number
          status?: 'pending_verification' | 'verified' | 'archived'
          uploaded_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_type?: 'delivery_receipt' | 'purchase_order' | 'invoice' | 'contract'
          file_size?: number
          status?: 'pending_verification' | 'verified' | 'archived'
          uploaded_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      system_logs: {
        Row: {
          id: string
          action: string
          user_id: string
          details: string
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          user_id: string
          details: string
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          user_id?: string
          details?: string
          created_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact: string
          email: string
          phone?: string
          address?: string
          rating: number
          status: 'active' | 'inactive' | 'suspended'
          notes?: string
          created_by?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact: string
          email: string
          phone?: string
          address?: string
          rating?: number
          status?: 'active' | 'inactive' | 'suspended'
          notes?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact?: string
          email?: string
          phone?: string
          address?: string
          rating?: number
          status?: 'active' | 'inactive' | 'suspended'
          notes?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_logs: {
        Row: {
          id: string
          asset_id: string
          maintenance_type: string
          technician: string
          cost: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          maintenance_type: string
          technician: string
          cost?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          maintenance_type?: string
          technician?: string
          cost?: number
          status?: string
          created_at?: string
        }
      }
      delivery_receipts: {
        Row: {
          id: string
          receipt_number: string
          supplier: string
          amount: number
          items: number
          status: 'pending_verification' | 'verified' | 'archived'
          destination: string | null
          delivered_by: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          receipt_number: string
          supplier: string
          amount: number
          items: number
          status?: 'pending_verification' | 'verified' | 'archived'
          destination?: string | null
          delivered_by?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          receipt_number?: string
          supplier?: string
          amount?: number
          items?: number
          status?: 'pending_verification' | 'verified' | 'archived'
          destination?: string | null
          delivered_by?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
