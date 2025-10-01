import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// 客户端 Supabase 客户端
export const createClientComponent = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// 服务端 Supabase 客户端（使用服务角色密钥）
export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey)
}
