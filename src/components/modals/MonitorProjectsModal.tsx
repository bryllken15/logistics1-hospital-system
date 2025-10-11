import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { projectService, staffAssignmentService, projectDeliveryService } from '../../services/database'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface MonitorProjectsModalProps {
  isOpen: boolean
  onClose: () => void
}

const MonitorProjectsModal: React.FC<MonitorProjectsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [projects, setProjects] = useState<any[]>([])
  const [staffAssignments, setStaffAssignments] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string>('all')

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      setLoading(true)
      const [projectData, assignmentData, deliveryData] = await Promise.all([
        projectService.getWithStats(),
        staffAssignmentService.getAll(),
        projectDeliveryService.getAll()
      ])
      
      setProjects(projectData || [])
      setStaffAssignments(assignmentData || [])
      setDeliveries(deliveryData || [])
    } catch (error) {
      console.error('Error loading monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = selectedProject === 'all' 
    ? projects 
    : projects.filter(p => p.id === selectedProject)

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'in_progress' || p.status === 'on_track').length,
    completed: projects.filter(p => p.status === 'completed').length,
    delayed: projects.filter(p => p.status === 'delayed').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalSpent: projects.reduce((sum, p) => sum + (p.spent || 0), 0),
    averageProgress: projects.length > 0 
      ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length 
      : 0
  }

  // Calculate delivery statistics
  const deliveryStats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    delayed: deliveries.filter(d => d.status === 'delayed').length
  }

  // Calculate staff statistics
  const staffStats = {
    total: staffAssignments.length,
    uniqueStaff: new Set(staffAssignments.map(sa => sa.user_id)).size,
    averageWorkload: staffAssignments.length > 0 
      ? staffAssignments.reduce((sum, sa) => sum + (sa.workload || 0), 0) / staffAssignments.length 
      : 0
  }

  // Chart data
  const statusData = [
    { name: 'Active', value: projectStats.active, color: '#3B82F6' },
    { name: 'Completed', value: projectStats.completed, color: '#10B981' },
    { name: 'Delayed', value: projectStats.delayed, color: '#EF4444' }
  ]

  const budgetData = projects.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    budget: project.budget || 0,
    spent: project.spent || 0,
    remaining: (project.budget || 0) - (project.spent || 0)
  }))

  const progressData = projects.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    progress: project.progress || 0,
    timeline: Math.min(100, Math.max(0, Math.floor((Date.now() - new Date(project.start_date).getTime()) / (new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) * 100)))
  }))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-7xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Monitor All Projects</h3>
              <p className="text-sm text-gray-600">Comprehensive project monitoring and analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading project data...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Filter */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Project:</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Projects</p>
                    <p className="text-2xl font-bold text-blue-900">{projectStats.total}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Active Projects</p>
                    <p className="text-2xl font-bold text-green-900">{projectStats.active}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Budget</p>
                    <p className="text-2xl font-bold text-purple-900">₱{projectStats.totalBudget.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Staff Assigned</p>
                    <p className="text-2xl font-bold text-orange-900">{staffStats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Status Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Budget vs Spent */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Spent</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                    <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                    <Bar dataKey="spent" fill="#EF4444" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project Progress vs Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Progress vs Timeline</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#10B981" name="Actual Progress" />
                  <Bar dataKey="timeline" fill="#6B7280" name="Timeline Progress" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Projects Table */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Project</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Progress</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Budget</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Staff</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Deliveries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => {
                      const projectStaff = staffAssignments.filter(sa => sa.project_id === project.id).length
                      const projectDeliveries = deliveries.filter(d => d.project_id === project.id).length
                      
                      return (
                        <tr key={project.id} className="border-b border-gray-100">
                          <td className="py-3">
                            <div>
                              <p className="font-medium text-gray-900">{project.name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              project.status === 'completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'delayed' ? 'bg-red-100 text-red-800' :
                              project.status === 'on_track' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${project.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{project.progress || 0}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-sm text-gray-900">
                            ₱{(project.budget || 0).toLocaleString()}
                          </td>
                          <td className="py-3 text-sm text-gray-900">
                            {projectStaff}
                          </td>
                          <td className="py-3 text-sm text-gray-900">
                            {projectDeliveries}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default MonitorProjectsModal
