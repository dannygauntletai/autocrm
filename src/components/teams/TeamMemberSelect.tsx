import { useState, useEffect } from 'react'
import { teamService } from '../../services/team.service'
import type { Profile } from '../../types'

interface TeamMemberSelectProps {
  teamId: string
  onSelect: (userId: string) => void | Promise<void>
}

export function TeamMemberSelect({ teamId, onSelect }: TeamMemberSelectProps) {
  const [loading, setLoading] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const users = await teamService.getAvailableUsers(teamId)
        setAvailableUsers(users)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load available users')
        console.error('Failed to fetch available users:', err)
      }
    }
    fetchAvailableUsers()
  }, [teamId])

  const handleUserSelect = async (userId: string) => {
    if (!userId) return
    setLoading(true)
    try {
      await onSelect(userId)
    } catch (err) {
      console.error('Failed to select user:', err)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>
  }

  return (
    <select
      onChange={(e) => handleUserSelect(e.target.value)}
      disabled={loading}
      className={`rounded-md border-gray-300 shadow-sm text-sm
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      defaultValue=""
    >
      <option value="" disabled>Select a user</option>
      {availableUsers.map(user => (
        <option key={user.id} value={user.id}>
          {user.first_name} {user.last_name}
        </option>
      ))}
    </select>
  )
} 