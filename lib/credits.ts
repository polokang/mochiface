import { createServerClient } from './supabase/server'
import { Database } from './supabase/types'

export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row']

/**
 * 获取用户当前积分
 */
export async function getMyCredits(userId: string): Promise<number> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('points')
    .eq('user_id', userId)
    .single()
  
  if (error || !data) {
    throw new Error('Failed to get user credits')
  }
  
  return data.points
}

/**
 * 增加积分
 */
export async function addCredits(
  userId: string, 
  delta: number, 
  reason: string, 
  refId?: string
): Promise<void> {
  const supabase = createServerClient()
  
  const { error } = await supabase.rpc('add_credits', {
    p_user_id: userId,
    p_amount: delta,
    p_reason: reason,
    p_ref_id: refId || null
  })
  
  if (error) {
    throw new Error(`Failed to add credits: ${error.message}`)
  }
}

/**
 * 扣减积分
 */
export async function deductCredits(
  userId: string, 
  delta: number, 
  reason: string, 
  refId?: string
): Promise<boolean> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: delta,
    p_reason: reason,
    p_ref_id: refId || null
  })
  
  if (error) {
    throw new Error(`Failed to deduct credits: ${error.message}`)
  }
  
  return data
}

/**
 * 获取用户积分流水
 */
export async function getCreditTransactions(
  userId: string, 
  limit: number = 50
): Promise<CreditTransaction[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    throw new Error(`Failed to get credit transactions: ${error.message}`)
  }
  
  return data || []
}

/**
 * 检查用户是否有足够积分
 */
export async function hasEnoughCredits(userId: string, required: number): Promise<boolean> {
  const currentCredits = await getMyCredits(userId)
  return currentCredits >= required
}
