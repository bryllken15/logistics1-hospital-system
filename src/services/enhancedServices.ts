// Enhanced Database Services
// Smart Supply Chain & Procurement Management System

import { supabase } from '../lib/supabase'
import type { 
  Document, 
  DocumentVersion, 
  DocumentApproval, 
  DocumentFilter, 
  DocumentStats,
  DocumentUpload,
  DocumentPreview
} from '../types/documents'
import type { 
  Asset, 
  MaintenanceLog, 
  MaintenanceWorkOrder, 
  SparePart, 
  AssetMaintenanceSchedule,
  MaintenanceFilter,
  MaintenanceStats,
  PredictiveMaintenanceAlert,
  AssetAnalytics,
  QRCodeData
} from '../types/maintenance'

// =============================================
// ENHANCED DOCUMENT SERVICES
// =============================================

export const enhancedDocumentService = {
  // Get all documents with enhanced filtering
  async getAll(filters?: DocumentFilter) {
    let query = supabase
      .from('documents')
      .select(`
        *,
        users:uploaded_by(full_name, email),
        approver:approved_by(full_name, email),
        updater:updated_by(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end)
      }
      if (filters.relatedEntity) {
        query = query
          .eq('related_entity_type', filters.relatedEntity.type)
          .eq('related_entity_id', filters.relatedEntity.id)
      }
      if (filters.expiringSoon) {
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        query = query
          .not('expiration_date', 'is', null)
          .lte('expiration_date', thirtyDaysFromNow.toISOString().split('T')[0])
      }
      if (filters.searchTerm) {
        query = query.or(`file_name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`)
      }
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get document statistics
  async getStats(): Promise<DocumentStats> {
    const { data: documents, error } = await supabase
      .from('documents')
      .select('status, category, file_size, expiration_date, created_at')

    if (error) throw error

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const stats: DocumentStats = {
      total: documents.length,
      pending: documents.filter(d => d.status === 'pending_verification').length,
      verified: documents.filter(d => d.status === 'verified').length,
      archived: documents.filter(d => d.status === 'archived').length,
      expiringSoon: documents.filter(d => 
        d.expiration_date && 
        new Date(d.expiration_date) <= thirtyDaysFromNow
      ).length,
      byCategory: {} as Record<string, number>,
      recentUploads: documents.filter(d => 
        new Date(d.created_at) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      averageFileSize: documents.reduce((sum, d) => sum + (d.file_size || 0), 0) / documents.length || 0
    }

    // Calculate by category
    documents.forEach(doc => {
      const category = doc.category || 'general'
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
    })

    return stats
  },

  // Upload document with enhanced metadata
  async upload(uploadData: DocumentUpload, userId: string) {
    const documentData = {
      file_name: uploadData.file.name,
      file_type: uploadData.file.type,
      file_size: uploadData.file.size,
      category: uploadData.category,
      description: uploadData.description,
      tags: uploadData.tags,
      expiration_date: uploadData.expirationDate,
      related_entity_type: uploadData.relatedEntityType,
      related_entity_id: uploadData.relatedEntityId,
      uploaded_by: userId,
      updated_by: userId,
      status: 'pending_verification' as const,
      version: 1
    }

    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single()

    if (error) throw error

    // Create initial version record
    await supabase
      .from('document_versions')
      .insert({
        document_id: data.id,
        version_number: 1,
        uploaded_by: userId
      })

    return data
  },

  // Update document
  async update(id: string, updates: Partial<Document>, userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Verify document
  async verify(id: string, userId: string, notes?: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        status: 'verified',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Create approval record
    await supabase
      .from('document_approvals')
      .insert({
        document_id: id,
        approver_id: userId,
        status: 'approved',
        comments: notes
      })

    return data
  },

  // Archive document
  async archive(id: string, userId: string) {
    return this.update(id, { status: 'archived' }, userId)
  },

  // Get document versions
  async getVersions(documentId: string) {
    const { data, error } = await supabase
      .from('document_versions')
      .select(`
        *,
        users:uploaded_by(full_name, email)
      `)
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })

    if (error) throw error
    return data
  },

  // Create new version
  async createVersion(documentId: string, file: File, userId: string, changeNotes?: string) {
    // Get current version
    const { data: currentDoc } = await supabase
      .from('documents')
      .select('version')
      .eq('id', documentId)
      .single()

    const newVersion = (currentDoc?.version || 0) + 1

    // Create version record
    const { data: versionData, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: newVersion,
        uploaded_by: userId,
        change_notes: changeNotes
      })
      .select()
      .single()

    if (versionError) throw versionError

    // Update document version
    await supabase
      .from('documents')
      .update({
        version: newVersion,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)

    return versionData
  },

  // Get document preview info
  async getPreview(id: string): Promise<DocumentPreview> {
    const { data, error } = await supabase
      .from('documents')
      .select('id, file_name, file_type, file_url')
      .eq('id', id)
      .single()

    if (error) throw error

    const canPreview = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain'].includes(data.file_type)
    const previewType = data.file_type.startsWith('image/') ? 'image' as const :
                       data.file_type === 'application/pdf' ? 'pdf' as const :
                       data.file_type.startsWith('text/') ? 'text' as const :
                       'unsupported' as const

    return {
      id: data.id,
      file_name: data.file_name,
      file_type: data.file_type,
      file_url: data.file_url || '',
      canPreview,
      previewType
    }
  },

  // Delete document
  async delete(id: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// =============================================
// ENHANCED ASSET SERVICES
// =============================================

export const enhancedAssetService = {
  // Get all assets with enhanced filtering
  async getAll(filters?: MaintenanceFilter) {
    let query = supabase
      .from('assets')
      .select(`
        *,
        assigned_user:assigned_to(full_name, email),
        creator:created_by(full_name, email),
        updater:updated_by(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.assetType) {
        query = query.eq('asset_type', filters.assetType)
      }
      if (filters.criticality) {
        query = query.eq('criticality', filters.criticality)
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }
      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,serial_number.ilike.%${filters.searchTerm}%,manufacturer.ilike.%${filters.searchTerm}%`)
      }
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get asset analytics
  async getAnalytics(assetId: string): Promise<AssetAnalytics> {
    const { data: maintenanceLogs, error } = await supabase
      .from('maintenance_logs')
      .select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate MTBF (Mean Time Between Failures)
    const failures = maintenanceLogs.filter(log => log.maintenance_type === 'repair')
    let mtbf = 0
    if (failures.length > 1) {
      const timeBetweenFailures = failures.slice(1).map((failure, index) => {
        const prevFailure = failures[index]
        return new Date(failure.created_at).getTime() - new Date(prevFailure.created_at).getTime()
      })
      mtbf = timeBetweenFailures.reduce((sum, time) => sum + time, 0) / timeBetweenFailures.length / (1000 * 60 * 60 * 24) // days
    }

    // Calculate MTTR (Mean Time To Repair)
    const completedRepairs = maintenanceLogs.filter(log => 
      log.maintenance_type === 'repair' && 
      log.status === 'completed' && 
      log.labor_hours
    )
    const mttr = completedRepairs.length > 0 
      ? completedRepairs.reduce((sum, log) => sum + (log.labor_hours || 0), 0) / completedRepairs.length
      : 0

    // Calculate availability
    const totalDowntime = maintenanceLogs.reduce((sum, log) => sum + (log.downtime_hours || 0), 0)
    const totalHours = 24 * 365 // Assuming 1 year
    const availability = ((totalHours - totalDowntime) / totalHours) * 100

    // Calculate total cost
    const totalCost = maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0)

    return {
      mtbf,
      mttr,
      availability: Math.max(0, Math.min(100, availability)),
      utilization: 85, // Placeholder - would need actual usage data
      totalCost,
      costPerHour: totalCost / Math.max(1, totalHours),
      maintenanceFrequency: maintenanceLogs.length,
      failureRate: failures.length / Math.max(1, maintenanceLogs.length) * 100
    }
  },

  // Get predictive maintenance alerts
  async getPredictiveAlerts(): Promise<PredictiveMaintenanceAlert[]> {
    const { data: assets, error } = await supabase
      .from('assets')
      .select(`
        id,
        name,
        asset_type,
        last_service_date,
        service_interval_days,
        operating_hours,
        criticality
      `)
      .eq('status', 'active')

    if (error) throw error

    const alerts: PredictiveMaintenanceAlert[] = []

    for (const asset of assets) {
      if (asset.service_interval_days && asset.last_service_date) {
        const lastService = new Date(asset.last_service_date)
        const nextDue = new Date(lastService.getTime() + asset.service_interval_days * 24 * 60 * 60 * 1000)
        const daysUntilDue = Math.ceil((nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

        if (daysUntilDue <= 30) { // Alert if due within 30 days
          alerts.push({
            asset_id: asset.id,
            asset_name: asset.name,
            maintenance_type: 'scheduled',
            predicted_failure_date: nextDue.toISOString().split('T')[0],
            confidence_level: Math.max(0.7, 1 - (daysUntilDue / 30)),
            recommended_actions: [
              'Schedule maintenance',
              'Check spare parts availability',
              'Notify assigned technician'
            ],
            urgency: daysUntilDue <= 7 ? 'high' : daysUntilDue <= 14 ? 'medium' : 'low'
          })
        }
      }
    }

    return alerts
  },

  // Generate QR code data
  async getQRCodeData(assetId: string): Promise<QRCodeData> {
    const { data, error } = await supabase
      .from('assets')
      .select(`
        id,
        name,
        rfid_code,
        location,
        last_service_date,
        next_maintenance,
        status,
        criticality
      `)
      .eq('id', assetId)
      .single()

    if (error) throw error

    return {
      asset_id: data.id,
      asset_name: data.name,
      rfid_code: data.rfid_code,
      location: data.location,
      last_maintenance: data.last_service_date || 'Never',
      next_maintenance: data.next_maintenance,
      status: data.status,
      criticality: data.criticality
    }
  },

  // Update asset
  async update(id: string, updates: Partial<Asset>, userId: string) {
    const { data, error } = await supabase
      .from('assets')
      .update({
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// =============================================
// ENHANCED MAINTENANCE SERVICES
// =============================================

export const enhancedMaintenanceService = {
  // Get all maintenance logs with enhanced filtering
  async getAll(filters?: MaintenanceFilter) {
    let query = supabase
      .from('maintenance_logs')
      .select(`
        *,
        assets:asset_id(name, rfid_code, asset_type),
        assigned_user:assigned_to(full_name, email),
        creator:created_by(full_name, email),
        updater:updated_by(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }
      if (filters.dateRange) {
        query = query
          .gte('scheduled_date', filters.dateRange.start)
          .lte('scheduled_date', filters.dateRange.end)
      }
      if (filters.searchTerm) {
        query = query.or(`description.ilike.%${filters.searchTerm}%,work_order_number.ilike.%${filters.searchTerm}%`)
      }
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get maintenance statistics
  async getStats(): Promise<MaintenanceStats> {
    const { data: logs, error: logsError } = await supabase
      .from('maintenance_logs')
      .select('status, priority, cost, downtime_hours, created_at')

    if (logsError) throw logsError

    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, criticality, next_maintenance')

    if (assetsError) throw assetsError

    const { data: parts, error: partsError } = await supabase
      .from('spare_parts')
      .select('quantity, minimum_quantity')

    if (partsError) throw partsError

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats: MaintenanceStats = {
      totalAssets: assets.length,
      assetsNeedingMaintenance: assets.filter(a => 
        a.next_maintenance && new Date(a.next_maintenance) <= now
      ).length,
      overdueMaintenance: assets.filter(a => 
        a.next_maintenance && new Date(a.next_maintenance) < now
      ).length,
      completedThisMonth: logs.filter(l => 
        l.status === 'completed' && 
        new Date(l.created_at) >= thisMonth
      ).length,
      totalMaintenanceCost: logs.reduce((sum, l) => sum + (l.cost || 0), 0),
      averageDowntime: logs.length > 0 
        ? logs.reduce((sum, l) => sum + (l.downtime_hours || 0), 0) / logs.length 
        : 0,
      byPriority: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      criticalAssets: assets.filter(a => a.criticality === 'critical').length,
      lowStockParts: parts.filter(p => p.quantity <= p.minimum_quantity).length
    }

    // Calculate by priority and status
    logs.forEach(log => {
      stats.byPriority[log.priority] = (stats.byPriority[log.priority] || 0) + 1
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1
    })

    return stats
  },

  // Create maintenance work order
  async createWorkOrder(workOrder: Omit<MaintenanceWorkOrder, 'id' | 'created_at' | 'updated_at'>, userId: string) {
    const { data, error } = await supabase
      .from('maintenance_work_orders')
      .insert({
        ...workOrder,
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update work order
  async updateWorkOrder(id: string, updates: Partial<MaintenanceWorkOrder>, userId: string) {
    const { data, error } = await supabase
      .from('maintenance_work_orders')
      .update({
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get work orders
  async getWorkOrders(filters?: MaintenanceFilter) {
    let query = supabase
      .from('maintenance_work_orders')
      .select(`
        *,
        assets:asset_id(name, rfid_code),
        assigned_user:assigned_to(full_name, email),
        creator:created_by(full_name, email),
        updater:updated_by(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }
}

// =============================================
// SPARE PARTS SERVICES
// =============================================

export const sparePartsService = {
  // Get all spare parts
  async getAll() {
    const { data, error } = await supabase
      .from('spare_parts')
      .select(`
        *,
        creator:created_by(full_name, email),
        updater:updated_by(full_name, email)
      `)
      .order('part_name')

    if (error) throw error
    return data
  },

  // Create spare part
  async create(part: Omit<SparePart, 'id' | 'created_at' | 'updated_at'>, userId: string) {
    const { data, error } = await supabase
      .from('spare_parts')
      .insert({
        ...part,
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update spare part
  async update(id: string, updates: Partial<SparePart>, userId: string) {
    const { data, error } = await supabase
      .from('spare_parts')
      .update({
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get low stock parts
  async getLowStock() {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .filter('stock_quantity', 'lte', 'min_stock_level')

    if (error) throw error
    return data
  },

  // Update stock
  async updateStock(id: string, quantity: number, userId: string) {
    return this.update(id, { quantity }, userId)
  }
}

// =============================================
// REAL-TIME SUBSCRIPTIONS
// =============================================

export const useDocumentUpdates = (callback: (update: any) => void) => {
  const subscription = supabase
    .channel('document_updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'documents' },
      callback
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export const useAssetUpdates = (callback: (update: any) => void) => {
  const subscription = supabase
    .channel('asset_updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'assets' },
      callback
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export const useMaintenanceUpdates = (callback: (update: any) => void) => {
  const subscription = supabase
    .channel('maintenance_updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'maintenance_logs' },
      callback
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export const useWorkOrderUpdates = (callback: (update: any) => void) => {
  const subscription = supabase
    .channel('work_order_updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'maintenance_work_orders' },
      callback
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
