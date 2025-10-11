import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useLegacyRealtimeUpdates } from '../hooks/useRealtimeUpdates'
import TopNavigation from '../components/TopNavigation'
import AdminDashboard from '../components/dashboards/AdminDashboard'
import ManagerDashboard from '../components/dashboards/ManagerDashboard'
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard'
import ProcurementDashboard from '../components/dashboards/ProcurementDashboard'
import ProjectManagerDashboard from '../components/dashboards/ProjectManagerDashboard'
import MaintenanceDashboard from '../components/dashboards/EnhancedMaintenanceDashboard'
import DocumentAnalystDashboard from '../components/dashboards/EnhancedDocumentAnalystDashboard'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import HospitalSettings from '../components/HospitalSettings'
import { 
  Home, 
  Users, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Wrench, 
  FileText,
  BarChart3,
  Settings
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState('dashboard')
  
  // Initialize real-time updates
  const { isConnected, lastUpdate } = useLegacyRealtimeUpdates()

  const handleViewChange = (view: string) => {
    setCurrentView(view)
  }

  const getMenuItems = () => {
    if (!user) return []

    const baseItems = [
      { icon: Home, label: 'Dashboard', view: 'dashboard', roles: ['all'] },
      { icon: BarChart3, label: 'Analytics', view: 'analytics', roles: ['all'] },
      { icon: Settings, label: 'Settings', view: 'settings', roles: ['admin', 'manager'] }
    ]

    const roleSpecificItems = {
      admin: [
        { icon: Users, label: 'Users', view: 'users', roles: ['admin'] },
        { icon: BarChart3, label: 'Reports', view: 'reports', roles: ['admin'] }
      ],
      manager: [
        { icon: ClipboardList, label: 'Approvals', view: 'approvals', roles: ['manager'] }
      ],
      employee: [
        { icon: Package, label: 'Warehouse', view: 'warehouse', roles: ['employee'] },
        { icon: BarChart3, label: 'Inventory', view: 'inventory-reports', roles: ['employee'] }
      ],
      procurement: [
        { icon: ShoppingCart, label: 'Procurement', view: 'procurement', roles: ['procurement'] },
        { icon: Package, label: 'Orders', view: 'purchase-orders', roles: ['procurement'] },
        { icon: BarChart3, label: 'Suppliers', view: 'supplier-analytics', roles: ['procurement'] }
      ],
      project_manager: [
        { icon: ClipboardList, label: 'Projects', view: 'project-tracker', roles: ['project_manager'] },
        { icon: BarChart3, label: 'Reports', view: 'project-reports', roles: ['project_manager'] }
      ],
      maintenance: [
        { icon: Wrench, label: 'Maintenance', view: 'maintenance', roles: ['maintenance'] },
        { icon: BarChart3, label: 'Reports', view: 'maintenance-reports', roles: ['maintenance'] }
      ],
      document_analyst: [
        { icon: FileText, label: 'Documents', view: 'documents', roles: ['document_analyst'] },
        { icon: BarChart3, label: 'Reports', view: 'document-reports', roles: ['document_analyst'] }
      ]
    }

    const allItems = [...baseItems, ...(roleSpecificItems[user.role] || [])]
    return allItems.filter(item => 
      item.roles.includes('all') || item.roles.includes(user.role)
    )
  }

  const renderDashboard = () => {
    if (!user) {
      return <div className="p-4 text-center">Loading...</div>
    }

    // Handle different views
    if (currentView === 'analytics') {
      return <AnalyticsDashboard />
    }
    
    if (currentView === 'settings') {
      return <HospitalSettings />
    }

    // Role-specific views
    if (user.role === 'admin') {
      switch (currentView) {
        case 'users':
          return <AdminDashboard />
        case 'reports':
          return <AnalyticsDashboard />
        default:
          return <AdminDashboard />
      }
    }

    if (user.role === 'manager') {
      switch (currentView) {
        case 'approvals':
          return <ManagerDashboard />
        default:
          return <ManagerDashboard />
      }
    }

    if (user.role === 'employee') {
      switch (currentView) {
        case 'warehouse':
          return <EmployeeDashboard />
        case 'inventory-reports':
          return <AnalyticsDashboard />
        default:
          return <EmployeeDashboard />
      }
    }

    if (user.role === 'procurement') {
      switch (currentView) {
        case 'procurement':
          return <ProcurementDashboard />
        case 'purchase-orders':
          return <ProcurementDashboard />
        case 'supplier-analytics':
          return <AnalyticsDashboard />
        default:
          return <ProcurementDashboard />
      }
    }

    if (user.role === 'project_manager') {
      switch (currentView) {
        case 'project-tracker':
          return <ProjectManagerDashboard />
        case 'project-reports':
          return <AnalyticsDashboard />
        default:
          return <ProjectManagerDashboard />
      }
    }

    if (user.role === 'maintenance') {
      switch (currentView) {
        case 'maintenance':
          return <MaintenanceDashboard />
        case 'maintenance-reports':
          return <AnalyticsDashboard />
        default:
          return <MaintenanceDashboard />
      }
    }

    if (user.role === 'document_analyst') {
      switch (currentView) {
        case 'documents':
          return <DocumentAnalystDashboard />
        case 'document-reports':
          return <AnalyticsDashboard />
        default:
          return <DocumentAnalystDashboard />
      }
    }

    // Fallback for unknown roles
    return <div className="p-4 text-center text-red-500">Unknown role: {user.role}</div>
  }

  const menuItems = getMenuItems()

  // Add error boundary for debugging
  try {
    return (
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <TopNavigation 
          onMenuClick={() => {}} // No longer needed
          sidebarOpen={false}
          onViewChange={handleViewChange}
        />

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 min-h-screen pb-20" // Add bottom padding for bottom nav
        >
          <div className="p-4 lg:p-6">
            {renderDashboard()}
          </div>
        </motion.main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
          <div className="flex justify-around">
            {menuItems.slice(0, 5).map((item) => (
              <button
                key={item.view}
                onClick={() => handleViewChange(item.view)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                  currentView === item.view
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard render error:', error)
    return (
      <div className="min-h-screen bg-red-100 p-8">
        <h1 className="text-2xl font-bold text-red-800 mb-4">Dashboard Error</h1>
        <p className="text-red-600 mb-4">There was an error rendering the dashboard:</p>
        <pre className="bg-red-50 p-4 rounded text-sm overflow-auto">
          {error.toString()}
        </pre>
        <div className="mt-4">
          <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'No user'}</p>
        </div>
      </div>
    )
  }
}

export default Dashboard
