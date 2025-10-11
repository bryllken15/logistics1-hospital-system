// Document Management Types
// Smart Supply Chain & Procurement Management System

export interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: number
  status: 'pending_verification' | 'verified' | 'archived' | 'rejected'
  uploaded_by: string
  created_at: string
  updated_at: string
  
  // Enhanced fields
  description?: string
  category: DocumentCategory
  tags: string[]
  expiration_date?: string
  version: number
  parent_document_id?: string
  approved_by?: string
  approved_at?: string
  related_entity_type?: RelatedEntityType
  related_entity_id?: string
  updated_by?: string
  file_url?: string
  file_hash?: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  file_url?: string
  file_hash?: string
  uploaded_by?: string
  change_notes?: string
  created_at: string
}

export interface DocumentApproval {
  id: string
  document_id: string
  approver_id?: string
  approval_level: number
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
  approved_at?: string
  created_at: string
}

export type DocumentCategory = 
  | 'contracts'
  | 'invoices'
  | 'receipts'
  | 'certificates'
  | 'warranties'
  | 'compliance'
  | 'quality_control'
  | 'shipping'
  | 'insurance'
  | 'maintenance_manuals'
  | 'reports'
  | 'general'

export type RelatedEntityType = 
  | 'project'
  | 'purchase_order'
  | 'asset'
  | 'inventory_item'
  | 'maintenance_work_order'
  | 'supplier'
  | 'employee'

export interface DocumentFilter {
  category?: DocumentCategory
  status?: string
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  relatedEntity?: {
    type: RelatedEntityType
    id: string
  }
  expiringSoon?: boolean
  searchTerm?: string
}

export interface DocumentStats {
  total: number
  pending: number
  verified: number
  archived: number
  expiringSoon: number
  byCategory: Record<DocumentCategory, number>
  recentUploads: number
  averageFileSize: number
}

export interface DocumentUpload {
  file: File
  category: DocumentCategory
  description?: string
  tags: string[]
  expirationDate?: string
  relatedEntityType?: RelatedEntityType
  relatedEntityId?: string
}

export interface DocumentPreview {
  id: string
  file_name: string
  file_type: string
  file_url: string
  thumbnail_url?: string
  canPreview: boolean
  previewType: 'pdf' | 'image' | 'text' | 'unsupported'
}
