import crypto from 'crypto'
import { RewardProvider } from './index'
import { createServerClient } from '../supabase/server'

export class SelfHostedRewardProvider implements RewardProvider {
  private signingSecret: string

  constructor() {
    this.signingSecret = process.env.REWARD_SIGNING_SECRET!
    
    if (!this.signingSecret) {
      throw new Error('REWARD_SIGNING_SECRET is not configured')
    }
  }

  /**
   * Generate reward task proof token
   */
  async generateProof(userId: string, taskType: string): Promise<string> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // Token expires in 10 minutes
    const payload = {
      userId,
      taskType,
      expiresAt: expiresAt.toISOString(),
      nonce: crypto.randomBytes(16).toString('hex')
    }
    
    const token = this.signPayload(payload)
    
    // Store token in database
    const supabase = createServerClient()
    await supabase
      .from('reward_tasks')
      .insert({
        user_id: userId,
        task_type: taskType,
        proof_token: token,
        expires_at: expiresAt.toISOString()
      })
    
    return token
  }

  /**
   * Verify reward task proof token
   */
  async verifyProof(proof: string, userId: string): Promise<boolean> {
    try {
      // Look up token in database
      const supabase = createServerClient()
      const { data: task, error } = await supabase
        .from('reward_tasks')
        .select('*')
        .eq('proof_token', proof)
        .eq('user_id', userId)
        .eq('is_used', false)
        .single()

      if (error || !task) {
        return false
      }

      // Check if expired
      if (new Date(task.expires_at) < new Date()) {
        return false
      }

      // Verify signature
      const payload = this.parseToken(proof)
      if (!payload || !this.verifySignature(proof)) {
        return false
      }

      // Mark as used
      await supabase
        .from('reward_tasks')
        .update({ is_used: true })
        .eq('id', task.id)

      return true
    } catch (error) {
      console.error('Reward proof verification failed:', error)
      return false
    }
  }

  private signPayload(payload: any): string {
    const header = { alg: 'HS256', typ: 'JWT' }
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
    
    const signature = crypto
      .createHmac('sha256', this.signingSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url')
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  private parseToken(token: string): any {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
      return payload
    } catch {
      return null
    }
  }

  private verifySignature(token: string): boolean {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return false
      }
      
      const [header, payload, signature] = parts
      const expectedSignature = crypto
        .createHmac('sha256', this.signingSecret)
        .update(`${header}.${payload}`)
        .digest('base64url')
      
      return signature === expectedSignature
    } catch {
      return false
    }
  }
}

// Create singleton instance
export const selfHostedRewardProvider = new SelfHostedRewardProvider()
