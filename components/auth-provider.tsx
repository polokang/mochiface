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
  const [authInitialized, setAuthInitialized] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(false)
  
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
        console.log('🔍 [认证] 开始检查会话状态')
        
        // 强制刷新会话状态
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [认证] 获取会话失败:', error)
          setAuthInitialized(true)
          setIsLoading(false)
          return
        }

        console.log('🔍 [认证] 会话状态:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          sessionExpiry: session?.expires_at
        })

        if (session?.user) {
          try {
            console.log('👤 [认证] 开始获取用户资料')
            await fetchUserProfile(session.user)
            console.log('✅ [认证] 用户资料获取成功')
          } catch (error) {
            console.error('❌ [认证] 获取用户资料失败:', error)
          }
        } else {
          console.log('ℹ️ [认证] 无有效会话')
        }
      } catch (error) {
        console.error('❌ [认证] 会话检查错误:', error)
      } finally {
        // 添加短暂延迟确保认证状态完全同步
        setTimeout(() => {
          console.log('⏰ [认证] 认证初始化完成')
          setAuthInitialized(true)
          setIsLoading(false)
        }, 200)
      }
    }

    getSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔄 [认证] 状态变化:', { 
          event, 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        })
        
        if (session?.user) {
          try {
            console.log('👤 [认证] 状态变化：开始获取用户资料')
            await fetchUserProfile(session.user)
            console.log('✅ [认证] 状态变化：用户资料获取完成')
            setAuthInitialized(true)
            setIsLoading(false)
          } catch (error) {
            console.error('❌ [认证] 状态变化时获取用户资料失败:', error)
            setAuthInitialized(true)
            setIsLoading(false)
          }
        } else {
          console.log('🚪 [认证] 用户登出或会话失效')
          setUser(null)
          setAuthInitialized(true)
          setIsLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    if (!supabase) {
      console.error('❌ [认证] Supabase client not initialized')
      return
    }

    // 防止重复调用
    if (fetchingProfile) {
      console.log('ℹ️ [认证] 正在获取用户资料，跳过重复调用')
      return
    }

    if (user && user.id === supabaseUser.id) {
      console.log('ℹ️ [认证] 用户资料已存在，跳过重复查询')
      return
    }

    setFetchingProfile(true)

    try {
      console.log('🔍 [认证] 开始设置用户数据，用户ID:', supabaseUser.id)
      
      // 直接创建用户数据，不进行任何数据库查询
      const userData: User = {
        id: supabaseUser.id,
        username: supabaseUser.email?.split('@')[0] || 'user',
        email: supabaseUser.email || '',
        credits: 3,
        full_name: supabaseUser.user_metadata?.full_name,
        avatar_url: supabaseUser.user_metadata?.avatar_url
      }
      
      console.log('👤 [认证] 设置用户数据:', userData)
      setUser(userData)
      console.log('✅ [认证] 用户数据设置完成')
      
    } catch (error) {
      console.error('❌ [认证] fetchUserProfile异常:', error)
      
      // 异常情况下也设置默认数据
      const userData: User = {
        id: supabaseUser.id,
        username: supabaseUser.email?.split('@')[0] || 'user',
        email: supabaseUser.email || '',
        credits: 3,
        full_name: supabaseUser.user_metadata?.full_name,
        avatar_url: supabaseUser.user_metadata?.avatar_url
      }
      setUser(userData)
      console.log('⚠️ [认证] 异常情况下设置默认用户数据')
      
    } finally {
      setFetchingProfile(false)
      console.log('🧹 [认证] 重置fetchingProfile状态')
    }
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
      console.log('🚪 [认证] 开始登出')
      await supabase.auth.signOut()
      console.log('✅ [认证] 登出成功')
    } catch (error) {
      console.error('❌ [认证] 登出失败:', error)
    } finally {
      // 无论登出是否成功，都清除本地用户状态
      setUser(null)
      console.log('🧹 [认证] 清除本地用户状态')
    }
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      console.error('❌ Supabase client not initialized, cannot sign in')
      throw new Error('Supabase client not initialized')
    }

    try {
      // 使用环境变量中的站点URL，确保在生产环境中使用正确的域名
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const redirectUrl = `${siteUrl}/auth/callback`
      
      console.log('🔗 Google SSO 重定向URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
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
