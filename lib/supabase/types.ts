export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          username: string
          points: number
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          user_id: string
          username: string
          points?: number
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          user_id?: string
          username?: string
          points?: number
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      credit_transactions: {
        Row: {
          id: number
          user_id: string
          delta: number
          reason: string
          ref_id: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          delta: number
          reason: string
          ref_id?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          delta?: number
          reason?: string
          ref_id?: string | null
          created_at?: string
        }
      }
      generated_images: {
        Row: {
          id: string
          user_id: string
          source_image_url: string
          style: string
          status: 'queued' | 'running' | 'success' | 'failed'
          result_image_url: string | null
          credits_spent: number
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_image_url: string
          style: string
          status?: 'queued' | 'running' | 'success' | 'failed'
          result_image_url?: string | null
          credits_spent?: number
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_image_url?: string
          style?: string
          status?: 'queued' | 'running' | 'success' | 'failed'
          result_image_url?: string | null
          credits_spent?: number
          error_message?: string | null
          created_at?: string
        }
      }
      reward_tasks: {
        Row: {
          id: string
          user_id: string
          task_type: string
          proof_token: string
          is_used: boolean
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_type?: string
          proof_token: string
          is_used?: boolean
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_type?: string
          proof_token?: string
          is_used?: boolean
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_reason: string
          p_ref_id?: string | null
        }
        Returns: boolean
      }
      add_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_reason: string
          p_ref_id?: string | null
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
