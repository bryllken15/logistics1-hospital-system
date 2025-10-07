import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'

export interface User {
  id: string
  username: string
  role: 'admin' | 'manager' | 'employee' | 'procurement' | 'project_manager' | 'maintenance' | 'document_analyst'
  email: string
  fullName: string
  isAuthorized: boolean
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user database
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    email: 'admin@logistics1.com',
    fullName: 'System Administrator',
    isAuthorized: true
  },
  {
    id: '2',
    username: 'manager1',
    role: 'manager',
    email: 'manager@logistics1.com',
    fullName: 'Operations Manager',
    isAuthorized: true
  },
  {
    id: '3',
    username: 'employee1',
    role: 'employee',
    email: 'employee@logistics1.com',
    fullName: 'Warehouse Employee',
    isAuthorized: true
  },
  {
    id: '4',
    username: 'procurement1',
    role: 'procurement',
    email: 'procurement@logistics1.com',
    fullName: 'Procurement Specialist',
    isAuthorized: true
  },
  {
    id: '5',
    username: 'project1',
    role: 'project_manager',
    email: 'project@logistics1.com',
    fullName: 'Project Manager',
    isAuthorized: true
  },
  {
    id: '6',
    username: 'maintenance1',
    role: 'maintenance',
    email: 'maintenance@logistics1.com',
    fullName: 'Maintenance Technician',
    isAuthorized: true
  },
  {
    id: '7',
    username: 'document1',
    role: 'document_analyst',
    email: 'document@logistics1.com',
    fullName: 'Document Analyst',
    isAuthorized: true
  }
]

const mockPasswords: Record<string, string> = {
  'admin': 'admin123',
  'manager1': 'manager123',
  'employee1': 'employee123',
  'procurement1': 'procurement123',
  'project1': 'project123',
  'maintenance1': 'maintenance123',
  'document1': 'document123'
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('logistics1_user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem('logistics1_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user = mockUsers.find(u => u.username === username)
      const correctPassword = mockPasswords[username]
      
      if (!user || password !== correctPassword) {
        toast.error('Invalid username or password')
        setLoading(false)
        return false
      }
      
      if (!user.isAuthorized) {
        toast.error('Account not authorized. Please contact administrator.')
        setLoading(false)
        return false
      }
      
      setUser(user)
      localStorage.setItem('logistics1_user', JSON.stringify(user))
      toast.success(`Welcome back, ${user.fullName}!`)
      setLoading(false)
      return true
    } catch (error) {
      toast.error('Login failed. Please try again.')
      setLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('logistics1_user')
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
