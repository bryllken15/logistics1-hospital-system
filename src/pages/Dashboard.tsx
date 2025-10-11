import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useLegacyRealtimeUpdates } from '../hooks/useRealtimeUpdates'
import Sidebar from '../components/Sidebar'
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
import MobileDashboard from '../components/MobileDashboard'

const Dashboard = () => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [isMobile, setIsMobile] = useState(false)
  
  // Initialize real-time updates
  const { isConnected, lastUpdate } = useLegacyRealtimeUpdates()


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleViewChange = (view: string) => {
    setCurrentView(view)
  }

  const renderDashboard = () => {
    if (!user) {
      return <div className="p-4 text-center">Loading...</div>
    }

    // Show mobile dashboard on mobile devices
    if (isMobile) {
      return <MobileDashboard />
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
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">User Management</h2><p>User management functionality coming soon...</p></div>
        case 'reports':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">System Reports</h2><p>System reports functionality coming soon...</p></div>
        default:
          return <AdminDashboard />
      }
    }

    if (user.role === 'manager') {
      switch (currentView) {
        case 'approvals':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Approvals</h2><p>Approvals functionality coming soon...</p></div>
        default:
          return <ManagerDashboard />
      }
    }

    if (user.role === 'employee') {
      switch (currentView) {
        case 'warehouse':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Smart Warehousing</h2><p>Warehouse functionality coming soon...</p></div>
        case 'inventory-reports':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Inventory Reports</h2><p>Inventory reports functionality coming soon...</p></div>
        default:
          return <EmployeeDashboard />
      }
    }

    if (user.role === 'procurement') {
      switch (currentView) {
        case 'procurement':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Procurement & Sourcing</h2><p>Procurement functionality coming soon...</p></div>
        case 'purchase-orders':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Purchase Orders</h2><p>Purchase orders functionality coming soon...</p></div>
        case 'supplier-analytics':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Supplier Analytics</h2><p>Supplier analytics functionality coming soon...</p></div>
        default:
          return <ProcurementDashboard />
      }
    }

    if (user.role === 'project_manager') {
      switch (currentView) {
        case 'project-tracker':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Project Logistics Tracker</h2><p>Project tracker functionality coming soon...</p></div>
        case 'project-reports':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Project Reports</h2><p>Project reports functionality coming soon...</p></div>
        default:
          return <ProjectManagerDashboard />
      }
    }

    if (user.role === 'maintenance') {
      switch (currentView) {
        case 'maintenance':
          return <MaintenanceDashboard />
        case 'maintenance-reports':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Maintenance Reports</h2><p>Maintenance reports functionality coming soon...</p></div>
        default:
          return <MaintenanceDashboard />
      }
    }

    if (user.role === 'document_analyst') {
      switch (currentView) {
        case 'documents':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Document Tracking & Records</h2><p>Document tracking functionality coming soon...</p></div>
        case 'document-reports':
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Document Reports</h2><p>Document reports functionality coming soon...</p></div>
        default:
          return <DocumentAnalystDashboard />
      }
    }

    // Fallback for unknown roles
    return <div className="p-4 text-center text-red-500">Unknown role: {user.role}</div>
  }

  // Add error boundary for debugging
  try {
    return (
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <TopNavigation 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onViewChange={handleViewChange}
        />

        <div className="flex">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onViewChange={handleViewChange}
          />

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`flex-1 transition-all duration-300 min-h-screen ${
              sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
            }`}
          >
            <div className="p-4 lg:p-6">
              {renderDashboard()}
            </div>
          </motion.main>
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
