export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: 'admin' | 'agent' | 'customer'
          avatar_url: string | null
          settings: Json | null
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role: 'admin' | 'agent' | 'customer'
          avatar_url?: string | null
          settings?: Json | null
        }
        Update: {
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: 'admin' | 'agent' | 'customer'
          avatar_url?: string | null
          settings?: Json | null
        }
      }
    }
  }
} 