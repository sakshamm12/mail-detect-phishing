import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      analysis_history: {
        Row: {
          id: string
          user_id: string
          type: 'email' | 'url'
          input: string
          result: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'email' | 'url'
          input: string
          result: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'email' | 'url'
          input?: string
          result?: any
          created_at?: string
        }
      }
    }
  }
}