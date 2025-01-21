import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { teamService } from '../../services/team.service'
import type { Team } from '../../types'
import { Button } from '../../components/common/Button'
import { CreateTeamModal } from '../../components/teams/CreateTeamModal'

export default function TeamsPage() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState<Team[]>([])
  const [totalTeams, setTotalTeams] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchTeams = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, count } = await teamService.listTeams(page)
      setTeams(data)
      setTotalTeams(count || 0)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [page])

  const handleCreateTeam = async (name: string, description?: string) => {
    try {
      const team = await teamService.createTeam(name, description)
      setTeams(prev => [...prev, team])
      setShowCreateModal(false)
    } catch (err) {
      setError(err as Error)
    }
  }

  if (loading && !teams.length) {
    return <div className="p-4">Loading teams...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading teams: {error.message}
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Team
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map(team => (
          <div
            key={team.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            <h3 className="text-lg font-semibold mb-2">{team.name}</h3>
            {team.description && (
              <p className="text-gray-600 mb-4">{team.description}</p>
            )}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {!teams.length && (
        <div className="text-center text-gray-500 mt-8">
          No teams found. Create your first team to get started.
        </div>
      )}

      {totalTeams > 10 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {page} of {Math.ceil(totalTeams / 10)}
          </span>
          <Button
            disabled={page >= Math.ceil(totalTeams / 10)}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTeam}
        />
      )}
    </div>
  )
} 