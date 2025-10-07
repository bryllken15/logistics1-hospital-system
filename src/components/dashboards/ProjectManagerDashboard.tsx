import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Users, Truck, TrendingUp, Plus, Calendar, CheckCircle, X, Edit3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { projectService, systemLogService, staffAssignmentService, userService, deliveryReceiptService, analyticsService } from '../../services/database'
import { useProjectUpdates, useUserUpdates, useDeliveryReceiptUpdates } from '../../hooks/useRealtimeUpdates'
import NotificationCenter from '../NotificationCenter'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const ProjectManagerDashboard = () => {
  const { user } = useAuth()
  const [selectedProject, setSelectedProject] = useState('all')
  const [projects, setProjects] = useState<any[]>([])
  const [staffAssignments, setStaffAssignments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<any[]>([])
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
    status: 'planning'
  })
  const [progressUpdate, setProgressUpdate] = useState({
    progress: 0,
    notes: ''
  })
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    loadProjectData()
  }, [])

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


  const loadProjectData = async () => {
    try {
      setLoading(true)
      const [projectData, userData, deliveryData] = await Promise.all([
        projectService.getAll(),
        userService.getAll(),
        deliveryReceiptService.getAll()
      ])
      
      setProjects(projectData || [])
      setUsers(userData || [])
      setDeliveries(deliveryData || [])
      
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

  const handleCreateProject = async () => {
    try {
      const projectData = {
        ...newProject,
        created_by: '55555555-5555-5555-5555-555555555555', // Project Manager user ID
        progress: 0
      }
      
      await projectService.create(projectData)
      
      // Log project creation
      await systemLogService.create({
        action: 'Project Created',
        user_id: '55555555-5555-5555-5555-555555555555',
        details: `New project created: ${newProject.name} with budget ₱${newProject.budget.toLocaleString()}`
      })
      
      await loadProjectData()
      setNewProject({ name: '', description: '', start_date: '', end_date: '', budget: 0, status: 'planning' })
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

  const handleCompleteProject = async (projectId: string) => {
    try {
      setLoading(true)
      await projectService.updateStatus(projectId, 'completed')
      
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

  const handleAssignStaff = async (projectId: string, userId: string, role: string) => {
    try {
      setLoading(true)
      
      const assignmentData = {
        project_id: projectId,
        user_id: userId,
        role: role,
        assigned_by: '55555555-5555-5555-5555-555555555555'
      }
      
      await staffAssignmentService.assign(assignmentData)
      
      // Log staff assignment
      await systemLogService.create({
        action: 'Staff Assigned',
        user_id: '55555555-5555-5555-5555-555555555555',
        details: `Staff assigned to project: ${projects.find(p => p.id === projectId)?.name} - Role: ${role}`
      })
      
      await loadProjectData()
      toast.success('Staff assigned successfully!')
    } catch (error) {
      console.error('Error assigning staff:', error)
      toast.error('Failed to assign staff')
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

  // Mock data
  const projectProgress = [
    { project: 'Emergency Ward Renovation', progress: 75, timeline: 80 },
    { project: 'New Equipment Installation', progress: 45, timeline: 60 },
    { project: 'Supply Chain Optimization', progress: 90, timeline: 95 },
    { project: 'RFID Implementation', progress: 30, timeline: 40 }
  ]

  const deliveryTimelines = [
    { month: 'Jan', planned: 12, completed: 10, delayed: 2 },
    { month: 'Feb', planned: 15, completed: 12, delayed: 3 },
    { month: 'Mar', planned: 18, completed: 16, delayed: 2 },
    { month: 'Apr', planned: 20, completed: 18, delayed: 2 },
    { month: 'May', planned: 22, completed: 20, delayed: 2 },
    { month: 'Jun', planned: 25, completed: 23, delayed: 2 }
  ]

  const activeProjects = [
    { 
      id: 1, 
      name: 'Emergency Ward Renovation', 
      status: 'On Track', 
      startDate: '2025-01-01', 
      endDate: '2025-03-15',
      progress: 75,
      staff: 8,
      budget: '₱2.5M',
      spent: '₱1.8M'
    },
    { 
      id: 2, 
      name: 'New Equipment Installation', 
      status: 'Delayed', 
      startDate: '2025-01-15', 
      endDate: '2025-02-28',
      progress: 45,
      staff: 5,
      budget: '₱1.2M',
      spent: '₱540K'
    },
    { 
      id: 3, 
      name: 'Supply Chain Optimization', 
      status: 'On Track', 
      startDate: '2024-12-01', 
      endDate: '2025-01-30',
      progress: 90,
      staff: 6,
      budget: '₱800K',
      spent: '₱720K'
    },
    { 
      id: 4, 
      name: 'RFID Implementation', 
      status: 'In Progress', 
      startDate: '2025-01-10', 
      endDate: '2025-04-10',
      progress: 30,
      staff: 4,
      budget: '₱1.5M',
      spent: '₱450K'
    }
  ]

  const deliveryLogs = [
    { id: 1, project: 'Emergency Ward Renovation', items: 15, destination: 'Construction Site', date: '2025-01-15', status: 'Delivered' },
    { id: 2, project: 'New Equipment Installation', items: 8, destination: 'Equipment Room', date: '2025-01-15', status: 'In Transit' },
    { id: 3, project: 'Supply Chain Optimization', items: 12, destination: 'Warehouse', date: '2025-01-14', status: 'Delivered' },
    { id: 4, project: 'RFID Implementation', items: 6, destination: 'IT Department', date: '2025-01-16', status: 'Pending' }
  ]

  const mockStaffAssignments = [
    { name: 'John Smith', role: 'Logistics Coordinator', project: 'Emergency Ward Renovation', workload: 100 },
    { name: 'Sarah Johnson', role: 'Delivery Manager', project: 'New Equipment Installation', workload: 80 },
    { name: 'Mike Davis', role: 'Supply Analyst', project: 'Supply Chain Optimization', workload: 60 },
    { name: 'Lisa Wilson', role: 'RFID Specialist', project: 'RFID Implementation', workload: 90 }
  ]

  const filteredProjects = selectedProject === 'all' 
    ? activeProjects 
    : activeProjects.filter(project => project.status.toLowerCase().replace(' ', '_') === selectedProject)

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
              <p className="text-2xl font-bold text-primary">4</p>
              <p className="text-xs text-green-600">2 on track, 1 delayed</p>
            </div>
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Projects</p>
              <p className="text-2xl font-bold text-green-500">12</p>
              <p className="text-xs text-green-600">This year</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Deliveries</p>
              <p className="text-2xl font-bold text-orange-500">8</p>
              <p className="text-xs text-orange-600">This week</p>
            </div>
            <Truck className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Logistics Staff Assigned</p>
              <p className="text-2xl font-bold text-secondary">23</p>
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
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="Filter projects by status"
            >
              <option value="all">All Projects</option>
              <option value="on_track">On Track</option>
              <option value="delayed">Delayed</option>
              <option value="in_progress">In Progress</option>
            </select>
            <button 
              onClick={() => setShowCreateProjectForm(true)}
              className="btn-primary text-sm"
            >
              Create New Project
            </button>
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Loading projects...</td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No projects found</td>
                </tr>
              ) : (
                projects.map((project) => (
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
                        {project.status !== 'completed' && (
                          <button 
                            onClick={() => handleCompleteProject(project.id)}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Complete Project"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
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
            <button className="btn-primary text-sm">Track Deliveries</button>
          </div>
          <div className="space-y-3">
            {deliveryLogs.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{delivery.project}</p>
                  <p className="text-sm text-gray-600">{delivery.items} items • {delivery.destination}</p>
                  <p className="text-xs text-gray-500">{delivery.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  delivery.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {delivery.status}
                </span>
              </div>
            ))}
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
            <button className="btn-primary text-sm">Assign Staff</button>
          </div>
          <div className="space-y-3">
            {mockStaffAssignments.map((staff, index) => (
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
            ))}
          </div>
        </motion.div>
      </div>

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
            onClick={() => loadProjectData()}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Truck className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
          <button 
            onClick={() => handleGenerateProjectReport()}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
          <button 
            onClick={() => {
              // Track all project deliveries
              toast.success('Tracking all project deliveries...')
            }}
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
              onClick={() => {
                // Export project data
                const csvData = projects.map(project => ({
                  name: project.name,
                  status: project.status,
                  progress: project.progress,
                  budget: project.budget,
                  startDate: project.start_date,
                  endDate: project.end_date
                }))
                
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "Name,Status,Progress,Budget,Start Date,End Date\n" +
                  csvData.map(row => Object.values(row).join(",")).join("\n")
                
                const encodedUri = encodeURI(csvContent)
                const link = document.createElement("a")
                link.setAttribute("href", encodedUri)
                link.setAttribute("download", "projects_export.csv")
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                toast.success('Project data exported!')
              }}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              Export Projects
            </button>
            <button 
              onClick={() => {
                // Monitor all projects
                toast.success('Monitoring all active projects...')
              }}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
            >
              Monitor All Projects
            </button>
            <button 
              onClick={() => {
                // Staff workload analysis
                toast.success('Staff workload analysis generated!')
              }}
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
    </div>
  )
}

export default ProjectManagerDashboard
