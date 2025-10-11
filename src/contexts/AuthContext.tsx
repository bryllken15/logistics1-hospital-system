import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { authService } from '../services/database'

export interface User {
  id: string
  username: string
  role: 'admin' | 'manager' | 'employee' | 'procurement' | 'project_manager' | 'maintenance' | 'document_analyst'
  full_name: string
  is_authorized: boolean
  supabaseUser?: SupabaseUser
}

interface AuthContextType {
  user: User | null
  session: Session | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        // Fallback to localStorage for backward compatibility
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
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      setSession(session)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        setLoading(false)
        return
      }

      if (data) {
        setUser({
          ...data,
          supabaseUser: session?.user
        })
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true)
    
    try {
      // Use custom authentication directly (skip Supabase Auth)
      console.log('Using custom authentication...')
      const result = await authService.authenticate(username, password)
      
      if (!result) {
        toast.error('Invalid username or password')
        setLoading(false)
        return false
      }
      
      const user = result // authenticate_user returns a single object (not array)
      
      // Map the returned fields to expected format
      const mappedUser = {
        id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department: user.department,
        is_authorized: true, // Assume authorized if function returns data
        is_active: true
      }
      
      setUser(mappedUser as any)
      localStorage.setItem('logistics1_user', JSON.stringify(mappedUser))
      toast.success(`Welcome back, ${mappedUser.full_name}!`)
      setLoading(false)
      return true
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
      setLoading(false)
      return false
    }
  }

  const logout = async () => {
    // Sign out from Supabase Auth
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    localStorage.removeItem('logistics1_user')
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, session, login, logout, loading }}>
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
