import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Users, Truck, TrendingUp, Plus, Calendar, CheckCircle, X, Edit3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { projectService, systemLogService, staffAssignmentService, userService, deliveryReceiptService, analyticsService, inventoryService, inventoryChangeService, procurementApprovalService, projectManagerReportService, staffAnalyticsService, exportService, projectDeliveryService, staffPerformanceService, pdfReportService, realtimeService } from '../../services/database'
import { useProjectUpdates, useUserUpdates, useDeliveryReceiptUpdates } from '../../hooks/useRealtimeUpdates'
import NotificationCenter from '../NotificationCenter'
import EditDeliveryModal from '../modals/EditDeliveryModal'
import MonitorProjectsModal from '../modals/MonitorProjectsModal'
import StaffAnalysisModal from '../modals/StaffAnalysisModal'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const ProjectManagerDashboard = () => {
  const { user } = useAuth()
  const [selectedProject, setSelectedProject] = useState('all')
  const [projects, setProjects] = useState<any[]>([])
  const [staffAssignments, setStaffAssignments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [inventoryApprovals, setInventoryApprovals] = useState<any[]>([])
  const [inventoryChangeRequests, setInventoryChangeRequests] = useState<any[]>([])
  const [procurementApprovals, setProcurementApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false)
  const [showUpdateProgressForm, setShowUpdateProgressForm] = useState(false)
  const [selectedProjectForUpdate, setSelectedProjectForUpdate] = useState<any>(null)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: 0,
    status: 'in_progress'
  })
  const [progressUpdate, setProgressUpdate] = useState({
    progress: 0,
    notes: ''
  })
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  
  // New state for enhanced functionality
  const [filters, setFilters] = useState({
    status: 'all',
    searchText: '',
    dateRange: { start: '', end: '' },
    budgetRange: { min: 0, max: 0 },
    sortBy: 'name',
    sortOrder: 'asc'
  })
  
  // Modal states
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [showEditDeliveryModal, setShowEditDeliveryModal] = useState(false)
  const [showAddDeliveryModal, setShowAddDeliveryModal] = useState(false)
  const [showAssignStaffModal, setShowAssignStaffModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showMonitorProjectsModal, setShowMonitorProjectsModal] = useState(false)
  const [showStaffAnalysisModal, setShowStaffAnalysisModal] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  
  // Form states
  const [editingProject, setEditingProject] = useState<any>(null)
  const [editingDelivery, setEditingDelivery] = useState<any>(null)
  const [newDelivery, setNewDelivery] = useState({
    project_id: '',
    item_name: '',
    quantity_delivered: 0,
    supplier_name: '',
    delivery_date: '',
    destination: '',
    status: 'pending',
    notes: ''
  })
  const [newStaffAssignment, setNewStaffAssignment] = useState({
    user_id: '',
    project_id: '',
    role: 'team_member',
    assigned_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  // Report and analytics data
  const [staffAnalytics, setStaffAnalytics] = useState<any>(null)
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])

  useEffect(() => {
    loadProjectData()
  }, [])

  // Apply filters when projects or filters change
  useEffect(() => {
    applyFilters()
  }, [projects, filters])

  // Set up realtime subscriptions for project updates
  useProjectUpdates((update) => {
    console.log('Project update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setProjects(prev => [update.new, ...prev])
      toast.success('New project created')
    } else if (update.eventType === 'UPDATE') {
      setProjects(prev => prev.map(project => project.id === update.new.id ? update.new : project))
      if (update.new.status === 'completed') {
        toast.success('Project completed!')
      } else if (update.new.status === 'delayed') {
        toast('Project status changed to delayed')
      }
    } else if (update.eventType === 'DELETE') {
      setProjects(prev => prev.filter(project => project.id !== update.old.id))
      toast.success('Project deleted')
    }
  })

  useUserUpdates((update) => {
    console.log('User update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setUsers(prev => [update.new, ...prev])
      toast('New team member added')
    } else if (update.eventType === 'UPDATE') {
      setUsers(prev => prev.map(u => u.id === update.new.id ? update.new : u))
    }
  })

  useDeliveryReceiptUpdates((update) => {
    console.log('Delivery update received:', update)
    setLastUpdate(new Date())
    
    if (update.eventType === 'INSERT') {
      setDeliveries(prev => [update.new, ...prev])
      toast.success('New delivery received')
    } else if (update.eventType === 'UPDATE') {
      setDeliveries(prev => prev.map(delivery => delivery.id === update.new.id ? update.new : delivery))
      if (update.new.status === 'verified') {
        toast.success('Delivery verified')
      }
    }
  })

  // Additional realtime subscriptions using realtimeService
  useEffect(() => {
    const projectSub = realtimeService.subscribeToProjects((payload) => {
      console.log('Project realtime change:', payload)
      loadProjectData()
    })
    
    setSubscriptions([projectSub])
    
    return () => {
      subscriptions.forEach(sub => realtimeService.unsubscribe(sub))
    }
  }, [])

  const loadProjectData = async () => {
    try {
      setLoading(true)
      const [projectData, userData, deliveryData, projectDeliveriesData, inventoryApprovalsData, inventoryChangeRequestsData, procurementApprovalsData] = await Promise.all([
        projectService.getWithStats(),
        userService.getAll(),
        deliveryReceiptService.getAll(),
        projectDeliveryService.getAll(),
        inventoryService.getPendingProjectManagerApprovals(),
        Promise.resolve([]), // No longer using inventory_change_requests
        procurementApprovalService.getPendingProjectManagerApprovals()
      ])
      
      setProjects(projectData || [])
      setUsers(userData || [])
      setDeliveries((deliveryData || []).filter(Boolean)) // Filter out any undefined/null values
      setInventoryApprovals(inventoryApprovalsData || [])
      setInventoryChangeRequests([]) // No longer using inventory_change_requests
      setProcurementApprovals(procurementApprovalsData || [])
      
      // Load staff assignments for each project
      const assignments = []
      for (const project of (projectData || [])) {
        const projectAssignments = await staffAssignmentService.getByProject(project.id)
        assignments.push(...(projectAssignments || []))
      }
      setStaffAssignments(assignments)
    } catch (error) {
      console.error('Error loading project data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters to projects using database queries
  const applyFilters = async () => {
    try {
      const filtered = await projectService.getByFilters(filters)
      setFilteredProjects(filtered)
    } catch (error) {
      console.error('Error applying filters:', error)
      setFilteredProjects(projects)
    }
  }

  const handleCreateProject = async () => {
    try {
      if (!newProject.name || !newProject.start_date || !newProject.end_date || !newProject.budget) {
        toast.error('Please fill in all required fields')
        return
      }

      const projectData = {
        name: newProject.name,
        description: newProject.description,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        budget: newProject.budget,
        status: newProject.status,
        progress: 0,
        spent: 0,
        staff_count: 0
      }
      
      await projectService.create(projectData)
      
      // Log project creation
      await systemLogService.create({
        action: 'Project Created',
        user_id: user?.id || '55555555-5555-5555-5555-555555555555',
        details: `New project created: ${newProject.name} with budget ₱${newProject.budget.toLocaleString()}`
      })
      
      await loadProjectData()
      setNewProject({ name: '', description: '', start_date: '', end_date: '', budget: 0, status: 'in_progress' })
      setShowCreateProjectForm(false)
      toast.success('Project created successfully!')
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    }
  }

  const handleUpdateProgress = async () => {
    try {
      await projectService.updateProgress(selectedProjectForUpdate.id, progressUpdate.progress)
      
      // Log progress update
      await systemLogService.create({
        action: 'Project Progress Updated',
        user_id: '55555555-5555-5555-5555-555555555555', // Project Manager user ID
        details: `Project "${selectedProjectForUpdate.name}" progress updated to ${progressUpdate.progress}% - ${progressUpdate.notes}`
      })
      
      await loadProjectData()
      setProgressUpdate({ progress: 0, notes: '' })
      setShowUpdateProgressForm(false)
      setSelectedProjectForUpdate(null)
      toast.success('Project progress updated!')
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update project progress')
    }
  }

  // Handle project updates from ManagerDashboard with logistics connection
  const handleProjectUpdateFromManager = async (projectId: string, newProgress: number) => {
    try {
      await projectService.updateProgress(projectId, newProgress)
      
      // Log progress update with logistics connection
      await systemLogService.create({
        action: 'Project Progress Updated from Manager - Logistics Connected',
        user_id: '55555555-5555-5555-5555-555555555555',
        details: `Project ${projectId} progress updated to ${newProgress}% by manager and connected to project logistics dashboard`
      })
      
      await loadProjectData()
      toast.success('Project progress updated by manager and connected to logistics!')
    } catch (error) {
      console.error('Error updating project from manager:', error)
      toast.error('Failed to update project progress')
    }
  }

  // Enhanced logistics tracking
  const handleLogisticsStatusUpdate = async (projectId: string, logisticsStatus: string) => {
    try {
      // Update project with logistics status
      await projectService.updateProjectStatus(projectId, logisticsStatus)
      
      // Log logistics status update
      await systemLogService.create({
        action: 'Project Logistics Status Updated',
        user_id: '55555555-5555-5555-5555-555555555555',
        details: `Project ${projectId} logistics status updated to ${logisticsStatus}`
      })
      
      await loadProjectData()
      toast.success('Project logistics status updated!')
    } catch (error) {
      console.error('Error updating logistics status:', error)
      toast.error('Failed to update logistics status')
    }
  }

  // Handle inventory approval from Project Manager perspective
  const handleInventoryApproval = async (inventoryId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await inventoryService.approve(inventoryId, user?.id || '55555555-5555-5555-5555-555555555555', 'project_manager')
        
        // Log approval
        await systemLogService.create({
          action: 'Inventory Item Approved by Project Manager',
          user_id: user?.id || '55555555-5555-5555-5555-555555555555',
          details: `Inventory item ${inventoryId} approved by project manager for logistics`
        })
        
        toast.success('Inventory item approved for project logistics!')
      } else {
        // Handle rejection
        await systemLogService.create({
          action: 'Inventory Item Rejected by Project Manager',
          user_id: user?.id || '55555555-5555-5555-5555-555555555555',
          details: `Inventory item ${inventoryId} rejected by project manager`
        })
        
        toast.success('Inventory item rejected!')
      }
      
      await loadProjectData()
    } catch (error) {
      console.error('Error handling inventory approval:', error)
      toast.error('Failed to process inventory approval')
    }
  }

  // Handle inventory change approval from Project Manager perspective
  const handleInventoryChangeApproval = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await inventoryChangeService.approve(requestId, user?.id || '55555555-5555-5555-5555-555555555555')
        
        // Log the approval
        await systemLogService.create({
          action: 'Inventory Change Approved by Project Manager',
          user_id: user?.id || '55555555-5555-5555-5555-555555555555',
          details: `Inventory change request ${requestId} approved by project manager`
        })
        
        toast.success('Inventory change approved!')
      } else {
        await inventoryChangeService.reject(requestId, user?.id || '55555555-5555-5555-5555-555555555555')
        
        // Log the rejection
        await systemLogService.create({
          action: 'Inventory Change Rejected by Project Manager',
          user_id: user?.id || '55555555-5555-5555-5555-555555555555',
          details: `Inventory change request ${requestId} rejected by project manager`
        })
        
        toast.success('Inventory change rejected!')
      }
      
      await loadProjectData()
    } catch (error) {
      console.error('Error handling inventory change approval:', error)
      toast.error('Failed to process inventory change approval')
    }
  }

  // Handle procurement approval from Project Manager perspective
  const handleProcurementApproval = async (approvalId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await procurementApprovalService.approve(approvalId, user?.id || '33333333-3333-3333-3333-333333333333', 'project_manager')
        
        // Log approval
        await systemLogService.create({
          action: 'Procurement Request Approved by Project Manager',
          user_id: user?.id || '33333333-3333-3333-3333-333333333333',
          details: `Procurement approval request ${approvalId} approved by project manager`
        })
        
        toast.success('Procurement request approved!')
      } else {
        // Handle rejection
        await procurementApprovalService.reject(approvalId, user?.id || '33333333-3333-3333-3333-333333333333', 'project_manager')
        
        // Log rejection
        await systemLogService.create({
          action: 'Procurement Request Rejected by Project Manager',
          user_id: user?.id || '33333333-3333-3333-3333-333333333333',
          details: `Procurement approval request ${approvalId} rejected by project manager`
        })
        
        toast.success('Procurement request rejected!')
      }
      
      await loadProjectData()
    } catch (error) {
      console.error('Error handling procurement approval:', error)
      toast.error('Failed to process procurement approval')
    }
  }

  const handleCompleteProject = async (projectId: string) => {
    try {
      setLoading(true)
      await projectService.updateProjectStatus(projectId, 'completed')
      
      // Log project completion
      await systemLogService.create({
        action: 'Project Completed',
        user_id: '55555555-5555-5555-5555-555555555555',
        details: `Project completed: ${projectId}`
      })
      
      await loadProjectData()
      toast.success('Project marked as completed!')
    } catch (error) {
      console.error('Error completing project:', error)
      toast.error('Failed to complete project')
    } finally {
      setLoading(false)
    }
  }


  const handleTrackDelivery = async (deliveryId: string) => {
    try {
      setLoading(true)
      
      // Update delivery status
      await deliveryReceiptService.updateStatus(deliveryId, 'verified')
      
      // Log delivery tracking
      await systemLogService.create({
        action: 'Delivery Tracked',
        user_id: '55555555-5555-5555-5555-555555555555',
        details: `Delivery tracked and verified: ${deliveryId}`
      })
      
      await loadProjectData()
      toast.success('Delivery tracked successfully!')
    } catch (error) {
      console.error('Error tracking delivery:', error)
      toast.error('Failed to track delivery')
    } finally {
      setLoading(false)
    }
  }


  const handleGenerateProjectReport = async () => {
    try {
      const analytics = await analyticsService.getProjectAnalytics()
      
      await systemLogService.create({
        action: 'Project Report Generated',
        user_id: '55555555-5555-5555-5555-555555555555',
        details: `Project report generated for ${projects.length} projects`
      })
      
      toast.success('Project report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate project report')
    }
  }

  // New enhanced handler functions
  const handleEditProject = (project: any) => {
    setEditingProject(project)
    setShowEditProjectModal(true)
  }

  const handleSaveProjectEdit = async () => {
    try {
      if (!editingProject) return
      
      await projectService.update(editingProject.id, editingProject)
      
      await systemLogService.create({
        action: 'Project Updated',
        user_id: user?.id || '55555555-5555-5555-5555-555555555555',
        details: `Project ${editingProject.project_name} updated`
      })
      
      await loadProjectData()
      setShowEditProjectModal(false)
      setEditingProject(null)
      toast.success('Project updated successfully!')
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    }
  }

  const handleArchiveProject = async (projectId: string) => {
    try {
      await projectService.archive(projectId)
      
      await systemLogService.create({
        action: 'Project Archived',
        user_id: user?.id || '55555555-5555-5555-5555-555555555555',
        details: `Project ${projectId} archived`
      })
      
      await loadProjectData()
      toast.success('Project archived successfully!')
    } catch (error) {
      console.error('Error archiving project:', error)
      toast.error('Failed to archive project')
    }
  }

  const handleEditDelivery = (delivery: any) => {
    setEditingDelivery(delivery)
    setShowEditDeliveryModal(true)
  }

  const handleSaveDeliveryEdit = async () => {
    try {
      if (!editingDelivery) return
      
      await projectDeliveryService.update(editingDelivery.id, editingDelivery)
      
      await systemLogService.create({
        action: 'Project Delivery Updated',
        user_id: user?.id || '55555555-5555-5555-5555-555555555555',
        details: `Project delivery ${editingDelivery.id} updated`
      })
      
      await loadProjectData()
      setShowEditDeliveryModal(false)
      setEditingDelivery(null)
      toast.success('Project delivery updated successfully!')
    } catch (error) {
      console.error('Error updating delivery:', error)
      toast.error('Failed to update delivery')
    }
  }

  const handleAddDelivery = async () => {
    try {
      if (!newDelivery.project_id || !newDelivery.item_name) {
        toast.error('Please fill in required fields')
        return
      }
      
      await projectDeliveryService.create({
        ...newDelivery,
        created_by: user?.id || '55555555-5555-5555-5555-555555555555'
      })
      
      await systemLogService.create({
        action: 'Project Delivery Added',
        user_id: user?.id || '55555555-5555-5555-5555-555555555555',
        details: `New project delivery added for project ${newDelivery.project_id}`
      })
      
      await loadProjectData()
      setShowAddDeliveryModal(false)
      setNewDelivery({
        project_id: '',
        item_name: '',
        quantity_delivered: 0,
        supplier_name: '',
        delivery_date: '',
        destination: '',
        status: 'pending',
        notes: ''
      })
      toast.success('Project delivery added successfully!')
    } catch (error) {
      console.error('Error adding delivery:', error)
      toast.error('Failed to add delivery')
    }
  }

  const handleAssignStaff = async () => {
    try {
      if (!newStaffAssignment.project_id || !newStaffAssignment.user_id) {
        toast.error('Please select both project and staff member')
        return
      }
      
      await staffAssignmentService.assign({
        user_id: newStaffAssignment.user_id,
        project_id: newStaffAssignment.project_id,
        role: newStaffAssignment.role,
        assigned_date: newStaffAssignment.assigned_date,
        notes: newStaffAssignment.notes,
        assigned_by: user?.id || '55555555-5555-5555-5555-555555555555'
      })
      
      await systemLogService.create({
        action: 'Staff Assigned to Project',
        user_id: user?.id || '55555555-5555-5555-5555-555555555555',
        details: `Staff member assigned to project ${newStaffAssignment.project_id}`
      })
      
      await loadProjectData()
      setNewStaffAssignment({
        project_id: '',
        user_id: '',
        role: '',
        assigned_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      setShowAssignStaffModal(false)
      toast.success('Staff assigned successfully!')
    } catch (error) {
      console.error('Error assigning staff:', error)
      toast.error('Failed to assign staff')
    }
  }


  const handleGenerateReport = async (reportType: string) => {
    try {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1) // Last month
      const endDate = new Date()
      
      let reportData
      if (reportType === 'project_summary') {
        reportData = await projectManagerReportService.generateProjectSummary(
          user?.id || '55555555-5555-5555-5555-555555555555',
          startDate,
          endDate
        )
      } else if (reportType === 'delivery_summary') {
        reportData = await projectManagerReportService.generateDeliverySummary(
          user?.id || '55555555-5555-5555-5555-555555555555',
          startDate,
          endDate
        )
      } else if (reportType === 'staff_utilization') {
        reportData = await projectManagerReportService.generateStaffUtilization(
          user?.id || '55555555-5555-5555-5555-555555555555'
        )
      }
      
      setReportData(reportData)
      setShowReportModal(true)
      toast.success('Report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    }
  }

  const handleExportProjects = async (format: string) => {
    try {
      const exportData = {
        projects: filteredProjects,
        exportedBy: user?.full_name || 'Project Manager',
        exportDate: new Date().toISOString()
      }
      
      let blob
      if (format === 'csv') {
        blob = await exportService.exportToCSV('projects', exportData, user?.id || '55555555-5555-5555-5555-555555555555')
      } else if (format === 'excel') {
        blob = await exportService.exportToExcel('projects', exportData, user?.id || '55555555-5555-5555-5555-555555555555')
      } else if (format === 'pdf') {
        blob = await exportService.exportToPDF(exportData, user?.id || '55555555-5555-5555-5555-555555555555')
      }
      
      // Download file
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `projects_export_${Date.now()}.${format === 'pdf' ? 'txt' : format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`Projects exported as ${format.toUpperCase()} successfully!`)
    } catch (error) {
      console.error('Error exporting projects:', error)
      toast.error('Failed to export projects')
    }
  }

  const handleStaffAnalysis = async () => {
    try {
      const analytics = await staffAnalyticsService.getStaffUtilization()
      setStaffAnalytics(analytics)
      setShowStaffAnalysisModal(true)
    } catch (error) {
      console.error('Error getting staff analytics:', error)
      toast.error('Failed to load staff analytics')
    }
  }

  const handleRefreshData = async () => {
    await loadProjectData()
    toast.success('Data refreshed successfully!')
  }

  // Real data from database
  const projectProgress = projects.map(project => ({
    project: project.name,
    progress: project.progress || 0,
    timeline: Math.min(100, Math.max(0, Math.floor((Date.now() - new Date(project.start_date).getTime()) / (new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) * 100)))
  }))

  const deliveryTimelines = [
    { month: 'Jan', planned: 12, completed: deliveries.filter(d => d.status === 'delivered' && new Date(d.delivery_date).getMonth() === 0).length, delayed: deliveries.filter(d => d.status === 'delayed' && new Date(d.delivery_date).getMonth() === 0).length },
    { month: 'Feb', planned: 15, completed: deliveries.filter(d => d.status === 'delivered' && new Date(d.delivery_date).getMonth() === 1).length, delayed: deliveries.filter(d => d.status === 'delayed' && new Date(d.delivery_date).getMonth() === 1).length },
    { month: 'Mar', planned: 18, completed: deliveries.filter(d => d.status === 'delivered' && new Date(d.delivery_date).getMonth() === 2).length, delayed: deliveries.filter(d => d.status === 'delayed' && new Date(d.delivery_date).getMonth() === 2).length },
    { month: 'Apr', planned: 20, completed: deliveries.filter(d => d.status === 'delivered' && new Date(d.delivery_date).getMonth() === 3).length, delayed: deliveries.filter(d => d.status === 'delayed' && new Date(d.delivery_date).getMonth() === 3).length },
    { month: 'May', planned: 22, completed: deliveries.filter(d => d.status === 'delivered' && new Date(d.delivery_date).getMonth() === 4).length, delayed: deliveries.filter(d => d.status === 'delayed' && new Date(d.delivery_date).getMonth() === 4).length },
    { month: 'Jun', planned: 25, completed: deliveries.filter(d => d.status === 'delivered' && new Date(d.delivery_date).getMonth() === 5).length, delayed: deliveries.filter(d => d.status === 'delayed' && new Date(d.delivery_date).getMonth() === 5).length }
  ]

  const activeProjects = projects.map(project => ({
    id: project.id,
    name: project.name,
    status: project.status,
    startDate: project.start_date,
    endDate: project.end_date,
    progress: project.progress || 0,
    staff: staffAssignments.filter(sa => sa.project_id === project.id).length,
    budget: `₱${(project.budget || 0).toLocaleString()}`,
    spent: `₱${(project.spent || 0).toLocaleString()}`
  }))

  const deliveryLogs = deliveries.map(delivery => ({
    id: delivery.id,
    project: delivery.projects?.name || 'Unknown Project',
    items: delivery.items || 0,
    destination: delivery.destination || 'Unknown',
    date: delivery.delivery_date || delivery.created_at,
    status: delivery.status
  }))

  const staffAssignmentsData = staffAssignments.map(assignment => ({
    name: assignment.users?.full_name || 'Unknown',
    role: assignment.role || 'team_member',
    project: assignment.projects?.name || 'Unknown Project',
    workload: Math.floor(Math.random() * 40) + 60 // This would be calculated from actual performance data
  }))


  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Project Logistics Tracker</h1>
          <p className="text-gray-600">Track logistics and assets per hospital project, manage delivery timelines</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Real-time Active</span>
          </div>
          <NotificationCenter 
          notifications={notifications}
          onClearNotification={() => {}}
          onClearAll={() => {}}
        />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-primary">{projects.filter(p => p.status === 'in_progress' || p.status === 'on_track').length}</p>
              <p className="text-xs text-green-600">
                {projects.filter(p => p.status === 'on_track').length} on track, {projects.filter(p => p.status === 'delayed').length} delayed
              </p>
            </div>
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Projects</p>
              <p className="text-2xl font-bold text-green-500">{projects.filter(p => p.status === 'completed').length}</p>
              <p className="text-xs text-green-600">This year</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Deliveries</p>
              <p className="text-2xl font-bold text-orange-500">{deliveries.filter(d => d.status === 'pending').length}</p>
              <p className="text-xs text-orange-600">This week</p>
            </div>
            <Truck className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Logistics Staff Assigned</p>
              <p className="text-2xl font-bold text-secondary">{staffAssignments.length}</p>
              <p className="text-xs text-blue-600">Across all projects</p>
            </div>
            <Users className="w-8 h-8 text-secondary" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Project Progress Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" fill="#00A896" name="Actual Progress" />
              <Bar dataKey="timeline" fill="#1D3557" name="Timeline Progress" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Delivery Timelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Delivery Timeline Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={deliveryTimelines}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="planned" stroke="#1D3557" strokeWidth={2} name="Planned" />
              <Line type="monotone" dataKey="completed" stroke="#00A896" strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="delayed" stroke="#F77F00" strokeWidth={2} name="Delayed" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Project Overview Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Project Overview</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowCreateProjectForm(true)}
              className="btn-primary text-sm"
            >
              Create New Project
            </button>
            <button 
              onClick={() => setShowMonitorProjectsModal(true)}
              className="btn-secondary text-sm"
            >
              Monitor All Projects
            </button>
          </div>
        </div>

        {/* Enhanced Filter Controls */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search projects..."
                value={filters.searchText}
                onChange={(e) => setFilters({...filters, searchText: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, start: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, end: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Budget Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget</label>
              <input
                type="number"
                placeholder="Min budget"
                value={filters.budgetRange.min || ''}
                onChange={(e) => setFilters({...filters, budgetRange: {...filters.budgetRange, min: parseInt(e.target.value) || 0}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget</label>
              <input
                type="number"
                placeholder="Max budget"
                value={filters.budgetRange.max || ''}
                onChange={(e) => setFilters({...filters, budgetRange: {...filters.budgetRange, max: parseInt(e.target.value) || 0}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex space-x-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="project_name">Name</option>
                  <option value="start_date">Start Date</option>
                  <option value="end_date">End Date</option>
                  <option value="budget">Budget</option>
                  <option value="progress">Progress</option>
                </select>
                <button
                  onClick={() => setFilters({...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Project Name</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Progress</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Staff</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Budget</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Timeline</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Loading projects...</td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">No projects found</td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-500">{new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        project.status === 'on_track' ? 'bg-green-100 text-green-800' :
                        project.status === 'delayed' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-900">8</td>
                    <td className="py-3 text-sm text-gray-900">₱{project.budget.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedProjectForUpdate(project)
                            setProgressUpdate({ progress: project.progress, notes: '' })
                            setShowUpdateProgressForm(true)
                          }}
                          className="p-1 text-gray-400 hover:text-primary"
                          title="Update Progress"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditProject(project)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit Project"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setNewStaffAssignment({...newStaffAssignment, project_id: project.id})}
                          className="p-1 text-gray-400 hover:text-purple-600"
                          title="Assign Staff"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        {project.status !== 'completed' && (
                          <button 
                            onClick={() => handleCompleteProject(project.id)}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Complete Project"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleArchiveProject(project.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Archive Project"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Logs per Project */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Delivery Logs per Project</h3>
            <button 
              onClick={() => setShowAddDeliveryModal(true)}
              className="btn-primary text-sm"
            >
              Track Deliveries
            </button>
          </div>
          <div className="space-y-3">
            {deliveryLogs.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No deliveries found</div>
            ) : (
              deliveryLogs.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{delivery.project}</p>
                  <p className="text-sm text-gray-600">{delivery.items} items • {delivery.destination}</p>
                    <p className="text-xs text-gray-500">{new Date(delivery.date).toLocaleDateString()}</p>
                </div>
                  <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                      delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      delivery.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {delivery.status.replace('_', ' ').toUpperCase()}
                </span>
                    <button 
                      onClick={() => handleEditDelivery(delivery)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit Delivery"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
              </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Staff Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Staff Assignments</h3>
            <button 
              onClick={() => setShowAssignStaffModal(true)}
              className="btn-primary text-sm"
            >
              Assign Staff
            </button>
          </div>
          <div className="space-y-3">
            {staffAssignmentsData.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No staff assignments found</div>
            ) : (
              staffAssignmentsData.map((staff, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{staff.name}</p>
                  <p className="text-sm text-gray-600">{staff.role}</p>
                  <p className="text-xs text-gray-500">{staff.project}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{staff.workload}%</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-secondary h-2 rounded-full"
                      style={{ width: `${staff.workload}%` }}
                    />
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Inventory Approval for Project Logistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Inventory Approvals for Project Logistics</h3>
          <span className="text-sm text-gray-500">Project Manager Approval Required</span>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">Loading inventory approvals...</div>
          ) : inventoryApprovals.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No pending inventory approvals for project logistics</div>
          ) : (
            inventoryApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{approval.item_name}</p>
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      PROJECT LOGISTICS
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Quantity: {approval.quantity} • Unit Price: ₱{approval.unit_price} • 
                    Total: ₱{approval.total_value?.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                      Pending Project Manager Approval
                    </span>
                    {approval.manager_approved && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Manager Approved
                      </span>
                    )}
                    {approval.project_manager_approved && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Project Manager Approved
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleInventoryApproval(approval.id, 'approve')}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                    disabled={approval.project_manager_approved}
                  >
                    {approval.project_manager_approved ? 'Approved' : 'Approve for Logistics'}
                  </button>
                  <button 
                    onClick={() => handleInventoryApproval(approval.id, 'reject')}
                    className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Inventory Change Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Inventory Change Requests</h3>
          <span className="text-sm text-gray-500">Project Manager Approval Required</span>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">Loading change requests...</div>
          ) : inventoryChangeRequests.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No pending inventory change requests</div>
          ) : (
            inventoryChangeRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{request.inventory?.item_name || 'Unknown Item'}</p>
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                      CHANGE REQUEST
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {request.change_type === 'quantity_increase' ? 'Increase' : 'Decrease'} quantity by {Math.abs(request.quantity_change)}
                  </p>
                  <p className="text-xs text-gray-500">Reason: {request.reason}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      Pending Project Manager Approval
                    </span>
                    {request.manager_approved && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Manager Approved
                      </span>
                    )}
                    {request.project_manager_approved && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Project Manager Approved
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleInventoryChangeApproval(request.id, 'approve')}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                    disabled={request.project_manager_approved}
                  >
                    {request.project_manager_approved ? 'Approved' : 'Approve'}
                  </button>
                  <button 
                    onClick={() => handleInventoryChangeApproval(request.id, 'reject')}
                    className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Procurement Approval Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Procurement Approval Requests</h3>
          <span className="text-sm text-gray-500">Project Manager Approval Required</span>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">Loading procurement approvals...</div>
          ) : procurementApprovals.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No pending procurement approval requests</div>
          ) : (
            procurementApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{approval.item_name}</p>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      PROCUREMENT
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {approval.description} • ₱{(approval.total_value || 0).toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                      {approval.quantity} units
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                      {approval.priority} priority
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                      {approval.supplier}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">
                      Requested by: {approval.requested_by_user?.full_name || 'Unknown'}
                    </span>
                    {approval.manager_approved && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Manager Approved
                      </span>
                    )}
                    {approval.project_manager_approved && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Project Manager Approved
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleProcurementApproval(approval.id, 'approve')}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                    disabled={approval.project_manager_approved}
                    title="Approve procurement request"
                  >
                    {approval.project_manager_approved ? 'Approved' : 'Approve'}
                  </button>
                  <button 
                    onClick={() => handleProcurementApproval(approval.id, 'reject')}
                    className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                    title="Reject procurement request"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowCreateProjectForm(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Project</span>
          </button>
          <button 
            onClick={handleRefreshData}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Truck className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
          <button 
            onClick={() => handleGenerateReport('project_summary')}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
          <button 
            onClick={() => setShowAddDeliveryModal(true)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <ClipboardList className="w-5 h-5" />
            <span>Track Deliveries</span>
          </button>
        </div>
        
        {/* Additional Project Management Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Project Management</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleExportProjects('csv')}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              Export Projects
            </button>
            <button 
              onClick={() => setShowMonitorProjectsModal(true)}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
            >
              Monitor All Projects
            </button>
            <button 
              onClick={handleStaffAnalysis}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600"
            >
              Staff Analysis
            </button>
          </div>
        </div>
      </motion.div>

      {/* Create Project Modal */}
      {showCreateProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Create New Project</h3>
              <button
                onClick={() => setShowCreateProjectForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="input-field w-full"
                  placeholder="Emergency Ward Renovation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Renovation of emergency ward with new equipment..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newProject.start_date}
                    onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                    className="input-field w-full"
                    aria-label="Project start date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newProject.end_date}
                    onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                    className="input-field w-full"
                    aria-label="Project end date"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₱)</label>
                <input
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({...newProject, budget: parseInt(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="2500000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                  className="input-field w-full"
                  aria-label="Project status"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_track">On Track</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateProjectForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="btn-primary"
              >
                Create Project
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showUpdateProgressForm && selectedProjectForUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Update Project Progress</h3>
              <button
                onClick={() => setShowUpdateProgressForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Project: <span className="font-medium">{selectedProjectForUpdate.name}</span></p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressUpdate.progress}
                  onChange={(e) => setProgressUpdate({...progressUpdate, progress: parseInt(e.target.value) || 0})}
                  className="input-field w-full"
                  placeholder="75"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={progressUpdate.notes}
                  onChange={(e) => setProgressUpdate({...progressUpdate, notes: e.target.value})}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Progress update notes..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUpdateProgressForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProgress}
                className="btn-primary"
              >
                Update Progress
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Delivery Modal */}
      <EditDeliveryModal
        isOpen={showEditDeliveryModal}
        onClose={() => setShowEditDeliveryModal(false)}
        delivery={editingDelivery}
        onSave={(updatedDelivery) => {
          setDeliveries(prev => prev.map(d => d?.id === updatedDelivery?.id ? updatedDelivery : d).filter(Boolean))
          setShowEditDeliveryModal(false)
          setEditingDelivery(null)
        }}
      />

      {/* Monitor Projects Modal */}
      <MonitorProjectsModal
        isOpen={showMonitorProjectsModal}
        onClose={() => setShowMonitorProjectsModal(false)}
      />

      {/* Staff Analysis Modal */}
      <StaffAnalysisModal
        isOpen={showStaffAnalysisModal}
        onClose={() => setShowStaffAnalysisModal(false)}
      />

      {/* Assign Staff Modal */}
      {showAssignStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Assign Staff to Project</h3>
                  <p className="text-sm text-gray-600">Assign team members to projects</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignStaffModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAssignStaff(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project *
                  </label>
                  <select
                    value={newStaffAssignment.project_id}
                    onChange={(e) => setNewStaffAssignment({...newStaffAssignment, project_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Staff Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Member *
                  </label>
                  <select
                    value={newStaffAssignment.user_id}
                    onChange={(e) => setNewStaffAssignment({...newStaffAssignment, user_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a staff member</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role in Project */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role in Project
                  </label>
                  <input
                    type="text"
                    value={newStaffAssignment.role || ''}
                    onChange={(e) => setNewStaffAssignment({...newStaffAssignment, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Lead Developer, Designer, etc."
                  />
                </div>

                {/* Assignment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Date
                  </label>
                  <input
                    type="date"
                    value={newStaffAssignment.assigned_date}
                    onChange={(e) => setNewStaffAssignment({...newStaffAssignment, assigned_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newStaffAssignment.notes || ''}
                    onChange={(e) => setNewStaffAssignment({...newStaffAssignment, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Additional notes about the assignment..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAssignStaffModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Assign Staff</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Project Report</h3>
                  <p className="text-sm text-gray-600">Generated report with project analytics</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {reportData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card p-4">
                      <h4 className="font-semibold text-gray-900">Total Projects</h4>
                      <p className="text-2xl font-bold text-blue-600">{reportData.totalProjects || 0}</p>
                    </div>
                    <div className="card p-4">
                      <h4 className="font-semibold text-gray-900">Active Projects</h4>
                      <p className="text-2xl font-bold text-green-600">{reportData.activeProjects || 0}</p>
                    </div>
                    <div className="card p-4">
                      <h4 className="font-semibold text-gray-900">Completed Projects</h4>
                      <p className="text-2xl font-bold text-purple-600">{reportData.completedProjects || 0}</p>
                    </div>
                  </div>

                  {reportData.projects && reportData.projects.length > 0 && (
                    <div className="card p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.projects.map((project: any, index: number) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.progress}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{project.budget?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        // Implement PDF download functionality
                        toast.success('PDF download feature coming soon!')
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Generating report...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Delivery Modal */}
      {showAddDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Add New Delivery</h3>
                  <p className="text-sm text-gray-600">Track project deliveries and shipments</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDeliveryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddDelivery(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project *
                  </label>
                  <select
                    value={newDelivery.project_id}
                    onChange={(e) => setNewDelivery({...newDelivery, project_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={newDelivery.item_name}
                    onChange={(e) => setNewDelivery({...newDelivery, item_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item name"
                    required
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={newDelivery.quantity_delivered}
                    onChange={(e) => setNewDelivery({...newDelivery, quantity_delivered: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={newDelivery.supplier_name}
                    onChange={(e) => setNewDelivery({...newDelivery, supplier_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={newDelivery.delivery_date}
                    onChange={(e) => setNewDelivery({...newDelivery, delivery_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newDelivery.status}
                    onChange={(e) => setNewDelivery({...newDelivery, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={newDelivery.destination || ''}
                    onChange={(e) => setNewDelivery({...newDelivery, destination: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter destination"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newDelivery.notes}
                    onChange={(e) => setNewDelivery({...newDelivery, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes about the delivery..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddDeliveryModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Add Delivery</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ProjectManagerDashboard
