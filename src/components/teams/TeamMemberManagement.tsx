import { useState } from 'react'
import { teamService } from '../../services/team.service'
import { TeamMemberSelect } from './TeamMemberSelect'
import type { TeamWithMembers, TeamMember } from '../../types'

interface TeamMemberManagementProps {
  team: TeamWithMembers
  onUpdate: () => void | Promise<void>
}

export function TeamMemberManagement({ team, onUpdate }: TeamMemberManagementProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddMember = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      await teamService.addTeamMember(team.id, userId)
      await onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    setLoading(true)
    setError(null)
    try {
      await teamService.removeTeamMember(team.id, userId)
      await onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (member: TeamMember, newRole: 'leader' | 'member') => {
    setLoading(true)
    setError(null)
    try {
      await teamService.updateTeamMemberRole(team.id, member.user_id, newRole)
      await onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Team Members</h3>
        <p className="text-sm text-gray-500">Manage team members and their roles</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <TeamMemberSelect 
          teamId={team.id} 
          onSelect={handleAddMember}
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {team.members.map((member) => (
              <tr key={member.user_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {member.profiles.first_name} {member.profiles.last_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member, e.target.value as 'leader' | 'member')}
                    disabled={loading}
                    className="rounded-md border-gray-300 shadow-sm text-sm"
                  >
                    <option value="leader">Leader</option>
                    <option value="member">Member</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(member.joined_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 