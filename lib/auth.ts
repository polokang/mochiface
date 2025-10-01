import { createServerClient } from './supabase/server'
import { redirect } from 'next/navigation'
import { Database } from './supabase/types'

export type User = Database['public']['Tables']['profiles']['Row']

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (profileError || !profile) {
    return null
  }
  
  return profile
}

/**
 * 要求用户登录，未登录则重定向到登录页
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

/**
 * 更新用户最后登录时间
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = createServerClient()
  
  await supabase
    .from('profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('user_id', userId)
}

/**
 * 检查用户名是否可用
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()
    
    // 如果没有错误且没有数据，说明用户名可用
    if (!error && !data) {
      return true
    }
    
    // 如果有错误且是"未找到"错误，说明用户名可用
    if (error && error.code === 'PGRST116') {
      return true
    }
    
    // 如果有数据，说明用户名已被使用
    if (data) {
      return false
    }
    
    // 其他错误情况，返回 false 以安全起见
    console.error('Username check error:', error)
    return false
  } catch (error) {
    console.error('Username availability check failed:', error)
    return false
  }
}