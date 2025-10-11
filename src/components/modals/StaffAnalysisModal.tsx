import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Users, TrendingUp, Award, AlertTriangle, BarChart3, Target, Clock } from 'lucide-react'
import { staffPerformanceService, staffAssignmentService, projectService } from '../../services/database'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface StaffAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
}

const StaffAnalysisModal: React.FC<StaffAnalysisModalProps> = ({
  isOpen,
  onClose
}) => {
  const [staffPerformance, setStaffPerformance] = useState<any[]>([])
  const [staffAssignments, setStaffAssignments] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string>('efficiency')

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      setLoading(true)
      const [performanceData, assignmentData, projectData] = await Promise.all([
        staffPerformanceService.getCompletionRates(),
        staffAssignmentService.getAll(),
        projectService.getAll()
      ])
      
      setStaffPerformance(performanceData || [])
      setStaffAssignments(assignmentData || [])
      setProjects(projectData || [])
    } catch (error) {
      console.error('Error loading staff analysis data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate staff statistics
  const staffStats = {
    totalStaff: staffPerformance.length,
    averageEfficiency: staffPerformance.length > 0 
      ? staffPerformance.reduce((sum, staff) => sum + (staff.efficiencyScore || 0), 0) / staffPerformance.length 
      : 0,
    topPerformers: staffPerformance.filter(staff => (staff.efficiencyScore || 0) >= 80).length,
    needsImprovement: staffPerformance.filter(staff => (staff.efficiencyScore || 0) < 60).length,
    averageCompletionRate: staffPerformance.length > 0 
      ? staffPerformance.reduce((sum, staff) => sum + (staff.completionRate || 0), 0) / staffPerformance.length 
      : 0
  }

  // Chart data for efficiency scores
  const efficiencyData = staffPerformance.map(staff => ({
    name: staff.user?.full_name?.split(' ')[0] || 'Unknown',
    efficiency: staff.efficiencyScore || 0,
    completion: staff.completionRate || 0,
    tasks: staff.totalTasks || 0
  }))

  // Chart data for project assignments
  const projectAssignmentData = projects.map(project => {
    const projectStaff = staffAssignments.filter(sa => sa.project_id === project.id)
    return {
      name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
      staffCount: projectStaff.length,
      progress: project.progress || 0
    }
  })

  // Performance distribution
  const performanceDistribution = [
    { name: 'Top Performers (80%+)', value: staffStats.topPerformers, color: '#10B981' },
    { name: 'Good Performance (60-79%)', value: staffPerformance.filter(s => (s.efficiencyScore || 0) >= 60 && (s.efficiencyScore || 0) < 80).length, color: '#3B82F6' },
    { name: 'Needs Improvement (<60%)', value: staffStats.needsImprovement, color: '#EF4444' }
  ]

  // Workload distribution
  const workloadData = staffPerformance.map(staff => ({
    name: staff.user?.full_name?.split(' ')[0] || 'Unknown',
    completed: staff.completedTasks || 0,
    pending: staff.tasks_pending || 0,
    total: staff.totalTasks || 0
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Staff Performance Analysis</h3>
              <p className="text-sm text-gray-600">Advanced staff analytics and performance metrics</p>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading staff analysis...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Metric Filter */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Analysis Metric:</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="efficiency">Efficiency Scores</option>
                <option value="completion">Completion Rates</option>
                <option value="workload">Workload Distribution</option>
                <option value="projects">Project Assignments</option>
              </select>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Staff</p>
                    <p className="text-2xl font-bold text-purple-900">{staffStats.totalStaff}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Top Performers</p>
                    <p className="text-2xl font-bold text-green-900">{staffStats.topPerformers}</p>
                  </div>
                  <Award className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Avg Efficiency</p>
                    <p className="text-2xl font-bold text-blue-900">{staffStats.averageEfficiency.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Needs Improvement</p>
                    <p className="text-2xl font-bold text-orange-900">{staffStats.needsImprovement}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {performanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Efficiency Scores */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Staff Efficiency Scores</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="efficiency" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Workload Analysis */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Workload Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" />
                  <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Project Assignments */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Staff Allocation</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectAssignmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="staffCount" fill="#3B82F6" name="Staff Count" />
                  <Line yAxisId="right" type="monotone" dataKey="progress" stroke="#EF4444" name="Progress %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Staff Performance Table */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Individual Performance Details</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Staff Member</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Efficiency Score</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Completion Rate</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Tasks Completed</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Projects</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffPerformance.map((staff, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-gray-900">{staff.user?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{staff.user?.email || ''}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (staff.efficiencyScore || 0) >= 80 ? 'bg-green-500' :
                                  (staff.efficiencyScore || 0) >= 60 ? 'bg-blue-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, staff.efficiencyScore || 0)}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{staff.efficiencyScore || 0}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${Math.min(100, staff.completionRate || 0)}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{staff.completionRate?.toFixed(1) || 0}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-gray-900">
                          {staff.completedTasks || 0} / {staff.totalTasks || 0}
                        </td>
                        <td className="py-3 text-sm text-gray-900">
                          {staff.projects?.length || 0}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            (staff.efficiencyScore || 0) >= 80 ? 'bg-green-100 text-green-800' :
                            (staff.efficiencyScore || 0) >= 60 ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {(staff.efficiencyScore || 0) >= 80 ? 'Excellent' :
                             (staff.efficiencyScore || 0) >= 60 ? 'Good' :
                             'Needs Improvement'}
                          </span>
                        </td>
                      </tr>
                    ))}
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

export default StaffAnalysisModal
