import React from 'react'
import { motion } from 'framer-motion'
import { Menu, Bell, Settings, LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface TopNavigationProps {
  onMenuClick: () => void
  sidebarOpen: boolean
}

const TopNavigation = ({ onMenuClick, sidebarOpen }: TopNavigationProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrator',
      'manager': 'Manager',
      'employee': 'Warehouse Employee',
      'procurement': 'Procurement Staff',
      'project_manager': 'Project Manager',
      'maintenance': 'Maintenance Staff',
      'document_analyst': 'Document Analyst'
    }
    return roleMap[role] || role
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-sm border-b border-gray-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">L1</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-primary">
                LOGISTICS 1
              </h1>
              <p className="text-sm text-gray-600">
                Smart Supply Chain & Procurement Management
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </motion.button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-600">
                {getRoleDisplayName(user?.role || '')}
              </p>
            </div>
            
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </motion.button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    Account Settings
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default TopNavigation
