import { supabase, publicClient } from '../utils/supabase'
import { emailService } from './email.service'
import type { Database, CommentWithAuthor, TicketStatus } from '../types'

type NewTicket = Database['public']['Tables']['tickets']['Insert']
type TicketUpdate = Database['public']['Tables']['tickets']['Update']

export const ticketService = {
  async createTicket(ticket: NewTicket) {
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticket)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getTickets() {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        assignee:profiles(
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateTicket(id: string, update: TicketUpdate) {
    const { data, error } = await supabase
      .from('tickets')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getTicketComments(ticketId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(first_name, last_name, avatar_url)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  async createPublicTicket(params: {
    email: string
    subject: string
    description: string
    category: string
    priority: string
  }) {
    const { data, error } = await publicClient
      .from('tickets')
      .insert({
        subject: params.subject,
        description: params.description,
        category: params.category,
        priority: params.priority,
        status: 'new',
        requester_email: params.email,
        assignee_id: null,
        team_id: null
      })
      .select()
      .single()
    
    if (error) throw error

    // Send confirmation email
    await emailService.sendTicketConfirmation({
      to: params.email,
      ticketId: data.id,
      subject: params.subject,
      description: params.description
    })

    return data
  },

  async addComment(ticketId: string, content: string, isInternal = false) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get ticket details first to get requester email
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('subject, requester_email')
      .eq('id', ticketId)
      .single()
    
    if (ticketError) throw ticketError

    const { data, error } = await supabase
      .from('comments')
      .insert({
        ticket_id: ticketId,
        author_id: user.id,
        content,
        is_internal: isInternal
      })
      .select()
      .single()
    
    if (error) throw error

    // If it's not an internal note and there's a requester email, send notification
    if (!isInternal && ticket.requester_email) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      if (!profile) throw new Error('Profile not found')

      await emailService.sendTicketResponse({
        to: ticket.requester_email,
        ticketId,
        subject: ticket.subject,
        response: content,
        responderName: `${profile.first_name} ${profile.last_name}`
      })
    }

    return data
  },

  async getTicketComment(commentId: string): Promise<CommentWithAuthor> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('id', commentId)
      .single()

    if (error) throw error
    return data
  },

  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async assignToTeam(ticketId: string, teamId: string | null) {
    const { data, error } = await supabase
      .from('tickets')
      .update({ team_id: teamId })
      .eq('id', ticketId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getTeamTickets(teamId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getAssignedTickets() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('assignee_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },
} 