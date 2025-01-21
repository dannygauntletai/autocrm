import { useState } from 'react'
import { ticketService } from '../../services/ticket.service'
import type { Ticket, TicketPriority } from '../../types'

interface TicketPrioritySelectProps {
  ticket: Ticket
  onUpdate: (ticket: Ticket) => void
}

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]

export function TicketPrioritySelect({ ticket, onUpdate }: TicketPrioritySelectProps) {
  const [loading, setLoading] = useState(false)

  const handlePriorityChange = async (priority: TicketPriority) => {
    setLoading(true)
    try {
      const updatedTicket = await ticketService.updateTicket(ticket.id, { priority })
      onUpdate(updatedTicket)
    } catch (err) {
      console.error('Failed to update ticket priority:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      value={ticket.priority}
      onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
      disabled={loading}
      className={`rounded-md border-gray-300 shadow-sm text-sm
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${ticket.priority === 'urgent' ? 'bg-red-50 text-red-800' : 
          ticket.priority === 'high' ? 'bg-orange-50 text-orange-800' : 
          ticket.priority === 'normal' ? 'bg-blue-50 text-blue-800' : 
          'bg-gray-50 text-gray-800'
        }
      `}
    >
      {priorityOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
} 