
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'employee' | 'procurement' | 'project_manager' | 'maintenance' | 'document_analyst'
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
      // First, authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: username, // Assuming username is email
        password: password
      })

      if (authError) {
        toast.error('Invalid username or password')
        setLoading(false)
        return false
      }

      // Then fetch user profile from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', username)
        .single()

      if (userError || !userData) {
        toast.error('User not found in system')
        await supabase.auth.signOut()
        setLoading(false)
        return false
      }

      if (!userData.is_authorized) {
        toast.error('Account not authorized. Please contact administrator.')
        await supabase.auth.signOut()
        setLoading(false)
        return false
      }

      setUser({
        ...userData,
        supabaseUser: authData.user
      })
      setSession(authData.session)
      
      toast.success(`Welcome back, ${userData.full_name}!`)
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
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
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
