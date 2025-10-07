import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates'
import Sidebar from '../components/Sidebar'
import TopNavigation from '../components/TopNavigation'
import AdminDashboard from '../components/dashboards/AdminDashboard'
import ManagerDashboard from '../components/dashboards/ManagerDashboard'
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard'
import ProcurementDashboard from '../components/dashboards/ProcurementDashboard'
import ProjectManagerDashboard from '../components/dashboards/ProjectManagerDashboard'
import MaintenanceDashboard from '../components/dashboards/MaintenanceDashboard'
import DocumentAnalystDashboard from '../components/dashboards/DocumentAnalystDashboard'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import HospitalSettings from '../components/HospitalSettings'
import MobileDashboard from '../components/MobileDashboard'

const Dashboard = () => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [isMobile, setIsMobile] = useState(false)
  
  // Initialize real-time updates
  const { isConnected, lastUpdate } = useRealtimeUpdates()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const renderDashboard = () => {
    if (!user) return null

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

    // Role-based dashboards
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />
      case 'manager':
        return <ManagerDashboard />
      case 'employee':
        return <EmployeeDashboard />
      case 'procurement':
        return <ProcurementDashboard />
      case 'project_manager':
        return <ProjectManagerDashboard />
      case 'maintenance':
        return <MaintenanceDashboard />
      case 'document_analyst':
        return <DocumentAnalystDashboard />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavigation 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
          }`}
        >
          <div className="p-6">
            {renderDashboard()}
          </div>
        </motion.main>
      </div>
    </div>
  )
}

export default Dashboard
