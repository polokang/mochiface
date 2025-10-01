import { createServerClient } from './supabase/server'
import { createServiceClient } from './supabase/client'
import { redirect } from 'next/navigation'
import { Database } from './supabase/types'

export type User = Database['public']['Tables']['profiles']['Row']

/**
 * Get current user information
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
 * Require user to be logged in, redirect to login page if not
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

/**
 * Update user's last login time
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = createServerClient()
  
  await supabase
    .from('profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('user_id', userId)
}

/**
 * Check if username is available (for API routes, no cookies needed)
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()
    
    // If no error and no data, username is available
    if (!error && !data) {
      return true
    }
    
    // If error is "not found", username is available
    if (error && error.code === 'PGRST116') {
      return true
    }
    
    // If data exists, username is already taken
    if (data) {
      return false
    }
    
    // For other errors, return false for safety
    console.error('Username check error:', error)
    return false
  } catch (error) {
    console.error('Username availability check failed:', error)
    return false
  }
}