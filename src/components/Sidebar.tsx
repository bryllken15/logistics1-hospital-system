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

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth()

  const getMenuItems = () => {
    if (!user) return []

    const baseItems = [
      { icon: Home, label: 'Dashboard', href: '/dashboard', roles: ['all'] },
      { icon: BarChart3, label: 'Analytics', href: '/analytics', roles: ['all'] },
      { icon: Settings, label: 'Hospital Settings', href: '/settings', roles: ['admin', 'manager'] }
    ]

    const roleSpecificItems = {
      admin: [
        { icon: Users, label: 'User Management', href: '/users', roles: ['admin'] },
        { icon: BarChart3, label: 'System Reports', href: '/reports', roles: ['admin'] },
        { icon: Settings, label: 'System Settings', href: '/settings', roles: ['admin'] }
      ],
      manager: [
        { icon: BarChart3, label: 'Analytics', href: '/analytics', roles: ['manager'] },
        { icon: ClipboardList, label: 'Approvals', href: '/approvals', roles: ['manager'] }
      ],
      employee: [
        { icon: Package, label: 'Smart Warehousing', href: '/warehouse', roles: ['employee'] },
        { icon: BarChart3, label: 'Inventory Reports', href: '/inventory-reports', roles: ['employee'] }
      ],
      procurement: [
        { icon: ShoppingCart, label: 'Procurement & Sourcing', href: '/procurement', roles: ['procurement'] },
        { icon: Package, label: 'Purchase Orders', href: '/purchase-orders', roles: ['procurement'] },
        { icon: BarChart3, label: 'Supplier Analytics', href: '/supplier-analytics', roles: ['procurement'] }
      ],
      project_manager: [
        { icon: ClipboardList, label: 'Project Logistics Tracker', href: '/project-tracker', roles: ['project_manager'] },
        { icon: BarChart3, label: 'Project Reports', href: '/project-reports', roles: ['project_manager'] }
      ],
      maintenance: [
        { icon: Wrench, label: 'Asset Lifecycle & Maintenance', href: '/maintenance', roles: ['maintenance'] },
        { icon: BarChart3, label: 'Maintenance Reports', href: '/maintenance-reports', roles: ['maintenance'] }
      ],
      document_analyst: [
        { icon: FileText, label: 'Document Tracking & Records', href: '/documents', roles: ['document_analyst'] },
        { icon: BarChart3, label: 'Document Reports', href: '/document-reports', roles: ['document_analyst'] }
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
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">L1</span>
              </div>
              <span className="font-semibold text-primary">LOGISTICS 1</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => (
              <motion.a
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </motion.a>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2025 Logistics 1
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar
