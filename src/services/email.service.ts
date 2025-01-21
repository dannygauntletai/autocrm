import { supabase } from '../utils/supabase'

export const emailService = {
  async sendTicketConfirmation(params: {
    to: string
    ticketId: string
    subject: string
    description: string
  }) {
    try {
      console.log('Sending ticket confirmation email:', params)
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.to,
          template: 'ticket-confirmation',
          data: {
            ticketId: params.ticketId,
            subject: params.subject,
            description: params.description
          }
        }
      })
      
      if (error) {
        console.error('Failed to send confirmation email:', error)
        throw error
      }

      console.log('Confirmation email sent successfully:', data)
      return data
    } catch (error) {
      console.error('Error in sendTicketConfirmation:', error)
      throw error
    }
  },

  async sendTicketResponse(params: {
    to: string
    ticketId: string
    subject: string
    response: string
    responderName: string
  }) {
    try {
      console.log('Sending ticket response email:', params)

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.to,
          template: 'ticket-response',
          data: {
            ticketId: params.ticketId,
            subject: params.subject,
            response: params.response,
            responderName: params.responderName
          }
        }
      })
      
      if (error) {
        console.error('Failed to send response email:', error)
        throw error
      }

      console.log('Response email sent successfully:', data)
      return data
    } catch (error) {
      console.error('Error in sendTicketResponse:', error)
      throw error
    }
  }
} 