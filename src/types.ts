import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Database Types
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
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: 'admin' | 'agent' | 'customer'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      tickets: {
        Row: {
          id: string
          subject: string
          description: string
          status: 'new' | 'open' | 'pending' | 'closed'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          category: TicketCategory
          requester_email: string
          assignee_id: string | null
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      comments: {
        Row: {
          id: string
          ticket_id: string
          author_id: string
          content: string
          is_internal: boolean
          is_from_email: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>>
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'leader' | 'member'
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'joined_at'>
        Update: Partial<Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'joined_at'>>
      }
    }
    Enums: {
      ticket_category: 'account_access' | 'technical_issue' | 'billing' | 'feature_request' | 'general_inquiry'
      ticket_priority: 'low' | 'normal' | 'high' | 'urgent'
      ticket_status: 'new' | 'open' | 'pending' | 'closed'
      team_member_role: 'leader' | 'member'
    }
  }
}

// Convenience Types
export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  role: 'admin' | 'agent' | 'customer'
  // Note: removed created_at and updated_at since they don't exist in our schema
}

export type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  assignee?: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    avatar_url: string | null
  } | null
}
export type Comment = Database['public']['Tables']['comments']['Row']

// Enums
export type TicketStatus = 'new' | 'open' | 'pending' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TicketCategory = 'account_access' | 'technical_issue' | 'billing' | 'feature_request' | 'general_inquiry'
export type UserRole = Profile['role']

// Extended Types
export type CommentWithAuthor = Comment & {
  profiles: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
}

export type CommentChanges = RealtimePostgresChangesPayload<{
  [key: string]: any
}>

// Legacy Message type for chat UI
export interface Message {
  id: string
  content: string
  createdAt: Date
  author: {
    name: string
    avatar: string
    isAgent: boolean
  }
}

// Team Types
export type Team = Database['public']['Tables']['teams']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type TeamMemberRole = Database['public']['Enums']['team_member_role']

// Extended Team Types
export type TeamWithMembers = Team & {
  members: (TeamMember & {
    profiles: {
      first_name: string | null
      last_name: string | null
      avatar_url: string | null
      role: UserRole
    }
  })[]
}