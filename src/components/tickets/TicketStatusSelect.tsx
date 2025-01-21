import { useState } from 'react'
import { ticketService } from '../../services/ticket.service'
import type { Ticket, TicketStatus } from '../../types'

interface TicketStatusSelectProps {
  ticket: Ticket
  onUpdate: (ticket: Ticket) => void
}

const statusConfig = {
  new: { label: 'New', color: 'bg-purple-100 text-purple-800' },
  open: { label: 'Open', color: 'bg-yellow-100 text-yellow-800' },
  pending: { label: 'Pending', color: 'bg-blue-100 text-blue-800' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' }
} as const

// Add a helper function to get status config with fallback
const getStatusConfig = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };
}

export function TicketStatusSelect({ ticket, onUpdate }: TicketStatusSelectProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (status: TicketStatus) => {
    setLoading(true)
    try {
      const updatedTicket = await ticketService.updateTicket(ticket.id, { status })
      onUpdate(updatedTicket)
    } catch (err) {
      console.error('Failed to update ticket status:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Status:</span>
      <select
        value={ticket.status}
        onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
        disabled={loading}
        className={`rounded-md border-gray-300 shadow-sm text-sm font-medium ${
          loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${getStatusConfig(ticket.status).color}`}
      >
        <option value="new">New</option>
        <option value="open">Open</option>
        <option value="pending">Pending</option>
        <option value="closed">Closed</option>
      </select>
    </div>
  )
} 