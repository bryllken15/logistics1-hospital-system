import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
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
