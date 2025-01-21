import { useState, useEffect } from 'react'
import { teamService } from '../services/team.service'
import type { Profile } from '../types'

interface TeamMemberSelectProps {
  teamId: string
  onSelect: (userId: string) => void
}

export function TeamMemberSelect({ teamId, onSelect }: TeamMemberSelectProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([])

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const users = await teamService.getAvailableUsers(teamId)
        setAvailableUsers(users)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load available users')
      } finally {
        setLoading(false)
      }
    }
    fetchAvailableUsers()
  }, [teamId])

  const handleUserSelect = async (userId: string) => {
    if (!userId) return
    setLoading(true)
    try {
      await onSelect(userId)
      // Clear the select after successful addition
      const selectElement = document.getElementById('user-select') as HTMLSelectElement
      if (selectElement) {
        selectElement.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="text-red-600">
        {error}
      </div>
    )
  }

  return (
    <select
      id="user-select"
      onChange={(e) => handleUserSelect(e.target.value)}
      disabled={loading}
      className={`block w-full rounded-md border-gray-300 shadow-sm text-sm
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      defaultValue=""
    >
      <option value="" disabled>
        {loading ? 'Loading...' : 'Select a user to add'}
      </option>
      {availableUsers.map((user) => (
        <option key={user.id} value={user.id}>
          {user.first_name} {user.last_name}
        </option>
      ))}
    </select>
  )
} 