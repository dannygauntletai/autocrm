import { useState, useEffect } from 'react'
import { ticketService } from '../../services/ticket.service'
import { profileService } from '../../services/profile.service'
import type { Ticket, Profile } from '../../types'

interface TicketAssigneeSelectProps {
  ticket: Ticket
  onUpdate: (ticket: Ticket) => void
}

export function TicketAssigneeSelect({ ticket, onUpdate }: TicketAssigneeSelectProps) {
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState<Profile[]>([])

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const users = await profileService.listUsers()
        // Filter to only show agents and admins
        setAgents(users.filter(user => ['agent', 'admin'].includes(user.role)))
      } catch (err) {
        console.error('Failed to fetch agents:', err)
      }
    }
    fetchAgents()
  }, [])

  const handleAssigneeChange = async (userId: string | null) => {
    setLoading(true)
    try {
      const updatedTicket = await ticketService.updateTicket(ticket.id, {
        assignee_id: userId
      })
      onUpdate(updatedTicket)
    } catch (err) {
      console.error('Failed to update ticket assignee:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      value={ticket.assignee_id || ''}
      onChange={(e) => handleAssigneeChange(e.target.value || null)}
      disabled={loading}
      className={`rounded-md border-gray-300 shadow-sm text-sm
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <option value="">Unassigned</option>
      {agents.map(agent => (
        <option key={agent.id} value={agent.id}>
          {agent.first_name} {agent.last_name}
        </option>
      ))}
    </select>
  )
} 