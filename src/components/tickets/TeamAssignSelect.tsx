import { useState, useEffect } from 'react'
import { ticketService } from '../../services/ticket.service'
import { teamService } from '../../services/team.service'
import type { Ticket, Team } from '../../types'

interface TeamAssignSelectProps {
  ticket: Ticket
  onUpdate: (ticket: Ticket) => void
}

export function TeamAssignSelect({ ticket, onUpdate }: TeamAssignSelectProps) {
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await teamService.listTeams()
        setTeams(data || [])
      } catch (err) {
        console.error('Failed to fetch teams:', err)
      }
    }
    fetchTeams()
  }, [])

  const handleTeamChange = async (teamId: string | null) => {
    setLoading(true)
    try {
      const updatedTicket = await ticketService.assignToTeam(ticket.id, teamId)
      onUpdate(updatedTicket)
    } catch (err) {
      console.error('Failed to update ticket team:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      value={ticket.team_id || ''}
      onChange={(e) => handleTeamChange(e.target.value || null)}
      disabled={loading}
      className={`rounded-md border-gray-300 shadow-sm text-sm
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <option value="">No Team</option>
      {teams.map(team => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>
  )
} 