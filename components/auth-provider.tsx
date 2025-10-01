'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClientComponent } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  username: string
  email: string
  credits: number
  full_name?: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  credits: number
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setIsLoading] = useState(true)
  const [supabaseError, setSupabaseError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)
  
  // Safely create Supabase client
  useEffect(() => {
    try {
      const client = createClientComponent()
      setSupabase(client)
    } catch (error) {
      console.error('Supabase client initialization failed:', error)
      setSupabaseError(error instanceof Error ? error.message : 'Unknown error')
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    // Get current session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          try {
            await fetchUserProfile(session.user)
          } catch (error) {
            console.error('Error fetching user profile:', error)
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (session?.user) {
          try {
            await fetchUserProfile(session.user)
            setIsLoading(false)
          } catch (error) {
            console.error('Error fetching user profile:', error)
            setIsLoading(false)
          }
        } else {
          setUser(null)
          setIsLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    // Create user data directly, not relying on database query
    const userData: User = {
      id: supabaseUser.id,
      username: supabaseUser.email?.split('@')[0] || 'user',
      email: supabaseUser.email || '',
      credits: 3, // Give new users 3 credits
      full_name: supabaseUser.user_metadata?.full_name,
      avatar_url: supabaseUser.user_metadata?.avatar_url
    }
    
    setUser(userData)
  }

  const login = (token: string, userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    if (!supabase) {
      console.error('❌ Supabase client not initialized, cannot sign out')
      setUser(null)
      return
    }

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
    setUser(null)
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      console.error('❌ Supabase client not initialized, cannot sign in')
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Google sign in error:', error)
        throw error
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const credits = user?.credits || 0


  return (
    <AuthContext.Provider value={{ user, credits, login, logout, loading, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
