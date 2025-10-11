import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Users, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Wrench, 
  FileText,
  BarChart3,
  Settings,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onViewChange?: (view: string) => void
}

const Sidebar = ({ isOpen, onClose, onViewChange }: SidebarProps) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const getMenuItems = () => {
    if (!user) return []

    const baseItems = [
      { icon: Home, label: 'Dashboard', view: 'dashboard', roles: ['all'] },
      { icon: BarChart3, label: 'Analytics', view: 'analytics', roles: ['all'] },
      { icon: Settings, label: 'Hospital Settings', view: 'settings', roles: ['admin', 'manager'] }
    ]

    const roleSpecificItems = {
      admin: [
        { icon: Users, label: 'User Management', view: 'users', roles: ['admin'] },
        { icon: BarChart3, label: 'System Reports', view: 'reports', roles: ['admin'] }
      ],
      manager: [
        { icon: ClipboardList, label: 'Approvals', view: 'approvals', roles: ['manager'] }
      ],
      employee: [
        { icon: Package, label: 'Smart Warehousing', view: 'warehouse', roles: ['employee'] },
        { icon: BarChart3, label: 'Inventory Reports', view: 'inventory-reports', roles: ['employee'] }
      ],
      procurement: [
        { icon: ShoppingCart, label: 'Procurement & Sourcing', view: 'procurement', roles: ['procurement'] },
        { icon: Package, label: 'Purchase Orders', view: 'purchase-orders', roles: ['procurement'] },
        { icon: BarChart3, label: 'Supplier Analytics', view: 'supplier-analytics', roles: ['procurement'] }
      ],
      project_manager: [
        { icon: ClipboardList, label: 'Project Logistics Tracker', view: 'project-tracker', roles: ['project_manager'] },
        { icon: BarChart3, label: 'Project Reports', view: 'project-reports', roles: ['project_manager'] }
      ],
      maintenance: [
        { icon: Wrench, label: 'Asset Lifecycle & Maintenance', view: 'maintenance', roles: ['maintenance'] },
        { icon: BarChart3, label: 'Maintenance Reports', view: 'maintenance-reports', roles: ['maintenance'] }
      ],
      document_analyst: [
        { icon: FileText, label: 'Document Tracking & Records', view: 'documents', roles: ['document_analyst'] },
        { icon: BarChart3, label: 'Document Reports', view: 'document-reports', roles: ['document_analyst'] }
      ]
    }

    const allItems = [...baseItems, ...(roleSpecificItems[user.role] || [])]
    return allItems.filter(item => 
      item.roles.includes('all') || item.roles.includes(user.role)
    )
  }

  const menuItems = getMenuItems()

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50 lg:translate-x-0 lg:static lg:w-64 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">L1</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-primary text-lg">LOGISTICS 1</span>
                <span className="text-xs text-gray-500">Hospital System</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.view}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  // Handle navigation
                  if (onViewChange) {
                    onViewChange(item.view)
                  }
                  // Close sidebar on mobile when item is clicked
                  if (window.innerWidth < 1024) {
                    onClose()
                  }
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-200 group active:bg-primary/20 text-left"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm lg:text-base">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2025 Logistics 1
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              Smart Supply Chain Management
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar
